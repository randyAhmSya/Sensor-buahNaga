import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid'),
  password: z
    .string()
    .min(1, 'Password wajib diisi')
    .min(8, 'Password minimal 8 karakter'),
  rememberMe: z.boolean().optional(),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(3, 'Nama lengkap minimal 3 karakter')
      .max(60, 'Nama lengkap maksimal 60 karakter')
      .regex(
        /^[a-zA-Z\s.,'-]+$/,
        'Nama hanya boleh mengandung huruf, spasi, dan tanda baca nama standar'
      ),
    email: z
      .string()
      .min(1, 'Email wajib diisi')
      .email('Format email tidak valid'),
    phone: z
      .string()
      .regex(
        /^(\+62|62|08)[0-9]{8,13}$/,
        'Format telepon Indonesia tidak valid (10-15 digit, diawali 08 atau +62)'
      ),
    password: z
      .string()
      .min(8, 'Password minimal 8 karakter')
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d)/,
        'Password wajib kombinasi huruf dan angka'
      ),
    confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
    agreedToTerms: z
      .boolean()
      .refine((val) => val === true, 'Anda harus menyetujui Syarat & Ketentuan'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Konfirmasi password tidak cocok dengan password',
    path: ['confirmPassword'],
  })

export type RegisterFormData = z.infer<typeof registerSchema>
