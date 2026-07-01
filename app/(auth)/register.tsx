import { useState } from "react";
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
import { Link } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BigButton } from "@/components/BigButton";
import { GradientBG } from "@/components/GradientBG";
import { useAuth } from "@/lib/auth";
import { colors, radius, spacing } from "@/lib/theme";
import type { Role } from "@/lib/types";

const ROLES: { value: Role; title: string; subtitle: string; emoji: string }[] = [
  {
    value: "owner",
    title: "I manage cleanings",
    subtitle: "Owner or agency — watch the videos",
    emoji: "🏠",
  },
  {
    value: "cleaner",
    title: "I do the cleaning",
    subtitle: "Record a video of each room",
    emoji: "🧹",
  },
];

export default function Register() {
  const { signUp } = useAuth();
  const insets = useSafeAreaInsets();
  const [role, setRole] = useState<Role>("owner");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setError(null);
    if (!fullName.trim()) return setError("Please enter your name.");
    if (password.length < 6)
      return setError("Password must be at least 6 characters.");
    setBusy(true);
    try {
      await signUp({ email, password, fullName, role });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create account.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <GradientBG>
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + spacing.lg },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Create your account</Text>

        <Text style={styles.label}>I am…</Text>
        <View style={styles.roles}>
          {ROLES.map((r) => {
            const selected = role === r.value;
            return (
              <Pressable
                key={r.value}
                onPress={() => setRole(r.value)}
                style={[styles.roleCard, selected && styles.roleCardSelected]}
              >
                <Text style={styles.roleEmoji}>{r.emoji}</Text>
                <Text style={styles.roleTitle}>{r.title}</Text>
                <Text style={styles.roleSubtitle}>{r.subtitle}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Full name"
            placeholderTextColor={colors.textMuted}
            value={fullName}
            onChangeText={setFullName}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Password (min 6 characters)"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <BigButton label="Create account" onPress={onSubmit} loading={busy} />

          <Link href="/(auth)/login" style={styles.link}>
            <Text style={styles.linkText}>Already have an account? Log in</Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </GradientBG>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.text,
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  roles: { gap: spacing.md, marginBottom: spacing.lg },
  roleCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.md,
  },
  roleCardSelected: {
    borderColor: colors.primary,
    backgroundColor: "rgba(139,92,246,0.14)",
  },
  roleEmoji: { fontSize: 30 },
  roleTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: colors.text,
    marginTop: 4,
  },
  roleSubtitle: { fontSize: 14, color: colors.textMuted, marginTop: 2 },
  form: { gap: spacing.md },
  input: {
    backgroundColor: colors.bgSubtle,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 18,
    color: colors.text,
  },
  error: { color: colors.danger, fontSize: 15 },
  link: { alignSelf: "center", marginTop: spacing.md },
  linkText: { color: colors.primary, fontSize: 16, fontWeight: "600" },
});
