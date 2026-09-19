"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Hospital, ConsignmentRequest, INITIAL_CONSIGNMENTS } from "@/data/hospitalsData";
import ArogyaMap from "@/components/ArogyaMap";
import LogbookScannerModal from "@/components/LogbookScannerModal";
import { useAuth } from "@/context/AuthContext";
import RequisitionModal from './RequisitionModal';

interface DmoDashboardProps {
  hospitals: Hospital[];
  onUpdateHospitals: (updated: Hospital[]) => void;
}

export default function DmoDashboard({ hospitals, onUpdateHospitals }: DmoDashboardProps) {

  const [requisitionOpen, setRequisitionOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState({
    donorPhc: 'PHC_103 Chembur',
    deficitPhc: 'PHC_102 Taloja',
    medicine: 'MED_PARACETAMOL',
    quantity: 100,
    distanceKm: 12.4,
  });

  const { user } = useAuth();

  const [mapFilter, setMapFilter] = useState<"All" | "Active Sync" | "Predictive Stock" | "Blackout">("All");
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [consignments, setConsignments] = useState<ConsignmentRequest[]>(INITIAL_CONSIGNMENTS);
  const [isLogbookModalOpen, setIsLogbookModalOpen] = useState(false);
  const [dispatchSuccessMsg, setDispatchSuccessMsg] = useState("");

  const blackoutHospitals = hospitals.filter((h) => h.status === "Blackout");
  const predictiveStockHospitals = hospitals.filter((h) => h.status === "Predictive Stock");
  const activeSyncHospitals = hospitals.filter((h) => h.status === "Active Sync");

  const lowStockItems = hospitals.flatMap((h) =>
    h.criticalMedicines
      .filter((m) => m.isBelowLimit)
      .map((m) => ({ ...m, hospitalId: h.id, hospitalName: h.name, status: h.status }))
  );

  const allStorageUnits = hospitals.flatMap((h) =>
    h.storageUnits.map((su) => ({ ...su, hospitalName: h.name, hospitalId: h.id }))
  );
  const criticalStorageUnits = allStorageUnits.filter(
    (su) => su.status === "Critical Outage" || su.status === "Warning"
  );

  const handleDispatchConsignment = (consignmentId: string) => {
    setConsignments((prev) =>
      prev.map((c) => (c.id === consignmentId ? { ...c, status: "In Transit" } : c))
    );
    setDispatchSuccessMsg(`Emergency consignment ${consignmentId} successfully dispatched! Status updated to 'In Transit'.`);
    setTimeout(() => setDispatchSuccessMsg(""), 5000);
  };

  const handleAddParsedMedicines = (items: { medicine: string; quantity: number | string; batchNumber: string }[]) => {
    const targetHospId = selectedHospital ? selectedHospital.id : hospitals[0].id;
    const updated = hospitals.map((h) => {
      if (h.id === targetHospId) {
        const newMeds = [...h.criticalMedicines];
        items.forEach((item) => {
          const qty = typeof item.quantity === "number" ? item.quantity : parseInt(item.quantity) || 100;
          newMeds.push({
            name: item.medicine,
            category: "AI Scanned Log",
            currentStock: qty,
            emergencyLimit: 20,
            unit: "units",
            isBelowLimit: false,
          });
        });
        return { ...h, criticalMedicines: newMeds };
      }
      return h;
    });

    onUpdateHospitals(updated);
    setDispatchSuccessMsg(`Successfully imported ${items.length} medicines via Gemini AI Logbook scan into ${hospitals.find((h) => h.id === targetHospId)?.name}!`);
    setTimeout(() => setDispatchSuccessMsg(""), 6000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Visual Graphical Header Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-blue-500/20 bg-zinc-950">
        <div className="relative h-64 md:h-72 w-full">
          <Image
            src="/images/coldchain.jpg"
            alt="DMO Storage & Cold Chain Telemetry"
            fill
            className="object-cover object-center opacity-70"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
          
          <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30 backdrop-blur-md self-start">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              District Medical Officer Portal — {user?.district || "Raigad District"}
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-2 max-w-xl">
                <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight drop-shadow-md">
                  Welcome, {user?.name || "Dr. Rajesh Sharma (DMO)"}
                </h2>
                <p className="text-xs md:text-sm text-blue-100/90 font-medium leading-relaxed">
                  Official Badge: <code className="font-mono bg-blue-950/80 px-2 py-0.5 rounded text-blue-300 border border-blue-500/30">{user?.badgeId || "DMO-PANVEL-01"}</code> — Active Monitoring of Cold Chain Telemetry, Emergency Limits, and Urgent Supplies.
                </p>
              </div>

              <button
                onClick={() => setIsLogbookModalOpen(true)}
                className="py-3 px-5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold transition-all shadow-xl shadow-purple-600/30 flex items-center gap-2 border border-purple-400/30 active:scale-98 self-start md:self-auto"
              >
                <span>📷 Scan Paper Logbook (Gemini AI)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {dispatchSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm font-semibold flex items-center gap-2 animate-in slide-in-from-top duration-300 shadow-md">
          <span className="text-lg">✓</span> {dispatchSuccessMsg}
        </div>
      )}

      {/* Graphical District Telemetry Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Storage Units */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md space-y-3 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Storage Units</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg">❄️</div>
          </div>
          <div className="text-3xl font-black text-zinc-900 dark:text-zinc-100">{allStorageUnits.length} Units</div>
          <div className="text-xs text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            {criticalStorageUnits.length} Warning / Outage
          </div>
        </div>

        {/* Active Sync Hospitals */}
        <div
          onClick={() => setMapFilter("Active Sync")}
          className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 shadow-md space-y-3 relative overflow-hidden group cursor-pointer hover:border-emerald-500 transition-all hover:shadow-xl hover:shadow-emerald-500/10"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Active Sync</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">🟢</div>
          </div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{activeSyncHospitals.length} Optimal</div>
          <div className="text-xs text-zinc-400 font-medium">100% Live GIS Sync</div>
        </div>

        {/* Predictive Stock */}
        <div
          onClick={() => setMapFilter("Predictive Stock")}
          className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 shadow-md space-y-3 relative overflow-hidden group cursor-pointer hover:border-amber-500 transition-all hover:shadow-xl hover:shadow-amber-500/10"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Predictive Stock</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-lg">🟡</div>
          </div>
          <div className="text-3xl font-black text-amber-600 dark:text-amber-400">{predictiveStockHospitals.length} Depleting</div>
          <div className="text-xs text-amber-500 font-medium">Predicted Depletion &lt; 48h</div>
        </div>

        {/* Blackout Outages */}
        <div
          onClick={() => setMapFilter("Blackout")}
          className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 shadow-md space-y-3 relative overflow-hidden group cursor-pointer hover:border-rose-500 transition-all hover:shadow-xl hover:shadow-rose-500/10"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Grid Blackouts</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-lg">🔴</div>
          </div>
          <div className="text-3xl font-black text-rose-600 dark:text-rose-400">{blackoutHospitals.length} Outage</div>
          <div className="text-xs text-rose-500 font-bold animate-pulse">Urgent Consignment Needed</div>
        </div>
      </div>

      {/* Main Map & Filter Control */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
              District GIS Telemetry Map
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Interactive map displaying live status markers. Click any pin for detailed unit metrics.
            </p>
          </div>

          <div className="inline-flex rounded-2xl bg-zinc-200 dark:bg-zinc-800 p-1.5 text-xs font-bold shadow-inner">
            {(["All", "Active Sync", "Predictive Stock", "Blackout"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setMapFilter(filter)}
                className={`px-3.5 py-2 rounded-xl transition-all ${
                  mapFilter === filter
                    ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-md"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                {filter === "Active Sync" && "🟢 "}
                {filter === "Predictive Stock" && "🟡 "}
                {filter === "Blackout" && "🔴 "}
                {filter}
              </button>
            ))}
          </div>
        </div>

        <ArogyaMap
          hospitals={hospitals}
          selectedHospitalId={selectedHospital?.id}
          onSelectHospital={(h) => setSelectedHospital(h)}
          statusFilter={mapFilter}
        />
      </div>

      {/* Two Column Section: Below-Emergency Stock & Urgent Consignment Shipping */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Medicines Below Emergency Limit */}
        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                Below Emergency Limit Medicines
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Critical medicine stocks breaching the safe reserve buffer.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-extrabold text-xs border border-rose-500/20 shadow-sm">
              {lowStockItems.length} Depleted
            </span>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-inner">
            {lowStockItems.map((item, idx) => (
              <div key={idx} className="p-4 bg-zinc-50/70 dark:bg-zinc-800/40 flex items-center justify-between text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors">
                <div className="space-y-1">
                  <div className="font-extrabold text-zinc-900 dark:text-zinc-100 text-sm">{item.name}</div>
                  <div className="text-zinc-500 dark:text-zinc-400">Hospital: <span className="text-zinc-900 dark:text-zinc-200 font-bold">{item.hospitalName}</span></div>
                  <div className="text-[11px] text-rose-500 font-mono font-semibold">Safety Reserve Threshold: {item.emergencyLimit} {item.unit}</div>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <span className="px-3 py-1.5 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 font-black text-xs border border-rose-500/30 inline-block shadow-sm">
                    Current: {item.currentStock} {item.unit}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedTransfer({
                        donorPhc: 'PHC_103 Chembur',
                        deficitPhc: item.hospitalName,
                        medicine: item.name,
                        quantity: Math.max(item.emergencyLimit * 2, 50),
                        distanceKm: 12.4,
                      });
                      setRequisitionOpen(true);
                    }}
                    className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-all shadow-md shadow-emerald-600/20 active:scale-95 flex items-center gap-1"
                  >
                    📋 Generate Requisition
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Urgent Consignment Shipping */}
        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                📦 Urgent Consignment Shipping
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Immediate stock dispatch requests from district health centers.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold text-xs border border-blue-500/20 shadow-sm">
              {consignments.filter((c) => c.status === "Pending Dispatch").length} Pending
            </span>
          </div>

          <div className="space-y-4">
            {consignments.map((csg) => (
              <div key={csg.id} className="p-5 rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 space-y-3.5 shadow-sm hover:border-blue-500/40 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <span className={`inline-block px-2.5 py-0.5 text-[10px] font-extrabold rounded-full border ${
                      csg.urgency === "Immediate Critical"
                        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 animate-pulse"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                    }`}>
                      {csg.urgency}
                    </span>
                    <h4 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">{csg.hospitalName}</h4>
                  </div>
                  <div className="text-right">
                    <span className={`px-2.5 py-1 text-[11px] font-black rounded-lg ${
                      csg.status === "In Transit"
                        ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                        : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                    }`}>
                      {csg.status}
                    </span>
                    <div className="text-[10px] text-zinc-400 mt-1 font-medium">{csg.requestedAt}</div>
                  </div>
                </div>

                <div className="text-xs text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-1.5 shadow-inner">
                  <div className="font-extrabold text-zinc-400 text-[10px] uppercase tracking-wider">Requested Consignment Items:</div>
                  {csg.medicines.map((m, idx) => (
                    <div key={idx} className="flex justify-between font-mono font-medium">
                      <span>• {m.name}</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">{m.quantity} {m.unit}</span>
                    </div>
                  ))}
                </div>

                {csg.status === "Pending Dispatch" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDispatchConsignment(csg.id)}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs transition-all shadow-md shadow-blue-600/25 active:scale-98 flex items-center justify-center gap-2"
                    >
                      <span>Dispatch Consignment 🚀</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTransfer({
                          donorPhc: 'PHC_103 Chembur',
                          deficitPhc: csg.hospitalName,
                          medicine: csg.medicines[0]?.name || 'MED_PARACETAMOL',
                          quantity: csg.medicines[0]?.quantity || 100,
                          distanceKm: 14.2,
                        });
                        setRequisitionOpen(true);
                      }}
                      className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-all shadow-md shadow-emerald-600/25 active:scale-98 flex items-center justify-center gap-2"
                    >
                      <span>📄 Order Brief</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* District Storage Units Analytics Table */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg space-y-5">
        <div>
          <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100">
            District Cold Chain & Storage Unit Breakdown
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Real-time telemetry on cold box temperatures, target setpoints, and storage capacity load %.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 uppercase font-extrabold tracking-wider">
              <tr>
                <th className="p-4 rounded-l-xl">Storage Unit Name</th>
                <th className="p-4">Hospital</th>
                <th className="p-4">Type</th>
                <th className="p-4">Current Temp</th>
                <th className="p-4">Capacity Load</th>
                <th className="p-4 rounded-r-xl">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {allStorageUnits.map((unit) => (
                <tr key={unit.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="p-4 font-extrabold text-zinc-900 dark:text-zinc-100">{unit.name}</td>
                  <td className="p-4 text-zinc-600 dark:text-zinc-300 font-medium">{unit.hospitalName}</td>
                  <td className="p-4 text-zinc-500 font-medium">{unit.type}</td>
                  <td className="p-4 font-mono font-bold text-sm">
                    <span className={unit.temperatureCelsius > unit.targetTempCelsius + 2 ? "text-rose-500 font-black" : "text-emerald-600 dark:text-emerald-400"}>
                      {unit.temperatureCelsius}°C
                    </span>{" "}
                    <span className="text-zinc-400 text-[10px] font-medium">(Target: {unit.targetTempCelsius}°C)</span>
                  </td>
                  <td className="p-4">
                    <div className="w-28 bg-zinc-200 dark:bg-zinc-700 h-2.5 rounded-full overflow-hidden inline-block mr-2 align-middle">
                      <div
                        className={`h-full ${unit.capacityPercentage < 30 ? "bg-amber-500" : "bg-emerald-500"}`}
                        style={{ width: `${unit.capacityPercentage}%` }}
                      />
                    </div>
                    <span className="font-mono text-zinc-800 dark:text-zinc-200 font-bold">{unit.capacityPercentage}%</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                      unit.status === "Optimal"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        : unit.status === "Warning"
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                    }`}>
                      {unit.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Logbook Scanner Modal */}
      <LogbookScannerModal
        isOpen={isLogbookModalOpen}
        onClose={() => setIsLogbookModalOpen(false)}
        onAddParsedMedicines={handleAddParsedMedicines}
      />
      {/* Stock Transfer Requisition Order Modal */}
      <RequisitionModal
        isOpen={requisitionOpen}
        onClose={() => setRequisitionOpen(false)}
        donorPhc={selectedTransfer.donorPhc}
        deficitPhc={selectedTransfer.deficitPhc}
        medicine={selectedTransfer.medicine}
        quantity={selectedTransfer.quantity}
        distanceKm={selectedTransfer.distanceKm}
      />

    </div>
  );
}
