"use client";

import { GetUserInfoResponse } from "@/lib/api/types";
import React, { createContext, useContext, useState, ReactNode } from "react";


// Define the context type
interface UserContextType {
  user: GetUserInfoResponse | null;
  setUser: (user: GetUserInfoResponse | null) => void;
  clearUser: () => void;
}

// Create the context with default values
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider component
export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<GetUserInfoResponse | null>(null);

  const clearUser = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, setUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
}

// Custom hook to use the UserContext
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
