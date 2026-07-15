/**
 * Verdant Signal — MintIQ design system
 * Ink canvas + luminous mint signal + bone paper planes
 */

export const colors = {
  ink: '#121714',
  mist: '#1C2420',
  bone: '#F3F0E8',
  signal: '#2EE6A6',
  signalDim: '#1A9E72',
  signalSoft: 'rgba(46, 230, 166, 0.14)',

  surfaceInk: '#121714',
  surfaceMist: '#1C2420',
  surfacePaper: '#F3F0E8',
  surfaceElevated: '#24302A',
  surfaceGhost: 'rgba(243, 240, 232, 0.06)',

  textPrimary: '#F3F0E8',
  textSecondary: 'rgba(243, 240, 232, 0.62)',
  textMuted: 'rgba(243, 240, 232, 0.38)',
  textInverse: '#121714',
  textOnPaper: '#1A1F1C',
  textOnPaperMuted: '#5C665F',

  border: 'rgba(243, 240, 232, 0.1)',
  borderPaper: 'rgba(26, 31, 28, 0.08)',
  error: '#E86A54',
  warning: '#E8C46A',
  success: '#2EE6A6',

  // Legacy aliases (ink-first shell during rollout)
  mint: '#2EE6A6',
  mintDark: '#2EE6A6',
  mintLight: 'rgba(46, 230, 166, 0.14)',
  cream: '#121714',
  creamDark: '#1C2420',
  charcoal: '#F3F0E8',
  charcoalLight: 'rgba(243, 240, 232, 0.62)',
  white: '#1C2420',
  shadow: 'rgba(0, 0, 0, 0.35)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 999,
};

export const fonts = {
  sans: 'PlusJakartaSans_400Regular',
  sansMedium: 'PlusJakartaSans_500Medium',
  sansSemiBold: 'PlusJakartaSans_600SemiBold',
  sansBold: 'PlusJakartaSans_700Bold',
  display: 'Fraunces_600SemiBold',
  displayBold: 'Fraunces_700Bold',
};

export const typography = {
  display: {
    fontFamily: fonts.displayBold,
    fontSize: 56,
    fontWeight: '700' as const,
    color: colors.textPrimary,
    letterSpacing: -1.5,
  },
  title: {
    fontFamily: fonts.sansBold,
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  heading: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 20,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  subheading: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  body: {
    fontFamily: fonts.sans,
    fontSize: 15,
    fontWeight: '400' as const,
    color: colors.textPrimary,
  },
  caption: {
    fontFamily: fonts.sans,
    fontSize: 13,
    fontWeight: '400' as const,
    color: colors.textSecondary,
  },
  label: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    fontWeight: '500' as const,
    color: colors.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
  },
};
