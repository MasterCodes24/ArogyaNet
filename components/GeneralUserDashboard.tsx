"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import { Hospital, LOCATION_PRESETS, MAHARASHTRA_CITIES } from "@/data/hospitalsData";
import ArogyaMap from "@/components/ArogyaMap";

interface GeneralUserDashboardProps {
  hospitals: Hospital[];
}

// Distance calculation helper (Haversine formula in km)
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export default function GeneralUserDashboard({ hospitals }: GeneralUserDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);

  // Maharashtra Location Switcher State
  const [activeLocation, setActiveLocation] = useState(LOCATION_PRESETS[0]);
  const [customAddressInput, setCustomAddressInput] = useState("");

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close autocomplete on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsAutocompleteOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Extract all unique specialties & treatments
  const allSpecialties = useMemo(() => {
    return Array.from(new Set(hospitals.flatMap((h) => h.availableSpecialties)));
  }, [hospitals]);

  // Extract all unique medicine names & categories
  const allMedicines = useMemo(() => {
    const meds = new Set<string>();
    hospitals.forEach((h) => {
      h.criticalMedicines.forEach((m) => {
        meds.add(m.name);
        if (m.category) meds.add(m.category);
      });
    });
    return Array.from(meds);
  }, [hospitals]);

  // Extract all Maharashtra cities & locations
  const allLocations = useMemo(() => {
    const locs = new Set<string>();
    LOCATION_PRESETS.forEach((lp) => locs.add(lp.name));
    Object.values(MAHARASHTRA_CITIES).forEach((c) => locs.add(c.name));
    hospitals.forEach((h) => {
      locs.add(h.district);
    });
    return Array.from(locs);
  }, [hospitals]);

  // Generate Autocomplete Suggestions based on searchTerm
  const autocompleteSuggestions = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();

    if (!query) {
      // Default popular suggestions when search is empty but focused
      return {
        medicines: ["Anti-Snake Venom (ASV)", "Human Insulin 100IU", "Medical Oxygen Cylinders", "Rabies Vaccine (PVRV)", "Paracetamol 500mg"],
        treatments: ["Emergency & Trauma", "ICU Intensive Care", "Dialysis Unit", "Pediatrics", "Cardiology", "Rabies Vaccination"],
        locations: ["Panvel & Raigad Belt", "Mumbai & MMR Metro", "Pune Metro Region", "Thane & Kalyan", "Nashik & North Maharashtra", "Nagpur & Vidarbha"],
      };
    }

    const medicines = allMedicines.filter((m) => m.toLowerCase().includes(query)).slice(0, 5);
    const treatments = allSpecialties.filter((s) => s.toLowerCase().includes(query)).slice(0, 5);
    const locations = allLocations.filter((l) => l.toLowerCase().includes(query)).slice(0, 4);

    return { medicines, treatments, locations };
  }, [searchTerm, allMedicines, allSpecialties, allLocations]);

  // Filter & calculate distances to target location
  const processedHospitals = useMemo(() => {
    const [targetLat, targetLng] = activeLocation.coordinates;

    return hospitals
      .map((h) => {
        const distance = calculateDistanceKm(targetLat, targetLng, h.coordinates[0], h.coordinates[1]);
        return { ...h, distanceKm: distance };
      })
      .filter((h) => {
        const query = searchTerm.toLowerCase().trim();

        const matchesSearch =
          !query ||
          h.name.toLowerCase().includes(query) ||
          h.address.toLowerCase().includes(query) ||
          h.type.toLowerCase().includes(query) ||
          h.district.toLowerCase().includes(query) ||
          h.criticalMedicines.some(
            (m) => m.name.toLowerCase().includes(query) || m.category.toLowerCase().includes(query)
          ) ||
          h.availableSpecialties.some((s) => s.toLowerCase().includes(query));

        const matchesSpecialty =
          selectedSpecialty === "All" || h.availableSpecialties.includes(selectedSpecialty);

        return matchesSearch && matchesSpecialty;
      })
      .sort((a, b) => {
        // Proximity-based sort to active location in Maharashtra
        if (Math.abs(a.distanceKm - b.distanceKm) > 25) {
          return a.distanceKm - b.distanceKm;
        }
        return b.favourabilityScore - a.favourabilityScore;
      });
  }, [hospitals, searchTerm, selectedSpecialty, activeLocation]);

  const topRecommended = processedHospitals[0];

  const handleSelectSuggestion = (value: string) => {
    setSearchTerm(value);
    setIsAutocompleteOpen(false);

    // If suggestion is a location preset, switch location as well
    const matchedPreset = LOCATION_PRESETS.find((p) => p.name.toLowerCase().includes(value.toLowerCase()));
    if (matchedPreset) {
      setActiveLocation(matchedPreset);
    }
  };

  const handleSelectPresetLocation = (preset: typeof LOCATION_PRESETS[0]) => {
    setActiveLocation(preset);
    setCustomAddressInput("");
  };

  const handleCustomAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAddressInput.trim()) return;
    const query = customAddressInput.toLowerCase().trim();

    // Check against Maharashtra cities dictionary
    const matchedCityKey = Object.keys(MAHARASHTRA_CITIES).find((k) => query.includes(k) || k.includes(query));

    if (matchedCityKey && MAHARASHTRA_CITIES[matchedCityKey]) {
      const city = MAHARASHTRA_CITIES[matchedCityKey];
      setActiveLocation({
        id: `mha-${matchedCityKey}`,
        name: `${city.name} (${city.district} District)`,
        district: city.district,
        coordinates: city.coordinates,
      });
      return;
    }

    // Check if matched preset
    const matchedPreset = LOCATION_PRESETS.find(
      (p) => p.name.toLowerCase().includes(query) || p.district.toLowerCase().includes(query)
    );

    if (matchedPreset) {
      setActiveLocation(matchedPreset);
    } else {
      // Find closest hospital matching location query
      const matchedHosp = hospitals.find((h) => h.address.toLowerCase().includes(query) || h.name.toLowerCase().includes(query));
      if (matchedHosp) {
        setActiveLocation({
          id: `custom-${Date.now()}`,
          name: customAddressInput,
          district: matchedHosp.district,
          coordinates: matchedHosp.coordinates,
        });
      } else {
        setSearchTerm(customAddressInput);
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Banner with Search Bar */}
      <div className="relative rounded-3xl shadow-2xl border border-emerald-500/20 bg-zinc-950 p-6 md:p-8 flex flex-col justify-between min-h-[340px] md:min-h-[380px]">
        {/* Isolated Background Image & Gradients with overflow-hidden */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
          <Image
            src="/images/hospital.jpg"
            alt="Public Healthcare Telemetry & Smart Recommender"
            fill
            className="object-cover object-center opacity-65"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
        </div>

        {/* Hero Header Text */}
        <div className="space-y-2 max-w-2xl z-10 relative">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-extrabold border border-emerald-400/30 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Maharashtra Healthcare Telemetry & Smart Medicine Finder
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">
            Find Medicines, ICU Beds & Treatments
          </h2>
          <p className="text-xs md:text-sm text-emerald-100/90 font-medium leading-relaxed">
            Real-time hospital availability across Maharashtra (Mumbai, Navi Mumbai, Raigad, Thane, Pune, Nashik, Sambhajinagar & Nagpur). Search essential drugs & emergency beds.
          </p>
        </div>

        {/* Search Bar Container with Fully Unclipped Floating Dropdown */}
        <div className="mt-6 z-40 relative" ref={searchContainerRef}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 relative">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onFocus={() => setIsAutocompleteOpen(true)}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsAutocompleteOpen(true);
                  }}
                  placeholder="Type medicine (ASV, Insulin, Paracetamol) or treatment (ICU, Dialysis)..."
                  className="w-full px-4 py-3.5 pl-10 rounded-2xl bg-white/20 backdrop-blur-xl border-2 border-emerald-400/50 text-white placeholder-emerald-100/70 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 font-semibold shadow-2xl"
                />
                <span className="absolute left-3.5 top-3.5 text-emerald-300 text-base">🔍</span>
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setIsAutocompleteOpen(false);
                    }}
                    className="absolute right-3.5 top-3.5 text-xs bg-white/20 hover:bg-white/30 text-white px-2 py-0.5 rounded-full font-bold transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Fully Floating Categorized Autocomplete Dropdown Menu */}
              {isAutocompleteOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl bg-zinc-950 border-2 border-emerald-500 shadow-2xl z-[100] p-3 space-y-3 max-h-[380px] overflow-y-auto divide-y divide-zinc-800 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Medicines Category */}
                    {autocompleteSuggestions.medicines.length > 0 && (
                      <div className="pt-1">
                        <div className="text-[11px] font-black text-emerald-400 uppercase tracking-wider px-2 py-1 flex items-center gap-1.5">
                          <span>💊</span> Medicines & Pharmaceutical Supplies
                        </div>
                        <div className="grid grid-cols-1 gap-1">
                          {autocompleteSuggestions.medicines.map((item, idx) => (
                            <div
                              key={idx}
                              onClick={() => handleSelectSuggestion(item)}
                              className="px-3 py-2 rounded-xl hover:bg-emerald-500/20 text-white text-xs font-semibold cursor-pointer transition-colors flex items-center justify-between group"
                            >
                              <span className="group-hover:text-emerald-300">{item}</span>
                              <span className="text-[10px] text-emerald-400/70 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                Medicine
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Treatments & Specialties Category */}
                    {autocompleteSuggestions.treatments.length > 0 && (
                      <div className="pt-2">
                        <div className="text-[11px] font-black text-blue-400 uppercase tracking-wider px-2 py-1 flex items-center gap-1.5">
                          <span>🩺</span> Medical Treatments & Emergency Care
                        </div>
                        <div className="grid grid-cols-1 gap-1">
                          {autocompleteSuggestions.treatments.map((item, idx) => (
                            <div
                              key={idx}
                              onClick={() => handleSelectSuggestion(item)}
                              className="px-3 py-2 rounded-xl hover:bg-blue-500/20 text-white text-xs font-semibold cursor-pointer transition-colors flex items-center justify-between group"
                            >
                              <span className="group-hover:text-blue-300">{item}</span>
                              <span className="text-[10px] text-blue-400/70 font-mono bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                                Treatment
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Locations & Towns Category */}
                    {autocompleteSuggestions.locations.length > 0 && (
                      <div className="pt-2">
                        <div className="text-[11px] font-black text-purple-400 uppercase tracking-wider px-2 py-1 flex items-center gap-1.5">
                          <span>📍</span> Maharashtra Locations & Regions
                        </div>
                        <div className="grid grid-cols-1 gap-1">
                          {autocompleteSuggestions.locations.map((item, idx) => (
                            <div
                              key={idx}
                              onClick={() => handleSelectSuggestion(item)}
                              className="px-3 py-2 rounded-xl hover:bg-purple-500/20 text-white text-xs font-semibold cursor-pointer transition-colors flex items-center justify-between group"
                            >
                              <span className="group-hover:text-purple-300">{item}</span>
                              <span className="text-[10px] text-purple-400/70 font-mono bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                                Location
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Specialty Filter Dropdown */}
              <div>
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl bg-white/20 backdrop-blur-xl border-2 border-emerald-400/40 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 font-semibold shadow-2xl"
                >
                  <option value="All" className="text-zinc-900 font-semibold">All Medical Specialties</option>
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

      {/* Maharashtra Location Switcher: Find Hospitals Anywhere in Maharashtra */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-extrabold text-xs border border-purple-500/20 mb-1.5">
              <span>📍 Find Hospitals for Relatives Anywhere in Maharashtra State</span>
            </div>
            <h3 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
              Active Region: <span className="text-purple-600 dark:text-purple-400 font-black">{activeLocation.name}</span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Search any city or district across Maharashtra to find emergency hospitals, available beds, and medicine stock for relatives.
            </p>
          </div>

          {/* Custom Address / City Search Form for Maharashtra */}
          <form onSubmit={handleCustomAddressSubmit} className="flex gap-2 w-full md:w-auto">
            <input
              type="text"
              value={customAddressInput}
              onChange={(e) => setCustomAddressInput(e.target.value)}
              placeholder="Type any Maharashtra city (e.g. Nagpur, Nashik, Pune, Sambhajinagar, Alibag)..."
              className="px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 text-zinc-900 dark:text-zinc-100 w-full md:w-72 shadow-inner"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs transition-colors shadow-md shadow-purple-600/20 shrink-0"
            >
              Locate City
            </button>
          </form>
        </div>

        {/* Maharashtra Regional Divisions Preset Chips */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <span className="text-xs font-bold text-zinc-400 self-center mr-1">Maharashtra Hubs:</span>
          {LOCATION_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectPresetLocation(preset)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all shadow-sm flex items-center gap-1.5 border ${
                activeLocation.id === preset.id
                  ? "bg-purple-600 text-white border-purple-500 shadow-purple-600/30 scale-105"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              <span>📍 {preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recommended Hospital Callout Card */}
      {topRecommended && (
        <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border-2 border-emerald-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden backdrop-blur-sm">
          <div className="space-y-3 z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500 text-white text-xs font-black shadow-md shadow-emerald-500/30">
              ⭐ Top Recommended Center in {activeLocation.name}
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-zinc-100">
              {topRecommended.name}
            </h3>
            <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-300 font-medium leading-relaxed">
              {topRecommended.favourabilityReason}
            </p>
            <div className="flex flex-wrap gap-2.5 pt-1 text-xs">
              <span className="px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-800 dark:text-purple-300 font-extrabold border border-purple-500/30">
                📍 {topRecommended.distanceKm} km from target location
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-extrabold border border-emerald-500/30">
                🏥 {topRecommended.icuBedsAvailable} ICU Beds Open
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-blue-500/20 text-blue-800 dark:text-blue-300 font-extrabold border border-blue-500/30">
                🫁 {topRecommended.oxygenBedsAvailable} Oxygen Beds Open
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-teal-500/20 text-teal-800 dark:text-teal-300 font-extrabold border border-teal-500/30">
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
              Inspect Telemetry
            </button>
          </div>
        </div>
      )}

      {/* Geotagged Interactive Map centered on Active Maharashtra Region */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span>Geotagged Hospital GIS Map</span>
            <span className="text-xs font-bold text-purple-500 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
              Centered on {activeLocation.name}
            </span>
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Interactive GIS map displaying surrounding medical facilities across Maharashtra state. Green = Optimal Availability, Yellow = Stock Depleting, Red = Grid Outage.
          </p>
        </div>

        <ArogyaMap
          hospitals={processedHospitals}
          selectedHospitalId={selectedHospital?.id}
          onSelectHospital={(h) => setSelectedHospital(h)}
          mapCenter={activeLocation.coordinates}
        />
      </div>

      {/* Ranked Hospital List with Distance & Telemetry */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
            Hospitals around {activeLocation.name} ({processedHospitals.length} Found)
          </h3>
          <span className="text-xs text-zinc-400 font-semibold">
            Ranked by Proximity & Favourability
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {processedHospitals.map((hosp) => {
            const isSelected = selectedHospital?.id === hosp.id;

            return (
              <div
                key={hosp.id}
                className={`p-6 rounded-3xl border-2 transition-all duration-300 bg-white dark:bg-zinc-900 shadow-md flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? "border-emerald-500 shadow-2xl shadow-emerald-500/10 ring-2 ring-emerald-500/20"
                    : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`inline-block px-2.5 py-0.5 text-[10px] font-extrabold rounded-full border ${
                            hosp.status === "Active Sync"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              : hosp.status === "Predictive Stock"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                              : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                          }`}
                        >
                          {hosp.status}
                        </span>
                        <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                          📍 {hosp.distanceKm} km away
                        </span>
                      </div>
                      <h4 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
                        {hosp.name}
                      </h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">
                        📍 {hosp.address}
                      </p>
                    </div>
                    <div className="text-right bg-zinc-50 dark:bg-zinc-800/80 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 shrink-0">
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

                  {/* Treatments & Specialties */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Available Treatments:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {hosp.availableSpecialties.map((spec, i) => {
                        const isMatched = searchTerm && spec.toLowerCase().includes(searchTerm.toLowerCase());

                        return (
                          <span
                            key={i}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${
                              isMatched
                                ? "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/40 ring-1 ring-blue-400 animate-pulse"
                                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700"
                            }`}
                          >
                            {spec}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Critical Medicine Telemetry */}
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Critical Medicine Stock Telemetry:</div>
                    <div className="flex flex-wrap gap-1.5 text-[11px]">
                      {hosp.criticalMedicines.map((med, i) => {
                        const isMatched = searchTerm && med.name.toLowerCase().includes(searchTerm.toLowerCase());

                        return (
                          <span
                            key={i}
                            className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${
                              isMatched
                                ? "bg-emerald-500/30 text-emerald-800 dark:text-emerald-200 border-emerald-500 ring-2 ring-emerald-400"
                                : med.isBelowLimit
                                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            }`}
                          >
                            {med.name}: {med.currentStock} {med.unit}
                          </span>
                        );
                      })}
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
            );
          })}
        </div>
      </div>
    </div>
  );
}
