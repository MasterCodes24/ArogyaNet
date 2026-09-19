"use client";

import dynamic from "next/dynamic";
import { Hospital } from "@/data/hospitalsData";

interface ArogyaMapProps {
  hospitals: Hospital[];
  selectedHospitalId?: string | null;
  onSelectHospital?: (hospital: Hospital) => void;
  statusFilter?: "All" | "Active Sync" | "Predictive Stock" | "Blackout";
  mapCenter?: [number, number];
}

const ArogyaMapInner = dynamic(() => import("./ArogyaMapInner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[520px] rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex flex-col items-center justify-center animate-pulse border border-zinc-200 dark:border-zinc-800 text-zinc-400 gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      <span className="text-sm font-medium">Initializing GIS Telemetry Engine...</span>
    </div>
  ),
});

export default function ArogyaMap(props: ArogyaMapProps) {
  return <ArogyaMapInner {...props} />;
}
