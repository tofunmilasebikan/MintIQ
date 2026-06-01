export const colors = {
  mint: '#A8E6CF',
  mintDark: '#7BC4A8',
  mintLight: '#D4F5E9',
  cream: '#FAF9F6',
  creamDark: '#F0EDE8',
  charcoal: '#2D3436',
  charcoalLight: '#636E72',
  white: '#FFFFFF',
  border: '#E8E4DF',
  error: '#E17055',
  warning: '#FDCB6E',
  success: '#00B894',
  shadow: 'rgba(45, 52, 54, 0.08)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const typography = {
  title: { fontSize: 28, fontWeight: '700' as const, color: colors.charcoal },
  heading: { fontSize: 20, fontWeight: '600' as const, color: colors.charcoal },
  subheading: { fontSize: 16, fontWeight: '600' as const, color: colors.charcoal },
  body: { fontSize: 15, fontWeight: '400' as const, color: colors.charcoal },
  caption: { fontSize: 13, fontWeight: '400' as const, color: colors.charcoalLight },
  label: { fontSize: 12, fontWeight: '500' as const, color: colors.charcoalLight },
};
