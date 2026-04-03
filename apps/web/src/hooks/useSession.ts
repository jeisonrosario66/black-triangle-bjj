import { useContext } from "react";

import { SessionContext } from "@src/context/authSession";

export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSession debe usarse dentro de <AuthProvider />");
  }

  return context;
}
