/**
 * Design system — modern iOS look inspired by Airbnb: warm white surfaces,
 * a single bold accent, soft shadows instead of hard borders, pill buttons,
 * oversized friendly typography. Cleaner-facing screens keep huge tap targets.
 */
export const colors = {
  bg: "#FFFFFF",
  bgSubtle: "#F7F7F7",
  surface: "#FFFFFF",
  text: "#222222",
  textMuted: "#717171",
  primary: "#FF385C",
  primaryDark: "#E31C5F",
  success: "#0A8A3C",
  danger: "#C13515",
  warning: "#B45309",
  border: "#EBEBEB",
  recording: "#FF385C",
  overlay: "rgba(0,0,0,0.85)",
};

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

/** Soft elevation used on cards and floating CTAs (iOS shadow + Android elevation). */
export const shadow = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  button: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
} as const;
