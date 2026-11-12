import { ToolPage, buildToolMetadata } from '@/components/tool/ToolPage';
import { JsonBeautifyScreen } from '@/features/json/beautify/JsonBeautifyScreen';

export const metadata = buildToolMetadata('json-beautify');

export default function JsonBeautifyPage() {
  return (
    <ToolPage toolId="json-beautify">
      <JsonBeautifyScreen />
    </ToolPage>
  );
}
