"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Hospital, ConsignmentRequest } from "@/data/hospitalsData";
import ArogyaMap from "@/components/ArogyaMap";
import LogbookScannerModal from "@/components/LogbookScannerModal";
import { useAuth } from "@/context/AuthContext";

interface PhcWorkerDashboardProps {
  hospitals: Hospital[];
  onUpdateHospitals: (updated: Hospital[]) => void;
  onRequestRequisitionToDmo: (req: Omit<ConsignmentRequest, "id" | "status" | "requestedAt">) => void;
}

export default function PhcWorkerDashboard({
  hospitals,
  onUpdateHospitals,
  onRequestRequisitionToDmo,
}: PhcWorkerDashboardProps) {
  const { user } = useAuth();

  // Selected PHC Facility (Default to Khandeshwar or user's assigned PHC)
  const defaultPhc = hospitals.find((h) => h.id === user?.phcCenterId) || hospitals[2]; // Khandeshwar Rural Health Unit
  const [selectedPhcId, setSelectedPhcId] = useState<string>(defaultPhc.id);
  const currentPhc = hospitals.find((h) => h.id === selectedPhcId) || defaultPhc;

  const [isLogbookModalOpen, setIsLogbookModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Requisition Form State
  const [reqMedicineName, setReqMedicineName] = useState("Anti-Snake Venom (ASV)");
  const [reqQuantity, setReqQuantity] = useState(30);
  const [reqUrgency, setReqUrgency] = useState<"Immediate Critical" | "High Priority" | "Routine">("Immediate Critical");

  // Patient Intake Form
  const [patientLogs, setPatientLogs] = useState([
    { id: 1, name: "Ramesh Pawar", category: "Snakebite Emergency", status: "ASV Administered", time: "10:15 AM" },
    { id: 2, name: "Priya Patil", category: "Immunization / Vaccine", status: "Polio + DPT Dose 2", time: "11:30 AM" },
  ]);
  const [newPatientName, setNewPatientName] = useState("");
  const [newPatientCategory, setNewPatientCategory] = useState("General OPD");

  // Bed Count Adjusters
  const updateBedCount = (type: "icu" | "oxygen" | "general", delta: number) => {
    const updated = hospitals.map((h) => {
      if (h.id === currentPhc.id) {
        if (type === "icu") {
          const val = Math.max(0, Math.min(h.icuBedsTotal, h.icuBedsAvailable + delta));
          return { ...h, icuBedsAvailable: val };
        }
        if (type === "oxygen") {
          const val = Math.max(0, Math.min(h.oxygenBedsTotal, h.oxygenBedsAvailable + delta));
          return { ...h, oxygenBedsAvailable: val };
        }
        if (type === "general") {
          const val = Math.max(0, Math.min(h.generalBedsTotal, h.generalBedsAvailable + delta));
          return { ...h, generalBedsAvailable: val };
        }
      }
      return h;
    });
    onUpdateHospitals(updated);
  };

  // Medicine Stock Update
  const updateMedicineStock = (medName: string, newStock: number) => {
    const updated = hospitals.map((h) => {
      if (h.id === currentPhc.id) {
        const updatedMeds = h.criticalMedicines.map((m) => {
          if (m.name === medName) {
            return {
              ...m,
              currentStock: Math.max(0, newStock),
              isBelowLimit: newStock < m.emergencyLimit,
            };
          }
          return m;
        });
        return { ...h, criticalMedicines: updatedMeds };
      }
      return h;
    });
    onUpdateHospitals(updated);
    setSuccessMessage(`Updated stock for ${medName} to ${newStock}.`);
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  // Submit Requisition to DMO
  const handleSubmitRequisition = (e: React.FormEvent) => {
    e.preventDefault();
    onRequestRequisitionToDmo({
      hospitalId: currentPhc.id,
      hospitalName: currentPhc.name,
      medicines: [{ name: reqMedicineName, quantity: reqQuantity, unit: "units" }],
      urgency: reqUrgency,
    });
    setSuccessMessage(`Emergency requisition for ${reqQuantity}x ${reqMedicineName} submitted to DMO!`);
    setTimeout(() => setSuccessMessage(""), 5000);
  };

  // Add Patient Log
  const handleAddPatientLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName) return;
    setPatientLogs((prev) => [
      {
        id: Date.now(),
        name: newPatientName,
        category: newPatientCategory,
        status: "Registered at PHC",
        time: "Just now",
      },
      ...prev,
    ]);
    setNewPatientName("");
  };

  const handleAddParsedMedicines = (items: { medicine: string; quantity: number | string; batchNumber: string }[]) => {
    const updated = hospitals.map((h) => {
      if (h.id === currentPhc.id) {
        const newMeds = [...h.criticalMedicines];
        items.forEach((item) => {
          const qty = typeof item.quantity === "number" ? item.quantity : parseInt(item.quantity) || 100;
          newMeds.push({
            name: item.medicine,
            category: "Scanned Register Log",
            currentStock: qty,
            emergencyLimit: 15,
            unit: "units",
            isBelowLimit: false,
          });
        });
        return { ...h, criticalMedicines: newMeds };
      }
      return h;
    });

    onUpdateHospitals(updated);
    setSuccessMessage(`Imported ${items.length} items from paper logbook into ${currentPhc.name} inventory!`);
    setTimeout(() => setSuccessMessage(""), 5000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Graphical Header Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-teal-500/20 bg-zinc-950">
        <div className="relative h-64 md:h-72 w-full">
          <Image
            src="/images/phc_worker.jpg"
            alt="PHC Primary Health Worker Dashboard"
            fill
            className="object-cover object-center opacity-75"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />

          <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-400/30 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                Primary Health Centre (PHC) Worker Portal
              </div>

              {/* PHC Facility Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-300 font-bold hidden sm:inline">Active PHC Unit:</span>
                <select
                  value={selectedPhcId}
                  onChange={(e) => setSelectedPhcId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold focus:outline-none"
                >
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id} className="text-zinc-900">
                      {h.name} ({h.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-2 max-w-xl">
                <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight drop-shadow-md">
                  Welcome, {user?.name || "Sujata Pawar (PHC Worker)"}
                </h2>
                <p className="text-xs md:text-sm text-teal-100/90 font-medium leading-relaxed">
                  Managing <span className="font-bold text-white underline">{currentPhc.name}</span> — Update live bed availability, manage local inventory, log patient intake, and send urgent supply requisitions to the DMO.
                </p>
              </div>

              <button
                onClick={() => setIsLogbookModalOpen(true)}
                className="py-3 px-5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold transition-all shadow-xl shadow-purple-600/30 flex items-center gap-2 border border-purple-400/30 active:scale-98 self-start md:self-auto"
              >
                <span>📷 Scan Register Sheet (Gemini AI)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-600 dark:text-teal-400 text-sm font-semibold flex items-center gap-2 animate-in slide-in-from-top duration-300 shadow-md">
          <span className="text-lg">✓</span> {successMessage}
        </div>
      )}

      {/* Bed & Ward Telemetry Adjuster Controls */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg space-y-6">
        <div>
          <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            🛏️ Live Bed & Ward Telemetry Adjuster — {currentPhc.name}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Update open bed counts instantly. Changes sync in real-time across the General User Bed Finder & DMO Portal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* ICU Beds Adjuster */}
          <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-4 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">ICU Beds</span>
              <span className="text-xs font-bold text-zinc-400">Total: {currentPhc.icuBedsTotal}</span>
            </div>
            <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400 text-center">
              {currentPhc.icuBedsAvailable} <span className="text-xs text-zinc-400 font-bold">Open</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => updateBedCount("icu", -1)}
                className="flex-1 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 text-zinc-800 dark:text-zinc-100 font-black text-lg transition-colors"
              >
                -
              </button>
              <button
                onClick={() => updateBedCount("icu", 1)}
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg shadow-md shadow-emerald-600/20 transition-all"
              >
                +
              </button>
            </div>
          </div>

          {/* Oxygen Beds Adjuster */}
          <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-4 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Oxygen Beds</span>
              <span className="text-xs font-bold text-zinc-400">Total: {currentPhc.oxygenBedsTotal}</span>
            </div>
            <div className="text-4xl font-black text-blue-600 dark:text-blue-400 text-center">
              {currentPhc.oxygenBedsAvailable} <span className="text-xs text-zinc-400 font-bold">Open</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => updateBedCount("oxygen", -1)}
                className="flex-1 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 text-zinc-800 dark:text-zinc-100 font-black text-lg transition-colors"
              >
                -
              </button>
              <button
                onClick={() => updateBedCount("oxygen", 1)}
                className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-lg shadow-md shadow-blue-600/20 transition-all"
              >
                +
              </button>
            </div>
          </div>

          {/* General Beds Adjuster */}
          <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-4 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-xs font-extrabold text-purple-600 dark:text-purple-400 uppercase tracking-wider">General Ward Beds</span>
              <span className="text-xs font-bold text-zinc-400">Total: {currentPhc.generalBedsTotal}</span>
            </div>
            <div className="text-4xl font-black text-purple-600 dark:text-purple-400 text-center">
              {currentPhc.generalBedsAvailable} <span className="text-xs text-zinc-400 font-bold">Open</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => updateBedCount("general", -1)}
                className="flex-1 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 text-zinc-800 dark:text-zinc-100 font-black text-lg transition-colors"
              >
                -
              </button>
              <button
                onClick={() => updateBedCount("general", 1)}
                className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-lg shadow-md shadow-purple-600/20 transition-all"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Section: Stock Inventory & DMO Requisition Request Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Local Medicine Inventory Editor */}
        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100">
                💊 Local PHC Medicine Inventory
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Current stock levels for {currentPhc.name}.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {currentPhc.criticalMedicines.map((med, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-colors ${
                  med.isBelowLimit
                    ? "bg-rose-500/10 border-rose-500/30"
                    : "bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700"
                }`}
              >
                <div className="space-y-0.5">
                  <div className="font-extrabold text-zinc-900 dark:text-zinc-100 text-sm flex items-center gap-2">
                    {med.name}
                    {med.isBelowLimit && (
                      <span className="px-2 py-0.5 rounded-md bg-rose-500 text-white text-[9px] font-black uppercase">
                        Below Limit
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-zinc-400">Category: {med.category} | Reserve Limit: {med.emergencyLimit} {med.unit}</div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={med.currentStock}
                    onChange={(e) => updateMedicineStock(med.name, parseInt(e.target.value) || 0)}
                    className="w-20 px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <span className="text-xs font-semibold text-zinc-500">{med.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Submit Emergency Requisition Request to DMO */}
        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg space-y-5">
          <div>
            <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              🚨 Request Emergency Supply from DMO
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Submit an urgent stock consignment request directly to the District Medical Officer.
            </p>
          </div>

          <form onSubmit={handleSubmitRequisition} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Requested Medicine / Supply
              </label>
              <input
                type="text"
                required
                value={reqMedicineName}
                onChange={(e) => setReqMedicineName(e.target.value)}
                placeholder="e.g. Anti-Snake Venom (ASV), Medical Oxygen"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Quantity Required
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={reqQuantity}
                  onChange={(e) => setReqQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Urgency Level
                </label>
                <select
                  value={reqUrgency}
                  onChange={(e) => setReqUrgency(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Immediate Critical">Immediate Critical (Outage)</option>
                  <option value="High Priority">High Priority (Low Buffer)</option>
                  <option value="Routine">Routine Restock</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-sm transition-all shadow-lg shadow-teal-600/25 active:scale-98 flex items-center justify-center gap-2"
            >
              <span>Submit Requisition Request to DMO 🚀</span>
            </button>
          </form>

          {/* Daily Patient & Emergency Intake Log */}
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              📋 Daily Patient & Immunization Register
            </h4>

            <form onSubmit={handleAddPatientLog} className="flex gap-2">
              <input
                type="text"
                placeholder="Patient Name..."
                value={newPatientName}
                onChange={(e) => setNewPatientName(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs focus:outline-none"
              />
              <select
                value={newPatientCategory}
                onChange={(e) => setNewPatientCategory(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-semibold"
              >
                <option value="General OPD">General OPD</option>
                <option value="Snakebite Emergency">Snakebite</option>
                <option value="Immunization / Vaccine">Immunization</option>
              </select>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-bold text-xs"
              >
                + Log
              </button>
            </form>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800 max-h-36 overflow-y-auto rounded-xl border border-zinc-100 dark:border-zinc-800 text-xs">
              {patientLogs.map((log) => (
                <div key={log.id} className="p-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">{log.name}</span>
                    <span className="text-zinc-400 text-[10px] ml-2">({log.category})</span>
                  </div>
                  <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold">{log.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Geotagged District Map View */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
            District Health Facility GIS Network Map
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            GIS map showing your PHC center and surrounding district hospitals.
          </p>
        </div>

        <ArogyaMap hospitals={hospitals} selectedHospitalId={currentPhc.id} />
      </div>

      {/* Logbook Scanner Modal */}
      <LogbookScannerModal
        isOpen={isLogbookModalOpen}
        onClose={() => setIsLogbookModalOpen(false)}
        onAddParsedMedicines={handleAddParsedMedicines}
      />
    </div>
  );
}
