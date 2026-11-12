'use client';

import { chakra, type HTMLChakraProps } from '@chakra-ui/react';

import { HandDrawnPath } from './HandDrawnPath';

interface ArtifactProps extends HTMLChakraProps<'svg'> {
  viewBox: string;
  paths: string[];
  delay: number;
}

function Artifact({ viewBox, paths, delay, ...positionProps }: ArtifactProps) {
  return (
    <chakra.svg
      viewBox={viewBox}
      position="absolute"
      overflow="visible"
      {...positionProps}
    >
      {paths.map((d, index) => (
        <HandDrawnPath key={d} d={d} delay={`${delay + index * 0.2}s`} />
      ))}
    </chakra.svg>
  );
}

const SPARKLE = [
  'M 20 2 L 20 38',
  'M 2 20 L 38 20',
  'M 8 8 L 32 32',
  'M 32 8 L 8 32',
];
const SQUIGGLE = ['M 2 20 C 14 2, 22 38, 34 20 S 54 2, 66 20 S 86 38, 98 20'];
const CURVED_ARROW = [
  'M 4 6 C 20 60, 60 92, 116 84',
  'M 98 70 L 118 84 L 96 96',
];
const LOOPED_ARROW = [
  'M 116 4 C 112 40, 70 30, 78 54 C 86 74, 110 58, 96 46 C 82 34, 44 70, 8 86',
  'M 10 66 L 6 88 L 28 92',
];
const BRACES = [
  'M 22 4 C 8 4, 14 26, 4 30 C 14 34, 8 56, 22 56',
  'M 46 4 C 60 4, 54 26, 64 30 C 54 34, 60 56, 46 56',
];

export function HeroArtifacts() {
  return (
    <chakra.div
      aria-hidden="true"
      position="absolute"
      inset="0"
      pointerEvents="none"
      display={{ base: 'none', md: 'block' }}
    >
      <Artifact
        viewBox="0 0 40 40"
        paths={SPARKLE}
        delay={0.9}
        top="14%"
        right="6%"
        boxSize="10"
        color="fg.highlight"
      />
      <Artifact
        viewBox="0 0 100 40"
        paths={SQUIGGLE}
        delay={1.1}
        top="18%"
        left="4%"
        width="24"
        height="10"
        color="fg"
      />
      <Artifact
        viewBox="0 0 68 60"
        paths={BRACES}
        delay={1.3}
        top="46%"
        left="0"
        width="16"
        height="14"
        color="fg"
        transform="rotate(-12deg)"
      />
      <Artifact
        viewBox="0 0 120 100"
        paths={CURVED_ARROW}
        delay={1.5}
        bottom="2%"
        left="10%"
        width="32"
        height="28"
        color="fg.highlight"
      />
      <Artifact
        viewBox="0 0 120 100"
        paths={LOOPED_ARROW}
        delay={1.7}
        bottom="0"
        right="10%"
        width="32"
        height="28"
        color="fg"
      />
    </chakra.div>
  );
}
