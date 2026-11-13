'use client';

import type { ReactNode } from 'react';
import { chakra } from '@chakra-ui/react';

import { HandDrawnPath } from './HandDrawnPath';

const LOOP_PATH =
  'M 168 9 C 246 6, 304 20, 296 48 C 290 70, 220 84, 128 82 C 52 80, 2 68, 5 42 C 8 20, 58 4, 136 6 C 186 6, 228 4, 258 -2';

interface ScribbleCircleProps {
  children: ReactNode;
}

export function ScribbleCircle({ children }: ScribbleCircleProps) {
  return (
    <chakra.span
      position="relative"
      display="inline-block"
      whiteSpace="nowrap"
      mx="0.3em"
    >
      {children}
      <chakra.svg
        aria-hidden="true"
        viewBox="0 0 300 86"
        preserveAspectRatio="none"
        position="absolute"
        inset="-0.45em -0.6em"
        width="calc(100% + 1.2em)"
        height="calc(100% + 0.9em)"
        color="fg.highlight"
        transform="rotate(-2deg)"
        pointerEvents="none"
        overflow="visible"
      >
        <HandDrawnPath d={LOOP_PATH} delay="0.3s" duration="1s" />
      </chakra.svg>
    </chakra.span>
  );
}
