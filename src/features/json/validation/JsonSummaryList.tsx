import { DataList } from '@chakra-ui/react';

import { formatBytes } from '@/lib/formatBytes';

import type { JsonSummary } from '../lib/summarizeJson';

interface JsonSummaryListProps {
  summary: JsonSummary;
}

function describeChildren({ rootType, childCount }: JsonSummary) {
  if (childCount === null) return '—';
  const noun = rootType === 'object' ? 'key' : 'item';
  return `${childCount} ${noun}${childCount === 1 ? '' : 's'}`;
}

export function JsonSummaryList({ summary }: JsonSummaryListProps) {
  const rows = [
    { label: 'Root type', value: summary.rootType },
    { label: 'Children', value: describeChildren(summary) },
    { label: 'Size', value: formatBytes(summary.sizeInBytes) },
  ];

  return (
    <DataList.Root orientation="horizontal">
      {rows.map((row) => (
        <DataList.Item key={row.label}>
          <DataList.ItemLabel color="fg.muted">{row.label}</DataList.ItemLabel>
          <DataList.ItemValue fontFamily="mono">{row.value}</DataList.ItemValue>
        </DataList.Item>
      ))}
    </DataList.Root>
  );
}
