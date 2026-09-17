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

export const MOCK_QR_CODES: QRCodeItem[] = [];

export const getQRCodes = (): QRCodeItem[] => MOCK_QR_CODES;
