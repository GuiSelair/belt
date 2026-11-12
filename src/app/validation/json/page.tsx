import { ToolPage, buildToolMetadata } from '@/components/tool/ToolPage';
import { JsonValidationScreen } from '@/features/json/validation/JsonValidationScreen';

export const metadata = buildToolMetadata('json-validation');

export default function JsonValidationPage() {
  return (
    <ToolPage toolId="json-validation">
      <JsonValidationScreen />
    </ToolPage>
  );
}
