import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { CategoryPicker } from '../components/CategoryPicker';
import { ImportReviewItem } from '../types';
import { Category } from '../types';
import { getImportSummary } from '../utils/csvImport';
import { formatCurrency } from '../utils/format';
import { colors, spacing, typography, radius } from '../constants/theme';
import { RootStackParamList } from '../navigation/types';

export function ImportReviewScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ImportReview'>>();
  const { addExpensesBatch } = useApp();
  const [items, setItems] = useState<ImportReviewItem[]>(route.params.items);
  const [loading, setLoading] = useState(false);

  const summary = getImportSummary(items);

  const updateItem = (id: string, updates: Partial<ImportReviewItem>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));
  };

  const handleConfirm = async () => {
    const toImport = items.filter((i) => i.isValid && i.action === 'keep');
    if (toImport.length === 0) {
      Alert.alert('Nothing to Import', 'No valid transactions selected.');
      return;
    }
    setLoading(true);
    try {
      await addExpensesBatch(
        toImport.map((i) => ({
          amount: i.amount!,
          category: i.category!,
          date: i.date!,
          merchant: i.merchant,
          note: i.note,
        }))
      );
      Alert.alert('Import Complete', `${toImport.length} transactions imported.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Import Failed', 'Could not save transactions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.charcoal} />
        </TouchableOpacity>
        <Text style={styles.title}>Review Import</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.summaryRow}>
        <SummaryBadge label="Valid" count={summary.valid} color={colors.success} />
        <SummaryBadge label="Invalid" count={summary.invalid} color={colors.error} />
        <SummaryBadge label="Duplicates" count={summary.duplicates} color={colors.warning} />
        <SummaryBadge label="Inferred" count={summary.inferred} color={colors.mintDark} />
      </View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {items.map((item) => (
          <Card key={item.id} style={StyleSheet.flatten([styles.item, !item.isValid && styles.itemInvalid])}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemMerchant}>{item.merchant || 'Unknown'}</Text>
              <Text style={styles.itemAmount}>
                {item.amount != null ? formatCurrency(item.amount) : '—'}
              </Text>
            </View>
            <Text style={styles.itemMeta}>
              {item.date || 'No date'} · Row {item.rowIndex}
              {item.inferredCategory ? ' · Auto-categorized' : ''}
            </Text>
            {item.errors.length > 0 ? (
              <Text style={styles.errorText}>{item.errors.join(', ')}</Text>
            ) : null}
            {item.isDuplicate ? (
              <View style={styles.dupBanner}>
                <Ionicons name="warning-outline" size={16} color={colors.warning} />
                <Text style={styles.dupText}>Potential duplicate</Text>
                <TouchableOpacity
                  onPress={() => updateItem(item.id, { action: item.action === 'keep' ? 'skip' : 'keep' })}
                >
                  <Text style={styles.dupAction}>
                    {item.action === 'keep' ? 'Skip' : 'Keep'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}
            {item.isValid ? (
              <>
                <Text style={styles.catLabel}>Category</Text>
                <CategoryPicker
                  selected={item.category ?? 'Other'}
                  onSelect={(cat: Category) => updateItem(item.id, { category: cat })}
                />
              </>
            ) : null}
          </Card>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button title={`Confirm Import (${summary.valid})`} onPress={handleConfirm} loading={loading} />
      </View>
    </View>
  );
}

function SummaryBadge({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <Text style={[styles.badgeCount, { color }]}>{count}</Text>
      <Text style={styles.badgeLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  title: { ...typography.heading },
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  badge: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    backgroundColor: colors.white,
  },
  badgeCount: { fontSize: 18, fontWeight: '700' },
  badgeLabel: { ...typography.label, fontSize: 10 },
  list: { flex: 1, paddingHorizontal: spacing.md },
  item: { marginBottom: spacing.sm },
  itemInvalid: { opacity: 0.7, borderColor: colors.error },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  itemMerchant: { ...typography.subheading, fontSize: 15 },
  itemAmount: { ...typography.subheading, color: colors.mintDark },
  itemMeta: { ...typography.caption, marginTop: 4 },
  errorText: { ...typography.caption, color: colors.error, marginTop: 4 },
  dupBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '20',
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  dupText: { ...typography.caption, flex: 1, color: colors.charcoal },
  dupAction: { ...typography.caption, color: colors.mintDark, fontWeight: '600' },
  catLabel: { ...typography.label, marginTop: spacing.sm, textTransform: 'uppercase' },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
});
