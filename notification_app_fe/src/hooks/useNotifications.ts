"use client";

import { useCallback, useEffect, useState } from "react";
import { Log } from "../../../logging_middleware/src";
import { fetchNotifications } from "../lib/api";
import type { Notification, NotificationType } from "../types/notification";

type UseNotificationsArgs = {
  page: number;
  limit: number;
  type: NotificationType;
};

type UseNotificationsState = {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useNotifications({ page, limit, type }: UseNotificationsArgs): UseNotificationsState {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    await Log("frontend", "info", "hook", `useNotifications: fetching page ${page}`);
    try {
      const res = await fetchNotifications({ page, limit, type });
      setNotifications(res.notifications);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load notifications";
      setError(message);
      await Log("frontend", "error", "hook", `useNotifications error: ${message}`);
    } finally {
      setLoading(false);
    }
  }, [page, limit, type]);

  useEffect(() => {
    load();
  }, [load]);

  return { notifications, loading, error, refetch: load };
}
