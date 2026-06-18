import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BigButton } from "@/components/BigButton";
import { DEFAULT_AREAS } from "@/lib/constants";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { colors, radius, spacing } from "@/lib/theme";

interface CleanerOption {
  id: string;
  full_name: string | null;
}

export default function NewJob() {
  const { profile } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [areas, setAreas] = useState<string[]>(DEFAULT_AREAS);
  const [newArea, setNewArea] = useState("");
  const [cleaners, setCleaners] = useState<CleanerOption[]>([]);
  const [cleanerId, setCleanerId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("id, full_name")
      .eq("role", "cleaner")
      .then(({ data }) => setCleaners((data as CleanerOption[]) ?? []));
  }, []);

  function addArea() {
    const v = newArea.trim();
    if (!v) return;
    setAreas((a) => [...a, v]);
    setNewArea("");
  }

  function removeArea(i: number) {
    setAreas((a) => a.filter((_, idx) => idx !== i));
  }

  async function create() {
    setError(null);
    if (!profile) return;
    if (!name.trim()) return setError("Give the place a name.");
    if (areas.length === 0) return setError("Add at least one area to clean.");
    if (!cleanerId) return setError("Choose who will clean this place.");

    setBusy(true);
    try {
      const { data: property, error: pErr } = await supabase
        .from("properties")
        .insert({ owner_id: profile.id, name: name.trim(), address: address.trim() || null })
        .select("id")
        .single();
      if (pErr) throw pErr;

      const { data: job, error: jErr } = await supabase
        .from("jobs")
        .insert({
          property_id: property.id,
          owner_id: profile.id,
          cleaner_id: cleanerId,
          status: "assigned",
        })
        .select("id")
        .single();
      if (jErr) throw jErr;

      const rows = areas.map((area_name, position) => ({
        job_id: job.id,
        area_name,
        position,
      }));
      const { error: aErr } = await supabase.from("job_areas").insert(rows);
      if (aErr) throw aErr;

      router.replace("/(owner)");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create the job.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + spacing.xl }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>Place name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Smith apartment"
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Address (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Street, city"
          placeholderTextColor={colors.textMuted}
          value={address}
          onChangeText={setAddress}
        />

        <Text style={styles.label}>Assign to cleaner</Text>
        {cleaners.length === 0 ? (
          <Text style={styles.hint}>
            No cleaners have signed up yet. Ask your cleaner to create a
            "I do the cleaning" account first.
          </Text>
        ) : (
          <View style={styles.chips}>
            {cleaners.map((c) => {
              const selected = cleanerId === c.id;
              return (
                <Pressable
                  key={c.id}
                  onPress={() => setCleanerId(c.id)}
                  style={[styles.chip, selected && styles.chipSelected]}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                    {c.full_name ?? "Cleaner"}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        <Text style={styles.label}>Areas to film ({areas.length})</Text>
        <Text style={styles.hint}>
          The cleaner will be asked to record a short video of each area, one by
          one. Add or remove to match this place.
        </Text>
        <View style={styles.areaList}>
          {areas.map((a, i) => (
            <View key={`${a}-${i}`} style={styles.areaRow}>
              <Text style={styles.areaName}>
                {i + 1}. {a}
              </Text>
              <Pressable onPress={() => removeArea(i)} hitSlop={8}>
                <Text style={styles.remove}>Remove</Text>
              </Pressable>
            </View>
          ))}
        </View>
        <View style={styles.addRow}>
          <TextInput
            style={[styles.input, styles.addInput]}
            placeholder="Add an area (e.g. Balcony)"
            placeholderTextColor={colors.textMuted}
            value={newArea}
            onChangeText={setNewArea}
            onSubmitEditing={addArea}
            returnKeyType="done"
          />
          <Pressable onPress={addArea} style={styles.addBtn}>
            <Text style={styles.addBtnText}>Add</Text>
          </Pressable>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <BigButton label="Create job" onPress={create} loading={busy} style={styles.create} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.lg, gap: spacing.sm },
  label: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginTop: spacing.md,
  },
  hint: { fontSize: 14, color: colors.textMuted, marginBottom: spacing.xs },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 17,
    color: colors.text,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  chipSelected: { borderColor: colors.primary, backgroundColor: colors.primary + "12" },
  chipText: { fontSize: 16, color: colors.text, fontWeight: "600" },
  chipTextSelected: { color: colors.primaryDark },
  areaList: { gap: spacing.xs },
  areaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  areaName: { fontSize: 16, color: colors.text },
  remove: { color: colors.danger, fontWeight: "600" },
  addRow: { flexDirection: "row", gap: spacing.sm, alignItems: "center" },
  addInput: { flex: 1 },
  addBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  addBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  error: { color: colors.danger, fontSize: 15, marginTop: spacing.sm },
  create: { marginTop: spacing.lg },
});
