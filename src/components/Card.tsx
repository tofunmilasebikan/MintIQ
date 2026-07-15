import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../constants/theme';

export type CardVariant = 'ink' | 'mist' | 'paper' | 'ghost' | 'none';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  variant?: CardVariant;
  /** @deprecated Use variant="ghost" or mist + signal tint */
  accent?: boolean;
  padded?: boolean;
}

export function Card({
  children,
  style,
  variant = 'mist',
  accent,
  padded = true,
}: CardProps) {
  const resolved: CardVariant = accent ? 'ghost' : variant;

  return (
    <View
      style={[
        padded && styles.padded,
        resolved !== 'none' && styles[resolved],
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  padded: {
    padding: spacing.md,
  },
  mist: {
    backgroundColor: colors.surfaceMist,
    borderRadius: radius.lg,
  },
  ink: {
    backgroundColor: colors.surfaceInk,
    borderRadius: radius.lg,
  },
  paper: {
    backgroundColor: colors.surfacePaper,
    borderRadius: radius.lg,
  },
  ghost: {
    backgroundColor: colors.surfaceGhost,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
