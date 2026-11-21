type SqlParserModule = typeof import('@guanmingchiu/sqlparser-ts');

let parserPromise: Promise<SqlParserModule> | null = null;

/** Loads and instantiates the WASM parser once, then reuses that instance. */
export function loadSqlParser(): Promise<SqlParserModule> {
  parserPromise ??= import('@guanmingchiu/sqlparser-ts')
    .then(async (parser) => {
      await parser.init();
      return parser;
    })
    .catch((error: unknown) => {
      parserPromise = null;
      throw error;
    });
  return parserPromise;
}

export async function warmSqlParser(): Promise<null> {
  await loadSqlParser();
  return null;
}
