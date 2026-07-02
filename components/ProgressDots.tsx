import { StyleSheet, Text, View } from "react-native";
import { colors, radius } from "@/lib/theme";

/**
 * Segmented progress bar + counter pill: filled = recorded, bright = current,
 * dim = still to do. Reads at a glance even for non-technical users.
 */
export function ProgressDots({
  total,
  current,
  doneCount,
}: {
  total: number;
  current: number;
  doneCount: number;
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {Array.from({ length: total }).map((_, i) => {
          const done = i < doneCount;
          const active = i === current;
          return (
            <View
              key={i}
              style={[styles.seg, done && styles.done, active && styles.active]}
            />
          );
        })}
      </View>
      <View style={styles.pill}>
        <Text style={styles.pillText}>
          {Math.min(doneCount, total)}/{total}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", gap: 12 },
  row: { flex: 1, flexDirection: "row", gap: 5 },
  seg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  done: { backgroundColor: colors.success },
  active: { backgroundColor: colors.primary },
  pill: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  pillText: { color: colors.text, fontSize: 13, fontWeight: "700" },
});
