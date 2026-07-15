import { Expense, ExpenseInput } from '../types';

export function expenseFingerprint(
  date: string,
  amount: number,
  merchant: string | null
): string {
  return `${date}|${amount.toFixed(2)}|${(merchant || '').toLowerCase().trim()}`;
}

export function isDuplicateExpense(
  candidate: ExpenseInput,
  existing: Expense[]
): boolean {
  const fp = expenseFingerprint(candidate.date, candidate.amount, candidate.merchant);
  return existing.some(
    (e) => expenseFingerprint(e.date, e.amount, e.merchant) === fp
  );
}

/** Keep earliest row per date + amount + merchant. */
export function dedupeExpenses(expenses: Expense[]): Expense[] {
  const seen = new Set<string>();
  const sorted = [...expenses].sort((a, b) => a.id - b.id);
  const result: Expense[] = [];
  for (const e of sorted) {
    const fp = expenseFingerprint(e.date, e.amount, e.merchant);
    if (seen.has(fp)) continue;
    seen.add(fp);
    result.push(e);
  }
  return result;
}
