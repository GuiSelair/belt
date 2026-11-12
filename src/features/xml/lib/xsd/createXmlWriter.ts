export type XmlAttributes = Record<string, string | undefined>;

const INDENT_UNIT = '  ';

function escapeAttribute(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('"', '&quot;');
}

function formatAttributes(attributes: XmlAttributes) {
  return Object.entries(attributes)
    .filter(([, value]) => value !== undefined)
    .map(([name, value]) => ` ${name}="${escapeAttribute(value!)}"`)
    .join('');
}

export function createXmlWriter() {
  const lines = ['<?xml version="1.0" encoding="UTF-8"?>'];
  let depth = 0;

  function push(line: string) {
    lines.push(`${INDENT_UNIT.repeat(depth)}${line}`);
  }

  return {
    open(tag: string, attributes: XmlAttributes = {}) {
      push(`<${tag}${formatAttributes(attributes)}>`);
      depth += 1;
    },
    close(tag: string) {
      depth -= 1;
      push(`</${tag}>`);
    },
    leaf(tag: string, attributes: XmlAttributes = {}) {
      push(`<${tag}${formatAttributes(attributes)}/>`);
    },
    toString() {
      return `${lines.join('\n')}\n`;
    },
  };
}

export type XmlWriter = ReturnType<typeof createXmlWriter>;
