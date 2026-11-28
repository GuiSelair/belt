'use client';

import { useId, type ReactNode } from 'react';
import { chakra, type SystemStyleObject } from '@chakra-ui/react';

type ChalkStrokeVariant = 'contour' | 'detail' | 'guide';

const STROKE_STYLES: Record<
  ChalkStrokeVariant,
  { strokeWidth: number; opacity: number }
> = {
  contour: { strokeWidth: 2.6, opacity: 0.72 },
  detail: { strokeWidth: 1.75, opacity: 0.5 },
  guide: { strokeWidth: 1.25, opacity: 0.3 },
};

interface ChalkPathProps {
  d: string;
  variant?: ChalkStrokeVariant;
  dashed?: boolean;
  delay?: string;
  duration?: string;
}

export function ChalkPath({
  d,
  variant = 'contour',
  dashed = false,
  delay = '0.15s',
  duration = '0.9s',
}: ChalkPathProps) {
  const { strokeWidth, opacity } = STROKE_STYLES[variant];

  if (dashed) {
    return (
      <chakra.path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="5 6"
        opacity={opacity}
      />
    );
  }

  return (
    <chakra.path
      d={d}
      pathLength={1}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray="1"
      opacity={opacity}
      animation={`draw ${duration} ease-out ${delay} both`}
      _motionReduce={{ animation: 'none' }}
    />
  );
}

interface ChalkIllustrationProps {
  name: string;
  viewBox: string;
  seed: number;
  css?: SystemStyleObject;
  children: ReactNode;
}

export function ChalkIllustration({
  name,
  viewBox,
  seed,
  css,
  children,
}: ChalkIllustrationProps) {
  const rawId = useId();
  const filterId = `chalk-${name}-${rawId.replace(/:/g, '')}`;

  return (
    <chakra.svg
      aria-hidden="true"
      focusable="false"
      data-chalk-illustration={name}
      viewBox={viewBox}
      position="absolute"
      color="fg"
      pointerEvents="none"
      userSelect="none"
      overflow="visible"
      display={{ base: 'none', lg: 'block' }}
      css={css}
    >
      <defs>
        <filter id={filterId} x="-12%" y="-12%" width="124%" height="124%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.045"
            numOctaves={2}
            seed={seed}
            result="wobble"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="wobble"
            scale={2.1}
            xChannelSelector="R"
            yChannelSelector="G"
            result="roughened"
          />
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves={3}
            seed={seed + 11}
            result="grain"
          />
          <feColorMatrix
            in="grain"
            type="matrix"
            values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0.52"
            result="chalkMask"
          />
          <feComposite in="roughened" in2="chalkMask" operator="in" />
        </filter>
      </defs>
      <g filter={`url(#${filterId})`}>{children}</g>
    </chakra.svg>
  );
}
