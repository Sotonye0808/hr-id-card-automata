import { DesignerTemplate, UserData, EmployeeImageTransform, EmployeeImageCrop } from "../types";
import { renderTransformedImage } from "./employeeStore";

export interface RenderOptions {
  side?: "front" | "back";
  scale?: number;
}

export async function renderDesignerTemplateToCanvas(
  template: DesignerTemplate,
  data: UserData,
  options: RenderOptions = {},
): Promise<HTMLCanvasElement> {
  const { side = "front", scale = 2 } = options;
  const layers = side === "back" && template.backLayers
    ? template.backLayers
    : template.layers;
  const sorted = [...layers].sort((a, b) => a.zIndex - b.zIndex);

  const canvas = document.createElement("canvas");
  canvas.width = template.canvasWidth * scale;
  canvas.height = template.canvasHeight * scale;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas 2D context");

  ctx.scale(scale, scale);
  ctx.fillStyle = template.canvasColor;
  ctx.fillRect(0, 0, template.canvasWidth, template.canvasHeight);

  let renderedImageUrl: string | null = null;
  if (data.imageUrl) {
    try {
      renderedImageUrl = await renderTransformedImage(
        data.imageUrl,
        data.imageTransform,
        template.canvasWidth * 2,
        template.canvasHeight * 2,
        data.imageCrop,
      );
    } catch {
      renderedImageUrl = data.imageUrl;
    }
  }

  const imgCache = new Map<string, HTMLImageElement>();

  async function loadImage(src: string): Promise<HTMLImageElement> {
    const cached = imgCache.get(src);
    if (cached) return cached;
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        imgCache.set(src, img);
        resolve(img);
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = src;
    });
  }

  for (const layer of sorted) {
    if (!layer.visible) continue;

    ctx.save();
    ctx.globalAlpha = layer.opacity;
    ctx.translate(layer.x + layer.width / 2, layer.y + layer.height / 2);
    ctx.rotate((layer.rotation * Math.PI) / 180);
    ctx.translate(-(layer.x + layer.width / 2), -(layer.y + layer.height / 2));

    ctx.beginPath();
    ctx.rect(layer.x, layer.y, layer.width, layer.height);
    ctx.clip();

    switch (layer.type) {
      case "text": {
        const p = layer.props as any;
        const resolved = p.text
          .replace(/\{\{fullName\}\}/g, data.fullName)
          .replace(/\{\{department\}\}/g, data.department)
          .replace(/\{\{role\}\}/g, data.role)
          .replace(/\{\{idNumber\}\}/g, data.idNumber)
          .replace(/\{\{issueDate\}\}/g, data.issueDate);

        if (p.backgroundGradient && p.backgroundGradient.type !== "none") {
          applyGradient(ctx, layer.x, layer.y, layer.width, layer.height, p.backgroundGradient);
        }

        if (p.glassmorphism?.enabled) {
          ctx.fillStyle = `rgba(255,255,255,${p.glassmorphism.opacity ?? 0.3})`;
          ctx.fillRect(layer.x, layer.y, layer.width, layer.height);
        }

        if (p.borderWidth && p.borderWidth > 0) {
          ctx.strokeStyle = p.borderColor ?? "#111827";
          ctx.lineWidth = p.borderWidth;
          ctx.setLineDash(
            p.borderStyle === "dashed" ? [6, 3] : p.borderStyle === "dotted" ? [2, 2] : [],
          );
          ctx.strokeRect(layer.x, layer.y, layer.width, layer.height);
          ctx.setLineDash([]);
        }

        ctx.fillStyle = p.color ?? "#111827";
        ctx.font = `${p.fontWeight ?? "bold"} ${p.fontSize ?? 16}px ${p.fontFamily ?? "sans-serif"}`;
        ctx.textAlign = p.textAlign ?? "left";
        ctx.textBaseline = "middle";

        const lines = wrapText(ctx, resolved, layer.width - 8);
        const lineHeight = (p.fontSize ?? 16) * (p.lineHeight ?? 1.3);
        let textY = layer.y + layer.height / 2 - ((lines.length - 1) * lineHeight) / 2;
        for (const line of lines) {
          const textX = p.textAlign === "center"
            ? layer.x + layer.width / 2
            : p.textAlign === "right"
              ? layer.x + layer.width - 4
              : layer.x + 4;
          ctx.fillText(line, textX, textY);
          textY += lineHeight;
        }
        break;
      }
      case "image": {
        const p = layer.props as any;
        const src = renderedImageUrl || p.src;
        if (src) {
          try {
            const img = await loadImage(src);
            if (p.borderRadius && p.borderRadius > 0) {
              roundRect(ctx, layer.x, layer.y, layer.width, layer.height, p.borderRadius);
              ctx.clip();
            }
            const scaleX = layer.width / (p.objectFit === "contain" ? Math.max(img.width, 1) : img.width);
            const scaleY = layer.height / (p.objectFit === "contain" ? Math.max(img.height, 1) : img.height);
            const fitScale = p.objectFit === "cover" ? Math.max(scaleX, scaleY) : Math.min(scaleX, scaleY);
            const drawW = img.width * fitScale;
            const drawH = img.height * fitScale;
            const drawX = layer.x + (layer.width - drawW) / 2;
            const drawY = layer.y + (layer.height - drawH) / 2;
            ctx.drawImage(img, drawX, drawY, drawW, drawH);

            if (p.glassmorphism?.enabled) {
              ctx.fillStyle = `rgba(255,255,255,${p.glassmorphism.opacity ?? 0.3})`;
              ctx.fillRect(layer.x, layer.y, layer.width, layer.height);
            }

            if (p.borderWidth && p.borderWidth > 0) {
              ctx.strokeStyle = p.borderColor ?? "#111827";
              ctx.lineWidth = p.borderWidth;
              ctx.setLineDash(
                p.borderStyle === "dashed" ? [6, 3] : p.borderStyle === "dotted" ? [2, 2] : [],
              );
              ctx.strokeRect(layer.x, layer.y, layer.width, layer.height);
              ctx.setLineDash([]);
            }
          } catch {
            ctx.fillStyle = "#f3f4f6";
            ctx.fillRect(layer.x, layer.y, layer.width, layer.height);
            ctx.fillStyle = "#9ca3af";
            ctx.font = "12px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("Image", layer.x + layer.width / 2, layer.y + layer.height / 2);
          }
        } else {
          ctx.fillStyle = "#f3f4f6";
          ctx.fillRect(layer.x, layer.y, layer.width, layer.height);
          ctx.fillStyle = "#9ca3af";
          ctx.font = "12px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("No image", layer.x + layer.width / 2, layer.y + layer.height / 2);
        }
        break;
      }
      case "shape": {
        const p = layer.props as any;
        if (p.backgroundGradient && p.backgroundGradient.type !== "none") {
          applyGradient(ctx, layer.x, layer.y, layer.width, layer.height, p.backgroundGradient);
        } else {
          ctx.fillStyle = p.backgroundColor ?? "#0f766e";
          ctx.fillRect(layer.x, layer.y, layer.width, layer.height);
        }

        if (p.glassmorphism?.enabled) {
          ctx.fillStyle = `rgba(255,255,255,${p.glassmorphism.opacity ?? 0.3})`;
          ctx.fillRect(layer.x, layer.y, layer.width, layer.height);
        }

        if (p.borderWidth > 0) {
          ctx.strokeStyle = p.borderColor;
          ctx.lineWidth = p.borderWidth;
          ctx.setLineDash(
            p.borderStyle === "dashed" ? [6, 3] : p.borderStyle === "dotted" ? [2, 2] : [],
          );
          if (p.borderRadius > 0) {
            roundRect(ctx, layer.x, layer.y, layer.width, layer.height, p.borderRadius);
            ctx.stroke();
          } else {
            ctx.strokeRect(layer.x, layer.y, layer.width, layer.height);
          }
          ctx.setLineDash([]);
        }
        break;
      }
      case "barcode": {
        const p = layer.props as any;
        ctx.fillStyle = p.bgColor ?? "#FFFFFF";
        ctx.fillRect(layer.x, layer.y, layer.width, layer.height);
        ctx.fillStyle = p.color ?? "#000000";
        ctx.font = "10px monospace";
        ctx.textAlign = "center";
        ctx.fillText(`[${p.format}] ${p.value ?? ""}`, layer.x + layer.width / 2, layer.y + layer.height / 2);
        break;
      }
    }

    ctx.restore();
  }

  return canvas;
}

function applyGradient(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  grad: { type: string; angle: number; colors: string[] },
) {
  let gradient: CanvasGradient;
  if (grad.type === "radial") {
    gradient = ctx.createRadialGradient(x + w / 2, y + h / 2, 0, x + w / 2, y + h / 2, Math.max(w, h) / 2);
  } else {
    const angleRad = ((grad.angle ?? 0) * Math.PI) / 180;
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);
    const cx = x + w / 2;
    const cy = y + h / 2;
    const len = Math.sqrt(w * w + h * h) / 2;
    gradient = ctx.createLinearGradient(
      cx - cos * len, cy - sin * len,
      cx + cos * len, cy + sin * len,
    );
  }
  grad.colors.forEach((c, i) => gradient.addColorStop(i / Math.max(grad.colors.length - 1, 1), c));
  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, w, h);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  if (!text) return [""];
  const words = text.split(/\s+/);
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
