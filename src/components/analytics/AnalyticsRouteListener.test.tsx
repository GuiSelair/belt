import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AnalyticsRouteListener } from './AnalyticsRouteListener';

const trackPageView = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => '/validation/sql',
}));

vi.mock('@/lib/analytics', () => ({
  trackPageView: (...args: unknown[]) => trackPageView(...args),
}));

describe('AnalyticsRouteListener', () => {
  it('sends a page view for the current route', () => {
    render(<AnalyticsRouteListener />);

    expect(trackPageView).toHaveBeenCalledWith('/validation/sql');
  });
});
