import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Goal, Expense } from '../types';
import { Card } from './Card';
import { formatCurrency } from '../utils/format';
import { getGoalProgressPercent, getGoalTypeLabel, computeGoalProgress } from '../utils/goalProgress';
import { colors, spacing, typography, radius } from '../constants/theme';

interface GoalCardProps {
  goal: Goal;
  expenses: Expense[];
}

export function GoalCard({ goal, expenses }: GoalCardProps) {
  const progress = computeGoalProgress(goal, expenses);
  const pct = getGoalProgressPercent(goal, expenses);
  const isReduce = goal.goalType === 'reduce_spending';

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.name}>{goal.name}</Text>
          <Text style={styles.type}>{getGoalTypeLabel(goal.goalType)} · {goal.month}</Text>
        </View>
        <View style={[styles.badge, goal.status === 'completed' && styles.badgeDone]}>
          <Text style={styles.badgeText}>{goal.status}</Text>
        </View>
      </View>
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${Math.min(pct, 100)}%` }]} />
      </View>
      <Text style={styles.progressText}>
        {isReduce
          ? `${formatCurrency(progress)} under ${formatCurrency(goal.targetAmount)} limit`
          : `${formatCurrency(progress)} of ${formatCurrency(goal.targetAmount)}`}
        {' · '}{pct.toFixed(0)}%
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  name: { ...typography.subheading },
  type: { ...typography.caption, marginTop: 2 },
  badge: {
    backgroundColor: colors.mintLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  badgeDone: { backgroundColor: colors.success + '30' },
  badgeText: { ...typography.label, color: colors.mintDark, textTransform: 'capitalize' },
  progressBg: {
    height: 8,
    backgroundColor: colors.creamDark,
    borderRadius: radius.full,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.mintDark,
    borderRadius: radius.full,
  },
  progressText: { ...typography.caption, marginTop: spacing.sm },
});
