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

  it('renders the decorative white-chalk lateral illustrations hidden from assistive tech', () => {
    const { container } = renderWithProviders(<HomeHero />);

    const swissKnife = container.querySelector(
      'svg[data-chalk-illustration="swiss-knife"]',
    );
    const utilityBelt = container.querySelector(
      'svg[data-chalk-illustration="utility-belt"]',
    );

    expect(swissKnife).toBeInTheDocument();
    expect(swissKnife).toHaveAttribute('aria-hidden', 'true');
    expect(utilityBelt).toBeInTheDocument();
    expect(utilityBelt).toHaveAttribute('aria-hidden', 'true');

    const knifeFilterId = swissKnife?.querySelector('filter')?.id;
    const beltFilterId = utilityBelt?.querySelector('filter')?.id;

    expect(knifeFilterId).toBeTruthy();
    expect(beltFilterId).toBeTruthy();
    expect(knifeFilterId).not.toBe(beltFilterId);
  });

  it('renders the home utility belt as a decorative graphic', () => {
    const { container } = renderWithProviders(<HomeHero />);

    const utilityBelts = container.querySelectorAll('[data-utility-belt]');
    expect(utilityBelts).toHaveLength(1);
    expect(utilityBelts[0]).toHaveAttribute(
      'data-belt-variant',
      'option-b-full',
    );
    expect(utilityBelts[0]).toHaveAttribute('aria-hidden', 'true');
    expect(utilityBelts[0]).toHaveAttribute('focusable', 'false');
  });
});
