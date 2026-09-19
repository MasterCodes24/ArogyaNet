"use client";

import React from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

export default function RoleSelectorModal() {
  const { isRoleSelectorOpen, selectRole, openAuthModal, closeRoleSelector } = useAuth();

  if (!isRoleSelectorOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-lg p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-5xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Visual Graphic Header Banner */}
        <div className="relative h-44 w-full overflow-hidden flex items-center justify-center">
          <Image
            src="/images/hero_banner.jpg"
            alt="ArogyaNet Healthcare GIS Telemetry Network"
            fill
            className="object-cover object-center opacity-85"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent dark:from-zinc-900 dark:via-zinc-900/60 dark:to-transparent" />
          
          <div className="relative z-10 text-center px-6 space-y-1.5 mt-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-500/30 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              ArogyaNet Multi-Role Telemetry Portal
            </div>
            <h2 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 drop-shadow-sm">
              Select Your ArogyaNet Role
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 max-w-lg mx-auto font-medium">
              Choose your role to access real-time hospital bed availability, PHC inventory management, or district medical telemetry.
            </p>
          </div>
        </div>

        {/* 3-Persona Options Grid */}
        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 bg-white dark:bg-zinc-900">
          {/* 1. General Public User Card */}
          <div className="group relative rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 p-5 transition-all duration-300 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/10 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                  👤
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold uppercase">
                  Public Portal
                </span>
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  General User
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                  Search nearby geotagged hospitals, live ICU & oxygen beds, doctor availability, and recommended treatment centers.
                </p>
              </div>

              <ul className="text-xs text-zinc-600 dark:text-zinc-300 space-y-1.5 font-medium">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span> Geotagged GIS Map
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span> Real-Time ICU & O2 Beds
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span> Favourability Recommendation
                </li>
              </ul>
            </div>

            <div className="pt-6 space-y-2">
              <button
                onClick={() => {
                  selectRole("general");
                  closeRoleSelector();
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-all shadow-md shadow-emerald-600/25 active:scale-98"
              >
                Continue as General User
              </button>
              <button
                onClick={() => openAuthModal("general", "login")}
                className="w-full py-1 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                Sign In to Save Favorites →
              </button>
            </div>
          </div>

          {/* 2. Primary Health Centre (PHC) Worker Card */}
          <div className="group relative rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 p-5 transition-all duration-300 hover:border-teal-500 hover:shadow-xl hover:shadow-teal-500/10 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-600 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-teal-500/30 group-hover:scale-110 transition-transform">
                  🩺
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-[10px] font-extrabold uppercase">
                  PHC Staff
                </span>
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  PHC Health Worker
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                  Manage your PHC facility inventory, update daily bed counts, log patient visits, and dispatch urgent supply requisitions to the DMO.
                </p>
              </div>

              <ul className="text-xs text-zinc-600 dark:text-zinc-300 space-y-1.5 font-medium">
                <li className="flex items-center gap-2">
                  <span className="text-teal-500 font-bold">✓</span> Local Stock & Bed Updates
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-teal-500 font-bold">✓</span> Requisition Request to DMO
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-teal-500 font-bold">✓</span> Gemini Vision AI Logbook OCR
                </li>
              </ul>
            </div>

            <div className="pt-6 space-y-2">
              <button
                onClick={() => openAuthModal("phc_worker", "login")}
                className="w-full py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs transition-all shadow-md shadow-teal-600/25 active:scale-98"
              >
                PHC Worker Sign In
              </button>
              <button
                onClick={() => openAuthModal("phc_worker", "register")}
                className="w-full py-1 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                Register PHC Staff →
              </button>
            </div>
          </div>

          {/* 3. District Medical Officer (DMO) Card */}
          <div className="group relative rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 p-5 transition-all duration-300 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-blue-500/30 group-hover:scale-110 transition-transform">
                  🏥
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-extrabold uppercase">
                  DMO Officer
                </span>
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  District Officer (DMO)
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                  District cold chain storage telemetry, blackout outages, emergency medicine thresholds, and urgent consignment dispatches.
                </p>
              </div>

              <ul className="text-xs text-zinc-600 dark:text-zinc-300 space-y-1.5 font-medium">
                <li className="flex items-center gap-2">
                  <span className="text-blue-500 font-bold">✓</span> Cold Storage Telemetry
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500 font-bold">✓</span> Blackouts & Predictive Stock
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500 font-bold">✓</span> Emergency Shipping Dispatch
                </li>
              </ul>
            </div>

            <div className="pt-6 space-y-2">
              <button
                onClick={() => openAuthModal("dmo", "login")}
                className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs transition-all shadow-md shadow-blue-600/25 active:scale-98"
              >
                DMO Officer Sign In
              </button>
              <button
                onClick={() => openAuthModal("dmo", "register")}
                className="w-full py-1 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                Register New DMO →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
