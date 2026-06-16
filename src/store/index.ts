import { create } from "zustand";
import {
  Client,
  SleepDiary,
  WeeklyReview,
  Obstacle,
  Appointment,
  Alert,
  MaterialTemplate,
  ProgramFlow,
  BoundarySettings,
  StageSummary,
  Intensity,
  ProgramType,
  WeekPlan,
  FlowApplyHistory,
  SidebarState,
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
import {
  programFlows,
  defaultBoundarySettings,
  getFlowByProgram,
} from "../data/programFlows";
import { generateSleepWindowSuggestion, generateWeeklyTasks } from "../utils/sleepWindow";

interface SleepCoachStore {
  clients: Client[];
  diaries: SleepDiary[];
  reviews: WeeklyReview[];
  obstacles: Obstacle[];
  appointments: Appointment[];
  alerts: Alert[];
  materials: MaterialTemplate[];
  flows: ProgramFlow[];
  boundarySettings: BoundarySettings;
  stageSummaries: StageSummary[];
  flowApplyHistories: FlowApplyHistory[];
  sidebar: SidebarState;
  selectedClientId: string | null;

  setSelectedClient: (id: string | null) => void;
  getClientDiaries: (clientId: string) => SleepDiary[];
  getClientReviews: (clientId: string) => WeeklyReview[];
  getClientObstacles: (clientId: string) => Obstacle[];
  getClientAppointments: (clientId: string) => Appointment[];
  getClientAlerts: (clientId: string) => Alert[];
  getClientFlowHistory: (clientId: string) => FlowApplyHistory[];
  getClientStageSummaries: (clientId: string) => StageSummary[];
  getUnresolvedAlertsCount: () => number;
  resolveAlert: (alertId: string) => void;
  addObstacle: (obstacle: Omit<Obstacle, "id">) => void;
  addReview: (review: Omit<WeeklyReview, "id">) => WeeklyReview;
  updateClient: (clientId: string, updates: Partial<Client>) => void;
  saveStageSummary: (summary: StageSummary) => void;

  createClient: (data: {
    name: string;
    phone: string;
    gender: "男" | "女";
    age: number;
    programType: ProgramType;
    intensity: Intensity;
    initialBed: string;
    initialWake: string;
    tags: string[];
    boundaries: string[];
    notes?: string;
  }) => Client;

  createAppointment: (data: {
    clientId: string;
    date: string;
    time: string;
    type: string;
    notes?: string;
    source?: Appointment["source"];
    linkedReviewId?: string;
  }) => Appointment;
  updateAppointment: (
    apptId: string,
    updates: Partial<Appointment>
  ) => void;
  toggleAppointmentCompleted: (apptId: string) => void;
  deleteAppointment: (apptId: string) => void;

  applyFlowToClient: (clientId: string, flowId: string, note?: string) => void;
  getCurrentWeekPlan: (clientId: string) => WeekPlan | null;

  saveBoundarySettings: (settings: BoundarySettings) => void;

  generateSmartReview: (clientId: string) => WeeklyReview | null;
  generateStageSummary: (clientId: string) => StageSummary;

  openSidebar: (clientId: string) => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
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

const genId = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

export const useSleepCoachStore = create<SleepCoachStore>((set, get) => ({
  clients: loadFromStorage("sct_clients", mockClients),
  diaries: loadFromStorage("sct_diaries", mockDiaries),
  reviews: loadFromStorage("sct_reviews", mockReviews),
  obstacles: loadFromStorage("sct_obstacles", mockObstacles),
  appointments: loadFromStorage("sct_appointments", mockAppointments),
  alerts: loadFromStorage("sct_alerts", mockAlerts),
  materials: loadFromStorage("sct_materials", mockMaterials),
  flows: programFlows,
  boundarySettings: loadFromStorage("sct_boundaries", defaultBoundarySettings),
  stageSummaries: loadFromStorage("sct_summaries", [] as StageSummary[]),
  flowApplyHistories: loadFromStorage("sct_flow_histories", [] as FlowApplyHistory[]),
  sidebar: loadFromStorage("sct_sidebar", { open: false, clientId: null }),
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

  getClientFlowHistory: (clientId) =>
    get().flowApplyHistories
      .filter((h) => h.clientId === clientId)
      .sort((a, b) => b.appliedAt.localeCompare(a.appliedAt)),

  getClientStageSummaries: (clientId) =>
    get().stageSummaries
      .filter((s) => s.clientId === clientId)
      .sort((a, b) => b.generatedAt.localeCompare(a.generatedAt)),

  getUnresolvedAlertsCount: () =>
    get().alerts.filter((a) => !a.resolved).length,

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
      id: genId("o"),
    };
    const newList = [...get().obstacles, newObstacle];
    set({ obstacles: newList });
    saveToStorage("sct_obstacles", newList);
  },

  addReview: (review) => {
    const newReview: WeeklyReview = {
      ...review,
      id: genId("r"),
    };
    const newList = [...get().reviews, newReview];
    set({ reviews: newList });
    saveToStorage("sct_reviews", newList);

    if (newReview.nextWindowBed && newReview.nextWindowWake) {
      get().updateClient(newReview.clientId, {
        sleepWindowBed: newReview.nextWindowBed,
        sleepWindowWake: newReview.nextWindowWake,
        lastContactDate: new Date().toISOString().split("T")[0],
      });
    }
    return newReview;
  },

  updateClient: (clientId, updates) => {
    const newClients = get().clients.map((c) =>
      c.id === clientId ? { ...c, ...updates } : c
    );
    set({ clients: newClients });
    saveToStorage("sct_clients", newClients);
  },

  saveStageSummary: (summary) => {
    const existing = get().stageSummaries.find((s) => s.id === summary.id);
    let newList;
    if (existing) {
      newList = get().stageSummaries.map((s) =>
        s.id === summary.id ? summary : s
      );
    } else {
      newList = [...get().stageSummaries, summary];
    }
    set({ stageSummaries: newList });
    saveToStorage("sct_summaries", newList);
  },

  createClient: (data) => {
    const today = new Date().toISOString().split("T")[0];
    const newClient: Client = {
      id: genId("c"),
      name: data.name,
      phone: data.phone,
      gender: data.gender,
      age: data.age,
      programType: data.programType,
      intensity: data.intensity,
      currentWeek: 1,
      startDate: today,
      sleepWindowBed: data.initialBed,
      sleepWindowWake: data.initialWake,
      status: "进行中",
      boundaries: data.boundaries,
      lastContactDate: today,
      diaryCompletionRate: 0,
      tags: data.tags,
      notes: data.notes,
    };

    const flow = getFlowByProgram(data.programType, data.intensity);
    if (flow) {
      const history: FlowApplyHistory = {
        id: genId("fh"),
        clientId: newClient.id,
        flowId: flow.id,
        flowName: flow.name,
        programType: flow.programType,
        intensity: flow.intensity,
        appliedAt: today,
        note: "新建个案时自动套用",
      };

      newClient.appliedFlow = {
        flowId: flow.id,
        flowName: flow.name,
        appliedAt: today,
        currentWeekPlan: flow.weeks[0] || null,
        history: [history],
      };

      const newHistories = [...get().flowApplyHistories, history];
      set({ flowApplyHistories: newHistories });
      saveToStorage("sct_flow_histories", newHistories);
    }

    const newClients = [...get().clients, newClient];
    set({ clients: newClients });
    saveToStorage("sct_clients", newClients);

    return newClient;
  },

  createAppointment: (data) => {
    const newAppt: Appointment = {
      id: genId("a"),
      clientId: data.clientId,
      date: data.date,
      time: data.time,
      type: data.type,
      notes: data.notes,
      completed: false,
      source: data.source || "manual",
      linkedReviewId: data.linkedReviewId,
    };
    const newList = [...get().appointments, newAppt];
    set({ appointments: newList });
    saveToStorage("sct_appointments", newList);
    return newAppt;
  },

  updateAppointment: (apptId, updates) => {
    const newList = get().appointments.map((a) =>
      a.id === apptId ? { ...a, ...updates } : a
    );
    set({ appointments: newList });
    saveToStorage("sct_appointments", newList);
  },

  toggleAppointmentCompleted: (apptId) => {
    const appt = get().appointments.find((a) => a.id === apptId);
    if (appt) {
      get().updateAppointment(apptId, { completed: !appt.completed });
      if (!appt.completed) {
        get().updateClient(appt.clientId, {
          lastContactDate: new Date().toISOString().split("T")[0],
        });
      }
    }
  },

  deleteAppointment: (apptId) => {
    const newList = get().appointments.filter((a) => a.id !== apptId);
    set({ appointments: newList });
    saveToStorage("sct_appointments", newList);
  },

  applyFlowToClient: (clientId, flowId, note) => {
    const flow = get().flows.find((f) => f.id === flowId);
    const client = get().clients.find((c) => c.id === clientId);
    if (!flow || !client) return;

    const today = new Date().toISOString().split("T")[0];

    const history: FlowApplyHistory = {
      id: genId("fh"),
      clientId,
      flowId: flow.id,
      flowName: flow.name,
      programType: flow.programType,
      intensity: flow.intensity,
      appliedAt: today,
      note,
    };

    const newHistories = [...get().flowApplyHistories, history];
    set({ flowApplyHistories: newHistories });
    saveToStorage("sct_flow_histories", newHistories);

    const clientHistories = get()
      .getClientFlowHistory(clientId)
      .concat(history);

    get().updateClient(clientId, {
      programType: flow.programType,
      intensity: flow.intensity,
      appliedFlow: {
        flowId,
        flowName: flow.name,
        appliedAt: today,
        currentWeekPlan: flow.weeks[client.currentWeek - 1] || null,
        history: clientHistories,
      },
    });
  },

  getCurrentWeekPlan: (clientId) => {
    const client = get().clients.find((c) => c.id === clientId);
    if (!client) return null;

    if (client.appliedFlow) {
      const flow = get().flows.find((f) => f.id === client.appliedFlow?.flowId);
      if (flow) {
        return flow.weeks[client.currentWeek - 1] || null;
      }
    }
    const flow = getFlowByProgram(client.programType, client.intensity);
    return flow?.weeks[client.currentWeek - 1] || null;
  },

  saveBoundarySettings: (settings) => {
    set({ boundarySettings: settings });
    saveToStorage("sct_boundaries", settings);
  },

  generateSmartReview: (clientId) => {
    const client = get().clients.find((c) => c.id === clientId);
    if (!client) return null;

    const diaries = get().getClientDiaries(clientId);
    const last7 = diaries.slice(-7).filter((d) => d.submitted);
    if (last7.length === 0) return null;

    const avgEfficiency = Math.round(
      last7.reduce((s, d) => s + d.sleepEfficiency, 0) / last7.length
    );
    const avgTST = Number(
      (last7.reduce((s, d) => s + d.totalSleepTime, 0) / last7.length).toFixed(1)
    );

    const suggestion = generateSleepWindowSuggestion(
      diaries,
      client.sleepWindowBed,
      client.sleepWindowWake
    );
    const tasks = generateWeeklyTasks(suggestion, client.intensity, client.currentWeek);

    const weekPlan = get().getCurrentWeekPlan(clientId);
    if (weekPlan) {
      tasks.unshift(`【本周重点】${weekPlan.focus}`);
      weekPlan.tasks.forEach((t) => tasks.push(t));
    }

    let summary = "";
    if (avgEfficiency >= 85) {
      summary = `本周整体表现良好，平均睡眠效率${avgEfficiency}%，已达到或接近目标水平。继续保持当前作息节奏，${
        suggestion.level === "expand"
          ? "可尝试逐步延长睡眠窗口。"
          : "巩固已建立的节律。"
      }注意关注周末作息不要有大的漂移。`;
    } else if (avgEfficiency >= 70) {
      summary = `本周睡眠效率${avgEfficiency}%，处于改善过程中。${
        suggestion.level === "shrink"
          ? "建议适度压缩卧床时间以提高睡眠驱动力。"
          : "继续坚持当前方案，效果会在1-2周后更明显。"
      }重点关注起床时间的一致性。`;
    } else {
      summary = `本周睡眠效率${avgEfficiency}%，仍有较大提升空间。请确认睡眠窗口的执行是否严格，特别是起床时间是否固定。如有执行障碍请及时记录讨论。`;
    }
    if (avgTST < 5.5) {
      summary += ` 平均时长仅${avgTST}小时，需警惕日间功能，但切勿通过提前上床「补觉」。`;
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 6);

    return {
      id: genId("r"),
      clientId,
      weekNumber: client.currentWeek,
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
      avgSleepEfficiency: avgEfficiency,
      avgTotalSleep: avgTST,
      sleepWindowAdjust: suggestion.adjustment,
      tasks,
      summary,
      createdAt: new Date().toISOString().split("T")[0],
      nextWindowBed: suggestion.suggestedBed,
      nextWindowWake: suggestion.suggestedWake,
      reasoning: suggestion.reasoning.join("；"),
    };
  },

  generateStageSummary: (clientId) => {
    const client = get().clients.find((c) => c.id === clientId);
    if (!client) {
      const empty: StageSummary = {
        id: genId("s"),
        clientId,
        generatedAt: new Date().toISOString().split("T")[0],
        title: "阶段总结",
        content: "",
        date: new Date().toISOString().split("T")[0],
        period: "",
        fullText: "",
      };
      get().saveStageSummary(empty);
      return empty;
    }

    const diaries = get().getClientDiaries(clientId);
    const reviews = get().getClientReviews(clientId);
    const obstacles = get().getClientObstacles(clientId);
    const submitted = diaries.filter((d) => d.submitted);

    let content = "";
    content += `【${client.name} · CBT-I阶段总结】\n\n`;
    content += `一、基本信息\n`;
    content += `  · 性别/年龄：${client.gender} / ${client.age}岁\n`;
    content += `  · 干预方案：${client.intensity}版 · ${client.programType}\n`;
    content += `  · 起始日期：${client.startDate}\n`;
    content += `  · 当前进度：第 ${client.currentWeek} 周\n\n`;

    content += `二、数据概览\n`;
    content += `  · 累计记录天数：${submitted.length} / ${diaries.length}\n`;
    content += `  · 日记完成率：${client.diaryCompletionRate}%\n`;

    if (submitted.length > 0) {
      const avgEff = Math.round(
        submitted.reduce((s, d) => s + d.sleepEfficiency, 0) / submitted.length
      );
      const avgTST = (
        submitted.reduce((s, d) => s + d.totalSleepTime, 0) / submitted.length
      ).toFixed(1);
      content += `  · 平均睡眠效率：${avgEff}%\n`;
      content += `  · 平均睡眠时长：${avgTST}小时\n`;

      const first7 = submitted.slice(0, 7);
      const last7 = submitted.slice(-7);
      if (first7.length >= 5 && last7.length >= 5) {
        const firstEff = Math.round(
          first7.reduce((s, d) => s + d.sleepEfficiency, 0) / first7.length
        );
        const lastEff = Math.round(
          last7.reduce((s, d) => s + d.sleepEfficiency, 0) / last7.length
        );
        const delta = lastEff - firstEff;
        content += `  · 效率变化：首周${firstEff}% → 最近一周${lastEff}%（${
          delta >= 0 ? "+" : ""
        }${delta}%）\n`;
      }
    }
    content += `\n`;

    content += `三、睡眠窗口\n`;
    content += `  · 当前窗口：${client.sleepWindowBed} - ${client.sleepWindowWake}\n\n`;

    if (reviews.length > 0) {
      content += `四、历史回顾（${reviews.length}次）\n`;
      reviews
        .slice(-3)
        .forEach((r) => {
          content += `  · 第${r.weekNumber}周（${r.startDate}）：效率${r.avgSleepEfficiency}%，时长${r.avgTotalSleep}h\n`;
          content += `    ${r.summary.slice(0, 60)}...\n`;
        });
      content += `\n`;
    }

    if (obstacles.length > 0) {
      content += `五、已识别的执行障碍（${obstacles.length}项）\n`;
      obstacles.forEach((o) => {
        content += `  · [${o.category}] ${o.description}\n`;
        if (o.solution) content += `    → 应对：${o.solution}\n`;
      });
      content += `\n`;
    }

    content += `六、后续建议\n`;
    const progress =
      (client.currentWeek / (client.programType === "6周" ? 6 : 8)) * 100;
    if (progress < 50) {
      content += `  干预仍在前半段，核心任务是建立稳定的睡眠窗口和刺激控制行为，不要急于看到指标大幅变化。\n`;
    } else if (progress < 85) {
      content += `  已进入干预中期，重点放在认知调整和复发预防预案的建立。\n`;
    } else {
      content += `  已接近结案阶段，请确认高风险情境应对计划，并安排后续随访。\n`;
    }
    content += `\n`;

    content += `七、标签与备注\n`;
    content += `  标签：${client.tags.join("、") || "无"}\n`;
    if (client.boundaries.length > 0) {
      content += `  边界设置：${client.boundaries.join("；")}\n`;
    }
    if (client.notes) {
      content += `  备注：${client.notes}\n`;
    }
    content += `\n`;
    content += `—— 本报告生成于 ${new Date().toLocaleDateString("zh-CN")} ——\n`;

    const period = `第1周 - 第${client.currentWeek}周`;
    const date = new Date().toISOString().split("T")[0];

    const summary: StageSummary = {
      id: genId("s"),
      clientId,
      generatedAt: date,
      title: `${client.name} · 第${client.currentWeek}周阶段总结`,
      content,
      date,
      period,
      fullText: content,
    };

    get().saveStageSummary(summary);
    return summary;
  },

  openSidebar: (clientId) => {
    const state = { open: true, clientId };
    set({ sidebar: state });
    saveToStorage("sct_sidebar", state);
  },

  closeSidebar: () => {
    const state = { open: false, clientId: null };
    set({ sidebar: state });
    saveToStorage("sct_sidebar", state);
  },

  toggleSidebar: () => {
    const current = get().sidebar;
    const state = current.open
      ? { open: false, clientId: null }
      : { open: true, clientId: current.clientId };
    set({ sidebar: state });
    saveToStorage("sct_sidebar", state);
  },
}));
