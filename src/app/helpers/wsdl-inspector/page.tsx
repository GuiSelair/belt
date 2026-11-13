import { ToolPage, buildToolMetadata } from '@/components/tool/ToolPage';
import { WsdlInspectorScreen } from '@/features/wsdl/WsdlInspectorScreen';

export const metadata = buildToolMetadata('wsdl-inspector');

export default function WsdlInspectorPage() {
  return (
    <ToolPage toolId="wsdl-inspector">
      <WsdlInspectorScreen />
    </ToolPage>
  );
}
