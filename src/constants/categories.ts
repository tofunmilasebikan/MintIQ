import { Category } from '../types';

export const CATEGORY_ICONS: Record<
  Category,
  keyof typeof import('@expo/vector-icons').Ionicons.glyphMap
> = {
  Food: 'restaurant-outline',
  Transportation: 'car-outline',
  Shopping: 'bag-outline',
  Bills: 'receipt-outline',
  Entertainment: 'film-outline',
  Health: 'heart-outline',
  Education: 'school-outline',
  'Rent/Housing': 'home-outline',
  Travel: 'airplane-outline',
  Savings: 'wallet-outline',
  Debt: 'card-outline',
  Other: 'ellipsis-horizontal-outline',
};

/** Quieter category tints for Verdant Signal */
export const CATEGORY_COLORS: Record<Category, string> = {
  Food: '#E07A6E',
  Transportation: '#6BA3C9',
  Shopping: '#9B8EC4',
  Bills: '#8A938E',
  Entertainment: '#D489A8',
  Health: '#5FBF9E',
  Education: '#C4B07A',
  'Rent/Housing': '#6BB3B0',
  Travel: '#D4A08A',
  Savings: '#2EE6A6',
  Debt: '#E86A54',
  Other: '#7A847C',
};
