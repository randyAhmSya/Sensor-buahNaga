import { useEffect, useRef, type FC } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "@/services/authService";
import {
  useAuthStore,
  mapBackendUserToUserProfile,
} from "@/store/useAuthStore";
import { PageLoadingSpinner } from "@/components/common/PageLoadingSpinner";

/**
 * Tujuan redirect dari backend setelah Google: /auth/google/callback?kode=...
 * Kode hanya berlaku sekali (60 dtk), jadi penukaran dijaga agar tidak jalan dua kali.
 */
export const GoogleCallbackPage: FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const sudahDipanggil = useRef(false);

  useEffect(() => {
    if (sudahDipanggil.current) return;
    sudahDipanggil.current = true;

    const kode = params.get("kode");
    if (!kode) {
      navigate("/login?google_error=state_tidak_valid", { replace: true });
      return;
    }

    authService
      .googleTukar(kode)
      .then((res) => {
        const data = res?.data;
        if (!data?.user || !data.token)
          throw new Error("Respons tidak lengkap");

        const profile = mapBackendUserToUserProfile({
          ...data.user,
          role: data.role || data.user.role,
        });
        login(profile, data.token);
        navigate(
          profile.profileComplete === false
            ? "/lengkapi-profil"
            : "/kebun/farms",
          { replace: true },
        );
      })
      .catch(() =>
        navigate("/login?google_error=gagal_google", { replace: true }),
      );
  }, [params, navigate, login]);

  return <PageLoadingSpinner />;
};

export default GoogleCallbackPage;
