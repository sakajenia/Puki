import { useCallback, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GradientBG } from "@/components/GradientBG";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { colors, radius, shadow, spacing } from "@/lib/theme";
import type { JobWithProperty } from "@/lib/types";

export default function CleanerHome() {
  const { profile, signOut } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [jobs, setJobs] = useState<JobWithProperty[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!profile) return;
    const { data, error } = await supabase
      .from("jobs")
      .select("*, property:properties(id, name, address)")
      .eq("cleaner_id", profile.id)
      .order("created_at", { ascending: false });
    if (error) console.warn("[Puki] load jobs:", error.message);
    setJobs((data as JobWithProperty[]) ?? []);
    setLoading(false);
  }, [profile]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const todo = jobs.filter(
    (j) => j.status === "assigned" || j.status === "in_progress" || j.status === "redo"
  );
  const done = jobs.filter(
    (j) => j.status === "submitted" || j.status === "approved"
  );

  return (
    <GradientBG>
    <View style={[styles.flex, { paddingTop: insets.top + spacing.md }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.hello}>Hi {profile?.full_name ?? "there"} 👋</Text>
          <Text style={styles.sub}>Tap a job to start cleaning</Text>
        </View>
        <Pressable onPress={signOut} hitSlop={10}>
          <Text style={styles.signout}>Log out</Text>
        </Pressable>
      </View>

      <FlatList
        contentContainerStyle={styles.list}
        data={todo}
        keyExtractor={(j) => j.id}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={load} />
        }
        ListEmptyComponent={
          loading ? null : (
            <Text style={styles.empty}>
              No jobs yet. Your manager will send you one.
            </Text>
          )
        }
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            onPress={() => router.push(`/(cleaner)/job/${item.id}/record`)}
          >
            <Text style={styles.cardTitle}>
              {item.property?.name ?? "Cleaning job"}
            </Text>
            {item.property?.address ? (
              <Text style={styles.cardAddr}>{item.property.address}</Text>
            ) : null}
            <View style={styles.cardFooter}>
              <StatusBadge status={item.status} />
              <Text style={styles.cta}>Start ▶</Text>
            </View>
          </Pressable>
        )}
        ListFooterComponent={
          done.length > 0 ? (
            <View style={styles.doneSection}>
              <Text style={styles.doneHeading}>Sent for review</Text>
              {done.map((item) => (
                <View key={item.id} style={styles.doneRow}>
                  <Text style={styles.doneName}>
                    {item.property?.name ?? "Cleaning job"}
                  </Text>
                  <StatusBadge status={item.status} />
                </View>
              ))}
            </View>
          ) : null
        }
      />
    </View>
    </GradientBG>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  hello: { fontSize: 26, fontWeight: "800", color: colors.text },
  sub: { fontSize: 15, color: colors.textMuted, marginTop: 2 },
  signout: { color: colors.primary, fontWeight: "600", fontSize: 15 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, gap: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  pressed: { opacity: 0.85 },
  cardTitle: { fontSize: 22, fontWeight: "800", color: colors.text },
  cardAddr: { fontSize: 15, color: colors.textMuted, marginTop: 2 },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.md,
  },
  cta: { fontSize: 18, fontWeight: "800", color: colors.accent },
  empty: {
    textAlign: "center",
    color: colors.textMuted,
    fontSize: 16,
    marginTop: spacing.xl,
  },
  doneSection: { marginTop: spacing.xl },
  doneHeading: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
  },
  doneRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
  },
  doneName: { fontSize: 16, color: colors.text },
});
