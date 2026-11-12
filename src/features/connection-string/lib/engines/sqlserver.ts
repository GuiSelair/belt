import type { EngineDefinition } from '../types';

export const sqlserver: EngineDefinition = {
  id: 'sqlserver',
  label: 'SQL Server',
  scheme: 'sqlserver',
  defaultPort: 1433,
  credentials: 'userinfo',
  multipleHosts: false,
  database: { label: 'Database', placement: 'query', queryKey: 'database' },
  supportsInstance: true,
  suggestedParams: [
    {
      key: 'encrypt',
      description: 'TLS encryption mode.',
      values: ['true', 'false', 'strict', 'disable'],
    },
    {
      key: 'TrustServerCertificate',
      description: 'Accept the server certificate without validation.',
      values: ['true', 'false'],
    },
    {
      key: 'connection timeout',
      description: 'Time to wait while connecting, in seconds.',
    },
    {
      key: 'app name',
      description: 'Application name reported to SQL Server.',
    },
    {
      key: 'ApplicationIntent',
      description: 'Workload type, used to route to readable secondaries.',
      values: ['ReadWrite', 'ReadOnly'],
    },
  ],
};
