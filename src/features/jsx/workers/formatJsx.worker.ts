import { exposeWorkerHandler } from '@/lib/worker/exposeWorkerHandler';

import { formatJsx } from '../lib/formatJsx';

exposeWorkerHandler(formatJsx);
