import { SOAP_ENVELOPE, XSD_NS, type SoapVersion } from './namespaces';
import type { SchemaIndex, SchemaInfo } from './schemaIndex';
import { qnameKey, resolveQName, type XmlElement } from './xmlTree';

export interface EnvelopePart {
  /** Element that owns the `element`/`type` attribute, for QName lookups. */
  node: XmlElement;
  name: string;
}

export interface EnvelopeRequest {
  version: SoapVersion;
  style: 'document' | 'rpc';
  operationName: string;
  /** Namespace of the RPC wrapper element. */
  rpcNamespace: string | null;
  headerParts: EnvelopePart[];
  bodyParts: EnvelopePart[];
}

interface Line {
  depth: number;
  text: string;
}

const INDENT = '  ';
const MAX_DEPTH = 24;
const NO_SCHEMA: SchemaInfo = {
  targetNamespace: null,
  elementsQualified: false,
  attributesQualified: false,
};

function occurrenceComment(node: XmlElement): string | null {
  const min = node.attributes.minOccurs ?? '1';
  const max = node.attributes.maxOccurs ?? '1';
  if (max === 'unbounded' || Number(max) > 1) {
    return min === '0'
      ? 'Zero or more repetitions:'
      : `${min} or more repetitions:`;
  }
  return min === '0' ? 'Optional:' : null;
}

function escapeComment(text: string) {
  return text.replace(/--/g, '- -');
}

export class EnvelopeBuilder {
  private lines: Line[] = [];
  private readonly prefixes = new Map<string, string>();
  private readonly usedPrefixes = new Set<string>();
  readonly notices = new Set<string>();

  constructor(
    private readonly index: SchemaIndex,
    private readonly preferredPrefixes: ReadonlyMap<string, string>,
  ) {}

  build(request: EnvelopeRequest): string {
    const envelope = SOAP_ENVELOPE[request.version];
    this.prefixes.clear();
    this.usedPrefixes.clear();
    this.usedPrefixes.add(envelope.prefix);

    const header = this.capture(() => {
      for (const part of request.headerParts) this.writePart(part, 2);
    });
    const body = this.capture(() => {
      if (request.style === 'rpc') {
        const tag = this.tagName(request.rpcNamespace, request.operationName);
        this.push(2, `<${tag}>`);
        for (const part of request.bodyParts) this.writePart(part, 3);
        this.push(2, `</${tag}>`);
      } else {
        for (const part of request.bodyParts) this.writePart(part, 2);
      }
    });

    const declarations = [
      ` xmlns:${envelope.prefix}="${envelope.ns}"`,
      ...[...this.prefixes].map(([ns, prefix]) => ` xmlns:${prefix}="${ns}"`),
    ].join('');
    const env = envelope.prefix;
    const output: Line[] = [
      { depth: 0, text: `<${env}:Envelope${declarations}>` },
    ];
    if (header.length === 0) {
      output.push({ depth: 1, text: `<${env}:Header/>` });
    } else {
      output.push({ depth: 1, text: `<${env}:Header>` }, ...header, {
        depth: 1,
        text: `</${env}:Header>`,
      });
    }
    output.push({ depth: 1, text: `<${env}:Body>` }, ...body, {
      depth: 1,
      text: `</${env}:Body>`,
    });
    output.push({ depth: 0, text: `</${env}:Envelope>` });
    return output
      .map((line) => INDENT.repeat(line.depth) + line.text)
      .join('\n');
  }

  private push(depth: number, text: string) {
    this.lines.push({ depth, text });
  }

  private comment(depth: number, text: string) {
    this.push(depth, `<!--${escapeComment(text)}-->`);
  }

  private capture(write: () => void): Line[] {
    const previous = this.lines;
    this.lines = [];
    write();
    const captured = this.lines;
    this.lines = previous;
    return captured;
  }

  private prefixFor(ns: string): string {
    const existing = this.prefixes.get(ns);
    if (existing) return existing;
    const preferred = this.preferredPrefixes.get(ns);
    let prefix =
      preferred && !this.usedPrefixes.has(preferred) ? preferred : undefined;
    for (let counter = 1; !prefix; counter++) {
      if (!this.usedPrefixes.has(`ns${counter}`)) prefix = `ns${counter}`;
    }
    this.prefixes.set(ns, prefix);
    this.usedPrefixes.add(prefix);
    return prefix;
  }

  private tagName(ns: string | null, local: string) {
    return ns ? `${this.prefixFor(ns)}:${local}` : local;
  }

  private writePart(part: EnvelopePart, depth: number) {
    const { element, type } = part.node.attributes;
    if (element) {
      const name = resolveQName(part.node, element);
      const global = this.index.find('element', name);
      if (!global) {
        this.unresolved(qnameKey(name));
        const tag = this.tagName(name.ns, name.local);
        this.push(depth, `<${tag}>?</${tag}>`);
        return;
      }
      this.writeElement(global.node, global.schema, true, depth, []);
      return;
    }
    this.writeTyped(part.name, part.node, type, NO_SCHEMA, depth, []);
  }

  private unresolved(name: string) {
    this.notices.add(
      `Some types could not be found in the WSDL (for example ${name}); they are shown as "?".`,
    );
  }

  private writeElement(
    decl: XmlElement,
    schema: SchemaInfo,
    isGlobal: boolean,
    depth: number,
    stack: string[],
  ) {
    const occurrence = isGlobal ? null : occurrenceComment(decl);
    if (decl.attributes.ref) {
      const name = resolveQName(decl, decl.attributes.ref);
      const target = this.index.find('element', name);
      if (occurrence) this.comment(depth, occurrence);
      if (!target) {
        this.unresolved(qnameKey(name));
        const tag = this.tagName(name.ns, name.local);
        this.push(depth, `<${tag}>?</${tag}>`);
        return;
      }
      this.writeElement(target.node, target.schema, true, depth, stack);
      return;
    }

    const name = decl.attributes.name;
    if (!name) return;
    const form = decl.attributes.form;
    const qualified =
      isGlobal || form === 'qualified' || (!form && schema.elementsQualified);
    const tag = this.tagName(qualified ? schema.targetNamespace : null, name);
    if (occurrence) this.comment(depth, occurrence);
    this.writeTyped(tag, decl, decl.attributes.type, schema, depth, stack);
  }

  private writeTyped(
    tag: string,
    owner: XmlElement,
    typeAttribute: string | undefined,
    schema: SchemaInfo,
    depth: number,
    stack: string[],
  ) {
    if (depth > MAX_DEPTH) {
      this.push(depth, `<${tag}/>`);
      return;
    }

    if (typeAttribute) {
      const typeName = resolveQName(owner, typeAttribute);
      if (typeName.ns === XSD_NS) {
        this.push(depth, `<${tag}>?</${tag}>`);
        return;
      }
      const complexType = this.index.find('complexType', typeName);
      if (complexType) {
        const key = qnameKey(typeName);
        if (stack.includes(key)) {
          this.comment(depth, 'Recursive type, not expanded further');
          this.push(depth, `<${tag}/>`);
          return;
        }
        this.writeComplex(tag, complexType.node, complexType.schema, depth, [
          ...stack,
          key,
        ]);
        return;
      }
      const simpleType = this.index.find('simpleType', typeName);
      if (!simpleType) this.unresolved(qnameKey(typeName));
      this.writeSimple(tag, simpleType?.node, depth);
      return;
    }

    const inlineComplex = owner.children.find(
      (child) => child.ns === XSD_NS && child.local === 'complexType',
    );
    if (inlineComplex) {
      this.writeComplex(tag, inlineComplex, schema, depth, stack);
      return;
    }
    const inlineSimple = owner.children.find(
      (child) => child.ns === XSD_NS && child.local === 'simpleType',
    );
    this.writeSimple(tag, inlineSimple, depth);
  }

  private writeSimple(
    tag: string,
    simpleType: XmlElement | undefined,
    depth: number,
  ) {
    const values = this.enumerationValues(simpleType);
    if (values.length > 0)
      this.comment(depth, `Allowed values: ${values.join(', ')}`);
    this.push(depth, `<${tag}>?</${tag}>`);
  }

  private enumerationValues(simpleType: XmlElement | undefined): string[] {
    const restriction = simpleType?.children.find(
      (child) => child.ns === XSD_NS && child.local === 'restriction',
    );
    return (restriction?.children ?? [])
      .filter((child) => child.ns === XSD_NS && child.local === 'enumeration')
      .map((child) => child.attributes.value ?? '');
  }

  private writeComplex(
    tag: string,
    complexType: XmlElement,
    schema: SchemaInfo,
    depth: number,
    stack: string[],
  ) {
    const attributes: string[] = [];
    let hasText = false;
    const children = this.capture(() => {
      hasText = this.writeTypeContent(
        complexType,
        schema,
        depth + 1,
        stack,
        attributes,
      );
    });
    const attributeText = attributes.map((name) => ` ${name}="?"`).join('');
    if (hasText) {
      this.push(depth, `<${tag}${attributeText}>?</${tag}>`);
    } else if (children.length === 0) {
      this.push(depth, `<${tag}${attributeText}/>`);
    } else {
      this.push(depth, `<${tag}${attributeText}>`);
      this.lines.push(...children);
      this.push(depth, `</${tag}>`);
    }
  }

  /** Writes child elements and collects attributes; returns whether it has text content. */
  private writeTypeContent(
    complexType: XmlElement,
    schema: SchemaInfo,
    depth: number,
    stack: string[],
    attributes: string[],
  ): boolean {
    let hasText = false;
    for (const child of complexType.children) {
      if (child.ns !== XSD_NS) continue;
      switch (child.local) {
        case 'sequence':
        case 'all':
        case 'choice':
        case 'group':
          this.writeParticle(child, schema, depth, stack);
          break;
        case 'attribute':
        case 'attributeGroup':
          this.collectAttribute(child, schema, attributes);
          break;
        case 'simpleContent':
          hasText = true;
          this.writeDerivation(child, schema, depth, stack, attributes);
          break;
        case 'complexContent':
          this.writeDerivation(child, schema, depth, stack, attributes);
          break;
      }
    }
    return hasText;
  }

  private writeDerivation(
    content: XmlElement,
    schema: SchemaInfo,
    depth: number,
    stack: string[],
    attributes: string[],
  ) {
    const derivation = content.children.find(
      (child) =>
        child.ns === XSD_NS &&
        (child.local === 'extension' || child.local === 'restriction'),
    );
    if (!derivation) return;
    const base = derivation.attributes.base;
    if (derivation.local === 'extension' && base) {
      const baseName = resolveQName(derivation, base);
      const baseType = this.index.find('complexType', baseName);
      const key = qnameKey(baseName);
      if (baseType && !stack.includes(key)) {
        this.writeTypeContent(
          baseType.node,
          baseType.schema,
          depth,
          [...stack, key],
          attributes,
        );
      }
    }
    this.writeTypeContent(derivation, schema, depth, stack, attributes);
  }

  private writeParticle(
    particle: XmlElement,
    schema: SchemaInfo,
    depth: number,
    stack: string[],
  ) {
    if (particle.local === 'group') {
      const ref = particle.attributes.ref;
      const group =
        ref && this.index.find('group', resolveQName(particle, ref));
      if (group) {
        for (const child of group.node.children) {
          if (child.ns === XSD_NS)
            this.writeParticle(child, group.schema, depth, stack);
        }
      }
      return;
    }

    const occurrence = occurrenceComment(particle);
    if (particle.local === 'choice') {
      const count = particle.children.filter(
        (child) => child.ns === XSD_NS,
      ).length;
      this.comment(
        depth,
        `You have a CHOICE of the next ${count} items at this level`,
      );
    } else if (occurrence && particle.local !== 'element') {
      this.comment(depth, occurrence);
    }

    if (particle.local === 'element') {
      this.writeElement(particle, schema, false, depth, stack);
      return;
    }
    if (particle.local === 'any') {
      this.comment(depth, 'You may enter ANY elements at this point');
      return;
    }
    for (const child of particle.children) {
      if (child.ns !== XSD_NS) continue;
      if (
        ['element', 'sequence', 'choice', 'all', 'group', 'any'].includes(
          child.local,
        )
      ) {
        this.writeParticle(child, schema, depth, stack);
      }
    }
  }

  private collectAttribute(
    node: XmlElement,
    schema: SchemaInfo,
    attributes: string[],
  ) {
    if (node.local === 'attributeGroup') {
      const ref = node.attributes.ref;
      const group =
        ref && this.index.find('attributeGroup', resolveQName(node, ref));
      if (!group) return;
      for (const child of group.node.children) {
        if (
          child.ns === XSD_NS &&
          (child.local === 'attribute' || child.local === 'attributeGroup')
        ) {
          this.collectAttribute(child, group.schema, attributes);
        }
      }
      return;
    }
    if (node.attributes.use === 'prohibited') return;
    if (node.attributes.ref) {
      const name = resolveQName(node, node.attributes.ref);
      attributes.push(this.tagName(name.ns, name.local));
      return;
    }
    const name = node.attributes.name;
    if (!name) return;
    const form = node.attributes.form;
    const qualified =
      form === 'qualified' || (!form && schema.attributesQualified);
    attributes.push(
      this.tagName(qualified ? schema.targetNamespace : null, name),
    );
  }
}
