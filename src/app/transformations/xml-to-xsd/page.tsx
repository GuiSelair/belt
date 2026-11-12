import { Text } from '@chakra-ui/react';

import { ToolPage, buildToolMetadata } from '@/components/tool/ToolPage';

export const metadata = buildToolMetadata('xml-to-xsd');

export default function XmlToXsdPage() {
  return (
    <ToolPage toolId="xml-to-xsd">
      <Text>Under construction.</Text>
    </ToolPage>
  );
}
