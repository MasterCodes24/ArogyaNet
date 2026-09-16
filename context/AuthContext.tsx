"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "general" | "dmo" | null;

export interface UserProfile {
  id: string;
  name: string;
  role: "general" | "dmo";
  email: string;
  badgeId?: string; // Specific for DMO (e.g. DMO-PANVEL-01)
  district?: string;
}

interface AuthContextType {
  role: UserRole;
  user: UserProfile | null;
  isRoleSelectorOpen: boolean;
  isAuthModalOpen: boolean;
  authMode: "login" | "register";
  targetRoleForAuth: "general" | "dmo";
  
  selectRole: (role: UserRole) => void;
  openRoleSelector: () => void;
  closeRoleSelector: () => void;
  
  openAuthModal: (role: "general" | "dmo", mode?: "login" | "register") => void;
  closeAuthModal: () => void;
  
  login: (profile: UserProfile) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isRoleSelectorOpen, setIsRoleSelectorOpen] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [targetRoleForAuth, setTargetRoleForAuth] = useState<"general" | "dmo">("general");

  const selectRole = (selectedRole: UserRole) => {
    setRole(selectedRole);
    if (selectedRole) {
      setIsRoleSelectorOpen(false);
    }
  };

  const openRoleSelector = () => {
    setIsRoleSelectorOpen(true);
  };

  const closeRoleSelector = () => {
    setIsRoleSelectorOpen(false);
  };

  const openAuthModal = (targetRole: "general" | "dmo", mode: "login" | "register" = "login") => {
    setTargetRoleForAuth(targetRole);
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = (profile: UserProfile) => {
    setUser(profile);
    setRole(profile.role);
    setIsAuthModalOpen(false);
    setIsRoleSelectorOpen(false);
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    setIsRoleSelectorOpen(true);
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        user,
        isRoleSelectorOpen,
        isAuthModalOpen,
        authMode,
        targetRoleForAuth,
        selectRole,
        openRoleSelector,
        closeRoleSelector,
        openAuthModal,
        closeAuthModal,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
