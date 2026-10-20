import { z } from 'zod';

export const scheduleFormSchema = z.object({
  scope: z.enum(['kebun', 'node']).default('kebun'),
  farmId: z.string().optional(),
  nodeId: z.string().optional(),
  location: z.string().optional(),
  startTime: z.string().min(1, 'Waktu mulai nyala wajib diisi'),
  endTime: z.string().min(1, 'Waktu akhir nyala wajib diisi'),
  intensity: z.number().min(0).max(100),
  description: z
    .string()
    .max(250, 'Keterangan maksimal 250 karakter')
    .optional(),
});

export type ScheduleFormInput = z.infer<typeof scheduleFormSchema>;

