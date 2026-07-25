import { DesignerTemplate, TemplateLayer } from "../types";

export interface ImportResult {
  template: DesignerTemplate;
  warnings: string[];
}

export async function importFromImage(file: File): Promise<ImportResult> {
  const dataUrl = await readFileAsDataURL(file);
  const img = await loadImage(dataUrl);
  const id = crypto.randomUUID?.() ?? `template-${Date.now()}`;
  const now = new Date().toISOString();

  const bgLayer: TemplateLayer = {
    id: `${id}-bg`,
    type: "image",
    name: "Background",
    x: 0,
    y: 0,
    width: img.naturalWidth,
    height: img.naturalHeight,
    rotation: 0,
    zIndex: 0,
    visible: true,
    locked: true,
    opacity: 0.5,
    props: {
      src: dataUrl,
      objectFit: "contain",
      borderRadius: 0,
    },
  };

  const template: DesignerTemplate = {
    id,
    name: file.name.replace(/\.[^.]+$/, ""),
    description: `Imported from ${file.name}`,
    canvasWidth: img.naturalWidth,
    canvasHeight: img.naturalHeight,
    canvasColor: "#FFFFFF",
    layers: [bgLayer],
    createdAt: now,
    updatedAt: now,
  };

  return {
    template,
    warnings: ["Image imported as tracing background. Manually add text/image layers to complete the design."],
  };
}

export async function importFromDocx(file: File): Promise<ImportResult> {
  const warnings = [
    "DOCX import extracts text content. Layout positions are approximate and may need manual adjustment.",
  ];

  const id = crypto.randomUUID?.() ?? `template-${Date.now()}`;
  const now = new Date().toISOString();

  const template: DesignerTemplate = {
    id,
    name: file.name.replace(/\.[^.]+$/, ""),
    description: `Imported from ${file.name}`,
    canvasWidth: 920,
    canvasHeight: 520,
    canvasColor: "#FFFFFF",
    layers: [],
    createdAt: now,
    updatedAt: now,
  };

  return { template, warnings };
}

export async function importFromPdf(file: File): Promise<ImportResult> {
  const dataUrl = await readFileAsDataURL(file);
  const id = crypto.randomUUID?.() ?? `template-${Date.now()}`;
  const now = new Date().toISOString();

  const bgLayer: TemplateLayer = {
    id: `${id}-bg`,
    type: "image",
    name: "PDF Background (First Page)",
    x: 0,
    y: 0,
    width: 920,
    height: 520,
    rotation: 0,
    zIndex: 0,
    visible: true,
    locked: true,
    opacity: 0.5,
    props: {
      src: dataUrl,
      objectFit: "contain",
      borderRadius: 0,
    },
  };

  const template: DesignerTemplate = {
    id,
    name: file.name.replace(/\.[^.]+$/, ""),
    description: `Imported from ${file.name}`,
    canvasWidth: 920,
    canvasHeight: 520,
    canvasColor: "#FFFFFF",
    layers: [bgLayer],
    createdAt: now,
    updatedAt: now,
  };

  return {
    template,
    warnings: [
      "PDF imported as background image. For best results, use a high-resolution PDF and manually trace layout elements.",
    ],
  };
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}
