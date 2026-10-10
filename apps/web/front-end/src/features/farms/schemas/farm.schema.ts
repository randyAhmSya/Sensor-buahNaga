import { z } from 'zod'
import { antiScriptRefine } from '@/utils/sanitize'

export const createFarmSchema = z.object({
  name: antiScriptRefine(
    z
      .string()
      .min(3, 'Nama kebun minimal 3 karakter')
      .max(60, 'Nama kebun maksimal 60 karakter')
  ),
  location: antiScriptRefine(
    z
      .string()
      .min(5, 'Lokasi kebun minimal 5 karakter')
      .max(120, 'Lokasi kebun maksimal 120 karakter')
  ),
  description: antiScriptRefine(
    z
      .string()
      .max(300, 'Keterangan kebun maksimal 300 karakter')
      .optional()
      .default('')
  ),
  imageUrl: z.string().optional().nullable().default(''),
  status: z.enum(['Aktif', 'Inaktif'], {
    message: 'Pilih status kebun yang valid',
  }),
  gpsCoordinates: z.string().optional().nullable(),
  additionalNotes: z
    .string()
    .max(200, 'Catatan maksimal 200 karakter')
    .optional()
    .nullable()
    .refine((val) => !val || antiScriptRefine(z.string()).safeParse(val).success, {
      message: 'Input mengandung karakter atau tag yang tidak diizinkan.',
    }),
})

export type CreateFarmInput = z.infer<typeof createFarmSchema>
