import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Goal, Expense } from '../types';
import { Card } from './Card';
import { formatCurrency } from '../utils/format';
import {
  getGoalProgressPercent,
  getGoalTypeLabel,
  computeGoalProgress,
  getGoalCategorySpent,
} from '../utils/goalProgress';
import { colors, fonts, spacing, typography, radius } from '../constants/theme';

interface GoalCardProps {
  goal: Goal;
  expenses: Expense[];
  selectionMode?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
}

export function GoalCard({
  goal,
  expenses,
  selectionMode,
  selected,
  onToggleSelect,
}: GoalCardProps) {
  const progress = computeGoalProgress(goal, expenses);
  const pct = getGoalProgressPercent(goal, expenses);
  const isReduce = goal.goalType === 'reduce_spending';
  const spent = isReduce ? getGoalCategorySpent(goal, expenses) : progress;

  const progressLabel = isReduce
    ? `${formatCurrency(spent)} of ${formatCurrency(goal.targetAmount)} spent`
    : `${formatCurrency(progress)} of ${formatCurrency(goal.targetAmount)}`;

  const content = (
    <Card
      variant="mist"
      style={StyleSheet.flatten([
        styles.card,
        selectionMode && selected ? styles.cardSelected : undefined,
      ])}
    >
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          {selectionMode ? (
            <Ionicons
              name={selected ? 'checkbox' : 'square-outline'}
              size={22}
              color={selected ? colors.signal : colors.textMuted}
              style={styles.checkbox}
            />
          ) : null}
          <View style={styles.titleText}>
            <Text style={styles.name}>{goal.name}</Text>
            <Text style={styles.type}>
              {getGoalTypeLabel(goal.goalType)} · {goal.month}
            </Text>
          </View>
        </View>
        <View style={[styles.badge, goal.status === 'completed' && styles.badgeDone]}>
          <Text style={styles.badgeText}>{goal.status}</Text>
        </View>
      </View>
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${Math.min(pct, 100)}%` }]} />
      </View>
      <Text style={styles.progressText}>
        {progressLabel} · {pct.toFixed(0)}%
      </Text>
    </Card>
  );

  if (selectionMode && onToggleSelect) {
    return (
      <TouchableOpacity onPress={onToggleSelect} activeOpacity={0.85}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  cardSelected: {
    borderWidth: 1,
    borderColor: colors.signal,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleWrap: { flexDirection: 'row', alignItems: 'flex-start', flex: 1 },
  checkbox: { marginRight: spacing.sm, marginTop: 2 },
  titleText: { flex: 1 },
  name: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  type: { ...typography.caption, marginTop: 2 },
  badge: {
    backgroundColor: colors.signalSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    marginLeft: spacing.sm,
  },
  badgeDone: { backgroundColor: 'rgba(46, 230, 166, 0.28)' },
  badgeText: {
    ...typography.label,
    color: colors.signal,
    textTransform: 'capitalize',
  },
  progressBg: {
    height: 6,
    backgroundColor: colors.surfaceGhost,
    borderRadius: radius.full,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.signal,
    borderRadius: radius.full,
  },
  progressText: { ...typography.caption, marginTop: spacing.sm },
});
