import { ToolPage, buildToolMetadata } from '@/components/tool/ToolPage';
import { SqlAliasesScreen } from '@/features/sql/aliases/SqlAliasesScreen';

export const metadata = buildToolMetadata('sql-aliases');

export default function SqlAliasesPage() {
  return (
    <ToolPage toolId="sql-aliases">
      <SqlAliasesScreen />
    </ToolPage>
  );
}
