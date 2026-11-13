'use client';

import { chakra } from '@chakra-ui/react';

import { HandDrawnPath } from './HandDrawnPath';

const SPARKS = ['M 6 44 L 30 50', 'M 14 14 L 34 34', 'M 44 6 L 50 30'];

export function SparkLines() {
  return (
    <chakra.svg
      aria-hidden="true"
      viewBox="0 0 60 60"
      position="absolute"
      top="-0.16em"
      left="-0.26em"
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
            delay={`${0.9 + index * 0.1}s`}
          />
        );
      })}
    </chakra.svg>
  );
}
