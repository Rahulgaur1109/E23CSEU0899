import { Log } from "../../logging_middleware/src";
import { getAuthToken } from "../src/config/auth";
import { fetchAllNotifications } from "../src/lib/api";
import { getPrioritized } from "../src/lib/priorityScore";

const parseN = () => {
  const raw = process.argv.find((arg) => arg.startsWith("--n="));
  if (!raw) return 10;
  const value = Number(raw.split("=")[1]);
  if (!Number.isFinite(value) || value <= 0) return 10;
  return value;
};

const truncate = (value: string, max = 40) => {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 3)}...`;
};

const pad = (value: string, width: number) => {
  if (value.length >= width) return value;
  return value + " ".repeat(width - value.length);
};

const buildTable = (rows: string[][]) => {
  const widths = rows[0].map((_, i) => Math.max(...rows.map((row) => row[i].length)));
  const lines = rows.map((row) => row.map((cell, i) => pad(cell, widths[i])).join(" | "));
  const separator = widths.map((w) => "-".repeat(w)).join("-|-");
  lines.splice(1, 0, separator);
  return lines.join("\n");
};

async function run() {
  const n = parseN();
  await Log("frontend", "info", "api", `Priority script started with n=${n}`);

  await getAuthToken();
  await Log("frontend", "info", "api", "Auth token acquired for script");

  const notifications = await fetchAllNotifications();
  await Log("frontend", "info", "api", `Fetched ${notifications.length} notifications`);

  const prioritized = getPrioritized(notifications, n);
  await Log("frontend", "info", "api", `Computed top ${prioritized.length} notifications`);

  const header = ["Rank", "Type", "Message", "Timestamp", "Score"];
  const rows = prioritized.map((item) => [
    String(item.rank),
    item.Type,
    truncate(item.Message),
    item.Timestamp,
    item.score.toFixed(2),
  ]);

  const table = buildTable([header, ...rows]);
  process.stdout.write(`${table}\n`);
}

run().catch(async (err) => {
  const message = err instanceof Error ? err.message : "Unknown script error";
  await Log("frontend", "error", "api", `Priority script failed: ${message}`);
  process.stdout.write(`Error: ${message}\n`);
});
