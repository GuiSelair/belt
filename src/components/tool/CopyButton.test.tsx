import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { trackToolCopy } from '@/lib/analytics';
import { renderWithProviders } from '@/test/renderWithProviders';

import { CopyButton } from './CopyButton';

vi.mock('@/lib/analytics', () => ({
  trackToolCopy: vi.fn(),
}));

describe('CopyButton', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.mocked(trackToolCopy).mockClear();
  });

  it('records a successful copy without the copied text', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    renderWithProviders(<CopyButton value="secret-token" label="Copy URI" />);

    await user.click(screen.getByRole('button', { name: 'Copy URI' }));

    await waitFor(() => {
      expect(trackToolCopy).toHaveBeenCalledWith('Copy URI');
    });
    expect(writeText).toHaveBeenCalledWith('secret-token');
    expect(JSON.stringify(vi.mocked(trackToolCopy).mock.calls)).not.toContain(
      'secret-token',
    );
  });

  it('does not record a failed copy', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('navigator', {});
    renderWithProviders(<CopyButton value="secret-token" label="Copy URI" />);

    await user.click(screen.getByRole('button', { name: 'Copy URI' }));

    expect(
      await screen.findByRole('button', { name: 'Copy failed' }),
    ).toBeInTheDocument();
    expect(trackToolCopy).not.toHaveBeenCalled();
  });
});
