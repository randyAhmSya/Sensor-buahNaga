import { z } from 'zod'

export const blockFormSchema = z.object({
  name: z
    .string()
    .min(3, 'Nama blok minimal 3 karakter')
    .max(60, 'Nama blok maksimal 60 karakter'),
  nodeSensor: z
    .string()
    .min(3, 'ID Node sensor wajib diisi')
    .max(30, 'Maksimal 30 karakter'),
  description: z
    .string()
    .min(10, 'Keterangan blok minimal 10 karakter')
    .max(300, 'Maksimal 300 karakter'),
  area: z.string().optional(),
  harvestEstimate: z.string().optional(),
  imageUrl: z.string().min(1, 'Foto blok wajib diisi atau diunggah'),
  status: z.enum(['Online', 'Offline']),
})

export type BlockFormInput = z.infer<typeof blockFormSchema>
