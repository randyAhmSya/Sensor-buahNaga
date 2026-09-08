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
