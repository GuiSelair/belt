/**
 * Browser stand-in for `node:fs/promises`. Bundled WASM packages that detect
 * Node through `process` (which the bundler polyfills) end up calling
 * `readFile(new URL(...))`; fetching the URL gives them the same bytes.
 */
export async function readFile(path: URL | string): Promise<Uint8Array> {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${String(path)}: ${response.status}`);
  }
  return new Uint8Array(await response.arrayBuffer());
}
