import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/renderWithProviders';

import { SqlAliasesScreen } from './SqlAliasesScreen';

describe('SqlAliasesScreen', () => {
  it('adds aliases to the sample on demand', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SqlAliasesScreen />);

    const output = screen.getByRole('textbox', {
      name: 'SQL with aliases output',
    });
    expect(output).toHaveTextContent('');

    await user.click(screen.getByRole('button', { name: 'Add aliases' }));

    await waitFor(() => expect(output).toHaveTextContent('FROM users AS u'));
    expect(output).toHaveTextContent('u.id AS id');
  });

  it('disables the run button once the input is cleared', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SqlAliasesScreen />);

    await user.click(screen.getByRole('button', { name: 'Clear' }));

    expect(screen.getByRole('button', { name: 'Add aliases' })).toBeDisabled();
  });
});
