import { StyleSheet, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { radius } from "@/lib/theme";

/** Rounded-square gradient tile holding an emoji glyph — the app's "icon" language. */
export function IconTile({
  glyph,
  size = 48,
}: {
  glyph: string;
  size?: number;
}) {
  return (
    <LinearGradient
      colors={["rgba(139,92,246,0.35)", "rgba(34,211,238,0.18)"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.tile,
        { width: size, height: size, borderRadius: size >= 56 ? radius.lg : radius.md },
      ]}
    >
      <Text style={{ fontSize: size * 0.5 }}>{glyph}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  tile: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
});
