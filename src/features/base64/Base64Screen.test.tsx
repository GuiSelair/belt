import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/renderWithProviders';

import { Base64Screen } from './Base64Screen';

const SAMPLE_BASE64 = 'QmVsdCBrZWVwcyBldmVyeSB0b29sIHdpdGhpbiByZWFjaC4=';

describe('Base64Screen', () => {
  it('encodes the sample on demand', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Base64Screen />);

    const output = screen.getByRole('textbox', { name: 'Base64 output' });
    expect(output).toHaveTextContent('');

    await user.click(screen.getByRole('button', { name: 'Encode' }));

    await waitFor(() => expect(output).toHaveTextContent(SAMPLE_BASE64));
  });

  it('decodes Base64 back to text', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Base64Screen />);

    await user.click(screen.getByRole('radio', { name: 'Decode' }));
    await user.click(screen.getByRole('button', { name: 'Clear' }));
    await user.click(screen.getByRole('textbox', { name: 'Base64 to decode' }));
    await user.paste('Zm9v');
    await user.click(screen.getByRole('button', { name: 'Decode' }));

    await waitFor(() =>
      expect(
        screen.getByRole('textbox', { name: 'Decoded text output' }),
      ).toHaveTextContent('foo'),
    );
  });

  it('explains when the Base64 is invalid', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Base64Screen />);

    await user.click(screen.getByRole('radio', { name: 'Decode' }));
    await user.click(screen.getByRole('button', { name: 'Clear' }));
    await user.click(screen.getByRole('textbox', { name: 'Base64 to decode' }));
    await user.paste('!!!');
    await user.click(screen.getByRole('button', { name: 'Decode' }));

    expect(
      await screen.findByText('This is not valid Base64.'),
    ).toBeInTheDocument();
  });

  it('disables the run button once the input is cleared', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Base64Screen />);

    await user.click(screen.getByRole('button', { name: 'Clear' }));

    expect(screen.getByRole('button', { name: 'Encode' })).toBeDisabled();
  });
});
