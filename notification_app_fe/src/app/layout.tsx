"use client";

import React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../theme";
import NavBar from "../components/NavBar";
import { ReadProvider } from "../context/ReadContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <ReadProvider>
            <NavBar />
            <Box component="main" sx={{ pt: 3, pb: 5 }}>
              {children}
            </Box>
          </ReadProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
