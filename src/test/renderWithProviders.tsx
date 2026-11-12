import type { ReactElement } from 'react';

import { render } from '@testing-library/react';

import { AppProviders } from '@/components/providers/AppProviders';

export function renderWithProviders(ui: ReactElement) {
  return render(ui, { wrapper: AppProviders });
}
