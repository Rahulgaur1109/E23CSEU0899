"use client";

import React from "react";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import Typography from "@mui/material/Typography";
import { Log } from "../../../logging_middleware/src";

type PrioritySliderProps = {
  value: number;
  onChange: (value: number) => void;
};

export default function PrioritySlider({ value, onChange }: PrioritySliderProps) {
  const handleChange = (_: Event, newValue: number | number[]) => {
    const next = Array.isArray(newValue) ? newValue[0] : newValue;
    Log("frontend", "info", "component", `Priority N changed to: ${next}`);
    onChange(next);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Show top N notifications: {value}
      </Typography>
      <Slider
        min={5}
        max={50}
        step={5}
        value={value}
        onChange={handleChange}
        aria-label="Priority N"
      />
    </Box>
  );
}
