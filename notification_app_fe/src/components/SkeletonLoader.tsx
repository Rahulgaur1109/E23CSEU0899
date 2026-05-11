"use client";

import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";

export default function SkeletonLoader() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {Array.from({ length: 5 }).map((_, idx) => (
        <Card key={idx}>
          <CardContent sx={{ display: "flex", gap: 2 }}>
            <Skeleton variant="circular" width={36} height={36} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="30%" />
              <Skeleton variant="text" width="90%" />
              <Skeleton variant="text" width="60%" />
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
