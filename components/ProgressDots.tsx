import { StyleSheet, View } from "react-native";
import { colors } from "@/lib/theme";

/** A row of dots showing progress through the guided areas: done / current / pending. */
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
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, i) => {
        const done = i < doneCount;
        const active = i === current;
        return (
          <View
            key={i}
            style={[
              styles.dot,
              done && styles.done,
              active && styles.active,
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.border,
  },
  done: { backgroundColor: colors.success },
  active: {
    backgroundColor: colors.primary,
    transform: [{ scale: 1.35 }],
  },
});
