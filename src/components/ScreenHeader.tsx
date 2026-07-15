import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, spacing, typography } from '../constants/theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  tone?: 'ink' | 'paper';
}

export function ScreenHeader({
  title,
  subtitle,
  right,
  tone = 'ink',
}: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const isPaper = tone === 'paper';

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + spacing.sm,
          backgroundColor: isPaper ? colors.surfacePaper : colors.surfaceInk,
        },
      ]}
    >
      <View style={styles.row}>
        <View style={styles.textWrap}>
          <Text
            style={[
              styles.title,
              { color: isPaper ? colors.textOnPaper : colors.textPrimary },
            ]}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={[
                styles.subtitle,
                { color: isPaper ? colors.textOnPaperMuted : colors.textSecondary },
              ]}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
        {right}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  textWrap: { flex: 1 },
  title: {
    ...typography.title,
    fontFamily: fonts.sansBold,
  },
  subtitle: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
});
