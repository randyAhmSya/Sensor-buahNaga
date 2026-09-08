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

export const MOCK_QR_CODES: QRCodeItem[] = [
  {
    id: 'qr-1',
    codeText: 'AGL-BLOK-A102',
    qrImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=AGL-BLOK-A102',
    farmName: 'Cempaka Garden',
    blockName: 'Blok Utara',
    status: 'Aktif',
    pairingStatus: 'Sudah Terhubung',
    createdAt: '12 Okt 2026',
  },
  {
    id: 'qr-2',
    codeText: 'AGL-BLOK-B205',
    qrImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=AGL-BLOK-B205',
    farmName: 'Cempaka Garden',
    blockName: 'Blok Selatan',
    status: 'Nonaktif',
    pairingStatus: 'Belum Terhubung',
    createdAt: '08 Sep 2026',
  },
  {
    id: 'qr-3',
    codeText: 'AGL-BLOK-C311',
    qrImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=AGL-BLOK-C311',
    farmName: 'Cempaka Garden',
    blockName: 'Blok Timur',
    status: 'Aktif',
    pairingStatus: 'Sudah Terhubung',
    createdAt: '22 Ags 2026',
  },
  {
    id: 'qr-4',
    codeText: 'AGL-BLOK-D401',
    qrImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=AGL-BLOK-D401',
    farmName: 'Kebun Raya Bogor',
    blockName: 'Blok A',
    status: 'Aktif',
    pairingStatus: 'Sudah Terhubung',
    createdAt: '15 Jul 2026',
  },
];

export const getQRCodes = (): QRCodeItem[] => MOCK_QR_CODES;
