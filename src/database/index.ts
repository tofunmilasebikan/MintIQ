import * as SQLite from 'expo-sqlite';
import {
  initDatabase,
  getSetting,
  setSetting,
  insertExpensesBatch,
  insertGoal,
} from './db';
import { generateSampleExpenses, generateSampleGoals } from '../data/sampleExpenses';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) return dbInstance;
  dbInstance = await SQLite.openDatabaseAsync('mintiq.db');
  await initDatabase(dbInstance);
  await seedIfNeeded(dbInstance);
  return dbInstance;
}

async function seedIfNeeded(db: SQLite.SQLiteDatabase): Promise<void> {
  const seeded = await getSetting(db, 'hasSeeded');
  if (seeded === 'true') return;

  const expenses = generateSampleExpenses();
  await insertExpensesBatch(db, expenses);

  const goals = generateSampleGoals();
  for (const goal of goals) {
    await insertGoal(db, goal);
  }

  await setSetting(db, 'hasSeeded', 'true');
}

export function closeDatabase(): void {
  dbInstance = null;
}
