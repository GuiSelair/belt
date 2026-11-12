import { exposeWorkerHandler } from '@/lib/worker/exposeWorkerHandler';

import { generateXsd } from '../lib/xsd/generateXsd';

exposeWorkerHandler(generateXsd);
