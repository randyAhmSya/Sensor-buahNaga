import { z } from 'zod'
import { antiScriptRefine } from '@/utils/sanitize'

/**
 * Skema validasi Zod untuk Formulir Tambah / Konfigurasi Node Sensor Baru
 * Memastikan penempatan blok_id dan gateway_id berstatus .min(1, 'Wajib dipilih') (bukan .optional()).
 */
export const nodeSensorSchema = z.object({
  kode_perangkat: antiScriptRefine(
    z
      .string()
      .trim()
      .min(1, 'Kode perangkat node sensor wajib diisi')
  ),
  blok_id: antiScriptRefine(
    z
      .string()
      .trim()
      .min(1, 'Wajib dipilih')
  ),
  gateway_id: antiScriptRefine(
    z
      .string()
      .trim()
      .min(1, 'Wajib dipilih')
  ),
  tipe_sensor: antiScriptRefine(
    z
      .string()
      .trim()
      .min(1, 'Wajib dipilih')
  ).default('lux_suhu'),
  status_koneksi: z.enum(['aktif', 'nonaktif']).default('aktif'),
  jumlah_lampu: z.coerce
    .number()
    .int('Jumlah lampu harus berupa bilangan bulat')
    .min(1, 'Jumlah lampu minimal 1')
    .max(10000, 'Jumlah lampu maksimal 10000')
    .default(1),
  watt_per_lampu: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? null : Number(val)),
    z
      .number({ message: 'Watt per lampu harus berupa angka' })
      .min(0, 'Watt per lampu minimal 0')
      .max(5000, 'Watt per lampu maksimal 5000')
      .nullable()
      .optional()
  ),
})

export const nodeSensorFormSchema = nodeSensorSchema

export type NodeSensorFormValues = z.infer<typeof nodeSensorSchema>
export type NodeSensorFormData = z.infer<typeof nodeSensorSchema>
