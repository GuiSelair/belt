import { ToolPage, buildToolMetadata } from '@/components/tool/ToolPage';
import { XmlToXsdScreen } from '@/features/xml/xsd/XmlToXsdScreen';

export const metadata = buildToolMetadata('xml-to-xsd');

export default function XmlToXsdPage() {
  return (
    <ToolPage toolId="xml-to-xsd">
      <XmlToXsdScreen />
    </ToolPage>
  );
}
