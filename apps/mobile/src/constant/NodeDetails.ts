export interface NodeDetail {
  id: string;
  location: string;

  image?: string;

  status: "ACTIVE" | "INACTIVE";

  sensor: {
    lightLux: number;
    temperature: number;
    energyUsed: number;
    dimmingLevel: number;
  };

  connection: {
    signal: string;
    mqttConnected: boolean;
  };

  schedule: {
    start: string;
    end: string;
    status: "Running" | "Stopped";
  };

  harvest: {
    block: string;
    startCycle: string;
    targetTime: string;
    prediction: string;
  };
}

export const MOCK_NODE_DETAILS: NodeDetail[] = [
  {
    id: "G1-N3-B2",
    location: "Garden North, Blok A",
    status: "ACTIVE",
    image:
      "https://img.antarafoto.com/cache/1200x800/2026/01/02/pemanfaatan-lampu-untuk-meningkatkan-hasil-panen-buah-naga-1lv8j-dom.webp",

    sensor: {
      lightLux: 450,
      temperature: 28,
      energyUsed: 45,
      dimmingLevel: 75,
    },

    connection: {
      signal: "-65 dBm",
      mqttConnected: true,
    },

    schedule: {
      start: "17:30 PM",
      end: "05:30 ",
      status: "Running",
    },

    harvest: {
      block: "Blok A",
      startCycle: "1 Okt 2024",
      targetTime: "40 Hari",
      prediction: "20 Nov 2024",
    },
  },

  {
    id: "G2-N1-B5",
    location: "Garden South, Blok B",
    status: "ACTIVE",
    image:
      "https://img.antarafoto.com/cache/1200x800/2026/01/02/pemanfaatan-lampu-untuk-meningkatkan-hasil-panen-buah-naga-1lv8j-dom.webp",

    sensor: {
      lightLux: 200,
      temperature: 36,
      energyUsed: 60,
      dimmingLevel: 50,
    },

    connection: {
      signal: "-80 dBm",
      mqttConnected: false,
    },

    schedule: {
      start: "18:00",
      end: "05:00",
      status: "Stopped",
    },

    harvest: {
      block: "Blok B",
      startCycle: "5 Okt 2024",
      targetTime: "45 Hari",
      prediction: "25 Nov 2024",
    },
  },

  {
    id: "G1-N2-B1",
    location: "Garden North, Blok C",
    status: "ACTIVE",
    image:
      "https://img.antarafoto.com/cache/1200x800/2026/01/02/pemanfaatan-lampu-untuk-meningkatkan-hasil-panen-buah-naga-1lv8j-dom.webp",

    sensor: {
      lightLux: 420,
      temperature: 29,
      energyUsed: 40,
      dimmingLevel: 80,
    },

    connection: {
      signal: "-60 dBm",
      mqttConnected: true,
    },

    schedule: {
      start: "17:30",
      end: "05:30",
      status: "Running",
    },

    harvest: {
      block: "Blok C",
      startCycle: "10 Okt 2024",
      targetTime: "42 Hari",
      prediction: "22 Nov 2024",
    },
  },
];
