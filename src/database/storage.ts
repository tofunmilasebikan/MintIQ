import AsyncStorage from '@react-native-async-storage/async-storage';
import { Expense, ExpenseInput, Goal, GoalInput } from '../types';
import { dedupeExpenses, isDuplicateExpense } from '../utils/expenseDedupe';

const STORAGE_KEY = '@mintiq/data';

interface StoredData {
  expenses: Expense[];
  goals: Goal[];
  settings: Record<string, string>;
  nextExpenseId: number;
  nextGoalId: number;
}

const defaultData = (): StoredData => ({
  expenses: [],
  goals: [],
  settings: {},
  nextExpenseId: 1,
  nextGoalId: 1,
});

async function load(): Promise<StoredData> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultData();
  try {
    return { ...defaultData(), ...JSON.parse(raw) };
  } catch {
    return defaultData();
  }
}

async function save(data: StoredData): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export async function initStorage(): Promise<void> {
  const data = await load();
  if (!data.settings.hasSeeded) {
    await save(data);
  }
}

export async function getSetting(key: string): Promise<string | null> {
  const data = await load();
  return data.settings[key] ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const data = await load();
  data.settings[key] = value;
  await save(data);
}

export async function getAllExpenses(): Promise<Expense[]> {
  const data = await load();
  return [...data.expenses].sort((a, b) => {
    const d = b.date.localeCompare(a.date);
    return d !== 0 ? d : b.id - a.id;
  });
}

export async function getExpensesByDateRange(start: string, end: string): Promise<Expense[]> {
  const expenses = await getAllExpenses();
  return expenses.filter((e) => e.date >= start && e.date <= end);
}

export async function insertExpense(expense: ExpenseInput): Promise<number> {
  const data = await load();
  const id = data.nextExpenseId++;
  data.expenses.push({
    id,
    ...expense,
    createdAt: new Date().toISOString(),
  });
  await save(data);
  return id;
}

export async function insertExpensesBatch(expenses: ExpenseInput[]): Promise<number> {
  const data = await load();
  let added = 0;
  for (const expense of expenses) {
    if (isDuplicateExpense(expense, data.expenses)) continue;
    const id = data.nextExpenseId++;
    data.expenses.push({
      id,
      ...expense,
      createdAt: new Date().toISOString(),
    });
    added++;
  }
  await save(data);
  return added;
}

/** Remove duplicate transactions (same date, amount, merchant). */
export async function dedupeStoredExpenses(): Promise<number> {
  const data = await load();
  const before = data.expenses.length;
  data.expenses = dedupeExpenses(data.expenses);
  const removed = before - data.expenses.length;
  if (removed > 0) await save(data);
  return removed;
}

export async function deleteExpense(id: number): Promise<void> {
  const data = await load();
  data.expenses = data.expenses.filter((e) => e.id !== id);
  await save(data);
}

export async function updateExpense(id: number, updates: Partial<ExpenseInput>): Promise<void> {
  const data = await load();
  const idx = data.expenses.findIndex((e) => e.id === id);
  if (idx < 0) return;
  data.expenses[idx] = { ...data.expenses[idx], ...updates };
  await save(data);
}

export async function getAllGoals(): Promise<Goal[]> {
  const data = await load();
  return [...data.goals].sort((a, b) => {
    const m = b.month.localeCompare(a.month);
    return m !== 0 ? m : b.id - a.id;
  });
}

export async function getActiveGoals(month?: string): Promise<Goal[]> {
  const goals = await getAllGoals();
  const active = goals.filter((g) => g.status === 'active');
  if (month) return active.filter((g) => g.month === month);
  return active;
}

export async function insertGoal(goal: GoalInput): Promise<number> {
  const data = await load();
  const id = data.nextGoalId++;
  data.goals.push({
    id,
    ...goal,
    createdAt: new Date().toISOString(),
  });
  await save(data);
  return id;
}

export async function updateGoal(id: number, updates: Partial<GoalInput>): Promise<void> {
  const data = await load();
  const idx = data.goals.findIndex((g) => g.id === id);
  if (idx < 0) return;
  data.goals[idx] = { ...data.goals[idx], ...updates };
  await save(data);
}

export async function deleteGoal(id: number): Promise<void> {
  const data = await load();
  data.goals = data.goals.filter((g) => g.id !== id);
  await save(data);
}
