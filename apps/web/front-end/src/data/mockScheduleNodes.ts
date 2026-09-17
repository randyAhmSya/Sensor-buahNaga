export interface AvailableNodeItem {
  id: string;
  code: string;
  location: string;
  status: 'Aktif' | 'Maintenance';
}

export const AVAILABLE_NODES: AvailableNodeItem[] = [];
