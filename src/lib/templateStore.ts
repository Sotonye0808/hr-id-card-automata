import { DesignerTemplate, TemplateMeta } from "../types";

const TEMPLATES_KEY = "hr-id-card-automata.templates";
const ACTIVE_TEMPLATE_KEY = "hr-id-card-automata.active-template";

export function getConsented(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("hr-id-card-automata.consent") === "true";
}

function checkConsent(): boolean {
  if (!getConsented()) {
    return false;
  }
  return true;
}

export function listTemplates(): TemplateMeta[] {
  if (!checkConsent()) return [];
  const raw = localStorage.getItem(TEMPLATES_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as TemplateMeta[];
  } catch {
    return [];
  }
}

export function saveTemplateMeta(meta: TemplateMeta): void {
  if (!checkConsent()) return;
  const list = listTemplates();
  const idx = list.findIndex((t) => t.id === meta.id);
  if (idx >= 0) {
    list[idx] = meta;
  } else {
    list.push(meta);
  }
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(list));
}

export function deleteTemplateMeta(id: string): void {
  if (!checkConsent()) return;
  const list = listTemplates().filter((t) => t.id !== id);
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(list));
  const active = getActiveTemplateId();
  if (active === id) {
    localStorage.removeItem(ACTIVE_TEMPLATE_KEY);
  }
}

export function renameTemplate(id: string, name: string): void {
  if (!checkConsent()) return;
  const list = listTemplates();
  const entry = list.find((t) => t.id === id);
  if (entry) {
    entry.name = name;
    entry.updatedAt = new Date().toISOString();
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(list));
  }
}

export function saveTemplate(template: DesignerTemplate): void {
  if (!checkConsent()) return;
  const key = `hr-id-card-automata.template.${template.id}`;
  localStorage.setItem(key, JSON.stringify(template));
  const meta: TemplateMeta = {
    id: template.id,
    name: template.name,
    description: template.description,
    createdAt: template.createdAt,
    updatedAt: template.updatedAt,
    thumbnailUrl: null,
  };
  saveTemplateMeta(meta);
}

export function loadTemplate(id: string): DesignerTemplate | null {
  if (!checkConsent()) return null;
  const key = `hr-id-card-automata.template.${id}`;
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DesignerTemplate;
  } catch {
    return null;
  }
}

export function deleteTemplate(id: string): void {
  if (!checkConsent()) return;
  const key = `hr-id-card-automata.template.${id}`;
  localStorage.removeItem(key);
  deleteTemplateMeta(id);
}

export function getActiveTemplateId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACTIVE_TEMPLATE_KEY);
}

export function setActiveTemplateId(id: string | null): void {
  if (id) {
    localStorage.setItem(ACTIVE_TEMPLATE_KEY, id);
  } else {
    localStorage.removeItem(ACTIVE_TEMPLATE_KEY);
  }
}

export function exportTemplateAsJson(template: DesignerTemplate): void {
  const blob = new Blob([JSON.stringify(template, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${template.name.replace(/\s+/g, "-").toLowerCase()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importTemplateFromJson(
  file: File,
): Promise<DesignerTemplate> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const template = JSON.parse(reader.result as string) as DesignerTemplate;
        if (!template.id || !template.layers) {
          reject(new Error("Invalid template JSON"));
          return;
        }
        resolve(template);
      } catch {
        reject(new Error("Invalid JSON file"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

export function migrateCardConfigToDesignerTemplate(
  name: string,
  config: { font: string; colors: { primary: string; secondary: string; text: string; accent: string }; elements: Record<string, { x: number; y: number; size: number; weight?: string; rounded?: number }> },
): DesignerTemplate {
  const id = crypto.randomUUID?.() ?? `template-${Date.now()}`;
  const now = new Date().toISOString();
  const layers: import("../types").TemplateLayer[] = [
    {
      id: `${id}-title`,
      type: "text",
      name: "Title",
      x: config.elements.title?.x ?? 240,
      y: config.elements.title?.y ?? 24,
      width: 300,
      height: 40,
      rotation: 0,
      zIndex: 2,
      visible: true,
      locked: false,
      opacity: 1,
      props: {
        text: "Employee Name",
        fontFamily: config.font ?? "font-sans",
        fontSize: config.elements.title?.size ?? 20,
        fontWeight: config.elements.title?.weight ?? "black",
        color: config.colors.text ?? "#111827",
        textAlign: "left",
        lineHeight: 1.2,
        letterSpacing: 0,
      },
    },
    {
      id: `${id}-subtitle`,
      type: "text",
      name: "Subtitle",
      x: config.elements.subtitle?.x ?? 240,
      y: config.elements.subtitle?.y ?? 54,
      width: 300,
      height: 30,
      rotation: 0,
      zIndex: 2,
      visible: true,
      locked: false,
      opacity: 1,
      props: {
        text: "Department • Role",
        fontFamily: config.font ?? "font-sans",
        fontSize: config.elements.subtitle?.size ?? 12,
        fontWeight: config.elements.subtitle?.weight ?? "medium",
        color: config.colors.text ?? "#111827",
        textAlign: "left",
        lineHeight: 1.3,
        letterSpacing: 0,
      },
    },
    {
      id: `${id}-badge`,
      type: "text",
      name: "Badge",
      x: config.elements.badge?.x ?? 16,
      y: config.elements.badge?.y ?? 140,
      width: 200,
      height: 20,
      rotation: 0,
      zIndex: 2,
      visible: true,
      locked: false,
      opacity: 1,
      props: {
        text: "EMP-001",
        fontFamily: config.font ?? "font-sans",
        fontSize: config.elements.badge?.size ?? 10,
        fontWeight: config.elements.badge?.weight ?? "bold",
        color: config.colors.accent ?? "#0f4761",
        textAlign: "left",
        lineHeight: 1.2,
        letterSpacing: 0,
      },
    },
    {
      id: `${id}-avatar`,
      type: "image",
      name: "Avatar",
      x: config.elements.avatar?.x ?? 16,
      y: config.elements.avatar?.y ?? 16,
      width: config.elements.avatar?.size ?? 110,
      height: config.elements.avatar?.size ?? 110,
      rotation: 0,
      zIndex: 1,
      visible: true,
      locked: false,
      opacity: 1,
      props: {
        src: null,
        objectFit: "cover",
        borderRadius: config.elements.avatar?.rounded ?? 4,
      },
    },
  ];

  return {
    id,
    name,
    description: "Migrated from legacy template",
    canvasWidth: 920,
    canvasHeight: 520,
    canvasColor: config.colors.secondary ?? "#FFFFFF",
    layers,
    createdAt: now,
    updatedAt: now,
  };
}
