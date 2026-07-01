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
import { BigButton } from "@/components/BigButton";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { colors, radius, shadow, spacing } from "@/lib/theme";
import type { JobWithProperty } from "@/lib/types";

export default function OwnerHome() {
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
      .eq("owner_id", profile.id)
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

  return (
    <View style={[styles.flex, { paddingTop: insets.top + spacing.md }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Your cleanings</Text>
          <Text style={styles.sub}>{profile?.full_name}</Text>
        </View>
        <Pressable onPress={signOut} hitSlop={10}>
          <Text style={styles.signout}>Log out</Text>
        </Pressable>
      </View>

      <FlatList
        contentContainerStyle={styles.list}
        data={jobs}
        keyExtractor={(j) => j.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListEmptyComponent={
          loading ? null : (
            <Text style={styles.empty}>
              No jobs yet. Create one to send to a cleaner.
            </Text>
          )
        }
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            onPress={() => router.push(`/(owner)/job/${item.id}`)}
          >
            <Text style={styles.cardTitle}>
              {item.property?.name ?? "Cleaning job"}
            </Text>
            {item.property?.address ? (
              <Text style={styles.cardAddr}>{item.property.address}</Text>
            ) : null}
            <View style={styles.cardFooter}>
              <StatusBadge status={item.status} />
              <Text style={styles.review}>Review ›</Text>
            </View>
          </Pressable>
        )}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <BigButton
          label="+ New cleaning job"
          onPress={() => router.push("/(owner)/new-job")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  title: { fontSize: 26, fontWeight: "800", color: colors.text },
  sub: { fontSize: 15, color: colors.textMuted, marginTop: 2 },
  signout: { color: colors.primary, fontWeight: "600", fontSize: 15 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, gap: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.card,
  },
  pressed: { opacity: 0.85 },
  cardTitle: { fontSize: 20, fontWeight: "800", color: colors.text },
  cardAddr: { fontSize: 15, color: colors.textMuted, marginTop: 2 },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.md,
  },
  review: { fontSize: 16, fontWeight: "700", color: colors.primary },
  empty: {
    textAlign: "center",
    color: colors.textMuted,
    fontSize: 16,
    marginTop: spacing.xl,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
});
