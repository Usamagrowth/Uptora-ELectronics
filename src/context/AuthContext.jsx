import { createContext, useContext } from "react";
import { useSession } from "next-auth/react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { data: session, status } = useSession();
  const user = session?.user ?? null;
  const isAdmin = Boolean(session?.user?.isAdmin);

  return (
    <AuthContext.Provider value={{ user, isAdmin, status, session }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
}
