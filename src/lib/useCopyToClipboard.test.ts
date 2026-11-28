import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useCopyToClipboard } from './useCopyToClipboard';

describe('useCopyToClipboard', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reports copied when the clipboard accepts the text', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    const { result } = renderHook(() => useCopyToClipboard());

    let copied = false;
    await act(async () => {
      copied = await result.current.copy('hello');
    });

    expect(copied).toBe(true);
    expect(writeText).toHaveBeenCalledWith('hello');
    expect(result.current.status).toBe('copied');
  });

  it('reports an error when the clipboard is unavailable', async () => {
    vi.stubGlobal('navigator', {});
    const { result } = renderHook(() => useCopyToClipboard());

    let copied = true;
    await act(async () => {
      copied = await result.current.copy('hello');
    });

    expect(copied).toBe(false);
    expect(result.current.status).toBe('error');
  });
});
