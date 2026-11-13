'use client';

import { chakra } from '@chakra-ui/react';

import { HandDrawnPath } from './HandDrawnPath';

const SPARKS = ['M 6 44 L 30 50', 'M 14 14 L 34 34', 'M 44 6 L 50 30'];

const PLACEMENTS = {
  topStart: { top: '-0.16em', left: '-0.26em', transform: undefined },
  bottomEnd: {
    bottom: '-0.16em',
    right: '-0.26em',
    transform: 'rotate(180deg)',
  },
} as const;

interface SparkLinesProps {
  placement: keyof typeof PLACEMENTS;
  delay?: number;
}

export function SparkLines({ placement, delay = 0.9 }: SparkLinesProps) {
  return (
    <chakra.svg
      aria-hidden="true"
      viewBox="0 0 60 60"
      position="absolute"
      {...PLACEMENTS[placement]}
      width="0.34em"
      height="0.34em"
      color="fg.highlight"
      pointerEvents="none"
      overflow="visible"
    >
      {SPARKS.map(function renderSpark(d, index) {
        return (
          <HandDrawnPath
            key={d}
            d={d}
            strokeWidth={7}
            duration="0.3s"
            delay={`${delay + index * 0.1}s`}
          />
        );
      })}
    </chakra.svg>
  );
}
