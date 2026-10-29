import { useCallback, useEffect, useState } from "react";
import {
  fetchAccountProfile,
  updateAccountProfile,
} from "@/service/accountSettingService";

type AccountSettingsState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success" };

interface UseAccountSettingsReturn {
  state: AccountSettingsState;
  fullName: string;
  setFullName: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  currentPassword: string;
  setCurrentPassword: (value: string) => void;
  newPassword: string;
  setNewPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  isSaving: boolean;
  save: () => Promise<void>;
}

export function useAccountSettings(): UseAccountSettingsReturn {
  const [state, setState] = useState<AccountSettingsState>({
    status: "loading",
  });
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    fetchAccountProfile()
      .then((profile) => {
        if (cancelled) return;
        setFullName(profile.fullName);
        setPhone(profile.phone);
        setEmail(profile.email);
        setState({ status: "success" });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({
          status: "error",
          message: err instanceof Error ? err.message : "Gagal memuat profil",
        });
      });

    // Cegah setState setelah unmount kalau fetch masih jalan pas screen ditutup
    return () => {
      cancelled = true;
    };
  }, []);

  const save = useCallback(async () => {
    setIsSaving(true);
    try {
      await updateAccountProfile({
        fullName,
        phone,
        email,
        newPassword: newPassword || undefined,
      });
    } finally {
      setIsSaving(false);
    }
  }, [fullName, phone, email, newPassword]);

  return {
    state,
    fullName,
    setFullName,
    phone,
    setPhone,
    email,
    setEmail,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    isSaving,
    save,
  };
}
