"use client";

import React, { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Medicine {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

interface Staff {
  staffId: string;
  staffName: string;
  role: string;
  status: "Present" | "Absent";
  timestamp?: any;
  phcId: string;
}

interface Footfall {
  phcId: string;
  date: string;
  patientCount: number;
}

// ─── Speech Recognition Types ─────────────────────────────────────────────────
interface SpeechRecognitionEventLike {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionErrorEventLike {
  error: string;
}

interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

// ─── Seed data ────────────────────────────────────────────────────────────────
const SEED_MEDICINES: Medicine[] = [
  {
    id: "paracetamol-500mg",
    name: "Paracetamol 500mg",
    quantity: 150,
    unit: "tablets",
  },
  {
    id: "amoxicillin-250mg",
    name: "Amoxicillin 250mg",
    quantity: 12,
    unit: "capsules",
  },
  {
    id: "ibuprofen-400mg",
    name: "Ibuprofen 400mg",
    quantity: 85,
    unit: "tablets",
  },
];

const SEED_STAFF: Staff[] = [
  {
    staffId: "staff-1",
    staffName: "Dr. Sharma",
    role: "Medical Officer",
    status: "Present",
    phcId: "phc-001",
  },
  {
    staffId: "staff-2",
    staffName: "Nurse Priya",
    role: "Head Nurse",
    status: "Present",
    phcId: "phc-001",
  },
  {
    staffId: "staff-3",
    staffName: "Asha Worker 1",
    role: "Field Staff",
    status: "Absent",
    phcId: "phc-001",
  },
  {
    staffId: "staff-4",
    staffName: "Pharmacist Amit",
    role: "Pharmacy",
    status: "Present",
    phcId: "phc-001",
  },
];

// ─── Firestore collections ────────────────────────────────────────────────────
const MEDICINE_COLLECTION = "medicine_inventory";
const INVENTORY_LOG_COLLECTION = "inventory_logs";

const STAFF_COLLECTION = "staff_attendance";
const STAFF_PRESENCE_COLLECTION = "staff_presence";

const FOOTFALL_COLLECTION = "patient_footfall";

const PHC_ID = "phc-001";
const DISTRICT = "Mumbai";

// ─── Component ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [footfall, setFootfall] = useState<Footfall | null>(null);

  const [isOnline, setIsOnline] = useState(true);

  const [syncStatus, setSyncStatus] = useState<
    "idle" | "saving" | "saved" | "queued"
  >("idle");

  const [loading, setLoading] = useState(true);
  const [staffLoading, setStaffLoading] = useState(true);
  const [footfallLoading, setFootfallLoading] = useState(true);

  // ── Voice Search State ─────────────────────────────────────────────────────
  const [voiceText, setVoiceText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const [voiceLanguage, setVoiceLanguage] = useState("en-IN");

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  // ── Browser Online / Offline ───────────────────────────────────────────────
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // ── Medicine Firestore ─────────────────────────────────────────────────────
  useEffect(() => {
    const colRef = collection(db, MEDICINE_COLLECTION);

    const unsubscribe = onSnapshot(colRef, async (snapshot) => {
      if (snapshot.empty) {
        for (const med of SEED_MEDICINES) {
          await setDoc(doc(db, MEDICINE_COLLECTION, med.id), {
            name: med.name,
            quantity: med.quantity,
            unit: med.unit,
            updatedAt: serverTimestamp(),
          });
        }
        return;
      }

      const loaded: Medicine[] = snapshot.docs.map((d) => ({
        id: d.id,
        name: d.data().name as string,
        quantity: d.data().quantity as number,
        unit: d.data().unit as string,
      }));

      loaded.sort((a, b) => {
        const ai = SEED_MEDICINES.findIndex((m) => m.id === a.id);
        const bi = SEED_MEDICINES.findIndex((m) => m.id === b.id);
        return ai - bi;
      });

      setMedicines(loaded);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ── Staff Firestore ────────────────────────────────────────────────────────
  useEffect(() => {
    const colRef = collection(db, STAFF_COLLECTION);

    const unsubscribe = onSnapshot(colRef, async (snapshot) => {
      if (snapshot.empty) {
        for (const s of SEED_STAFF) {
          await setDoc(doc(db, STAFF_COLLECTION, s.staffId), {
            staffName: s.staffName,
            role: s.role,
            status: s.status,
            phcId: s.phcId,
            timestamp: serverTimestamp(),
          });
        }
        return;
      }

      const loaded: Staff[] = snapshot.docs.map((d) => ({
        staffId: d.id,
        staffName: d.data().staffName as string,
        role: d.data().role as string,
        status: d.data().status as "Present" | "Absent",
        phcId: d.data().phcId as string,
      }));

      loaded.sort((a, b) => {
        const ai = SEED_STAFF.findIndex((s) => s.staffId === a.staffId);
        const bi = SEED_STAFF.findIndex((s) => s.staffId === b.staffId);
        return ai - bi;
      });

      setStaffList(loaded);
      setStaffLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ── Patient Footfall Firestore ─────────────────────────────────────────────
  useEffect(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const phcId = PHC_ID;
    const docId = `${phcId}_${todayStr}`;

    const docRef = doc(db, FOOTFALL_COLLECTION, docId);

    const unsubscribe = onSnapshot(docRef, async (snapshot) => {
      if (!snapshot.exists()) {
        const initialFootfall: Footfall = {
          phcId,
          date: todayStr,
          patientCount: 0,
        };

        await setDoc(docRef, {
          ...initialFootfall,
          timestamp: serverTimestamp(),
        });

        return;
      }

      setFootfall({
        phcId: snapshot.data().phcId as string,
        date: snapshot.data().date as string,
        patientCount: snapshot.data().patientCount as number,
      });

      setFootfallLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ── Stop Voice Recognition ─────────────────────────────────────────────────
  function stopVoiceSearch() {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    setIsListening(false);
  }

  // ── Start Voice Search ─────────────────────────────────────────────────────
  function startVoiceSearch() {
    setVoiceError("");

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError(
        "Voice recognition is not supported in this browser. Please use Google Chrome."
      );
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const recognition = new SpeechRecognition();

    recognition.lang = voiceLanguage;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceError("");
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;

      console.log("Voice transcript:", transcript);

      setVoiceText(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error("Voice recognition error:", event.error);

      setIsListening(false);

      if (event.error === "not-allowed") {
        setVoiceError(
          "Microphone permission was denied. Please allow microphone access."
        );
      } else if (event.error === "no-speech") {
        setVoiceError(
          "No speech detected. Please speak clearly and try again."
        );
      } else {
        setVoiceError(
          "Could not recognize voice. Please try again."
        );
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (error) {
      console.error("Voice start error:", error);
      setIsListening(false);
      setVoiceError("Could not start microphone. Please try again.");
    }
  }

  // ── Clear Voice Search ─────────────────────────────────────────────────────
  function clearVoiceSearch() {
    stopVoiceSearch();
    setVoiceText("");
    setVoiceError("");
  }

  // ── Voice Search Filtering ─────────────────────────────────────────────────
  const filteredMedicines =
    voiceText.trim() === ""
      ? medicines
      : medicines.filter((medicine) => {
          const searchText = voiceText.toLowerCase().trim();
          const medicineName = medicine.name.toLowerCase();

          const firstWord = medicineName.split(" ")[0];

          return (
            medicineName.includes(searchText) ||
            searchText.includes(firstWord) ||
            firstWord.includes(searchText)
          );
        });

  // ── Adjust Medicine Quantity ──────────────────────────────────────────────
  async function adjustQuantity(id: string, delta: number) {
    const med = medicines.find((m) => m.id === id);

    if (!med) return;

    const newQty = Math.max(0, med.quantity + delta);

    setMedicines((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              quantity: newQty,
            }
          : m
      )
    );

    setSyncStatus(isOnline ? "saving" : "queued");

    try {
      await setDoc(
        doc(db, MEDICINE_COLLECTION, id),
        {
          quantity: newQty,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      await addDoc(collection(db, INVENTORY_LOG_COLLECTION), {
        phcId: PHC_ID,
        district: DISTRICT,
        medicineId: med.id,
        medicineName: med.name,
        quantityChange: delta,
        quantityAfter: newQty,
        timestamp: serverTimestamp(),
        source: "manual",
        syncStatus: isOnline ? "synced" : "queued",
      });

      setSyncStatus(isOnline ? "saved" : "queued");

      if (isOnline) {
        setTimeout(() => setSyncStatus("idle"), 2000);
      }
    } catch (error) {
      console.error("Medicine update failed:", error);
      setSyncStatus("queued");
    }
  }

  // ── Toggle Staff Status ────────────────────────────────────────────────────
  async function toggleStaffStatus(
    staffId: string,
    currentStatus: "Present" | "Absent"
  ) {
    const staff = staffList.find((s) => s.staffId === staffId);

    if (!staff) return;

    const newStatus =
      currentStatus === "Present" ? "Absent" : "Present";

    setStaffList((prev) =>
      prev.map((s) =>
        s.staffId === staffId
          ? {
              ...s,
              status: newStatus,
            }
          : s
      )
    );

    setSyncStatus(isOnline ? "saving" : "queued");

    try {
      await setDoc(
        doc(db, STAFF_COLLECTION, staffId),
        {
          status: newStatus,
          timestamp: serverTimestamp(),
        },
        { merge: true }
      );

      await addDoc(collection(db, STAFF_PRESENCE_COLLECTION), {
        phcId: staff.phcId,
        staffId: staff.staffId,
        staffName: staff.staffName,
        role: staff.role,
        status: newStatus,
        timestamp: serverTimestamp(),
      });

      setSyncStatus(isOnline ? "saved" : "queued");

      if (isOnline) {
        setTimeout(() => setSyncStatus("idle"), 2000);
      }
    } catch (error) {
      console.error("Staff update failed:", error);
      setSyncStatus("queued");
    }
  }

  // ── Adjust Patient Footfall ────────────────────────────────────────────────
  async function adjustFootfall(delta: number) {
    if (!footfall) return;

    const newCount = Math.max(
      0,
      footfall.patientCount + delta
    );

    setFootfall((prev) =>
      prev
        ? {
            ...prev,
            patientCount: newCount,
          }
        : null
    );

    setSyncStatus(isOnline ? "saving" : "queued");

    const docId = `${footfall.phcId}_${footfall.date}`;

    try {
      await setDoc(
        doc(db, FOOTFALL_COLLECTION, docId),
        {
          patientCount: newCount,
          timestamp: serverTimestamp(),
        },
        { merge: true }
      );

      setSyncStatus(isOnline ? "saved" : "queued");

      if (isOnline) {
        setTimeout(() => setSyncStatus("idle"), 2000);
      }
    } catch (error) {
      console.error("Footfall update failed:", error);
      setSyncStatus("queued");
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">

      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow-md sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">

          <h1 className="text-lg sm:text-xl font-bold">
            PHC Worker Dashboard
          </h1>

          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-colors ${
              isOnline
                ? "bg-blue-700"
                : "bg-yellow-500 text-yellow-900"
            }`}
          >
            <span
              className={`h-2 w-2 sm:h-3 sm:w-3 rounded-full ${
                isOnline
                  ? "bg-green-400"
                  : "bg-yellow-900"
              }`}
            />

            {isOnline
              ? "Online"
              : "Offline — changes will sync"}
          </div>

        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto p-4 py-6 sm:py-8 space-y-6">

        {/* Voice Search */}
        <section className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">

            <div>
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                🎤 Voice Medicine Search
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Search medicine stock using English or Hindi voice
              </p>
            </div>

            <button
              onClick={
                isListening
                  ? stopVoiceSearch
                  : startVoiceSearch
              }
              className={`px-5 py-3 rounded-lg font-medium text-white transition ${
                isListening
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isListening
                ? "⏹ Stop Listening"
                : "🎤 Start Voice Search"}
            </button>

          </div>

          {/* Language Selector */}
          <div className="mb-4">

            <p className="text-sm font-medium text-gray-700 mb-2">
              Voice Language
            </p>

            <div className="flex flex-wrap gap-2">

              <button
                onClick={() => setVoiceLanguage("en-IN")}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
                  voiceLanguage === "en-IN"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                🇬🇧 English
              </button>

              <button
                onClick={() => setVoiceLanguage("hi-IN")}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
                  voiceLanguage === "hi-IN"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                🇮🇳 Hindi
              </button>

            </div>

          </div>

          {/* Voice Result */}
          <div className="flex flex-col sm:flex-row gap-2">

            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 min-h-[48px]">

              {voiceText ? (
                <span className="text-gray-800">
                  {voiceText}
                </span>
              ) : (
                <span className="text-gray-400">
                  Say a medicine name, e.g. "Paracetamol"
                </span>
              )}

            </div>

            {voiceText && (
              <button
                onClick={clearVoiceSearch}
                className="px-4 py-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Clear
              </button>
            )}

          </div>

          {voiceError && (
            <p className="text-sm text-red-600 mt-3">
              ⚠️ {voiceError}
            </p>
          )}

          {/* Results */}
          {voiceText && (
            <div className="mt-4">

              <p className="text-sm font-medium text-gray-600 mb-2">
                Search Results
              </p>

              {filteredMedicines.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                  {filteredMedicines.map((medicine) => (

                    <div
                      key={medicine.id}
                      className="border border-blue-200 bg-blue-50 rounded-lg p-4"
                    >

                      <p className="font-semibold text-blue-900">
                        {medicine.name}
                      </p>

                      <p className="text-sm text-gray-600 mt-1">
                        Stock:{" "}
                        <span className="font-semibold">
                          {medicine.quantity} {medicine.unit}
                        </span>
                      </p>

                      <p
                        className={`text-xs font-medium mt-2 ${
                          medicine.quantity <= 20
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {medicine.quantity <= 20
                          ? "Low Stock"
                          : "Adequate Stock"}
                      </p>

                    </div>

                  ))}

                </div>
              ) : (

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                  No matching medicine found.
                </div>

              )}

            </div>
          )}

        </section>

        {/* Top Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Patient Footfall */}
          <section className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">

            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              👥 Patient Footfall
            </h2>

            {footfallLoading ? (
              <p className="text-gray-400 text-sm py-4 text-center">
                Loading footfall…
              </p>
            ) : (

              <div className="space-y-4">

                <div className="flex flex-col items-center justify-center bg-blue-50 py-5 rounded-xl border border-blue-100">

                  <span className="text-blue-800 font-medium mb-3">
                    Today's Count
                  </span>

                  <div className="flex items-center gap-6">

                    <button
                      onClick={() => adjustFootfall(-1)}
                      disabled={
                        !footfall ||
                        footfall.patientCount === 0
                      }
                      className="w-12 h-12 flex items-center justify-center rounded-full bg-white text-blue-600 font-bold text-2xl shadow-sm hover:bg-blue-100 transition disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200"
                    >
                      −
                    </button>

                    <span className="font-bold text-blue-700 text-5xl tabular-nums w-20 text-center">
                      {footfall?.patientCount || 0}
                    </span>

                    <button
                      onClick={() => adjustFootfall(1)}
                      className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold text-2xl shadow-sm hover:bg-blue-700 transition"
                    >
                      +
                    </button>

                  </div>

                </div>

                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">

                  <span className="text-gray-500">
                    This Week (Demo)
                  </span>

                  <span className="font-semibold text-gray-700 text-lg">
                    215
                  </span>

                </div>

              </div>

            )}

          </section>

          {/* Medicine Inventory */}
          <section className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 md:col-span-2 overflow-hidden">

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">

              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                💊 Medicine Inventory
              </h2>

              <span
                className={`text-xs px-2 py-1 rounded border w-fit font-medium ${
                  syncStatus === "saving"
                    ? "bg-blue-100 text-blue-800 border-blue-200"
                    : ""
                } ${
                  syncStatus === "saved"
                    ? "bg-green-100 text-green-800 border-green-200"
                    : ""
                } ${
                  syncStatus === "queued"
                    ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                    : ""
                } ${
                  syncStatus === "idle"
                    ? "bg-gray-100 text-gray-600 border-gray-200"
                    : ""
                }`}
              >
                {syncStatus === "saving" && "⏳ Saving…"}
                {syncStatus === "saved" &&
                  "✅ Saved to Firestore"}
                {syncStatus === "queued" &&
                  "📶 Queued — will sync when online"}
                {syncStatus === "idle" &&
                  "🔥 Live — Firestore"}
              </span>

            </div>

            {loading ? (
              <p className="text-gray-400 text-sm py-4 text-center">
                Loading from Firestore…
              </p>
            ) : (

              <div className="overflow-x-auto">

                <table className="w-full text-left border-collapse text-sm">

                  <thead>

                    <tr className="bg-gray-50 text-gray-600 border-y border-gray-200">

                      <th className="p-3 font-medium">
                        Medicine Name
                      </th>

                      <th className="p-3 font-medium">
                        Stock Left
                      </th>

                      <th className="p-3 font-medium">
                        Status
                      </th>

                      <th className="p-3 font-medium text-center">
                        Adjust
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-gray-100">

                    {medicines.map((med) => {

                      const isLow = med.quantity <= 20;

                      return (

                        <tr
                          key={med.id}
                          className="hover:bg-gray-50 transition"
                        >

                          <td className="p-3">
                            {med.name}
                          </td>

                          <td
                            className={`p-3 font-medium ${
                              isLow
                                ? "text-red-600"
                                : ""
                            }`}
                          >
                            {med.quantity} {med.unit}
                          </td>

                          <td className="p-3">

                            {isLow ? (

                              <span className="text-red-700 bg-red-100 px-2 py-1 rounded text-xs font-medium border border-red-200">
                                Low Stock
                              </span>

                            ) : (

                              <span className="text-green-700 bg-green-100 px-2 py-1 rounded text-xs font-medium border border-green-200">
                                Adequate
                              </span>

                            )}

                          </td>

                          <td className="p-3">

                            <div className="flex items-center justify-center gap-2">

                              <button
                                onClick={() =>
                                  adjustQuantity(
                                    med.id,
                                    -1
                                  )
                                }
                                disabled={
                                  med.quantity === 0
                                }
                                className="w-8 h-8 flex items-center justify-center rounded-md bg-red-100 text-red-700 font-bold text-lg hover:bg-red-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                −
                              </button>

                              <span className="w-10 text-center font-semibold text-gray-800 tabular-nums">
                                {med.quantity}
                              </span>

                              <button
                                onClick={() =>
                                  adjustQuantity(
                                    med.id,
                                    1
                                  )
                                }
                                className="w-8 h-8 flex items-center justify-center rounded-md bg-green-100 text-green-700 font-bold text-lg hover:bg-green-200 transition"
                              >
                                +
                              </button>

                            </div>

                          </td>

                        </tr>

                      );
                    })}

                  </tbody>

                </table>

              </div>

            )}

          </section>

        </div>

        {/* Staff Attendance */}
        <section className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">

          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            👨‍⚕️ Staff Attendance
          </h2>

          {staffLoading ? (

            <p className="text-gray-400 text-sm py-4 text-center">
              Loading staff from Firestore…
            </p>

          ) : (

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">

              {staffList.map((staff) => {

                const isPresent =
                  staff.status === "Present";

                return (

                  <button
                    key={staff.staffId}
                    onClick={() =>
                      toggleStaffStatus(
                        staff.staffId,
                        staff.status
                      )
                    }
                    className={`text-left border rounded-lg p-3 flex items-center justify-between transition ${
                      isPresent
                        ? "border-gray-200 hover:border-gray-300 bg-white"
                        : "border-red-200 bg-red-50/50 hover:border-red-300"
                    }`}
                  >

                    <div>

                      <p className="font-medium text-gray-800 text-sm">
                        {staff.staffName}
                      </p>

                      <p className="text-xs text-gray-500">
                        {staff.role}
                      </p>

                    </div>

                    <div className="flex items-center gap-1">

                      <span
                        className={`h-2 w-2 rounded-full ${
                          isPresent
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      />

                      <span
                        className={`text-xs font-medium ${
                          isPresent
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {staff.status}
                      </span>

                    </div>

                  </button>

                );
              })}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}