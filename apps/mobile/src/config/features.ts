/**
 * Konfigurasi saklar fitur aplikasi (Feature Flags).
 * Default FITUR_LANGGANAN bernilai false jika variabel lingkungan tidak diset atau bernilai selain 'true'.
 */
export const FITUR_LANGGANAN: boolean =
  process.env.EXPO_PUBLIC_FITUR_LANGGANAN === "true";

