/**
 * Utility normalizer untuk entitas backend Laravel AgroLight.
 * Menjamin kompatibilitas antarmuka frontend yang memanggil properti `.id`.
 */

export interface EntityWithId {
  id?: string;
  id_kebun?: string;
  id_blok?: string;
  id_sensor?: string;
  id_gateway?: string;
  id_qr?: string;
  [key: string]: unknown;
}

/**
 * Ekstraksi ID primer entitas secara aman dari berbagai field PK backend.
 */
export function getEntityId(item: unknown): string {
  if (!item || typeof item !== 'object') return '';
  const obj = item as EntityWithId;
  return (
    obj.id_kebun ||
    obj.id_blok ||
    obj.id_sensor ||
    obj.id_gateway ||
    obj.id_qr ||
    obj.id ||
    ''
  );
}

/**
 * Normalisasi objek entitas agar selalu memiliki field `id` yang terisi.
 */
export function normalizeEntity<T extends Record<string, unknown>>(item: T): T & { id: string } {
  const id = getEntityId(item);
  return {
    ...item,
    id,
  };
}
