export interface HarvestDetail {
  id: string;
  node: string;
  location: string;
  image: string;

  maturity: number;

  startCycle: string;
  harvestDate: string;
  remaining: string;
  weight: string;
}

export const MOCK_HARVEST_DATA: HarvestDetail[] = [
  {
    id: "G1-N3",

    node: "G1-N3",

    location: "Garden North, Block A",

    image: "https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1",

    maturity: 85,

    startCycle: "1 Okt 2024",

    harvestDate: "20 Nov 2024",

    remaining: "3 Hari Lagi",

    weight: "45 kg",
  },

  {
    id: "G2-N1",

    node: "G2-N1",

    location: "Garden 2, Block B",

    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea",

    maturity: 60,

    startCycle: "5 Okt 2024",

    harvestDate: "1 Des 2024",

    remaining: "1 Minggu",

    weight: "40 kg",
  },
];
