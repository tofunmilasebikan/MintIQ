import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { initializeAppStorage } from '../database';
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
} from '../database/storage';
import { ExpenseInput, GoalInput } from '../types';

interface AppContextValue {
  ready: boolean;
  expenses: Expense[];
  goals: Goal[];
  refresh: () => Promise<void>;
  addExpense: (expense: ExpenseInput) => Promise<void>;
  removeExpense: (id: number) => Promise<void>;
  addExpensesBatch: (items: ExpenseInput[]) => Promise<number>;
  addGoal: (goal: GoalInput) => Promise<void>;
  editGoal: (id: number, updates: Partial<GoalInput>) => Promise<void>;
  removeGoal: (id: number) => Promise<void>;
  removeGoals: (ids: number[]) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  const refresh = useCallback(async () => {
    const [e, g] = await Promise.all([getAllExpenses(), getAllGoals()]);
    setExpenses(e);
    setGoals(g);
  }, []);

  useEffect(() => {
    initializeAppStorage().then(async () => {
      await refresh();
      setReady(true);
    });
  }, [refresh]);

  const addExpense = async (expense: ExpenseInput) => {
    await insertExpense(expense);
    await refresh();
  };

  const removeExpense = async (id: number) => {
    await deleteExpense(id);
    await refresh();
  };

  const addExpensesBatch = async (items: ExpenseInput[]) => {
    const added = await insertExpensesBatch(items);
    await refresh();
    return added;
  };

  const addGoal = async (goal: GoalInput) => {
    await insertGoal(goal);
    await refresh();
  };

  const editGoal = async (id: number, updates: Partial<GoalInput>) => {
    await updateGoal(id, updates);
    await refresh();
  };

  const removeGoal = async (id: number) => {
    await deleteGoal(id);
    await refresh();
  };

  const removeGoals = async (ids: number[]) => {
    for (const id of ids) {
      await deleteGoal(id);
    }
    await refresh();
  };

  return (
    <AppContext.Provider
      value={{
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
        removeGoals,
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
