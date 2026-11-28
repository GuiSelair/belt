import { describe, expect, it } from 'vitest';

import { sqlDialects } from '../lib/dialects';
import { validateSql } from '../lib/validateSql';
import { sqlExamples } from './sqlExamples';

const cases = sqlDialects.flatMap(({ id, label }) =>
  sqlExamples[id].map((example) => ({ dialect: id, label, ...example })),
);

describe('sqlExamples', () => {
  it('has a simple, a complex and an invalid example per dialect', () => {
    sqlDialects.forEach(({ id }) => {
      expect(sqlExamples[id].map(({ kind }) => kind)).toEqual([
        'simple',
        'complex',
        'invalid',
      ]);
    });
  });

  it.each(cases)(
    '$label $kind example has the expected result',
    async ({ dialect, kind, sql }) => {
      const result = await validateSql({ text: sql, dialect });

      expect(result.ok).toBe(kind !== 'invalid');
    },
  );
});
