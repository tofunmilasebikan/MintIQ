import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../constants/theme';

interface ScoreRingProps {
  score: number;
  size?: number;
}

export function ScoreRing({ score, size = 100 }: ScoreRingProps) {
  const getColor = () => {
    if (score >= 75) return colors.success;
    if (score >= 50) return colors.mintDark;
    if (score >= 25) return colors.warning;
    return colors.error;
  };

  return (
    <View style={[styles.ring, { width: size, height: size, borderRadius: size / 2, borderColor: getColor() }]}>
      <Text style={[styles.score, { fontSize: size * 0.28 }]}>{score}</Text>
      <Text style={styles.label}>MintIQ</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    borderWidth: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  score: {
    fontWeight: '700',
    color: colors.charcoal,
  },
  label: {
    ...typography.label,
    fontSize: 10,
    marginTop: 2,
  },
});
