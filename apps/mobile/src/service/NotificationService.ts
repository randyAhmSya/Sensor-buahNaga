import {
  MOCK_NOTIFICATION_SETTINGS,
  type NotificationSetting,
} from "@/constant/NotificationSetting";

const MOCK_DELAY_MS = 400;

// TODO BACKEND: ganti ke GET endpoint notification-settings asli
export async function fetchNotificationSettings(): Promise<
  NotificationSetting[]
> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
  return MOCK_NOTIFICATION_SETTINGS;
}
