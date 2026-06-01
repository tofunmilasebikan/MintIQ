import { Goal, Expense, Category } from '../types';
import { getMonthRange, sumExpenses } from './analytics';

export function computeGoalProgress(goal: Goal, monthExpenses: Expense[]): number {
  if (goal.goalType === 'reduce_spending' && goal.category) {
    const { start, end } = getMonthRange(goal.month);
    const categoryTotal = monthExpenses
      .filter((e) => e.category === goal.category && e.date >= start && e.date <= end)
      .reduce((s, e) => s + e.amount, 0);
    // For reduce goals, progress = how much under target (target is max allowed spend)
    const remaining = Math.max(0, goal.targetAmount - categoryTotal);
    return Math.min(goal.targetAmount, remaining + goal.currentAmount);
  }

  if (goal.goalType === 'savings' && goal.linkSavingsTransactions) {
    const { start, end } = getMonthRange(goal.month);
    const savingsTotal = monthExpenses
      .filter((e) => e.category === 'Savings' && e.date >= start && e.date <= end)
      .reduce((s, e) => s + e.amount, 0);
    return goal.currentAmount + savingsTotal;
  }

  return goal.currentAmount;
}

export function getGoalProgressPercent(goal: Goal, monthExpenses: Expense[]): number {
  const progress = computeGoalProgress(goal, monthExpenses);
  if (goal.targetAmount <= 0) return 0;
  return Math.min(100, (progress / goal.targetAmount) * 100);
}

export function isGoalCompleted(goal: Goal, monthExpenses: Expense[]): boolean {
  if (goal.goalType === 'reduce_spending' && goal.category) {
    const { start, end } = getMonthRange(goal.month);
    const categoryTotal = monthExpenses
      .filter((e) => e.category === goal.category && e.date >= start && e.date <= end)
      .reduce((s, e) => s + e.amount, 0);
    return categoryTotal <= goal.targetAmount;
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

export function getDefaultCategoryForGoalType(type: Goal['goalType']): Category | null {
  switch (type) {
    case 'savings':
      return 'Savings';
    case 'reduce_spending':
      return 'Shopping';
    case 'debt':
      return 'Debt';
  }
}
