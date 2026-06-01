import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Category } from '../types';
import { CATEGORIES } from '../types';
import { CATEGORY_COLORS } from '../constants/categories';
import { colors, radius, spacing, typography } from '../constants/theme';

interface CategoryPickerProps {
  selected: Category;
  onSelect: (category: Category) => void;
}

export function CategoryPicker({ selected, onSelect }: CategoryPickerProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
      {CATEGORIES.map((cat) => {
        const active = cat === selected;
        return (
          <TouchableOpacity
            key={cat}
            style={[
              styles.chip,
              active && { backgroundColor: CATEGORY_COLORS[cat], borderColor: CATEGORY_COLORS[cat] },
            ]}
            onPress={() => onSelect(cat)}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{cat}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { marginVertical: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.creamDark,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  chipText: { ...typography.caption, color: colors.charcoal, fontWeight: '500' },
  chipTextActive: { color: colors.white, fontWeight: '600' },
});
