import React, { memo } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import Svg, { Path, Line, Circle } from "react-native-svg";
import { Card } from "@/component/ui/Card";
import { StatusBadge } from "@/component/ui/StatusBadge";
import { useLogPeredupan } from "@/hooks/useLogPeredupan";

interface DimmingHistoryChartCardProps {
  sensorId?: string;
  enabled?: boolean;
}

export const DimmingHistoryChartCard = memo(function DimmingHistoryChartCard({
  sensorId,
  enabled = true,
}: DimmingHistoryChartCardProps) {
  const { data, isLoading, isError } = useLogPeredupan(sensorId, 12, enabled);

  const points = data?.titik || [];
  const hasData = points.length > 0;

  const chartWidth = 320;
  const chartHeight = 110;

  // Hitung rata-rata dan nilai terakhir
  const latestKecerahan = hasData
    ? Math.round(points[points.length - 1].kecerahan_persen)
    : 0;

  const avgLux = hasData
    ? Math.round(
        points.reduce((acc, curr) => acc + curr.lux, 0) / points.length,
      )
    : 0;

  // Bangun path SVG secara presisi
  let pathD = "";
  if (hasData) {
    points.forEach((pt, idx) => {
      const x = (idx / Math.max(1, points.length - 1)) * (chartWidth - 20) + 10;
      const normalizedY = Math.max(0, Math.min(100, pt.kecerahan_persen));
      const y = chartHeight - (normalizedY / 100) * (chartHeight - 20) - 10;

      if (idx === 0) {
        pathD += `M ${x.toFixed(1)} ${y.toFixed(1)}`;
      } else {
        pathD += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
      }
    });
  }

  return (
    <Card className="p-4">
      <View className="flex-row items-center justify-between">
        <View style={{ flexShrink: 1 }}>
          <Text className="text-sm font-bold text-slate-900">
            Riwayat Auto-Dimming
          </Text>
          <Text className="text-[11px] font-medium text-slate-600 mt-0.5">
            12 Jam Terakhir (Interval 10 Menit)
          </Text>
        </View>

        {hasData && (
          <StatusBadge
            tone="success"
            label={`${latestKecerahan}%`}
            size="sm"
          />
        )}
      </View>

      {/* Ringkasan Cepat */}
      <View className="mt-3 flex-row gap-3">
        <View className="flex-1 rounded-lg bg-white border-[1.5px] border-slate-400 p-2.5">
          <Text className="text-[10px] font-semibold text-slate-600 uppercase">
            Kecerahan Terakhir
          </Text>
          <Text className="text-base font-extrabold text-slate-900 mt-0.5">
            {hasData ? `${latestKecerahan}%` : "-"}
          </Text>
        </View>

        <View className="flex-1 rounded-lg bg-white border-[1.5px] border-slate-400 p-2.5">
          <Text className="text-[10px] font-semibold text-slate-600 uppercase">
            Rata-rata Lux
          </Text>
          <Text className="text-base font-extrabold text-slate-900 mt-0.5">
            {hasData ? `${avgLux} lx` : "-"}
          </Text>
        </View>

        <View className="flex-1 rounded-lg bg-white border-[1.5px] border-slate-400 p-2.5">
          <Text className="text-[10px] font-semibold text-slate-600 uppercase">
            Total Titik Log
          </Text>
          <Text className="text-base font-extrabold text-slate-900 mt-0.5">
            {points.length}
          </Text>
        </View>
      </View>

      {/* Visual Canvas Grafik */}
      <View className="mt-4 items-center justify-center">
        {isLoading ? (
          <View className="h-28 items-center justify-center">
            <ActivityIndicator size="small" color="#047857" />
            <Text className="text-xs text-slate-600 mt-2 font-medium">
              Memuat grafik peredupan...
            </Text>
          </View>
        ) : isError || !hasData ? (
          <View className="h-28 items-center justify-center rounded-lg bg-white border-[1.5px] border-slate-400 w-full p-4">
            <Text className="text-xs text-slate-600 text-center font-medium">
              Belum ada data peredupan lampu tercatat dalam 12 jam terakhir.
            </Text>
          </View>
        ) : (
          <View className="w-full items-center">
            <Svg width={chartWidth} height={chartHeight}>
              {/* Garis batas horizontal 0%, 50%, 100% */}
              <Line
                x1="10"
                y1={chartHeight - 10}
                x2={chartWidth - 10}
                y2={chartHeight - 10}
                stroke="#E2E8F0"
                strokeWidth="1"
              />
              <Line
                x1="10"
                y1={chartHeight / 2}
                x2={chartWidth - 10}
                y2={chartHeight / 2}
                stroke="#E2E8F0"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <Line
                x1="10"
                y1="10"
                x2={chartWidth - 10}
                y2="10"
                stroke="#E2E8F0"
                strokeWidth="1"
              />

              {/* Kurva Grafik Kecerahan Lampu */}
              <Path
                d={pathD}
                fill="none"
                stroke="#059669"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Titik akhir terkini */}
              {points.length > 0 && (
                <Circle
                  cx={chartWidth - 10}
                  cy={
                    chartHeight -
                    (Math.max(
                      0,
                      Math.min(
                        100,
                        points[points.length - 1].kecerahan_persen,
                      ),
                    ) /
                      100) *
                      (chartHeight - 20) -
                    10
                  }
                  r="4"
                  fill="#059669"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
              )}
            </Svg>

            <View className="w-full flex-row justify-between px-2.5 mt-1">
              <Text className="text-[10px] text-slate-600 font-semibold">
                12 Jam Lalu
              </Text>
              <Text className="text-[10px] text-slate-600 font-semibold">
                Sekarang
              </Text>
            </View>
          </View>
        )}
      </View>
    </Card>
  );
});

