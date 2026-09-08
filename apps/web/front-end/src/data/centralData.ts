// ==================== INTERFACES ====================
export interface BlockEntity {
  id: string;
  name: string;
  codePrefix: string;
  areaM2: number;
  nodeCount: number;
  imageUrl: string;
}

export interface FarmEntity {
  id: string;
  name: string;
  location: string;
  blocks: BlockEntity[];
}

// ==================== MASTER DATA ====================
export const MASTER_FARMS: FarmEntity[] = [
  {
    id: 'farm-1',
    name: 'Kebun Raya Bogor',
    location: 'Bogor, Jawa Barat',
    blocks: [
      {
        id: 'blk-1',
        name: 'Blok A (Utara)',
        codePrefix: 'AGL-KRB-A',
        areaM2: 450,
        nodeCount: 12,
        imageUrl: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=400&q=80',
      },
      {
        id: 'blk-2',
        name: 'Blok B1 (Timur)',
        codePrefix: 'AGL-KRB-B1',
        areaM2: 520,
        nodeCount: 8,
        imageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=400&q=80',
      },
      {
        id: 'blk-3',
        name: 'Blok Pembibitan',
        codePrefix: 'AGL-KRB-BIBIT',
        areaM2: 300,
        nodeCount: 6,
        imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23961?auto=format&fit=crop&w=400&q=80',
      },
    ],
  },
  {
    id: 'farm-2',
    name: 'Cempaka Garden',
    location: 'Banyuwangi, Jawa Timur',
    blocks: [
      {
        id: 'blk-4',
        name: 'Blok Utara',
        codePrefix: 'AGL-CMP-UTARA',
        areaM2: 400,
        nodeCount: 10,
        imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23961?auto=format&fit=crop&w=400&q=80',
      },
      {
        id: 'blk-5',
        name: 'Blok Selatan',
        codePrefix: 'AGL-CMP-SELATAN',
        areaM2: 380,
        nodeCount: 14,
        imageUrl: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=400&q=80',
      },
      {
        id: 'blk-6',
        name: 'Blok Timur',
        codePrefix: 'AGL-CMP-TIMUR',
        areaM2: 420,
        nodeCount: 9,
        imageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=400&q=80',
      },
    ],
  },
  {
    id: 'farm-3',
    name: 'Lembang Farm House',
    location: 'Bandung Barat, Jawa Barat',
    blocks: [
      {
        id: 'blk-7',
        name: 'Blok Sayur Daun',
        codePrefix: 'AGL-LMB-SAYUR',
        areaM2: 350,
        nodeCount: 7,
        imageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=400&q=80',
      },
      {
        id: 'blk-8',
        name: 'Blok Buah Naga Merah',
        codePrefix: 'AGL-LMB-NAGA',
        areaM2: 480,
        nodeCount: 11,
        imageUrl: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=400&q=80',
      },
    ],
  },
];

// ==================== HELPER MAPPING FUNCTIONS ====================
export const getFarmNames = (): string[] => {
  return MASTER_FARMS.map((farm) => farm.name);
};

export const getBlocksByFarmName = (farmName: string): BlockEntity[] => {
  const farm = MASTER_FARMS.find((f) => f.name === farmName);
  return farm ? farm.blocks : [];
};

export const getAllBlockOptions = (): { farm: string; block: string }[] => {
  const options: { farm: string; block: string }[] = [];
  MASTER_FARMS.forEach((farm) => {
    farm.blocks.forEach((block) => {
      options.push({
        farm: farm.name,
        block: block.name,
      });
    });
  });
  return options;
};

export const getFarmById = (id: string): FarmEntity | undefined => {
  return MASTER_FARMS.find((farm) => farm.id === id);
};
