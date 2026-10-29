import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import {
  CameraView,
  useCameraPermissions,
  type BarcodeScanningResult,
} from "expo-camera";
import { BlurView } from "expo-blur";
import MaskedView from "@react-native-masked-view/masked-view";
import Svg, { Path } from "react-native-svg";
import { useRouter } from "expo-router";
import { useIsFocused } from "expo-router/react-navigation";
import { Ionicons } from "@expo/vector-icons";
import { TAB_COLORS } from "@/constant/Tabs";
import { PressableOpacity } from "@/component/ui/PressableOpacity";
import { submitScanQr } from "@/service/qrScanService";
import { nodeStore } from "@/store/useNodeStore";

const FRAME_SIZE = 260;
const FRAME_RADIUS = 28;

// Regex UUID standar (v4/v1 dsb)
const UUID_REGEX =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

/**
 * Ekstraksi UUID atau teks kode QR dari data raw hasil scan
 * (mendukung format URL atau string kode langsung seperti QR-NODE-XXXXXX)
 */
export function extractNodeId(raw: string): string {
  const trimmed = raw.trim();
  const uuidMatch = trimmed.match(UUID_REGEX);
  if (uuidMatch) {
    return uuidMatch[0];
  }

  // Jika QR berupa URL, ambil path segmen terakhir jika tersedia
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const url = new URL(trimmed);
      const segments = url.pathname.split("/").filter(Boolean);
      if (segments.length > 0) {
        return segments[segments.length - 1];
      }
    } catch {
      // Abaikan jika bukan format URL standar
    }
  }

  return trimmed;
}

/**
 * Memeriksa apakah barcode yang terdeteksi berada di dalam area kotak bidik tengah
 */
function isInsideTargetBox(
  result: BarcodeScanningResult,
  frameLeft: number,
  frameTop: number,
  frameSize: number,
  tolerance = 30,
): boolean {
  // Jika device tidak mengembalikan koordinat bounds atau cornerPoints, loloskan deteksi
  if (
    !result.bounds &&
    (!result.cornerPoints || result.cornerPoints.length === 0)
  ) {
    return true;
  }

  let centerX = 0;
  let centerY = 0;

  if (result.bounds) {
    centerX = result.bounds.origin.x + result.bounds.size.width / 2;
    centerY = result.bounds.origin.y + result.bounds.size.height / 2;
  } else if (result.cornerPoints && result.cornerPoints.length > 0) {
    const sumX = result.cornerPoints.reduce((acc, p) => acc + p.x, 0);
    const sumY = result.cornerPoints.reduce((acc, p) => acc + p.y, 0);
    centerX = sumX / result.cornerPoints.length;
    centerY = sumY / result.cornerPoints.length;
  }

  const minX = frameLeft - tolerance;
  const maxX = frameLeft + frameSize + tolerance;
  const minY = frameTop - tolerance;
  const maxY = frameTop + frameSize + tolerance;

  return (
    centerX >= minX && centerX <= maxX && centerY >= minY && centerY <= maxY
  );
}

export default function ScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const isFocused = useIsFocused();

  return (
    <View style={styles.root}>
      {!permission ? (
        <View style={styles.root} />
      ) : !permission.granted ? (
        <PermissionRequest
          onRequest={requestPermission}
          onCancel={() => router.back()}
        />
      ) : (
        <ScannerView isFocused={isFocused} onClose={() => router.back()} />
      )}
    </View>
  );
}

function PermissionRequest({
  onRequest,
  onCancel,
}: {
  onRequest: () => void;
  onCancel: () => void;
}) {
  return (
    <View style={styles.permissionContainer}>
      <Ionicons name="camera-outline" size={48} color="#9CA3AF" />
      <Text style={styles.permissionText}>
        Aplikasi butuh akses kamera buat scan barcode/QR.
      </Text>
      <PressableOpacity
        onPress={onRequest}
        activeOpacity={0.85}
        style={[
          styles.permissionButton,
          { backgroundColor: TAB_COLORS.active },
        ]}
      >
        <Text style={styles.permissionButtonText}>Izinkan Akses Kamera</Text>
      </PressableOpacity>
      <PressableOpacity onPress={onCancel} hitSlop={8}>
        <Text style={styles.cancelText}>Batal</Text>
      </PressableOpacity>
    </View>
  );
}

function ScannerView({
  isFocused,
  onClose,
}: {
  isFocused: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [isStabilizing, setIsStabilizing] = useState(false);
  const [isSubmittingState, setIsSubmittingState] = useState(false);

  // Kunci Mutlak Trigger Pemindaian: mencegah scanner menembak API berkali-kali secara bersamaan
  const isSubmitting = useRef(false);

  const candidateRef = useRef<{
    data: string;
    timer: ReturnType<typeof setTimeout> | null;
  } | null>(null);

  // Bersihkan timer saat unmount
  useEffect(() => {
    return () => {
      if (candidateRef.current?.timer) {
        clearTimeout(candidateRef.current.timer);
      }
    };
  }, []);

  const resetScannerState = useCallback(() => {
    if (candidateRef.current?.timer) {
      clearTimeout(candidateRef.current.timer);
    }
    candidateRef.current = null;
    isSubmitting.current = false;
    setIsStabilizing(false);
    setIsSubmittingState(false);
  }, []);

  const handleBarcodeScanned = useCallback(
    (result: BarcodeScanningResult) => {
      // Jika sedang proses submit atau sudah bernavigasi, abaikan seluruh frame kamera
      if (isSubmitting.current) return;

      const frameLeft = (width - FRAME_SIZE) / 2;
      const frameTop = (height - FRAME_SIZE) / 2;

      // 1. Filter Bounding Box: abaikan jika di luar kotak bidik tengah
      if (!isInsideTargetBox(result, frameLeft, frameTop, FRAME_SIZE)) {
        if (candidateRef.current) {
          if (candidateRef.current.timer) {
            clearTimeout(candidateRef.current.timer);
          }
          candidateRef.current = null;
          setIsStabilizing(false);
        }
        return;
      }

      const rawData = result.data?.trim();
      if (!rawData) return;

      // 2. Ekstraksi UUID / serial ID jika berupa URL atau string ID langsung
      const extractedId = extractNodeId(rawData);

      // 3. Debounce & Stabilisasi: jika data yang sama sedang distabilkan, biarkan timer berjalan
      if (candidateRef.current && candidateRef.current.data === extractedId) {
        return;
      }

      // Reset timer sebelumnya jika data kandidat berubah
      if (candidateRef.current?.timer) {
        clearTimeout(candidateRef.current.timer);
      }

      setIsStabilizing(true);

      const timer = setTimeout(async () => {
        // Kunci mutlak sebelum memanggil API scan
        if (isSubmitting.current) return;
        isSubmitting.current = true;

        if (candidateRef.current?.timer) {
          clearTimeout(candidateRef.current.timer);
        }
        candidateRef.current = null;
        setIsStabilizing(false);
        setIsSubmittingState(true);

        console.log(
          "[Scanner] QR Code terverifikasi stabil (400ms). Mengirim ke POST /petani/qr/scan:",
          extractedId,
        );

        try {
          const response = await submitScanQr(extractedId);
          const resolvedNodeId =
            response.data?.id_sensor || extractedId;

          console.log("[Scanner] Berhasil verifikasi node sensor:", {
            extractedId,
            resolvedNodeId,
          });

          // Simpan ke global store agar tetap aktif saat berpindah tab
          await nodeStore.setActiveNodeId(resolvedNodeId);

          router.replace({
            pathname: "/monitoring/[id]",
            params: { id: resolvedNodeId },
          });
        } catch (error: unknown) {
          const err = error as { message?: string };
          console.warn("[Scanner] Gagal verifikasi scan QR:", err?.message);

          // Kembalikan flag ke false agar user bisa mencoba scan ulang
          isSubmitting.current = false;
          setIsSubmittingState(false);
          setIsStabilizing(false);
          candidateRef.current = null;

          const errorMessage =
            err?.message ||
            "Kode QR tidak terdaftar di sistem atau Anda tidak memiliki akses ke node terkait.";

          Alert.alert(
            "Pemindaian Gagal",
            errorMessage,
            [
              {
                text: "Pindai Ulang",
                onPress: resetScannerState,
              },
              {
                text: "Tutup",
                style: "cancel",
                onPress: onClose,
              },
            ],
            { cancelable: false },
          );
        }
      }, 400);

      candidateRef.current = {
        data: extractedId,
        timer,
      };
    },
    [width, height, router, onClose, resetScannerState],
  );

  return (
    <View style={styles.root}>
      <CameraView
        style={styles.camera}
        facing="back"
        active={isFocused}
        barcodeScannerSettings={{ barcodeTypes: ["qr", "code128", "ean13"] }}
        onBarcodeScanned={handleBarcodeScanned}
      />
      <ScannerOverlay
        isStabilizing={isStabilizing}
        isSubmitting={isSubmittingState}
      />
      <CloseButton onPress={onClose} />
      <View style={styles.instructionWrap} pointerEvents="none">
        <Text style={styles.instructionText}>
          {isSubmittingState
            ? "Menghubungkan data sensor ke server..."
            : isStabilizing
              ? "Tahan kamera tetap stabil pada QR code..."
              : "Arahkan kamera ke QR code pada fisik node sensor"}
        </Text>
      </View>
    </View>
  );
}

const ScannerOverlay = memo(function ScannerOverlay({
  isStabilizing,
  isSubmitting,
}: {
  isStabilizing: boolean;
  isSubmitting: boolean;
}) {
  const { width, height } = useWindowDimensions();

  const { frameLeft, frameTop, maskPath } = useMemo(() => {
    const frameLeft = (width - FRAME_SIZE) / 2;
    const frameTop = (height - FRAME_SIZE) / 2;
    const r = FRAME_RADIUS;
    const left = frameLeft;
    const top = frameTop;
    const right = frameLeft + FRAME_SIZE;
    const bottom = frameTop + FRAME_SIZE;

    const maskPath = `
      M0,0 H${width} V${height} H0 Z
      M${left + r},${top}
      L${right - r},${top}
      A${r},${r} 0 0 1 ${right},${top + r}
      L${right},${bottom - r}
      A${r},${r} 0 0 1 ${right - r},${bottom}
      L${left + r},${bottom}
      A${r},${r} 0 0 1 ${left},${bottom - r}
      L${left},${top + r}
      A${r},${r} 0 0 1 ${left + r},${top} Z
    `;

    return { frameLeft, frameTop, maskPath };
  }, [width, height]);

  // Border berubah menjadi hijau terang saat stabilisasi atau pengiriman berlangsung
  const isActiveState = isStabilizing || isSubmitting;
  const activeBorderColor = isActiveState ? "#22C55E" : TAB_COLORS.active;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <MaskedView
        style={StyleSheet.absoluteFill}
        maskElement={
          <Svg width={width} height={height}>
            <Path d={maskPath} fill="white" fillRule="evenodd" />
          </Svg>
        }
      >
        <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFill} />
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: "rgba(0,0,0,0.35)" },
          ]}
        />
      </MaskedView>

      <View
        style={{
          position: "absolute",
          top: frameTop,
          left: frameLeft,
          width: FRAME_SIZE,
          height: FRAME_SIZE,
          borderRadius: FRAME_RADIUS,
          borderWidth: isActiveState ? 4 : 3,
          borderColor: activeBorderColor,
        }}
      >
        {isSubmitting ? (
          <View style={styles.stabilizingBadge}>
            <ActivityIndicator size="small" color="#22C55E" />
            <Text style={styles.stabilizingText}>Memverifikasi ke server...</Text>
          </View>
        ) : isStabilizing ? (
          <View style={styles.stabilizingBadge}>
            <Ionicons name="scan-outline" size={14} color="#22C55E" />
            <Text style={styles.stabilizingText}>Menstabilkan QR...</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
});

const CloseButton = memo(function CloseButton({
  onPress,
}: {
  onPress: () => void;
}) {
  return (
    <PressableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.closeButton}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Tutup scan"
    >
      <Ionicons name="close" size={24} color="#FFFFFF" />
    </PressableOpacity>
  );
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000000" },
  camera: { flex: 1 },
  permissionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 32,
    backgroundColor: "#000000",
  },
  permissionText: { textAlign: "center", fontSize: 16, color: "#FFFFFF" },
  permissionButton: {
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  permissionButtonText: { fontWeight: "600", color: "#FFFFFF" },
  cancelText: { fontSize: 14, color: "#9CA3AF", marginTop: 8 },
  closeButton: {
    position: "absolute",
    top: 56,
    right: 20,
    height: 44,
    width: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  instructionWrap: {
    position: "absolute",
    bottom: 64,
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  instructionText: {
    textAlign: "center",
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
  },
  stabilizingBadge: {
    position: "absolute",
    bottom: -36,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.75)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#22C55E",
  },
  stabilizingText: {
    color: "#22C55E",
    fontSize: 12,
    fontWeight: "600",
  },
});
