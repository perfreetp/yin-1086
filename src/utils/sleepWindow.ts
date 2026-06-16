import type { SleepDiary } from "../types";

export interface SleepWindowSuggestion {
  currentBed: string;
  currentWake: string;
  suggestedBed: string;
  suggestedWake: string;
  adjustment: string;
  reasoning: string[];
  level: "maintain" | "expand" | "shrink" | "shift";
}

const parseTime = (t: string): number => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const formatTime = (minutes: number): string => {
  const m = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
};

/**
 * 根据最近7天睡眠日记智能生成下周睡眠窗口建议
 */
export function generateSleepWindowSuggestion(
  diaries: SleepDiary[],
  currentBed: string,
  currentWake: string
): SleepWindowSuggestion {
  const last7 = diaries.slice(-7).filter((d) => d.submitted);

  const suggestion: SleepWindowSuggestion = {
    currentBed,
    currentWake,
    suggestedBed: currentBed,
    suggestedWake: currentWake,
    adjustment: "维持当前睡眠窗口",
    reasoning: [],
    level: "maintain",
  };

  if (last7.length < 4) {
    suggestion.reasoning.push("有效日记不足4天，暂不调整窗口，先聚焦提高日记完成率");
    return suggestion;
  }

  const avgEfficiency =
    last7.reduce((s, d) => s + d.sleepEfficiency, 0) / last7.length;
  const avgTST =
    last7.reduce((s, d) => s + d.totalSleepTime, 0) / last7.length;
  const weekendCatchUpCount = last7.filter((d) => d.weekendCatchUp).length;
  const avgDaytimeNap =
    last7.reduce((s, d) => s + d.daytimeNap, 0) / last7.length;
  const avgWakeDrift =
    last7.reduce((s, d) => s + Math.abs(d.wakeDrift), 0) / last7.length;

  const bedMin = parseTime(currentBed);
  const wakeMin = parseTime(currentWake);

  if (weekendCatchUpCount >= 2) {
    suggestion.reasoning.push(
      `周末补觉${weekendCatchUpCount}天，说明平日睡眠债累积或作息节律不稳`
    );
    suggestion.level = "shift";
  }
  if (avgDaytimeNap > 45) {
    suggestion.reasoning.push(
      `日均白天补眠${Math.round(avgDaytimeNap)}分钟，过长的补眠会干扰夜间睡眠驱动力`
    );
  }
  if (avgWakeDrift > 40) {
    suggestion.reasoning.push(
      `平均起床漂移${Math.round(avgWakeDrift)}分钟，建议先把起床时间固定住`
    );
  }

  if (avgEfficiency >= 90 && avgTST >= 6.5) {
    suggestion.level = "expand";
    suggestion.suggestedBed = formatTime(bedMin - 15);
    suggestion.suggestedWake = currentWake;
    suggestion.adjustment = `入睡时间提前15分钟至${suggestion.suggestedBed}，起床时间${currentWake}保持`;
    suggestion.reasoning.unshift(
      `睡眠效率${Math.round(avgEfficiency)}%、时长${avgTST.toFixed(1)}h均已达标，可尝试延长窗口15分钟`
    );
  } else if (avgEfficiency >= 85) {
    suggestion.level = "expand";
    suggestion.suggestedBed = formatTime(bedMin - 15);
    suggestion.suggestedWake = currentWake;
    suggestion.adjustment = `入睡时间提前15分钟至${suggestion.suggestedBed}，起床时间${currentWake}保持`;
    suggestion.reasoning.unshift(
      `睡眠效率${Math.round(avgEfficiency)}%达到扩展阈值，窗口可延长15分钟`
    );
  } else if (avgEfficiency >= 75) {
    suggestion.level = "maintain";
    suggestion.adjustment = `维持当前睡眠窗口 ${currentBed} - ${currentWake}`;
    suggestion.reasoning.unshift(
      `睡眠效率${Math.round(avgEfficiency)}%处于稳定区间，继续巩固当前作息`
    );
  } else {
    suggestion.level = "shrink";
    suggestion.suggestedBed = formatTime(bedMin + 15);
    suggestion.suggestedWake = currentWake;
    suggestion.adjustment = `入睡时间推迟15分钟至${suggestion.suggestedBed}，起床时间${currentWake}保持，以压缩卧床时间提高睡眠效率`;
    suggestion.reasoning.unshift(
      `睡眠效率${Math.round(avgEfficiency)}%低于阈值75%，建议压缩卧床时间（睡眠限制核心原则）`
    );
  }

  if (avgTST < 5) {
    suggestion.reasoning.push(
      `平均时长仅${avgTST.toFixed(1)}h，需关注日间功能影响，但切勿通过提前上床来「补觉」`
    );
  }

  return suggestion;
}

export function generateWeeklyTasks(
  suggestion: SleepWindowSuggestion,
  intensity: "入门" | "标准" | "强化",
  currentWeek: number
): string[] {
  const base: string[] = [];

  base.push(`继续每日填写睡眠日记，起床后5分钟内完成，不要补填`);
  base.push(`执行本周睡眠窗口：${suggestion.suggestedBed} 上床，${suggestion.suggestedWake} 准时起床（含周末）`);

  if (suggestion.level === "shrink") {
    base.push(
      `睡眠窗口缩短阶段可能会有短暂的日间困倦，坚持1-2周后睡眠效率会提升`
    );
  }
  if (suggestion.reasoning.some((r) => r.includes("周末补觉"))) {
    base.push(`周末起床时间与工作日偏差不超过1小时，不主动「补觉」`);
  }
  if (suggestion.reasoning.some((r) => r.includes("白天补眠"))) {
    base.push(`日间如需休息，控制在20分钟内，下午3点后不补眠`);
  }
  if (suggestion.reasoning.some((r) => r.includes("起床漂移"))) {
    base.push(`使用闹钟强制固定起床时间，醒来后立即离开卧室接受光照`);
  }

  if (intensity === "入门") {
    if (currentWeek <= 2) {
      base.push(`午后不喝茶、咖啡、能量饮料等含咖啡因饮品`);
    }
    base.push(`睡前1小时关闭电子设备，改为纸质阅读或温和拉伸`);
  } else if (intensity === "标准") {
    base.push(`午后不摄入咖啡因，睡前3小时不大量进食、不饮酒`);
    base.push(`卧床20分钟仍清醒时，立即起床到另一房间做安静活动，困了再回床`);
    if (currentWeek >= 4) {
      base.push(`记录睡前冒出的担忧想法，安排在「担心时间」（建议傍晚17-18点）处理`);
    }
  } else {
    base.push(`严格执行咖啡因、运动、饮食的睡眠卫生清单`);
    base.push(`每日睡前15分钟身体扫描或PMR放松练习`);
    base.push(`如果发现自己在「努力睡觉」，提醒自己：睡眠是自然发生的，不需要用力`);
    base.push(`完成认知重构工作单，记录和挑战关于睡眠的灾难化想法`);
  }

  return base;
}
