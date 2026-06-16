export type ProgramType = "6周" | "8周";
export type Intensity = "入门" | "标准" | "强化";
export type AlertLevel = "low" | "medium" | "high";
export type ClientStatus = "进行中" | "待跟进" | "已结案" | "预警";

export interface Client {
  id: string;
  name: string;
  phone: string;
  gender: "男" | "女";
  age: number;
  programType: ProgramType;
  intensity: Intensity;
  currentWeek: number;
  startDate: string;
  sleepWindowBed: string;
  sleepWindowWake: string;
  status: ClientStatus;
  boundaries: string[];
  lastContactDate: string;
  diaryCompletionRate: number;
  tags: string[];
  notes?: string;
}

export interface SleepDiary {
  id: string;
  clientId: string;
  date: string;
  bedTime: string;
  sleepOnset: number;
  wakeTime: string;
  totalSleepTime: number;
  sleepEfficiency: number;
  nightAwakenings: number;
  weekendCatchUp: boolean;
  daytimeNap: number;
  wakeDrift: number;
  submitted: boolean;
  notes?: string;
}

export interface WeeklyReview {
  id: string;
  clientId: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
  avgSleepEfficiency: number;
  avgTotalSleep: number;
  sleepWindowAdjust: string;
  tasks: string[];
  summary: string;
  createdAt: string;
}

export interface Obstacle {
  id: string;
  clientId: string;
  date: string;
  category: string;
  description: string;
  solution?: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  date: string;
  time: string;
  type: string;
  notes?: string;
  completed: boolean;
}

export interface Alert {
  id: string;
  clientId: string;
  type: string;
  level: AlertLevel;
  message: string;
  createdAt: string;
  resolved: boolean;
}

export interface MaterialTemplate {
  id: string;
  name: string;
  category: string;
  intensity: Intensity | "通用";
  content: string;
  isBuiltIn: boolean;
}
