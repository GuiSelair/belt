import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

function createEmptyRectList() {
  const rects: DOMRect[] = [];
  return Object.assign(rects, {
    item: () => null,
  }) as unknown as DOMRectList;
}

function stubRangeGeometry() {
  if (typeof Range === 'undefined') return;

  if (!Range.prototype.getClientRects) {
    Range.prototype.getClientRects = createEmptyRectList;
  }

  if (!Range.prototype.getBoundingClientRect) {
    Range.prototype.getBoundingClientRect = function getBoundingClientRect() {
      return new DOMRect();
    };
  }
}

stubRangeGeometry();

afterEach(cleanup);
