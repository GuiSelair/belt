import { Badge, DataList } from '@chakra-ui/react';

import { getSqlDialect } from '../lib/dialects';
import type { DialectCompatibility } from '../lib/validateSql';

interface SqlCompatibilityListProps {
  compatibility: DialectCompatibility[];
}

export function SqlCompatibilityList({
  compatibility,
}: SqlCompatibilityListProps) {
  return (
    <DataList.Root orientation="horizontal" size="sm" gap="1.5">
      {compatibility.map(({ dialect, ok }) => (
        <DataList.Item key={dialect}>
          <DataList.ItemLabel color="fg.muted">
            {getSqlDialect(dialect).label}
          </DataList.ItemLabel>
          <DataList.ItemValue>
            <Badge colorPalette={ok ? 'green' : 'red'} variant="surface">
              {ok ? 'Valid' : 'Invalid'}
            </Badge>
          </DataList.ItemValue>
        </DataList.Item>
      ))}
    </DataList.Root>
  );
}
