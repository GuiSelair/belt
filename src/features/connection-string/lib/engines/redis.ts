import type { EngineDefinition } from '../types';

export const redis: EngineDefinition = {
  id: 'redis',
  label: 'Redis',
  scheme: 'redis',
  defaultPort: 6379,
  variant: { label: 'TLS', scheme: 'rediss', defaultPort: 6379 },
  credentials: 'password-only-allowed',
  multipleHosts: false,
  database: {
    label: 'Database index',
    placement: 'path',
    numeric: true,
    helperText: 'Numeric index, 0–15 on a default server.',
  },
  supportsInstance: false,
  suggestedParams: [
    {
      key: 'timeout',
      description: 'Connection timeout.',
      driverSpecific: true,
    },
    {
      key: 'client_name',
      description: 'Name set with CLIENT SETNAME after connecting.',
      driverSpecific: true,
    },
  ],
};
