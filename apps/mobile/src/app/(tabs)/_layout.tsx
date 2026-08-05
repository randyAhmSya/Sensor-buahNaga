import { Tabs } from "expo-router";
import { FloatingTabBar } from "@/component/tabBar/FloatingTabBar";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <FloatingTabBar {...props} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="monitoring" />

      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
