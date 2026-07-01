import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "@/lib/auth";
import { colors } from "@/lib/theme";

function RootNavigator() {
  const { session, profile, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const group = segments[0]; // "(auth)" | "(owner)" | "(cleaner)" | undefined
    const inAuth = group === "(auth)";

    if (!session) {
      if (!inAuth) router.replace("/(auth)/login");
      return;
    }

    // Signed in but profile still loading or missing — wait for it.
    if (!profile) return;

    const home = profile.role === "owner" ? "/(owner)" : "/(cleaner)";
    const inMyArea = group === `(${profile.role})`;
    if (!inMyArea) router.replace(home);
  }, [session, profile, loading, segments, router]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(owner)" />
      <Stack.Screen name="(cleaner)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg,
  },
});
