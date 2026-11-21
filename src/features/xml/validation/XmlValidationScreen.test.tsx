import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { validateXml } from '@/features/xml/lib/validateXml';
import { taskLoaders } from '@/tasks/taskLoaders';
import { renderWithProviders } from '@/test/renderWithProviders';

import { XmlValidationScreen } from './XmlValidationScreen';

describe('XmlValidationScreen', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts with the sample and validates only on demand', async () => {
    const user = userEvent.setup();
    renderWithProviders(<XmlValidationScreen />);

    expect(screen.getByText('Ready to validate')).toBeInTheDocument();
    expect(screen.queryByText('Valid XML')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Validate' }));

    expect(await screen.findByText('Valid XML')).toBeInTheDocument();
  });

  it('shows the loading state on the run button until the worker replies', async () => {
    let finish = () => {};
    const released = new Promise<void>((resolve) => {
      finish = resolve;
    });
    vi.spyOn(taskLoaders, 'validateXml').mockResolvedValue(async (text) => {
      await released;
      return validateXml(text);
    });
    const user = userEvent.setup();
    renderWithProviders(<XmlValidationScreen />);

    await user.click(screen.getByRole('button', { name: 'Validate' }));

    const runButton = await screen.findByRole('button', {
      name: /Validating…/,
    });
    expect(runButton).toBeDisabled();
    expect(screen.queryByText('Valid XML')).not.toBeInTheDocument();

    finish();

    expect(await screen.findByText('Valid XML')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Validate' })).toBeEnabled();
  });

  it('disables the run button once the input is cleared', async () => {
    const user = userEvent.setup();
    renderWithProviders(<XmlValidationScreen />);

    await user.click(screen.getByRole('button', { name: 'Clear' }));

    expect(screen.getByRole('button', { name: 'Validate' })).toBeDisabled();
  });
});
