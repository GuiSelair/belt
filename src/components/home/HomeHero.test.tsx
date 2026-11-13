import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/renderWithProviders';

import { HomeHero } from './HomeHero';

describe('HomeHero', () => {
  it('renders a single h1 with the project name and the tagline', () => {
    renderWithProviders(<HomeHero />);

    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent('Belt');
    expect(screen.getByText(/Swiss army knife/)).toBeInTheDocument();
  });

  it('links to the featured tools from the registry', () => {
    renderWithProviders(<HomeHero />);

    expect(screen.getByRole('link', { name: /JSON Beautify/ })).toHaveAttribute(
      'href',
      '/beautify/json',
    );
    expect(screen.getByRole('link', { name: /XML to XSD/ })).toHaveAttribute(
      'href',
      '/transformations/xml-to-xsd',
    );
  });
});
