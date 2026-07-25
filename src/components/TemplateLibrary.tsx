import { useState, useRef } from "react";
import { Save, Upload, Download, Trash2, Edit3, X, Check } from "lucide-react";
import type { DesignerTemplate, TemplateMeta } from "../types";
import {
  listTemplates,
  saveTemplate,
  deleteTemplate,
  renameTemplate,
  exportTemplateAsJson,
  importTemplateFromJson,
  setActiveTemplateId,
  getActiveTemplateId,
  loadTemplate,
} from "../lib/templateStore";

interface TemplateLibraryProps {
  currentTemplate: DesignerTemplate;
  onLoadTemplate: (template: DesignerTemplate) => void;
  onClose: () => void;
}

export default function TemplateLibrary({
  currentTemplate,
  onLoadTemplate,
  onClose,
}: TemplateLibraryProps) {
  const [templates, setTemplates] = useState<TemplateMeta[]>(listTemplates);
  const [saveName, setSaveName] = useState(currentTemplate.name || "My Template");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [activeId, setActiveId] = useState<string | null>(getActiveTemplateId());
  const importRef = useRef<HTMLInputElement>(null);

  const refresh = () => setTemplates(listTemplates());

  const handleSave = () => {
    const now = new Date().toISOString();
    const updated: DesignerTemplate = {
      ...currentTemplate,
      name: saveName,
      updatedAt: now,
    };
    if (!updated.createdAt) updated.createdAt = now;
    saveTemplate(updated);
    setActiveTemplateId(updated.id);
    setActiveId(updated.id);
    refresh();
  };

  const handleLoad = (meta: TemplateMeta) => {
    const tpl = loadTemplate(meta.id);
    if (tpl) {
      onLoadTemplate(tpl);
      setActiveTemplateId(meta.id);
      setActiveId(meta.id);
    }
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Delete this template?")) return;
    deleteTemplate(id);
    if (activeId === id) {
      setActiveId(null);
      setActiveTemplateId(null);
    }
    refresh();
  };

  const handleRename = (id: string) => {
    if (editName.trim()) {
      renameTemplate(id, editName.trim());
    }
    setEditingId(null);
    refresh();
  };

  const handleExport = (meta: TemplateMeta) => {
    const tpl = loadTemplate(meta.id);
    if (tpl) exportTemplateAsJson(tpl);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const tpl = await importTemplateFromJson(file);
      saveTemplate(tpl);
      refresh();
    } catch (err) {
      alert(`Import failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
      <div className="flex max-h-[80vh] w-full max-w-lg flex-col rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-black text-[var(--text)]">Template Library</h2>
          <button className="secondary-button" onClick={onClose}>
            <X size={14} /> Close
          </button>
        </div>

        <div className="mb-4 rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4">
          <p className="mb-2 text-xs font-bold text-[var(--muted)]">
            Save Current Template
          </p>
          <div className="flex gap-2">
            <input
              className="field-input flex-1 py-2 text-sm"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="Template name"
            />
            <button className="primary-button" onClick={handleSave}>
              <Save size={14} /> Save
            </button>
          </div>
        </div>

        <div className="mb-4 flex gap-2">
          <button
            className="secondary-button text-sm"
            onClick={() => importRef.current?.click()}>
            <Upload size={14} /> Import JSON
          </button>
          <input
            ref={importRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImport}
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {templates.length === 0 ? (
            <p className="py-8 text-center text-sm text-[var(--muted)]">
              No saved templates yet. Design and save one above.
            </p>
          ) : (
            <div className="space-y-2">
              {templates.map((meta) => (
                <div
                  key={meta.id}
                  className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${activeId === meta.id ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[var(--border)] bg-[var(--bg)]"}`}>
                  <div className="min-w-0 flex-1">
                    {editingId === meta.id ? (
                      <div className="flex gap-1">
                        <input
                          className="field-input flex-1 py-1 text-xs"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleRename(meta.id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          autoFocus
                        />
                        <button
                          className="mini-button text-emerald-600"
                          onClick={() => handleRename(meta.id)}>
                          <Check size={12} />
                        </button>
                        <button
                          className="mini-button"
                          onClick={() => setEditingId(null)}>
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="truncate text-sm font-bold text-[var(--text)]">
                          {meta.name}
                        </p>
                        <p className="text-[10px] text-[var(--muted)]">
                          Updated {new Date(meta.updatedAt).toLocaleDateString()}
                        </p>
                      </>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      className="mini-button"
                      onClick={() => handleLoad(meta)}
                      title="Load">
                      <Download size={12} />
                    </button>
                    <button
                      className="mini-button"
                      onClick={() => {
                        setEditingId(meta.id);
                        setEditName(meta.name);
                      }}
                      title="Rename">
                      <Edit3 size={12} />
                    </button>
                    <button
                      className="mini-button"
                      onClick={() => handleExport(meta)}
                      title="Export JSON">
                      <Upload size={12} />
                    </button>
                    <button
                      className="mini-button text-red-500"
                      onClick={() => handleDelete(meta.id)}
                      title="Delete">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
