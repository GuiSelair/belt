type SqlParserModule = typeof import('@guanmingchiu/sqlparser-ts');

let parserPromise: Promise<SqlParserModule> | null = null;

/**
 * Loads the WASM parser on first use. It must run on the main thread: the
 * package only fetches its WASM when `window` exists, which is not the case
 * inside a Web Worker.
 */
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
