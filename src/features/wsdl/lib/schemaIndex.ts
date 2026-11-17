import { XSD_NS } from './namespaces';
import { qnameKey, type QName, type XmlElement } from './xmlTree';

export interface SchemaComponent {
  node: XmlElement;
  schema: SchemaInfo;
}

export interface SchemaInfo {
  targetNamespace: string | null;
  elementsQualified: boolean;
  attributesQualified: boolean;
}

type ComponentKind =
  'element' | 'complexType' | 'simpleType' | 'group' | 'attributeGroup';

const COMPONENT_KINDS: readonly ComponentKind[] = [
  'element',
  'complexType',
  'simpleType',
  'group',
  'attributeGroup',
];

export interface SchemaIndex {
  find(kind: ComponentKind, name: QName): SchemaComponent | undefined;
  externalLocations: string[];
}

export function buildSchemaIndex(schemas: XmlElement[]): SchemaIndex {
  const components = new Map<string, SchemaComponent>();
  const externalLocations = new Set<string>();

  for (const node of schemas) {
    const schema: SchemaInfo = {
      targetNamespace: node.attributes.targetNamespace ?? null,
      elementsQualified: node.attributes.elementFormDefault === 'qualified',
      attributesQualified: node.attributes.attributeFormDefault === 'qualified',
    };
    for (const child of node.children) {
      if (child.ns !== XSD_NS) continue;
      const location = child.attributes.schemaLocation;
      if ((child.local === 'import' || child.local === 'include') && location) {
        externalLocations.add(location);
      }
      const kind = COMPONENT_KINDS.find(
        (candidate) => candidate === child.local,
      );
      const name = child.attributes.name;
      if (!kind || !name) continue;
      const key = `${kind}:${qnameKey({ ns: schema.targetNamespace, local: name })}`;
      components.set(key, { node: child, schema });
    }
  }

  return {
    find: (kind, name) => components.get(`${kind}:${qnameKey(name)}`),
    externalLocations: [...externalLocations],
  };
}
