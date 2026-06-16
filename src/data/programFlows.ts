import type { ProgramFlow, BoundarySettings, WeekPlan } from "../types";

const makeWeeks = (count: number, builder: (w: number) => WeekPlan): WeekPlan[] =>
  Array.from({ length: count }, (_, i) => builder(i + 1));

export const programFlows: ProgramFlow[] = [
  {
    id: "flow_6w_beginner",
    name: "CBT-I入门版（6周）",
    programType: "6周",
    intensity: "入门",
    description: "适合失眠时间较短、配合度较高、无严重共病的来访者",
    weeks: makeWeeks(6, (w) => {
      const plans: Record<number, WeekPlan> = {
        1: {
          weekNumber: 1,
          focus: "建立关系与评估",
          tasks: [
            "完成睡眠评估问卷",
            "开始每日睡眠日记（起床后立即填写）",
            "阅读睡眠卫生手册",
            "确认边界与沟通方式",
          ],
          materials: ["睡眠卫生检查清单", "睡眠日记填写指南"],
        },
        2: {
          weekNumber: 2,
          focus: "睡眠卫生 + 刺激控制基础",
          tasks: [
            "优化睡眠环境（黑暗、安静、温度18-22°C）",
            "固定起床时间（误差<30分钟）",
            "床只用于睡眠和性",
            "午后不摄入咖啡因",
          ],
          materials: ["睡眠卫生检查清单", "刺激控制疗法练习"],
        },
        3: {
          weekNumber: 3,
          focus: "睡眠限制疗法入门",
          tasks: [
            "根据第1-2周数据计算睡眠窗口",
            "严格执行睡眠窗口（不赖床、不提前上床）",
            "避免日间补觉超过20分钟",
            "开始睡前放松练习",
          ],
          materials: ["睡眠限制疗法入门指南", "渐进式肌肉放松(PMR)"],
        },
        4: {
          weekNumber: 4,
          focus: "睡眠限制巩固",
          tasks: [
            "根据睡眠效率调整窗口（效率>85%可延长15分钟）",
            "持续填写日记",
            "卧床20分钟睡不着即起床",
          ],
          materials: ["入睡困难应对方案"],
        },
        5: {
          weekNumber: 5,
          focus: "放松训练 + 轻度认知调整",
          tasks: [
            "每日睡前15分钟身体扫描冥想",
            "记录睡前担忧，安排「担心时间」",
            "识别「失眠灾难化」想法",
          ],
          materials: ["睡前身体扫描冥想", "失眠认知重构工作单"],
        },
        6: {
          weekNumber: 6,
          focus: "巩固与结案准备",
          tasks: [
            "回顾6周数据变化",
            "识别高风险情境（出差、压力期）",
            "制定复发应对计划",
            "准备阶段总结",
          ],
          materials: ["CBT-I入门6周流程"],
        },
      };
      return plans[w];
    }),
  },
  {
    id: "flow_8w_standard",
    name: "CBT-I标准版（8周）",
    programType: "8周",
    intensity: "标准",
    description: "适合大多数慢性失眠来访者的标准干预流程",
    weeks: makeWeeks(8, (w) => {
      const plans: Record<number, WeekPlan> = {
        1: {
          weekNumber: 1,
          focus: "详细评估与教育",
          tasks: [
            "完成多维度睡眠评估",
            "讲解睡眠生理与CBT-I原理",
            "开始连续7天睡眠日记",
            "建立信任关系与合作目标",
          ],
          materials: ["睡眠卫生检查清单", "睡眠日记填写指南"],
        },
        2: {
          weekNumber: 2,
          focus: "睡眠卫生 + 刺激控制",
          tasks: [
            "逐项落实睡眠卫生建议",
            "执行刺激控制六步法",
            "固定起床时间（含周末）",
            "消除卧床清醒行为",
          ],
          materials: ["刺激控制疗法练习", "睡眠卫生检查清单"],
        },
        3: {
          weekNumber: 3,
          focus: "睡眠限制疗法启动",
          tasks: [
            "基于基线数据计算初始睡眠窗口",
            "严格执行「限制卧床时间」规则",
            "周末作息偏差不超过1小时",
            "日间保持规律活动",
          ],
          materials: ["睡眠限制疗法入门指南"],
        },
        4: {
          weekNumber: 4,
          focus: "睡眠限制调整",
          tasks: [
            "每周根据效率调整窗口±15分钟",
            "记录执行中的困难",
            "练习「20分钟规则」",
          ],
          materials: ["入睡困难应对方案"],
        },
        5: {
          weekNumber: 5,
          focus: "认知重构开始",
          tasks: [
            "识别关于睡眠的自动思维",
            "学习挑战灾难化想法",
            "填写认知重构工作单",
          ],
          materials: ["失眠认知重构工作单"],
        },
        6: {
          weekNumber: 6,
          focus: "认知深化 + 放松训练",
          tasks: [
            "持续认知重构练习",
            "每日渐进式肌肉放松",
            "引入正念呼吸练习",
            "管理睡前「思维反刍」",
          ],
          materials: ["渐进式肌肉放松(PMR)", "睡前身体扫描冥想"],
        },
        7: {
          weekNumber: 7,
          focus: "复发预防",
          tasks: [
            "识别个人高风险情境",
            "为每个情境制定应对方案",
            "建立「应急睡眠工具箱」",
          ],
          materials: ["入睡困难应对方案"],
        },
        8: {
          weekNumber: 8,
          focus: "总结与长期维持",
          tasks: [
            "回顾8周进步曲线",
            "讨论长期睡眠维持策略",
            "制定3个月/6个月随访计划",
            "交付阶段总结报告",
          ],
          materials: ["CBT-I标准8周流程"],
        },
      };
      return plans[w];
    }),
  },
  {
    id: "flow_8w_intensive",
    name: "CBT-I强化版（8周）",
    programType: "8周",
    intensity: "强化",
    description: "针对慢性失眠、共病焦虑/抑郁、执行困难的来访者",
    weeks: makeWeeks(8, (w) => {
      const plans: Record<number, WeekPlan> = {
        1: {
          weekNumber: 1,
          focus: "深度评估与功能分析",
          tasks: [
            "完整睡眠评估 + 精神症状筛查",
            "绘制失眠维持因素的功能分析图",
            "连续2周基线日记（而非1周）",
            "评估动机与改变准备度",
          ],
          materials: ["睡眠卫生检查清单", "睡眠日记填写指南"],
        },
        2: {
          weekNumber: 2,
          focus: "睡眠限制强化版",
          tasks: [
            "更严格的睡眠窗口计算（TST+30分钟起步）",
            "昼夜节律锚定技术（清晨光照）",
            "光暴露策略（白天强光、夜间暗光）",
            "签署「行为契约」增强执行",
          ],
          materials: ["睡眠限制疗法入门指南"],
        },
        3: {
          weekNumber: 3,
          focus: "刺激控制 + 行为激活",
          tasks: [
            "强化刺激控制六步法执行",
            "制定日间活动时间表",
            "引入运动处方（每周≥150分钟）",
            "识别并替代维持失眠的行为",
          ],
          materials: ["刺激控制疗法练习"],
        },
        4: {
          weekNumber: 4,
          focus: "深度认知重构",
          tasks: [
            "全面识别睡眠相关自动思维",
            "苏格拉底提问法挑战歪曲认知",
            "接纳与承诺练习（不与失眠对抗）",
            "元认知层面干预（停止「努力睡觉」）",
          ],
          materials: ["失眠认知重构工作单"],
        },
        5: {
          weekNumber: 5,
          focus: "情绪调节 + 压力管理",
          tasks: [
            "学习情绪命名与接纳",
            "建立日常压力管理系统",
            "「担心时间」技术强化",
            "睡前思维终止练习",
          ],
          materials: ["睡前身体扫描冥想", "渐进式肌肉放松(PMR)"],
        },
        6: {
          weekNumber: 6,
          focus: "共病管理",
          tasks: [
            "处理焦虑/抑郁症状与睡眠的交互",
            "疼痛管理策略（如适用）",
            "逐步减少睡眠药物（如适用，需与处方医生协作）",
            "正念冥想每日练习",
          ],
          materials: ["睡前身体扫描冥想"],
        },
        7: {
          weekNumber: 7,
          focus: "详细复发预防",
          tasks: [
            "列出所有高风险情境并排序",
            "为Top3情境制定详细应对预案",
            "建立自助资源包",
            "确定「警示信号」及响应步骤",
          ],
          materials: ["入睡困难应对方案"],
        },
        8: {
          weekNumber: 8,
          focus: "结案与长期规划",
          tasks: [
            "全面数据回顾与成果确认",
            "制定6-12个月长期维持计划",
            "安排3个月/6个月随访",
            "交付详细阶段总结报告",
          ],
          materials: ["CBT-I强化8周流程"],
        },
      };
      return plans[w];
    }),
  },
];

export const defaultBoundarySettings: BoundarySettings = {
  reminderFrequency: "每日",
  doNotDisturbStart: "22:00",
  doNotDisturbEnd: "08:00",
  weekendReduce: true,
  lostContactDays: 5,
  lowComplianceRate: 50,
  wakeDriftMinutes: 30,
  autoRemindDiary: true,
  emailNotify: true,
  dailySummary: false,
  remindDiaryUnsubmitted: true,
  emailAlerts: true,
  dndStartTime: "22:00",
  dndEndTime: "08:00",
  weekendReduced: true,
};

export function getFlowByProgram(
  programType: "6周" | "8周",
  intensity: "入门" | "标准" | "强化"
): ProgramFlow | undefined {
  return programFlows.find(
    (f) => f.programType === programType && f.intensity === intensity
  );
}
