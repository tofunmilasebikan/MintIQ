import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { format, subMonths } from 'date-fns';
import { useApp } from '../context/AppContext';
import { ScreenHeader } from '../components/ScreenHeader';
import { Card } from '../components/Card';
import { InsightCard } from '../components/InsightCard';
import { ScoreRing } from '../components/ScoreRing';
import {
  getMonthRange,
  sumExpenses,
  calculateProjectedMonthlySpend,
  calculateMintIQScore,
} from '../utils/analytics';
import { generateInsights, getScoreExplanation } from '../utils/insights';
import { formatCurrency } from '../utils/format';
import { colors, spacing, typography } from '../constants/theme';

export function InsightsScreen() {
  const { expenses, goals } = useApp();
  const now = new Date();
  const monthRange = getMonthRange();
  const prevMonthKey = format(subMonths(now, 1), 'yyyy-MM');
  const prevMonthRange = getMonthRange(prevMonthKey);

  const { insights, score, projected, monthTotal } = useMemo(() => {
    const monthExpenses = expenses.filter(
      (e) => e.date >= monthRange.start && e.date <= monthRange.end
    );
    const prevExpenses = expenses.filter(
      (e) => e.date >= prevMonthRange.start && e.date <= prevMonthRange.end
    );
    const scoreBreakdown = calculateMintIQScore(monthExpenses, prevExpenses, goals, now);
    return {
      insights: generateInsights(monthExpenses, prevExpenses, now),
      score: scoreBreakdown,
      projected: calculateProjectedMonthlySpend(monthExpenses, now),
      monthTotal: sumExpenses(monthExpenses),
    };
  }, [expenses, goals, monthRange, prevMonthRange]);

  const scoreLines = getScoreExplanation(score);

  return (
    <View style={styles.container}>
      <ScreenHeader title="Insights" subtitle="Smart spending patterns" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card style={styles.forecastCard} accent>
          <Text style={styles.forecastLabel}>Projected Monthly Spending</Text>
          <Text style={styles.forecastValue}>{formatCurrency(projected)}</Text>
          <Text style={styles.forecastSub}>
            Based on {formatCurrency(monthTotal)} spent so far this month
          </Text>
        </Card>

        <Text style={styles.sectionTitle}>Your Insights</Text>
        {insights.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}

        <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>MintIQ Score Breakdown</Text>
        <Card>
          <View style={styles.scoreRow}>
            <ScoreRing score={score.total} size={80} />
            <View style={styles.scoreDetails}>
              {scoreLines.map((line, i) => (
                <Text key={i} style={styles.scoreLine}>{line}</Text>
              ))}
            </View>
          </View>
        </Card>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  scroll: { paddingHorizontal: spacing.md },
  forecastCard: { marginBottom: spacing.lg },
  forecastLabel: { ...typography.label, textTransform: 'uppercase' },
  forecastValue: { fontSize: 32, fontWeight: '700', color: colors.charcoal, marginVertical: spacing.xs },
  forecastSub: { ...typography.caption },
  sectionTitle: { ...typography.subheading, marginBottom: spacing.md },
  scoreRow: { flexDirection: 'row', alignItems: 'flex-start' },
  scoreDetails: { flex: 1, marginLeft: spacing.md },
  scoreLine: { ...typography.caption, lineHeight: 20, marginBottom: spacing.sm },
});
