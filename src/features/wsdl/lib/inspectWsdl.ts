import {
  validateXml,
  type XmlSyntaxError,
} from '@/features/xml/lib/validateXml';

import { EnvelopeBuilder, type EnvelopePart } from './buildEnvelope';
import {
  SOAP11_BINDING_NS,
  SOAP12_BINDING_NS,
  SOAP_ENVELOPE,
  WSDL2_NS,
  WSDL_NS,
  type SoapVersion,
} from './namespaces';
import { buildSchemaIndex } from './schemaIndex';
import {
  childOf,
  childrenOf,
  parseXmlTree,
  qnameKey,
  resolveQName,
  type XmlElement,
} from './xmlTree';

export type SoapStyle = 'document' | 'rpc';

export interface WsdlOperation {
  name: string;
  soapAction: string | null;
  style: SoapStyle;
  documentation: string | null;
  envelope: string;
}

export interface WsdlBinding {
  name: string;
  soapVersion: SoapVersion;
  style: SoapStyle;
  transport: string | null;
  contentType: string;
}

export interface WsdlPort {
  id: string;
  service: string | null;
  name: string;
  address: string | null;
  binding: WsdlBinding;
  operations: WsdlOperation[];
}

export type InspectWsdlResult =
  | {
      ok: true;
      targetNamespace: string | null;
      ports: WsdlPort[];
      notices: string[];
    }
  | { ok: false; kind: 'syntax'; error: XmlSyntaxError }
  | { ok: false; kind: 'wsdl'; message: string };

const SOAP_BINDING_NAMESPACES: readonly [string, SoapVersion][] = [
  [SOAP11_BINDING_NS, '1.1'],
  [SOAP12_BINDING_NS, '1.2'],
];

function invalid(message: string): InspectWsdlResult {
  return { ok: false, kind: 'wsdl', message };
}

function indexByName(elements: XmlElement[], targetNamespace: string | null) {
  const index = new Map<string, XmlElement>();
  for (const element of elements) {
    const name = element.attributes.name;
    if (name)
      index.set(qnameKey({ ns: targetNamespace, local: name }), element);
  }
  return index;
}

function soapBindingOf(binding: XmlElement) {
  for (const [ns, version] of SOAP_BINDING_NAMESPACES) {
    const soapBinding = childOf(binding, ns, 'binding');
    if (soapBinding) return { ns, version, soapBinding };
  }
  return null;
}

function toStyle(value: string | undefined, fallback: SoapStyle): SoapStyle {
  return value === 'rpc' || value === 'document' ? value : fallback;
}

function preferredPrefixes(root: XmlElement) {
  const prefixes = new Map<string, string>();
  for (const [prefix, uri] of root.namespaces) {
    if (prefix !== '' && prefix !== 'xml' && !prefixes.has(uri)) {
      prefixes.set(uri, prefix);
    }
  }
  return prefixes;
}

export function inspectWsdl(text: string): InspectWsdlResult {
  const validation = validateXml(text);
  if (!validation.ok) {
    return { ok: false, kind: 'syntax', error: validation.error };
  }

  const root = parseXmlTree(text);
  if (root?.ns === WSDL2_NS) {
    return invalid('WSDL 2.0 is not supported. Paste a WSDL 1.1 document.');
  }
  if (!root || root.ns !== WSDL_NS || root.local !== 'definitions') {
    return invalid(
      'This is not a WSDL document: the root element must be wsdl:definitions.',
    );
  }

  const targetNamespace = root.attributes.targetNamespace ?? null;
  const notices = new Set<string>();
  const schemas = childrenOf(root, WSDL_NS, 'types').flatMap((types) =>
    types.children.filter((child) => child.local === 'schema'),
  );
  const schemaIndex = buildSchemaIndex(schemas);
  for (const location of schemaIndex.externalLocations) {
    notices.add(
      `External schema "${location}" is not loaded; types defined there are shown as "?".`,
    );
  }
  if (childrenOf(root, WSDL_NS, 'import').length > 0) {
    notices.add(
      'This WSDL imports other WSDL files, which are not loaded. Paste the WSDL that contains the bindings and types.',
    );
  }

  const messages = indexByName(
    childrenOf(root, WSDL_NS, 'message'),
    targetNamespace,
  );
  const portTypes = indexByName(
    childrenOf(root, WSDL_NS, 'portType'),
    targetNamespace,
  );
  const bindings = indexByName(
    childrenOf(root, WSDL_NS, 'binding'),
    targetNamespace,
  );
  const envelopes = new EnvelopeBuilder(schemaIndex, preferredPrefixes(root));

  function findPart(owner: XmlElement, messageName: string, partName?: string) {
    const message = messages.get(qnameKey(resolveQName(owner, messageName)));
    const parts = message ? childrenOf(message, WSDL_NS, 'part') : [];
    return partName
      ? parts.filter((part) => part.attributes.name === partName)
      : parts;
  }

  function toParts(nodes: XmlElement[]): EnvelopePart[] {
    return nodes.map((node) => ({
      node,
      name: node.attributes.name ?? 'part',
    }));
  }

  function describeOperation(
    operation: XmlElement,
    portType: XmlElement | undefined,
    soap: NonNullable<ReturnType<typeof soapBindingOf>>,
    bindingStyle: SoapStyle,
  ): WsdlOperation {
    const name = operation.attributes.name ?? '';
    const soapOperation = childOf(operation, soap.ns, 'operation');
    const style = toStyle(soapOperation?.attributes.style, bindingStyle);
    const abstract = portType
      ? childrenOf(portType, WSDL_NS, 'operation').find(
          (candidate) => candidate.attributes.name === name,
        )
      : undefined;
    const abstractInput = abstract && childOf(abstract, WSDL_NS, 'input');
    const input = childOf(operation, WSDL_NS, 'input');
    const soapBody = input && childOf(input, soap.ns, 'body');
    const headers = input ? childrenOf(input, soap.ns, 'header') : [];

    const headerParts = headers.flatMap((header) =>
      header.attributes.message
        ? findPart(header, header.attributes.message, header.attributes.part)
        : [],
    );
    const bodyPartNames = soapBody?.attributes.parts?.split(/\s+/);
    const bodyParts = (
      abstractInput?.attributes.message
        ? findPart(abstractInput, abstractInput.attributes.message)
        : []
    ).filter(
      (part) =>
        !headerParts.includes(part) &&
        (!bodyPartNames || bodyPartNames.includes(part.attributes.name ?? '')),
    );

    return {
      name,
      soapAction: soapOperation?.attributes.soapAction ?? null,
      style,
      documentation:
        (abstract && childOf(abstract, WSDL_NS, 'documentation')?.text) || null,
      envelope: envelopes.build({
        version: soap.version,
        style,
        operationName: name,
        rpcNamespace: soapBody?.attributes.namespace ?? targetNamespace,
        headerParts: toParts(headerParts),
        bodyParts: toParts(bodyParts),
      }),
    };
  }

  function describePort(
    service: string | null,
    portName: string,
    binding: XmlElement,
    port: XmlElement | null,
  ): WsdlPort | null {
    const soap = soapBindingOf(binding);
    if (!soap) return null;
    const style = toStyle(soap.soapBinding.attributes.style, 'document');
    const portType = binding.attributes.type
      ? portTypes.get(qnameKey(resolveQName(binding, binding.attributes.type)))
      : undefined;
    const address = port && childOf(port, soap.ns, 'address');

    return {
      id: `${service ?? ''}/${portName}`,
      service,
      name: portName,
      address: address?.attributes.location ?? null,
      binding: {
        name: binding.attributes.name ?? '',
        soapVersion: soap.version,
        style,
        transport: soap.soapBinding.attributes.transport ?? null,
        contentType: SOAP_ENVELOPE[soap.version].contentType,
      },
      operations: childrenOf(binding, WSDL_NS, 'operation').map((operation) =>
        describeOperation(operation, portType, soap, style),
      ),
    };
  }

  const ports: WsdlPort[] = [];
  const services = childrenOf(root, WSDL_NS, 'service');
  for (const service of services) {
    for (const port of childrenOf(service, WSDL_NS, 'port')) {
      const bindingName = port.attributes.binding;
      const binding =
        bindingName && bindings.get(qnameKey(resolveQName(port, bindingName)));
      if (!binding) continue;
      const described = describePort(
        service.attributes.name ?? null,
        port.attributes.name ?? '',
        binding,
        port,
      );
      if (described) ports.push(described);
    }
  }
  if (services.length === 0) {
    notices.add('No service is defined, so the endpoint URL is unknown.');
    for (const binding of bindings.values()) {
      const described = describePort(
        null,
        binding.attributes.name ?? '',
        binding,
        null,
      );
      if (described) ports.push(described);
    }
  }

  if (ports.length === 0) {
    return invalid('No SOAP binding was found in this WSDL.');
  }
  for (const notice of envelopes.notices) notices.add(notice);
  return { ok: true, targetNamespace, ports, notices: [...notices] };
}
