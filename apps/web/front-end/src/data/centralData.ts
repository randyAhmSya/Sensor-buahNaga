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
export const MASTER_FARMS: FarmEntity[] = [];

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
