import type { Metadata } from 'next';
import { Geist, Geist_Mono, Unbounded } from 'next/font/google';
import { Box, Flex, SkipNavContent, SkipNavLink } from '@chakra-ui/react';

import { AppFooter } from '@/components/navigation/AppFooter';
import { AppHeader } from '@/components/navigation/AppHeader';
import { AppProviders } from '@/components/providers/AppProviders';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const brandFont = Unbounded({
  variable: '--font-brand',
  weight: '900',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Belt — the Swiss army knife for developers',
    template: '%s · Belt',
  },
  description:
    'Beautify, validate and transform data right in your browser. 100% client-side: nothing you paste leaves your machine.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} ${brandFont.variable}`}
      style={{ colorScheme: 'dark' }}
      suppressHydrationWarning
    >
      <body>
        <AppProviders>
          <SkipNavLink>Skip to content</SkipNavLink>
          <Flex direction="column" minH="100dvh">
            <AppHeader />
            <SkipNavContent />
            <Box as="main" flex="1" display="flex" flexDirection="column">
              {children}
            </Box>
            <AppFooter />
          </Flex>
        </AppProviders>
      </body>
    </html>
  );
}
