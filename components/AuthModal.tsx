"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { MOCK_HOSPITALS } from "@/data/hospitalsData";

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authMode, targetRoleForAuth, login } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [badgeId, setBadgeId] = useState("");
  const [phcCenterId, setPhcCenterId] = useState(MOCK_HOSPITALS[2].id); // Default to Khandeshwar Rural
  const [district, setDistrict] = useState("Raigad");
  const [isModeLogin, setIsModeLogin] = useState(authMode === "login");
  const [error, setError] = useState("");

  React.useEffect(() => {
    setIsModeLogin(authMode === "login");
    if (targetRoleForAuth === "dmo") {
      setEmail("dmo.panvel@arogyanet.gov.in");
      setBadgeId("DMO-PANVEL-01");
      setPassword("password123");
    } else if (targetRoleForAuth === "phc_worker") {
      setEmail("phc.kamothe@arogyanet.gov.in");
      setBadgeId("PHC-KAMOTHE-04");
      setPassword("password123");
    } else {
      setEmail("citizen@arogyanet.in");
      setPassword("password123");
    }
  }, [authMode, targetRoleForAuth, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    const assignedPhc = MOCK_HOSPITALS.find((h) => h.id === phcCenterId) || MOCK_HOSPITALS[2];

    login({
      id: badgeId || `user-${Date.now()}`,
      name: name || (
        targetRoleForAuth === "dmo"
          ? "Dr. Rajesh Sharma (DMO)"
          : targetRoleForAuth === "phc_worker"
          ? "Sujata Pawar (PHC Health Worker)"
          : "Ananya Patil"
      ),
      role: targetRoleForAuth,
      email,
      badgeId: badgeId || (targetRoleForAuth === "dmo" ? "DMO-PANVEL-01" : targetRoleForAuth === "phc_worker" ? "PHC-KAMOTHE-04" : undefined),
      district: targetRoleForAuth !== "general" ? district : undefined,
      phcCenterId: targetRoleForAuth === "phc_worker" ? assignedPhc.id : undefined,
      phcCenterName: targetRoleForAuth === "phc_worker" ? assignedPhc.name : undefined,
    });

    closeAuthModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl">
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-lg font-bold w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center transition-colors"
        >
          ✕
        </button>

        <div className="mb-6 space-y-1 text-center">
          <span
            className={`inline-block px-3 py-1 text-xs font-bold rounded-full border ${
              targetRoleForAuth === "dmo"
                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                : targetRoleForAuth === "phc_worker"
                ? "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20"
                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
            }`}
          >
            {targetRoleForAuth === "dmo"
              ? "District Medical Officer Portal"
              : targetRoleForAuth === "phc_worker"
              ? "Primary Health Centre (PHC) Worker Portal"
              : "General User Access"}
          </span>
          <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
            {isModeLogin ? "Official Sign In" : "Register Account"}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {targetRoleForAuth === "dmo"
              ? "Authenticate with assigned DMO Badge ID."
              : targetRoleForAuth === "phc_worker"
              ? "Access local PHC stock & bed management dashboard."
              : "Access real-time bed & medicine telemetry."}
          </p>
        </div>

        {/* Quick Demo Credentials Helper */}
        <div className={`mb-4 p-3 rounded-xl border text-xs flex items-center justify-between ${
          targetRoleForAuth === "dmo"
            ? "bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300"
            : targetRoleForAuth === "phc_worker"
            ? "bg-teal-500/10 border-teal-500/20 text-teal-700 dark:text-teal-300"
            : "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
        }`}>
          <div>
            <span className="font-bold">Demo Creds:</span>{" "}
            {targetRoleForAuth === "dmo" ? "DMO-PANVEL-01" : targetRoleForAuth === "phc_worker" ? "PHC-KAMOTHE-04" : "citizen@arogyanet.in"} / password123
          </div>
          <button
            type="button"
            onClick={() => {
              if (targetRoleForAuth === "dmo") {
                setEmail("dmo.panvel@arogyanet.gov.in");
                setBadgeId("DMO-PANVEL-01");
              } else if (targetRoleForAuth === "phc_worker") {
                setEmail("phc.kamothe@arogyanet.gov.in");
                setBadgeId("PHC-KAMOTHE-04");
              } else {
                setEmail("citizen@arogyanet.in");
              }
              setPassword("password123");
            }}
            className="text-[11px] font-bold underline"
          >
            Auto Fill
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isModeLogin && (
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={targetRoleForAuth === "dmo" ? "Dr. Rajesh Sharma" : targetRoleForAuth === "phc_worker" ? "Sujata Pawar" : "Ananya Patil"}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          {targetRoleForAuth !== "general" && (
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                {targetRoleForAuth === "dmo" ? "DMO Badge ID" : "PHC Worker ID"}
              </label>
              <input
                type="text"
                required
                value={badgeId}
                onChange={(e) => setBadgeId(e.target.value.toUpperCase())}
                placeholder={targetRoleForAuth === "dmo" ? "DMO-PANVEL-01" : "PHC-KAMOTHE-04"}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          )}

          {targetRoleForAuth === "phc_worker" && (
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Assigned Primary Health Center (PHC)
              </label>
              <select
                value={phcCenterId}
                onChange={(e) => setPhcCenterId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
              >
                {MOCK_HOSPITALS.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.status})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="worker@arogyanet.gov.in"
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            className={`w-full py-3 rounded-xl font-bold text-sm text-white transition-all shadow-md active:scale-98 ${
              targetRoleForAuth === "dmo"
                ? "bg-blue-600 hover:bg-blue-500 shadow-blue-600/20"
                : targetRoleForAuth === "phc_worker"
                ? "bg-teal-600 hover:bg-teal-500 shadow-teal-600/20"
                : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20"
            }`}
          >
            {isModeLogin ? "Sign In & Open Portal" : "Complete Registration"}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-center">
          <button
            onClick={() => setIsModeLogin(!isModeLogin)}
            className="text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            {isModeLogin
              ? "Need a new account? Register here"
              : "Already registered? Switch to Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}
