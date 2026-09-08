import { z } from 'zod';

export const scheduleFormSchema = z.object({
  nodeId: z.string().min(1, 'Pilih Node ID terlebih dahulu'),
  location: z.string().min(1, 'Lokasi kebun wajib terisi'),
  startTime: z.string().min(1, 'Waktu mulai nyala wajib diisi'),
  endTime: z.string().min(1, 'Waktu akhir nyala wajib diisi'),
  intensity: z.number().min(0).max(100),
  description: z.string().max(250, 'Keterangan maksimal 250 karakter').optional(),
});

export type ScheduleFormInput = z.infer<typeof scheduleFormSchema>;
