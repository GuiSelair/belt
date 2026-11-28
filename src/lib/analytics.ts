import { siteConfig } from '@/config/site';
import { toolGroups } from '@/registry/groups';
import { getToolByHref } from '@/registry/tools';

const MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]+$/;
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

type EventParams = Record<string, string | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export interface PageDetails {
  pagePath: string;
  pageTitle: string;
  contentGroup: string;
  toolId?: string;
  toolGroup?: string;
}

export function getMeasurementId(): string | null {
  const value = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ?? '';
  if (!MEASUREMENT_ID_PATTERN.test(value)) return null;
  return value;
}

export function googleAnalyticsScriptSrc(measurementId: string): string {
  const id = encodeURIComponent(measurementId);
  return `https://www.googletagmanager.com/gtag/js?id=${id}`;
}

export function googleAnalyticsInitSnippet(measurementId: string): string {
  return [
    'window.dataLayer = window.dataLayer || [];',
    'function gtag(){window.dataLayer.push(arguments);}',
    'window.gtag = gtag;',
    "gtag('js', new Date());",
    `gtag('config', '${measurementId}', { send_page_view: false });`,
  ].join('\n');
}

export function normalizePath(pathname: string): string {
  const path = pathname.split(/[?#]/, 1)[0] ?? '';
  if (path.length > 1 && path.endsWith('/')) return path.slice(0, -1);
  return path || '/';
}

export function describePage(pathname: string): PageDetails {
  const pagePath = normalizePath(pathname);
  const tool = getToolByHref(pagePath);

  if (tool) {
    const group = toolGroups.find((candidate) => candidate.id === tool.groupId);
    return {
      pagePath,
      pageTitle: `${tool.name}${siteConfig.titleSuffix}`,
      contentGroup: group?.label ?? tool.groupId,
      toolId: tool.id,
      toolGroup: tool.groupId,
    };
  }

  if (pagePath === '/') {
    return {
      pagePath,
      pageTitle: siteConfig.title,
      contentGroup: 'Home',
    };
  }

  return {
    pagePath,
    pageTitle: siteConfig.title,
    contentGroup: 'Other',
  };
}

function compact(params: EventParams): Record<string, string> {
  const defined: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value) defined[key] = value;
  }
  return defined;
}

function canTrack(): boolean {
  if (getMeasurementId() === null) return false;
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return false;
  }
  return !LOCAL_HOSTS.has(window.location.hostname);
}

function pageParams(pathname: string): EventParams {
  const page = describePage(pathname);
  return {
    page_path: page.pagePath,
    content_group: page.contentGroup,
    tool_id: page.toolId,
    tool_group: page.toolGroup,
  };
}

// Categories only. Never add pasted text, tokens, URIs or error messages.
function send(name: string, params: EventParams) {
  if (!canTrack()) return;
  window.gtag?.('event', name, compact(params));
}

export function trackPageView(pathname: string) {
  const page = describePage(pathname);
  send('page_view', {
    ...pageParams(page.pagePath),
    page_location: `${window.location.origin}${page.pagePath}`,
    page_title: page.pageTitle,
  });
}

export function trackToolRun(action: string) {
  send('tool_run', {
    ...pageParams(window.location.pathname),
    action,
  });
}

export function trackToolCopy(target: string) {
  send('tool_copy', {
    ...pageParams(window.location.pathname),
    target,
  });
}

export function trackOutboundClick(linkId: string) {
  send('outbound_click', {
    ...pageParams(window.location.pathname),
    link_id: linkId,
  });
}
