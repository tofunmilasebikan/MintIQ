import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { useApp } from '../context/AppContext';
import { InputField } from '../components/InputField';
import { CategoryPicker } from '../components/CategoryPicker';
import { Button } from '../components/Button';
import { Category } from '../types';
import { showAlert } from '../utils/confirm';
import { colors, fonts, spacing, typography, radius } from '../constants/theme';

interface AddExpenseScreenProps {
  onClose: () => void;
}

export function AddExpenseScreen({ onClose }: AddExpenseScreenProps) {
  const { addExpense } = useApp();
  const insets = useSafeAreaInsets();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('Food');
  const [merchant, setMerchant] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      showAlert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }
    setLoading(true);
    try {
      await addExpense({
        amount: parsed,
        category,
        date,
        merchant: merchant.trim() || null,
        note: note.trim() || null,
      });
      showAlert('Saved', 'Expense added successfully.', onClose);
    } catch {
      showAlert('Error', 'Could not save expense.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>New entry</Text>
          <Text style={styles.title}>Add Expense</Text>
        </View>
        <TouchableOpacity onPress={onClose} hitSlop={12} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <InputField
          label="Amount"
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          keyboardType="decimal-pad"
        />
        <Text style={styles.label}>Category</Text>
        <CategoryPicker selected={category} onSelect={setCategory} />
        <InputField
          label="Date (YYYY-MM-DD)"
          value={date}
          onChangeText={setDate}
          placeholder="2026-05-31"
        />
        <InputField
          label="Merchant (optional)"
          value={merchant}
          onChangeText={setMerchant}
          placeholder="Starbucks"
        />
        <InputField
          label="Note (optional)"
          value={note}
          onChangeText={setNote}
          placeholder="Morning coffee"
          multiline
        />
        <Button
          title="Save Expense"
          onPress={handleSave}
          loading={loading}
          style={{ marginTop: spacing.md }}
        />
        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surfaceInk },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  kicker: {
    ...typography.label,
    color: colors.signal,
    marginBottom: 2,
  },
  title: {
    fontFamily: fonts.sansBold,
    fontSize: 22,
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMist,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { padding: spacing.md },
  label: { ...typography.label, marginBottom: spacing.xs },
});
