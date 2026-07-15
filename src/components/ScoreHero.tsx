import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScoreRing } from './ScoreRing';
import { colors, fonts, spacing, typography } from '../constants/theme';
import { motion } from '../constants/motion';

interface ScoreHeroProps {
  score: number;
  meaning: string;
}

export function ScoreHero({ score, meaning }: ScoreHeroProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: motion.duration.medium,
        easing: motion.easing.out,
        useNativeDriver: true,
      }),
      Animated.timing(translate, {
        toValue: 0,
        duration: motion.duration.medium,
        easing: motion.easing.out,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translate]);

  return (
    <View style={styles.hero}>
      <LinearGradient
        colors={['rgba(46,230,166,0.18)', 'rgba(18,23,20,0)']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View style={{ opacity, transform: [{ translateY: translate }] }}>
        <Text style={styles.brand}>MintIQ</Text>
        <View style={styles.row}>
          <ScoreRing score={score} size={148} label="Score" />
          <View style={styles.copy}>
            <Text style={styles.kicker}>Financial signal</Text>
            <Text style={styles.meaning}>{meaning}</Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    overflow: 'hidden',
  },
  brand: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.signal,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  copy: {
    flex: 1,
  },
  kicker: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  meaning: {
    fontFamily: fonts.sans,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
  },
});
