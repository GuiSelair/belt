import type { EngineDefinition, EngineId } from '../types';
import { clickhouse } from './clickhouse';
import { mongodb } from './mongodb';
import { mysql } from './mysql';
import { oracle } from './oracle';
import { postgresql } from './postgresql';
import { redis } from './redis';
import { sqlserver } from './sqlserver';

export const engines: readonly EngineDefinition[] = [
  postgresql,
  mysql,
  mongodb,
  redis,
  oracle,
  clickhouse,
  sqlserver,
];

const enginesById = new Map(engines.map((engine) => [engine.id, engine]));

export function getEngine(id: EngineId): EngineDefinition {
  return enginesById.get(id)!;
}
