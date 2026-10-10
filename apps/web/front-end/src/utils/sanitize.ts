import { z } from 'zod'

/**
 * Pesan validasi standar anti-script / XSS sesuai pedoman keamanan AgroLight
 */
export const XSS_ERROR_MESSAGE = 'Input mengandung karakter atau tag yang tidak diizinkan.'

/**
 * Regex komprehensif untuk mendeteksi upaya injeksi skrip XSS dan payload HTML berbahaya:
 * 1. Tag script (<script...>, </script>)
 * 2. Pseudo-protocols (javascript:, data:text/html, vbscript:)
 * 3. Inline HTML event handlers (onerror=, onload=, onclick=, onmouseover=, onfocus=, dll.)
 * 4. Tag objek berbahaya (iframe, object, embed, meta, svg onload)
 * 5. Eksekusi skrip berbahaya (eval(), document.cookie, window.location)
 */
const SCRIPT_INJECTION_PATTERNS = [
  /<\s*script\b[^>]*>[\s\S]*?<\s*\/\s*script\s*>/i,
  /<\s*script\b/i,
  /<\s*\/\s*script\s*>/i,
  /javascript\s*:/i,
  /data\s*:\s*text\/html/i,
  /vbscript\s*:/i,
  /\bon[a-z]{3,}\s*=/i, // menangkap event handlers: onerror=, onload=, onclick=, dsb.
  /<\s*(?:iframe|object|embed|applet|meta|link|base)\b/i,
  /<\s*svg\b[^>]*\bon\w+\s*=/i,
  /<\s*img\b[^>]*\bon\w+\s*=/i,
  /document\s*\.\s*(?:cookie|location|write)/i,
  /window\s*\.\s*(?:location|navigate)/i,
  /\beval\s*\(/i,
]

/**
 * Memeriksa apakah suatu string terindikasi mengandung script injeksi berbahaya
 */
export const containsMaliciousScript = (value: unknown): boolean => {
  if (typeof value !== 'string') return false
  if (!value) return false
  return SCRIPT_INJECTION_PATTERNS.some((pattern) => pattern.test(value))
}

/**
 * Validator boolean: bernilai true jika input aman dari injeksi script
 */
export const isSafeText = (value: unknown): boolean => {
  return !containsMaliciousScript(value)
}

/**
 * Helper Zod Refinement untuk memvalidasi string aman dari script berbahaya secara global.
 * Menghasilkan pesan error: "Input mengandung karakter atau tag yang tidak diizinkan."
 */
export const antiScriptRefine = <T extends z.ZodTypeAny>(
  schema: T,
  customMessage = XSS_ERROR_MESSAGE
) => {
  return schema.refine((val) => !containsMaliciousScript(val), {
    message: customMessage,
  })
}

/**
 * Membersihkan input teks dari tag HTML dan pola berbahaya.
 * PENTING: Tidak memotong spasi saat pengguna sedang mengetik (trim = false secara default)
 * agar kursor dan spasi antar-kata tidak terpotong saat event onChange.
 */
export const sanitizeInput = (
  value: string,
  options: { trim?: boolean } = { trim: false }
): string => {
  if (typeof value !== 'string') return ''

  let cleaned = value
    // Hapus script tag beserta isinya
    .replace(/<\s*script\b[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '')
    // Hapus tag HTML (<...>)
    .replace(/<[^>]*>?/gm, '')
    // Hapus pseudo-protocol berbahaya
    .replace(/javascript\s*:/gi, '')
    .replace(/data\s*:\s*text\/html/gi, '')
    .replace(/vbscript\s*:/gi, '')
    // Netralkan event handler seperti onerror=, onload=
    .replace(/\bon[a-z]{3,}\s*=/gi, '')

  if (options.trim) {
    cleaned = cleaned.trim()
  }

  return cleaned
}

/**
 * Sanitasi rekursif untuk seluruh properti string dalam suatu objek (misal payload form sebelum submit)
 */
export const sanitizeObject = <T extends Record<string, unknown>>(
  data: T,
  trimStrings = true
): T => {
  const result: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(data)) {
    if (typeof val === 'string') {
      result[key] = sanitizeInput(val, { trim: trimStrings })
    } else if (val && typeof val === 'object' && !Array.isArray(val) && !(val instanceof File)) {
      result[key] = sanitizeObject(val as Record<string, unknown>, trimStrings)
    } else {
      result[key] = val
    }
  }
  return result as T
}
