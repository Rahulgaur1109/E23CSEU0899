export interface Notification {
  ID: string;
  Type: "Event" | "Result" | "Placement";
  Message: string;
  Timestamp: string;
}

export type NotificationType = "Event" | "Result" | "Placement" | "All";

export interface PrioritizedNotification extends Notification {
  score: number;
  rank: number;
}
