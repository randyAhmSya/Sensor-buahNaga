import { z } from 'zod'

export const profileInfoSchema = z.object({
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
})

export type ProfileInfoFormData = z.infer<typeof profileInfoSchema>

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(8, 'Password lama minimal 8 karakter'),
    newPassword: z
      .string()
      .min(8, 'Password baru minimal 8 karakter')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password baru wajib kombinasi huruf besar, huruf kecil, dan angka'
      ),
    confirmPassword: z
      .string()
      .min(1, 'Konfirmasi password baru wajib diisi'),
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: 'Password baru tidak boleh sama dengan password lama',
    path: ['newPassword'],
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Konfirmasi password tidak cocok dengan password baru',
    path: ['confirmPassword'],
  })

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
