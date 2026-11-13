import { DataList, HStack, Text } from '@chakra-ui/react';

import { CopyButton } from '@/components/tool/CopyButton';

import type { WsdlOperation, WsdlPort } from './lib/inspectWsdl';

interface WsdlDetailsListProps {
  port: WsdlPort;
  operation: WsdlOperation | null;
}

interface DetailRow {
  label: string;
  value: string | null;
  copyLabel?: string;
}

export function WsdlDetailsList({ port, operation }: WsdlDetailsListProps) {
  const { binding } = port;
  const rows: DetailRow[] = [
    { label: 'Endpoint URL', value: port.address, copyLabel: 'Copy URL' },
    {
      label: 'SOAPAction',
      value: operation?.soapAction ?? null,
      copyLabel: 'Copy action',
    },
    { label: 'Binding', value: binding.name },
    { label: 'SOAP version', value: binding.soapVersion },
    { label: 'Style', value: operation?.style ?? binding.style },
    { label: 'Content-Type', value: binding.contentType },
    { label: 'Transport', value: binding.transport },
  ];

  return (
    <DataList.Root orientation="horizontal" size="sm" gap="2">
      {rows.map((row) => (
        <DataList.Item key={row.label}>
          <DataList.ItemLabel color="fg.muted" minW="32">
            {row.label}
          </DataList.ItemLabel>
          <DataList.ItemValue>
            <HStack gap="2" wrap="wrap">
              <Text fontFamily="mono" wordBreak="break-all">
                {row.value === null ? '—' : row.value || '(empty)'}
              </Text>
              {row.copyLabel && row.value && (
                <CopyButton value={row.value} label={row.copyLabel} />
              )}
            </HStack>
          </DataList.ItemValue>
        </DataList.Item>
      ))}
    </DataList.Root>
  );
}
