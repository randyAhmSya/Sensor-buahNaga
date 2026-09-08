export interface AvailableNodeItem {
  id: string;
  code: string;
  location: string;
  status: 'Aktif' | 'Maintenance';
}

export const AVAILABLE_NODES: AvailableNodeItem[] = [
  { id: 'nd-1', code: 'ND-001', location: 'Kebun Raya Bogor - Blok A', status: 'Aktif' },
  { id: 'nd-2', code: 'ND-002', location: 'Kebun Raya Bogor - Blok B', status: 'Aktif' },
  { id: 'nd-3', code: 'ND-003', location: 'Lembang Farm - Blok Daun', status: 'Maintenance' },
  { id: 'nd-4', code: 'ND-004', location: 'Indoor Farm BSD - Blok Lab', status: 'Aktif' },
];
