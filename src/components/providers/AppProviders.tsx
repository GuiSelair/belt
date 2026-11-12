'use client';

import type { ReactNode } from 'react';

import { ChakraProvider } from '@chakra-ui/react';

import { system } from '@/theme/system';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return <ChakraProvider value={system}>{children}</ChakraProvider>;
}
