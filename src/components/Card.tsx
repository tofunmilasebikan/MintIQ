import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../constants/theme';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  accent?: boolean;
}

export function Card({ children, style, accent }: CardProps) {
  return (
    <View style={[styles.card, accent && styles.accent, style]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    shadowColor: colors.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  accent: {
    backgroundColor: colors.mintLight,
    borderColor: colors.mint,
  },
});
