import { Text } from '@chakra-ui/react';

import { ToolPage, buildToolMetadata } from '@/components/tool/ToolPage';

export const metadata = buildToolMetadata('jsx-beautify');

export default function JsxBeautifyPage() {
  return (
    <ToolPage toolId="jsx-beautify">
      <Text>Under construction.</Text>
    </ToolPage>
  );
}
