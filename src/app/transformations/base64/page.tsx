import { ToolPage, buildToolMetadata } from '@/components/tool/ToolPage';
import { Base64Screen } from '@/features/base64/Base64Screen';

export const metadata = buildToolMetadata('base64');

export default function Base64Page() {
  return (
    <ToolPage toolId="base64">
      <Base64Screen />
    </ToolPage>
  );
}
