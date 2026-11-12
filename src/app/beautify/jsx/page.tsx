import { ToolPage, buildToolMetadata } from '@/components/tool/ToolPage';
import { JsxBeautifyScreen } from '@/features/jsx/JsxBeautifyScreen';

export const metadata = buildToolMetadata('jsx-beautify');

export default function JsxBeautifyPage() {
  return (
    <ToolPage toolId="jsx-beautify">
      <JsxBeautifyScreen />
    </ToolPage>
  );
}
