import { ToolPage, buildToolMetadata } from '@/components/tool/ToolPage';
import { ConnectionStringScreen } from '@/features/connection-string/ConnectionStringScreen';

export const metadata = buildToolMetadata('connection-string');

export default function ConnectionStringPage() {
  return (
    <ToolPage toolId="connection-string">
      <ConnectionStringScreen />
    </ToolPage>
  );
}
