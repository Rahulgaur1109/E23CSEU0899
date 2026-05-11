"use client";

import React from "react";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { Log } from "../../../logging_middleware/src";
import type { NotificationType } from "../types/notification";

type FilterBarProps = {
  value: NotificationType;
  onChange: (value: NotificationType) => void;
};

export default function FilterBar({ value, onChange }: FilterBarProps) {
  const handleChange = (_: React.MouseEvent<HTMLElement>, newValue: NotificationType | null) => {
    if (!newValue) return;
    Log("frontend", "info", "component", `Filter changed to: ${newValue}`);
    onChange(newValue);
  };

  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      onChange={handleChange}
      size="small"
      aria-label="notification filter"
    >
      <ToggleButton value="All">All</ToggleButton>
      <ToggleButton value="Event">Event</ToggleButton>
      <ToggleButton value="Result">Result</ToggleButton>
      <ToggleButton value="Placement">Placement</ToggleButton>
    </ToggleButtonGroup>
  );
}
