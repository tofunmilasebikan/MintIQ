import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import * as SQLite from 'expo-sqlite';
import { getDatabase } from '../database';
import { Expense, Goal } from '../types';
import {
  getAllExpenses,
  getAllGoals,
  insertExpense,
  deleteExpense,
  insertGoal,
  updateGoal,
  deleteGoal,
  insertExpensesBatch,
} from '../database/db';
import { ExpenseInput, GoalInput } from '../types';

interface AppContextValue {
  db: SQLite.SQLiteDatabase | null;
  ready: boolean;
  expenses: Expense[];
  goals: Goal[];
  refresh: () => Promise<void>;
  addExpense: (expense: ExpenseInput) => Promise<void>;
  removeExpense: (id: number) => Promise<void>;
  addExpensesBatch: (items: ExpenseInput[]) => Promise<void>;
  addGoal: (goal: GoalInput) => Promise<void>;
  editGoal: (id: number, updates: Partial<GoalInput>) => Promise<void>;
  removeGoal: (id: number) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [ready, setReady] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  const refresh = useCallback(async () => {
    if (!db) return;
    const [e, g] = await Promise.all([getAllExpenses(db), getAllGoals(db)]);
    setExpenses(e);
    setGoals(g);
  }, [db]);

  useEffect(() => {
    getDatabase().then(async (database) => {
      setDb(database);
      const [e, g] = await Promise.all([
        getAllExpenses(database),
        getAllGoals(database),
      ]);
      setExpenses(e);
      setGoals(g);
      setReady(true);
    });
  }, []);

  const addExpense = async (expense: ExpenseInput) => {
    if (!db) return;
    await insertExpense(db, expense);
    await refresh();
  };

  const removeExpense = async (id: number) => {
    if (!db) return;
    await deleteExpense(db, id);
    await refresh();
  };

  const addExpensesBatch = async (items: ExpenseInput[]) => {
    if (!db) return;
    await insertExpensesBatch(db, items);
    await refresh();
  };

  const addGoal = async (goal: GoalInput) => {
    if (!db) return;
    await insertGoal(db, goal);
    await refresh();
  };

  const editGoal = async (id: number, updates: Partial<GoalInput>) => {
    if (!db) return;
    await updateGoal(db, id, updates);
    await refresh();
  };

  const removeGoal = async (id: number) => {
    if (!db) return;
    await deleteGoal(db, id);
    await refresh();
  };

  return (
    <AppContext.Provider
      value={{
        db,
        ready,
        expenses,
        goals,
        refresh,
        addExpense,
        removeExpense,
        addExpensesBatch,
        addGoal,
        editGoal,
        removeGoal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
