import { afterEach, describe, expect, it, vi } from 'vitest';

import { tools } from '@/registry/tools';

import {
  describePage,
  getMeasurementId,
  googleAnalyticsInitSnippet,
  googleAnalyticsScriptSrc,
  trackOutboundClick,
  trackPageView,
  trackToolCopy,
  trackToolRun,
} from './analytics';

const MEASUREMENT_ID = 'G-TESTMEASURE';

function installGtag() {
  const gtag = vi.fn();
  window.gtag = gtag;
  return gtag;
}

function useSite(hostname: string, pathname = '/') {
  const origin = `https://${hostname}`;
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: {
      hostname,
      origin,
      pathname,
      href: `${origin}${pathname}`,
    },
  });
}

describe('measurement id', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('accepts a GA4 measurement id', () => {
    vi.stubEnv('NEXT_PUBLIC_GA_MEASUREMENT_ID', ` ${MEASUREMENT_ID} `);
    expect(getMeasurementId()).toBe(MEASUREMENT_ID);
  });

  it('rejects missing or unsafe ids', () => {
    vi.stubEnv('NEXT_PUBLIC_GA_MEASUREMENT_ID', '');
    expect(getMeasurementId()).toBeNull();

    vi.stubEnv('NEXT_PUBLIC_GA_MEASUREMENT_ID', 'UA-123456');
    expect(getMeasurementId()).toBeNull();

    vi.stubEnv('NEXT_PUBLIC_GA_MEASUREMENT_ID', "G-TEST';alert(1)");
    expect(getMeasurementId()).toBeNull();
  });

  it('disables the automatic page view in the bootstrap snippet', () => {
    const snippet = googleAnalyticsInitSnippet(MEASUREMENT_ID);

    expect(snippet).toContain(
      `gtag('config', '${MEASUREMENT_ID}', { send_page_view: false });`,
    );
    expect(snippet).toContain('window.gtag = gtag;');
  });

  it('builds the gtag script url from the measurement id', () => {
    expect(googleAnalyticsScriptSrc(MEASUREMENT_ID)).toBe(
      `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`,
    );
  });
});

describe('page details', () => {
  it('names each tool page from the registry', () => {
    for (const tool of tools) {
      const page = describePage(tool.href);
      expect(page).toMatchObject({
        pagePath: tool.href,
        pageTitle: `${tool.name} · Belt`,
        toolId: tool.id,
        toolGroup: tool.groupId,
      });
      expect(page.contentGroup.length).toBeGreaterThan(0);
    }
  });

  it('drops query strings and hashes before describing a page', () => {
    expect(describePage('/beautify/json?token=secret#raw').pagePath).toBe(
      '/beautify/json',
    );
  });

  it('describes the home page and unknown routes without a tool', () => {
    expect(describePage('/')).toMatchObject({
      pageTitle: 'Belt — the Swiss army knife for developers',
      contentGroup: 'Home',
    });
    const missing = describePage('/missing');
    expect(missing.contentGroup).toBe('Other');
    expect(missing.toolId).toBeUndefined();
  });
});

describe('tracking', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    delete window.gtag;
    useSite('localhost');
  });

  it('sends a tool page view without the query string', () => {
    vi.stubEnv('NEXT_PUBLIC_GA_MEASUREMENT_ID', MEASUREMENT_ID);
    const gtag = installGtag();
    useSite('belt.guilhermeselair.dev', '/beautify/json');

    trackPageView('/beautify/json?token=secret#raw');

    expect(gtag).toHaveBeenCalledWith('event', 'page_view', {
      page_path: '/beautify/json',
      page_location: 'https://belt.guilhermeselair.dev/beautify/json',
      page_title: 'JSON Beautify · Belt',
      content_group: 'Beautify',
      tool_id: 'json-beautify',
      tool_group: 'beautify',
    });
    expect(JSON.stringify(gtag.mock.calls)).not.toContain('secret');
  });

  it('records a run, a copy and an outbound link for the current tool', () => {
    vi.stubEnv('NEXT_PUBLIC_GA_MEASUREMENT_ID', MEASUREMENT_ID);
    const gtag = installGtag();
    useSite('belt.guilhermeselair.dev', '/helpers/connection-string');

    trackToolRun('Validate');
    trackToolCopy('Copy URI');
    trackOutboundClick('transform-tools');

    expect(gtag).toHaveBeenNthCalledWith(
      1,
      'event',
      'tool_run',
      expect.objectContaining({
        action: 'Validate',
        tool_id: 'connection-string',
        page_path: '/helpers/connection-string',
      }),
    );
    expect(gtag).toHaveBeenNthCalledWith(
      2,
      'event',
      'tool_copy',
      expect.objectContaining({ target: 'Copy URI' }),
    );
    expect(gtag).toHaveBeenNthCalledWith(
      3,
      'event',
      'outbound_click',
      expect.objectContaining({ link_id: 'transform-tools' }),
    );
    expect(JSON.stringify(gtag.mock.calls)).not.toContain('postgres://');
    expect(JSON.stringify(gtag.mock.calls)).not.toContain('transform.tools');
  });

  it('does not send events from localhost or without a measurement id', () => {
    const gtag = installGtag();
    useSite('localhost', '/beautify/json');
    vi.stubEnv('NEXT_PUBLIC_GA_MEASUREMENT_ID', MEASUREMENT_ID);

    trackPageView('/beautify/json');
    trackToolRun('Beautify');

    useSite('belt.guilhermeselair.dev', '/beautify/json');
    vi.stubEnv('NEXT_PUBLIC_GA_MEASUREMENT_ID', '');
    trackPageView('/beautify/json');

    expect(gtag).not.toHaveBeenCalled();
  });
});
