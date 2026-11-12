import { ToolPage, buildToolMetadata } from '@/components/tool/ToolPage';
import { XmlValidationScreen } from '@/features/xml/validation/XmlValidationScreen';

export const metadata = buildToolMetadata('xml-validation');

export default function XmlValidationPage() {
  return (
    <ToolPage toolId="xml-validation">
      <XmlValidationScreen />
    </ToolPage>
  );
}
