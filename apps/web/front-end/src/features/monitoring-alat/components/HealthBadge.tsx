import { Badge } from '../../../components/ui/Badge'
import type { DeviceStatus } from '../../../config/constants'

interface HealthBadgeProps {
  status: DeviceStatus | string
}

export function HealthBadge({ status }: HealthBadgeProps) {
  switch (status) {
    case 'ONLINE':
      return (
        <Badge variant="success" dot>
          Normal (Online)
        </Badge>
      )
    case 'DEGRADED':
      return (
        <Badge variant="warning" dot>
          Degradasi Sinyal
        </Badge>
      )
    case 'OFFLINE':
      return (
        <Badge variant="danger" dot>
          Terputus (Offline)
        </Badge>
      )
    default:
      return <Badge variant="neutral">{status}</Badge>
  }
}
