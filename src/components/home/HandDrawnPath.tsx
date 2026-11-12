'use client';

import { chakra } from '@chakra-ui/react';

interface HandDrawnPathProps {
  d: string;
  delay?: string;
  duration?: string;
}

export function HandDrawnPath({
  d,
  delay = '0s',
  duration = '0.8s',
}: HandDrawnPathProps) {
  return (
    <chakra.path
      d={d}
      pathLength={1}
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
      strokeDasharray="1"
      animation={`draw ${duration} ease-out ${delay} both`}
      _motionReduce={{ animation: 'none' }}
    />
  );
}
