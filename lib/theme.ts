/**
 * Design system — dark, high-tech fintech look with glassmorphism:
 * deep space background with a violet glow, translucent frosted cards,
 * neon violet→cyan gradient CTAs, light text. Cleaner-facing screens keep
 * huge tap targets and one decision per screen.
 */
export const colors = {
  bg: "#07070D",
  bgSubtle: "rgba(255,255,255,0.06)",
  surface: "rgba(255,255,255,0.07)",
  text: "#F4F5FF",
  textMuted: "#8E93B3",
  primary: "#8B5CF6",
  primaryDark: "#6D28D9",
  accent: "#22D3EE",
  success: "#34D399",
  danger: "#FB7185",
  warning: "#FBBF24",
  border: "rgba(255,255,255,0.14)",
  recording: "#FB7185",
  overlay: "rgba(0,0,0,0.85)",
};

/** Background gradient (top → bottom) used behind the main screens. */
export const bgGradient = ["#16102E", "#0B0A18", "#07070D"] as const;

/** Neon gradient for primary CTAs (left → right). */
export const ctaGradient = ["#8B5CF6", "#6366F1", "#22D3EE"] as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 24,
  pill: 999,
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 36,
};

/** Neon glow used on cards and the primary CTA. */
export const shadow = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 6,
  },
  button: {
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 6,
  },
} as const;
