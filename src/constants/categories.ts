import { Category } from '../types';

export const CATEGORY_ICONS: Record<Category, keyof typeof import('@expo/vector-icons').Ionicons.glyphMap> = {
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

export const CATEGORY_COLORS: Record<Category, string> = {
  Food: '#FF7675',
  Transportation: '#74B9FF',
  Shopping: '#A29BFE',
  Bills: '#636E72',
  Entertainment: '#FD79A8',
  Health: '#55EFC4',
  Education: '#FFEAA7',
  'Rent/Housing': '#81ECEC',
  Travel: '#FAB1A0',
  Savings: '#00B894',
  Debt: '#E17055',
  Other: '#B2BEC3',
};
