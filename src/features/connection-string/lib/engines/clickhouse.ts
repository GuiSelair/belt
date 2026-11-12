import type { EngineDefinition } from '../types';

export const clickhouse: EngineDefinition = {
  id: 'clickhouse',
  label: 'ClickHouse',
  scheme: 'clickhouse',
  defaultPort: 9000,
  variant: {
    label: 'Secure',
    scheme: 'clickhouse',
    defaultPort: 9440,
    impliedParams: { secure: 'true' },
  },
  credentials: 'userinfo',
  multipleHosts: false,
  database: { label: 'Database', placement: 'path' },
  supportsInstance: false,
  suggestedParams: [
    {
      key: 'secure',
      description: 'Use TLS for the native protocol.',
      values: ['true', 'false'],
    },
    {
      key: 'compress',
      description: 'Compression method for data blocks.',
      values: ['lz4', 'zstd', 'none'],
    },
    {
      key: 'dial_timeout',
      description: 'Time to establish the connection, e.g. 10s.',
    },
    { key: 'read_timeout', description: 'Time to wait for a read, e.g. 5m.' },
    {
      key: 'skip_verify',
      description: 'Skip TLS certificate verification.',
      values: ['true', 'false'],
    },
  ],
};
