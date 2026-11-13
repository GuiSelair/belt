'use client';

import { chakra } from '@chakra-ui/react';

interface HandDrawnPathProps {
  d: string;
  delay?: string;
  duration?: string;
  strokeWidth?: number;
}

export function HandDrawnPath({
  d,
  delay = '0s',
  duration = '0.8s',
  strokeWidth = 3,
}: HandDrawnPathProps) {
  return (
    <chakra.path
      d={d}
      pathLength={1}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
      strokeDasharray="1"
      animation={`draw ${duration} ease-out ${delay} both`}
      _motionReduce={{ animation: 'none' }}
    />
  );
}
