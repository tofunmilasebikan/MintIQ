import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Insight } from '../utils/insights';
import { Card } from './Card';
import { colors, spacing, typography } from '../constants/theme';

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
    <Card style={styles.card}>
      <View style={styles.row}>
        <View style={styles.iconWrap}>
          <Ionicons name={ICONS[insight.type]} size={20} color={colors.mintDark} />
        </View>
        <Text style={styles.text}>{insight.text}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.mintLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm + 4,
  },
  text: { ...typography.body, flex: 1, lineHeight: 22 },
});
