export const animations = {
  easeOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.6, 1)',
  easeBounce: 'cubic-bezier(0.68, -0.55, 0.27, 1.55)',
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
};

export const duration = {
  fast: 150,
  snap: 200,
  base: 300,
  slow: 500,
};

export const animationPresets = {
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  slideUp: {
    from: { transform: [{ translateY: 20 }], opacity: 0 },
    to: { transform: [{ translateY: 0 }], opacity: 1 },
  },
  scaleIn: {
    from: { transform: [{ scale: 0.9 }], opacity: 0 },
    to: { transform: [{ scale: 1 }], opacity: 1 },
  },
  pulse: {
    from: { transform: [{ scale: 1 }] },
    to: { transform: [{ scale: 1.05 }] },
  },
};
