import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/renderWithProviders';

import { InputActions } from './InputActions';

describe('InputActions', () => {
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
  });
});
