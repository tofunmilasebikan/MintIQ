import { format, subMonths, getDate, getDaysInMonth } from 'date-fns';
import { Expense } from '../types';
import { sumExpenses, groupByCategory, calculateProjectedMonthlySpend } from './analytics';
import { formatCurrency, formatPercent } from './format';

export interface Insight {
  id: string;
  text: string;
  type: 'category' | 'trend' | 'pattern' | 'forecast';
}

export function generateInsights(
  monthExpenses: Expense[],
  prevMonthExpenses: Expense[],
  referenceDate = new Date()
): Insight[] {
  const insights: Insight[] = [];
  const monthTotal = sumExpenses(monthExpenses);
  const prevTotal = sumExpenses(prevMonthExpenses);

  if (monthTotal === 0) {
    insights.push({
      id: 'no-data',
      text: 'Add expenses or import a CSV to unlock personalized spending insights.',
      type: 'pattern',
    });
    return insights;
  }

  const grouped = groupByCategory(monthExpenses);
  const topEntry = Object.entries(grouped).sort((a, b) => b[1] - a[1])[0];
  if (topEntry) {
    const pct = (topEntry[1] / monthTotal) * 100;
    insights.push({
      id: 'top-category',
      text: `${topEntry[0]} accounted for ${formatPercent(pct)} of your spending this month.`,
      type: 'category',
    });
  }

  const prevGrouped = groupByCategory(prevMonthExpenses);
  for (const [cat, amount] of Object.entries(grouped)) {
    const prev = prevGrouped[cat] ?? 0;
    if (prev > 0 && amount > prev) {
      const change = ((amount - prev) / prev) * 100;
      if (change >= 5) {
        insights.push({
          id: `trend-${cat}`,
          text: `${cat} spending increased by ${formatPercent(change)} compared to last month.`,
          type: 'trend',
        });
      }
    } else if (prev > 0 && amount < prev) {
      const change = ((prev - amount) / prev) * 100;
      if (change >= 5) {
        insights.push({
          id: `trend-down-${cat}`,
          text: `${cat} spending decreased by ${formatPercent(change)} compared to last month.`,
          type: 'trend',
        });
      }
    }
  }

  const weekendSpend = monthExpenses
    .filter((e) => {
      const day = new Date(e.date + 'T12:00:00').getDay();
      return day === 0 || day === 6;
    })
    .reduce((s, e) => s + e.amount, 0);
  const weekdaySpend = monthTotal - weekendSpend;
  const weekendDays = 8;
  const weekdayDays = getDate(referenceDate) - weekendDays;
  if (weekdayDays > 0 && weekendSpend / weekendDays > weekdaySpend / weekdayDays * 1.2) {
    insights.push({
      id: 'weekend',
      text: 'Most of your spending happened on weekends.',
      type: 'pattern',
    });
  }

  const projected = calculateProjectedMonthlySpend(monthExpenses, referenceDate);
  insights.push({
    id: 'forecast',
    text: `At your current pace, you may spend ${formatCurrency(projected)} by the end of the month.`,
    type: 'forecast',
  });

  if (prevTotal > 0) {
    const currentPace = monthTotal / getDate(referenceDate);
    const prevPace = prevTotal / getDaysInMonth(subMonths(referenceDate, 1));
    const diff = ((currentPace - prevPace) / prevPace) * 100;
    if (Math.abs(diff) >= 5) {
      const direction = diff > 0 ? 'higher' : 'lower';
      insights.push({
        id: 'pace',
        text: `Your daily spending pace is ${formatPercent(Math.abs(diff))} ${direction} than last month.`,
        type: 'trend',
      });
    }
  }

  const monthName = format(referenceDate, 'MMMM');
  insights.push({
    id: 'summary',
    text: `You've recorded ${formatCurrency(monthTotal)} in spending for ${monthName} so far.`,
    type: 'pattern',
  });

  return insights.slice(0, 8);
}

export function getScoreExplanation(breakdown: {
  goalProgress: number;
  spendingStability: number;
  savingsBehavior: number;
  trendDirection: number;
}): string[] {
  return [
    `Goal Progress (${breakdown.goalProgress}/25): Based on how close you are to your active financial goals.`,
    `Spending Stability (${breakdown.spendingStability}/25): Reflects how consistent your daily spending has been.`,
    `Savings Behavior (${breakdown.savingsBehavior}/25): Considers savings transactions and progress toward savings goals.`,
    `Trend Direction (${breakdown.trendDirection}/25): Compares this month's spending pace to last month.`,
  ];
}
