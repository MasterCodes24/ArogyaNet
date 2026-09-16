"use client";

import React, { useState } from "react";

interface LogbookScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddParsedMedicines: (medicines: { medicine: string; quantity: number | string; batchNumber: string }[]) => void;
}

export default function LogbookScannerModal({ isOpen, onClose, onAddParsedMedicines }: LogbookScannerModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [parsedResults, setParsedResults] = useState<{ medicine: string; quantity: number | string; batchNumber: string }[] | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setParsedResults(null);
        setError("");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScanWithGemini = async () => {
    if (!selectedImage) {
      setError("Please select or upload a logbook image first.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/parse-logbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: selectedImage }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to parse logbook image.");
      }

      const items = Array.isArray(data.data) ? data.data : [data.data];
      setParsedResults(items);
    } catch (err: any) {
      setError(err.message || "Error connecting to Gemini Logbook API.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyToInventory = () => {
    if (parsedResults && parsedResults.length > 0) {
      onAddParsedMedicines(parsedResults);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-lg font-bold w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center"
        >
          ✕
        </button>

        <div className="space-y-1 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-semibold border border-purple-500/20">
            ✨ Gemini 1.5 Flash Vision AI
          </div>
          <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
            DMO Logbook OCR Scanner
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Upload handwritten or printed physical inventory logs. Gemini Vision AI will automatically extract medicine names, quantities, and batch numbers.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Upload & Preview */}
        <div className="space-y-4">
          <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl p-6 text-center hover:border-purple-500 transition-colors bg-zinc-50 dark:bg-zinc-800/40">
            {selectedImage ? (
              <div className="space-y-3">
                <img
                  src={selectedImage}
                  alt="Logbook Preview"
                  className="max-h-48 mx-auto rounded-lg object-contain shadow-md border border-zinc-200 dark:border-zinc-700"
                />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="text-xs text-rose-500 hover:text-rose-600 font-semibold"
                >
                  Remove & Choose Another
                </button>
              </div>
            ) : (
              <label className="cursor-pointer space-y-2 block">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center text-2xl mx-auto">
                  📷
                </div>
                <div className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                  Click to select Logbook image
                </div>
                <div className="text-xs text-zinc-400">Supports JPG, PNG, WEBP</div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {!parsedResults && (
            <button
              onClick={handleScanWithGemini}
              disabled={!selectedImage || isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm transition-all shadow-md shadow-purple-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Scanning with Gemini 1.5 Flash...</span>
                </>
              ) : (
                <span>Scan Logbook with AI ✨</span>
              )}
            </button>
          )}

          {/* Results Display */}
          {parsedResults && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Extracted Medicines ({parsedResults.length})
                </h4>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  ✓ Ready for Inventory Sync
                </span>
              </div>

              <div className="divide-y divide-zinc-200 dark:divide-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                {parsedResults.map((item, idx) => (
                  <div key={idx} className="p-3 bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-zinc-900 dark:text-zinc-100">{item.medicine}</div>
                      <div className="text-zinc-400 font-mono">Batch: {item.batchNumber || "N/A"}</div>
                    </div>
                    <div className="px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-300 font-bold border border-purple-500/20">
                      Qty: {item.quantity}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleApplyToInventory}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-md shadow-emerald-600/20"
              >
                Apply Extracted Items to District Inventory
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
