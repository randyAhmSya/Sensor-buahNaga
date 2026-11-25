import React, { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  FileSpreadsheet,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  fetchTelemetriHalaman,
  fetchTelemetriEkspor,
  type ReadSensor,
} from "@/services/telemetryService";
import { telemetryKeys } from "@/services/queryKeys";

interface SensorLogTableProps {
  sensorId?: string;
}

type Preset = "semua" | "1jam" | "24jam" | "7hari" | "30hari" | "kustom";

const PRESET_LABEL: Record<Preset, string> = {
  semua: "Semua Waktu",
  "1jam": "1 Jam Terakhir",
  "24jam": "24 Jam Terakhir",
  "7hari": "7 Hari Terakhir",
  "30hari": "30 Hari Terakhir",
  kustom: "Pilih Tanggal...",
};

const PRESET_JAM: Partial<Record<Preset, number>> = {
  "1jam": 1,
  "24jam": 24,
  "7hari": 168,
  "30hari": 720,
};
const UKURAN_HALAMAN = [10, 25, 50, 100];

const wib = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Jakarta",
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

const formatWaktu = (iso: string): string => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const p = Object.fromEntries(
    wib.formatToParts(d).map((x) => [x.type, x.value]),
  );
  return `${p.day} ${p.month} ${p.year}, ${p.hour}.${p.minute}.${p.second} WIB`;
};

const nilai = (r: ReadSensor) => ({
  lux: r.nilai_lux ?? r.lux ?? 0,
  suhu: r.suhu ?? r.temperature ?? 0,
});

export const SensorLogTable: React.FC<SensorLogTableProps> = ({ sensorId }) => {
  const [preset, setPreset] = useState<Preset>("semua");
  // Batas waktu dihitung sekali saat filter dipilih, supaya kunci query stabil
  const [rentang, setRentang] = useState<{ dari?: string; sampai?: string }>(
    {},
  );
  const [kustomDari, setKustomDari] = useState("");
  const [kustomSampai, setKustomSampai] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [mengekspor, setMengekspor] = useState(false);

  const aktif = Boolean(sensorId && sensorId !== "Belum Terpasang");

  const { data, isFetching, isError } = useQuery({
    queryKey: telemetryKeys.page(
      sensorId || "",
      page,
      perPage,
      rentang.dari,
      rentang.sampai,
    ),
    queryFn: () =>
      fetchTelemetriHalaman({
        sensorId: sensorId as string,
        page,
        perPage,
        ...rentang,
      }),
    enabled: aktif,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  const items = data?.items ?? [];
  const meta = data?.meta;
  const total = meta?.total ?? 0;
  const lastPage = meta?.last_page ?? 1;
  const awal = total === 0 ? 0 : (page - 1) * perPage + 1;
  const akhir = Math.min(page * perPage, total);

  const ubahPreset = (p: Preset) => {
    setPreset(p);
    setPage(1);
    if (p === "kustom") return;
    const jam = PRESET_JAM[p];
    setRentang(
      jam ? { dari: new Date(Date.now() - jam * 3600_000).toISOString() } : {},
    );
  };

  const terapkanKustom = () => {
    const d = kustomDari ? new Date(kustomDari) : null;
    const s = kustomSampai ? new Date(kustomSampai) : null;
    if (d && s && s < d) return;
    setPage(1);
    setRentang({
      dari: d && !isNaN(d.getTime()) ? d.toISOString() : undefined,
      sampai: s && !isNaN(s.getTime()) ? s.toISOString() : undefined,
    });
  };

  const kustomTidakValid = Boolean(
    kustomDari && kustomSampai && new Date(kustomSampai) < new Date(kustomDari),
  );

  const handleExportCsv = async () => {
    if (!aktif) return;
    setMengekspor(true);
    try {
      const rows = await fetchTelemetriEkspor(
        sensorId as string,
        rentang.dari,
        rentang.sampai,
      );
      const header = ["Waktu (WIB)", "Lux", "Suhu (C)"];
      const baris = rows.map((r) => {
        const v = nilai(r);
        return [`"${formatWaktu(r.dicatat_pada)}"`, v.lux, v.suhu];
      });
      const csv = [header.join(","), ...baris.map((b) => b.join(","))].join(
        "\n",
      );
      const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sensor-log-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Gagal ekspor CSV:", e);
    } finally {
      setMengekspor(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-emerald-700 shrink-0" />
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Log Sensor Mendalam
            </h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Data mentah disimpan 30 hari
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <select
              value={preset}
              onChange={(e) => ubahPreset(e.target.value as Preset)}
              className="appearance-none pl-8 pr-7 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-emerald-600 cursor-pointer shadow-2xs"
            >
              {(Object.keys(PRESET_LABEL) as Preset[]).map((k) => (
                <option key={k} value={k}>
                  {PRESET_LABEL[k]}
                </option>
              ))}
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={!aktif || mengekspor || total === 0}
            leftIcon={<Download className="w-4 h-4 shrink-0" />}
            className="flex flex-row items-center gap-2 border-slate-300 hover:border-emerald-600 text-slate-700 hover:text-emerald-700 bg-white font-semibold rounded-xl cursor-pointer"
          >
            <span>{mengekspor ? "Menyiapkan..." : "Ekspor CSV"}</span>
          </Button>
        </div>
      </div>

      {preset === "kustom" && (
        <div className="flex flex-wrap items-end gap-3 rounded-xl bg-slate-50 border border-slate-200 p-3">
          <label className="text-[11px] font-semibold text-slate-600 space-y-1">
            <span className="block">Dari</span>
            <input
              type="datetime-local"
              value={kustomDari}
              onChange={(e) => setKustomDari(e.target.value)}
              className="block px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600"
            />
          </label>
          <label className="text-[11px] font-semibold text-slate-600 space-y-1">
            <span className="block">Sampai</span>
            <input
              type="datetime-local"
              value={kustomSampai}
              onChange={(e) => setKustomSampai(e.target.value)}
              className="block px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600"
            />
          </label>
          <Button
            type="button"
            size="sm"
            onClick={terapkanKustom}
            disabled={kustomTidakValid || (!kustomDari && !kustomSampai)}
          >
            Terapkan
          </Button>
          {kustomTidakValid && (
            <p className="text-[11px] text-red-600 font-medium">
              Waktu "sampai" harus setelah "dari".
            </p>
          )}
        </div>
      )}

      <div
        className={`overflow-x-auto transition-opacity ${isFetching ? "opacity-60" : ""}`}
      >
        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Waktu</th>
              <th className="py-3 px-4">Intensitas Lux</th>
              <th className="py-3 px-4 text-right">Suhu Udara</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-800">
            {isError ? (
              <tr>
                <td
                  colSpan={3}
                  className="py-8 text-center text-xs text-red-500 font-medium"
                >
                  Gagal memuat log sensor. Coba lagi sebentar.
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="py-8 text-center text-xs text-slate-400 font-medium"
                >
                  {isFetching
                    ? "Memuat log..."
                    : "Tidak ada log sensor pada rentang waktu ini."}
                </td>
              </tr>
            ) : (
              items.map((log) => {
                const v = nilai(log);
                return (
                  <tr
                    key={log.id || log.dicatat_pada}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {formatWaktu(log.dicatat_pada)}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-800">
                      {v.lux} lx
                    </td>
                    <td className="py-3 px-4 text-right text-slate-700">
                      {v.suhu}°C
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 text-xs text-slate-600">
        <div className="flex items-center gap-3">
          <span className="font-medium">
            {total === 0
              ? "0 log"
              : `${awal}–${akhir} dari ${total.toLocaleString("id-ID")} log`}
          </span>
          <label className="flex items-center gap-1.5">
            <span className="text-slate-500">Per halaman</span>
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setPage(1);
              }}
              className="py-1 px-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-emerald-600"
            >
              {UKURAN_HALAMAN.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || isFetching}
            className="p-1.5 rounded-lg border border-slate-200 hover:border-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            aria-label="Halaman sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold tabular-nums">
            Halaman {page} / {lastPage}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
            disabled={page >= lastPage || isFetching}
            className="p-1.5 rounded-lg border border-slate-200 hover:border-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            aria-label="Halaman berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
