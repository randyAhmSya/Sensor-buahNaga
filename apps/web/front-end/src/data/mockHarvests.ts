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
  activeCycles: 8,
  nearestHarvestDate: '24 Nov 2026',
  totalHarvestThisMonthTon: 1.2,
};

export const MOCK_HARVEST_CYCLES: HarvestCycleItem[] = [
  {
    id: 'hrv-1',
    blockName: 'Blok A',
    farmName: 'Kebun Cempaka',
    lightingDate: '12 Okt 2026',
    bloomingTargetDays: 25,
    estimatedHarvestDate: '06 Nov 2026',
    actualHarvestDate: null,
    status: 'Berjalan',
  },
  {
    id: 'hrv-2',
    blockName: 'Blok C',
    farmName: 'Kebun Cempaka',
    lightingDate: '01 Sep 2026',
    bloomingTargetDays: 25,
    estimatedHarvestDate: '26 Sep 2026',
    actualHarvestDate: '27 Sep 2026',
    status: 'Selesai',
  },
  {
    id: 'hrv-3',
    blockName: 'Blok D',
    farmName: 'Kebun Cempaka',
    lightingDate: '15 Okt 2026',
    bloomingTargetDays: 30,
    estimatedHarvestDate: '14 Nov 2026',
    actualHarvestDate: null,
    status: 'Berjalan',
  },
  {
    id: 'hrv-4',
    blockName: 'Blok B1',
    farmName: 'Kebun Raya Bogor',
    lightingDate: '05 Sep 2026',
    bloomingTargetDays: 28,
    estimatedHarvestDate: '03 Okt 2026',
    actualHarvestDate: '04 Okt 2026',
    status: 'Selesai',
  },
];

export const getHarvestMetrics = (): HarvestMetrics => MOCK_HARVEST_METRICS;
export const getHarvestCycles = (): HarvestCycleItem[] => MOCK_HARVEST_CYCLES;
