import React from "react";
import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface ProgressRingProps {
  /** 0..1 */
  progress: number;
  size?: number;
  strokeWidth?: number;
  trackColor?: string;
  color?: string;
  children?: React.ReactNode;
}

/** Cincin progres tipis (gaya kartu ringkasan modern); isi tengah lewat children. */
export function ProgressRing({
  progress,
  size = 36,
  strokeWidth = 3,
  trackColor = "rgba(255, 255, 255, 0.2)",
  color = "#6EE7B7",
  children,
}: ProgressRingProps) {
  const p = Math.max(0, Math.min(1, Number.isFinite(progress) ? progress : 0));
  const r = (size - strokeWidth) / 2;
  const keliling = 2 * Math.PI * r;

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${keliling * p} ${keliling}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {children}
    </View>
  );
}
