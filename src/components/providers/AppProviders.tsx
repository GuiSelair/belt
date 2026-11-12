'use client';

import type { ReactNode } from 'react';

import { ChakraProvider } from '@chakra-ui/react';

import { system } from '@/theme/system';

import { EmotionRegistry } from './EmotionRegistry';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <EmotionRegistry>
      <ChakraProvider value={system}>{children}</ChakraProvider>
    </EmotionRegistry>
  );
}
