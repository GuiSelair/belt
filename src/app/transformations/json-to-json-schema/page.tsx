import { ToolPage, buildToolMetadata } from '@/components/tool/ToolPage';
import { JsonToSchemaScreen } from '@/features/json/schema/JsonToSchemaScreen';

export const metadata = buildToolMetadata('json-to-json-schema');

export default function JsonToJsonSchemaPage() {
  return (
    <ToolPage toolId="json-to-json-schema">
      <JsonToSchemaScreen />
    </ToolPage>
  );
}
