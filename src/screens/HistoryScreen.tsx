import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import { ScreenHeader } from '../components/ScreenHeader';
import { SearchBar } from '../components/SearchBar';
import { FilterChips } from '../components/FilterChips';
import { ExpenseListItem } from '../components/ExpenseListItem';
import { EmptyState } from '../components/EmptyState';
import { CATEGORIES } from '../types';
import { expensesToCSV } from '../utils/csvExport';
import { parseCSVContent } from '../utils/csvImport';
import { PdfImportError, parsePDFImport } from '../utils/pdfImport';
import { exportCSV, pickImportFile } from '../utils/fileIO';
import { showAlert } from '../utils/confirm';
import { colors, fonts, spacing, radius } from '../constants/theme';
import { RootStackParamList } from '../navigation/types';

export function HistoryScreen() {
  const { expenses, removeExpense } = useApp();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      const matchSearch =
        !search ||
        e.merchant?.toLowerCase().includes(search.toLowerCase()) ||
        e.category.toLowerCase().includes(search.toLowerCase()) ||
        e.note?.toLowerCase().includes(search.toLowerCase());
      const matchCat = !categoryFilter || e.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [expenses, search, categoryFilter]);

  const handleExport = async () => {
    try {
      const csv = expensesToCSV(expenses);
      await exportCSV('mintiq-expenses.csv', csv);
      if (Platform.OS === 'web') {
        showAlert('Exported', 'Your CSV file has been downloaded.');
      }
    } catch {
      showAlert('Export Failed', 'Could not export CSV file.');
    }
  };

  const handleImport = async () => {
    try {
      const file = await pickImportFile();
      if (!file) return;

      const items =
        file.type === 'csv'
          ? parseCSVContent(file.content)
          : await parsePDFImport(file.bytes);

      if (items.length === 0) {
        showAlert(
          'Import Failed',
          file.type === 'csv'
            ? 'No valid rows found in CSV.'
            : 'MintIQ could not read this PDF. Please upload a text-based PDF or CSV file.'
        );
        return;
      }

      navigation.navigate('ImportReview', { items });
    } catch (error) {
      if (error instanceof PdfImportError) {
        showAlert('Import Failed', error.message);
        return;
      }
      showAlert('Import Failed', 'Could not read file.');
    }
  };

  const headerRight = (
    <View style={styles.actions}>
      <TouchableOpacity style={styles.actionBtn} onPress={handleImport} activeOpacity={0.85}>
        <Ionicons name="cloud-upload-outline" size={20} color={colors.signal} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionBtn} onPress={handleExport} activeOpacity={0.85}>
        <Ionicons name="share-outline" size={20} color={colors.signal} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="History"
        subtitle={`${expenses.length} transactions`}
        right={headerRight}
      />
      <View style={styles.content}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search expenses..." />
        <FilterChips
          options={[...CATEGORIES]}
          selected={categoryFilter}
          onSelect={setCategoryFilter}
        />
        <View style={styles.importHint}>
          <Ionicons name="information-circle-outline" size={14} color={colors.textMuted} />
          <Text style={styles.importHintText}>Import & export from the icons above</Text>
        </View>
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <ExpenseListItem expense={item} onDelete={removeExpense} />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState
              icon="receipt-outline"
              title="No expenses yet"
              message="Tap the + button to add an expense or import a CSV file."
            />
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surfaceInk },
  content: { flex: 1, paddingHorizontal: spacing.md },
  actions: { flexDirection: 'row', gap: spacing.sm },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.signalSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(46, 230, 166, 0.28)',
  },
  importHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  importHintText: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.textMuted,
  },
  list: { paddingBottom: 110 },
});
