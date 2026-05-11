"use client";

import React, { useEffect, useMemo, useState } from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import NotificationsOffIcon from "@mui/icons-material/NotificationsOff";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Log } from "../../../../logging_middleware/src";
import PrioritySlider from "../../components/PrioritySlider";
import NotificationCard from "../../components/NotificationCard";
import SkeletonLoader from "../../components/SkeletonLoader";
import { fetchAllNotifications } from "../../lib/api";
import { getPrioritized } from "../../lib/priorityScore";
import { useReadContext } from "../../context/ReadContext";
import type { Notification } from "../../types/notification";

export default function PriorityInboxPage() {
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [n, setN] = useState(10);
  const { isRead, markRead, registerNotifications } = useReadContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllNotifications();
      setAllNotifications(data);
      registerNotifications(data.map((item) => item.ID));
      await Log("frontend", "info", "page", `Priority inbox loaded ${data.length} items`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load notifications";
      setError(message);
      await Log("frontend", "error", "page", `Priority inbox error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Log("frontend", "info", "page", "Priority inbox page mounted");
    loadAll();
  }, []);

  const prioritized = useMemo(() => getPrioritized(allNotifications, n), [allNotifications, n]);

  useEffect(() => {
    if (prioritized.length > 0) {
      const top = prioritized[0];
      Log(
        "frontend",
        "info",
        "page",
        `Priority inbox: computed top ${prioritized.length}, highest score=${top.score.toFixed(2)}`
      );
    }
  }, [prioritized]);

  return (
    <Container maxWidth="lg" sx={{ px: isMobile ? 2 : 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Priority Inbox
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <PrioritySlider value={n} onChange={setN} />
      </Box>

      {loading && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Loading notifications...
          </Typography>
          <LinearProgress />
        </Box>
      )}

      {loading && <SkeletonLoader />}

      {!loading && error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={loadAll}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {!loading && !error && prioritized.length === 0 && (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            color: "text.secondary",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
          }}
        >
          <NotificationsOffIcon fontSize="large" />
          <Typography variant="subtitle1">No notifications found</Typography>
        </Box>
      )}

      {!loading && !error && prioritized.length > 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {prioritized.map((notification) => (
            <NotificationCard
              key={notification.ID}
              notification={notification}
              isRead={isRead(notification.ID)}
              onRead={markRead}
              rank={notification.rank}
              score={notification.score}
            />
          ))}
        </Box>
      )}
    </Container>
  );
}
