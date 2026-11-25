import { useState, type FC, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Phone, Sprout } from "lucide-react";
import { BrandLogo } from "@/components/common/BrandLogo";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/form/InputField";
import { useAuthStore } from "@/store/useAuthStore";
import { authService } from "@/services/authService";
import { ApiError } from "@/services/api";
import { sanitizeInput } from "@/utils/sanitize";

const POLA_HP = /^(\+62|62|0)8[0-9]{7,12}$/;

/** Wajib diisi oleh akun baru hasil login Google sebelum masuk dasbor. */
export const LengkapiProfilPage: FC = () => {
  const { user, isAuthenticated, token, login } = useAuthStore();
  const navigate = useNavigate();
  const [namaKebun, setNamaKebun] = useState("");
  const [noHp, setNoHp] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [umum, setUmum] = useState<string | null>(null);
  const [mengirim, setMengirim] = useState(false);

  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (user.profileComplete !== false)
    return <Navigate to="/kebun/farms" replace />;

  const kirim = async (e: FormEvent) => {
    e.preventDefault();
    const nama = sanitizeInput(namaKebun).trim();
    const hp = noHp.replace(/[\s-]/g, "");
    const baru: Record<string, string> = {};
    if (!nama) baru.nama_tenant = "Nama kebun wajib diisi.";
    if (!POLA_HP.test(hp))
      baru.nomor_telepon = "Nomor HP tidak valid. Contoh: 081234567890";
    setErrors(baru);
    setUmum(null);
    if (Object.keys(baru).length > 0) return;

    setMengirim(true);
    try {
      await authService.lengkapiProfil({
        nama_tenant: nama,
        nomor_telepon: hp,
      });
      if (token) login({ ...user, profileComplete: true }, token);
      navigate("/kebun/farms", { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setUmum(err.pesan || "Gagal menyimpan profil.");
        if (err.errors) {
          setErrors(
            Object.fromEntries(
              Object.entries(err.errors).map(([k, v]) => [k, v[0]]),
            ),
          );
        }
      } else {
        setUmum("Gagal menyimpan profil. Coba lagi.");
      }
    } finally {
      setMengirim(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
        <div className="mb-6">
          <BrandLogo variant="dark" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Satu langkah lagi
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Halo, {user.name}. Lengkapi data berikut sebelum mulai memakai dasbor
          AgroLight.
        </p>

        {umum && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700"
          >
            {umum}
          </div>
        )}

        <form onSubmit={kirim} className="space-y-4 mt-6">
          <InputField
            label="Nama Kebun / Usaha"
            name="nama_tenant"
            required
            value={namaKebun}
            onChange={(e) => setNamaKebun(e.target.value)}
            placeholder="mis. Kebun Naga Sejahtera"
            leftIcon={<Sprout className="w-4 h-4 text-slate-400" />}
            error={errors.nama_tenant}
          />
          <InputField
            label="Nomor HP"
            name="nomor_telepon"
            type="tel"
            required
            value={noHp}
            onChange={(e) => setNoHp(e.target.value)}
            placeholder="081234567890"
            leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
            error={errors.nomor_telepon}
          />
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={mengirim}
            className="w-full justify-center bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-xl cursor-pointer"
          >
            Simpan dan Lanjutkan
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LengkapiProfilPage;
