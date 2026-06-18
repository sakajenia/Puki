import { StyleSheet, Text, View } from "react-native";
import { colors, radius } from "@/lib/theme";
import type { JobStatus } from "@/lib/types";

const LABELS: Record<JobStatus, string> = {
  assigned: "To do",
  in_progress: "In progress",
  submitted: "Submitted",
  approved: "Approved",
  redo: "Needs redo",
};

const TINT: Record<JobStatus, string> = {
  assigned: colors.textMuted,
  in_progress: colors.primary,
  submitted: colors.warning,
  approved: colors.success,
  redo: colors.danger,
};

export function StatusBadge({ status }: { status: JobStatus }) {
  return (
    <View style={[styles.badge, { backgroundColor: TINT[status] + "22" }]}>
      <Text style={[styles.text, { color: TINT[status] }]}>
        {LABELS[status]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  text: { fontSize: 13, fontWeight: "700" },
});
