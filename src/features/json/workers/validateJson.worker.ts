import { exposeWorkerHandler } from '@/lib/worker/exposeWorkerHandler';

import { validateJson } from '../lib/validateJson';

exposeWorkerHandler(validateJson);
