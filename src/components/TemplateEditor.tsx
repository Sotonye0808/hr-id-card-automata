/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Settings, Palette, Move, Type, RotateCcw } from "lucide-react";
import { CardConfig } from "../types";

interface TemplateEditorProps {
  config: CardConfig;
  onChange: (config: CardConfig) => void;
  onReset: () => void;
}

const FONTS = [
  { id: "font-sans", name: "Inter (Sans)" },
  { id: "font-tech", name: "Space Grotesk" },
  { id: "font-mono", name: "JetBrains Mono" },
  { id: "font-serif", name: "Playfair Display" },
];

const PRESET_PALETTES = [
  {
    name: "Midnight",
    primary: "#3B82F6",
    secondary: "#1E293B",
    text: "#FFFFFF",
    accent: "#60A5FA",
  },
  {
    name: "Emerald",
    primary: "#10B981",
    secondary: "#064E3B",
    text: "#ECFDF5",
    accent: "#34D399",
  },
  {
    name: "Vulcan",
    primary: "#EF4444",
    secondary: "#450A0A",
    text: "#FEF2F2",
    accent: "#F87171",
  },
  {
    name: "Amethyst",
    primary: "#8B5CF6",
    secondary: "#2E1065",
    text: "#F5F3FF",
    accent: "#A78BFA",
  },
];

const PALETTE_DOTS: Record<string, string> = {
  Midnight: "bg-blue-500",
  Emerald: "bg-emerald-500",
  Vulcan: "bg-red-500",
  Amethyst: "bg-violet-500",
};

export default function TemplateEditor({
  config,
  onChange,
  onReset,
}: TemplateEditorProps) {
  const [activeTab, setActiveTab] = useState<"design" | "layout">("design");

  const updateColor = (key: keyof CardConfig["colors"], value: string) => {
    onChange({
      ...config,
      colors: { ...config.colors, [key]: value },
    });
  };

  const updateElement = (
    el: keyof CardConfig["elements"],
    key: string,
    value: number | string,
  ) => {
    onChange({
      ...config,
      elements: {
        ...config.elements,
        [el]: { ...config.elements[el], [key]: value },
      },
    });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-[0.2em] flex items-center gap-2">
          <Settings size={12} className="text-[var(--accent)]" />
          Template Engine
        </h2>
        <button
          onClick={onReset}
          className="p-1 hover:bg-[var(--accent-soft)] rounded text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
          title="Reset to Default">
          <RotateCcw size={12} />
        </button>
      </div>

      <div className="flex gap-1 p-1 bg-[var(--bg)] rounded-lg mb-4 border border-[var(--border)]/50">
        <button
          onClick={() => setActiveTab("design")}
          className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${activeTab === "design" ? "bg-[var(--accent-soft)] text-[var(--accent)] shadow-sm" : "text-[var(--muted)] hover:text-[var(--text)]"}`}>
          <Palette size={12} />
          Design
        </button>
        <button
          onClick={() => setActiveTab("layout")}
          className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${activeTab === "layout" ? "bg-[var(--accent-soft)] text-[var(--accent)] shadow-sm" : "text-[var(--muted)] hover:text-[var(--text)]"}`}>
          <Move size={12} />
          Layout
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-6">
        {activeTab === "design" ? (
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-[var(--muted)] uppercase flex items-center gap-2">
                <Type size={12} /> Typography
              </label>
              <div className="grid grid-cols-1 gap-2">
                {FONTS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => onChange({ ...config, font: f.id })}
                    className={`text-left px-3 py-2 rounded-lg border text-xs transition-all ${config.font === f.id ? "bg-[var(--accent-soft)] border-[var(--accent)]/50 text-[var(--accent)]" : "bg-[var(--bg)] border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/40"}`}>
                    {f.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-[var(--muted)] uppercase flex items-center gap-2">
                <Palette size={12} /> Presets
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_PALETTES.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => onChange({ ...config, colors: p })}
                    className={`text-left p-2 rounded-lg border text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${config.colors.primary === p.primary ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text)]" : "bg-[var(--bg)] border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/40"}`}>
                    <div
                      className={`w-3 h-3 rounded-full ${PALETTE_DOTS[p.name] ?? "bg-[var(--muted)]"}`}></div>
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 border-t border-[var(--border)] pt-4">
              <label className="text-[10px] font-bold text-[var(--muted)] uppercase">
                Palette controls
              </label>
              <div className="space-y-2">
                {[
                  { label: "Card Background", key: "secondary" },
                  { label: "Accent Color", key: "primary" },
                  { label: "Text Content", key: "text" },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between gap-4">
                    <span className="text-[11px] text-[var(--muted)]">
                      {item.label}
                    </span>
                    <input
                      type="color"
                      value={
                        config.colors[item.key as keyof CardConfig["colors"]]
                      }
                      onChange={(e) =>
                        updateColor(
                          item.key as keyof CardConfig["colors"],
                          e.target.value,
                        )
                      }
                      aria-label={item.label}
                      title={item.label}
                      className="w-10 h-6 bg-transparent border-none cursor-pointer rounded overflow-hidden"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {(
              Object.entries(config.elements) as [
                keyof CardConfig["elements"],
                any,
              ][]
            ).map(([key, value]) => (
              <div
                key={key}
                className="space-y-3 p-3 bg-[var(--bg)] rounded-xl border border-[var(--border)]">
                <label className="text-[10px] font-black text-[var(--accent)] uppercase tracking-widest block mb-2">
                  {key} control
                </label>
                <div className="space-y-4">
                  {[
                    { label: "POSITION X", key: "x", max: 400 },
                    { label: "POSITION Y", key: "y", max: 250 },
                    { label: "SCALE / SIZE", key: "size", max: 120 },
                  ].map((field) => (
                    <div key={field.key}>
                      <div className="flex justify-between text-[10px] text-[var(--muted)] mb-1">
                        <span>{field.label}</span>
                        <span>{value[field.key]}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={field.max}
                        value={value[field.key]}
                        onChange={(e) =>
                          updateElement(
                            key,
                            field.key,
                            parseInt(e.target.value),
                          )
                        }
                        aria-label={`${key} ${field.label}`}
                        title={`${key} ${field.label}`}
                        className="w-full accent-[var(--accent)] h-1 bg-[var(--border)] rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
