import { DataList } from '@chakra-ui/react';

import type { XmlSummary } from '../lib/summarizeXml';

interface XmlSummaryListProps {
  summary: XmlSummary;
}

function describeNamespaces({ namespaces }: XmlSummary) {
  if (namespaces.length === 0) return 'none';
  return namespaces
    .map(({ prefix, uri }) =>
      prefix ? `${prefix}: ${uri}` : `default: ${uri}`,
    )
    .join(', ');
}

export function XmlSummaryList({ summary }: XmlSummaryListProps) {
  const rows = [
    { label: 'Root element', value: summary.rootElement },
    { label: 'Elements', value: String(summary.elementCount) },
    { label: 'Max depth', value: String(summary.maxDepth) },
    { label: 'Namespaces', value: describeNamespaces(summary) },
  ];

  return (
    <DataList.Root orientation="horizontal">
      {rows.map((row) => (
        <DataList.Item key={row.label}>
          <DataList.ItemLabel color="fg.muted">{row.label}</DataList.ItemLabel>
          <DataList.ItemValue fontFamily="mono" wordBreak="break-all">
            {row.value}
          </DataList.ItemValue>
        </DataList.Item>
      ))}
    </DataList.Root>
  );
}
