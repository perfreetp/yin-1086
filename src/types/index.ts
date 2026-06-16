export type ProgramType = "6周" | "8周";
export type Intensity = "入门" | "标准" | "强化";
export type AlertLevel = "low" | "medium" | "high";
export type ClientStatus = "进行中" | "待跟进" | "已结案" | "预警";
export type AppointmentType = "初次评估" | "周复盘" | "阶段总结" | "紧急跟进";

export interface WeekPlan {
  weekNumber: number;
  week?: number;
  focus: string;
  tasks: string[];
  materials: string[];
}

export interface ProgramFlow {
  id: string;
  name: string;
  programType: ProgramType;
  intensity: Intensity;
  weeks: WeekPlan[];
  description: string;
}

export interface AppliedFlow {
  flowId: string;
  appliedAt: string;
  currentWeekPlan: WeekPlan | null;
}

export interface BoundarySettings {
  reminderFrequency: "每日" | "隔日" | "每周";
  doNotDisturbStart: string;
  doNotDisturbEnd: string;
  weekendReduce: boolean;
  lostContactDays: number;
  lowComplianceRate: number;
  wakeDriftMinutes: number;
  autoRemindDiary: boolean;
  emailNotify: boolean;
  dailySummary: boolean;
  remindDiaryUnsubmitted: boolean;
  emailAlerts: boolean;
  dndStartTime: string;
  dndEndTime: string;
  weekendReduced: boolean;
}

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
  appliedFlow?: AppliedFlow;
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
  nextWindowBed?: string;
  nextWindowWake?: string;
  reasoning?: string;
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
  type: AppointmentType | string;
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

export interface StageSummary {
  id: string;
  clientId: string;
  generatedAt: string;
  title: string;
  content: string;
  date?: string;
  period?: string;
  fullText?: string;
}
