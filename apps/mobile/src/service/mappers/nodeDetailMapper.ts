import type { NodeDetail } from "@/constant/NodeDetails";
import type { BackendSensorDTO, BackendReadSensorDTO } from "@/types/api";

export function mapToNodeDetail(
  backendNode: BackendSensorDTO,
  telemetry?: BackendReadSensorDTO,
): NodeDetail {
  const isOnline =
    backendNode.status_koneksi?.toLowerCase() === "online" ||
    backendNode.status_koneksi?.toLowerCase() === "terhubung";

  // Telemetri riil dari database (nilai null jika belum ada pencatatan sensor)
  const lightLux =
    telemetry?.nilai_lux !== null && telemetry?.nilai_lux !== undefined
      ? Math.round(Number(telemetry.nilai_lux))
      : null;

  const temperature =
    telemetry?.suhu !== null && telemetry?.suhu !== undefined
      ? Math.round(Number(telemetry.suhu))
      : null;

  // Nama lokasi riil dari relasi kebun dan blok
  const kebunName =
    backendNode.kebun?.nama_kebun || backendNode.blok?.kebun?.nama_kebun;
  const blokName = backendNode.blok?.nama_blok;
  const location =
    kebunName && blokName
      ? `${kebunName} - ${blokName}`
      : kebunName || blokName || "Lokasi belum ditentukan";

  // Status koneksi & waktu terakhir terlihat riil
  const lastSeenStr = backendNode.terakhir_terlihat
    ? formatLastSeen(backendNode.terakhir_terlihat)
    : null;

  return {
    id: backendNode.kode_perangkat || backendNode.id_sensor,
    sensorId: backendNode.id_sensor,
    name: backendNode.kode_perangkat || "Node Sensor",
    location,
    status: isOnline ? "ACTIVE" : "INACTIVE",
    sensor: {
      lightLux,
      temperature,
      energyUsed: null,
      dimmingLevel: null,
    },
    connection: {
      signal: isOnline ? "Terhubung" : "Terputus",
      mqttConnected: isOnline,
      lastSeen: lastSeenStr,
    },
    schedule: {
      start: null,
      end: null,
      status: isOnline ? "Aktif" : "Nonaktif",
    },
    harvest: {
      block: blokName || "-",
      startCycle: null,
      targetTime: null,
      prediction: null,
    },
  };
}

function formatLastSeen(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return isoDate;
    return d.toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoDate;
  }
}
