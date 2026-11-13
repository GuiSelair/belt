'use client';

import { chakra } from '@chakra-ui/react';

import { HandDrawnPath } from './HandDrawnPath';

const SHAFT_PATH = 'M 70 6 C 112 0, 126 40, 102 66 C 86 82, 52 88, 16 80';
const HEAD_PATH = 'M 30 64 L 14 80 L 34 94';

export function CurvedArrow() {
  return (
    <chakra.svg
      aria-hidden="true"
      viewBox="0 0 120 100"
      position="absolute"
      left="calc(100% + 0.25rem)"
      bottom="40%"
      width="7rem"
      height="6rem"
      color="fg.highlight"
      pointerEvents="none"
      overflow="visible"
      display={{ base: 'none', md: 'block' }}
    >
      <HandDrawnPath d={SHAFT_PATH} strokeWidth={6} delay="1.2s" />
      <HandDrawnPath
        d={HEAD_PATH}
        strokeWidth={6}
        duration="0.3s"
        delay="1.9s"
      />
    </chakra.svg>
  );
}
