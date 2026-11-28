'use client';

import { chakra } from '@chakra-ui/react';

export function UtilityBelt() {
  return (
    <chakra.svg
      aria-hidden="true"
      focusable="false"
      data-utility-belt=""
      viewBox="0 0 400 86"
      position="absolute"
      left="50%"
      bottom={{ base: '-0.04em', md: '-0.03em' }}
      transform="translateX(-50%)"
      width={{ base: '2.08em', md: '2.04em' }}
      height="auto"
      overflow="visible"
      pointerEvents="none"
      zIndex="1"
    >
      <chakra.path
        d="M18 26 C106 44 294 44 382 26 L378 43 C290 61 110 61 22 43 Z"
        fill="navy.950"
      />
      <chakra.path
        d="M22 28 C112 43 288 43 378 28"
        fill="none"
        stroke="navy.700"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <chakra.path
        d="M76 38 L122 43 L118 68 Q97 76 76 66 Z"
        fill="navy.900"
        stroke="brand.green"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <chakra.path
        d="M324 38 L278 43 L282 68 Q303 76 324 66 Z"
        fill="navy.900"
        stroke="brand.green"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <chakra.rect
        x="165"
        y="34"
        width="70"
        height="45"
        rx="9"
        fill="brand.green"
        stroke="navy.950"
        strokeWidth="6"
      />
      <chakra.path
        d="M184 53 L200 43 L216 53 L210 68 H190 Z"
        fill="brand.blue"
      />
    </chakra.svg>
  );
}
