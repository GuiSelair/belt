import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/renderWithProviders';

import { SqlValidationScreen } from './SqlValidationScreen';

describe('SqlValidationScreen', () => {
  it('validates the sample on demand and compares the dialects', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SqlValidationScreen />);

    expect(screen.getByText('Ready to validate')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Validate' }));

    expect(await screen.findByText('Valid PostgreSQL SQL')).toBeInTheDocument();
    const compatibility = screen.getByRole('region', {
      name: 'Dialect compatibility',
    });
    expect(within(compatibility).getByText('SQL Server')).toBeInTheDocument();
  });

  it('re-validates with the newly selected dialect', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SqlValidationScreen />);

    await user.click(screen.getByRole('button', { name: 'Validate' }));
    await screen.findByText('Valid PostgreSQL SQL');
    await user.selectOptions(screen.getByLabelText('Dialect'), 'mysql');

    expect(await screen.findByText('Valid MySQL SQL')).toBeInTheDocument();
  });

  it('disables the run button once the input is cleared', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SqlValidationScreen />);

    await user.click(screen.getByRole('button', { name: 'Clear' }));

    expect(screen.getByRole('button', { name: 'Validate' })).toBeDisabled();
  });
});
