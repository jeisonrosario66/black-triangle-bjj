import type { SessionUser } from "@src/context";

export const SPECIAL_GRAPH_EDITOR_EMAIL = String(
  import.meta.env.VITE_SPECIAL_GRAPH_EDITOR_EMAIL ?? "",
)
  .trim()
  .toLowerCase();

export const isSpecialGraphUser = (
  user?: SessionUser | null,
  email?: string | null,
) => {
  const normalizedEmail = (email ?? user?.email ?? "").trim().toLowerCase();

  return Boolean(SPECIAL_GRAPH_EDITOR_EMAIL) && normalizedEmail === SPECIAL_GRAPH_EDITOR_EMAIL;
};

export const hasGraphEditorAccess = (
  user?: SessionUser | null,
  email?: string | null,
) => {
  const normalizedEmail = (email ?? user?.email ?? "").trim().toLowerCase();

  if (!normalizedEmail) {
    return false;
  }

  if (isSpecialGraphUser(undefined, normalizedEmail)) {
    return true;
  }

  return Boolean(user?.canManageGraphLinks);
};
