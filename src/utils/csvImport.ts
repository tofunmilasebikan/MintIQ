import { Category, ParsedCSVRow, ImportReviewItem } from '../types';
import { inferCategory, normalizeCategory } from './autoCategory';
import {
  buildImportReviewItems,
  cleanAmount,
  cleanDate,
} from './importCommon';

const DATE_COLUMNS = ['date', 'transaction date', 'posted date', 'trans date', 'transaction_date'];
const AMOUNT_COLUMNS = ['amount', 'cost', 'debit', 'credit', 'transaction amount', 'value'];
const MERCHANT_COLUMNS = ['description', 'merchant', 'name', 'payee', 'memo description'];
const CATEGORY_COLUMNS = ['category', 'type', 'transaction type'];
const NOTE_COLUMNS = ['notes', 'note', 'memo', 'reference'];

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function findColumnIndex(headers: string[], candidates: string[]): number {
  const normalized = headers.map((h) => h.toLowerCase().trim());
  for (const candidate of candidates) {
    const idx = normalized.indexOf(candidate);
    if (idx >= 0) return idx;
  }
  for (let i = 0; i < normalized.length; i++) {
    if (candidates.some((c) => normalized[i].includes(c))) return i;
  }
  return -1;
}

export function parseCSVContent(content: string): ImportReviewItem[] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  const dateIdx = findColumnIndex(headers, DATE_COLUMNS);
  const amountIdx = findColumnIndex(headers, AMOUNT_COLUMNS);
  const merchantIdx = findColumnIndex(headers, MERCHANT_COLUMNS);
  const categoryIdx = findColumnIndex(headers, CATEGORY_COLUMNS);
  const noteIdx = findColumnIndex(headers, NOTE_COLUMNS);

  const parsed: ParsedCSVRow[] = lines.slice(1).map((line, i) => {
    const cols = parseCSVLine(line);
    const errors: string[] = [];
    const date = dateIdx >= 0 ? cleanDate(cols[dateIdx]) : null;
    const amount = amountIdx >= 0 ? cleanAmount(cols[amountIdx]) : null;
    const merchant = merchantIdx >= 0 ? cols[merchantIdx]?.trim() || null : null;
    const rawCategory = categoryIdx >= 0 ? cols[categoryIdx]?.trim() : null;
    const note = noteIdx >= 0 ? cols[noteIdx]?.trim() || null : null;

    let category: Category | null = normalizeCategory(rawCategory);
    let inferredCategory = false;
    if (!category && merchant) {
      category = inferCategory(merchant);
      inferredCategory = !!category;
    }
    if (!category) category = 'Other';

    if (!date) errors.push('Invalid or missing date');
    if (amount === null || amount <= 0) errors.push('Invalid or missing amount');

    return {
      rowIndex: i + 2,
      date,
      amount,
      merchant,
      category,
      note,
      isValid: errors.length === 0,
      errors,
      inferredCategory,
    };
  });

  return buildImportReviewItems(parsed);
}

export function getImportSummary(items: ImportReviewItem[]) {
  return {
    valid: items.filter((i) => i.isValid && i.action === 'keep').length,
    invalid: items.filter((i) => !i.isValid).length,
    duplicates: items.filter((i) => i.isDuplicate).length,
    inferred: items.filter((i) => i.inferredCategory).length,
  };
}
