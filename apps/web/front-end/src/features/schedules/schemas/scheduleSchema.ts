import { z } from 'zod';

export const scheduleFormSchema = z
  .object({
    scope: z.enum(['kebun', 'node']).default('kebun'),
    farmId: z.string().optional(),
    nodeId: z.string().optional(),
    location: z.string().optional(),
    startTime: z
      .string()
      .min(1, 'Waktu mulai nyala wajib diisi')
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Format waktu mulai harus HH:mm (24 jam)'),
    endTime: z
      .string()
      .min(1, 'Waktu akhir nyala wajib diisi')
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Format waktu akhir harus HH:mm (24 jam)'),
    mode: z.enum(['manual', 'auto']).default('manual'),
    intensity: z
      .number({ message: 'Kecerahan lampu harus berupa angka' })
      .min(0, 'Kecerahan minimal 0%')
      .max(100, 'Kecerahan maksimal 100%')
      .optional(),
    targetLux: z
      .number({ message: 'Target lux harus berupa angka' })
      .min(0, 'Target lux minimal 0')
      .optional(),
    minIntensity: z
      .number({ message: 'Kecerahan minimum harus berupa angka' })
      .min(0, 'Kecerahan minimum minimal 0%')
      .max(100, 'Kecerahan minimum maksimal 100%')
      .default(10)
      .optional(),
    baselineManualPersen: z
      .number({ message: 'Kecerahan pembanding harus berupa angka' })
      .min(0, 'Kecerahan pembanding minimal 0%')
      .max(100, 'Kecerahan pembanding maksimal 100%')
      .optional(),
    statusAktif: z.boolean().default(true),
    description: z
      .string()
      .max(250, 'Keterangan maksimal 250 karakter')
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.scope === 'kebun' && (!data.farmId || !data.farmId.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['farmId'],
        message: 'Pilih kebun terlebih dahulu',
      });
    }

    if (data.scope === 'node' && (!data.nodeId || !data.nodeId.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['nodeId'],
        message: 'Pilih node terlebih dahulu',
      });
    }

    if (data.mode === 'manual') {
      if (data.intensity === undefined || data.intensity === null || isNaN(data.intensity)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['intensity'],
          message: 'Kecerahan lampu wajib diisi untuk mode manual (0-100%)',
        });
      }
    } else if (data.mode === 'auto') {
      if (data.targetLux === undefined || data.targetLux === null || isNaN(data.targetLux)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['targetLux'],
          message: 'Target lux wajib diisi untuk mode auto (minimal 0)',
        });
      }

      if (
        data.baselineManualPersen === undefined ||
        data.baselineManualPersen === null ||
        isNaN(data.baselineManualPersen)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['baselineManualPersen'],
          message: 'Kecerahan pembanding wajib diisi untuk mode auto (0-100%)',
        });
      }
    }
  });

export type ScheduleFormInput = z.infer<typeof scheduleFormSchema>;
