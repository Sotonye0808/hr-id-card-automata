import { useState, useCallback, useMemo } from "react";
import { Settings, RotateCcw, Library, Palette, Move } from "lucide-react";
import { CardConfig } from "../types";
import { DesignerTemplate } from "../types";
import TemplateLibrary from "./TemplateLibrary";
import {
  saveTemplate,
  getActiveTemplateId,
  setActiveTemplateId,
  migrateCardConfigToDesignerTemplate,
} from "../lib/templateStore";

interface TemplateEditorProps {
  config: CardConfig;
  onChange: (config: CardConfig) => void;
  onReset: () => void;
  designerTemplate?: DesignerTemplate | null;
  onDesignerTemplateChange?: (template: DesignerTemplate) => void;
}

const FONTS = [
  { id: "font-sans", name: "Inter (Sans)" },
  { id: "font-tech", name: "Space Grotesk" },
  { id: "font-mono", name: "JetBrains Mono" },
  { id: "font-serif", name: "Playfair Display" },
];

const PRESET_PALETTES = [
  { name: "Midnight", primary: "#3B82F6", secondary: "#1E293B", text: "#FFFFFF", accent: "#60A5FA" },
  { name: "Emerald", primary: "#10B981", secondary: "#064E3B", text: "#ECFDF5", accent: "#34D399" },
  { name: "Vulcan", primary: "#EF4444", secondary: "#450A0A", text: "#FEF2F2", accent: "#F87171" },
  { name: "Amethyst", primary: "#8B5CF6", secondary: "#2E1065", text: "#F5F3FF", accent: "#A78BFA" },
];

const PALETTE_COLORS: Record<string, string> = {
  Midnight: "bg-blue-500",
  Emerald: "bg-emerald-500",
  Vulcan: "bg-red-500",
  Amethyst: "bg-violet-500",
};

export default function TemplateEditor({ config, onChange, onReset, designerTemplate: externalDesignerTemplate, onDesignerTemplateChange }: TemplateEditorProps) {
  const [activeTab, setActiveTab] = useState<"design" | "layout">("design");
  const [showLibrary, setShowLibrary] = useState(false);

  const designerTemplate = useMemo(
    () => externalDesignerTemplate ?? migrateCardConfigToDesignerTemplate("Default", config),
    [externalDesignerTemplate, config],
  );

  const handleLoadTemplate = useCallback((tpl: DesignerTemplate) => {
    if (onDesignerTemplateChange) {
      onDesignerTemplateChange(tpl);
    } else {
      saveTemplate(tpl);
      setActiveTemplateId(tpl.id);
    }
    setShowLibrary(false);
  }, [onDesignerTemplateChange]);

  const updatePalette = (key: string, value: string) => {
    const updated: DesignerTemplate = {
      ...designerTemplate,
      canvasColor: key === "canvasColor" ? value : designerTemplate.canvasColor,
      layers: designerTemplate.layers.map((l) => {
        if (l.type === "text") {
          const p = { ...l.props as any };
          if (key === "text") p.color = value;
          return { ...l, props: p };
        }
        return l;
      }),
    };
    onDesignerTemplateChange?.(updated);
  };

  const updateCanvas = (patch: Partial<DesignerTemplate>) => {
    if (!onDesignerTemplateChange) return;
    onDesignerTemplateChange({ ...designerTemplate, ...patch });
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="eyebrow flex items-center gap-2">
          <Settings size={12} className="text-[var(--accent)]" />
          Template Engine
        </h2>
        <div className="flex items-center gap-1">
          <button
            className="mini-button"
            onClick={() => setShowLibrary(true)}
            title="Template Library">
            <Library size={12} />
          </button>
          <button
            onClick={onReset}
            className="mini-button"
            title="Reset to Default">
            <RotateCcw size={12} />
          </button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-1 rounded-lg border border-[var(--border)]/50 bg-[var(--bg)] p-1">
        {(["design", "layout"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all sm:gap-2 ${
              activeTab === tab
                ? "bg-[var(--accent-soft)] text-[var(--accent)] shadow-sm"
                : "text-[var(--muted)] hover:text-[var(--text)]"
            }`}>
            {tab === "design" ? <Palette size={12} /> : <Move size={12} />}
            <span className="truncate">{tab === "design" ? "Design" : "Canvas"}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
        {activeTab === "design" && (
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="eyebrow flex items-center gap-2">Canvas</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-[var(--muted)]">Width</label>
                  <input
                    type="number"
                    className="field-input mt-1 py-1.5 text-xs"
                    value={designerTemplate.canvasWidth}
                    onChange={(e) => updateCanvas({ canvasWidth: Math.max(200, Number(e.target.value)) })}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[var(--muted)]">Height</label>
                  <input
                    type="number"
                    className="field-input mt-1 py-1.5 text-xs"
                    value={designerTemplate.canvasHeight}
                    onChange={(e) => updateCanvas({ canvasHeight: Math.max(200, Number(e.target.value)) })}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[11px] text-[var(--muted)]">Canvas Color</span>
                <input
                  type="color"
                  value={designerTemplate.canvasColor}
                  onChange={(e) => updateCanvas({ canvasColor: e.target.value })}
                  aria-label="Canvas Color"
                  className="h-6 w-10 cursor-pointer overflow-hidden rounded border-none bg-transparent"
                />
              </div>
            </div>

            <div className="space-y-3 border-t border-[var(--border)] pt-4">
              <label className="eyebrow flex items-center gap-2">Typography (Legacy)</label>
              <div className="grid grid-cols-1 gap-2">
                {FONTS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => onChange({ ...config, font: f.id })}
                    className={`text-left rounded-lg border px-3 py-2 text-xs transition-all ${
                      config.font === f.id
                        ? "border-[var(--accent)]/50 bg-[var(--accent-soft)] text-[var(--accent)]"
                        : "border-[var(--border)] bg-[var(--bg)] text-[var(--muted)] hover:border-[var(--accent)]/40"
                    }`}>
                    {f.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 border-t border-[var(--border)] pt-4">
              <label className="eyebrow flex items-center gap-2">Presets</label>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_PALETTES.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => {
                      onChange({ ...config, colors: p });
                      updateCanvas({ canvasColor: p.secondary });
                    }}
                    className={`flex items-center gap-2 rounded-lg border p-2 text-left text-[10px] font-bold uppercase tracking-wider transition-all ${
                      config.colors.primary === p.primary
                        ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text)]"
                        : "border-[var(--border)] bg-[var(--bg)] text-[var(--muted)] hover:border-[var(--accent)]/40"
                    }`}>
                    <div className={`h-3 w-3 rounded-full ${PALETTE_COLORS[p.name] ?? "bg-[var(--muted)]"}`} />
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "layout" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3">
              <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-[var(--accent)]">
                Canvas Dimensions
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-[var(--muted)]">Width</label>
                  <input
                    type="number"
                    className="field-input mt-1 py-1.5 text-xs"
                    value={designerTemplate.canvasWidth}
                    onChange={(e) => updateCanvas({ canvasWidth: Math.max(200, Number(e.target.value)) })}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[var(--muted)]">Height</label>
                  <input
                    type="number"
                    className="field-input mt-1 py-1.5 text-xs"
                    value={designerTemplate.canvasHeight}
                    onChange={(e) => updateCanvas({ canvasHeight: Math.max(200, Number(e.target.value)) })}
                  />
                </div>
              </div>
            </div>

            <p className="text-xs text-[var(--muted)]">
              Use the canvas area on the right to select, drag, and resize layers. The layer panel there controls position, rotation, opacity, and per-layer properties.
            </p>
          </div>
        )}
      </div>

      {showLibrary && designerTemplate && (
        <TemplateLibrary
          currentTemplate={designerTemplate}
          onLoadTemplate={handleLoadTemplate}
          onClose={() => setShowLibrary(false)}
        />
      )}
    </div>
  );
}
