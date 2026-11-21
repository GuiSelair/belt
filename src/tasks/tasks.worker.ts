import { createTaskDispatcher } from '@/lib/worker/createTaskDispatcher';
import { exposeWorkerHandler } from '@/lib/worker/exposeWorkerHandler';

import { taskLoaders } from './taskLoaders';

exposeWorkerHandler(createTaskDispatcher(taskLoaders));
