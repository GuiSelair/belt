import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

function constant(value: string) {
  return { value: { _light: value, _dark: value } };
}

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          blue: { value: '#0131CD' },
          green: { value: '#B9FC01' },
          white: { value: '#FFFFFF' },
        },
        navy: {
          950: { value: '#172255' },
          900: { value: '#1E2B63' },
          800: { value: '#263570' },
          700: { value: '#30417F' },
          600: { value: '#3D52A6' },
          500: { value: '#4A67D3' },
          400: { value: '#5B78DD' },
          300: { value: '#A9B8F0' },
          200: { value: '#CBD5F7' },
        },
        syntax: {
          property: { value: '#7DD3FC' },
          string: { value: '#B9FC01' },
          number: { value: '#FDBA74' },
          atom: { value: '#F9A8D4' },
          keyword: { value: '#C4B5FD' },
          attribute: { value: '#FDE68A' },
          comment: { value: '#A9B8F0' },
          punctuation: { value: '#CBD5F7' },
          invalid: { value: '#FCA5A5' },
        },
      },
      fonts: {
        heading: { value: 'var(--font-geist-sans), system-ui, sans-serif' },
        body: { value: 'var(--font-geist-sans), system-ui, sans-serif' },
        mono: { value: 'var(--font-geist-mono), ui-monospace, monospace' },
        brand: { value: 'var(--font-brand), system-ui, sans-serif' },
      },
    },
    keyframes: {
      draw: {
        from: { strokeDashoffset: '1' },
        to: { strokeDashoffset: '0' },
      },
    },
    semanticTokens: {
      colors: {
        bg: {
          DEFAULT: constant('{colors.navy.950}'),
          subtle: constant('{colors.navy.900}'),
          panel: constant('{colors.navy.900}'),
          muted: constant('{colors.navy.800}'),
          emphasized: constant('{colors.navy.700}'),
          brand: constant('{colors.brand.blue}'),
        },
        fg: {
          DEFAULT: constant('{colors.brand.white}'),
          muted: constant('{colors.navy.200}'),
          subtle: constant('{colors.navy.300}'),
          highlight: constant('{colors.brand.green}'),
        },
        border: {
          DEFAULT: constant('{colors.navy.500}'),
          muted: constant('{colors.navy.600}'),
          subtle: constant('{colors.navy.700}'),
          emphasized: constant('{colors.navy.400}'),
        },
        accent: {
          solid: constant('{colors.brand.green}'),
          contrast: constant('{colors.navy.950}'),
          fg: constant('{colors.brand.green}'),
          muted: constant('{colors.navy.700}'),
          subtle: constant('{colors.navy.800}'),
          emphasized: constant('{colors.navy.600}'),
          focusRing: constant('{colors.brand.green}'),
        },
        brand: {
          solid: constant('{colors.brand.blue}'),
          contrast: constant('{colors.brand.white}'),
          fg: constant('{colors.brand.white}'),
          muted: constant('{colors.navy.700}'),
          subtle: constant('{colors.navy.800}'),
          emphasized: constant('{colors.navy.600}'),
          focusRing: constant('{colors.brand.green}'),
        },
        gray: {
          subtle: constant('{colors.navy.800}'),
          border: constant('{colors.navy.500}'),
          focusRing: constant('{colors.brand.green}'),
        },
      },
    },
  },
  globalCss: {
    'html, body': {
      bg: 'bg',
      color: 'fg',
    },
    body: {
      '--header-bg': '{colors.bg}',
    },
    'body:has([data-home-hero])': {
      '--header-bg': '{colors.brand.blue}',
      bg: 'bg.brand',
      bgImage:
        'linear-gradient(to right, {colors.whiteAlpha.200} 1px, transparent 1px), linear-gradient(to bottom, {colors.whiteAlpha.200} 1px, transparent 1px)',
      bgSize: '4rem 4rem',
    },
    '*:focus-visible': {
      outline: '2px solid {colors.brand.green}',
      outlineOffset: '2px',
    },
    '::selection': {
      bg: 'brand.green',
      color: 'navy.950',
    },
  },
});

export const system = createSystem(defaultConfig, config);
