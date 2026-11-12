import {
  createXmlWriter,
  type XmlAttributes,
  type XmlWriter,
} from './createXmlWriter';
import {
  resolveChildOrder,
  type ChildStats,
  type ElementStats,
} from './elementStats';
import type { ElementTree } from './inferElementTree';
import { mergeElementsByName } from './mergeElementsByName';

export type XsdStyle = 'russian-doll' | 'salami-slice';
export type XsdCompositor = 'sequence' | 'all';

export interface XsdOptions {
  style: XsdStyle;
  compositor: XsdCompositor;
}

export const ALL_FALLBACK_NOTICE =
  'xs:all allows each child element at most once, so xs:sequence was used ' +
  'where children repeat.';

const XS_NAMESPACE = 'http://www.w3.org/2001/XMLSchema';

export function unorderedChildrenNotice(elementName: string) {
  return (
    `Children of <${elementName}> appear in varying order, so they were ` +
    'declared as a repeatable xs:choice with relaxed cardinality.'
  );
}

interface WriteContext {
  writer: XmlWriter;
  options: XsdOptions;
  notices: Set<string>;
}

function getOccurs(child: ChildStats, parent: ElementStats): XmlAttributes {
  return {
    minOccurs: child.parentsWithChild < parent.occurrences ? '0' : undefined,
    maxOccurs: child.maxPerParent > 1 ? 'unbounded' : undefined,
  };
}

function writeAttributes({ writer }: WriteContext, stats: ElementStats) {
  for (const [name, attribute] of stats.attributes) {
    writer.leaf('xs:attribute', {
      name,
      type: `xs:${attribute.type}`,
      use: attribute.count === stats.occurrences ? 'required' : undefined,
    });
  }
}

function writeChild(
  context: WriteContext,
  child: ChildStats,
  occurs: XmlAttributes,
) {
  if (context.options.style === 'salami-slice') {
    context.writer.leaf('xs:element', { ref: child.element.name, ...occurs });
    return;
  }
  writeElement(context, child.element, { name: child.element.name, ...occurs });
}

function writeParticles(context: WriteContext, stats: ElementStats) {
  const { writer, options, notices } = context;
  const children = [...stats.children.values()];
  const hasRepeatingChild = children.some((child) => child.maxPerParent > 1);

  if (options.compositor === 'all' && !hasRepeatingChild) {
    writer.open('xs:all');
    for (const child of children) {
      writeChild(context, child, getOccurs(child, stats));
    }
    writer.close('xs:all');
    return;
  }
  if (options.compositor === 'all') notices.add(ALL_FALLBACK_NOTICE);

  const order = resolveChildOrder(stats);
  if (order === null) {
    notices.add(unorderedChildrenNotice(stats.name));
    writer.open('xs:choice', { minOccurs: '0', maxOccurs: 'unbounded' });
    for (const child of children) writeChild(context, child, {});
    writer.close('xs:choice');
    return;
  }

  writer.open('xs:sequence');
  for (const name of order) {
    const child = stats.children.get(name)!;
    writeChild(context, child, getOccurs(child, stats));
  }
  writer.close('xs:sequence');
}

function writeElement(
  context: WriteContext,
  stats: ElementStats,
  declaration: XmlAttributes,
) {
  const { writer } = context;
  const hasChildren = stats.children.size > 0;

  if (!hasChildren && stats.attributes.size === 0) {
    const { minOccurs, maxOccurs, ...identity } = declaration;
    writer.leaf('xs:element', {
      ...identity,
      type: `xs:${stats.textType ?? 'string'}`,
      minOccurs,
      maxOccurs,
    });
    return;
  }

  writer.open('xs:element', declaration);
  if (hasChildren) {
    writer.open('xs:complexType', {
      mixed: stats.hasText ? 'true' : undefined,
    });
    writeParticles(context, stats);
    writeAttributes(context, stats);
  } else if (stats.hasText) {
    writer.open('xs:complexType');
    writer.open('xs:simpleContent');
    writer.open('xs:extension', { base: `xs:${stats.textType ?? 'string'}` });
    writeAttributes(context, stats);
    writer.close('xs:extension');
    writer.close('xs:simpleContent');
  } else {
    writer.open('xs:complexType');
    writeAttributes(context, stats);
  }
  writer.close('xs:complexType');
  writer.close('xs:element');
}

export function writeXsd(
  { root, targetNamespace }: ElementTree,
  options: XsdOptions,
  notices: Set<string>,
): string {
  const writer = createXmlWriter();
  const context: WriteContext = { writer, options, notices };
  const namespace = targetNamespace ?? undefined;

  writer.open('xs:schema', {
    'xmlns:xs': XS_NAMESPACE,
    targetNamespace: namespace,
    xmlns: namespace,
    elementFormDefault: namespace && 'qualified',
  });
  const declarations =
    options.style === 'salami-slice' ? mergeElementsByName(root) : [root];
  for (const stats of declarations) {
    writeElement(context, stats, { name: stats.name });
  }
  writer.close('xs:schema');

  return writer.toString();
}
