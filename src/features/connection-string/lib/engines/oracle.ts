import type { EngineDefinition } from '../types';

export const oracle: EngineDefinition = {
  id: 'oracle',
  label: 'Oracle',
  scheme: 'tcp',
  defaultPort: 1521,
  variant: { label: 'TLS', scheme: 'tcps', defaultPort: 2484 },
  credentials: 'none',
  multipleHosts: true,
  database: { label: 'Service name', placement: 'path' },
  supportsInstance: false,
  notice:
    'Easy Connect Plus strings do not carry credentials: pass the username ' +
    'and password to your driver separately.',
  suggestedParams: [
    {
      key: 'transport_connect_timeout',
      description: 'Time to establish the TCP connection, in seconds.',
    },
    {
      key: 'connect_timeout',
      description: 'Time to establish the whole connection, in seconds.',
    },
    {
      key: 'retry_count',
      description: 'Number of times the address list is traversed.',
    },
    {
      key: 'ssl_server_dn_match',
      description: 'Check the server certificate distinguished name.',
      values: ['yes', 'no'],
    },
    {
      key: 'wallet_location',
      description: 'Directory of the wallet that holds TLS certificates.',
    },
  ],
};
