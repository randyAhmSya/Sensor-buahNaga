import { z } from 'zod';
import { antiScriptRefine } from '@/utils/sanitize';

export const harvestCycleFormSchema = z.object({
  farmName: antiScriptRefine(z.string().min(1, 'Pilih kebun terlebih dahulu')),
  blockName: antiScriptRefine(z.string().min(1, 'Pilih blok lahan')),
  lightingDate: z.string().min(1, 'Tanggal penyinaran wajib diisi'),
  bloomingTargetDays: z
    .number({ message: 'Target hari harus berupa angka' })
    .min(1, 'Target hari minimal 1 hari'),
  estimatedHarvestDate: z.string().min(1, 'Estimasi tanggal panen wajib terisi'),
  notes: z
    .string()
    .max(250, 'Catatan maksimal 250 karakter')
    .optional()
    .refine((val) => !val || antiScriptRefine(z.string()).safeParse(val).success, {
      message: 'Input mengandung karakter atau tag yang tidak diizinkan.',
    }),
});

export const updateHarvestActualSchema = z.object({
  actualHarvestDate: z.string().min(1, 'Tanggal panen aktual wajib diisi'),
  status: z.enum(['Berjalan', 'Selesai']),
  notes: z
    .string()
    .max(250)
    .optional()
    .refine((val) => !val || antiScriptRefine(z.string()).safeParse(val).success, {
      message: 'Input mengandung karakter atau tag yang tidak diizinkan.',
    }),
});

export type HarvestCycleFormInput = z.infer<typeof harvestCycleFormSchema>;
export type UpdateHarvestActualInput = z.infer<typeof updateHarvestActualSchema>;
