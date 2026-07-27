/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import { Database, ImageOff } from "lucide-react";
import { CardConfig, UserData, DesignerTemplate, TemplateLayer, TextLayerProps, ImageLayerProps, ShapeLayerProps } from "../types";
import { renderTransformedImage } from "../lib/employeeStore";

interface IDCardProps {
  config: CardConfig;
  data: UserData;
  designerTemplate?: DesignerTemplate;
}

const FONT_CLASSES: Record<string, string> = {
  "font-sans": "sheet-font-sans",
  "font-tech": "sheet-font-tech",
  "font-mono": "sheet-font-mono",
  "font-serif": "sheet-font-serif",
};

const THEME_CLASSES: Record<string, string> = {
  "#242424": "sheet-theme-paper",
  "#3B82F6": "sheet-theme-midnight",
  "#10B981": "sheet-theme-emerald",
  "#EF4444": "sheet-theme-vulcan",
  "#8B5CF6": "sheet-theme-amethyst",
};

export default function IDCard({ config, data, designerTemplate }: IDCardProps) {
  const themeClass =
    THEME_CLASSES[config.colors.primary] ?? THEME_CLASSES["#242424"];
  const fontClass = FONT_CLASSES[config.font] ?? FONT_CLASSES["font-sans"];
  const combinedRole = [data.department, data.role].filter(Boolean).join(" • ");
  const [renderedImageUrl, setRenderedImageUrl] = useState<string | null>(null);
  const [showBack, setShowBack] = useState(false);

  useEffect(() => {
    let active = true;

    if (!data.imageUrl) {
      setRenderedImageUrl(null);
      return () => {
        active = false;
      };
    }

    renderTransformedImage(
      data.imageUrl,
      data.imageTransform,
      1200,
      840,
      data.imageCrop,
    )
      .then((imageUrl) => {
        if (active) {
          setRenderedImageUrl(imageUrl);
        }
      })
      .catch(() => {
        if (active) {
          setRenderedImageUrl(data.imageUrl);
        }
      });

    return () => {
      active = false;
    };
  }, [
    data.imageCrop.height,
    data.imageCrop.width,
    data.imageCrop.x,
    data.imageCrop.y,
    data.imageTransform.offsetX,
    data.imageTransform.offsetY,
    data.imageTransform.scale,
    data.imageUrl,
  ]);

  const hasBack = designerTemplate?.hasBackSide && (designerTemplate.backLayers?.length ?? 0) > 0;

  if (designerTemplate && designerTemplate.layers.length > 0) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="w-full">
          <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
            {showBack ? "Back Side" : "Front Side"}
          </p>
          <DesignerIDCard
            template={designerTemplate}
            data={data}
            renderedImageUrl={renderedImageUrl}
            side={showBack ? "back" : "front"}
          />
        </div>
        {hasBack && (
          <button
            className="mini-button gap-2 px-4 py-2"
            onClick={() => setShowBack((s) => !s)}>
            {showBack ? "Show Front Side" : "Show Back Side"}
          </button>
        )}
        {hasBack && !showBack && (
          <div className="mt-1 w-full opacity-40">
            <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
              Back Side Preview
            </p>
            <DesignerIDCard
              template={designerTemplate}
              data={data}
              renderedImageUrl={renderedImageUrl}
              side="back"
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <article className={`sheet-frame ${themeClass} ${fontClass}`}>
      <div className="sheet-inner">
        <div className="space-y-2">
          <p className="sheet-eyebrow">ID CARDS TO BE PRINTED</p>
          <h3 className="sheet-title">{data.fullName || "Employee Name"}</h3>
          <p className="sheet-copy">
            Printable sheet generated from the current HR template.
          </p>
        </div>

        <table className="sheet-table">
          <tbody>
            <tr>
              <td className="sheet-cell sheet-cell-name">
                <p className="sheet-name">{data.fullName || "Employee Name"}</p>
              </td>
              <td className="sheet-cell sheet-cell-id">
                <p className="sheet-id">{data.idNumber || "EMP-001"}</p>
              </td>
              <td className="sheet-cell sheet-cell-role">
                <p className="sheet-role">
                  {combinedRole || "Department • Role"}
                </p>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="sheet-layout">
          <div className="sheet-photo">
            <div className="sheet-photo-stage">
              {renderedImageUrl ? (
                <img
                  src={renderedImageUrl}
                  alt={`${data.fullName} preview`}
                  className="sheet-photo-image"
                />
              ) : (
                <div className="sheet-photo-placeholder">
                  <div className="sheet-photo-icon">
                    <ImageOff size={42} />
                  </div>
                  <div>
                    <p className="sheet-photo-title">Photo placeholder</p>
                    <p className="sheet-photo-copy">
                      Upload an employee photo to preview the print layout.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="sheet-aside">
            <div className="sheet-card-block">
              <p className="sheet-label">Issue Date</p>
              <p className="sheet-value">{data.issueDate || "YYYY-MM-DD"}</p>
            </div>

            <div className="sheet-card-block">
              <p className="sheet-label">Department</p>
              <p className="sheet-value">
                {data.department || "Department name"}
              </p>
            </div>

            <div className="sheet-card-block">
              <p className="sheet-label">Built by S.D.</p>
              <a
                href="https://sotonye-dagogo.is-a.dev"
                target="_blank"
                rel="noreferrer noopener"
                className="sheet-link">
                View developer profile
              </a>
            </div>
          </div>
        </div>

        <div className="sheet-footer">
          <span className="font-mono">{data.idNumber || "EMP-001"}</span>
          <span className="sheet-footer-badge">
            <Database size={12} />
            Printable sample alignment
          </span>
        </div>
      </div>
    </article>
  );
}

function DesignerIDCard({ template, data, renderedImageUrl, side }: { template: DesignerTemplate; data: UserData; renderedImageUrl: string | null; side?: "front" | "back" }) {
  const layers = side === "back" && template.backLayers ? template.backLayers : template.layers;
  const sortedLayers = [...layers].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div className="w-full max-w-full overflow-auto">
      <div
        className="relative mx-auto overflow-hidden rounded-[28px] border"
        style={{
          width: template.canvasWidth,
          maxWidth: "100%",
          backgroundColor: template.canvasColor,
          borderColor: "#111827",
          aspectRatio: `${template.canvasWidth} / ${template.canvasHeight}`,
        }}>
        {sortedLayers.map((layer) => {
          if (!layer.visible) return null;
          return (
            <div
              key={layer.id}
              className="absolute"
              style={{
                left: layer.x,
                top: layer.y,
                width: layer.width,
                height: layer.height,
                zIndex: layer.zIndex,
                opacity: layer.opacity,
                transform: layer.rotation ? `rotate(${layer.rotation}deg)` : undefined,
              }}>
              <LayerRenderer layer={layer} data={data} renderedImageUrl={renderedImageUrl} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function resolveTextVariables(text: string, data: UserData): string {
  let resolved = text
    .replace(/\{\{fullName\}\}/g, data.fullName)
    .replace(/\{\{department\}\}/g, data.department)
    .replace(/\{\{role\}\}/g, data.role)
    .replace(/\{\{idNumber\}\}/g, data.idNumber)
    .replace(/\{\{issueDate\}\}/g, data.issueDate);
  if (data.customFields) {
    for (const [key, value] of Object.entries(data.customFields)) {
      resolved = resolved.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value ?? "");
    }
  }
  return resolved;
}

function LayerRenderer({ layer, data, renderedImageUrl }: { layer: TemplateLayer; data: UserData; renderedImageUrl: string | null }) {
  switch (layer.type) {
    case "text": {
      const p = layer.props as TextLayerProps;
      const resolved = resolveTextVariables(p.text, data);
      const bgStyle: React.CSSProperties = {};
      if (p.backgroundGradient && p.backgroundGradient.type !== "none") {
        const colors = p.backgroundGradient.colors.join(", ");
        bgStyle.background = p.backgroundGradient.type === "linear"
          ? `linear-gradient(${p.backgroundGradient.angle}deg, ${colors})`
          : `radial-gradient(circle, ${colors})`;
      }
      if (p.glassmorphism?.enabled) {
        bgStyle.backdropFilter = `blur(${p.glassmorphism.blur}px)`;
        bgStyle.WebkitBackdropFilter = `blur(${p.glassmorphism.blur}px)`;
      }
      return (
        <div
          className="flex h-full w-full items-center overflow-hidden px-1"
          style={{
            ...bgStyle,
            fontFamily: p.fontFamily,
            fontSize: p.fontSize,
            fontWeight: p.fontWeight,
            color: p.color,
            textAlign: p.textAlign,
            lineHeight: p.lineHeight,
            letterSpacing: p.letterSpacing,
            border: p.borderWidth && p.borderWidth > 0 ? `${p.borderWidth}px ${p.borderStyle ?? "solid"} ${p.borderColor ?? "#111827"}` : undefined,
          }}>
          <span className="truncate">{resolved}</span>
        </div>
      );
    }
    case "image": {
      const p = layer.props as ImageLayerProps;
      const src = renderedImageUrl || p.src;
      const imgStyle: React.CSSProperties = {};
      if (p.glassmorphism?.enabled) {
        imgStyle.backdropFilter = `blur(${p.glassmorphism.blur}px)`;
        imgStyle.WebkitBackdropFilter = `blur(${p.glassmorphism.blur}px)`;
      }
      if (src) {
        return (
          <img
            src={src}
            alt=""
            className="h-full w-full"
            style={{
              objectFit: p.objectFit,
              borderRadius: p.borderRadius,
              border: p.borderWidth && p.borderWidth > 0 ? `${p.borderWidth}px ${p.borderStyle ?? "solid"} ${p.borderColor ?? "#111827"}` : undefined,
              ...imgStyle,
            }}
          />
        );
      }
      return (
        <div className="flex h-full w-full items-center justify-center bg-gray-100 text-[10px] text-gray-400">
          <ImageOff size={20} />
        </div>
      );
    }
    case "shape": {
      const p = layer.props as ShapeLayerProps;
      const bgStyle: React.CSSProperties = {};
      if (p.backgroundGradient && p.backgroundGradient.type !== "none") {
        const colors = p.backgroundGradient.colors.join(", ");
        if (p.backgroundGradient.type === "linear") {
          bgStyle.background = `linear-gradient(${p.backgroundGradient.angle}deg, ${colors})`;
        } else {
          bgStyle.background = `radial-gradient(circle, ${colors})`;
        }
      } else {
        bgStyle.backgroundColor = p.backgroundColor;
      }
      if (p.glassmorphism?.enabled) {
        bgStyle.backdropFilter = `blur(${p.glassmorphism.blur}px)`;
        bgStyle.WebkitBackdropFilter = `blur(${p.glassmorphism.blur}px)`;
      }
      return (
        <div
          className="h-full w-full"
          style={{
            ...bgStyle,
            border: p.borderWidth > 0 ? `${p.borderWidth}px ${p.borderStyle ?? "solid"} ${p.borderColor}` : undefined,
            borderRadius: p.borderRadius,
          }}
        />
      );
    }
    case "barcode":
      return (
        <div
          className="flex h-full w-full items-center justify-center text-xs font-mono"
          style={{
            color: (layer.props as any).color || "#000",
            backgroundColor: (layer.props as any).bgColor || "#FFF",
          }}>
          [{(layer.props as any).format}] {(layer.props as any).value}
        </div>
      );
    default:
      return null;
  }
}
