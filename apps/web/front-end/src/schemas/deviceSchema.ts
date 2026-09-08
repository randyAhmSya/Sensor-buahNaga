import { z } from 'zod'

export const deviceConfigSchema = z.object({
  deviceName: z
    .string()
    .min(3, { message: 'Nama perangkat / gateway minimal 3 karakter' }),
  deviceType: z.enum(
    [
      'LoRaWAN Gateway',
      'Photosynthetic Light Node',
      'Solid State Relay Controller',
      'FDR Soil Moisture & Temp',
      'Weather & Telemetry Gateway',
    ],
    {
      message: 'Pilih tipe perangkat',
    }
  ),
  blockId: z.string().min(1, { message: 'Pilih blok lahan penempatan' }),
  targetLux: z
    .number({ message: 'Target lux harus berupa angka' })
    .min(50, { message: 'Target pencahayaan minimal 50 Lux' })
    .max(500, { message: 'Target pencahayaan maksimal 500 Lux' }),
  lightingStartTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Format waktu mulai harus HH:MM (contoh: 18:00)' }),
  lightingEndTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Format waktu selesai harus HH:MM (contoh: 22:00)' }),
  reportingIntervalMinutes: z
    .number({ message: 'Interval harus angka' })
    .int()
    .min(1, { message: 'Interval transmisi minimal 1 menit' })
    .max(60, { message: 'Interval transmisi maksimal 60 menit' }),
  lowBatteryThresholdVolt: z
    .number({ message: 'Batas voltase harus angka' })
    .min(2.5, { message: 'Ambang batas voltase minimal 2.5V' })
    .max(14.0, { message: 'Ambang batas voltase maksimal 14.0V' }),
})

export type DeviceConfigFormValues = z.infer<typeof deviceConfigSchema>
