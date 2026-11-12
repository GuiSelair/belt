import type { EngineDefinition } from '../types';

export const mongodb: EngineDefinition = {
  id: 'mongodb',
  label: 'MongoDB',
  scheme: 'mongodb',
  defaultPort: 27017,
  variant: {
    label: 'SRV',
    scheme: 'mongodb+srv',
    defaultPort: null,
    singleHost: true,
  },
  credentials: 'userinfo',
  multipleHosts: true,
  database: {
    label: 'Database',
    placement: 'path',
    helperText: 'Also the default authentication database.',
  },
  supportsInstance: false,
  suggestedParams: [
    {
      key: 'authSource',
      description: 'Database that holds the user credentials.',
    },
    { key: 'replicaSet', description: 'Name of the replica set to join.' },
    {
      key: 'retryWrites',
      description: 'Retry supported write operations once on failure.',
      values: ['true', 'false'],
    },
    {
      key: 'w',
      description: 'Default write concern.',
      values: ['majority', '0', '1'],
    },
    {
      key: 'tls',
      description: 'Use TLS for the connection.',
      values: ['true', 'false'],
    },
    {
      key: 'readPreference',
      description: 'Which members of the replica set serve reads.',
      values: [
        'primary',
        'primaryPreferred',
        'secondary',
        'secondaryPreferred',
        'nearest',
      ],
    },
    { key: 'appName', description: 'Name reported in server logs.' },
  ],
};
