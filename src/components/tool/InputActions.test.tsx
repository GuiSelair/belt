import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { trackToolRun } from '@/lib/analytics';
import { renderWithProviders } from '@/test/renderWithProviders';

import { InputActions } from './InputActions';

vi.mock('@/lib/analytics', () => ({
  trackToolRun: vi.fn(),
}));

describe('InputActions', () => {
  beforeEach(() => {
    vi.mocked(trackToolRun).mockClear();
  });

  it('shows the running label and blocks the run button while running', async () => {
    const user = userEvent.setup();
    const onRun = vi.fn();
    const onClear = vi.fn();
    renderWithProviders(
      <InputActions
        runLabel="Validate"
        canRun
        onRun={onRun}
        onClear={onClear}
        isRunning
        runningLabel="Validating…"
      />,
    );

    const runButton = screen.getByRole('button', { name: /Validating…/ });
    expect(runButton).toBeDisabled();
    expect(runButton).toHaveAttribute('data-loading');

    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(onClear).toHaveBeenCalled();
    expect(onRun).not.toHaveBeenCalled();
    expect(trackToolRun).not.toHaveBeenCalled();
  });

  it('records the run action before running it', async () => {
    const user = userEvent.setup();
    const onRun = vi.fn();
    renderWithProviders(
      <InputActions
        runLabel="Beautify"
        canRun
        onRun={onRun}
        onClear={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Beautify' }));

    expect(trackToolRun).toHaveBeenCalledWith('Beautify');
    expect(onRun).toHaveBeenCalledOnce();
  });
});
