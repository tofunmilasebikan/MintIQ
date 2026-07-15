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
import { colors, fonts, spacing, typography, radius } from '../constants/theme';

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
      <ScreenHeader title="Insights" subtitle="Patterns behind your signal" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.forecast}>
          <Text style={styles.kicker}>Projected monthly</Text>
          <Text style={styles.forecastValue}>{formatCurrency(projected)}</Text>
          <Text style={styles.forecastSub}>
            Based on {formatCurrency(monthTotal)} spent so far this month
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Your insights</Text>
        {insights.length === 0 ? (
          <Text style={styles.emptyInsights}>
            Keep logging expenses — insights appear as patterns form.
          </Text>
        ) : (
          insights.map((insight) => <InsightCard key={insight.id} insight={insight} />)
        )}

        <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>Score breakdown</Text>
        <Card variant="mist">
          <View style={styles.scoreRow}>
            <ScoreRing score={score.total} size={96} label="Score" />
            <View style={styles.scoreDetails}>
              {scoreLines.map((line, i) => (
                <Text key={i} style={styles.scoreLine}>
                  {line}
                </Text>
              ))}
            </View>
          </View>
        </Card>

        <View style={{ height: 110 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surfaceInk },
  scroll: { paddingHorizontal: spacing.md },
  forecast: {
    marginBottom: spacing.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceMist,
    borderRadius: radius.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.signal,
  },
  kicker: {
    ...typography.label,
    color: colors.signal,
    marginBottom: spacing.xs,
  },
  forecastValue: {
    fontFamily: fonts.displayBold,
    fontSize: 40,
    color: colors.textPrimary,
    letterSpacing: -1,
  },
  forecastSub: {
    ...typography.caption,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    ...typography.heading,
    marginBottom: spacing.md,
  },
  emptyInsights: {
    ...typography.caption,
    marginBottom: spacing.md,
  },
  scoreRow: { flexDirection: 'row', alignItems: 'flex-start' },
  scoreDetails: { flex: 1, marginLeft: spacing.md },
  scoreLine: {
    ...typography.caption,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
});
