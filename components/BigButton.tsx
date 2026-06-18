import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { colors, radius, spacing } from "@/lib/theme";

type Variant = "primary" | "success" | "danger" | "neutral";

const BG: Record<Variant, string> = {
  primary: colors.primary,
  success: colors.success,
  danger: colors.danger,
  neutral: colors.surface,
};

export function BigButton({
  label,
  onPress,
  variant = "primary",
  disabled,
  loading,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const isNeutral = variant === "neutral";
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: BG[variant] },
        isNeutral && styles.neutral,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isNeutral ? colors.text : "#fff"} />
      ) : (
        <Text style={[styles.label, isNeutral && styles.neutralLabel]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    minHeight: 60,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  neutral: {
    borderWidth: 2,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
  label: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  neutralLabel: { color: colors.text },
});
