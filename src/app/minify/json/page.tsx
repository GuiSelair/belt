import { ToolPage, buildToolMetadata } from '@/components/tool/ToolPage';
import { JsonMinifyScreen } from '@/features/json/minify/JsonMinifyScreen';

export const metadata = buildToolMetadata('json-minify');

export default function JsonMinifyPage() {
  return (
    <ToolPage toolId="json-minify">
      <JsonMinifyScreen />
    </ToolPage>
  );
}
