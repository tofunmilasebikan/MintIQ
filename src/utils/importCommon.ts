import { Category, ImportReviewItem, ParsedCSVRow } from '../types';
import { inferCategory, normalizeCategory } from './autoCategory';

export function cleanAmount(raw: string | undefined): number | null {
  if (!raw?.trim()) return null;
  let cleaned = raw.replace(/[$,\s]/g, '').trim();
  if (cleaned.startsWith('(') && cleaned.endsWith(')')) {
    cleaned = '-' + cleaned.slice(1, -1);
  }
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : Math.abs(num);
}

export function cleanDate(raw: string | undefined): string | null {
  if (!raw?.trim()) return null;
  const trimmed = raw.trim();
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }
  const parts = trimmed.split(/[\/\-]/);
  if (parts.length === 3) {
    let [a, b, c] = parts.map((p) => parseInt(p, 10));
    if (c < 100) c += 2000;
    if (a > 31) {
      return `${a}-${String(b).padStart(2, '0')}-${String(c).padStart(2, '0')}`;
    }
    return `${c}-${String(a).padStart(2, '0')}-${String(b).padStart(2, '0')}`;
  }
  return null;
}

export function categorizeImportRow(
  merchant: string | null,
  rawCategory: string | null
): { category: Category; inferredCategory: boolean } {
  let category: Category | null = normalizeCategory(rawCategory);
  let inferredCategory = false;
  if (!category && merchant) {
    category = inferCategory(merchant);
    inferredCategory = !!category;
  }
  if (!category) category = 'Other';
  return { category, inferredCategory };
}

export function buildImportReviewItems(parsed: ParsedCSVRow[]): ImportReviewItem[] {
  const reviewItems: ImportReviewItem[] = parsed.map((row, idx) => ({
    ...row,
    id: `import-${idx}`,
    isDuplicate: false,
    action: row.isValid ? 'keep' : 'skip',
  }));

  for (let i = 0; i < reviewItems.length; i++) {
    for (let j = 0; j < i; j++) {
      const a = reviewItems[i];
      const b = reviewItems[j];
      if (!a.isValid || !b.isValid) continue;
      if (
        a.amount === b.amount &&
        a.merchant?.toLowerCase() === b.merchant?.toLowerCase() &&
        a.date &&
        b.date &&
        Math.abs(new Date(a.date).getTime() - new Date(b.date).getTime()) <= 86400000 * 2
      ) {
        a.isDuplicate = true;
        a.duplicateOfIndex = j;
      }
    }
  }

  return reviewItems;
}
