import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, fonts, radius, spacing, typography } from '../constants/theme';

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'decimal-pad' | 'numeric';
  multiline?: boolean;
  tone?: 'ink' | 'paper';
}

export function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  multiline,
  tone = 'ink',
}: InputFieldProps) {
  const isPaper = tone === 'paper';
  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.label,
          { color: isPaper ? colors.textOnPaperMuted : colors.textMuted },
        ]}
      >
        {label}
      </Text>
      <TextInput
        style={[
          styles.input,
          multiline && styles.multiline,
          isPaper
            ? {
                backgroundColor: colors.surfacePaper,
                borderColor: colors.borderPaper,
                color: colors.textOnPaper,
              }
            : {
                backgroundColor: colors.surfaceMist,
                borderColor: colors.border,
                color: colors.textPrimary,
              },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={isPaper ? colors.textOnPaperMuted : colors.textMuted}
        keyboardType={keyboardType}
        multiline={multiline}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: {
    ...typography.label,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    fontSize: 16,
    fontFamily: fonts.sans,
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
});
