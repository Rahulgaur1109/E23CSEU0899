import { Log, setLogToken } from "../../../logging_middleware/src";
import { getAuthToken } from "../config/auth";
import type { Notification, NotificationType } from "../types/notification";

type FetchNotificationsParams = {
  page: number;
  limit: number;
  type: NotificationType;
};

type FetchNotificationsResult = {
  notifications: Notification[];
  hasMore: boolean;
};

const API_BASE_URL = "http://4.224.186.213/evaluation-service";

export async function fetchNotifications(
  params: FetchNotificationsParams
): Promise<FetchNotificationsResult> {
  const token = await getAuthToken();
  setLogToken(token);

  const query = new URLSearchParams();
  query.set("limit", String(params.limit));
  query.set("page", String(params.page));
  if (params.type !== "All") {
    query.set("notification_type", params.type);
  }

  const url = `${API_BASE_URL}/notifications?${query.toString()}`;
  await Log(
    "frontend",
    "info",
    "api",
    `Fetching notifications page ${params.page} limit ${params.limit} type ${params.type}`
  );

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: token,
      },
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      const detail = errorText ? ` - ${errorText}` : "";
      await Log(
        "frontend",
        "error",
        "api",
        `Failed to fetch: ${res.status}${detail}`
      );
      throw new Error(`Failed to fetch notifications: ${res.status}${detail}`);
    }

    const data = (await res.json()) as { notifications: Notification[] };
    const notifications = Array.isArray(data.notifications) ? data.notifications : [];
    await Log(
      "frontend",
      "info",
      "api",
      `Received ${notifications.length} notifications`
    );

    return {
      notifications,
      hasMore: notifications.length === params.limit,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await Log("frontend", "error", "api", `Failed to fetch: ${message}`);
    throw err;
  }
}

export async function fetchAllNotifications(): Promise<Notification[]> {
  const all: Notification[] = [];
  const seen = new Set<string>();
  let page = 1;
  const limit = 10;
  const maxPages = 200;

  await Log("frontend", "info", "api", "Fetching all notifications");

  while (true) {
    const { notifications, hasMore } = await fetchNotifications({
      page,
      limit,
      type: "All",
    });

    let newCount = 0;
    for (const item of notifications) {
      if (!seen.has(item.ID)) {
        seen.add(item.ID);
        all.push(item);
        newCount += 1;
      }
    }

    if (newCount === 0) {
      await Log(
        "frontend",
        "warn",
        "api",
        `No new notifications on page ${page}, stopping pagination`
      );
      break;
    }

    if (!hasMore) break;
    page += 1;
    if (page > maxPages) {
      await Log(
        "frontend",
        "warn",
        "api",
        `Reached max pages (${maxPages}), stopping pagination`
      );
      break;
    }
  }

  await Log("frontend", "info", "api", `Fetched total ${all.length} notifications`);
  return all;
}
