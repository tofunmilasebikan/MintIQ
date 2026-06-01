import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
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
import { colors, spacing, typography } from '../constants/theme';
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
      const path = `${FileSystem.cacheDirectory}mintiq-expenses.csv`;
      await FileSystem.writeAsStringAsync(path, csv);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(path, { mimeType: 'text/csv', dialogTitle: 'Export Expenses' });
      } else {
        Alert.alert('Export Ready', 'Sharing is not available on this device.');
      }
    } catch {
      Alert.alert('Export Failed', 'Could not export CSV file.');
    }
  };

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values', 'application/csv'],
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.[0]) return;
      const content = await FileSystem.readAsStringAsync(result.assets[0].uri);
      const items = parseCSVContent(content);
      if (items.length === 0) {
        Alert.alert('Import Failed', 'No valid rows found in CSV.');
        return;
      }
      navigation.navigate('ImportReview', { items });
    } catch {
      Alert.alert('Import Failed', 'Could not read CSV file.');
    }
  };

  const headerRight = (
    <View style={styles.actions}>
      <TouchableOpacity style={styles.actionBtn} onPress={handleImport}>
        <Ionicons name="cloud-upload-outline" size={22} color={colors.mintDark} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionBtn} onPress={handleExport}>
        <Ionicons name="share-outline" size={22} color={colors.mintDark} />
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
          <Ionicons name="information-circle-outline" size={16} color={colors.charcoalLight} />
          <Text style={styles.importHintText}>Import & export CSV from the icons above</Text>
        </View>
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <ExpenseListItem expense={item} onDelete={removeExpense} />
          )}
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
  container: { flex: 1, backgroundColor: colors.cream },
  content: { flex: 1, paddingHorizontal: spacing.md },
  actions: { flexDirection: 'row', gap: spacing.sm },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  importHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  importHintText: { ...typography.caption },
});
