import React from "react";
import { View, type ViewProps } from "react-native";
import { Card_Shadow } from "@/constant/styles";
import { radius } from "@/theme/tokens";

interface CardProps extends ViewProps {
  className?: string;
}

export function Card({ className = "", style, children, ...rest }: CardProps) {
  return (
    <View
      className={`rounded-lg bg-white border border-slate-200 ${className}`}
      style={[{ borderRadius: radius.card }, Card_Shadow, style]}
      {...rest}
    >
      {children}
    </View>
  );
}
