import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  useHarvestDetail,
  useRecordFlowerMutation,
  useFinishHarvestMutation,
} from '@/hooks/useHarvest';
import { hitungRipenessPercent, formatTanggalPetani } from '@/types/harvest';
import { AsyncStateView } from '@/component/ui/AsyncStateView';
import { HarvestHeader } from './HarvestHeader';
import { HarvestNodeCard } from './HarvestNodeCard';
import { Progress } from './Progress';
import { HarvestInfoCard } from './HarvestInfoCard';

interface Props {
  nodeId?: string;
}

export function HarvestDetailScreen({ nodeId }: Props) {
  const { data: harvest, isLoading, isError, error, refetch } = useHarvestDetail(nodeId);
  const recordFlowerMutation = useRecordFlowerMutation();
  const finishHarvestMutation = useFinishHarvestMutation();

  // State untuk modal catat bunga mekar
  const [isFlowerModalVisible, setFlowerModalVisible] = useState(false);
  const [flowerDate, setFlowerDate] = useState(() => new Date().toISOString().split('T')[0]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50">
        <HarvestHeader node="Memuat..." />
        <AsyncStateView status="loading" />
      </View>
    );
  }

  if (isError || !harvest) {
    return (
      <View className="flex-1 bg-gray-50">
        <HarvestHeader node="Siklus Panen" />
        <AsyncStateView
          status="error"
          errorMessage={error?.message || 'Data siklus panen tidak ditemukan'}
          onRetry={refetch}
        />
      </View>
    );
  }

  const isBerjalan = harvest.status_siklus === 'BERJALAN';
  const maturityPercent = hitungRipenessPercent(
    harvest.tanggal_penyinaran,
    harvest.estimasi_tanggal_panen,
  );

  const handleOpenFlowerModal = () => {
    setFlowerDate(harvest.tanggal_berbunga_aktual || new Date().toISOString().split('T')[0]);
    setFlowerModalVisible(true);
  };

  const handleSaveFlowerDate = () => {
    if (!flowerDate || !/^\d{4}-\d{2}-\d{2}$/.test(flowerDate)) {
      Alert.alert('Format Tidak Valid', 'Gunakan format YYYY-MM-DD (contoh: 2026-10-26).');
      return;
    }

    recordFlowerMutation.mutate(
      { id: harvest.id_siklus_panen, tanggalBerbunga: flowerDate },
      {
        onSuccess: () => {
          setFlowerModalVisible(false);
          Alert.alert(
            'Berhasil Tersimpan',
            'Tanggal bunga mekar berhasil dicatat. Backend telah memperbarui estimasi panen secara akurat.',
          );
        },
        onError: (err) => {
          Alert.alert('Gagal Mencatat', err.message || 'Terjadi kesalahan sistem.');
        },
      },
    );
  };

  const handleConfirmFinishHarvest = () => {
    const today = new Date().toISOString().split('T')[0];
    const formattedToday = formatTanggalPetani(today);

    Alert.alert(
      'Konfirmasi Selesai Panen',
      `Tandai bahwa panen buah naga di blok ini telah selesai terealisasi pada ${formattedToday}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya, Tandai Selesai',
          style: 'default',
          onPress: () => {
            finishHarvestMutation.mutate(
              { id: harvest.id_siklus_panen, tanggalPanen: today },
              {
                onSuccess: () => {
                  Alert.alert(
                    'Selamat Panen Berhasil!',
                    'Siklus panen telah ditandai SELESAI dan data statistik kebun telah diperbarui.',
                  );
                },
                onError: (err) => {
                  Alert.alert('Gagal Memperbarui', err.message || 'Terjadi kesalahan sistem.');
                },
              },
            );
          },
        },
      ],
    );
  };

  const nodeTitle = harvest.blok?.nama_blok || `Blok #${harvest.block_id.slice(0, 6)}`;

  return (
    <View className="flex-1 bg-gray-50">
      <HarvestHeader node={nodeTitle} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
      >
        <HarvestNodeCard data={harvest} />

        <Progress
          percent={maturityPercent}
          statusLabel={harvest.status_siklus === 'SELESAI' ? 'Panen Selesai' : 'Sedang Berkembang'}
        />

        <HarvestInfoCard data={harvest} />

        {/* Action Panel Khusus Siklus Berjalan */}
        {isBerjalan && (
          <View className="mt-6 gap-3">
            <Pressable
              onPress={handleOpenFlowerModal}
              disabled={recordFlowerMutation.isPending}
              className="flex-row items-center justify-center gap-2 rounded-lg bg-amber-500 py-3.5 px-4 shadow-sm active:bg-amber-600"
            >
              {recordFlowerMutation.isPending ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="flower-outline" size={20} color="#FFFFFF" />
                  <Text className="font-bold text-white text-sm">
                    {harvest.tanggal_berbunga_aktual
                      ? 'Ubah Tanggal Bunga Mekar'
                      : 'Catat Bunga Mekar Lapangan'}
                  </Text>
                </>
              )}
            </Pressable>

            <Pressable
              onPress={handleConfirmFinishHarvest}
              disabled={finishHarvestMutation.isPending}
              className="flex-row items-center justify-center gap-2 rounded-lg bg-emerald-700 py-3.5 px-4 shadow-sm active:bg-emerald-800"
            >
              {finishHarvestMutation.isPending ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
                  <Text className="font-bold text-white text-sm">
                    Tandai Panen Selesai
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* Modal Input Tanggal Bunga Mekar */}
      <Modal
        visible={isFlowerModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFlowerModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50 px-6">
          <View className="w-full bg-white rounded-lg p-6 shadow-xl border border-slate-200">
            <View className="flex-row items-center gap-2.5 mb-2">
              <View className="h-9 w-9 items-center justify-center rounded-lg bg-amber-100">
                <Ionicons name="flower" size={20} color="#D97706" />
              </View>
              <Text className="text-base font-bold text-gray-900">
                Catat Tanggal Bunga Mekar
              </Text>
            </View>

            <Text className="text-xs text-gray-600 mb-4 leading-4">
              Pencatatan bunga mekar aktual akan memperbarui estimasi panen secara otomatis dari observasi lapangan.
            </Text>

            <Text className="text-xs font-semibold text-gray-700 mb-1">
              Tanggal Bunga Mekar (YYYY-MM-DD):
            </Text>
            <TextInput
              value={flowerDate}
              onChangeText={setFlowerDate}
              placeholder="Contoh: 2026-10-26"
              className="border border-slate-300 rounded-lg px-4 py-3 text-sm text-gray-900 bg-slate-50 mb-6 font-medium"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setFlowerModalVisible(false)}
                className="flex-1 py-3 rounded-lg bg-gray-100 items-center justify-center"
              >
                <Text className="font-semibold text-gray-700 text-sm">Batal</Text>
              </Pressable>

              <Pressable
                onPress={handleSaveFlowerDate}
                disabled={recordFlowerMutation.isPending}
                className="flex-1 py-3 rounded-lg bg-amber-500 items-center justify-center shadow-sm"
              >
                {recordFlowerMutation.isPending ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text className="font-bold text-white text-sm">Simpan</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}