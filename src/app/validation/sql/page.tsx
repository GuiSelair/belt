import { ToolPage, buildToolMetadata } from '@/components/tool/ToolPage';
import { SqlValidationScreen } from '@/features/sql/validation/SqlValidationScreen';

export const metadata = buildToolMetadata('sql-validation');

export default function SqlValidationPage() {
  return (
    <ToolPage toolId="sql-validation">
      <SqlValidationScreen />
    </ToolPage>
  );
}
