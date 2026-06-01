import { Expense } from '../types';

export function expensesToCSV(expenses: Expense[]): string {
  const header = 'Date,Merchant,Category,Amount,Note';
  const rows = expenses
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((e) => {
      const escape = (s: string | null) => {
        if (!s) return '';
        if (s.includes(',') || s.includes('"') || s.includes('\n')) {
          return `"${s.replace(/"/g, '""')}"`;
        }
        return s;
      };
      return [e.date, escape(e.merchant), e.category, e.amount.toFixed(2), escape(e.note)].join(',');
    });
  return [header, ...rows].join('\n');
}
