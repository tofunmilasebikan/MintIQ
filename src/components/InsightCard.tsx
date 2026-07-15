import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Insight } from '../utils/insights';
import { colors, spacing, typography, radius } from '../constants/theme';

const ICONS: Record<Insight['type'], keyof typeof Ionicons.glyphMap> = {
  category: 'pie-chart-outline',
  trend: 'trending-up-outline',
  pattern: 'calendar-outline',
  forecast: 'analytics-outline',
};

interface InsightCardProps {
  insight: Insight;
}

export function InsightCard({ insight }: InsightCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.iconWrap}>
          <Ionicons name={ICONS[insight.type]} size={18} color={colors.signal} />
        </View>
        <Text style={styles.text}>{insight.text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceMist,
    borderRadius: radius.lg,
    borderLeftWidth: 2,
    borderLeftColor: colors.signal,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.signalSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm + 4,
  },
  text: {
    ...typography.body,
    flex: 1,
    lineHeight: 22,
    color: colors.textSecondary,
  },
});
