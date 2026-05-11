"use client";

import React, { useEffect, useState } from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Pagination from "@mui/material/Pagination";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import NotificationsOffIcon from "@mui/icons-material/NotificationsOff";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Log } from "../../../../logging_middleware/src";
import FilterBar from "../../components/FilterBar";
import NotificationCard from "../../components/NotificationCard";
import SkeletonLoader from "../../components/SkeletonLoader";
import { useNotifications } from "../../hooks/useNotifications";
import { useReadContext } from "../../context/ReadContext";
import type { NotificationType } from "../../types/notification";

const PAGE_LIMIT = 10;

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<NotificationType>("All");
  const { notifications, loading, error, refetch } = useNotifications({
    page,
    limit: PAGE_LIMIT,
    type: filter,
  });
  const { isRead, markRead, registerNotifications } = useReadContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    Log("frontend", "info", "page", "Notifications page mounted");
  }, []);

  useEffect(() => {
    registerNotifications(notifications.map((n) => n.ID));
  }, [notifications, registerNotifications]);

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    Log("frontend", "info", "page", `Pagination changed to page ${value}`);
  };

  const handleFilterChange = (value: NotificationType) => {
    setFilter(value);
    setPage(1);
  };

  const handleRetry = () => {
    refetch();
  };

  const pageCount = notifications.length === PAGE_LIMIT ? page + 1 : page;

  return (
    <Container maxWidth="lg" sx={{ px: isMobile ? 2 : 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Notifications
        </Typography>
        <FilterBar value={filter} onChange={handleFilterChange} />
      </Box>

      {loading && <SkeletonLoader />}

      {!loading && error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={handleRetry}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {!loading && !error && notifications.length === 0 && (
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

      {!loading && !error && notifications.length > 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {notifications.map((notification) => (
            <NotificationCard
              key={notification.ID}
              notification={notification}
              isRead={isRead(notification.ID)}
              onRead={markRead}
            />
          ))}
        </Box>
      )}

      {!loading && !error && notifications.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination count={pageCount} page={page} onChange={handlePageChange} color="primary" />
        </Box>
      )}
    </Container>
  );
}
