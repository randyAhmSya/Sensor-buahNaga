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
})

export const nodeSensorFormSchema = nodeSensorSchema

export type NodeSensorFormValues = z.infer<typeof nodeSensorSchema>
export type NodeSensorFormData = z.infer<typeof nodeSensorSchema>
