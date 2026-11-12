import { Text } from '@chakra-ui/react';

import { ToolPage, buildToolMetadata } from '@/components/tool/ToolPage';

export const metadata = buildToolMetadata('json-beautify');

export default function JsonBeautifyPage() {
  return (
    <ToolPage toolId="json-beautify">
      <Text>Under construction.</Text>
    </ToolPage>
  );
}
