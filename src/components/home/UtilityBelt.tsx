'use client';

import { chakra } from '@chakra-ui/react';

export function UtilityBelt() {
  return (
    <chakra.svg
      aria-hidden="true"
      focusable="false"
      data-utility-belt=""
      data-belt-variant="option-b-full"
      viewBox="0 0 400 92"
      position="absolute"
      left="50%"
      bottom="-0.05em"
      transform="translateX(-50%)"
      width="2.08em"
      height="auto"
      overflow="visible"
      pointerEvents="none"
      zIndex="1"
    >
      <chakra.path
        d="M16 20 C104 42 296 42 384 20 L380 48 C292 70 108 70 20 48 Z"
        fill="navy.950"
      />
      <chakra.path
        d="M21 25 C111 47 289 47 379 25"
        fill="none"
        stroke="navy.700"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <chakra.path
        d="M70 43 L126 50 L121 80 Q97 90 72 77 Z"
        fill="navy.900"
        stroke="brand.green"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <chakra.path
        d="M330 43 L274 50 L279 80 Q303 90 328 77 Z"
        fill="navy.900"
        stroke="brand.green"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <chakra.rect
        x="158"
        y="38"
        width="84"
        height="52"
        rx="11"
        fill="brand.green"
        stroke="navy.950"
        strokeWidth="7"
      />
      <chakra.path
        d="M181 59 L200 47 L219 59 L212 77 H188 Z"
        fill="brand.blue"
      />
    </chakra.svg>
  );
}
