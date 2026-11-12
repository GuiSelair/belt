import { Text } from '@chakra-ui/react';

import { ToolPage, buildToolMetadata } from '@/components/tool/ToolPage';

export const metadata = buildToolMetadata('connection-string');

export default function ConnectionStringPage() {
  return (
    <ToolPage toolId="connection-string">
      <Text>Under construction.</Text>
    </ToolPage>
  );
}
