import { z } from 'zod'

export const createFarmSchema = z.object({
  name: z
    .string()
    .min(3, 'Nama kebun minimal 3 karakter')
    .max(60, 'Nama kebun maksimal 60 karakter'),
  location: z
    .string()
    .min(5, 'Lokasi kebun minimal 5 karakter')
    .max(120, 'Lokasi kebun maksimal 120 karakter'),
  description: z
    .string()
    .min(10, 'Keterangan kebun minimal 10 karakter')
    .max(300, 'Keterangan kebun maksimal 300 karakter'),
  imageUrl: z
    .string()
    .min(1, 'Foto kebun wajib diunggah atau diisi URL'),
  status: z.enum(['Aktif', 'Inaktif'], {
    message: 'Pilih status kebun yang valid',
  }),
  gpsCoordinates: z.string().optional(),
  additionalNotes: z.string().max(200, 'Catatan maksimal 200 karakter').optional(),
})

export type CreateFarmInput = z.infer<typeof createFarmSchema>
