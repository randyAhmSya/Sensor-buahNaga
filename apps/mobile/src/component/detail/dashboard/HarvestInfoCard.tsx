import React from 'react';
import { Text, View } from 'react-native';
import { formatTanggalPetani, hitungHariSisa, type SiklusPanenItem } from '@/types/harvest';

interface HarvestInfoCardProps {
  data: SiklusPanenItem;
}

interface ItemProps {
  label: string;
  value: string;
  highlight?: boolean;
}

export function HarvestInfoCard({ data }: HarvestInfoCardProps) {
  const tglMulai = formatTanggalPetani(data.tanggal_penyinaran);
  const targetBunga = `${data.target_hari_berbunga ?? 21} Hari`;
  const bungaAktual = data.tanggal_berbunga_aktual
    ? formatTanggalPetani(data.tanggal_berbunga_aktual)
    : 'Belum Dicatat';
  const targetPanenSetelahBunga = `${data.target_hari_panen_setelah_bunga ?? 50} Hari`;
  const estimasiPanen = formatTanggalPetani(data.estimasi_tanggal_panen);
  const sisaWaktu = hitungHariSisa(data.estimasi_tanggal_panen);
  const tglPanenAktual = data.tanggal_panen
    ? formatTanggalPetani(data.tanggal_panen)
    : null;

  return (
    <View className="mt-4 rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">
      <View className="bg-gray-50 px-4 py-2.5 border-b border-gray-100">
        <Text className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Parameter & Linimasa Siklus
        </Text>
      </View>

      <Item label="Mulai Penyinaran" value={tglMulai} />
      <Item label="Target Bunga Mekar" value={targetBunga} />
      <Item
        label="Bunga Mekar Aktual"
        value={bungaAktual}
        highlight={!!data.tanggal_berbunga_aktual}
      />
      <Item label="Target Panen Sejak Bunga" value={targetPanenSetelahBunga} />
      <Item
        label="Estimasi Tanggal Panen"
        value={estimasiPanen}
        highlight={true}
      />
      <Item label="Sisa Waktu Panen" value={sisaWaktu} />
      {tglPanenAktual && (
        <Item label="Panen Terealisasi" value={tglPanenAktual} highlight={true} />
      )}
    </View>
  );
}

function Item({ label, value, highlight }: ItemProps) {
  return (
    <View className="flex-row justify-between items-center border-b border-gray-100 px-4 py-3">
      <Text className="text-sm text-gray-500">{label}</Text>
      <Text
        className={`text-sm font-semibold ${
          highlight ? 'text-green-700 font-bold' : 'text-gray-900'
        }`}
      >
        {value}
      </Text>
    </View>
  );
}