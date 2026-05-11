"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Log } from "../../../logging_middleware/src";

type ReadContextValue = {
  isRead: (id: string) => boolean;
  markRead: (id: string) => void;
  markAllRead: () => void;
  registerNotifications: (ids: string[]) => void;
  unreadCount: number;
};

const STORAGE_KEY = "affordmed_read_ids";
const ReadContext = createContext<ReadContextValue | undefined>(undefined);

export function ReadProvider({ children }: { children: React.ReactNode }) {
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [knownIds, setKnownIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        setReadIds(new Set(parsed));
      }
    } catch {
      // Ignore localStorage parsing errors
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(readIds)));
    } catch {
      // Ignore localStorage write errors
    }
  }, [readIds]);

  const registerNotifications = useCallback((ids: string[]) => {
    if (!ids.length) return;
    setKnownIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
  }, []);

  const isRead = (id: string) => readIds.has(id);

  const markRead = useCallback((id: string) => {
    setReadIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    Log("frontend", "info", "state", `Notification marked as read: ${id}`);
  }, []);

  const markAllRead = useCallback(() => {
    setReadIds(new Set(knownIds));
    Log(
      "frontend",
      "info",
      "state",
      `Marked all as read. Total read: ${knownIds.size}`
    );
  }, [knownIds]);

  const unreadCount = useMemo(() => {
    const unread = knownIds.size - readIds.size;
    return unread < 0 ? 0 : unread;
  }, [knownIds, readIds]);

  const value = useMemo(
    () => ({ isRead, markRead, markAllRead, registerNotifications, unreadCount }),
    [readIds, knownIds, markRead, markAllRead, registerNotifications, unreadCount]
  );

  return <ReadContext.Provider value={value}>{children}</ReadContext.Provider>;
}

export function useReadContext() {
  const ctx = useContext(ReadContext);
  if (!ctx) {
    throw new Error("useReadContext must be used within ReadProvider");
  }
  return ctx;
}
