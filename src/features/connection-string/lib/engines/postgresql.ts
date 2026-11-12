import type { EngineDefinition } from '../types';

export const postgresql: EngineDefinition = {
  id: 'postgresql',
  label: 'PostgreSQL',
  scheme: 'postgresql',
  defaultPort: 5432,
  credentials: 'userinfo',
  multipleHosts: false,
  database: { label: 'Database', placement: 'path' },
  supportsInstance: false,
  suggestedParams: [
    {
      key: 'sslmode',
      description: 'How strictly TLS is negotiated with the server.',
      values: [
        'disable',
        'allow',
        'prefer',
        'require',
        'verify-ca',
        'verify-full',
      ],
    },
    {
      key: 'connect_timeout',
      description: 'Maximum time to wait while connecting, in seconds.',
    },
    {
      key: 'application_name',
      description: 'Name reported in pg_stat_activity and server logs.',
    },
    {
      key: 'options',
      description:
        'Command-line options sent at startup, e.g. -c search_path=app.',
    },
    {
      key: 'target_session_attrs',
      description: 'Which kind of server session is acceptable.',
      values: [
        'any',
        'read-write',
        'read-only',
        'primary',
        'standby',
        'prefer-standby',
      ],
    },
  ],
};
