"use client";

import React, { useMemo } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import { alpha, useTheme } from "@mui/material/styles";
import { Log } from "../../../logging_middleware/src";
import type { Notification } from "../types/notification";

const typeColors: Record<Notification["Type"], string> = {
  Placement: "#2E7D32",
  Result: "#F57F17",
  Event: "#1565C0",
};

const parseTimestamp = (value: string) => {
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? new Date() : date;
};

const formatRelative = (value: string) => {
  const now = Date.now();
  const ts = parseTimestamp(value).getTime();
  const diff = Math.max(0, now - ts);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days === 1 ? "" : "s"} ago`;
  if (hours > 0) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  if (minutes > 0) return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
  return "just now";
};

type NotificationCardProps = {
  notification: Notification;
  isRead: boolean;
  onRead: (id: string) => void;
  rank?: number;
  score?: number;
};

export default function NotificationCard({
  notification,
  isRead,
  onRead,
  rank,
  score,
}: NotificationCardProps) {
  const theme = useTheme();
  const color = typeColors[notification.Type];

  const relativeTime = useMemo(
    () => formatRelative(notification.Timestamp),
    [notification.Timestamp]
  );

  const handleClick = () => {
    onRead(notification.ID);
    Log("frontend", "info", "component", `Notification clicked: ${notification.ID}`);
  };

  return (
    <Card
      onClick={handleClick}
      sx={{
        borderLeft: `4px solid ${color}`,
        bgcolor: isRead ? "#fff" : alpha(theme.palette.primary.main, 0.08),
        cursor: "pointer",
        transition: "transform 0.15s ease",
        "&:hover": { transform: "translateY(-2px)" },
      }}
    >
      <CardContent sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
        {typeof rank === "number" && (
          <Avatar
            sx={{
              bgcolor: color,
              color: "#fff",
              width: 36,
              height: 36,
              fontSize: 14,
              fontWeight: 700,
              mt: 0.5,
            }}
          >
            #{rank}
          </Avatar>
        )}

        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Chip
              label={notification.Type}
              size="small"
              sx={{ bgcolor: color, color: "#fff", fontWeight: 600 }}
            />
            <Typography variant="caption" color="text.secondary">
              {relativeTime}
            </Typography>
          </Box>

          <Typography
            variant="body1"
            sx={{ fontWeight: isRead ? 400 : 700, color: isRead ? "text.secondary" : "#111" }}
          >
            {notification.Message}
          </Typography>

          {typeof score === "number" && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
              Score: {score.toFixed(2)}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
