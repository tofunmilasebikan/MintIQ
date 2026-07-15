import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import { ImportReviewItem, ParsedCSVRow } from '../types';
import {
  buildImportReviewItems,
  categorizeImportRow,
  cleanAmount,
  cleanDate,
} from './importCommon';

export const PDF_READ_ERROR =
  'MintIQ could not read this PDF. Please upload a text-based PDF or CSV file.';

export class PdfImportError extends Error {
  constructor(message: string = PDF_READ_ERROR) {
    super(message);
    this.name = 'PdfImportError';
  }
}

const DATE_PATTERNS = [
  /\b(\d{1,2}\/\d{1,2}\/\d{2,4})\b/,
  /\b(\d{4}-\d{2}-\d{2})\b/,
  /\b([A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4})\b/,
];

const AMOUNT_PATTERN = /(-?\$?\s*[\d,]+\.\d{2}|\(\$?[\d,]+\.\d{2}\))\s*$/;
const SKIP_LINE = /^(date|transaction|description|amount|balance|posted|debit|credit|page\s+\d|statement|account)/i;

let workerReady = false;

function ensurePdfWorker(): void {
  if (workerReady) return;
  GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${'6.0.227'}/build/pdf.worker.min.mjs`;
  workerReady = true;
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

export function arrayBufferFromBase64(base64: string): ArrayBuffer {
  if (typeof atob === 'function') return base64ToArrayBuffer(base64);
  // React Native fallback
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let str = base64.replace(/[^A-Za-z0-9+/=]/g, '');
  let output = '';
  for (let i = 0; i < str.length; i += 4) {
    const enc1 = chars.indexOf(str[i]);
    const enc2 = chars.indexOf(str[i + 1]);
    const enc3 = chars.indexOf(str[i + 2]);
    const enc4 = chars.indexOf(str[i + 3]);
    output += String.fromCharCode((enc1 << 2) | (enc2 >> 4));
    if (enc3 !== 64) output += String.fromCharCode(((enc2 & 15) << 4) | (enc3 >> 2));
    if (enc4 !== 64) output += String.fromCharCode(((enc3 & 3) << 6) | enc4);
  }
  const bytes = new Uint8Array(output.length);
  for (let i = 0; i < output.length; i++) bytes[i] = output.charCodeAt(i);
  return bytes.buffer;
}

async function extractPdfText(bytes: ArrayBuffer): Promise<string> {
  ensurePdfWorker();
  const pdf = await getDocument({ data: new Uint8Array(bytes) }).promise;
  const pageTexts: string[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const lines = groupTextItemsIntoLines(content.items as PdfTextItem[]);
    pageTexts.push(...lines);
  }

  return pageTexts.join('\n').trim();
}

interface PdfTextItem {
  str?: string;
  transform?: number[];
}

function groupTextItemsIntoLines(items: PdfTextItem[]): string[] {
  const rows: { y: number; parts: string[] }[] = [];

  for (const item of items) {
    if (!item.str?.trim() || !item.transform) continue;
    const y = Math.round(item.transform[5]);
    const row = rows.find((r) => Math.abs(r.y - y) <= 4);
    if (row) row.parts.push(item.str.trim());
    else rows.push({ y, parts: [item.str.trim()] });
  }

  return rows
    .sort((a, b) => b.y - a.y)
    .map((r) => r.parts.join(' ').replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

function findDateInLine(line: string): { date: string | null; rest: string } {
  for (const pattern of DATE_PATTERNS) {
    const match = line.match(pattern);
    if (match) {
      const date = cleanDate(match[1]);
      const rest = line.replace(match[0], '').trim();
      return { date, rest };
    }
  }
  return { date: null, rest: line };
}

function parseTransactionLines(text: string): ParsedCSVRow[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const parsed: ParsedCSVRow[] = [];
  let rowIndex = 1;

  for (const line of lines) {
    if (line.length < 4 || SKIP_LINE.test(line)) continue;

    const amountMatch = line.match(AMOUNT_PATTERN);
    if (!amountMatch) continue;

    const amount = cleanAmount(amountMatch[1]);
    if (amount === null || amount <= 0) continue;

    const withoutAmount = line.replace(amountMatch[0], '').trim();
    const { date, rest } = findDateInLine(withoutAmount);
    const merchant = rest.replace(/[|\t]+/g, ' ').replace(/\s+/g, ' ').trim() || null;
    const { category, inferredCategory } = categorizeImportRow(merchant, null);

    const errors: string[] = [];
    if (!date) errors.push('Invalid or missing date');
    if (!merchant) errors.push('Missing description');

    parsed.push({
      rowIndex: rowIndex++,
      date,
      amount,
      merchant,
      category,
      note: null,
      isValid: errors.length === 0,
      errors,
      inferredCategory,
    });
  }

  return parsed;
}

export async function parsePDFImport(bytes: ArrayBuffer): Promise<ImportReviewItem[]> {
  let text: string;
  try {
    text = await extractPdfText(bytes);
  } catch {
    throw new PdfImportError();
  }

  if (!text || text.replace(/\s/g, '').length < 10) {
    throw new PdfImportError();
  }

  const rows = parseTransactionLines(text);
  if (rows.length === 0) {
    throw new PdfImportError();
  }

  return buildImportReviewItems(rows);
}
