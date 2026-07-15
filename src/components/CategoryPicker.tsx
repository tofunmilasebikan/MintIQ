import React from 'react';
import { Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Category, CATEGORIES } from '../types';
import { CATEGORY_COLORS } from '../constants/categories';
import { colors, fonts, radius, spacing } from '../constants/theme';

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
              active && {
                backgroundColor: CATEGORY_COLORS[cat] + '33',
                borderColor: CATEGORY_COLORS[cat],
              },
            ]}
            onPress={() => onSelect(cat)}
          >
            <Text
              style={[
                styles.chipText,
                active && { color: CATEGORY_COLORS[cat], fontFamily: fonts.sansSemiBold },
              ]}
            >
              {cat}
            </Text>
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
    backgroundColor: colors.surfaceMist,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  chipText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.textSecondary,
  },
});
