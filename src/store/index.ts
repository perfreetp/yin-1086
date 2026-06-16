import { create } from "zustand";
import {
  Client,
  SleepDiary,
  WeeklyReview,
  Obstacle,
  Appointment,
  Alert,
  MaterialTemplate,
} from "../types";
import {
  mockClients,
  mockDiaries,
  mockReviews,
  mockObstacles,
  mockAppointments,
  mockAlerts,
  mockMaterials,
} from "../data/mockData";

interface SleepCoachStore {
  clients: Client[];
  diaries: SleepDiary[];
  reviews: WeeklyReview[];
  obstacles: Obstacle[];
  appointments: Appointment[];
  alerts: Alert[];
  materials: MaterialTemplate[];
  selectedClientId: string | null;

  setSelectedClient: (id: string | null) => void;
  getClientDiaries: (clientId: string) => SleepDiary[];
  getClientReviews: (clientId: string) => WeeklyReview[];
  getClientObstacles: (clientId: string) => Obstacle[];
  getClientAppointments: (clientId: string) => Appointment[];
  getClientAlerts: (clientId: string) => Alert[];
  getUnresolvedAlertsCount: () => number;
  resolveAlert: (alertId: string) => void;
  addObstacle: (obstacle: Omit<Obstacle, "id">) => void;
  addReview: (review: Omit<WeeklyReview, "id">) => void;
  updateClient: (clientId: string, updates: Partial<Client>) => void;
}

const loadFromStorage = <T>(key: string, fallback: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
};

const saveToStorage = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
};

export const useSleepCoachStore = create<SleepCoachStore>((set, get) => ({
  clients: loadFromStorage("sct_clients", mockClients),
  diaries: loadFromStorage("sct_diaries", mockDiaries),
  reviews: loadFromStorage("sct_reviews", mockReviews),
  obstacles: loadFromStorage("sct_obstacles", mockObstacles),
  appointments: loadFromStorage("sct_appointments", mockAppointments),
  alerts: loadFromStorage("sct_alerts", mockAlerts),
  materials: loadFromStorage("sct_materials", mockMaterials),
  selectedClientId: null,

  setSelectedClient: (id) => set({ selectedClientId: id }),

  getClientDiaries: (clientId) =>
    get().diaries.filter((d) => d.clientId === clientId),

  getClientReviews: (clientId) =>
    get().reviews.filter((r) => r.clientId === clientId),

  getClientObstacles: (clientId) =>
    get().obstacles.filter((o) => o.clientId === clientId),

  getClientAppointments: (clientId) =>
    get().appointments.filter((a) => a.clientId === clientId),

  getClientAlerts: (clientId) =>
    get().alerts.filter((a) => a.clientId === clientId),

  getUnresolvedAlertsCount: () => get().alerts.filter((a) => !a.resolved).length,

  resolveAlert: (alertId) => {
    const newAlerts = get().alerts.map((a) =>
      a.id === alertId ? { ...a, resolved: true } : a
    );
    set({ alerts: newAlerts });
    saveToStorage("sct_alerts", newAlerts);
  },

  addObstacle: (obstacle) => {
    const newObstacle: Obstacle = {
      ...obstacle,
      id: `o_${Date.now()}`,
    };
    const newList = [...get().obstacles, newObstacle];
    set({ obstacles: newList });
    saveToStorage("sct_obstacles", newList);
  },

  addReview: (review) => {
    const newReview: WeeklyReview = {
      ...review,
      id: `r_${Date.now()}`,
    };
    const newList = [...get().reviews, newReview];
    set({ reviews: newList });
    saveToStorage("sct_reviews", newList);
  },

  updateClient: (clientId, updates) => {
    const newClients = get().clients.map((c) =>
      c.id === clientId ? { ...c, ...updates } : c
    );
    set({ clients: newClients });
    saveToStorage("sct_clients", newClients);
  },
}));
