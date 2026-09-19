"use client";

import React, { useState } from "react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { MOCK_HOSPITALS, Hospital, ConsignmentRequest, INITIAL_CONSIGNMENTS } from "@/data/hospitalsData";
import RoleSelectorModal from "@/components/RoleSelectorModal";
import AuthModal from "@/components/AuthModal";
import DmoDashboard from "@/components/DmoDashboard";
import GeneralUserDashboard from "@/components/GeneralUserDashboard";
import PhcWorkerDashboard from "@/components/PhcWorkerDashboard";

function MainContent() {
  const { role, user, openRoleSelector, openAuthModal, logout, selectRole } = useAuth();
  const [hospitals, setHospitals] = useState<Hospital[]>(MOCK_HOSPITALS);
  const [consignments, setConsignments] = useState<ConsignmentRequest[]>(INITIAL_CONSIGNMENTS);

  const handleRequestRequisitionToDmo = (req: Omit<ConsignmentRequest, "id" | "status" | "requestedAt">) => {
    const newConsignment: ConsignmentRequest = {
      ...req,
      id: `csg-${Date.now()}`,
      status: "Pending Dispatch",
      requestedAt: "Just now",
    };
    setConsignments((prev) => [newConsignment, ...prev]);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-30 px-4 md:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div
              onClick={openRoleSelector}
              className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-blue-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-emerald-500/20 cursor-pointer hover:scale-105 transition-transform"
            >
              A
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight">ArogyaNet</h1>
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  GIS Telemetry
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Multi-Role Health Network & Inventory Monitor
              </p>
            </div>
          </div>

          {/* User & Role Controls */}
          <div className="flex items-center gap-3">
            {/* Active Role Selector Button */}
            <button
              onClick={openRoleSelector}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all shadow-sm ${
                role === "dmo"
                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 hover:bg-blue-500/20"
                  : role === "phc_worker"
                  ? "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30 hover:bg-teal-500/20"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
              }`}
            >
              <span>
                {role === "dmo"
                  ? "🏥 DMO Portal"
                  : role === "phc_worker"
                  ? "🩺 PHC Worker Portal"
                  : "👤 General Public Portal"}
              </span>
              <span className="text-[10px] opacity-60">▼ Change Role</span>
            </button>

            {/* Auth User Details / Sign In */}
            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col text-right text-xs">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">{user.name}</span>
                  <span className="text-[10px] text-zinc-400 font-mono">{user.badgeId || user.email}</span>
                </div>
                <button
                  onClick={logout}
                  className="px-3 py-1.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-xs font-semibold transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal(role || "general", "login")}
                  className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-bold text-xs shadow-sm transition-colors"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Active Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8">
        {role === "dmo" ? (
          <DmoDashboard hospitals={hospitals} onUpdateHospitals={setHospitals} />
        ) : role === "phc_worker" ? (
          <PhcWorkerDashboard
            hospitals={hospitals}
            onUpdateHospitals={setHospitals}
            onRequestRequisitionToDmo={handleRequestRequisitionToDmo}
          />
        ) : (
          <GeneralUserDashboard hospitals={hospitals} />
        )}
      </main>

      {/* Role Selector & Auth Modals */}
      <RoleSelectorModal />
      <AuthModal />
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
