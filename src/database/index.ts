import {
  initStorage,
  getSetting,
  setSetting,
  insertExpensesBatch,
  insertGoal,
  dedupeStoredExpenses,
} from './storage';
import { generateSampleExpenses, generateSampleGoals } from '../data/sampleExpenses';

let initialized = false;

export async function initializeAppStorage(): Promise<void> {
  if (initialized) return;
  await initStorage();
  await seedIfNeeded();
  await runMaintenance();
  initialized = true;
}

async function runMaintenance(): Promise<void> {
  const deduped = await getSetting('dedupeV1');
  if (deduped === 'true') return;
  await dedupeStoredExpenses();
  await setSetting('dedupeV1', 'true');
}

async function seedIfNeeded(): Promise<void> {
  const seeded = await getSetting('hasSeeded');
  if (seeded === 'true') return;

  const expenses = generateSampleExpenses();
  await insertExpensesBatch(expenses);

  const goals = generateSampleGoals();
  for (const goal of goals) {
    await insertGoal(goal);
  }

  await setSetting('hasSeeded', 'true');
}

export * from './storage';
