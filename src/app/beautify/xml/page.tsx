import { ToolPage, buildToolMetadata } from '@/components/tool/ToolPage';
import { XmlBeautifyScreen } from '@/features/xml/beautify/XmlBeautifyScreen';

export const metadata = buildToolMetadata('xml-beautify');

export default function XmlBeautifyPage() {
  return (
    <ToolPage toolId="xml-beautify">
      <XmlBeautifyScreen />
    </ToolPage>
  );
}
