import { ActivityIndicator, StyleSheet, View } from "react-native";
import { colors } from "@/lib/theme";

/**
 * Landing route. The redirect logic in app/_layout.tsx sends the user to the
 * right place (login / owner / cleaner) once auth state is known, so this just
 * shows a spinner in the meantime.
 */
export default function Index() {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
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
