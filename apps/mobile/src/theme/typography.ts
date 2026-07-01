export const typography = {
  fontFamily: {
    regular: 'Inter',
    serif: 'Merriweather',
  },
  size: {
    hero: 32,
    h1: 24,
    h2: 18,
    h3: 16,
    bodyLg: 16,
    body: 14,
    caption: 12,
    micro: 11,
  },
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 1.2,
    snug: 1.3,
    normal: 1.4,
    relaxed: 1.5,
    loose: 1.6,
  },
  letterSpacing: {
    tight: '-0.5px',
    normal: '0px',
    wide: '+0.5px',
    wider: '+1px',
  },
};

export const textStyles = {
  hero: {
    fontSize: typography.size.hero,
    fontWeight: typography.weight.semibold,
    lineHeight: typography.size.hero * typography.lineHeight.tight,
    letterSpacing: typography.letterSpacing.tight,
  },
  h1: {
    fontSize: typography.size.h1,
    fontWeight: typography.weight.semibold,
    lineHeight: typography.size.h1 * typography.lineHeight.snug,
  },
  h2: {
    fontSize: typography.size.h2,
    fontWeight: typography.weight.semibold,
    lineHeight: typography.size.h2 * typography.lineHeight.normal,
  },
  h3: {
    fontSize: typography.size.h3,
    fontWeight: typography.weight.medium,
    lineHeight: typography.size.h3 * typography.lineHeight.relaxed,
  },
  bodyLg: {
    fontSize: typography.size.bodyLg,
    fontWeight: typography.weight.regular,
    lineHeight: typography.size.bodyLg * typography.lineHeight.loose,
  },
  body: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.regular,
    lineHeight: typography.size.body * typography.lineHeight.relaxed,
    letterSpacing: typography.letterSpacing.wide,
  },
  caption: {
    fontSize: typography.size.caption,
    fontWeight: typography.weight.regular,
    lineHeight: typography.size.caption * typography.lineHeight.normal,
  },
  micro: {
    fontSize: typography.size.micro,
    fontWeight: typography.weight.regular,
    lineHeight: typography.size.micro * typography.lineHeight.normal,
  },
};
