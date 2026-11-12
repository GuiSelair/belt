import { Text } from '@chakra-ui/react';

import { ToolPage, buildToolMetadata } from '@/components/tool/ToolPage';

export const metadata = buildToolMetadata('json-validation');

export default function JsonValidationPage() {
  return (
    <ToolPage toolId="json-validation">
      <Text>Under construction.</Text>
    </ToolPage>
  );
}
