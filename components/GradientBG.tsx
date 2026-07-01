import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { bgGradient } from "@/lib/theme";

/**
 * Deep-space backdrop: a dark vertical gradient with a soft violet and a cyan
 * glow. Put screen content inside; it fills the screen behind everything.
 */
export function GradientBG({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.flex}>
      <LinearGradient colors={bgGradient} style={StyleSheet.absoluteFill} />
      <View style={[styles.glow, styles.glowViolet]} />
      <View style={[styles.glow, styles.glowCyan]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#07070D" },
  glow: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    opacity: 0.16,
  },
  glowViolet: {
    top: -90,
    left: -70,
    backgroundColor: "#8B5CF6",
    transform: [{ scaleX: 1.4 }],
  },
  glowCyan: {
    bottom: -140,
    right: -110,
    backgroundColor: "#22D3EE",
    opacity: 0.1,
    transform: [{ scaleX: 1.3 }],
  },
});
