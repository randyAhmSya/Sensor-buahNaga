export interface HarvestCycleItem {
  id: string;
  blockName: string;
  farmName: string;
  lightingDate: string;
  bloomingTargetDays: number;
  estimatedHarvestDate: string;
  actualHarvestDate: string | null;
  status: 'Berjalan' | 'Selesai';
}

export interface HarvestMetrics {
  activeCycles: number;
  nearestHarvestDate: string;
  totalHarvestThisMonthTon: number;
}

export const MOCK_HARVEST_METRICS: HarvestMetrics = {
  activeCycles: 0,
  nearestHarvestDate: '-',
  totalHarvestThisMonthTon: 0,
};

export const MOCK_HARVEST_CYCLES: HarvestCycleItem[] = [];

export const getHarvestMetrics = (): HarvestMetrics => MOCK_HARVEST_METRICS;
export const getHarvestCycles = (): HarvestCycleItem[] => MOCK_HARVEST_CYCLES;
