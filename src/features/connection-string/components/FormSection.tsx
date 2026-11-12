import type { ReactNode } from 'react';

import { Fieldset } from '@chakra-ui/react';

interface FormSectionProps {
  legend: string;
  children: ReactNode;
}

export function FormSection({ legend, children }: FormSectionProps) {
  return (
    <Fieldset.Root
      p="4"
      bg="bg.subtle"
      borderWidth="1px"
      borderColor="border.muted"
      rounded="lg"
    >
      <Fieldset.Legend fontSize="md" fontWeight="semibold" color="fg">
        {legend}
      </Fieldset.Legend>
      <Fieldset.Content gap="4">{children}</Fieldset.Content>
    </Fieldset.Root>
  );
}
