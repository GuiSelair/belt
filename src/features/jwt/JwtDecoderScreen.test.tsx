import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/renderWithProviders';

import { JwtDecoderScreen } from './JwtDecoderScreen';

describe('JwtDecoderScreen', () => {
  it('starts with the sample and decodes only on demand', async () => {
    const user = userEvent.setup();
    renderWithProviders(<JwtDecoderScreen />);

    expect(screen.getByText('Ready to decode')).toBeInTheDocument();
    expect(
      screen.queryByRole('region', { name: 'Payload' }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Decode' }));

    expect(screen.getByText('Token is active')).toBeInTheDocument();
    expect(screen.getByText('HS256')).toBeInTheDocument();
    expect(screen.getByText('https://auth.belt.dev')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Payload' })).toBeInTheDocument();
  });

  it('disables the run button once the input is cleared', async () => {
    const user = userEvent.setup();
    renderWithProviders(<JwtDecoderScreen />);

    await user.click(screen.getByRole('button', { name: 'Clear' }));

    expect(screen.getByRole('button', { name: 'Decode' })).toBeDisabled();
  });
});
