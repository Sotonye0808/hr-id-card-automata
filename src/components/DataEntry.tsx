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
  Crop,
} from "lucide-react";
import { UserData } from "../types";

interface DataEntryProps {
  data: UserData;
  onChange: (data: UserData) => void;
  templateVariables?: string[];
}

export default function DataEntry({ data, onChange, templateVariables }: DataEntryProps) {
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

  const updateCrop = (key: keyof UserData["imageCrop"], value: number) => {
    const nextCrop = {
      ...data.imageCrop,
      [key]: value,
    };

    if (key === "x" && nextCrop.width === 100) {
      nextCrop.width = 95;
    }

    if (key === "y" && nextCrop.height === 100) {
      nextCrop.height = 95;
    }

    if (key === "width") {
      nextCrop.x = Math.min(nextCrop.x, 100 - value);
    }

    if (key === "height") {
      nextCrop.y = Math.min(nextCrop.y, 100 - value);
    }

    if (key === "x") {
      nextCrop.x = Math.min(value, 100 - nextCrop.width);
    }

    if (key === "y") {
      nextCrop.y = Math.min(value, 100 - nextCrop.height);
    }

    onChange({
      ...data,
      imageCrop: nextCrop,
    });
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-[0.2em] flex items-center gap-2">
          <UserCircle size={12} className="text-[var(--accent)]" />
          Employee Entry
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-5">
        {/* Profile Image Upload */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-[var(--muted)] uppercase flex items-center gap-2">
            <ImageIcon size={12} /> Profile Media
          </label>
          <div className="relative group">
            <div
              className={`w-full aspect-square md:aspect-video rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-3 ${data.imageUrl ? "border-[var(--accent)]/50 bg-[var(--accent-soft)]" : "border-[var(--border)] bg-[var(--bg)] hover:border-[var(--accent)]/40"}`}>
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
                  <div className="p-3 bg-[var(--accent-soft)] rounded-full text-[var(--accent)]">
                    <Upload size={24} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-[var(--text)]">
                      Drop profile image here
                    </p>
                    <p className="text-[10px] text-[var(--muted)] mt-1">
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
          {(!templateVariables || templateVariables.includes('fullName')) && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[var(--muted)] uppercase flex items-center gap-2">
              <UserCircle size={10} /> Full Legal Name
            </label>
            <input
              type="text"
              value={data.fullName}
              onChange={(e) => onChange({ ...data, fullName: e.target.value })}
              placeholder="e.g. Alexandru Sterling"
              aria-label="Full legal name"
              title="Full legal name"
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>
          )}

          {(!templateVariables || templateVariables.includes('role')) && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[var(--muted)] uppercase flex items-center gap-2">
              <Briefcase size={10} /> Professional Role
            </label>
            <input
              type="text"
              value={data.role}
              onChange={(e) => onChange({ ...data, role: e.target.value })}
              placeholder="e.g. Systems Architect"
              aria-label="Professional role"
              title="Professional role"
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>
          )}

          {(!templateVariables || templateVariables.includes('department')) && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[var(--muted)] uppercase flex items-center gap-2">
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
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {(!templateVariables || templateVariables.includes('idNumber')) && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[var(--muted)] uppercase flex items-center gap-2">
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
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] font-mono focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>
            )}
            {(!templateVariables || templateVariables.includes('issueDate')) && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[var(--muted)] uppercase flex items-center gap-2">
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
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>
            )}
          </div>

          <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3">
            <div className="flex items-center justify-between gap-3">
              <label className="text-[10px] font-bold text-[var(--muted)] uppercase flex items-center gap-2">
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
                className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] hover:text-[var(--text)] transition-colors flex items-center gap-1">
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
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
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
                  className="w-full accent-[var(--accent)] h-1 bg-[var(--border)] rounded-lg appearance-none cursor-pointer"
                />
              </div>
            ))}
          </div>

          <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3">
            <div className="flex items-center justify-between gap-3">
              <label className="text-[10px] font-bold text-[var(--muted)] uppercase flex items-center gap-2">
                <Crop size={10} /> Crop Window
              </label>
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...data,
                    imageCrop: { x: 0, y: 0, width: 100, height: 100 },
                  })
                }
                className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] hover:text-[var(--text)] transition-colors flex items-center gap-1">
                <RotateCcw size={10} /> Reset
              </button>
            </div>

            {[
              {
                label: "Crop X",
                key: "x" as const,
                min: 0,
                max: Math.max(5, 100 - data.imageCrop.width),
                step: 1,
                value: data.imageCrop.x,
              },
              {
                label: "Crop Y",
                key: "y" as const,
                min: 0,
                max: Math.max(5, 100 - data.imageCrop.height),
                step: 1,
                value: data.imageCrop.y,
              },
              {
                label: "Crop Width",
                key: "width" as const,
                min: 20,
                max: 100 - data.imageCrop.x,
                step: 1,
                value: data.imageCrop.width,
              },
              {
                label: "Crop Height",
                key: "height" as const,
                min: 20,
                max: 100 - data.imageCrop.y,
                step: 1,
                value: data.imageCrop.height,
              },
            ].map((control) => (
              <div key={control.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                  <span>{control.label}</span>
                  <span>{control.value}%</span>
                </div>
                <input
                  type="range"
                  min={control.min}
                  max={control.max}
                  step={control.step}
                  value={control.value}
                  onChange={(event) =>
                    updateCrop(
                      control.key,
                      Number.parseInt(event.target.value, 10),
                    )
                  }
                  aria-label={control.label}
                  title={control.label}
                  className="w-full accent-[var(--accent)] h-1 bg-[var(--border)] rounded-lg appearance-none cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
