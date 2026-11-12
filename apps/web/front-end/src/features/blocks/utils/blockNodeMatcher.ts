import type { NodeSensorBackend } from '@/types/node.types'
import type { SensorNodeItem } from '@/types/sensor.types'

/**
 * Mencocokkan node sensor yang terhubung ke suatu blok tertentu.
 * Menangani berbagai variasi field blok pada node (blok_id, id_blok, block_id, atau nested blok.id_blok / blok.id).
 * Pure function tanpa efek samping sehingga aman diuji dengan unit test.
 */
export function findNodeForBlock<T extends NodeSensorBackend | SensorNodeItem | Record<string, unknown>>(
  nodes: T[] | null | undefined,
  blockId: string | null | undefined
): T | null {
  if (!Array.isArray(nodes) || nodes.length === 0) {
    return null
  }

  const cleanBlockId = (blockId || '').trim()
  if (!cleanBlockId) {
    return null
  }

  const targetLower = cleanBlockId.toLowerCase()

  for (const node of nodes) {
    if (!node || typeof node !== 'object') continue

    const raw = node as Record<string, unknown>
    const directBlockId =
      raw.blok_id ??
      raw.id_blok ??
      raw.block_id ??
      raw.blockId

    if (directBlockId !== undefined && directBlockId !== null) {
      if (String(directBlockId).trim().toLowerCase() === targetLower) {
        return node
      }
    }

    const nestedBlok = raw.blok ?? raw.block
    if (nestedBlok && typeof nestedBlok === 'object') {
      const nested = nestedBlok as Record<string, unknown>
      const nestedId =
        nested.id_blok ??
        nested.id ??
        nested.blok_id ??
        nested.block_id

      if (nestedId !== undefined && nestedId !== null) {
        if (String(nestedId).trim().toLowerCase() === targetLower) {
          return node
        }
      }
    }
  }

  return null
}

