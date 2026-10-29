export interface BackendReadSensorDTO {
  id_read_sensor: string;
  sensor_id: string;
  nilai_lux: number | null;
  suhu: number | null;
  kelembapan?: number | null;
  dicatat_pada: string;
  sensor?: {
    kode_perangkat?: string;
  };
}
