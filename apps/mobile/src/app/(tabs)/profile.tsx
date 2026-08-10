import React from "react";
import { ScrollView } from "react-native";
import { AsyncStateView } from "@/component/ui/AsyncStateView";
import { ProfileHeader } from "@/component/profile/ProfileHeader";
import { useProfile } from "@/hooks/useProfile";
import { ProfileCard } from "@/component/profile/ProfileCard";
import { ProfileStats } from "@/component/profile/ProfileStats";
import { ProfileMenu } from "@/component/profile/ProfileMenu";
import { LogoutButton } from "@/component/profile/LogoutButton";
import { router } from "expo-router";

export default function ProfileScreen() {
  const { state, refetch } = useProfile();

  if (state.status === "loading") return <AsyncStateView status="loading" />;
  if (state.status === "error") {
    return (
      <AsyncStateView
        status="error"
        errorMessage={state.message}
        onRetry={refetch}
      />
    );
  }

  const { user, menu } = state.data;

  return (
    <>
      <ProfileHeader onSettingsPress={() => console.log("settings")} />
      <ProfileCard user={user} />
      <ProfileStats user={user} />
      <ScrollView
        className="flex-1 bg-gray-50"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <ProfileMenu
          items={menu}
          onItemPress={(key) => {
            switch (key) {
              case "notifications":
                router.push("/profile/notification");
                break;

              case "account-settings":
                router.push("/profile/account-setting");
                break;

              default:
                console.log("menu tidak tersedia:", key);
            }
          }}
        />
        <LogoutButton onPress={() => console.log("logout")} />
      </ScrollView>
    </>
  );
}
