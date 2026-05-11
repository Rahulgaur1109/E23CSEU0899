"use client";

import React, { useEffect, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Badge from "@mui/material/Badge";
import Button from "@mui/material/Button";
import MenuIcon from "@mui/icons-material/Menu";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Log } from "../../../logging_middleware/src";
import { useReadContext } from "../context/ReadContext";

const navItems = [
  { label: "All Notifications", href: "/notifications" },
  { label: "Priority Inbox", href: "/priority-inbox" },
];

export default function NavBar() {
  const { unreadCount } = useReadContext();
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [open, setOpen] = useState(false);

  useEffect(() => {
    Log(
      "frontend",
      "info",
      "component",
      `NavBar rendered, unread count: ${unreadCount}`
    );
  }, [unreadCount]);

  const handleNavigate = (href: string) => {
    router.push(href);
    setOpen(false);
  };

  const renderLinks = () => (
    <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
      {navItems.map((item) => {
        const active = pathname === item.href;
        const content = item.label === "All Notifications" ? (
          <Badge color="error" badgeContent={unreadCount} max={99}>
            {item.label}
          </Badge>
        ) : (
          item.label
        );

        return (
          <Button
            key={item.href}
            onClick={() => handleNavigate(item.href)}
            color={active ? "secondary" : "inherit"}
            sx={{ fontWeight: active ? 700 : 500 }}
          >
            {content}
          </Button>
        );
      })}
    </Box>
  );

  return (
    <AppBar position="sticky" color="primary">
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Campus Notifications
        </Typography>

        {isMobile ? (
          <>
            <IconButton
              color="inherit"
              edge="end"
              onClick={() => setOpen(true)}
              aria-label="Open navigation"
            >
              <MenuIcon />
            </IconButton>
            <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
              <Box sx={{ width: 240 }}>
                <List>
                  {navItems.map((item) => (
                    <ListItemButton
                      key={item.href}
                      selected={pathname === item.href}
                      onClick={() => handleNavigate(item.href)}
                    >
                      <ListItemText
                        primary={
                          item.label === "All Notifications" ? (
                            <Badge color="error" badgeContent={unreadCount} max={99}>
                              {item.label}
                            </Badge>
                          ) : (
                            item.label
                          )
                        }
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Box>
            </Drawer>
          </>
        ) : (
          renderLinks()
        )}
      </Toolbar>
    </AppBar>
  );
}
