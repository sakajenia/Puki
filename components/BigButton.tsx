import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, ctaGradient, radius, shadow, spacing } from "@/lib/theme";

type Variant = "primary" | "success" | "danger" | "neutral";

const BG: Record<Exclude<Variant, "primary">, string> = {
  success: colors.success,
  danger: colors.danger,
  neutral: "rgba(255,255,255,0.06)",
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
  const darkLabel = variant === "success"; // bright mint reads best with dark text

  const content = loading ? (
    <ActivityIndicator color={isNeutral ? colors.text : darkLabel ? "#052E1B" : "#fff"} />
  ) : (
    <Text
      style={[
        styles.label,
        isNeutral && styles.neutralLabel,
        darkLabel && styles.darkLabel,
      ]}
    >
      {label}
    </Text>
  );

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.shadowWrap,
        variant === "primary" && shadow.button,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {variant === "primary" ? (
        <LinearGradient
          colors={ctaGradient}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.btn}
        >
          {content}
        </LinearGradient>
      ) : (
        <View
          style={[styles.btn, { backgroundColor: BG[variant] }, isNeutral && styles.neutral]}
        >
          {content}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    borderRadius: radius.pill,
  },
  btn: {
    minHeight: 58,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  neutral: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.5 },
  label: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  neutralLabel: { color: colors.text },
  darkLabel: { color: "#052E1B" },
});
