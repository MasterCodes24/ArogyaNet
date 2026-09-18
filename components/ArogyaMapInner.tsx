"use client";

import React from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Hospital } from "@/data/hospitalsData";

const createCustomIcon = (color: string, border: string = "#ffffff") => {
  return L.divIcon({
    className: "custom-leaflet-marker",
    html: `
      <div style="
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 38px;
        height: 38px;
      ">
        <div style="
          position: absolute;
          width: 32px;
          height: 32px;
          background-color: ${color};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px 14px rgba(0,0,0,0.4);
          border: 2px solid ${border};
        "></div>
        <div style="
          position: absolute;
          width: 10px;
          height: 10px;
          background-color: #ffffff;
          border-radius: 50%;
          top: 11px;
          left: 14px;
        "></div>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -36],
  });
};

const greenIcon = createCustomIcon("#10b981");
const yellowIcon = createCustomIcon("#eab308");
const redIcon = createCustomIcon("#ef4444");

interface ArogyaMapInnerProps {
  hospitals: Hospital[];
  selectedHospitalId?: string | null;
  onSelectHospital?: (hospital: Hospital) => void;
  statusFilter?: "All" | "Active Sync" | "Predictive Stock" | "Blackout";
  mapCenter?: [number, number];
}

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  React.useEffect(() => {
    map.flyTo(center, 11, { animate: true, duration: 1.2 });
  }, [center, map]);
  return null;
}

export default function ArogyaMapInner({
  hospitals,
  selectedHospitalId,
  onSelectHospital,
  statusFilter = "All",
  mapCenter,
}: ArogyaMapInnerProps) {
  const defaultCenter: [number, number] = [18.9894, 73.1175];
  const center = mapCenter || defaultCenter;

  const filteredHospitals = hospitals.filter(
    (h) => statusFilter === "All" || h.status === statusFilter
  );

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-900">
      <MapContainer
        center={center}
        zoom={11}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <MapController center={center} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {filteredHospitals.map((hosp) => {
          let icon = greenIcon;
          let badgeClass = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";

          if (hosp.status === "Predictive Stock") {
            icon = yellowIcon;
            badgeClass = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
          } else if (hosp.status === "Blackout") {
            icon = redIcon;
            badgeClass = "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
          }

          return (
            <Marker
              key={hosp.id}
              position={hosp.coordinates}
              icon={icon}
              eventHandlers={{
                click: () => onSelectHospital && onSelectHospital(hosp),
              }}
            >
              <Popup className="leaflet-custom-popup">
                <div className="p-1.5 max-w-xs font-sans">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`inline-block px-2 py-0.5 text-[11px] font-semibold rounded-full border ${badgeClass}`}>
                      {hosp.status}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-medium">{hosp.type}</span>
                  </div>

                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 m-0 leading-tight">
                    {hosp.name}
                  </h4>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 mb-2 leading-tight">
                    {hosp.address}
                  </p>

                  <div className="grid grid-cols-3 gap-1 text-[11px] bg-zinc-50 dark:bg-zinc-800 p-2 rounded-lg text-center font-semibold mb-2">
                    <div>
                      <div className="text-zinc-400 text-[9px] uppercase">ICU Beds</div>
                      <div className="text-emerald-600 dark:text-emerald-400">{hosp.icuBedsAvailable} open</div>
                    </div>
                    <div>
                      <div className="text-zinc-400 text-[9px] uppercase">O2 Beds</div>
                      <div className="text-blue-600 dark:text-blue-400">{hosp.oxygenBedsAvailable} open</div>
                    </div>
                    <div>
                      <div className="text-zinc-400 text-[9px] uppercase">Doctors</div>
                      <div className="text-purple-600 dark:text-purple-400">{hosp.onDutyDoctors} duty</div>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectHospital && onSelectHospital(hosp)}
                    className="w-full py-1.5 px-3 rounded-md bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-bold text-xs transition-colors"
                  >
                    View Details & Telemetry →
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
