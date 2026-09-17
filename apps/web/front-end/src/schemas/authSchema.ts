import { z } from 'zod'
import { antiScriptRefine } from '@/utils/sanitize'

export const loginSchema = z.object({
  email: antiScriptRefine(
    z
      .string()
      .min(1, { message: 'Alamat email wajib diisi' })
      .email({ message: 'Format alamat email tidak valid' })
  ),
  password: z
    .string()
    .min(1, { message: 'Kata sandi wajib diisi' })
    .min(6, { message: 'Kata sandi minimal 6 karakter' }),
  rememberMe: z.boolean().optional(),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    name: antiScriptRefine(
      z.string().min(2, { message: 'Nama lengkap minimal 2 karakter' })
    ),
    email: antiScriptRefine(
      z
        .string()
        .min(1, { message: 'Alamat email wajib diisi' })
        .email({ message: 'Format alamat email tidak valid' })
    ),
    password: z
      .string()
      .min(8, { message: 'Kata sandi minimal 8 karakter' }),
    confirmPassword: z.string().min(1, { message: 'Konfirmasi kata sandi wajib diisi' }),
    tenantName: antiScriptRefine(
      z.string().min(3, { message: 'Nama perusahaan / kebun minimal 3 karakter' })
    ),
    role: z.enum(['ADMIN_KEBUN', 'PETANI', 'AGRONOM'], {
      message: 'Pilih peran pengguna',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Konfirmasi kata sandi tidak cocok',
    path: ['confirmPassword'],
  })

export type RegisterFormValues = z.infer<typeof registerSchema>
