import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/renderWithProviders';

import { WsdlInspectorScreen } from './WsdlInspectorScreen';

describe('WsdlInspectorScreen', () => {
  it('inspects the sample on demand and switches ports and operations', async () => {
    const user = userEvent.setup();
    renderWithProviders(<WsdlInspectorScreen />);

    expect(screen.getByText('Ready to inspect')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Inspect' }));

    expect(
      await screen.findByText('https://api.belt.dev/soap/orders'),
    ).toBeInTheDocument();
    expect(screen.getByText('urn:belt:orders/GetOrder')).toBeInTheDocument();
    const envelope = screen.getByRole('textbox', { name: 'Request envelope' });
    expect(envelope).toHaveTextContent('<tns:GetOrderRequest>');

    await user.selectOptions(screen.getByLabelText('Operation'), 'CreateOrder');
    await waitFor(() =>
      expect(envelope).toHaveTextContent('<tns:CreateOrderRequest>'),
    );
    expect(screen.getByText('urn:belt:orders/CreateOrder')).toBeInTheDocument();

    await user.selectOptions(
      screen.getByLabelText('Port'),
      'OrderService/OrderSoap12',
    );
    expect(
      screen.getByText('https://api.belt.dev/soap12/orders'),
    ).toBeInTheDocument();
  });

  it('disables the run button once the input is cleared', async () => {
    const user = userEvent.setup();
    renderWithProviders(<WsdlInspectorScreen />);

    await user.click(screen.getByRole('button', { name: 'Clear' }));

    expect(screen.getByRole('button', { name: 'Inspect' })).toBeDisabled();
  });
});
