import { z } from 'zod';
import { antiScriptRefine } from '@/utils/sanitize';

export const scheduleFormSchema = z.object({
  nodeId: antiScriptRefine(z.string().min(1, 'Pilih Node ID terlebih dahulu')),
  location: antiScriptRefine(z.string().min(1, 'Lokasi kebun wajib terisi')),
  startTime: z.string().min(1, 'Waktu mulai nyala wajib diisi'),
  endTime: z.string().min(1, 'Waktu akhir nyala wajib diisi'),
  intensity: z.number().min(0).max(100),
  description: z
    .string()
    .max(250, 'Keterangan maksimal 250 karakter')
    .optional()
    .refine((val) => !val || antiScriptRefine(z.string()).safeParse(val).success, {
      message: 'Input mengandung karakter atau tag yang tidak diizinkan.',
    }),
});

export type ScheduleFormInput = z.infer<typeof scheduleFormSchema>;
