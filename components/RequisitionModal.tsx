'use client';

import React, { useState } from 'react';


// Defines the data the modal needs to generate an order
interface RequisitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  donorPhc: string;
  deficitPhc: string;
  medicine: string;
  quantity: number;
  distanceKm: number;
}

export default function RequisitionModal({
  isOpen,
  onClose,
  donorPhc,
  deficitPhc,
  medicine,
  quantity,
  distanceKm,
}: RequisitionModalProps) {
  // Local state to track loading spinner and the generated document text
  const [loading, setLoading] = useState(false);
  const [documentText, setDocumentText] = useState<string | null>(null);

  // If isOpen is false, render nothing
  if (!isOpen) return null;

  // The function that calls our working backend API
  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/requisition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donorPhc, deficitPhc, medicine, quantity, distanceKm }),
      });
      const data = await res.json();
      setDocumentText(data.document || 'Order generated successfully.');
    } catch {
      setDocumentText('Failed to generate order document.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Darkened backdrop overlay covering the screen
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      {/* Modal Dialog Card */}
      <div className="w-full max-w-2xl rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-slate-100 flex flex-col max-h-[85vh]">
        
        {/* Header with Title and Close 'X' */}
        <div className="flex items-center justify-between border-b border-slate-700 pb-3">
          <h3 className="text-lg font-semibold text-emerald-400">
            Emergency Stock Requisition Protocol
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl font-bold transition">
            ✕
          </button>
        </div>

        {/* Transfer Parameters Summary */}
        <div className="my-4 space-y-1 text-sm text-slate-300">
          <p><span className="text-slate-400">Donor Facility:</span> <strong className="text-white">{donorPhc}</strong></p>
          <p><span className="text-slate-400">Deficit Facility:</span> <strong className="text-white">{deficitPhc}</strong></p>
          <p><span className="text-slate-400">Transfer Item:</span> {quantity} units of <strong className="text-emerald-400">{medicine}</strong> ({distanceKm} km transit)</p>
        </div>

        {/* Step A: If no document generated yet, show the 'Generate' button */}
        {!documentText ? (
          <div className="py-8 flex flex-col items-center justify-center border border-dashed border-slate-700 rounded-lg bg-slate-800/40 my-2">
            <p className="text-slate-400 text-sm mb-4">Click below to generate the administrative transfer order.</p>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-medium text-white transition disabled:opacity-50"
            >
              {loading ? 'Compiling Order via AI...' : 'Generate Official Requisition'}
            </button>
          </div>
        ) : (
          /* Step B: Once generated, display the formatted text in a scrollable block */
          <div className="flex-1 overflow-y-auto rounded-lg bg-slate-950 p-4 border border-slate-800 font-mono text-xs leading-relaxed text-slate-200 whitespace-pre-wrap select-text">
            {documentText}
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-4 flex justify-end gap-3 pt-3 border-t border-slate-700">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition">
            Close
          </button>
          {documentText && (
            <button
              onClick={() => window.print()}
              className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-500 font-medium text-white transition"
            >
              Print / Save PDF
            </button>
          )}
        </div>

      </div>
    </div>
  );
}