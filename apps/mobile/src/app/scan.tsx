import React, { memo, useCallback, useMemo, useRef } from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import {
  CameraView,
  useCameraPermissions,
  type BarcodeScanningResult,
} from "expo-camera";
import { BlurView } from "expo-blur";
import MaskedView from "@react-native-masked-view/masked-view";
import Svg, { Path } from "react-native-svg";
import { useRouter, useNavigation } from "expo-router";
import { useIsFocused } from "expo-router/react-navigation";
import { Ionicons } from "@expo/vector-icons";
import { TAB_COLORS } from "@/constant/Tabs";
import { PressableOpacity } from "@/component/ui/PressableOpacity";

const FRAME_SIZE = 260;
const FRAME_RADIUS = 28;

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
  const hasScannedRef = useRef(false);

  const handleBarcodeScanned = useCallback((result: BarcodeScanningResult) => {
    if (hasScannedRef.current) return;
    hasScannedRef.current = true;
    console.log("Scanned:", result.type, result.data);
  }, []);

  return (
    <View style={styles.root}>
      <CameraView
        style={styles.camera}
        facing="back"
        active={isFocused}
        barcodeScannerSettings={{ barcodeTypes: ["qr", "code128", "ean13"] }}
        onBarcodeScanned={handleBarcodeScanned}
      />
      <ScannerOverlay />
      <CloseButton onPress={onClose} />
      <View style={styles.instructionWrap} pointerEvents="none">
        <Text style={styles.instructionText}>
          Arahkan kamera ke QR code atau barcode
        </Text>
      </View>
    </View>
  );
}

const ScannerOverlay = memo(function ScannerOverlay() {
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
          borderWidth: 4,
          borderColor: TAB_COLORS.active,
        }}
      />
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
});
