import { format, subDays, subMonths } from 'date-fns';
import { ExpenseInput, GoalInput } from '../types';
import { getMonthKey } from '../utils/format';

function randomBetween(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

export function generateSampleExpenses(): ExpenseInput[] {
  const expenses: ExpenseInput[] = [];
  const now = new Date();

  const samples: { merchant: string; category: ExpenseInput['category']; min: number; max: number }[] = [
    { merchant: 'Starbucks', category: 'Food', min: 4, max: 12 },
    { merchant: 'Chipotle', category: 'Food', min: 10, max: 18 },
    { merchant: 'Whole Foods', category: 'Food', min: 25, max: 85 },
    { merchant: 'Uber', category: 'Transportation', min: 8, max: 32 },
    { merchant: 'Shell Gas', category: 'Transportation', min: 35, max: 65 },
    { merchant: 'Lyft', category: 'Transportation', min: 10, max: 28 },
    { merchant: 'Amazon', category: 'Shopping', min: 15, max: 120 },
    { merchant: 'Target', category: 'Shopping', min: 20, max: 95 },
    { merchant: 'Netflix', category: 'Entertainment', min: 15.99, max: 15.99 },
    { merchant: 'Spotify', category: 'Entertainment', min: 10.99, max: 10.99 },
    { merchant: 'Electric Company', category: 'Bills', min: 85, max: 145 },
    { merchant: 'Comcast', category: 'Bills', min: 79, max: 89 },
    { merchant: 'CVS Pharmacy', category: 'Health', min: 12, max: 45 },
    { merchant: 'Planet Fitness', category: 'Health', min: 24.99, max: 24.99 },
    { merchant: 'Rent Payment', category: 'Rent/Housing', min: 1200, max: 1200 },
    { merchant: 'Savings Transfer', category: 'Savings', min: 100, max: 300 },
    { merchant: 'Student Loan', category: 'Debt', min: 250, max: 250 },
    { merchant: 'Udemy Course', category: 'Education', min: 15, max: 49 },
  ];

  for (let dayOffset = 0; dayOffset < 45; dayOffset++) {
    const date = format(subDays(now, dayOffset), 'yyyy-MM-dd');
    const numTx = dayOffset % 7 === 0 || dayOffset % 6 === 0 ? 2 : 1;
    for (let t = 0; t < numTx; t++) {
      const sample = samples[Math.floor(Math.random() * samples.length)];
      expenses.push({
        amount: randomBetween(sample.min, sample.max),
        category: sample.category,
        date,
        merchant: sample.merchant,
        note: null,
      });
    }
  }

  // Ensure current month has rent
  expenses.push({
    amount: 1200,
    category: 'Rent/Housing',
    date: format(subDays(now, 3), 'yyyy-MM-dd'),
    merchant: 'Rent Payment',
    note: 'Monthly rent',
  });

  return expenses;
}

export function generateSampleGoals(): GoalInput[] {
  const month = getMonthKey();
  const prevMonth = format(subMonths(new Date(), 1), 'yyyy-MM');

  return [
    {
      name: 'Trip Fund',
      targetAmount: 500,
      currentAmount: 275,
      goalType: 'savings',
      category: 'Savings',
      month,
      status: 'active',
      recurrence: 'fixed',
      linkSavingsTransactions: true,
    },
    {
      name: 'Reduce Shopping',
      targetAmount: 200,
      currentAmount: 0,
      goalType: 'reduce_spending',
      category: 'Shopping',
      month,
      status: 'active',
      recurrence: 'monthly',
      linkSavingsTransactions: false,
    },
    {
      name: 'Emergency Fund',
      targetAmount: 1000,
      currentAmount: 420,
      goalType: 'savings',
      category: 'Savings',
      month,
      status: 'active',
      recurrence: 'fixed',
      linkSavingsTransactions: false,
    },
    {
      name: 'Pay Off Credit Card',
      targetAmount: 300,
      currentAmount: 150,
      goalType: 'debt',
      category: 'Debt',
      month: prevMonth,
      status: 'carried_over',
      recurrence: 'monthly',
      linkSavingsTransactions: false,
    },
  ];
}
