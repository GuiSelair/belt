'use client';

import { useEffect, useState } from 'react';

import { warmSqlParserTask } from './sqlTasks';

function ignoreError() {}

/**
 * Starts loading the WASM parser in the worker as soon as a SQL screen mounts,
 * so the first click does not wait for the download. A failed warm-up is
 * ignored: the next task retries the load and reports the error.
 */
export function useSqlParserWarmUp() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    warmSqlParserTask(null).then(() => {
      if (isCurrent) setIsReady(true);
    }, ignoreError);
    return () => {
      isCurrent = false;
    };
  }, []);

  return isReady;
}
