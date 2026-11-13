import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/renderWithProviders';

import { XmlValidationScreen } from './XmlValidationScreen';

describe('XmlValidationScreen', () => {
  it('starts with the sample and validates only on demand', async () => {
    const user = userEvent.setup();
    renderWithProviders(<XmlValidationScreen />);

    expect(screen.getByText('Ready to validate')).toBeInTheDocument();
    expect(screen.queryByText('Valid XML')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Validate' }));

    expect(screen.getByText('Valid XML')).toBeInTheDocument();
  });

  it('disables the run button once the input is cleared', async () => {
    const user = userEvent.setup();
    renderWithProviders(<XmlValidationScreen />);

    await user.click(screen.getByRole('button', { name: 'Clear' }));

    expect(screen.getByRole('button', { name: 'Validate' })).toBeDisabled();
  });
});
