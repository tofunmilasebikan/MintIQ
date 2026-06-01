import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  parseISO,
  subMonths,
  getDaysInMonth,
  getDate,
} from 'date-fns';
import { Expense, Goal, MintIQScoreBreakdown } from '../types';

export function getMonthRange(monthKey?: string): { start: string; end: string } {
  const base = monthKey ? parseISO(`${monthKey}-01`) : new Date();
  return {
    start: format(startOfMonth(base), 'yyyy-MM-dd'),
    end: format(endOfMonth(base), 'yyyy-MM-dd'),
  };
}

export function getWeekRange(): { start: string; end: string } {
  const now = new Date();
  return {
    start: format(startOfWeek(now, { weekStartsOn: 0 }), 'yyyy-MM-dd'),
    end: format(endOfWeek(now, { weekStartsOn: 0 }), 'yyyy-MM-dd'),
  };
}

export function sumExpenses(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

export function groupByCategory(expenses: Expense[]): Record<string, number> {
  return expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amount;
    return acc;
  }, {});
}

export function getTopCategory(expenses: Expense[]): { category: string; amount: number } | null {
  const grouped = groupByCategory(expenses);
  const entries = Object.entries(grouped);
  if (entries.length === 0) return null;
  const [category, amount] = entries.sort((a, b) => b[1] - a[1])[0];
  return { category, amount };
}

/** Projected monthly spend based on current pace */
export function calculateProjectedMonthlySpend(monthExpenses: Expense[], referenceDate = new Date()): number {
  const monthTotal = sumExpenses(monthExpenses);
  const dayOfMonth = getDate(referenceDate);
  if (dayOfMonth === 0) return 0;
  const avgDaily = monthTotal / dayOfMonth;
  return avgDaily * getDaysInMonth(referenceDate);
}

/** Daily totals for stability scoring (current month, up to today) */
export function getDailyTotals(expenses: Expense[]): number[] {
  const { start, end } = getMonthRange();
  const days = eachDayOfInterval({ start: parseISO(start), end: parseISO(end) });
  const totals = days.map((day) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    return expenses.filter((e) => e.date === dayStr).reduce((s, e) => s + e.amount, 0);
  });
  return totals.slice(0, getDate(new Date()));
}

function stdDev(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

export function calculateMintIQScore(
  monthExpenses: Expense[],
  prevMonthExpenses: Expense[],
  goals: Goal[],
  referenceDate = new Date()
): MintIQScoreBreakdown {
  const activeGoals = goals.filter((g) => g.status === 'active');

  // Goal Progress (25 pts): average completion of active goals
  let goalProgress = 12;
  if (activeGoals.length > 0) {
    const avgCompletion =
      activeGoals.reduce((s, g) => s + Math.min(g.currentAmount / g.targetAmount, 1), 0) /
      activeGoals.length;
    goalProgress = Math.round(avgCompletion * 25);
  }

  // Spending Stability (25 pts): lower daily variance = higher score
  const dailyTotals = getDailyTotals(monthExpenses);
  const activeDays = dailyTotals.slice(0, getDate(referenceDate));
  let spendingStability = 15;
  if (activeDays.length >= 3) {
    const sd = stdDev(activeDays);
    const mean = activeDays.reduce((a, b) => a + b, 0) / activeDays.length || 1;
    const cv = sd / mean;
    spendingStability = Math.round(Math.max(0, Math.min(25, 25 - cv * 15)));
  }

  // Savings Behavior (25 pts): savings tx + savings goal progress
  const monthTotal = sumExpenses(monthExpenses);
  const savingsSpend = monthExpenses
    .filter((e) => e.category === 'Savings')
    .reduce((s, e) => s + e.amount, 0);
  const savingsGoals = activeGoals.filter((g) => g.goalType === 'savings');
  let savingsScore = 0;
  if (monthTotal > 0) {
    savingsScore += Math.min(12, (savingsSpend / monthTotal) * 50);
  }
  if (savingsGoals.length > 0) {
    const avgSav =
      savingsGoals.reduce((s, g) => s + Math.min(g.currentAmount / g.targetAmount, 1), 0) /
      savingsGoals.length;
    savingsScore += avgSav * 13;
  } else if (savingsSpend > 0) {
    savingsScore += 10;
  } else {
    savingsScore = 10;
  }
  const savingsBehavior = Math.round(Math.min(25, savingsScore));

  // Trend Direction (25 pts): compare pace to previous month
  const currentDay = getDate(referenceDate);
  const daysInMonth = getDaysInMonth(referenceDate);
  const currentPace = sumExpenses(monthExpenses) / Math.max(currentDay, 1);
  const prevMonthKey = format(subMonths(referenceDate, 1), 'yyyy-MM');
  const prevTotal = sumExpenses(prevMonthExpenses);
  const prevPace = prevTotal / daysInMonth;
  let trendDirection = 15;
  if (prevPace > 0) {
    const ratio = currentPace / prevPace;
    if (ratio <= 0.95) trendDirection = 25;
    else if (ratio <= 1.05) trendDirection = 20;
    else if (ratio <= 1.15) trendDirection = 14;
    else if (ratio <= 1.25) trendDirection = 8;
    else trendDirection = 4;
  }

  const total = Math.min(100, goalProgress + spendingStability + savingsBehavior + trendDirection);
  return { total, goalProgress, spendingStability, savingsBehavior, trendDirection };
}

export function getWeeklyTrend(expenses: Expense[], weeks = 4): { label: string; value: number }[] {
  const result: { label: string; value: number }[] = [];
  const now = new Date();
  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = startOfWeek(subMonths(now, 0), { weekStartsOn: 0 });
    weekStart.setDate(weekStart.getDate() - i * 7);
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 });
    const total = expenses
      .filter((e) => {
        const d = parseISO(e.date);
        return d >= weekStart && d <= weekEnd;
      })
      .reduce((s, e) => s + e.amount, 0);
    result.push({ label: format(weekStart, 'MMM d'), value: Math.round(total) });
  }
  return result;
}

export function getSpendingOverTime(expenses: Expense[], days = 14): { label: string; value: number }[] {
  const now = new Date();
  const result: { label: string; value: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dayStr = format(d, 'yyyy-MM-dd');
    const total = expenses.filter((e) => e.date === dayStr).reduce((s, e) => s + e.amount, 0);
    result.push({ label: format(d, 'MMM d'), value: Math.round(total) });
  }
  return result;
}
