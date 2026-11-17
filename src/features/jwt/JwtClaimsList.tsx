import { DataList, Text } from '@chakra-ui/react';

import type { ClaimRow } from './lib/describeClaims';

interface JwtClaimsListProps {
  rows: ClaimRow[];
}

export function JwtClaimsList({ rows }: JwtClaimsListProps) {
  return (
    <DataList.Root orientation="horizontal" size="sm" gap="1.5">
      {rows.map((row) => (
        <DataList.Item key={row.key}>
          <DataList.ItemLabel color="fg.muted">{row.label}</DataList.ItemLabel>
          <DataList.ItemValue
            fontFamily="mono"
            wordBreak="break-all"
            flexDirection="column"
            alignItems="flex-start"
          >
            {row.detail ?? row.value}
            {row.detail && (
              <Text as="span" color="fg.muted" fontSize="xs">
                {row.key}: {row.value}
              </Text>
            )}
          </DataList.ItemValue>
        </DataList.Item>
      ))}
    </DataList.Root>
  );
}
