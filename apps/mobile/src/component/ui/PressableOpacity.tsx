import React from "react";
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

interface PressableOpacityProps extends Omit<PressableProps, "style"> {
  activeOpacity?: number;
  style?:
    | StyleProp<ViewStyle>
    | ((state: { pressed: boolean }) => StyleProp<ViewStyle>);
}

export function PressableOpacity({
  activeOpacity = 0.7,
  style,
  ...rest
}: PressableOpacityProps) {
  return (
    <Pressable
      style={(state) => [
        { opacity: state.pressed ? activeOpacity : 1 },
        typeof style === "function" ? style(state) : style,
      ]}
      {...rest} // <-- Tambahkan ini agar children dan event onPress dapat berfungsi
    />
  );
}
