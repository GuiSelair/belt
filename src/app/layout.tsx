import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Box, SkipNavContent, SkipNavLink } from '@chakra-ui/react';

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

export const metadata: Metadata = {
  title: {
    default: 'Kanivete — the Swiss army knife for developers',
    template: '%s · Kanivete',
  },
  description:
    'Beautify, validate and transform data right in your browser. 100% client-side: nothing you paste leaves your machine.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable}`}
      style={{ colorScheme: 'dark' }}
      suppressHydrationWarning
    >
      <body>
        <AppProviders>
          <SkipNavLink>Skip to content</SkipNavLink>
          <AppHeader />
          <SkipNavContent />
          <Box as="main" minH="calc(100dvh - 4rem)">
            {children}
          </Box>
        </AppProviders>
      </body>
    </html>
  );
}
