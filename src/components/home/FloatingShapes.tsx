'use client';

import { useId } from 'react';
import type { ReactNode } from 'react';
import { Box } from '@chakra-ui/react';

interface ShapeProps {
  id: string;
}

interface FloatingItem {
  key: string;
  Shape: (props: ShapeProps) => ReactNode;
  width: string;
  position: Record<string, string>;
  rotate: string;
  distance: string;
  duration: string;
  delay: string;
}

function buildHelixPath(turns: number) {
  const steps = turns * 24;
  const points: string[] = [];

  for (let step = 0; step <= steps; step += 1) {
    const angle = (step / 24) * Math.PI * 2;
    const x = 60 + 38 * Math.cos(angle);
    const y = 34 + 16 * Math.sin(angle) + step * 1.4;
    points.push(`${x.toFixed(1)} ${y.toFixed(1)}`);
  }

  return `M ${points.join(' L ')}`;
}

const HELIX_PATH = buildHelixPath(3);

function Sphere({
  id,
  cx,
  cy,
  r,
  color,
}: ShapeProps & {
  cx: number;
  cy: number;
  r: number;
  color: string;
}) {
  return (
    <>
      <defs>
        <radialGradient id={id} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="25%" stopColor={color} />
          <stop offset="100%" stopColor="#0B0F3A" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill={`url(#${id})`} />
    </>
  );
}

function ShadowFilter({ id }: ShapeProps) {
  return (
    <filter id={id} x="-30%" y="-30%" width="160%" height="170%">
      <feDropShadow
        dx="0"
        dy="10"
        stdDeviation="8"
        floodColor="#000A4D"
        floodOpacity="0.45"
      />
    </filter>
  );
}

function WindowCard({ id }: ShapeProps) {
  return (
    <svg viewBox="0 0 200 150" width="100%" height="100%">
      <defs>
        <ShadowFilter id={`${id}-shadow`} />
        <linearGradient id={`${id}-face`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E8D9BD" />
          <stop offset="100%" stopColor="#BFAE8E" />
        </linearGradient>
        <linearGradient id={`${id}-pill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF6A4D" />
          <stop offset="100%" stopColor="#C8321F" />
        </linearGradient>
      </defs>
      <g filter={`url(#${id}-shadow)`}>
        <rect x="40" y="24" width="140" height="100" rx="4" fill="#F4F0FF" />
        <rect
          x="32"
          y="18"
          width="140"
          height="100"
          rx="4"
          fill={`url(#${id}-face)`}
        />
        <rect
          x="10"
          y="44"
          width="104"
          height="26"
          rx="13"
          fill={`url(#${id}-pill)`}
        />
        <rect
          x="18"
          y="47"
          width="88"
          height="6"
          rx="3"
          fill="#FFFFFF"
          opacity="0.3"
        />
        <rect x="56" y="88" width="90" height="6" rx="3" fill="#2E1A8C" />
      </g>
      <Sphere id={`${id}-dot-red`} cx={44} cy={32} r={6} color="#F2453D" />
      <Sphere id={`${id}-dot-yellow`} cx={60} cy={30} r={6} color="#F5B82E" />
      <Sphere id={`${id}-dot-green`} cx={76} cy={28} r={6} color="#2FBF5B" />
    </svg>
  );
}

function ToggleSwitch({ id }: ShapeProps) {
  return (
    <svg viewBox="0 0 200 110" width="100%" height="100%">
      <defs>
        <ShadowFilter id={`${id}-shadow`} />
        <linearGradient id={`${id}-shell`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F3EEDC" />
          <stop offset="100%" stopColor="#B9B394" />
        </linearGradient>
        <linearGradient id={`${id}-track`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#167A2E" />
          <stop offset="100%" stopColor="#36C25A" />
        </linearGradient>
        <radialGradient id={`${id}-knob`} cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#E9E5CF" />
          <stop offset="100%" stopColor="#9E9878" />
        </radialGradient>
      </defs>
      <g filter={`url(#${id}-shadow)`}>
        <rect
          x="10"
          y="10"
          width="180"
          height="86"
          rx="43"
          fill={`url(#${id}-shell)`}
        />
        <rect
          x="22"
          y="20"
          width="160"
          height="66"
          rx="33"
          fill={`url(#${id}-track)`}
        />
        <circle cx="56" cy="56" r="38" fill={`url(#${id}-knob)`} />
        <ellipse cx="46" cy="40" rx="16" ry="8" fill="#FFFFFF" opacity="0.35" />
      </g>
    </svg>
  );
}

function Spring({ id }: ShapeProps) {
  return (
    <svg viewBox="0 0 120 160" width="100%" height="100%">
      <defs>
        <ShadowFilter id={`${id}-shadow`} />
        <linearGradient id={`${id}-coil`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF8A8A" />
          <stop offset="60%" stopColor="#E8413C" />
          <stop offset="100%" stopColor="#A81E2A" />
        </linearGradient>
      </defs>
      <g filter={`url(#${id}-shadow)`} fill="none" strokeLinecap="round">
        <path d={HELIX_PATH} stroke={`url(#${id}-coil)`} strokeWidth="14" />
        <path
          d={HELIX_PATH}
          stroke="#FFFFFF"
          strokeWidth="3"
          opacity="0.35"
          transform="translate(-2 -4)"
        />
      </g>
    </svg>
  );
}

function PenTool({ id }: ShapeProps) {
  return (
    <svg viewBox="0 0 220 160" width="100%" height="100%">
      <defs>
        <ShadowFilter id={`${id}-shadow`} />
        <linearGradient id={`${id}-nib`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#D9C6CF" />
        </linearGradient>
      </defs>
      <g filter={`url(#${id}-shadow)`}>
        <g fill="none" stroke="#2FBF6B" strokeWidth="6" strokeLinecap="round">
          <path d="M 20 30 L 200 30" />
          <path d="M 26 120 C 50 50, 170 50, 194 120" />
        </g>
        <path
          d="M 110 50 L 134 88 L 120 112 L 100 112 L 86 88 Z"
          fill={`url(#${id}-nib)`}
        />
        <rect x="98" y="112" width="24" height="14" rx="2" fill="#E2482C" />
        <path d="M 110 50 L 110 86" stroke="#2A2FD4" strokeWidth="3" />
      </g>
      <Sphere id={`${id}-a`} cx={20} cy={30} r={8} color="#3038E6" />
      <Sphere id={`${id}-b`} cx={110} cy={30} r={8} color="#3038E6" />
      <Sphere id={`${id}-c`} cx={200} cy={30} r={8} color="#3038E6" />
      <Sphere id={`${id}-d`} cx={26} cy={120} r={8} color="#3038E6" />
      <Sphere id={`${id}-e`} cx={194} cy={120} r={8} color="#3038E6" />
    </svg>
  );
}

function Cursor({ id }: ShapeProps) {
  return (
    <svg viewBox="0 0 140 160" width="100%" height="100%">
      <defs>
        <ShadowFilter id={`${id}-shadow`} />
        <linearGradient id={`${id}-shaft`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FF7A55" />
          <stop offset="100%" stopColor="#C8321F" />
        </linearGradient>
      </defs>
      <g filter={`url(#${id}-shadow)`}>
        <path
          d="M 72 86 L 120 140 L 108 150 L 60 96 Z"
          fill={`url(#${id}-shaft)`}
        />
        <path d="M 14 10 L 60 110 L 72 76 Z" fill="#F0613F" />
        <path d="M 14 10 L 72 76 L 110 64 Z" fill="#D9442A" />
        <path d="M 60 110 L 72 76 L 110 64 Z" fill="#B8301E" />
      </g>
    </svg>
  );
}

const ITEMS: FloatingItem[] = [
  {
    key: 'window',
    Shape: WindowCard,
    width: '11rem',
    position: { top: '12%', left: '5%' },
    rotate: '-10deg',
    distance: '-14px',
    duration: '7s',
    delay: '0s',
  },
  {
    key: 'spring-left',
    Shape: Spring,
    width: '5.5rem',
    position: { bottom: '14%', left: '11%' },
    rotate: '-8deg',
    distance: '-18px',
    duration: '6s',
    delay: '-2s',
  },
  {
    key: 'pen',
    Shape: PenTool,
    width: '10rem',
    position: { top: '46%', left: '2%' },
    rotate: '6deg',
    distance: '-10px',
    duration: '8s',
    delay: '-4s',
  },
  {
    key: 'toggle',
    Shape: ToggleSwitch,
    width: '9rem',
    position: { top: '14%', right: '6%' },
    rotate: '-14deg',
    distance: '-16px',
    duration: '6.5s',
    delay: '-1s',
  },
  {
    key: 'spring-right',
    Shape: Spring,
    width: '4.5rem',
    position: { top: '46%', right: '4%' },
    rotate: '24deg',
    distance: '-12px',
    duration: '7.5s',
    delay: '-3s',
  },
  {
    key: 'cursor',
    Shape: Cursor,
    width: '6.5rem',
    position: { bottom: '12%', right: '11%' },
    rotate: '-6deg',
    distance: '-16px',
    duration: '6s',
    delay: '-5s',
  },
];

export function FloatingShapes() {
  const baseId = useId().replace(/:/g, '');

  return (
    <Box
      aria-hidden="true"
      position="absolute"
      inset="0"
      pointerEvents="none"
      display={{ base: 'none', xl: 'block' }}
    >
      {ITEMS.map(function renderItem({ key, Shape, ...item }) {
        return (
          <Box
            key={key}
            position="absolute"
            {...item.position}
            width={item.width}
            css={{
              '--float-rotate': item.rotate,
              '--float-distance': item.distance,
            }}
            transform="rotate(var(--float-rotate))"
            animation={`float ${item.duration} ease-in-out ${item.delay} infinite`}
            _motionReduce={{ animation: 'none' }}
          >
            <Shape id={`${baseId}-${key}`} />
          </Box>
        );
      })}
    </Box>
  );
}
