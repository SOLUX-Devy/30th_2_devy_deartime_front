import { createContext, useContext } from "react";

// 1. Context 생성
export const UserContext = createContext(null);

// 2. Hook 생성
export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}