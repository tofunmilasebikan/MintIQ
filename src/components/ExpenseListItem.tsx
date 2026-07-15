import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Expense } from '../types';
import { formatCurrency, formatDate } from '../utils/format';
import { CATEGORY_ICONS, CATEGORY_COLORS } from '../constants/categories';
import { confirmAction } from '../utils/confirm';
import { colors, fonts, spacing, typography, radius } from '../constants/theme';

interface ExpenseListItemProps {
  expense: Expense;
  onDelete?: (id: number) => void;
}

export function ExpenseListItem({ expense, onDelete }: ExpenseListItemProps) {
  const icon = CATEGORY_ICONS[expense.category];
  const catColor = CATEGORY_COLORS[expense.category];

  const handleDelete = () => {
    confirmAction('Delete Expense', 'Remove this transaction?', () => {
      onDelete?.(expense.id);
    });
  };

  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: catColor + '22' }]}>
        <Ionicons name={icon} size={18} color={catColor} />
      </View>
      <View style={styles.content}>
        <Text style={styles.merchant}>{expense.merchant || expense.category}</Text>
        <Text style={styles.meta}>
          {expense.category} · {formatDate(expense.date)}
        </Text>
        {expense.note ? (
          <Text style={styles.note} numberOfLines={1}>
            {expense.note}
          </Text>
        ) : null}
      </View>
      <Text style={styles.amount}>{formatCurrency(expense.amount)}</Text>
      {onDelete ? (
        <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn} hitSlop={8}>
          <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm + 4,
  },
  content: { flex: 1 },
  merchant: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  meta: {
    ...typography.caption,
    marginTop: 2,
  },
  note: {
    ...typography.caption,
    fontStyle: 'italic',
    marginTop: 2,
    color: colors.textMuted,
  },
  amount: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 15,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  deleteBtn: { padding: spacing.xs },
});
