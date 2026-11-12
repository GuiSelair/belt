import type { EngineDefinition } from '../types';

export const mysql: EngineDefinition = {
  id: 'mysql',
  label: 'MySQL',
  scheme: 'mysql',
  defaultPort: 3306,
  credentials: 'userinfo',
  multipleHosts: false,
  database: { label: 'Database', placement: 'path' },
  supportsInstance: false,
  suggestedParams: [
    {
      key: 'ssl-mode',
      description: 'How strictly TLS is negotiated with the server.',
      values: [
        'DISABLED',
        'PREFERRED',
        'REQUIRED',
        'VERIFY_CA',
        'VERIFY_IDENTITY',
      ],
    },
    {
      key: 'charset',
      description: 'Character set used by the connection.',
      driverSpecific: true,
    },
    {
      key: 'connectTimeout',
      description: 'Maximum time to wait while connecting.',
      driverSpecific: true,
    },
    {
      key: 'timezone',
      description: 'Time zone used to convert date values.',
      driverSpecific: true,
    },
  ],
};
