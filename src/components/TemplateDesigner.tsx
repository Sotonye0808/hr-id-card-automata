import { useState, useRef, useCallback, useEffect } from "react";
import { useToast } from "./Toast";
import {
  Trash2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Type,
  Image,
  Square,
  Barcode,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Undo2,
  Redo2,
  Move,
} from "lucide-react";
import type {
  DesignerTemplate,
  TemplateLayer,
  LayerType,
  TextLayerProps,
  ImageLayerProps,
  ShapeLayerProps,
  BarcodeLayerProps,
} from "../types";

interface TemplateDesignerProps {
  template: DesignerTemplate;
  onChange: (template: DesignerTemplate) => void;
}

const SNAP = 8;

export default function TemplateDesigner({ template, onChange }: TemplateDesignerProps) {
  const { toast } = useToast();
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [activeSide, setActiveSide] = useState<"front" | "back">("front");
  const [zoom, setZoom] = useState(1);
  const [autoFit, setAutoFit] = useState(true);
  const [dragging, setDragging] = useState<{
    layerId: string;
    startX: number;
    startY: number;
    startLayerX: number;
    startLayerY: number;
  } | null>(null);
  const [resizing, setResizing] = useState<{
    layerId: string;
    handle: string;
    startX: number;
    startY: number;
    startW: number;
    startH: number;
  } | null>(null);
  const [rotating, setRotating] = useState<{
    layerId: string;
    startAngle: number;
    centerX: number;
    centerY: number;
  } | null>(null);
  const [showImportMenu, setShowImportMenu] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<TemplateLayer[][]>([]);
  const historyIndexRef = useRef(-1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const pushHistory = useCallback((layers: TemplateLayer[]) => {
    const history = historyRef.current;
    const idx = historyIndexRef.current;
    const trimmed = history.slice(0, idx + 1);
    trimmed.push(JSON.parse(JSON.stringify(layers)));
    if (trimmed.length > 50) trimmed.shift();
    historyRef.current = trimmed;
    historyIndexRef.current = trimmed.length - 1;
    setCanUndo(trimmed.length > 1);
    setCanRedo(false);
  }, []);

  const undo = useCallback(() => {
    const idx = historyIndexRef.current;
    if (idx <= 0) return;
    const prev = historyRef.current[idx - 1];
    if (!prev) return;
    historyIndexRef.current = idx - 1;
    setCanUndo(idx - 1 > 0);
    setCanRedo(true);
    const layers = activeSide === "front" ? template.layers : (template.backLayers ?? []);
    if (JSON.stringify(layers) !== JSON.stringify(prev)) {
      setActiveLayers(JSON.parse(JSON.stringify(prev)));
    }
  }, [template, activeSide, setActiveLayers]);

  const redo = useCallback(() => {
    const idx = historyIndexRef.current;
    if (idx >= historyRef.current.length - 1) return;
    const next = historyRef.current[idx + 1];
    if (!next) return;
    historyIndexRef.current = idx + 1;
    setCanUndo(true);
    setCanRedo(idx + 1 < historyRef.current.length - 1);
    const layers = activeSide === "front" ? template.layers : (template.backLayers ?? []);
    if (JSON.stringify(layers) !== JSON.stringify(next)) {
      setActiveLayers(JSON.parse(JSON.stringify(next)));
    }
  }, [template, activeSide, setActiveLayers]);
  const canvasRef = useRef<HTMLDivElement>(null);

  const activeLayers = activeSide === "front" ? template.layers : (template.backLayers ?? []);
  const setActiveLayers = useCallback(
    (layers: TemplateLayer[]) => {
      if (activeSide === "front") {
        onChange({ ...template, layers });
      } else {
        onChange({ ...template, backLayers: layers });
      }
    },
    [template, activeSide, onChange],
  );
  const toggleSide = useCallback(() => {
    setActiveSide((s) => (s === "front" ? "back" : "front"));
    setSelectedLayerId(null);
  }, []);

  const currentLayers = activeSide === "front" ? template.layers : (template.backLayers ?? []);

  useEffect(() => {
    if (historyRef.current.length === 0 && currentLayers.length > 0) {
      pushHistory(currentLayers);
    }
  }, [currentLayers, pushHistory]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  useEffect(() => {
    if (!autoFit || !containerRef.current) return;
    const container = containerRef.current;
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const pad = 48;
        const scaleX = (width - pad) / template.canvasWidth;
        const scaleY = (height - pad) / template.canvasHeight;
        setZoom(Math.max(0.1, Math.min(scaleX, scaleY, 2)));
      }
    });
    obs.observe(container);
    return () => obs.disconnect();
  }, [autoFit, template.canvasWidth, template.canvasHeight]);

  const selectedLayer = currentLayers.find((l) => l.id === selectedLayerId) ?? null;

  const updateLayer = useCallback(
    (layerId: string, patch: Partial<TemplateLayer>) => {
      const layers = activeSide === "front" ? template.layers : (template.backLayers ?? []);
      const updated = layers.map((l) =>
        l.id === layerId ? { ...l, ...patch } : l,
      );
      setActiveLayers(updated);
    },
    [template, activeSide, setActiveLayers],
  );

  const addLayer = useCallback(
    (type: LayerType) => {
      const id = crypto.randomUUID?.() ?? `layer-${Date.now()}`;
      const layers = activeSide === "front" ? template.layers : (template.backLayers ?? []);
      const maxZ = Math.max(...layers.map((l) => l.zIndex), 0);
      let props: TextLayerProps | ImageLayerProps | ShapeLayerProps | BarcodeLayerProps;

      switch (type) {
        case "text":
          props = {
            text: "Text Layer",
            fontFamily: "font-sans",
            fontSize: 16,
            fontWeight: "bold",
            color: "#111827",
            textAlign: "left",
            lineHeight: 1.3,
            letterSpacing: 0,
          };
          break;
        case "image":
          props = {
            src: null,
            objectFit: "cover",
            borderRadius: 0,
          };
          break;
        case "shape":
          props = {
            shapeType: "rectangle",
            backgroundColor: "#0f766e",
            borderColor: "#0f766e",
            borderWidth: 0,
            borderRadius: 8,
          };
          break;
        case "barcode":
          props = {
            format: "code128",
            value: "EMP-001",
            color: "#000000",
            bgColor: "#FFFFFF",
          };
          break;
      }

      const layer: TemplateLayer = {
        id,
        type,
        name: `New ${type}`,
        x: 40,
        y: 40,
        width: 200,
        height: type === "text" ? 40 : type === "shape" ? 100 : 120,
        rotation: 0,
        zIndex: maxZ + 1,
        visible: true,
        locked: false,
        opacity: 1,
        props,
      };

      const updated = [...layers, layer];
      setActiveLayers(updated);
      pushHistory(updated);
      setSelectedLayerId(id);
    },
    [template, activeSide, setActiveLayers, pushHistory],
  );

  const deleteSelectedLayer = useCallback(() => {
    if (!selectedLayerId) return;
    const layers = activeSide === "front" ? template.layers : (template.backLayers ?? []);
    const updated = layers.filter((l) => l.id !== selectedLayerId);
    setActiveLayers(updated);
    pushHistory(updated);
    setSelectedLayerId(null);
  }, [template, activeSide, selectedLayerId, setActiveLayers, pushHistory]);

  const moveLayer = useCallback(
    (id: string, direction: "up" | "down") => {
      const layers = activeSide === "front" ? template.layers : (template.backLayers ?? []);
      const sorted = [...layers].sort((a, b) => a.zIndex - b.zIndex);
      const idx = sorted.findIndex((l) => l.id === id);
      if (idx < 0) return;
      const swap = direction === "up" ? idx + 1 : idx - 1;
      if (swap < 0 || swap >= sorted.length) return;
      const temp = sorted[idx].zIndex;
      sorted[idx] = { ...sorted[idx], zIndex: sorted[swap].zIndex };
      sorted[swap] = { ...sorted[swap], zIndex: temp };
      setActiveLayers(sorted);
      pushHistory(sorted);
    },
    [template, activeSide, setActiveLayers, pushHistory],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, layerId: string) => {
      if (e.button !== 0) return;
      const layer = currentLayers.find((l) => l.id === layerId);
      if (!layer || layer.locked) return;
      setSelectedLayerId(layerId);
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      setDragging({
        layerId,
        startX: e.clientX,
        startY: e.clientY,
        startLayerX: layer.x,
        startLayerY: layer.y,
      });
    },
    [currentLayers],
  );

  const handleResizeStart = useCallback(
    (e: React.PointerEvent, layerId: string, handle: string) => {
      e.stopPropagation();
      const layer = currentLayers.find((l) => l.id === layerId);
      if (!layer || layer.locked) return;
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      setResizing({
        layerId,
        handle,
        startX: e.clientX,
        startY: e.clientY,
        startW: layer.width,
        startH: layer.height,
      });
    },
    [currentLayers],
  );

  const handleRotateStart = useCallback(
    (e: React.PointerEvent, layerId: string) => {
      e.stopPropagation();
      const layer = currentLayers.find((l) => l.id === layerId);
      if (!layer || layer.locked) return;
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      const cx = layer.x + layer.width / 2;
      const cy = layer.y + layer.height / 2;
      const startAngle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
      setRotating({
        layerId,
        startAngle: startAngle - layer.rotation,
        centerX: cx,
        centerY: cy,
      });
    },
    [currentLayers],
  );

  useEffect(() => {
    if (!dragging) return;
    const handlePointerMove = (e: PointerEvent) => {
      const dx = Math.round((e.clientX - dragging.startX) / SNAP) * SNAP;
      const dy = Math.round((e.clientY - dragging.startY) / SNAP) * SNAP;
      updateLayer(dragging.layerId, {
        x: dragging.startLayerX + dx,
        y: dragging.startLayerY + dy,
      });
    };
    const handlePointerUp = () => {
      setDragging(null);
      const layers = activeSide === "front" ? template.layers : (template.backLayers ?? []);
      pushHistory(layers);
    };
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    document.body.style.userSelect = "none";
    document.body.style.pointerEvents = "auto";
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      document.body.style.userSelect = "";
    };
  }, [dragging, updateLayer, template, activeSide, pushHistory]);

  useEffect(() => {
    if (!resizing) return;
    const handlePointerMove = (e: PointerEvent) => {
      const dx = Math.round((e.clientX - resizing.startX) / SNAP) * SNAP;
      const dy = Math.round((e.clientY - resizing.startY) / SNAP) * SNAP;
      let newW = resizing.startW;
      let newH = resizing.startH;
      if (resizing.handle.includes("e")) newW = Math.max(20, resizing.startW + dx);
      if (resizing.handle.includes("s")) newH = Math.max(20, resizing.startH + dy);
      if (resizing.handle.includes("w")) {
        newW = Math.max(20, resizing.startW - dx);
      }
      if (resizing.handle.includes("n")) {
        newH = Math.max(20, resizing.startH - dy);
      }
      updateLayer(resizing.layerId, { width: newW, height: newH });
    };
    const handlePointerUp = () => {
      setResizing(null);
      const layers = activeSide === "front" ? template.layers : (template.backLayers ?? []);
      pushHistory(layers);
    };
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    document.body.style.userSelect = "none";
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      document.body.style.userSelect = "";
    };
  }, [resizing, updateLayer, template, activeSide, pushHistory]);

  useEffect(() => {
    if (!rotating) return;
    const handlePointerMove = (e: PointerEvent) => {
      const angle = Math.atan2(e.clientY - rotating.centerY, e.clientX - rotating.centerX) * (180 / Math.PI);
      const newRotation = Math.round((angle - rotating.startAngle) / 5) * 5;
      updateLayer(rotating.layerId, { rotation: newRotation });
    };
    const handlePointerUp = () => {
      setRotating(null);
      const layers = activeSide === "front" ? template.layers : (template.backLayers ?? []);
      pushHistory(layers);
    };
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    document.body.style.userSelect = "none";
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      document.body.style.userSelect = "";
    };
  }, [rotating, updateLayer, template, activeSide, pushHistory]);

  const sortedLayers = [...currentLayers].sort((a, b) => a.zIndex - b.zIndex);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).dataset?.canvas) {
      setSelectedLayerId(null);
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const { importFromImage, importFromDocx, importFromPdf } = await import("../lib/templateImporter");
    try {
      let result;
      const ext = file.name.toLowerCase();
      if (ext.match(/\.(png|jpg|jpeg|gif|webp)$/)) {
        result = await importFromImage(file);
      } else if (ext.endsWith(".docx")) {
        result = await importFromDocx(file);
      } else if (ext.endsWith(".pdf")) {
        result = await importFromPdf(file);
      } else {
        toast("Unsupported file format. Use PNG, JPG, DOCX, or PDF.", "error");
        return;
      }
      onChange(result.template);
      setShowImportMenu(false);
      toast("Template imported — refine layers as needed", "success");
      if (result.warnings.length) {
        result.warnings.forEach((w) => toast(w, "info"));
      }
    } catch (err) {
      toast(`Import failed: ${err instanceof Error ? err.message : "Unknown error"}`, "error");
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1">
          <button
            className="mini-button"
            onClick={() => addLayer("text")}
            title="Add text layer">
            <Type size={14} /> Text
          </button>
          <button
            className="mini-button"
            onClick={() => addLayer("image")}
            title="Add image layer">
            <Image size={14} /> Image
          </button>
          <button
            className="mini-button"
            onClick={() => addLayer("shape")}
            title="Add shape layer">
            <Square size={14} /> Shape
          </button>
          <button
            className="mini-button"
            onClick={() => addLayer("barcode")}
            title="Add barcode layer">
            <Barcode size={14} /> Barcode
          </button>
          <span className="mx-1 h-5 w-px bg-[var(--border)]" />
          <button
            className="mini-button"
            onClick={undo}
            disabled={!canUndo}
            title="Undo">
            <Undo2 size={14} />
          </button>
          <button
            className="mini-button"
            onClick={redo}
            disabled={!canRedo}
            title="Redo">
            <Redo2 size={14} />
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          <button
            className={`mini-button ${activeSide === "back" ? "bg-[var(--accent-soft)] text-[var(--accent)]" : ""}`}
            onClick={toggleSide}
            title={`Switch to ${activeSide === "front" ? "back" : "front"} side`}>
            {activeSide === "front" ? "Front" : "Back"}
          </button>
          <button
            className="mini-button"
            onClick={() => { setAutoFit(true); }}
            title="Auto-fit canvas">
            <Maximize2 size={14} />
          </button>
          <button
            className="mini-button"
            onClick={() => { setAutoFit(false); setZoom((z) => Math.max(0.1, z - 0.1)); }}
            title="Zoom out">
            <ZoomOut size={14} />
          </button>
          <span className="text-[10px] font-bold text-[var(--muted)] min-w-[32px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            className="mini-button"
            onClick={() => { setAutoFit(false); setZoom((z) => Math.min(3, z + 0.1)); }}
            title="Zoom in">
            <ZoomIn size={14} />
          </button>
          <div className="relative">
            <button
              className="mini-button"
              onClick={() => setShowImportMenu((v) => !v)}>
              Import
            </button>
            {showImportMenu && (
              <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-2xl min-[0px]:left-auto min-[0px]:right-0 max-sm:left-1/2 max-sm:-translate-x-1/2">
                <label className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold hover:bg-[var(--accent-soft)]">
                  Image (PNG/JPG)
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImportFile}
                  />
                </label>
                <label className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold hover:bg-[var(--accent-soft)]">
                  Word (DOCX)
                  <input
                    type="file"
                    accept=".docx"
                    className="hidden"
                    onChange={handleImportFile}
                  />
                </label>
                <label className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold hover:bg-[var(--accent-soft)]">
                  PDF
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handleImportFile}
                  />
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-hidden lg:flex-row">
        <div
          ref={containerRef}
          data-canvas="true"
          className="designer-canvas-container relative flex min-h-[250px] flex-1 items-start justify-center overflow-auto rounded-2xl border border-[var(--border)] sm:min-h-[300px]"
          onClick={handleCanvasClick}
          style={{ touchAction: "manipulation" }}>
          <div
            ref={canvasRef}
            className="designer-canvas relative shrink-0"
            style={{
              width: template.canvasWidth,
              height: template.canvasHeight,
              backgroundColor: template.canvasColor,
              margin: "24px auto",
              borderRadius: "12px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
              maxWidth: "100%",
              transform: `scale(${zoom})`,
              transformOrigin: "top center",
              overflow: "hidden",
              touchAction: "none",
            }}>
            {sortedLayers.map((layer) => (
              <div
                key={layer.id}
                className={`absolute ${!layer.visible ? "hidden" : ""}`}
                style={{
                  left: layer.x,
                  top: layer.y,
                  width: layer.width,
                  height: layer.height,
                  zIndex: layer.zIndex,
                  opacity: layer.opacity,
                  outline:
                    selectedLayerId === layer.id
                      ? "2px solid #0f766e"
                      : undefined,
                  outlineOffset: 1,
                  borderRadius:
                    layer.type === "image"
                      ? (layer.props as ImageLayerProps).borderRadius
                      : layer.type === "shape"
                        ? (layer.props as ShapeLayerProps).borderRadius
                        : undefined,
                  cursor: layer.locked ? "default" : "grab",
                  transform: layer.rotation ? `rotate(${layer.rotation}deg)` : undefined,
                  touchAction: "none",
                }}
                onPointerDown={(e) => handlePointerDown(e, layer.id)}>
                {renderLayerPreview(layer)}

                {selectedLayerId === layer.id && !layer.locked && (
                  <>
                    <div
                      className="absolute -bottom-3 -right-3 z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#0f766e] text-white shadow-md"
                      style={{ touchAction: "none", cursor: "nwse-resize" }}
                      onPointerDown={(e) => handleResizeStart(e, layer.id, "se")}
                      title="Resize">
                      <Move size={12} />
                    </div>
                    <div
                      className="absolute -bottom-3 left-1/2 z-10 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full border-2 border-white bg-[#0f766e] text-white shadow-md"
                      style={{ touchAction: "none", cursor: "ns-resize" }}
                      onPointerDown={(e) => handleResizeStart(e, layer.id, "s")}
                      title="Resize vertically">
                      <Move size={12} className="rotate-90" />
                    </div>
                    <div
                      className="absolute -right-3 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-[#0f766e] text-white shadow-md"
                      style={{ touchAction: "none", cursor: "ew-resize" }}
                      onPointerDown={(e) => handleResizeStart(e, layer.id, "e")}
                      title="Resize horizontally">
                      <Move size={12} />
                    </div>
                    <div
                      className="absolute -top-8 left-1/2 z-10 flex h-7 w-7 -translate-x-1/2 cursor-grab items-center justify-center rounded-full border-2 border-white bg-orange-500 text-white shadow-md"
                      style={{ touchAction: "none" }}
                      onPointerDown={(e) => handleRotateStart(e, layer.id)}
                      title="Rotate">
                      <RotateCcw size={12} />
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="w-full shrink-0 lg:w-64 flex-col gap-3 overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 max-lg:max-h-[200px] sm:max-lg:max-h-[250px]">
          <div className="flex items-center justify-between">
            <p className="eyebrow">Layers - {activeSide === "front" ? "Front" : "Back"}</p>
          </div>
          <div className="flex flex-col gap-1">
            {currentLayers.length === 0 && (
              <p className="py-4 text-center text-[11px] text-[var(--muted)]">No layers on this side</p>
            )}
            {[...currentLayers]
              .sort((a, b) => b.zIndex - a.zIndex)
              .map((layer) => (
                <div
                  key={layer.id}
                  className={`flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1.5 text-xs transition-colors ${selectedLayerId === layer.id ? "bg-[var(--accent-soft)]" : "hover:bg-black/5"}`}
                  onClick={() => setSelectedLayerId(layer.id)}>
                  <LayerIcon type={layer.type} />
                  <span className="flex-1 truncate font-semibold">
                    {layer.name}
                  </span>
                  <span className="text-[10px] text-[var(--muted)]">
                    z:{layer.zIndex}
                  </span>
                </div>
              ))}
          </div>

          {selectedLayer && (
            <div className="space-y-3 border-t border-[var(--border)] pt-3">
              <p className="eyebrow">Properties</p>

              <div className="flex gap-1">
                <button
                  className="mini-button"
                  onClick={() =>
                    updateLayer(selectedLayer.id, {
                      visible: !selectedLayer.visible,
                    })
                  }
                  title="Toggle visibility">
                  {selectedLayer.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                </button>
                <button
                  className="mini-button"
                  onClick={() =>
                    updateLayer(selectedLayer.id, {
                      locked: !selectedLayer.locked,
                    })
                  }
                  title="Toggle lock">
                  {selectedLayer.locked ? <Lock size={12} /> : <Unlock size={12} />}
                </button>
                <button
                  className="mini-button"
                  onClick={() => moveLayer(selectedLayer.id, "up")}
                  title="Move up">
                  <ChevronUp size={12} />
                </button>
                <button
                  className="mini-button"
                  onClick={() => moveLayer(selectedLayer.id, "down")}
                  title="Move down">
                  <ChevronDown size={12} />
                </button>
                <button
                  className="mini-button"
                  onClick={() =>
                    updateLayer(selectedLayer.id, { rotation: 0 })
                  }
                  title="Reset rotation">
                  <RotateCcw size={12} />
                </button>
                <button
                  className="mini-button text-red-500"
                  onClick={deleteSelectedLayer}
                  title="Delete layer">
                  <Trash2 size={12} />
                </button>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="text-[10px] font-bold text-[var(--muted)]">
                    Name
                  </label>
                  <input
                    className="field-input mt-1 py-1.5 text-xs"
                    value={selectedLayer.name}
                    onChange={(e) =>
                      updateLayer(selectedLayer.id, { name: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-[var(--muted)]">
                      X
                    </label>
                    <input
                      type="number"
                      className="field-input mt-1 py-1.5 text-xs"
                      value={selectedLayer.x}
                      onChange={(e) =>
                        updateLayer(selectedLayer.id, {
                          x: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[var(--muted)]">
                      Y
                    </label>
                    <input
                      type="number"
                      className="field-input mt-1 py-1.5 text-xs"
                      value={selectedLayer.y}
                      onChange={(e) =>
                        updateLayer(selectedLayer.id, {
                          y: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[var(--muted)]">
                      Width
                    </label>
                    <input
                      type="number"
                      className="field-input mt-1 py-1.5 text-xs"
                      value={selectedLayer.width}
                      onChange={(e) =>
                        updateLayer(selectedLayer.id, {
                          width: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[var(--muted)]">
                      Height
                    </label>
                    <input
                      type="number"
                      className="field-input mt-1 py-1.5 text-xs"
                      value={selectedLayer.height}
                      onChange={(e) =>
                        updateLayer(selectedLayer.id, {
                          height: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[var(--muted)]">
                      Rotation
                    </label>
                    <input
                      type="number"
                      className="field-input mt-1 py-1.5 text-xs"
                      value={selectedLayer.rotation}
                      onChange={(e) =>
                        updateLayer(selectedLayer.id, {
                          rotation: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[var(--muted)]">
                    Opacity
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    className="field-range mt-1"
                    value={selectedLayer.opacity}
                    onChange={(e) =>
                      updateLayer(selectedLayer.id, {
                        opacity: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              {selectedLayer.type === "text" && (
                <TextLayerPropsPanel
                  props={selectedLayer.props as TextLayerProps}
                  onChange={(props) =>
                    updateLayer(selectedLayer.id, { props } as Partial<TemplateLayer>)
                  }
                />
              )}
              {selectedLayer.type === "image" && (
                <ImageLayerPropsPanel
                  props={selectedLayer.props as ImageLayerProps}
                  onChange={(props) =>
                    updateLayer(selectedLayer.id, { props } as Partial<TemplateLayer>)
                  }
                />
              )}
              {selectedLayer.type === "shape" && (
                <ShapeLayerPropsPanel
                  props={selectedLayer.props as ShapeLayerProps}
                  onChange={(props) =>
                    updateLayer(selectedLayer.id, { props } as Partial<TemplateLayer>)
                  }
                />
              )}
              {selectedLayer.type === "barcode" && (
                <BarcodeLayerPropsPanel
                  props={selectedLayer.props as BarcodeLayerProps}
                  onChange={(props) =>
                    updateLayer(selectedLayer.id, { props } as Partial<TemplateLayer>)
                  }
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LayerIcon({ type }: { type: LayerType }) {
  switch (type) {
    case "text":
      return <Type size={12} className="text-[var(--accent)]" />;
    case "image":
      return <Image size={12} className="text-blue-500" />;
    case "shape":
      return <Square size={12} className="text-purple-500" />;
    case "barcode":
      return <Barcode size={12} className="text-amber-500" />;
  }
}

function renderLayerPreview(layer: TemplateLayer) {
  switch (layer.type) {
    case "text": {
      const p = layer.props as TextLayerProps;
      return (
        <div
          className="flex h-full w-full items-center overflow-hidden px-2"
          style={{
            fontFamily: p.fontFamily,
            fontSize: p.fontSize,
            fontWeight: p.fontWeight,
            color: p.color,
            textAlign: p.textAlign,
            lineHeight: p.lineHeight,
            letterSpacing: p.letterSpacing,
          }}>
          <span className="truncate">{p.text}</span>
        </div>
      );
    }
    case "image": {
      const p = layer.props as ImageLayerProps;
      const imgStyle: React.CSSProperties = {};
      if (p.glassmorphism?.enabled) {
        imgStyle.backdropFilter = `blur(${p.glassmorphism.blur}px)`;
        imgStyle.WebkitBackdropFilter = `blur(${p.glassmorphism.blur}px)`;
      }
      if (p.src) {
        return (
          <img
            src={p.src}
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
        <div className="flex h-full w-full items-center justify-center rounded bg-gray-100 text-[10px] text-gray-400">
          No image
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
    case "barcode": {
      const p = layer.props as BarcodeLayerProps;
      return (
        <div
          className="flex h-full w-full items-center justify-center text-[10px] font-mono"
          style={{ color: p.color, backgroundColor: p.bgColor }}>
          [{p.format}] {p.value}
        </div>
      );
    }
  }
}

function TextLayerPropsPanel({
  props,
  onChange,
}: {
  props: TextLayerProps;
  onChange: (props: TextLayerProps) => void;
}) {
  const set = (patch: Partial<TextLayerProps>) => onChange({ ...props, ...patch });

  return (
    <div className="space-y-2 border-t border-[var(--border)] pt-2">
      <p className="text-[10px] font-bold text-[var(--muted)]">Text Properties</p>
      <div>
        <label className="text-[10px] font-bold text-[var(--muted)]">Content</label>
        <input
          className="field-input mt-1 py-1.5 text-xs"
          value={props.text}
          onChange={(e) => set({ text: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] font-bold text-[var(--muted)]">Font Size</label>
          <input
            type="number"
            className="field-input mt-1 py-1.5 text-xs"
            value={props.fontSize}
            onChange={(e) => set({ fontSize: Number(e.target.value) })}
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-[var(--muted)]">Weight</label>
          <select
            className="field-input mt-1 py-1.5 text-xs"
            value={props.fontWeight}
            onChange={(e) => set({ fontWeight: e.target.value })}>
            <option value="normal">Normal</option>
            <option value="medium">Medium</option>
            <option value="bold">Bold</option>
            <option value="black">Black</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-[10px] font-bold text-[var(--muted)]">Color</label>
        <input
          type="color"
          className="color-input mt-1"
          value={props.color}
          onChange={(e) => set({ color: e.target.value })}
        />
      </div>
      <div>
        <label className="text-[10px] font-bold text-[var(--muted)]">Align</label>
        <select
          className="field-input mt-1 py-1.5 text-xs"
          value={props.textAlign}
          onChange={(e) => set({ textAlign: e.target.value as "left" | "center" | "right" })}>
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>
    </div>
  );
}

function ImageLayerPropsPanel({
  props,
  onChange,
}: {
  props: ImageLayerProps;
  onChange: (props: ImageLayerProps) => void;
}) {
  const set = (patch: Partial<ImageLayerProps>) => onChange({ ...props, ...patch });

  const glass = props.glassmorphism ?? { enabled: false, blur: 10, opacity: 0.3 };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set({ src: reader.result as string });
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2 border-t border-[var(--border)] pt-2">
      <p className="text-[10px] font-bold text-[var(--muted)]">Image Properties</p>
      {props.src ? (
        <div className="relative">
          <img
            src={props.src}
            alt=""
            className="h-20 w-full rounded-lg object-cover"
          />
          <button
            className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white"
            onClick={() => set({ src: null })}>
            <Trash2 size={10} />
          </button>
        </div>
      ) : (
        <label className="flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-[var(--border)] py-4 text-xs text-[var(--muted)] hover:bg-[var(--accent-soft)]">
          Upload Image
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        </label>
      )}
      <div>
        <label className="text-[10px] font-bold text-[var(--muted)]">Object Fit</label>
        <select
          className="field-input mt-1 py-1.5 text-xs"
          value={props.objectFit}
          onChange={(e) => set({ objectFit: e.target.value as "cover" | "contain" | "fill" })}>
          <option value="cover">Cover</option>
          <option value="contain">Contain</option>
          <option value="fill">Fill</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] font-bold text-[var(--muted)]">Border Radius</label>
          <input
            type="number"
            className="field-input mt-1 py-1.5 text-xs"
            value={props.borderRadius}
            onChange={(e) => set({ borderRadius: Number(e.target.value) })}
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-[var(--muted)]">Border Width</label>
          <input
            type="number"
            className="field-input mt-1 py-1.5 text-xs"
            value={props.borderWidth ?? 0}
            onChange={(e) => set({ borderWidth: Number(e.target.value) })}
          />
        </div>
      </div>
      {props.borderWidth && props.borderWidth > 0 && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-bold text-[var(--muted)]">Border Color</label>
            <input
              type="color"
              className="color-input mt-1"
              value={props.borderColor ?? "#111827"}
              onChange={(e) => set({ borderColor: e.target.value })}
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-[var(--muted)]">Border Style</label>
            <select
              className="field-input mt-1 py-1.5 text-xs"
              value={props.borderStyle ?? "solid"}
              onChange={(e) => set({ borderStyle: e.target.value as "solid" | "dashed" | "dotted" })}>
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
            </select>
          </div>
        </div>
      )}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-[var(--muted)]">Glassmorphism</label>
        <select
          className="field-input mt-1 py-1.5 text-xs"
          value={glass.enabled ? "yes" : "no"}
          onChange={(e) => set({ glassmorphism: { ...glass, enabled: e.target.value === "yes" } })}>
          <option value="no">Disabled</option>
          <option value="yes">Enabled</option>
        </select>
        {glass.enabled && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-[var(--muted)]">Blur</label>
              <input
                type="number"
                className="field-input mt-1 py-1.5 text-xs"
                value={glass.blur}
                min={1}
                max={50}
                onChange={(e) => set({ glassmorphism: { ...glass, blur: Number(e.target.value) } })}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-[var(--muted)]">Opacity</label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                className="field-range mt-1"
                value={glass.opacity}
                onChange={(e) => set({ glassmorphism: { ...glass, opacity: Number(e.target.value) } })}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function GradientControls({ props, set }: { props: ShapeLayerProps; set: (patch: Partial<ShapeLayerProps>) => void }) {
  const grad = props.backgroundGradient ?? { type: "none", angle: 0, colors: ["#0f766e", "#0f4761"] };
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-[var(--muted)]">Background Gradient</label>
      <select
        className="field-input mt-1 py-1.5 text-xs"
        value={grad.type}
        onChange={(e) => set({ backgroundGradient: { ...grad, type: e.target.value as "none" | "linear" | "radial" } })}>
        <option value="none">None</option>
        <option value="linear">Linear</option>
        <option value="radial">Radial</option>
      </select>
      {grad.type !== "none" && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-[var(--muted)]">Angle</label>
              <input
                type="number"
                className="field-input mt-1 py-1.5 text-xs"
                value={grad.angle}
                onChange={(e) => set({ backgroundGradient: { ...grad, angle: Number(e.target.value) } })}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-[var(--muted)]">Color 1</label>
              <input
                type="color"
                className="color-input mt-1"
                value={grad.colors[0] ?? "#0f766e"}
                onChange={(e) => set({ backgroundGradient: { ...grad, colors: [e.target.value, grad.colors[1] ?? "#0f4761"] } })}
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-[var(--muted)]">Color 2</label>
            <input
              type="color"
              className="color-input mt-1"
              value={grad.colors[1] ?? "#0f4761"}
              onChange={(e) => set({ backgroundGradient: { ...grad, colors: [grad.colors[0] ?? "#0f766e", e.target.value] } })}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function GlassmorphismControls({ props, set }: { props: ShapeLayerProps; set: (patch: Partial<ShapeLayerProps>) => void }) {
  const glass = props.glassmorphism ?? { enabled: false, blur: 10, opacity: 0.3 };
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-[var(--muted)]">Glassmorphism</label>
      <select
        className="field-input mt-1 py-1.5 text-xs"
        value={glass.enabled ? "yes" : "no"}
        onChange={(e) => set({ glassmorphism: { ...glass, enabled: e.target.value === "yes" } })}>
        <option value="no">Disabled</option>
        <option value="yes">Enabled</option>
      </select>
      {glass.enabled && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-bold text-[var(--muted)]">Blur</label>
            <input
              type="number"
              className="field-input mt-1 py-1.5 text-xs"
              value={glass.blur}
              min={1}
              max={50}
              onChange={(e) => set({ glassmorphism: { ...glass, blur: Number(e.target.value) } })}
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-[var(--muted)]">Opacity</label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              className="field-range mt-1"
              value={glass.opacity}
              onChange={(e) => set({ glassmorphism: { ...glass, opacity: Number(e.target.value) } })}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ShapeLayerPropsPanel({
  props,
  onChange,
}: {
  props: ShapeLayerProps;
  onChange: (props: ShapeLayerProps) => void;
}) {
  const set = (patch: Partial<ShapeLayerProps>) => onChange({ ...props, ...patch });

  return (
    <div className="space-y-2 border-t border-[var(--border)] pt-2">
      <p className="text-[10px] font-bold text-[var(--muted)]">Shape Properties</p>
      <div>
        <label className="text-[10px] font-bold text-[var(--muted)]">Shape Type</label>
        <select
          className="field-input mt-1 py-1.5 text-xs"
          value={props.shapeType}
          onChange={(e) => set({ shapeType: e.target.value as "rectangle" | "circle" | "line" })}>
          <option value="rectangle">Rectangle</option>
          <option value="circle">Circle</option>
          <option value="line">Line</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] font-bold text-[var(--muted)]">Fill Color</label>
          <input
            type="color"
            className="color-input mt-1"
            value={props.backgroundColor}
            onChange={(e) => set({ backgroundColor: e.target.value })}
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-[var(--muted)]">Border Color</label>
          <input
            type="color"
            className="color-input mt-1"
            value={props.borderColor}
            onChange={(e) => set({ borderColor: e.target.value })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] font-bold text-[var(--muted)]">Border Width</label>
          <input
            type="number"
            className="field-input mt-1 py-1.5 text-xs"
            value={props.borderWidth}
            onChange={(e) => set({ borderWidth: Number(e.target.value) })}
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-[var(--muted)]">Radius</label>
          <input
            type="number"
            className="field-input mt-1 py-1.5 text-xs"
            value={props.borderRadius}
            onChange={(e) => set({ borderRadius: Number(e.target.value) })}
          />
        </div>
      </div>
      <div>
        <label className="text-[10px] font-bold text-[var(--muted)]">Border Style</label>
        <select
          className="field-input mt-1 py-1.5 text-xs"
          value={props.borderStyle ?? "solid"}
          onChange={(e) => set({ borderStyle: e.target.value as "solid" | "dashed" | "dotted" })}>
          <option value="solid">Solid</option>
          <option value="dashed">Dashed</option>
          <option value="dotted">Dotted</option>
        </select>
      </div>
      <GradientControls props={props} set={set} />
      <GlassmorphismControls props={props} set={set} />
    </div>
  );
}

function BarcodeLayerPropsPanel({
  props,
  onChange,
}: {
  props: BarcodeLayerProps;
  onChange: (props: BarcodeLayerProps) => void;
}) {
  const set = (patch: Partial<BarcodeLayerProps>) => onChange({ ...props, ...patch });

  return (
    <div className="space-y-2 border-t border-[var(--border)] pt-2">
      <p className="text-[10px] font-bold text-[var(--muted)]">Barcode Properties</p>
      <div>
        <label className="text-[10px] font-bold text-[var(--muted)]">Format</label>
        <select
          className="field-input mt-1 py-1.5 text-xs"
          value={props.format}
          onChange={(e) => set({ format: e.target.value as "code128" | "qr" | "datamatrix" })}>
          <option value="code128">Code 128</option>
          <option value="qr">QR Code</option>
          <option value="datamatrix">Data Matrix</option>
        </select>
      </div>
      <div>
        <label className="text-[10px] font-bold text-[var(--muted)]">Value</label>
        <input
          className="field-input mt-1 py-1.5 text-xs"
          value={props.value}
          onChange={(e) => set({ value: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] font-bold text-[var(--muted)]">Color</label>
          <input
            type="color"
            className="color-input mt-1"
            value={props.color}
            onChange={(e) => set({ color: e.target.value })}
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-[var(--muted)]">Background</label>
          <input
            type="color"
            className="color-input mt-1"
            value={props.bgColor}
            onChange={(e) => set({ bgColor: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
