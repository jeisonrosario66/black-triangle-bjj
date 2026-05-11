import { createContext } from "react";

export type SessionUserRole = "viewer" | "editor" | "owner";

export type SessionUser = {
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  initials: string;
  picture: string | null;
  role: SessionUserRole;
  roles: SessionUserRole[];
  canManageGraphLinks: boolean;
};

export type SessionContextValue = {
  user: SessionUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
};

export const SessionContext = createContext<SessionContextValue | null>(null);
