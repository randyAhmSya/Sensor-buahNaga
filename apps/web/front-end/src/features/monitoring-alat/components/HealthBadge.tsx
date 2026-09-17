import { Badge } from '../../../components/ui/Badge'
import type { DeviceStatus } from '../../../config/constants'

interface HealthBadgeProps {
  status: DeviceStatus | string
}

export function HealthBadge({ status }: HealthBadgeProps) {
  const normalized = (status || '').toLowerCase()

  switch (normalized) {
    case 'online':
    case 'aktif':
      return (
        <Badge variant="success" dot>
          Aktif (Online)
        </Badge>
      )
    case 'terhubung':
      return (
        <Badge variant="success" dot>
          Terhubung
        </Badge>
      )
    case 'degraded':
      return (
        <Badge variant="warning" dot>
          Degradasi Sinyal
        </Badge>
      )
    case 'belum_terhubung':
    case 'belum terhubung':
      return (
        <Badge variant="warning" dot>
          Belum Terhubung
        </Badge>
      )
    case 'offline':
    case 'nonaktif':
      return (
        <Badge variant="danger" dot>
          Nonaktif (Offline)
        </Badge>
      )
    default:
      return <Badge variant="neutral">{status}</Badge>
  }
}
