import type { DesignerTemplate, TemplateLayer, UserData, TextLayerProps, ImageLayerProps, ShapeLayerProps, BarcodeLayerProps, GradientConfig, GlassmorphismConfig } from "../types";

export async function renderDesignerTemplateToCanvas(
  template: DesignerTemplate,
  data: UserData,
  renderedImageUrl?: string | null
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = template.canvasWidth;
  canvas.height = template.canvasHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get 2D context");

  ctx.fillStyle = template.canvasColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const sorted = [...template.layers].sort((a, b) => a.zIndex - b.zIndex);

  for (const layer of sorted) {
    if (!layer.visible) continue;
    ctx.save();
    ctx.globalAlpha = layer.opacity;
    if (layer.rotation) {
      const cx = layer.x + layer.width / 2;
      const cy = layer.y + layer.height / 2;
      ctx.translate(cx, cy);
      ctx.rotate((layer.rotation * Math.PI) / 180);
      ctx.translate(-cx, -cy);
    }
    await renderLayerToContext(ctx, layer, data, renderedImageUrl);
    ctx.restore();
  }

  return canvas;
}

export async function renderDesignerTemplateSideToCanvas(
  template: DesignerTemplate,
  data: UserData,
  side: "front" | "back",
  renderedImageUrl?: string | null
): Promise<HTMLCanvasElement> {
  const layers = side === "back" && template.backLayers ? template.backLayers : template.layers;
  const sideTemplate: DesignerTemplate = { ...template, layers };
  return renderDesignerTemplateToCanvas(sideTemplate, data, renderedImageUrl);
}

async function renderLayerToContext(
  ctx: CanvasRenderingContext2D,
  layer: TemplateLayer,
  data: UserData,
  renderedImageUrl?: string | null
): Promise<void> {
  switch (layer.type) {
    case "text":
      renderTextLayer(ctx, layer, data);
      break;
    case "image":
      await renderImageLayer(ctx, layer, renderedImageUrl);
      break;
    case "shape":
      renderShapeLayer(ctx, layer);
      break;
    case "barcode":
      renderBarcodeLayer(ctx, layer);
      break;
  }
}

function resolveTemplateText(text: string, data: UserData): string {
  return text
    .replace(/\{\{fullName\}\}/g, data.fullName)
    .replace(/\{\{department\}\}/g, data.department)
    .replace(/\{\{role\}\}/g, data.role)
    .replace(/\{\{idNumber\}\}/g, data.idNumber)
    .replace(/\{\{issueDate\}\}/g, data.issueDate);
}

function renderTextLayer(ctx: CanvasRenderingContext2D, layer: TemplateLayer, data: UserData): void {
  const p = layer.props as TextLayerProps;
  const text = resolveTemplateText(p.text, data);

  const x = layer.x;
  const y = layer.y;
  const w = layer.width;
  const h = layer.height;

  if (p.backgroundGradient && p.backgroundGradient.type !== "none") {
    applyGradientToCtx(ctx, p.backgroundGradient, x, y, w, h);
    ctx.fillRect(x, y, w, h);
  }

  if (p.glassmorphism?.enabled) {
    ctx.fillStyle = `rgba(255,255,255,${p.glassmorphism.opacity})`;
    ctx.fillRect(x, y, w, h);
  }

  if (p.borderWidth && p.borderWidth > 0) {
    ctx.strokeStyle = p.borderColor ?? "#111827";
    ctx.lineWidth = p.borderWidth;
    setLineDash(ctx, p.borderStyle ?? "solid");
    ctx.strokeRect(x, y, w, h);
    ctx.setLineDash([]);
  }

  ctx.font = `${p.fontWeight ?? "normal"} ${p.fontSize}px ${p.fontFamily}`;
  ctx.fillStyle = p.color;
  ctx.textBaseline = "middle";

  let alignX = x + 4;
  if (p.textAlign === "center") alignX = x + w / 2;
  else if (p.textAlign === "right") alignX = x + w - 4;

  const lines = wrapText(ctx, text, w - 8);
  const lineHeight = p.fontSize * (p.lineHeight ?? 1.3);
  let cursorY = y + 4 + p.fontSize / 2;

  for (const line of lines) {
    if (cursorY > y + h) break;
    if (p.textAlign === "center") {
      ctx.textAlign = "center";
      ctx.fillText(line, alignX, cursorY);
    } else if (p.textAlign === "right") {
      ctx.textAlign = "right";
      ctx.fillText(line, alignX, cursorY);
    } else {
      ctx.textAlign = "left";
      ctx.fillText(line, alignX, cursorY);
    }
    cursorY += lineHeight;
  }
}

async function renderImageLayer(ctx: CanvasRenderingContext2D, layer: TemplateLayer, renderedImageUrl?: string | null): Promise<void> {
  const p = layer.props as ImageLayerProps;
  const src = renderedImageUrl || p.src;
  if (!src) {
    ctx.fillStyle = "#f3f4f6";
    ctx.fillRect(layer.x, layer.y, layer.width, layer.height);
    ctx.fillStyle = "#9ca3af";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("No image", layer.x + layer.width / 2, layer.y + layer.height / 2);
    return;
  }

  try {
    const img = await loadImage(src);
    ctx.save();
    clipRoundRect(ctx, layer.x, layer.y, layer.width, layer.height, p.borderRadius);

    if (p.glassmorphism?.enabled) {
      ctx.fillStyle = `rgba(255,255,255,${p.glassmorphism.opacity})`;
      ctx.fillRect(layer.x, layer.y, layer.width, layer.height);
    }

    const sx = layer.x;
    const sy = layer.y;
    const sw = layer.width;
    const sh = layer.height;

    if (p.objectFit === "cover") {
      const scale = Math.max(sw / img.naturalWidth, sh / img.naturalHeight);
      const iw = img.naturalWidth * scale;
      const ih = img.naturalHeight * scale;
      const ix = sx + (sw - iw) / 2;
      const iy = sy + (sh - ih) / 2;
      ctx.drawImage(img, ix, iy, iw, ih);
    } else if (p.objectFit === "contain") {
      const scale = Math.min(sw / img.naturalWidth, sh / img.naturalHeight);
      const iw = img.naturalWidth * scale;
      const ih = img.naturalHeight * scale;
      const ix = sx + (sw - iw) / 2;
      const iy = sy + (sh - ih) / 2;
      ctx.drawImage(img, ix, iy, iw, ih);
    } else {
      ctx.drawImage(img, sx, sy, sw, sh);
    }

    ctx.restore();

    if (p.borderWidth && p.borderWidth > 0) {
      ctx.strokeStyle = p.borderColor ?? "#111827";
      ctx.lineWidth = p.borderWidth;
      setLineDash(ctx, p.borderStyle ?? "solid");
      clipRoundRect(ctx, layer.x, layer.y, layer.width, layer.height, p.borderRadius);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  } catch {
    ctx.fillStyle = "#f3f4f6";
    ctx.fillRect(layer.x, layer.y, layer.width, layer.height);
    ctx.fillStyle = "#9ca3af";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Image error", layer.x + layer.width / 2, layer.y + layer.height / 2);
  }
}

function renderShapeLayer(ctx: CanvasRenderingContext2D, layer: TemplateLayer): void {
  const p = layer.props as ShapeLayerProps;
  const x = layer.x;
  const y = layer.y;
  const w = layer.width;
  const h = layer.height;

  ctx.save();

  if (p.shapeType === "circle") {
    const cx = x + w / 2;
    const cy = y + h / 2;
    const r = Math.min(w, h) / 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.closePath();
    if (p.backgroundGradient && p.backgroundGradient.type !== "none") {
      applyGradientToCtx(ctx, p.backgroundGradient, x, y, w, h);
    } else {
      ctx.fillStyle = p.backgroundColor;
    }
    ctx.fill();
    if (p.borderWidth > 0) {
      ctx.strokeStyle = p.borderColor;
      ctx.lineWidth = p.borderWidth;
      ctx.stroke();
    }
  } else if (p.shapeType === "line") {
    ctx.strokeStyle = p.backgroundColor;
    ctx.lineWidth = p.borderWidth || 2;
    ctx.beginPath();
    ctx.moveTo(x, y + h / 2);
    ctx.lineTo(x + w, y + h / 2);
    ctx.stroke();
  } else {
    if (p.borderRadius > 0) {
      clipRoundRect(ctx, x, y, w, h, p.borderRadius);
    }
    if (p.backgroundGradient && p.backgroundGradient.type !== "none") {
      applyGradientToCtx(ctx, p.backgroundGradient, x, y, w, h);
      ctx.fillRect(x, y, w, h);
    } else {
      ctx.fillStyle = p.backgroundColor;
      ctx.fillRect(x, y, w, h);
    }
    if (p.borderWidth > 0) {
      ctx.strokeStyle = p.borderColor;
      ctx.lineWidth = p.borderWidth;
      setLineDash(ctx, p.borderStyle ?? "solid");
      if (p.borderRadius > 0) {
        ctx.beginPath();
        roundRectPath(ctx, x, y, w, h, p.borderRadius);
        ctx.stroke();
      } else {
        ctx.strokeRect(x, y, w, h);
      }
      ctx.setLineDash([]);
    }
  }

  ctx.restore();
}

function renderBarcodeLayer(ctx: CanvasRenderingContext2D, layer: TemplateLayer): void {
  const p = layer.props as BarcodeLayerProps;
  const x = layer.x;
  const y = layer.y;
  const w = layer.width;
  const h = layer.height;

  ctx.fillStyle = p.bgColor;
  ctx.fillRect(x, y, w, h);

  ctx.fillStyle = p.color;
  ctx.font = `bold ${Math.min(14, h * 0.3)}px monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const label = `[${p.format}] ${p.value}`;
  ctx.fillText(label, x + w / 2, y + h / 2);

  ctx.strokeStyle = p.color;
  ctx.lineWidth = 1;
  for (let i = 0; i < w; i += 4) {
    const bx = x + i;
    ctx.beginPath();
    ctx.moveTo(bx, y + h * 0.15);
    ctx.lineTo(bx, y + h * 0.85);
    ctx.stroke();
  }
}

function applyGradientToCtx(ctx: CanvasRenderingContext2D, grad: GradientConfig, x: number, y: number, w: number, h: number): void {
  let gradient: CanvasGradient;
  if (grad.type === "radial") {
    gradient = ctx.createRadialGradient(x + w / 2, y + h / 2, 0, x + w / 2, y + h / 2, Math.max(w, h) / 2);
  } else {
    const angleRad = ((grad.angle ?? 0) * Math.PI) / 180;
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);
    const len = Math.abs(w * cos) + Math.abs(h * sin);
    const cx = x + w / 2;
    const cy = y + h / 2;
    const sx = cx - (len / 2) * cos;
    const sy = cy - (len / 2) * sin;
    const ex = cx + (len / 2) * cos;
    const ey = cy + (len / 2) * sin;
    gradient = ctx.createLinearGradient(sx, sy, ex, ey);
  }
  grad.colors.forEach((color, i) => {
    gradient.addColorStop(i / Math.max(grad.colors.length - 1, 1), color);
  });
  ctx.fillStyle = gradient;
}

function clipRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  roundRectPath(ctx, x, y, w, h, r);
  ctx.clip();
}

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  r = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + h - r);
  ctx.quadraticCurveTo(x, y + r, x + r, y);
  ctx.closePath();
}

function setLineDash(ctx: CanvasRenderingContext2D, style: string): void {
  if (style === "dashed") ctx.setLineDash([6, 4]);
  else if (style === "dotted") ctx.setLineDash([2, 2]);
  else ctx.setLineDash([]);
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  if (!text) return [""];
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [text];
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = src;
  });
}
