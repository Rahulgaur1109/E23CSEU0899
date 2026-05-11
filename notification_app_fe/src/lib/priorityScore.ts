import type { Notification, PrioritizedNotification } from "../types/notification";

type WeightMap = Record<Notification["Type"], number>;

const typeWeight: WeightMap = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

const parseTimestamp = (value: string) => {
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? new Date() : date;
};

export function getPrioritized(
  notifications: Notification[],
  n: number
): PrioritizedNotification[] {
  if (!notifications.length || n <= 0) return [];

  const now = Date.now();
  const ages = notifications.map((item) => {
    const ts = parseTimestamp(item.Timestamp).getTime();
    return Math.max(0, now - ts);
  });
  const oldestAge = Math.max(...ages, 1);

  const scored = notifications.map((item, index) => {
    const recencyScore = 1 - ages[index] / oldestAge;
    const score = typeWeight[item.Type] + recencyScore;
    return { ...item, score };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return parseTimestamp(b.Timestamp).getTime() - parseTimestamp(a.Timestamp).getTime();
  });

  return scored.slice(0, n).map((item, idx) => ({
    ...item,
    rank: idx + 1,
  }));
}
