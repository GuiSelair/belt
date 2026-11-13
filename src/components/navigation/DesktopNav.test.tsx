import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { NavSection } from '@/registry';
import { renderWithProviders } from '@/test/renderWithProviders';

import { DesktopNav } from './DesktopNav';

vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next/navigation')>()),
  usePathname: () => '/beautify/json',
}));

const sections: NavSection[] = [
  {
    id: 'beautify',
    label: 'Beautify',
    items: [
      {
        id: 'json-beautify',
        label: 'JSON Beautify',
        href: '/beautify/json',
        external: false,
      },
      {
        id: 'jsx-beautify',
        label: 'JSX Beautify',
        href: '/beautify/jsx',
        external: false,
      },
    ],
  },
  {
    id: 'links',
    label: 'Links',
    items: [
      {
        id: 'transform-tools',
        label: 'transform.tools',
        href: 'https://transform.tools',
        external: true,
      },
    ],
  },
];

function getTrigger(name: string) {
  return screen.getByRole('button', { name });
}

describe('DesktopNav', () => {
  it('renders collapsed triggers for each section', () => {
    renderWithProviders(<DesktopNav sections={sections} />);

    expect(getTrigger('Beautify')).toHaveAttribute('aria-expanded', 'false');
    expect(getTrigger('Links')).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('link', { name: /JSON Beautify/ })).toBeNull();
  });

  it('opens the flyout on hover', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DesktopNav sections={sections} />);

    await user.hover(getTrigger('Beautify'));

    expect(getTrigger('Beautify')).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByRole('link', { name: /JSX Beautify/ }),
    ).toBeInTheDocument();
  });

  it('supports keyboard navigation and Escape', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DesktopNav sections={sections} />);

    getTrigger('Beautify').focus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('link', { name: /JSON Beautify/ })).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('link', { name: /JSX Beautify/ })).toHaveFocus();

    await user.keyboard('{Escape}');
    expect(getTrigger('Beautify')).toHaveAttribute('aria-expanded', 'false');
    expect(getTrigger('Beautify')).toHaveFocus();
  });

  it('marks the current route as active', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DesktopNav sections={sections} />);

    await user.hover(getTrigger('Beautify'));

    expect(screen.getByRole('link', { name: /JSON Beautify/ })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(getTrigger('Beautify')).toHaveAttribute('data-active');
  });

  it('opens external links in a new tab', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DesktopNav sections={sections} />);

    await user.click(getTrigger('Links'));
    const link = screen.getByRole('link', {
      name: /transform\.tools.*opens in a new tab/,
    });

    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
