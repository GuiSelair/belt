'use client';

import type { ReactNode } from 'react';
import { chakra } from '@chakra-ui/react';

import { HandDrawnPath } from './HandDrawnPath';

const LOOP_PATH =
  'M 130 6 C 220 2, 306 18, 296 46 C 286 74, 180 84, 100 80 C 30 77, 0 64, 2 44 C 4 20, 40 0, 180 3';

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
        pointerEvents="none"
        overflow="visible"
      >
        <HandDrawnPath d={LOOP_PATH} delay="0.3s" duration="1s" />
      </chakra.svg>
    </chakra.span>
  );
}
