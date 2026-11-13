import { exposeWorkerHandler } from '@/lib/worker/exposeWorkerHandler';

import { inspectWsdl } from '../lib/inspectWsdl';

exposeWorkerHandler(inspectWsdl);
