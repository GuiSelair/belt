import type { Metadata } from 'next';
import { Geist, Geist_Mono, Unbounded } from 'next/font/google';
import Script from 'next/script';
import { Box, Flex, SkipNavContent, SkipNavLink } from '@chakra-ui/react';

import { AnalyticsRouteListener } from '@/components/analytics/AnalyticsRouteListener';
import { AppFooter } from '@/components/navigation/AppFooter';
import { AppHeader } from '@/components/navigation/AppHeader';
import { AppProviders } from '@/components/providers/AppProviders';
import { siteConfig } from '@/config/site';
import {
  getMeasurementId,
  googleAnalyticsInitSnippet,
  googleAnalyticsScriptSrc,
} from '@/lib/analytics';

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
    default: siteConfig.title,
    template: `%s${siteConfig.titleSuffix}`,
  },
  description: siteConfig.description,
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  const measurementId = getMeasurementId();

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
        {measurementId && (
          <>
            <Script id="google-analytics-init" strategy="beforeInteractive">
              {googleAnalyticsInitSnippet(measurementId)}
            </Script>
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              src={googleAnalyticsScriptSrc(measurementId)}
            />
            <AnalyticsRouteListener />
          </>
        )}
      </body>
    </html>
  );
}
