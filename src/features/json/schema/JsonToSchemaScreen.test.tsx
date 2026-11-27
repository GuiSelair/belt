import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/renderWithProviders';

import { JsonToSchemaScreen } from './JsonToSchemaScreen';

describe('JsonToSchemaScreen', () => {
  it('generates a schema for the sample on demand', async () => {
    const user = userEvent.setup();
    renderWithProviders(<JsonToSchemaScreen />);

    const output = screen.getByRole('textbox', {
      name: 'Generated JSON Schema output',
    });
    expect(output).toHaveTextContent('');

    await user.click(screen.getByRole('button', { name: 'Generate' }));

    await waitFor(() =>
      expect(output).toHaveTextContent(
        '"$schema": "https://json-schema.org/draft/2020-12/schema"',
      ),
    );
    expect(output).toHaveTextContent('"format": "uuid"');
  });

  it('disables the run button once the input is cleared', async () => {
    const user = userEvent.setup();
    renderWithProviders(<JsonToSchemaScreen />);

    await user.click(screen.getByRole('button', { name: 'Clear' }));

    expect(screen.getByRole('button', { name: 'Generate' })).toBeDisabled();
  });
});
