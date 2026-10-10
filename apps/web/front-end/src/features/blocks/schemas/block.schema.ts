import { z } from 'zod'
import { antiScriptRefine } from '@/utils/sanitize'

export const blockFormSchema = z.object({
  name: antiScriptRefine(
    z
      .string()
      .min(3, 'Nama blok minimal 3 karakter')
      .max(60, 'Nama blok maksimal 60 karakter')
  ),
  nodeSensor: z
    .string()
    .optional()
    .default(''),
  description: antiScriptRefine(
    z
      .string()
      .max(300, 'Maksimal 300 karakter')
      .optional()
      .default('')
  ),
  area: z
    .string()
    .optional()
    .refine((val) => !val || antiScriptRefine(z.string()).safeParse(val).success, {
      message: 'Input mengandung karakter atau tag yang tidak diizinkan.',
    }),
  harvestEstimate: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable().default(''),
  status: z.enum(['Online', 'Offline']),
})

export type BlockFormInput = z.infer<typeof blockFormSchema>
