'use client';

import type { ReactNode } from 'react';
import { chakra } from '@chakra-ui/react';

import { HandDrawnPath } from './HandDrawnPath';

const LOOP_PATH =
  'M 30 52 C 18 22, 130 6, 215 10 C 280 13, 298 34, 286 56 C 272 78, 160 82, 90 76 C 30 71, 4 56, 14 36 C 24 18, 90 8, 160 9';

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
