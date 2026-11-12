import { exposeWorkerHandler } from '@/lib/worker/exposeWorkerHandler';

import { formatJson } from '../lib/formatJson';

exposeWorkerHandler(formatJson);
