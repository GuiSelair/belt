'use client';

import { useState } from 'react';

import { toIndentUnit, type IndentOption } from '@/lib/indentation';

import { useJsonFormatter } from '../format/useJsonFormatter';

export function useJsonBeautifyScreen() {
  const [indent, setIndent] = useState<IndentOption>('2');
  const formatter = useJsonFormatter(toIndentUnit(indent));

  return { indent, setIndent, formatter };
}
