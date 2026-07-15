import { Goal, Expense } from '../types';
import { getMonthRange } from './analytics';

/** Category spending for the goal's month (reduce-spending goals). */
export function getGoalCategorySpent(goal: Goal, monthExpenses: Expense[]): number {
  if (!goal.category) return 0;
  const { start, end } = getMonthRange(goal.month);
  return monthExpenses
    .filter((e) => e.category === goal.category && e.date >= start && e.date <= end)
    .reduce((s, e) => s + e.amount, 0);
}

/** Linked Savings transactions for the goal's month only. */
export function getLinkedSavingsTotal(goal: Goal, monthExpenses: Expense[]): number {
  const { start, end } = getMonthRange(goal.month);
  return monthExpenses
    .filter((e) => e.category === 'Savings' && e.date >= start && e.date <= end)
    .reduce((s, e) => s + e.amount, 0);
}

export function computeGoalProgress(goal: Goal, monthExpenses: Expense[]): number {
  if (goal.goalType === 'reduce_spending' && goal.category) {
    return getGoalCategorySpent(goal, monthExpenses);
  }

  if (goal.goalType === 'savings' && goal.linkSavingsTransactions) {
    const linked = getLinkedSavingsTotal(goal, monthExpenses);
    return Math.min(goal.targetAmount, goal.currentAmount + linked);
  }

  return Math.min(goal.targetAmount, goal.currentAmount);
}

export function getGoalProgressPercent(goal: Goal, monthExpenses: Expense[]): number {
  if (goal.targetAmount <= 0) return 0;

  if (goal.goalType === 'reduce_spending') {
    const spent = getGoalCategorySpent(goal, monthExpenses);
    return Math.min(100, (spent / goal.targetAmount) * 100);
  }

  const progress = computeGoalProgress(goal, monthExpenses);
  return Math.min(100, (progress / goal.targetAmount) * 100);
}

export function isGoalCompleted(goal: Goal, monthExpenses: Expense[]): boolean {
  if (goal.goalType === 'reduce_spending' && goal.category) {
    return getGoalCategorySpent(goal, monthExpenses) <= goal.targetAmount;
  }
  return computeGoalProgress(goal, monthExpenses) >= goal.targetAmount;
}

export function getGoalTypeLabel(type: Goal['goalType']): string {
  switch (type) {
    case 'savings':
      return 'Savings';
    case 'reduce_spending':
      return 'Reduce Spending';
    case 'debt':
      return 'Debt Payoff';
  }
}

export function getDefaultCategoryForGoalType(type: Goal['goalType']) {
  switch (type) {
    case 'savings':
      return 'Savings' as const;
    case 'reduce_spending':
      return 'Shopping' as const;
    case 'debt':
      return 'Debt' as const;
  }
}
