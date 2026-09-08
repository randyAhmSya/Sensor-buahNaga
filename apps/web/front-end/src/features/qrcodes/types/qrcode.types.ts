export interface QRCodeItem {
  id: string;
  codeText: string;
  qrImageUrl: string;
  farmName: string;
  blockName: string;
  status: 'Aktif' | 'Nonaktif';
  pairingStatus: 'Sudah Terhubung' | 'Belum Terhubung';
  createdAt: string;
}

export interface QRCodeFilterOptions {
  searchTerm: string;
  selectedFarm: string;
  selectedStatus: string;
  selectedPairing: string;
}
