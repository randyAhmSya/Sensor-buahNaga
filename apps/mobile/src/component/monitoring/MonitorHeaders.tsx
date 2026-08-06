import { DashboardHeader } from "../dashboard/DashboardHeader";

interface MonitoringProps {
  appName: string;

  onNotificationPress?: () => void;
}

export function Monitoring({
  appName,

  onNotificationPress,
}: MonitoringProps) {
  return (
    <DashboardHeader
      appName={appName}
      tone="dark"
      onNotificationPress={onNotificationPress}
    />
  );
}
