import type { DesignerTemplate, TemplateLayer, TextLayerProps, ImageLayerProps, ShapeLayerProps, BarcodeLayerProps, UserData } from "../types";

export function extractTemplateFields(template: DesignerTemplate): string[] {
  const fieldSet = new Set<string>();
  const allLayers = [...template.layers, ...(template.backLayers ?? [])];
  const regex = /\{\{(\w+)\}\}/g;

  for (const layer of allLayers) {
    if (layer.type === "text") {
      const p = layer.props as TextLayerProps;
      let match: RegExpExecArray | null;
      while ((match = regex.exec(p.text)) !== null) {
        fieldSet.add(match[1]);
      }
    }
  }

  return Array.from(fieldSet);
}

export function resolveText(template: string, data: UserData): string {
  return template
    .replace(/\{\{fullName\}\}/g, data.fullName)
    .replace(/\{\{department\}\}/g, data.department)
    .replace(/\{\{role\}\}/g, data.role)
    .replace(/\{\{idNumber\}\}/g, data.idNumber)
    .replace(/\{\{issueDate\}\}/g, data.issueDate)
    .replace(/\{\{(\w+)\}\}/g, (_, name) => data.extraFields?.[name] ?? "");
}

export function getLayerEmployeeValue(layer: TemplateLayer, data: UserData): string | null {
  if (layer.type === "text") {
    const key = `_tl_${layer.id}`;
    const override = data.extraFields?.[key];
    if (override !== undefined) return override;
    return (layer.props as TextLayerProps).text;
  }
  if (layer.type === "image") {
    const key = `_il_${layer.id}`;
    const override = data.extraFields?.[key];
    if (override) return override;
    return (layer.props as ImageLayerProps).src ?? null;
  }
  return null;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const chars = text.split("");
  let line = "";
  let lineY = y;

  for (const char of chars) {
    const testLine = line + char;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line.length > 0) {
      ctx.fillText(line, x, lineY);
      line = char;
      lineY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line.length > 0) {
    ctx.fillText(line, x, lineY);
  }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

export async function renderTemplateToCanvas(
  template: DesignerTemplate,
  data: UserData,
  side: "front" | "back",
  canvasWidth: number,
  canvasHeight: number,
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Cannot get canvas context");

  const layers = side === "back" && template.backLayers ? template.backLayers : template.layers;
  const sorted = [...layers].sort((a, b) => a.zIndex - b.zIndex);

  const scaleX = canvasWidth / template.canvasWidth;
  const scaleY = canvasHeight / template.canvasHeight;

  ctx.fillStyle = template.canvasColor;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  for (const layer of sorted) {
    if (!layer.visible) continue;

    const x = Math.round(layer.x * scaleX);
    const y = Math.round(layer.y * scaleY);
    const w = Math.round(layer.width * scaleX);
    const h = Math.round(layer.height * scaleY);

    ctx.save();
    ctx.globalAlpha = layer.opacity;

    if (layer.rotation) {
      const cx = x + w / 2;
      const cy = y + h / 2;
      ctx.translate(cx, cy);
      ctx.rotate((layer.rotation * Math.PI) / 180);
      ctx.translate(-cx, -cy);
    }

    switch (layer.type) {
      case "shape": {
        const p = layer.props as ShapeLayerProps;
        const gradConfig = p.backgroundGradient;
        if (gradConfig && gradConfig.type !== "none") {
          const grad = gradConfig.type === "linear"
            ? ctx.createLinearGradient(x, y, x + w, y + h)
            : ctx.createRadialGradient(x + w / 2, y + h / 2, 0, x + w / 2, y + h / 2, Math.max(w, h) / 2);
          gradConfig.colors.forEach((c, i) => grad.addColorStop(i / Math.max(gradConfig.colors.length - 1, 1), c));
          ctx.fillStyle = grad;
        } else {
          ctx.fillStyle = p.backgroundColor;
        }

        if (p.borderWidth > 0) {
          ctx.strokeStyle = p.borderColor;
          ctx.lineWidth = p.borderWidth;
        }

        if (p.shapeType === "circle") {
          ctx.beginPath();
          ctx.arc(x + w / 2, y + h / 2, Math.min(w, h) / 2, 0, Math.PI * 2);
          ctx.fill();
          if (p.borderWidth > 0) ctx.stroke();
        } else if (p.shapeType === "line") {
          ctx.strokeStyle = p.backgroundColor;
          ctx.lineWidth = p.borderWidth || 2;
          ctx.beginPath();
          ctx.moveTo(x, y + h / 2);
          ctx.lineTo(x + w, y + h / 2);
          ctx.stroke();
        } else {
          if (p.borderRadius > 0) {
            roundRect(ctx, x, y, w, h, p.borderRadius);
            ctx.fill();
            if (p.borderWidth > 0) ctx.stroke();
          } else {
            ctx.fillRect(x, y, w, h);
            if (p.borderWidth > 0) ctx.strokeRect(x, y, w, h);
          }
        }
        break;
      }

      case "text": {
        const p = layer.props as TextLayerProps;
        const layerValue = getLayerEmployeeValue(layer, data);
        const text = layerValue !== null ? resolveText(layerValue, data) : "";

        ctx.fillStyle = p.color;
        ctx.font = `${p.fontWeight} ${Math.round(p.fontSize * scaleY)}px ${p.fontFamily}`;
        ctx.textAlign = p.textAlign || "left";
        ctx.textBaseline = "top";

        let textX = x;
        if (ctx.textAlign === "center") textX = x + w / 2;
        else if (ctx.textAlign === "right") textX = x + w;

        const lineH = Math.round((p.fontSize * scaleY) * (p.lineHeight || 1.2));
        wrapText(ctx, text, textX, y, w, lineH);
        break;
      }

      case "image": {
        const p = layer.props as ImageLayerProps;
        let imageSrc = getLayerEmployeeValue(layer, data);

        if (!imageSrc && data.imageUrl) {
          imageSrc = data.imageUrl;
        }
        if (!imageSrc) {
          imageSrc = p.src;
        }

        if (imageSrc) {
          try {
            const img = await loadImage(imageSrc);

            if (p.borderRadius > 0) {
              ctx.save();
              roundRect(ctx, x, y, w, h, p.borderRadius);
              ctx.clip();
            }

            const sx = 0;
            const sy = 0;
            const sw = img.naturalWidth;
            const sh = img.naturalHeight;

            let dx = x;
            let dy = y;
            let dw = w;
            let dh = h;

            if (p.objectFit === "cover") {
              const imgRatio = sw / sh;
              const boxRatio = w / h;
              if (imgRatio > boxRatio) {
                dh = w / imgRatio;
                dy = y + (h - dh) / 2;
              } else {
                dw = h * imgRatio;
                dx = x + (w - dw) / 2;
              }
            } else if (p.objectFit === "contain") {
              const imgRatio = sw / sh;
              const boxRatio = w / h;
              if (imgRatio > boxRatio) {
                dw = w;
                dh = w / imgRatio;
                dy = y + (h - dh) / 2;
              } else {
                dh = h;
                dw = h * imgRatio;
                dx = x + (w - dw) / 2;
              }
            }

            ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);

            if (p.borderRadius > 0) {
              ctx.restore();
            }

            if (p.borderWidth && p.borderWidth > 0) {
              ctx.strokeStyle = p.borderColor || "#111827";
              ctx.lineWidth = p.borderWidth;
              if (p.borderRadius > 0) {
                roundRect(ctx, x, y, w, h, p.borderRadius);
                ctx.stroke();
              } else {
                ctx.strokeRect(x, y, w, h);
              }
            }
          } catch {
            ctx.fillStyle = "#e5e7eb";
            ctx.fillRect(x, y, w, h);
            ctx.fillStyle = "#9ca3af";
            ctx.font = `${Math.round(12 * scaleY)}px sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("Image error", x + w / 2, y + h / 2);
          }
        } else {
          ctx.fillStyle = "#e5e7eb";
          ctx.fillRect(x, y, w, h);
          ctx.fillStyle = "#9ca3af";
          ctx.font = `${Math.round(12 * scaleY)}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("No image", x + w / 2, y + h / 2);
        }
        break;
      }

      case "barcode": {
        const p = layer.props as BarcodeLayerProps;
        ctx.fillStyle = p.bgColor;
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = p.color;
        ctx.font = `${Math.round(14 * scaleY)}px monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const value = resolveText(p.value, data);
        ctx.fillText(`[${p.format}] ${value}`, x + w / 2, y + h / 2);
        break;
      }

      default:
        break;
    }

    ctx.restore();
  }

  return canvas;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

export async function renderTemplateToDataUrl(
  template: DesignerTemplate,
  data: UserData,
  side: "front" | "back",
  canvasWidth: number,
  canvasHeight: number,
): Promise<string> {
  const canvas = await renderTemplateToCanvas(template, data, side, canvasWidth, canvasHeight);
  return canvas.toDataURL("image/png");
}
