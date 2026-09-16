"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authMode, targetRoleForAuth, login } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [badgeId, setBadgeId] = useState("");
  const [district, setDistrict] = useState("Raigad");
  const [isModeLogin, setIsModeLogin] = useState(authMode === "login");
  const [error, setError] = useState("");

  // Sync mode state when prop changes
  React.useEffect(() => {
    setIsModeLogin(authMode === "login");
    if (targetRoleForAuth === "dmo") {
      setEmail("dmo.panvel@arogyanet.gov.in");
      setBadgeId("DMO-PANVEL-01");
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

    if (targetRoleForAuth === "dmo" && isModeLogin && badgeId && !badgeId.startsWith("DMO-")) {
      setError("Valid DMO Badge ID required (e.g. DMO-PANVEL-01)");
      return;
    }

    login({
      id: badgeId || `user-${Date.now()}`,
      name: name || (targetRoleForAuth === "dmo" ? "Dr. Rajesh Sharma (DMO)" : "Ananya Patil"),
      role: targetRoleForAuth,
      email,
      badgeId: targetRoleForAuth === "dmo" ? badgeId || "DMO-PANVEL-01" : undefined,
      district: targetRoleForAuth === "dmo" ? district : undefined,
    });

    closeAuthModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-lg font-bold w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center transition-colors"
        >
          ✕
        </button>

        {/* Modal Title */}
        <div className="mb-6 space-y-1 text-center">
          <span
            className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${
              targetRoleForAuth === "dmo"
                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
            }`}
          >
            {targetRoleForAuth === "dmo" ? "District Medical Officer Portal" : "General User Access"}
          </span>
          <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
            {isModeLogin ? "Official Sign In" : "Create New Account"}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {targetRoleForAuth === "dmo"
              ? "Authenticate with your assigned District Officer Badge ID."
              : "Access real-time hospital bed & medicine telemetry."}
          </p>
        </div>

        {/* Quick Demo Fill Helper */}
        {targetRoleForAuth === "dmo" && (
          <div className="mb-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-300 flex items-center justify-between">
            <div>
              <span className="font-bold">Demo DMO Creds:</span> DMO-PANVEL-01 / password123
            </div>
            <button
              type="button"
              onClick={() => {
                setEmail("dmo.panvel@arogyanet.gov.in");
                setBadgeId("DMO-PANVEL-01");
                setPassword("password123");
              }}
              className="text-[11px] font-bold underline hover:text-blue-800 dark:hover:text-blue-200"
            >
              Fill Demo
            </button>
          </div>
        )}

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
                placeholder={targetRoleForAuth === "dmo" ? "Dr. Rajesh Sharma" : "Ananya Patil"}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          {targetRoleForAuth === "dmo" && (
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                DMO Official Badge ID
              </label>
              <input
                type="text"
                required
                value={badgeId}
                onChange={(e) => setBadgeId(e.target.value.toUpperCase())}
                placeholder="DMO-PANVEL-01"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {targetRoleForAuth === "dmo" && !isModeLogin && (
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Assigned District
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Raigad">Raigad District (Panvel, Kharghar, Alibag)</option>
                <option value="Thane">Thane District</option>
                <option value="Palghar">Palghar District</option>
                <option value="Pune">Pune District</option>
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
              placeholder="officer@arogyanet.gov.in"
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
                : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20"
            }`}
          >
            {isModeLogin ? "Sign In & Open Portal" : "Complete Officer Registration"}
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
