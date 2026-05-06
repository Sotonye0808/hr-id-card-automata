/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  UserCircle,
  Briefcase,
  Hash,
  Calendar,
  Upload,
  Image as ImageIcon,
  Building2,
  MoveHorizontal,
  RotateCcw,
  ZoomIn,
} from "lucide-react";
import { UserData } from "../types";

interface DataEntryProps {
  data: UserData;
  onChange: (data: UserData) => void;
}

export default function DataEntry({ data, onChange }: DataEntryProps) {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({ ...data, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const updateTransform = (
    key: keyof UserData["imageTransform"],
    value: number,
  ) => {
    onChange({
      ...data,
      imageTransform: { ...data.imageTransform, [key]: value },
    });
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <UserCircle size={12} className="text-blue-400" />
          Employee Entry
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-5">
        {/* Profile Image Upload */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
            <ImageIcon size={12} /> Profile Media
          </label>
          <div className="relative group">
            <div
              className={`w-full aspect-square md:aspect-video rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-3 ${data.imageUrl ? "border-blue-500/50 bg-blue-500/5" : "border-slate-800 bg-slate-900/50 hover:border-slate-700"}`}>
              {data.imageUrl ? (
                <div className="relative w-full h-full flex items-center justify-center p-4">
                  <img
                    src={data.imageUrl}
                    alt="Preview"
                    className="max-h-full rounded-lg shadow-lg"
                  />
                  <button
                    onClick={() => onChange({ ...data, imageUrl: null })}
                    title="Remove uploaded image"
                    aria-label="Remove uploaded image"
                    className="absolute top-2 right-2 p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-full transition-all border border-red-500/20">
                    <Upload size={12} className="rotate-180" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="p-3 bg-slate-800 rounded-full text-slate-400">
                    <Upload size={24} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-slate-300">
                      Drop profile image here
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      PNG, JPG up to 2MB
                    </p>
                  </div>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                title="Upload profile image"
                aria-label="Upload profile image"
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Text Inputs */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
              <UserCircle size={10} /> Full Legal Name
            </label>
            <input
              type="text"
              value={data.fullName}
              onChange={(e) => onChange({ ...data, fullName: e.target.value })}
              placeholder="e.g. Alexandru Sterling"
              aria-label="Full legal name"
              title="Full legal name"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
              <Briefcase size={10} /> Professional Role
            </label>
            <input
              type="text"
              value={data.role}
              onChange={(e) => onChange({ ...data, role: e.target.value })}
              placeholder="e.g. Systems Architect"
              aria-label="Professional role"
              title="Professional role"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
              <Building2 size={10} /> Department
            </label>
            <input
              type="text"
              value={data.department}
              onChange={(e) =>
                onChange({ ...data, department: e.target.value })
              }
              placeholder="e.g. Communications"
              aria-label="Department"
              title="Department"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
                <Hash size={10} /> Serial ID
              </label>
              <input
                type="text"
                value={data.idNumber}
                onChange={(e) =>
                  onChange({ ...data, idNumber: e.target.value })
                }
                placeholder="AIS-01"
                aria-label="Employee ID"
                title="Employee ID"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
                <Calendar size={10} /> Date Issued
              </label>
              <input
                type="date"
                value={data.issueDate}
                onChange={(e) =>
                  onChange({ ...data, issueDate: e.target.value })
                }
                aria-label="Date issued"
                title="Date issued"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/50 p-3">
            <div className="flex items-center justify-between gap-3">
              <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
                <MoveHorizontal size={10} /> Image Position
              </label>
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...data,
                    imageTransform: { scale: 1, offsetX: 0, offsetY: 0 },
                  })
                }
                className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors flex items-center gap-1">
                <RotateCcw size={10} /> Reset
              </button>
            </div>

            {[
              {
                label: "Scale",
                key: "scale" as const,
                icon: ZoomIn,
                min: 0.75,
                max: 1.75,
                step: 0.05,
                value: data.imageTransform.scale,
              },
              {
                label: "Offset X",
                key: "offsetX" as const,
                icon: MoveHorizontal,
                min: -100,
                max: 100,
                step: 1,
                value: data.imageTransform.offsetX,
              },
              {
                label: "Offset Y",
                key: "offsetY" as const,
                icon: MoveHorizontal,
                min: -100,
                max: 100,
                step: 1,
                value: data.imageTransform.offsetY,
              },
            ].map((control) => (
              <div key={control.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <control.icon size={10} /> {control.label}
                  </span>
                  <span>
                    {control.key === "scale"
                      ? `${control.value.toFixed(2)}x`
                      : `${control.value}px`}
                  </span>
                </div>
                <input
                  type="range"
                  min={control.min}
                  max={control.max}
                  step={control.step}
                  value={control.value}
                  onChange={(event) =>
                    updateTransform(
                      control.key,
                      control.key === "scale"
                        ? Number.parseFloat(event.target.value)
                        : Number.parseInt(event.target.value, 10),
                    )
                  }
                  aria-label={control.label}
                  title={control.label}
                  className="w-full accent-blue-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
