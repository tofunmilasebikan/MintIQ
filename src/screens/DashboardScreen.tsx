import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { BarChart, PieChart } from 'react-native-gifted-charts';
import { format, subMonths } from 'date-fns';
import { useApp } from '../context/AppContext';
import { ScreenHeader } from '../components/ScreenHeader';
import { Card } from '../components/Card';
import { StatCard } from '../components/StatCard';
import { ScoreRing } from '../components/ScoreRing';
import {
  sumExpenses,
  getMonthRange,
  getWeekRange,
  getTopCategory,
  calculateProjectedMonthlySpend,
  calculateMintIQScore,
  groupByCategory,
  getWeeklyTrend,
  getSpendingOverTime,
} from '../utils/analytics';
import { formatCurrency } from '../utils/format';
import { CATEGORY_COLORS } from '../constants/categories';
import { colors, spacing, typography } from '../constants/theme';
import { Category } from '../types';

const screenWidth = Dimensions.get('window').width;

export function DashboardScreen() {
  const { expenses, goals } = useApp();
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

  const categoryData = useMemo(() => {
    const grouped = groupByCategory(stats.monthExpenses);
    return Object.entries(grouped)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([cat, value]) => ({
        value,
        color: CATEGORY_COLORS[cat as Category] ?? colors.mintDark,
        text: cat,
      }));
  }, [stats.monthExpenses]);

  const weeklyData = useMemo(
    () => getWeeklyTrend(expenses).map((d) => ({ ...d, frontColor: colors.mintDark })),
    [expenses]
  );

  const dailyData = useMemo(
    () => getSpendingOverTime(expenses, 14).map((d) => ({ ...d, frontColor: colors.mint })),
    [expenses]
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title="Dashboard" subtitle={format(now, 'MMMM yyyy')} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card style={styles.scoreCard} accent>
          <View style={styles.scoreRow}>
            <ScoreRing score={stats.score.total} size={90} />
            <View style={styles.scoreInfo}>
              <Text style={styles.scoreTitle}>MintIQ Score</Text>
              <Text style={styles.scoreDesc}>
                A snapshot of your financial behavior based on goals, stability, savings, and trends.
              </Text>
            </View>
          </View>
        </Card>

        <View style={styles.statsGrid}>
          <Card style={styles.statCardWrap}>
            <StatCard label="This Month" value={formatCurrency(stats.monthTotal)} />
          </Card>
          <Card style={styles.statCardWrap}>
            <StatCard label="This Week" value={formatCurrency(stats.weekTotal)} />
          </Card>
          <Card style={styles.statCardWrap}>
            <StatCard label="Daily Avg" value={formatCurrency(stats.avgDaily)} />
          </Card>
          <Card style={styles.statCardWrap}>
            <StatCard
              label="Projected"
              value={formatCurrency(stats.projected)}
              subtitle="End of month"
            />
          </Card>
        </View>

        {stats.topCategory ? (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Top Category</Text>
            <Text style={styles.topCat}>
              {stats.topCategory} · {formatCurrency(stats.topCategoryAmount)}
            </Text>
          </Card>
        ) : null}

        {categoryData.length > 0 ? (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Spending by Category</Text>
            <View style={styles.chartCenter}>
              <PieChart
                data={categoryData}
                donut
                radius={80}
                innerRadius={50}
                centerLabelComponent={() => (
                  <Text style={styles.pieCenter}>{formatCurrency(stats.monthTotal)}</Text>
                )}
              />
            </View>
          </Card>
        ) : null}

        {dailyData.some((d) => d.value > 0) ? (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Spending Over Time</Text>
            <BarChart
              data={dailyData}
              width={screenWidth - 80}
              height={160}
              barWidth={14}
              spacing={8}
              roundedTop
              hideRules
              xAxisThickness={0}
              yAxisThickness={0}
              yAxisTextStyle={styles.axisText}
              xAxisLabelTextStyle={styles.axisText}
              noOfSections={4}
              maxValue={Math.max(...dailyData.map((d) => d.value), 10) * 1.2}
            />
          </Card>
        ) : null}

        {weeklyData.some((d) => d.value > 0) ? (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Weekly Trend</Text>
            <BarChart
              data={weeklyData}
              width={screenWidth - 80}
              height={160}
              barWidth={28}
              spacing={16}
              roundedTop
              hideRules
              xAxisThickness={0}
              yAxisThickness={0}
              yAxisTextStyle={styles.axisText}
              xAxisLabelTextStyle={styles.axisText}
              noOfSections={4}
              maxValue={Math.max(...weeklyData.map((d) => d.value), 10) * 1.2}
            />
          </Card>
        ) : null}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  scroll: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  scoreCard: { marginBottom: spacing.md },
  scoreRow: { flexDirection: 'row', alignItems: 'center' },
  scoreInfo: { flex: 1, marginLeft: spacing.md },
  scoreTitle: { ...typography.heading },
  scoreDesc: { ...typography.caption, marginTop: spacing.xs, lineHeight: 20 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCardWrap: { width: '48%', flexGrow: 1 },
  section: { marginBottom: spacing.md },
  sectionTitle: { ...typography.subheading, marginBottom: spacing.md },
  topCat: { ...typography.body, color: colors.mintDark, fontWeight: '600' },
  chartCenter: { alignItems: 'center', paddingVertical: spacing.sm },
  pieCenter: { ...typography.caption, fontWeight: '700' },
  axisText: { ...typography.label, fontSize: 10 },
});
