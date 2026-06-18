import { Stack } from "expo-router";
import { colors } from "@/lib/theme";

export default function OwnerLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="new-job" options={{ title: "New cleaning job" }} />
      <Stack.Screen name="job/[id]" options={{ title: "Review" }} />
    </Stack>
  );
}
