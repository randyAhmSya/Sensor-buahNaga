import { z } from 'zod'
import { antiScriptRefine } from '@/utils/sanitize'

export const qrGeneratorSchema = z.object({
  targetType: z.enum(['Sensor', 'Blok'], {
    message: 'Pilih tipe target stiker QR',
  }),
  targetName: antiScriptRefine(
    z
      .string()
      .min(3, { message: 'Nama target / identitas perangkat minimal 3 karakter' })
  ),
  blockId: antiScriptRefine(
    z
      .string()
      .min(1, { message: 'Pilih blok lahan buah naga terkait' })
  ),
  technicianName: antiScriptRefine(
    z
      .string()
      .min(2, { message: 'Nama teknisi / petani penanggung jawab wajib diisi' })
  ),
  batchQuantity: z
    .number({ message: 'Jumlah cetak harus berupa angka' })
    .int()
    .min(1, { message: 'Minimal cetak 1 stiker' })
    .max(200, { message: 'Maksimal 200 stiker per batch cetak' }),
  notes: z
    .string()
    .max(200, { message: 'Catatan maksimal 200 karakter' })
    .optional()
    .refine((val) => !val || antiScriptRefine(z.string()).safeParse(val).success, {
      message: 'Input mengandung karakter atau tag yang tidak diizinkan.',
    }),
})

export type QrGeneratorFormValues = z.infer<typeof qrGeneratorSchema>
