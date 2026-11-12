import { Text } from '@chakra-ui/react';

import { ToolPage, buildToolMetadata } from '@/components/tool/ToolPage';

export const metadata = buildToolMetadata('xml-validation');

export default function XmlValidationPage() {
  return (
    <ToolPage toolId="xml-validation">
      <Text>Under construction.</Text>
    </ToolPage>
  );
}
