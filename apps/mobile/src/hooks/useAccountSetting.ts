import { useCallback, useEffect, useState } from "react";
import {
  changePassword,
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
  tenantName: string | null;
  setTenantName: (value: string) => void;
  currentPassword: string;
  setCurrentPassword: (value: string) => void;
  newPassword: string;
  setNewPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  isSaving: boolean;
  isChangingPassword: boolean;
  saveProfile: () => Promise<void>;
  savePassword: () => Promise<void>;
}

export function useAccountSettings(): UseAccountSettingsReturn {
  const [state, setState] = useState<AccountSettingsState>({
    status: "loading",
  });
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [tenantName, setTenantName] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    fetchAccountProfile()
      .then((profile) => {
        if (cancelled) return;
        setFullName(profile.fullName);
        setPhone(profile.phone);
        setEmail(profile.email);
        setTenantName(profile.tenantName);
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

  const saveProfile = useCallback(async () => {
    setIsSaving(true);
    try {
      const p = await updateAccountProfile({ fullName, phone, tenantName });
      setFullName(p.fullName);
      setPhone(p.phone);
      setTenantName(p.tenantName);
    } finally {
      setIsSaving(false);
    }
  }, [fullName, phone, tenantName]);

  const savePassword = useCallback(async () => {
    setIsChangingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword, confirmPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } finally {
      setIsChangingPassword(false);
    }
  }, [currentPassword, newPassword, confirmPassword]);

  return {
    state,
    fullName,
    setFullName,
    phone,
    setPhone,
    email,
    tenantName,
    setTenantName,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    isSaving,
    isChangingPassword,
    saveProfile,
    savePassword,
  };
}
