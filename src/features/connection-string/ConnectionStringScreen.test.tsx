import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { system } from '@/theme/system';

import { ConnectionStringScreen } from './ConnectionStringScreen';

function renderScreen() {
  const user = userEvent.setup();
  render(
    <ChakraProvider value={system}>
      <ConnectionStringScreen />
    </ChakraProvider>,
  );
  return user;
}

function getPreview() {
  return within(screen.getByRole('region', { name: 'Connection URI' }));
}

describe('ConnectionStringScreen', () => {
  it('builds a masked PostgreSQL URI and reveals the password on demand', async () => {
    const user = renderScreen();

    await user.type(
      screen.getByRole('textbox', { name: /^host/i }),
      'db.local',
    );
    await user.type(screen.getByRole('textbox', { name: 'Username' }), 'app');
    await user.type(screen.getByLabelText('Password'), 'p@ss#1');
    await user.type(screen.getByRole('textbox', { name: 'Database' }), 'shop');

    const preview = getPreview();
    expect(
      preview.getByText('postgresql://app:••••@db.local:5432/shop'),
    ).toBeInTheDocument();

    await user.click(preview.getByRole('button', { name: 'Show password' }));
    expect(
      preview.getByText('postgresql://app:p%40ss%231@db.local:5432/shop'),
    ).toBeInTheDocument();

    const warning = screen
      .getByText('Some characters were percent-encoded')
      .closest('[role="status"]');
    expect(warning).toHaveTextContent('Password: @ → %40, # → %23');
  });

  it('adds a suggested param to the query string', async () => {
    const user = renderScreen();

    await user.type(screen.getByRole('textbox', { name: /^host/i }), 'db');
    await user.click(screen.getByRole('button', { name: 'Add sslmode' }));
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Value of sslmode' }),
      'require',
    );

    expect(
      getPreview().getByText('postgresql://db:5432/?sslmode=require'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Add sslmode' }),
    ).not.toBeInTheDocument();
  });

  it('links field errors to the input and hides the copy action', async () => {
    const user = renderScreen();
    const port = screen.getByRole('textbox', { name: /^port/i });

    await user.type(port, '99999');

    expect(port).toHaveAccessibleDescription(
      'Port must be a number between 1 and 65535.',
    );
    expect(
      getPreview().queryByRole('button', { name: 'Copy URI' }),
    ).not.toBeInTheDocument();
  });

  it('hides credentials for Oracle and shows the notice', async () => {
    const user = renderScreen();

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Database engine' }),
      'oracle',
    );

    expect(
      screen.queryByRole('textbox', { name: 'Username' }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/do not carry credentials/)).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: 'Service name' }),
    ).toBeInTheDocument();
  });
});
