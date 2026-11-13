'use client';

import { useJsonFormatter } from '../format/useJsonFormatter';
import { JSON_PRETTY_SAMPLE } from '../jsonShared';

export function useJsonMinifyScreen() {
  const formatter = useJsonFormatter('', JSON_PRETTY_SAMPLE);

  return { formatter };
}
