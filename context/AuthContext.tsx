"use client";

import React, { createContext, useContext, useState } from "react";

export type UserRole = "general" | "dmo" | "phc_worker" | null;

export interface UserProfile {
  id: string;
  name: string;
  role: "general" | "dmo" | "phc_worker";
  email: string;
  badgeId?: string; // DMO Badge (e.g. DMO-PANVEL-01) or PHC Worker ID (e.g. PHC-KAMOTHE-04)
  district?: string;
  phcCenterId?: string;
  phcCenterName?: string;
}

interface AuthContextType {
  role: UserRole;
  user: UserProfile | null;
  isRoleSelectorOpen: boolean;
  isAuthModalOpen: boolean;
  authMode: "login" | "register";
  targetRoleForAuth: "general" | "dmo" | "phc_worker";
  
  selectRole: (role: UserRole) => void;
  openRoleSelector: () => void;
  closeRoleSelector: () => void;
  
  openAuthModal: (role: "general" | "dmo" | "phc_worker", mode?: "login" | "register") => void;
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
  const [targetRoleForAuth, setTargetRoleForAuth] = useState<"general" | "dmo" | "phc_worker">("general");

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

  const openAuthModal = (targetRole: "general" | "dmo" | "phc_worker", mode: "login" | "register" = "login") => {
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
