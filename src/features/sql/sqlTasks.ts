import { createTask } from '@/tasks/createTask';

/** Covers downloading and compiling the WASM parser on the first task. */
const SQL_TASK_TIMEOUT_MS = 20_000;

const options = { timeoutMs: SQL_TASK_TIMEOUT_MS };

export const warmSqlParserTask = createTask('warmSqlParser', options);
export const validateSqlTask = createTask('validateSql', options);
export const addAliasesTask = createTask('addAliases', options);
