import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { BarChart, PieChart } from 'react-native-gifted-charts';
import { format, subMonths } from 'date-fns';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { ScoreHero } from '../components/ScoreHero';
import { StatCard } from '../components/StatCard';
import {
  sumExpenses,
  getMonthRange,
  getWeekRange,
  getTopCategory,
  calculateProjectedMonthlySpend,
  calculateMintIQScore,
  groupByCategory,
  getSpendingOverTime,
} from '../utils/analytics';
import { formatCurrency } from '../utils/format';
import { CATEGORY_COLORS } from '../constants/categories';
import { colors, fonts, spacing, typography, radius } from '../constants/theme';
import { Category } from '../types';

const screenWidth = Dimensions.get('window').width;

function scoreMeaning(total: number): string {
  if (total >= 80) return 'Your signal is strong — goals, stability, and pace are aligned.';
  if (total >= 60) return 'A balanced signal with room to sharpen one or two behaviors.';
  if (total >= 40) return 'A developing signal — trends and consistency will move this.';
  return 'Early signal — more tracking will clarify your pattern.';
}

export function DashboardScreen() {
  const { expenses, goals } = useApp();
  const insets = useSafeAreaInsets();
  const now = new Date();
  const monthRange = getMonthRange();
  const weekRange = getWeekRange();
  const prevMonthKey = format(subMonths(now, 1), 'yyyy-MM');
  const prevMonthRange = getMonthRange(prevMonthKey);

  const stats = useMemo(() => {
    const monthExpenses = expenses.filter(
      (e) => e.date >= monthRange.start && e.date <= monthRange.end
    );
    const weekExpenses = expenses.filter(
      (e) => e.date >= weekRange.start && e.date <= weekRange.end
    );
    const prevExpenses = expenses.filter(
      (e) => e.date >= prevMonthRange.start && e.date <= prevMonthRange.end
    );
    const monthTotal = sumExpenses(monthExpenses);
    const dayOfMonth = now.getDate();
    const top = getTopCategory(monthExpenses);
    const projected = calculateProjectedMonthlySpend(monthExpenses, now);
    const score = calculateMintIQScore(monthExpenses, prevExpenses, goals, now);

    return {
      monthTotal,
      weekTotal: sumExpenses(weekExpenses),
      avgDaily: dayOfMonth > 0 ? monthTotal / dayOfMonth : 0,
      topCategory: top?.category as Category | null,
      topCategoryAmount: top?.amount ?? 0,
      projected,
      score,
      monthExpenses,
    };
  }, [expenses, goals, monthRange, weekRange, prevMonthRange]);

  const categoryEntries = useMemo(() => {
    const grouped = groupByCategory(stats.monthExpenses);
    return Object.entries(grouped)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [stats.monthExpenses]);

  const categoryData = useMemo(
    () =>
      categoryEntries.map(([cat, value]) => ({
        value,
        color: CATEGORY_COLORS[cat as Category] ?? colors.signal,
        text: cat,
      })),
    [categoryEntries]
  );

  const dailyData = useMemo(
    () =>
      getSpendingOverTime(expenses, 14).map((d) => ({
        value: d.value,
        label: d.label,
        frontColor: colors.signal,
      })),
    [expenses]
  );

  const chartWidth = Math.min(screenWidth, 480) - spacing.md * 2;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <ScoreHero score={stats.score.total} meaning={scoreMeaning(stats.score.total)} />

        <Text style={styles.monthLabel}>{format(now, 'MMMM yyyy')}</Text>

        <View style={styles.metricRail}>
          <StatCard label="This month" value={formatCurrency(stats.monthTotal)} index={0} />
          <View style={styles.railDivider} />
          <StatCard label="This week" value={formatCurrency(stats.weekTotal)} index={1} />
          <View style={styles.railDivider} />
          <StatCard label="Daily avg" value={formatCurrency(stats.avgDaily)} index={2} />
          <View style={styles.railDivider} />
          <StatCard
            label="Projected"
            value={formatCurrency(stats.projected)}
            subtitle="End of month"
            index={3}
          />
        </View>

        {stats.topCategory ? (
          <View style={styles.storyBlock}>
            <Text style={styles.kicker}>Leading category</Text>
            <Text style={styles.storyHeadline}>{stats.topCategory}</Text>
            <Text style={styles.storyMeta}>
              {formatCurrency(stats.topCategoryAmount)} this month
            </Text>
          </View>
        ) : null}

        {categoryData.length > 0 ? (
          <View style={styles.chartBlock}>
            <Text style={styles.sectionLabel}>Category story</Text>
            <View style={styles.categoryRow}>
              <PieChart
                data={categoryData}
                donut
                radius={72}
                innerRadius={48}
                centerLabelComponent={() => (
                  <View style={styles.pieCenter}>
                    <Text style={styles.pieValue}>{formatCurrency(stats.monthTotal)}</Text>
                    <Text style={styles.pieHint}>total</Text>
                  </View>
                )}
              />
              <View style={styles.legend}>
                {categoryEntries.map(([cat, value]) => (
                  <View key={cat} style={styles.legendRow}>
                    <View
                      style={[
                        styles.legendDot,
                        { backgroundColor: CATEGORY_COLORS[cat as Category] ?? colors.signal },
                      ]}
                    />
                    <Text style={styles.legendCat} numberOfLines={1}>
                      {cat}
                    </Text>
                    <Text style={styles.legendVal}>{formatCurrency(value)}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ) : null}

        {dailyData.some((d) => d.value > 0) ? (
          <View style={styles.chartBlock}>
            <Text style={styles.sectionLabel}>Spending over time</Text>
            <Text style={styles.sectionHint}>Last 14 days</Text>
            <BarChart
              data={dailyData}
              width={chartWidth}
              height={168}
              barWidth={12}
              spacing={6}
              roundedTop
              hideRules
              xAxisThickness={0}
              yAxisThickness={0}
              yAxisTextStyle={styles.axisText}
              xAxisLabelTextStyle={styles.axisText}
              noOfSections={3}
              maxValue={Math.max(...dailyData.map((d) => d.value), 10) * 1.15}
              isAnimated
              animationDuration={700}
            />
          </View>
        ) : null}

        <View style={{ height: 110 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceInk,
  },
  scroll: {
    paddingBottom: spacing.xl,
  },
  monthLabel: {
    ...typography.label,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    color: colors.textMuted,
  },
  metricRail: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surfaceMist,
    borderRadius: radius.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  railDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  storyBlock: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xl,
  },
  kicker: {
    ...typography.label,
    marginBottom: spacing.xs,
  },
  storyHeadline: {
    fontFamily: fonts.display,
    fontSize: 36,
    color: colors.textPrimary,
    letterSpacing: -0.8,
  },
  storyMeta: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  chartBlock: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    ...typography.heading,
    marginBottom: spacing.xs,
  },
  sectionHint: {
    ...typography.caption,
    marginBottom: spacing.md,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.surfaceMist,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  pieCenter: { alignItems: 'center' },
  pieValue: {
    fontFamily: fonts.sansBold,
    fontSize: 12,
    color: colors.textPrimary,
  },
  pieHint: {
    ...typography.label,
    fontSize: 9,
  },
  legend: { flex: 1, gap: spacing.sm },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendCat: {
    ...typography.caption,
    flex: 1,
    color: colors.textSecondary,
  },
  legendVal: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 12,
    color: colors.textPrimary,
  },
  axisText: {
    ...typography.label,
    fontSize: 9,
    color: colors.textMuted,
  },
});
