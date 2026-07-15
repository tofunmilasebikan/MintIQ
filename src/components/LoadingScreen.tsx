import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../constants/theme';

/** Pre-font safe loader — system font only. */
export function LoadingScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.signal} />
      <Text style={styles.text}>MintIQ</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceInk,
  },
  text: {
    marginTop: 16,
    color: colors.textSecondary,
    fontSize: 14,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
});
