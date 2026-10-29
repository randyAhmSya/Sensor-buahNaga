export interface NodeDetail {
  id: string;
  sensorId?: string;
  name?: string;
  location: string;
  image?: string;
  status: "ACTIVE" | "INACTIVE";

  sensor: {
    lightLux: number | null;
    temperature: number | null;
    energyUsed: number | null;
    dimmingLevel: number | null;
  };

  connection: {
    signal: string | null;
    mqttConnected: boolean;
    lastSeen: string | null;
  };

  schedule: {
    start: string | null;
    end: string | null;
    status: string;
  };

  harvest: {
    block: string;
    startCycle: string | null;
    targetTime: string | null;
    prediction: string | null;
  };
}
