"use client";

import React from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

export default function RoleSelectorModal() {
  const { isRoleSelectorOpen, selectRole, openAuthModal, closeRoleSelector } = useAuth();

  if (!isRoleSelectorOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-lg p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Visual Graphic Header Banner */}
        <div className="relative h-44 w-full overflow-hidden flex items-center justify-center">
          <Image
            src="/images/hero_banner.jpg"
            alt="ArogyaNet Healthcare GIS Telemetry Network"
            fill
            className="object-cover object-center opacity-85 scale-105 transition-transform duration-700 hover:scale-100"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent dark:from-zinc-900 dark:via-zinc-900/60 dark:to-transparent" />
          
          <div className="relative z-10 text-center px-6 space-y-1.5 mt-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-500/30 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              ArogyaNet Health GIS Telemetry
            </div>
            <h2 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 drop-shadow-sm">
              Welcome to ArogyaNet
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 max-w-md mx-auto font-medium">
              Select your access portal to view live healthcare inventory, hospital beds, and emergency storage telemetry.
            </p>
          </div>
        </div>

        {/* Persona Options Grid */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-zinc-900">
          {/* General User Card */}
          <div className="group relative rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 p-6 transition-all duration-300 hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-500/10 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                  👤
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                  Public Portal
                </span>
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  General User
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                  Find nearby geotagged hospitals, check real-time bed & ICU availability, doctor duty schedules, and recommended treatment centers.
                </p>
              </div>

              <ul className="text-xs text-zinc-600 dark:text-zinc-300 space-y-1.5 font-medium pt-1">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span> Geotagged Interactive Map
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span> ICU & Oxygen Bed Availability
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span> Top Recommended Hospitals
                </li>
              </ul>
            </div>

            <div className="pt-6 space-y-2">
              <button
                onClick={() => {
                  selectRole("general");
                  closeRoleSelector();
                }}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm transition-all shadow-lg shadow-emerald-600/25 active:scale-98"
              >
                Continue as General User
              </button>
              <button
                onClick={() => openAuthModal("general", "login")}
                className="w-full py-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                Sign In to Save Favorites →
              </button>
            </div>
          </div>

          {/* DMO (District Medical Officer) Card */}
          <div className="group relative rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 p-6 transition-all duration-300 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/10 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                  🏥
                </div>
                <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                  Officer Portal
                </span>
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  District Medical Officer (DMO)
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                  Dedicated portal for district storage telemetry, cold chain monitoring, blackout alerts, emergency limits, and urgent dispatches.
                </p>
              </div>

              <ul className="text-xs text-zinc-600 dark:text-zinc-300 space-y-1.5 font-medium pt-1">
                <li className="flex items-center gap-2">
                  <span className="text-blue-500 font-bold">✓</span> Cold Storage Telemetry
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500 font-bold">✓</span> Predictive Stock & Blackouts
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500 font-bold">✓</span> Emergency Consignment Shipping
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500 font-bold">✓</span> Gemini Vision AI Logbook OCR
                </li>
              </ul>
            </div>

            <div className="pt-6 space-y-2">
              <button
                onClick={() => openAuthModal("dmo", "login")}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm transition-all shadow-lg shadow-blue-600/25 active:scale-98"
              >
                DMO Official Sign In
              </button>
              <button
                onClick={() => openAuthModal("dmo", "register")}
                className="w-full py-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                Register New DMO Officer →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
