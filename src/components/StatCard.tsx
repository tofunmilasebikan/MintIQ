import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { fonts, colors, spacing, typography } from '../constants/theme';
import { motion } from '../constants/motion';

interface StatCardProps {
  label: string;
  value: string;
  subtitle?: string;
  index?: number;
}

/** Metric cell for ink metric rail — no card chrome. */
export function StatCard({ label, value, subtitle, index = 0 }: StatCardProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: motion.duration.medium,
        delay: index * motion.stagger,
        easing: motion.easing.out,
        useNativeDriver: true,
      }),
      Animated.timing(translate, {
        toValue: 0,
        duration: motion.duration.medium,
        delay: index * motion.stagger,
        easing: motion.easing.out,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, opacity, translate]);

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity, transform: [{ translateY: translate }] },
      ]}
    >
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: spacing.sm,
  },
  label: {
    ...typography.label,
    marginBottom: spacing.xs,
  },
  value: {
    fontFamily: fonts.sansBold,
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  subtitle: {
    ...typography.caption,
    marginTop: 2,
  },
});
