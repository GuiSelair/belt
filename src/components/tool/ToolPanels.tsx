import type { ReactNode } from 'react';

import { Grid } from '@chakra-ui/react';

interface ToolPanelsProps {
  children: ReactNode;
}

export function ToolPanels({ children }: ToolPanelsProps) {
  return (
    <Grid
      templateColumns={{
        base: 'minmax(0, 1fr)',
        lg: 'repeat(2, minmax(0, 1fr))',
      }}
      gap="6"
    >
      {children}
    </Grid>
  );
}
