import React from "react";
import {
  UserCircle,
  Briefcase,
  Hash,
  Calendar,
  Upload,
  Image as ImageIcon,
  Building2,
  MoveHorizontal,
  RotateCcw,
  ZoomIn,
  Crop,
  Variable,
} from "lucide-react";
import { UserData, DesignerTemplate, TemplateLayer, ImageLayerProps } from "../types";
import { extractTemplateFields, hasImageLayers } from "../lib/templateRenderer";

interface DataEntryProps {
  data: UserData;
  onChange: (data: UserData) => void;
  designerTemplate?: DesignerTemplate | null;
}

const STANDARD_FIELDS: Record<string, { label: string; icon: React.ReactNode; placeholder: string; type?: string }> = {
  fullName: { label: "Full Legal Name", icon: <UserCircle size={10} />, placeholder: "e.g. Alexandru Sterling" },
  role: { label: "Professional Role", icon: <Briefcase size={10} />, placeholder: "e.g. Systems Architect" },
  department: { label: "Department", icon: <Building2 size={10} />, placeholder: "e.g. Communications" },
  idNumber: { label: "Serial ID", icon: <Hash size={10} />, placeholder: "AIS-01" },
  issueDate: { label: "Date Issued", icon: <Calendar size={10} />, placeholder: "", type: "date" },
};

export default function DataEntry({ data, onChange, designerTemplate }: DataEntryProps) {
  const templateFields = designerTemplate ? extractTemplateFields(designerTemplate) : [];
  const templateFieldSet = new Set(templateFields);

  const hasDesigner = designerTemplate && designerTemplate.layers.length > 0;
  const templateHasImages = designerTemplate ? hasImageLayers(designerTemplate) : false;

  const activeStandardFields = hasDesigner
    ? Object.entries(STANDARD_FIELDS).filter(([key]) => templateFieldSet.has(key))
    : Object.entries(STANDARD_FIELDS);

  const extraFields = hasDesigner
    ? templateFields.filter((f) => !STANDARD_FIELDS[f])
    : [];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({ ...data, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const updateTransform = (
    key: keyof UserData["imageTransform"],
    value: number,
  ) => {
    onChange({
      ...data,
      imageTransform: { ...data.imageTransform, [key]: value },
    });
  };

  const updateCrop = (key: keyof UserData["imageCrop"], value: number) => {
    const nextCrop = {
      ...data.imageCrop,
      [key]: value,
    };

    if (key === "x" && nextCrop.width === 100) {
      nextCrop.width = 95;
    }

    if (key === "y" && nextCrop.height === 100) {
      nextCrop.height = 95;
    }

    if (key === "width") {
      nextCrop.x = Math.min(nextCrop.x, 100 - value);
    }

    if (key === "height") {
      nextCrop.y = Math.min(nextCrop.y, 100 - value);
    }

    if (key === "x") {
      nextCrop.x = Math.min(value, 100 - nextCrop.width);
    }

    if (key === "y") {
      nextCrop.y = Math.min(value, 100 - nextCrop.height);
    }

    onChange({
      ...data,
      imageCrop: nextCrop,
    });
  };

  const updateField = (field: string, value: string) => {
    if (field in STANDARD_FIELDS) {
      onChange({ ...data, [field]: value });
    } else {
      onChange({
        ...data,
        extraFields: { ...(data.extraFields ?? {}), [field]: value },
      });
    }
  };

  const getFieldValue = (field: string): string => {
    if (field === "fullName") return data.fullName;
    if (field === "department") return data.department;
    if (field === "role") return data.role;
    if (field === "idNumber") return data.idNumber;
    if (field === "issueDate") return data.issueDate;
    return data.extraFields?.[field] ?? "";
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-[0.2em] flex items-center gap-2">
          <UserCircle size={12} className="text-[var(--accent)]" />
          Employee Entry
        </h2>
        {hasDesigner && (
          <span className="text-[9px] font-bold text-[var(--accent)] uppercase tracking-wider">
            Template-driven
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-5">
        {activeStandardFields.length > 0 && (
          <div className="space-y-4">
            {activeStandardFields.map(([key, field]) => (
              <div key={key} className="space-y-1.5">
                <label className="text-[10px] font-bold text-[var(--muted)] uppercase flex items-center gap-2">
                  {field.icon} {field.label}
                </label>
                <input
                  type={field.type || "text"}
                  value={getFieldValue(key)}
                  onChange={(e) => updateField(key, e.target.value)}
                  placeholder={field.placeholder}
                  aria-label={field.label}
                  title={field.label}
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                />
              </div>
            ))}
          </div>
        )}

        {extraFields.length > 0 && (
          <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--accent-soft)]/10 p-3">
            <div className="flex items-center gap-2">
              <Variable size={10} className="text-[var(--accent)]" />
              <label className="text-[10px] font-bold text-[var(--muted)] uppercase">
                Template Fields
              </label>
            </div>
            {extraFields.map((field) => (
              <div key={field} className="space-y-1.5">
                <label className="text-[10px] font-bold text-[var(--muted)] uppercase flex items-center gap-2">
                  <Variable size={10} /> {field.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
                </label>
                <input
                  type="text"
                  value={getFieldValue(field)}
                  onChange={(e) => updateField(field, e.target.value)}
                  placeholder={`Enter ${field}`}
                  aria-label={field}
                  title={field}
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                />
              </div>
            ))}
          </div>
        )}

        {(!hasDesigner || templateHasImages) && (
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-[var(--muted)] uppercase flex items-center gap-2">
              <ImageIcon size={12} /> Profile Media
            </label>
            <div className="relative group">
              <div
                className={`w-full aspect-square md:aspect-video rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-3 ${data.imageUrl ? "border-[var(--accent)]/50 bg-[var(--accent-soft)]" : "border-[var(--border)] bg-[var(--bg)] hover:border-[var(--accent)]/40"}`}>
                {data.imageUrl ? (
                  <div className="relative w-full h-full flex items-center justify-center p-4">
                    <img
                      src={data.imageUrl}
                      alt="Preview"
                      className="max-h-full rounded-lg shadow-lg"
                    />
                    <button
                      onClick={() => onChange({ ...data, imageUrl: null })}
                      title="Remove uploaded image"
                      aria-label="Remove uploaded image"
                      className="absolute top-2 right-2 p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-full transition-all border border-red-500/20">
                      <Upload size={12} className="rotate-180" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="p-3 bg-[var(--accent-soft)] rounded-full text-[var(--accent)]">
                      <Upload size={24} />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-[var(--text)]">
                        Drop profile image here
                      </p>
                      <p className="text-[10px] text-[var(--muted)] mt-1">
                        PNG, JPG up to 2MB
                      </p>
                    </div>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  title="Upload profile image"
                  aria-label="Upload profile image"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {(!hasDesigner || templateHasImages) && (
          <>
            <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3">
              <div className="flex items-center justify-between gap-3">
                <label className="text-[10px] font-bold text-[var(--muted)] uppercase flex items-center gap-2">
                  <MoveHorizontal size={10} /> Image Position
                </label>
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...data,
                      imageTransform: { scale: 1, offsetX: 0, offsetY: 0 },
                    })
                  }
                  className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] hover:text-[var(--text)] transition-colors flex items-center gap-1">
                  <RotateCcw size={10} /> Reset
                </button>
              </div>

              {[
                {
                  label: "Scale",
                  key: "scale" as const,
                  icon: ZoomIn,
                  min: 0.75,
                  max: 1.75,
                  step: 0.05,
                  value: data.imageTransform.scale,
                },
                {
                  label: "Offset X",
                  key: "offsetX" as const,
                  icon: MoveHorizontal,
                  min: -100,
                  max: 100,
                  step: 1,
                  value: data.imageTransform.offsetX,
                },
                {
                  label: "Offset Y",
                  key: "offsetY" as const,
                  icon: MoveHorizontal,
                  min: -100,
                  max: 100,
                  step: 1,
                  value: data.imageTransform.offsetY,
                },
              ].map((control) => (
                <div key={control.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                    <span className="flex items-center gap-1.5">
                      <control.icon size={10} /> {control.label}
                    </span>
                    <span>
                      {control.key === "scale"
                        ? `${control.value.toFixed(2)}x`
                        : `${control.value}px`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={control.min}
                    max={control.max}
                    step={control.step}
                    value={control.value}
                    onChange={(event) =>
                      updateTransform(
                        control.key,
                        control.key === "scale"
                          ? Number.parseFloat(event.target.value)
                          : Number.parseInt(event.target.value, 10),
                      )
                    }
                    aria-label={control.label}
                    title={control.label}
                    className="w-full accent-[var(--accent)] h-1 bg-[var(--border)] rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              ))}
            </div>

            <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3">
              <div className="flex items-center justify-between gap-3">
                <label className="text-[10px] font-bold text-[var(--muted)] uppercase flex items-center gap-2">
                  <Crop size={10} /> Crop Window
                </label>
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...data,
                      imageCrop: { x: 0, y: 0, width: 100, height: 100 },
                    })
                  }
                  className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] hover:text-[var(--text)] transition-colors flex items-center gap-1">
                  <RotateCcw size={10} /> Reset
                </button>
              </div>

              {[
                {
                  label: "Crop X",
                  key: "x" as const,
                  min: 0,
                  max: Math.max(5, 100 - data.imageCrop.width),
                  step: 1,
                  value: data.imageCrop.x,
                },
                {
                  label: "Crop Y",
                  key: "y" as const,
                  min: 0,
                  max: Math.max(5, 100 - data.imageCrop.height),
                  step: 1,
                  value: data.imageCrop.y,
                },
                {
                  label: "Crop Width",
                  key: "width" as const,
                  min: 20,
                  max: 100 - data.imageCrop.x,
                  step: 1,
                  value: data.imageCrop.width,
                },
                {
                  label: "Crop Height",
                  key: "height" as const,
                  min: 20,
                  max: 100 - data.imageCrop.y,
                  step: 1,
                  value: data.imageCrop.height,
                },
              ].map((control) => (
                <div key={control.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                    <span>{control.label}</span>
                    <span>{control.value}%</span>
                  </div>
                  <input
                    type="range"
                    min={control.min}
                    max={control.max}
                    step={control.step}
                    value={control.value}
                    onChange={(event) =>
                      updateCrop(
                        control.key,
                        Number.parseInt(event.target.value, 10),
                      )
                    }
                    aria-label={control.label}
                    title={control.label}
                    className="w-full accent-[var(--accent)] h-1 bg-[var(--border)] rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
