export type HeaderAction =
  | { type: "search" }
  | { type: "avatar"; initials?: string }
  | { type: "notifications"; unread?: number }
  | { type: "divider" }
  | { type: "explorer" };
