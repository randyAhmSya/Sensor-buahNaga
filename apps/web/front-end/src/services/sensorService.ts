import type { SensorNodeItem, SensorSummaryMetrics } from '@/types/sensor.types'
import { MOCK_SENSOR_SUMMARY, MOCK_SENSOR_NODES } from '@/data/mockSensors'

export const sensorService = {
  getSummary: async (): Promise<SensorSummaryMetrics> => {
    await new Promise((resolve) => setTimeout(resolve, 100))
    return { ...MOCK_SENSOR_SUMMARY }
  },

  getAll: async (): Promise<SensorNodeItem[]> => {
    await new Promise((resolve) => setTimeout(resolve, 150))
    return [...MOCK_SENSOR_NODES]
  },

  getByNodeCode: async (nodeCode: string): Promise<SensorNodeItem | undefined> => {
    await new Promise((resolve) => setTimeout(resolve, 100))
    return MOCK_SENSOR_NODES.find(
      (s) => s.nodeCode.toLowerCase() === nodeCode.toLowerCase()
    )
  },
}
