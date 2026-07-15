import { Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { arrayBufferFromBase64 } from './pdfImport';

const IMPORT_ACCEPT_WEB = '.csv,.pdf,text/csv,application/pdf';
const IMPORT_MIME_TYPES = [
  'text/csv',
  'text/comma-separated-values',
  'application/csv',
  'application/pdf',
];

export type ImportFile =
  | { type: 'csv'; content: string }
  | { type: 'pdf'; bytes: ArrayBuffer };

function isPdfFile(name: string, mimeType?: string | null): boolean {
  const lower = name.toLowerCase();
  return lower.endsWith('.pdf') || (mimeType?.includes('pdf') ?? false);
}

function isCsvFile(name: string, mimeType?: string | null): boolean {
  const lower = name.toLowerCase();
  return lower.endsWith('.csv') || (mimeType?.includes('csv') ?? false);
}

/** Pick a CSV or PDF file for import */
export async function pickImportFile(): Promise<ImportFile | null> {
  if (Platform.OS === 'web') {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = IMPORT_ACCEPT_WEB;
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) {
          resolve(null);
          return;
        }
        if (isPdfFile(file.name, file.type)) {
          resolve({ type: 'pdf', bytes: await file.arrayBuffer() });
          return;
        }
        resolve({ type: 'csv', content: await file.text() });
      };
      input.click();
    });
  }

  const result = await DocumentPicker.getDocumentAsync({
    type: [...IMPORT_MIME_TYPES, 'application/octet-stream'],
    copyToCacheDirectory: true,
  });
  if (result.canceled || !result.assets?.[0]) return null;

  const asset = result.assets[0];
  const name = asset.name ?? asset.uri;
  const mimeType = asset.mimeType ?? null;

  if (isPdfFile(name, mimeType)) {
    const base64 = await FileSystem.readAsStringAsync(asset.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return { type: 'pdf', bytes: arrayBufferFromBase64(base64) };
  }

  if (isCsvFile(name, mimeType) || !isPdfFile(name, mimeType)) {
    return { type: 'csv', content: await FileSystem.readAsStringAsync(asset.uri) };
  }

  return null;
}

/** @deprecated Use pickImportFile */
export async function pickAndReadCSV(): Promise<string | null> {
  const file = await pickImportFile();
  if (!file || file.type !== 'csv') return null;
  return file.content;
}

/** Download CSV on web; share on native */
export async function exportCSV(filename: string, content: string): Promise<void> {
  if (Platform.OS === 'web') {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    return;
  }

  const path = `${FileSystem.cacheDirectory}${filename}`;
  await FileSystem.writeAsStringAsync(path, content);
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(path, { mimeType: 'text/csv', dialogTitle: 'Export Expenses' });
  }
}
