import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchNotificationSettings,
  updateNotificationSetting,
} from "@/service/notificationService";
import type { NotificationSetting } from "@/constant/NotificationSetting";

type NotificationSettingState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "success";
      data: NotificationSetting[];
    };

interface UseNotificationSettingReturn {
  state: NotificationSettingState;
  toggleNotification: (id: string, active: boolean) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useNotificationSetting(): UseNotificationSettingReturn {
  const [state, setState] = useState<NotificationSettingState>({
    status: "loading",
  });
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const load = useCallback(async () => {
    setState({ status: "loading" });

    try {
      const data = await fetchNotificationSettings();
      if (isMountedRef.current) {
        setState({
          status: "success",
          data,
        });
      }
    } catch (err) {
      if (isMountedRef.current) {
        setState({
          status: "error",
          message:
            err instanceof Error
              ? err.message
              : "Gagal memuat pengaturan notifikasi",
        });
      }
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleNotification = useCallback(
    async (id: string, active: boolean) => {
      if (state.status !== "success") return;

      // Optimistic update:
      // UI langsung berubah tanpa menunggu request selesai.
      setState({
        status: "success",
        data: state.data.map((item) =>
          item.id === id ? { ...item, active } : item,
        ),
      });

      try {
        await updateNotificationSetting(id, active);
      } catch (err) {
        // Kalau API gagal, ambil ulang data
        // supaya UI kembali ke kondisi server.
        await load();
      }
    },
    [state, load],
  );

  return {
    state,
    toggleNotification,
    refetch: load,
  };
}
