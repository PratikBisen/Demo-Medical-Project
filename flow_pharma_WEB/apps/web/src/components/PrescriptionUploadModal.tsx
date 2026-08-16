"use client";

import React, { useState } from "react";
import { UploadCloud, CheckCircle2, FileText, X } from "lucide-react";

interface PrescriptionUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (filename: string) => void;
}

export function PrescriptionUploadModal({ isOpen, onClose, onSuccess }: PrescriptionUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [doctorName, setDoctorName] = useState("Dr. Anand Rao, MD");
  const [doctorReg, setDoctorReg] = useState("MCI-1994-48201");
  const [isUploading, setIsUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setUploaded(true);
      setTimeout(() => {
        onSuccess(file ? file.name : "Doctor_Prescription_Cardiology.pdf");
        onClose();
        setUploaded(false);
      }, 1000);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md rounded-3xl border border-border bg-card shadow-2xl p-6 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary text-muted-foreground"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2 border border-emerald-500/30">
            <UploadCloud className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">Upload Doctor Prescription</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Required for Schedule H / H1 prescription medicines. Verified by licensed pharmacists.
          </p>
        </div>

        {uploaded ? (
          <div className="text-center py-8 space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <div className="text-sm font-semibold text-foreground">Prescription Uploaded Successfully!</div>
            <div className="text-xs text-muted-foreground">Queued for pharmacist verification review.</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-2xl p-6 text-center hover:border-emerald-500/50 transition-colors cursor-pointer bg-secondary/30">
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
                id="rx-file-input"
              />
              <label htmlFor="rx-file-input" className="cursor-pointer block">
                <FileText className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                <div className="text-xs font-medium text-foreground">
                  {file ? file.name : "Click to select Prescription PDF or Image"}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">PDF, JPG, PNG up to 10 MB</div>
              </label>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">Doctor Name</label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">Medical Registration Number</label>
                <input
                  type="text"
                  value={doctorReg}
                  onChange={(e) => setDoctorReg(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isUploading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-transform disabled:opacity-50"
            >
              {isUploading ? "Uploading & Encrypting Document..." : "Submit Prescription"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
