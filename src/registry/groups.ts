import type { ToolGroup } from './types';

export const toolGroups: readonly ToolGroup[] = [
  { id: 'beautify', label: 'Beautify' },
  { id: 'minify', label: 'Minify' },
  { id: 'validation', label: 'Validation' },
  { id: 'transformations', label: 'Transformations' },
  { id: 'helpers', label: 'Helpers' },
];
