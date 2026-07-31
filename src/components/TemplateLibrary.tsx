import { useState, useRef } from "react";
import { Save, Upload, Download, Trash2, Edit3, X, Check, Copy } from "lucide-react";
import { useToast } from "./Toast";
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
  const { toast } = useToast();
  const [templates, setTemplates] = useState<TemplateMeta[]>(() => {
    try { return listTemplates(); } catch { return []; }
  });
  const [saveName, setSaveName] = useState(currentTemplate.name || "My Template");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [activeId, setActiveId] = useState<string | null>(getActiveTemplateId());
  const [selectedId, setSelectedId] = useState<string | null>(() => getActiveTemplateId());
  const importRef = useRef<HTMLInputElement>(null);

  const refresh = () => setTemplates(listTemplates());

  const handleSave = (asNew: boolean) => {
    const now = new Date().toISOString();

    if (asNew) {
      const newId = crypto.randomUUID?.() ?? `template-${Date.now()}`;
      const updated: DesignerTemplate = {
        ...currentTemplate,
        id: newId,
        name: saveName.trim() || currentTemplate.name || "My Template",
        createdAt: now,
        updatedAt: now,
      };
      saveTemplate(updated);
      setActiveTemplateId(newId);
      setActiveId(newId);
      setSelectedId(newId);
      onLoadTemplate(updated);
      refresh();
      toast("Template saved as new", "success");
      return;
    }

    const existing = templates.find((t) => t.id === selectedId);
    const targetId = existing ? existing.id : currentTemplate.id;
    const updated: DesignerTemplate = {
      ...currentTemplate,
      id: targetId,
      name: existing ? existing.name : (saveName.trim() || currentTemplate.name || "My Template"),
      createdAt: existing ? existing.createdAt : (currentTemplate.createdAt || now),
      updatedAt: now,
    };
    saveTemplate(updated);
    setActiveTemplateId(targetId);
    setActiveId(targetId);
    setSelectedId(targetId);
    onLoadTemplate(updated);
    refresh();
    toast("Template saved", "success");
  };

  const handleSaveAsNew = () => {
    handleSave(true);
  };

  const handleSelectTemplate = (meta: TemplateMeta) => {
    setSelectedId(meta.id);
  };

  const handleLoad = (meta: TemplateMeta) => {
    const tpl = loadTemplate(meta.id);
    if (tpl) {
      onLoadTemplate(tpl);
      setActiveTemplateId(meta.id);
      setActiveId(meta.id);
      setSelectedId(meta.id);
      toast("Template loaded", "info");
    }
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Delete this template?")) return;
    deleteTemplate(id);
    if (activeId === id) {
      setActiveId(null);
      setActiveTemplateId(null);
    }
    if (selectedId === id) {
      setSelectedId(null);
    }
    refresh();
    toast("Template deleted", "info");
  };

  const handleRename = (id: string) => {
    if (editName.trim()) {
      renameTemplate(id, editName.trim());
    }
    setEditingId(null);
    refresh();
    toast("Template renamed", "success");
  };

  const handleExport = (meta: TemplateMeta) => {
    const tpl = loadTemplate(meta.id);
    if (tpl) {
      exportTemplateAsJson(tpl);
      toast("Template exported", "success");
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const tpl = await importTemplateFromJson(file);
      saveTemplate(tpl);
      refresh();
      toast("Template imported", "success");
    } catch (err) {
      alert(`Import failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-2xl sm:p-6">
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
            <p className="mb-2 text-[10px] text-[var(--muted)]">
              Tap a template below to select it — Save overwrites the selected template. Save As New creates a copy.
            </p>
            <div className="flex gap-2">
              <input
                className="field-input flex-1 py-2 text-sm"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Template name"
              />
              <button className="primary-button" onClick={() => handleSave(false)}>
                <Save size={14} /> Save
              </button>
              <button className="secondary-button" onClick={handleSaveAsNew} title="Save as new template">
                <Copy size={14} /> Save As New
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
                  onClick={() => handleSelectTemplate(meta)}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${selectedId === meta.id ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[var(--border)] bg-[var(--bg)] hover:border-[var(--accent)]/40"}`}>
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
