import { useState, useCallback } from "react";
import { Settings, RotateCcw, Layers, Library, Palette, Move } from "lucide-react";
import { CardConfig } from "../types";
import { DesignerTemplate, TemplateMeta } from "../types";
import TemplateDesigner from "./TemplateDesigner";
import TemplateLibrary from "./TemplateLibrary";
import {
  listTemplates,
  saveTemplate,
  loadTemplate,
  getActiveTemplateId,
  setActiveTemplateId,
  migrateCardConfigToDesignerTemplate,
} from "../lib/templateStore";

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

export default function TemplateEditor({ config, onChange, onReset }: TemplateEditorProps) {
  const [activeTab, setActiveTab] = useState<"design" | "layout" | "designer">("design");
  const [showLibrary, setShowLibrary] = useState(false);

  const [designerTemplate, setDesignerTemplate] = useState<DesignerTemplate | null>(() => {
    const activeId = getActiveTemplateId();
    if (activeId) {
      const saved = loadTemplate(activeId);
      if (saved) return saved;
    }
    const migrated = migrateCardConfigToDesignerTemplate("Default", config);
    return migrated;
  });

  const handleDesignerChange = useCallback(
    (tpl: DesignerTemplate) => {
      setDesignerTemplate(tpl);
      saveTemplate(tpl);
      setActiveTemplateId(tpl.id);
    },
    [],
  );

  const handleLoadTemplate = useCallback((tpl: DesignerTemplate) => {
    setDesignerTemplate(tpl);
    setActiveTemplateId(tpl.id);
    setShowLibrary(false);
  }, []);

  const updateColor = (key: keyof CardConfig["colors"], value: string) => {
    onChange({ ...config, colors: { ...config.colors, [key]: value } });
  };

  const updateElement = (el: keyof CardConfig["elements"], key: string, value: number | string) => {
    onChange({
      ...config,
      elements: {
        ...config.elements,
        [el]: { ...config.elements[el], [key]: value },
      },
    });
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

      <div className="mb-4 grid grid-cols-3 gap-1 rounded-lg border border-[var(--border)]/50 bg-[var(--bg)] p-1">
        {(["design", "layout", "designer"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all sm:gap-2 ${
              activeTab === tab
                ? "bg-[var(--accent-soft)] text-[var(--accent)] shadow-sm"
                : "text-[var(--muted)] hover:text-[var(--text)]"
            }`}>
            {tab === "design" ? <Palette size={12} /> : tab === "layout" ? <Move size={12} /> : <Layers size={12} />}
            <span className="truncate">{tab === "designer" ? "Designer" : tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
        {activeTab === "design" && (
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="eyebrow flex items-center gap-2">Typography</label>
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

            <div className="space-y-3">
              <label className="eyebrow flex items-center gap-2">Presets</label>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_PALETTES.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => onChange({ ...config, colors: p })}
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

            <div className="space-y-3 border-t border-[var(--border)] pt-4">
              <label className="eyebrow">Palette controls</label>
              <div className="space-y-2">
                {[
                  { label: "Card Background", key: "secondary" },
                  { label: "Accent Color", key: "primary" },
                  { label: "Text Content", key: "text" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between gap-4">
                    <span className="text-[11px] text-[var(--muted)]">{item.label}</span>
                    <input
                      type="color"
                      value={config.colors[item.key as keyof CardConfig["colors"]]}
                      onChange={(e) => updateColor(item.key as keyof CardConfig["colors"], e.target.value)}
                      aria-label={item.label}
                      className="h-6 w-10 cursor-pointer overflow-hidden rounded border-none bg-transparent"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "layout" && (
          <div className="space-y-4">
            {(Object.entries(config.elements) as [keyof CardConfig["elements"], any][]).map(([key, value]) => (
              <div key={key} className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3">
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-[var(--accent)]">
                  {key} control
                </label>
                <div className="space-y-4">
                  {[
                    { label: "POSITION X", key: "x", max: 400 },
                    { label: "POSITION Y", key: "y", max: 250 },
                    { label: "SCALE / SIZE", key: "size", max: 120 },
                  ].map((field) => (
                    <div key={field.key}>
                      <div className="mb-1 flex justify-between text-[10px] text-[var(--muted)]">
                        <span>{field.label}</span>
                        <span>{value[field.key]}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={field.max}
                        value={value[field.key]}
                        onChange={(e) => updateElement(key, field.key, parseInt(e.target.value))}
                        aria-label={`${key} ${field.label}`}
                        className="field-range h-1 w-full cursor-pointer appearance-none rounded-lg bg-[var(--border)] accent-[var(--accent)]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "designer" && designerTemplate && (
          <div className="h-full">
            <p className="mb-3 text-xs text-[var(--muted)]">
              Drag layers on the canvas. Use the layer panel to reorder, toggle visibility, lock, or delete.
            </p>
            <TemplateDesigner
              template={designerTemplate}
              onChange={handleDesignerChange}
            />
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
