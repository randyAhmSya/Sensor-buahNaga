import React, { memo, useCallback } from "react";
import { Text, useWindowDimensions, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Tabs, useRouter } from "expo-router";
import { TAB_CONFIG, TAB_COLORS } from "@/constant/Tabs";
import { Floating_Shadow } from "@/constant/styles";
import { PressableOpacity } from "@/component/ui/PressableOpacity";

type TabBarRenderFn = NonNullable<React.ComponentProps<typeof Tabs>["tabBar"]>;
type FloatingTabBarProps = Parameters<TabBarRenderFn>[0];

export function FloatingTabBar({ state, navigation }: FloatingTabBarProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const rowWidth = Math.min(width - 32, 420);

  return (
    <View
      className="absolute self-center flex-row items-center z-50"
      style={{ width: rowWidth, bottom: Math.max(insets.bottom, 16), gap: 12 }}
      pointerEvents="box-none"
    >
      <View
        className="flex-1 flex-row justify-between rounded-full bg-white px-3 py-2.5"
        style={Floating_Shadow}
      >
        {state.routes.map((route, index) => {
          const config = TAB_CONFIG[route.name];
          if (!config) return null;

          const isFocused = state.index === index;

          return (
            <TabButton
              key={route.key}
              routeKey={route.key}
              routeName={route.name}
              label={config.label}
              icon={config.icon}
              activeIcon={config.activeIcon}
              isActive={isFocused}
              navigation={navigation}
            />
          );
        })}
      </View>

      <ScanButton />
    </View>
  );
}

const TabButton = memo(function TabButton({
  routeKey,
  routeName,
  label,
  icon,
  activeIcon,
  isActive,
  navigation,
}: {
  routeKey: string;
  routeName: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  isActive: boolean;
  navigation: FloatingTabBarProps["navigation"];
}) {
  const handlePress = useCallback(() => {
    const event = navigation.emit({
      type: "tabPress",
      target: routeKey,
      canPreventDefault: true,
    });
    if (!isActive && !event.defaultPrevented) {
      navigation.navigate(routeName);
    }
  }, [navigation, routeKey, routeName, isActive]);

  return (
    <PressableOpacity
      onPress={handlePress}
      activeOpacity={0.6}
      className="flex-1 items-center justify-center py-1"
      hitSlop={8}
      android_ripple={{ color: "rgba(0,0,0,0.06)", borderless: true }}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={label}
    >
      <View className="items-center gap-1">
        <Ionicons
          name={isActive ? activeIcon : icon}
          size={22}
          color={isActive ? TAB_COLORS.active : TAB_COLORS.inactive}
        />
        <Text
          className="text-[11px] font-medium"
          style={{ color: isActive ? TAB_COLORS.active : TAB_COLORS.inactive }}
        >
          {label}
        </Text>
      </View>
    </PressableOpacity>
  );
});

function ScanButton() {
  const router = useRouter();

  return (
    <PressableOpacity
      onPress={() => router.push("/scan")}
      activeOpacity={0.85}
      style={[{ backgroundColor: TAB_COLORS.scanBackground }, Floating_Shadow]}
      className="h-14 w-14 items-center justify-center rounded-full"
      android_ripple={{ color: "rgba(255,255,255,0.2)", borderless: true }}
      accessibilityRole="button"
      accessibilityLabel="Scan"
    >
      <Ionicons name="scan-outline" size={24} color={TAB_COLORS.scanIcon} />
    </PressableOpacity>
  );
}
