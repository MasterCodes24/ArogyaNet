"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Hospital } from "@/data/hospitalsData";
import ArogyaMap from "@/components/ArogyaMap";

interface GeneralUserDashboardProps {
  hospitals: Hospital[];
}

export default function GeneralUserDashboard({ hospitals }: GeneralUserDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

  const allSpecialties = Array.from(
    new Set(hospitals.flatMap((h) => h.availableSpecialties))
  );

  const filteredHospitals = hospitals.filter((h) => {
    const matchesSearch =
      h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.criticalMedicines.some((m) => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSpecialty =
      selectedSpecialty === "All" || h.availableSpecialties.includes(selectedSpecialty);

    return matchesSearch && matchesSpecialty;
  });

  const rankedHospitals = [...filteredHospitals].sort(
    (a, b) => b.favourabilityScore - a.favourabilityScore
  );

  const topRecommended = rankedHospitals[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Graphical Hero Banner & Search Section */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-emerald-500/20 bg-zinc-950">
        <div className="relative h-72 md:h-80 w-full">
          <Image
            src="/images/hospital.jpg"
            alt="Public Healthcare Telemetry & Smart Recommender"
            fill
            className="object-cover object-center opacity-65"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />

          <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-extrabold border border-emerald-400/30 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Public Healthcare Telemetry & Smart Recommender
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">
                Find Open Beds, Doctors & Supplies
              </h2>
              <p className="text-xs md:text-sm text-emerald-100/90 font-medium leading-relaxed">
                Real-time geotagged hospital availability in Panvel & Raigad district. Check ICU beds, doctor duty counts, emergency treatments, and optimal health centers.
              </p>
            </div>

            {/* Search Bar & Specialty Filter */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2 relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by hospital name, medicine (e.g. ASV, Paracetamol), or location..."
                  className="w-full px-4 py-3.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 text-white placeholder-emerald-100/60 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 font-medium shadow-lg"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3.5 top-3.5 text-xs text-white/70 hover:text-white font-bold"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div>
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 font-medium shadow-lg"
                >
                  <option value="All" className="text-zinc-900 font-semibold">All Specialties</option>
                  {allSpecialties.map((spec) => (
                    <option key={spec} value={spec} className="text-zinc-900 font-semibold">
                      {spec}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Hospital Callout Card */}
      {topRecommended && (
        <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border-2 border-emerald-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden backdrop-blur-sm">
          <div className="space-y-3 z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500 text-white text-xs font-black shadow-md shadow-emerald-500/30">
              ⭐ Top Recommended Hospital to Visit
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-zinc-100">
              {topRecommended.name}
            </h3>
            <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-300 font-medium leading-relaxed">
              {topRecommended.favourabilityReason}
            </p>
            <div className="flex flex-wrap gap-2.5 pt-1 text-xs">
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-extrabold border border-emerald-500/30">
                🏥 {topRecommended.icuBedsAvailable} ICU Beds Open
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-blue-500/20 text-blue-800 dark:text-blue-300 font-extrabold border border-blue-500/30">
                🫁 {topRecommended.oxygenBedsAvailable} Oxygen Beds Open
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-800 dark:text-purple-300 font-extrabold border border-purple-500/30">
                👨‍⚕️ {topRecommended.onDutyDoctors} Doctors On Duty
              </span>
            </div>
          </div>

          <div className="text-right space-y-3 z-10 self-start md:self-auto bg-white/80 dark:bg-zinc-900/80 p-5 rounded-2xl border border-emerald-500/20 shadow-md">
            <div className="text-4xl md:text-5xl font-black text-emerald-600 dark:text-emerald-400">
              {topRecommended.favourabilityScore}<span className="text-sm text-zinc-400 font-bold">/100</span>
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 font-extrabold uppercase tracking-wider">Favourability Index</div>
            <button
              onClick={() => setSelectedHospital(topRecommended)}
              className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/25 transition-all active:scale-98"
            >
              Select & View Telemetry
            </button>
          </div>
        </div>
      )}

      {/* Geotagged Hospital GIS Map */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
            Geotagged Hospital GIS Map
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Interactive GIS map displaying surrounding medical facilities. Green = Optimal Availability, Yellow = Stock Depleting, Red = Grid Outage.
          </p>
        </div>

        <ArogyaMap
          hospitals={filteredHospitals}
          selectedHospitalId={selectedHospital?.id}
          onSelectHospital={(h) => setSelectedHospital(h)}
        />
      </div>

      {/* Ranked Hospital List with Availability Metrics */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
            District Hospitals & Bed Availability ({rankedHospitals.length})
          </h3>
          <span className="text-xs text-zinc-400 font-semibold">
            Sorted by Favourability Index
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rankedHospitals.map((hosp) => (
            <div
              key={hosp.id}
              className={`p-6 rounded-3xl border-2 transition-all duration-300 bg-white dark:bg-zinc-900 shadow-md flex flex-col justify-between space-y-4 ${
                selectedHospital?.id === hosp.id
                  ? "border-emerald-500 shadow-2xl shadow-emerald-500/10 ring-2 ring-emerald-500/20"
                  : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
              }`}
            >
              <div className="space-y-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span
                      className={`inline-block px-2.5 py-0.5 text-[10px] font-extrabold rounded-full border mb-1.5 ${
                        hosp.status === "Active Sync"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          : hosp.status === "Predictive Stock"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                      }`}
                    >
                      {hosp.status}
                    </span>
                    <h4 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
                      {hosp.name}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">
                      📍 {hosp.address}
                    </p>
                  </div>
                  <div className="text-right bg-zinc-50 dark:bg-zinc-800/80 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700">
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      {hosp.favourabilityScore}
                    </span>
                    <div className="text-[9px] text-zinc-400 font-extrabold uppercase">Score</div>
                  </div>
                </div>

                {/* Bed Grid */}
                <div className="grid grid-cols-3 gap-2.5 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 text-center text-xs shadow-inner">
                  <div>
                    <div className="text-[10px] text-zinc-400 font-extrabold uppercase">ICU Beds</div>
                    <div className="font-black text-emerald-600 dark:text-emerald-400 text-sm mt-0.5">
                      {hosp.icuBedsAvailable} / {hosp.icuBedsTotal}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-400 font-extrabold uppercase">Oxygen Beds</div>
                    <div className="font-black text-blue-600 dark:text-blue-400 text-sm mt-0.5">
                      {hosp.oxygenBedsAvailable} / {hosp.oxygenBedsTotal}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-400 font-extrabold uppercase">Doctors</div>
                    <div className="font-black text-purple-600 dark:text-purple-400 text-sm mt-0.5">
                      {hosp.onDutyDoctors} On Duty
                    </div>
                  </div>
                </div>

                {/* Specialties Badges */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Available Treatments:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {hosp.availableSpecialties.map((spec, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] font-semibold border border-zinc-200 dark:border-zinc-700"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Medicine Stock Status */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Critical Medicine Telemetry:</div>
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    {hosp.criticalMedicines.map((med, i) => (
                      <span
                        key={i}
                        className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${
                          med.isBelowLimit
                            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        }`}
                      >
                        {med.name}: {med.currentStock} {med.unit}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                <span className="text-zinc-500 font-bold">📞 {hosp.phone}</span>
                <button
                  onClick={() => setSelectedHospital(hosp)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-extrabold transition-all active:scale-98 shadow-sm"
                >
                  Inspect Hospital →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
