/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import {
  Plus,
  Copy,
  Trash2,
  Download,
  FileText,
  Upload,
  Moon,
  Sun,
  BadgePlus,
  Users,
  Sparkles,
  CheckCircle2,
  Clock3,
  Menu,
  ChevronDown,
  Eye,
  X,
} from "lucide-react";
import { jsPDF } from "jspdf";
import {
  AlignmentType,
  Document,
  ImageRun,
  Packer,
  PageBreak,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import { CardConfig, EmployeeRecord, ExportProgress, UserData } from "./types";
import DataEntry from "./components/DataEntry";
import TemplateEditor from "./components/TemplateEditor";
import IDCard from "./components/IDCard.tsx";
import {
  createEmployeeRecord,
  duplicateEmployeeRecord,
  loadPersistedBatch,
  parseEmployeeCsv,
  renderTransformedImage,
  savePersistedBatch,
} from "./lib/employeeStore";

type WorkspaceTab = "employees" | "template" | "export";

const THEME_KEY = "hr-id-card-automata.theme";
const TEMPLATE_KEY = "hr-id-card-automata.template";

const DEFAULT_TEMPLATE: CardConfig = {
  font: "font-sans",
  colors: {
    primary: "#242424",
    secondary: "#FFFFFF",
    text: "#111827",
    accent: "#0f4761",
  },
  elements: {
    avatar: { x: 16, y: 16, size: 110, rounded: 4 },
    title: { x: 240, y: 24, size: 20, weight: "black" },
    subtitle: { x: 240, y: 54, size: 12, weight: "medium" },
    badge: { x: 16, y: 140, size: 10, weight: "bold" },
  },
};

const SAMPLE_EMPLOYEES: EmployeeRecord[] = [
  createEmployeeRecord(
    {
      fullName: "Abraham Bamidele",
      department: "Communications",
      role: "Lead Graphics Designer (Senior Officer 3)",
      idNumber: "COMMS021",
      imageUrl: null,
      issueDate: new Date().toISOString().split("T")[0],
    },
    0,
  ),
  createEmployeeRecord(
    {
      fullName: "Esther Adaigbe",
      department: "Finance",
      role: "Team Lead Supervisor 2",
      idNumber: "FIN0831",
      imageUrl: null,
      issueDate: new Date().toISOString().split("T")[0],
    },
    1,
  ),
  createEmployeeRecord(
    {
      fullName: "Deborah",
      department: "Creative Services",
      role: "Copywriting & creative lead. Senior officer 1",
      idNumber: "FIN0831",
      imageUrl: null,
      issueDate: new Date().toISOString().split("T")[0],
    },
    2,
  ),
];

function nextFrame() {
  return new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

function dataUrlToBytes(dataUrl: string) {
  const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("employees");
  const [template, setTemplate] = useState<CardConfig>(DEFAULT_TEMPLATE);
  const [employees, setEmployees] =
    useState<EmployeeRecord[]>(SAMPLE_EMPLOYEES);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [progress, setProgress] = useState<ExportProgress>({
    phase: "Ready",
    percent: 0,
    status: "idle",
  });
  const [isHydrated, setIsHydrated] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return localStorage.getItem(THEME_KEY) === "dark";
  });
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const csvInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const theme = isDarkTheme ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
  }, [isDarkTheme]);

  useEffect(() => {
    const savedTemplate = localStorage.getItem(TEMPLATE_KEY);

    if (!savedTemplate) {
      return;
    }

    try {
      setTemplate(JSON.parse(savedTemplate) as CardConfig);
    } catch {
      localStorage.removeItem(TEMPLATE_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(TEMPLATE_KEY, JSON.stringify(template));
  }, [template]);

  useEffect(() => {
    let active = true;

    loadPersistedBatch()
      .then((savedBatch) => {
        if (!active) {
          return;
        }

        if (savedBatch) {
          setEmployees(savedBatch.employees);
          setSelectedIndex(savedBatch.selectedIndex);
        }

        setIsHydrated(true);
      })
      .catch(() => {
        if (active) {
          setIsHydrated(true);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    savePersistedBatch({ employees, selectedIndex }).catch(() => {
      setProgress({
        phase: "Saving batch failed",
        percent: 0,
        status: "error",
      });
    });
  }, [employees, isHydrated, selectedIndex]);

  const selectedEmployee = employees[selectedIndex] ?? employees[0];
  const queuedCount = employees.length;

  const updateSelectedEmployee = (next: UserData) => {
    setEmployees((current) =>
      current.map((employee, index) =>
        index === selectedIndex ? { ...employee, ...next } : employee,
      ),
    );
  };

  const addEmployee = () => {
    const nextIndex = employees.length;
    setEmployees((current) => [
      ...current,
      createEmployeeRecord({}, current.length),
    ]);
    setSelectedIndex(nextIndex);
    setActiveTab("employees");
  };

  const duplicateEmployee = () => {
    if (!selectedEmployee) {
      return;
    }

    const nextIndex = employees.length;
    setEmployees((current) => [
      ...current,
      duplicateEmployeeRecord(selectedEmployee, current.length),
    ]);
    setSelectedIndex(nextIndex);
  };

  const removeEmployee = () => {
    if (employees.length === 1) {
      return;
    }

    setEmployees((current) =>
      current.filter((_, index) => index !== selectedIndex),
    );
    setSelectedIndex((current) => Math.max(0, current - 1));
  };

  const resetSampleBatch = () => {
    setEmployees(SAMPLE_EMPLOYEES);
    setSelectedIndex(0);
    setActiveTab("employees");
  };

  const openCsvPicker = () => {
    csvInputRef.current?.click();
  };

  const handleCsvImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const importedRows = parseEmployeeCsv(text);

      if (importedRows.length === 0) {
        setProgress({
          phase: "No CSV rows found",
          percent: 0,
          status: "error",
        });
        return;
      }

      const importedEmployees = importedRows.map((row, index) =>
        createEmployeeRecord(row, index),
      );

      setEmployees(importedEmployees);
      setSelectedIndex(0);
      setActiveTab("employees");
      setProgress({
        phase: `Imported ${importedEmployees.length} employee rows`,
        percent: 100,
        status: "complete",
      });
    } catch {
      setProgress({
        phase: "CSV import failed",
        percent: 0,
        status: "error",
      });
    }
  };

  const exportFileName = useMemo(() => {
    const stamp = new Date().toISOString().split("T")[0];
    return `hr-id-cards-${stamp}`;
  }, []);

  const exportPdf = async () => {
    if (!employees.length) {
      return;
    }

    setProgress({
      phase: "Preparing PDF export",
      percent: 10,
      status: "working",
    });
    await nextFrame();

    const doc = new jsPDF({
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    const contentWidth = pageWidth - margin * 2;

    for (const [index, employee] of employees.entries()) {
      if (index > 0) {
        doc.addPage();
      }

      const baseTop = 12;

      doc.setDrawColor(17, 24, 39);
      doc.setLineWidth(0.4);
      doc.rect(margin, margin, contentWidth, pageHeight - margin * 2);

      const columnY = baseTop + 8;
      const tableHeight = 18;
      const columns = [64, 32, contentWidth - 96];
      const cells = [
        employee.fullName || "Employee Name",
        employee.idNumber || "EMP-001",
        `${employee.department || "Department"} • ${employee.role || "Role"}`,
      ];

      let currentX = margin;
      columns.forEach((width, columnIndex) => {
        doc.rect(currentX, columnY, width, tableHeight);
        doc.setFontSize(columnIndex === 2 ? 10 : 11);
        doc.setTextColor(17, 24, 39);
        const text = doc.splitTextToSize(cells[columnIndex], width - 4);
        doc.text(text, currentX + 2, columnY + 7);
        currentX += width;
      });

      const imageTop = columnY + tableHeight + 8;
      const imageHeight = 118;
      doc.rect(margin, imageTop, contentWidth, imageHeight);

      if (employee.imageUrl) {
        try {
          const renderedImage = await renderTransformedImage(
            employee.imageUrl,
            employee.imageTransform,
            Math.round((contentWidth - 2) * 8),
            Math.round((imageHeight - 2) * 8),
            employee.imageCrop,
          );

          doc.addImage(
            renderedImage,
            "PNG",
            margin + 1,
            imageTop + 1,
            contentWidth - 2,
            imageHeight - 2,
            undefined,
            "FAST",
          );
        } catch {
          doc.setFontSize(12);
          doc.setTextColor(102, 112, 133);
          doc.text(
            "Photo could not be embedded in PDF preview.",
            margin + 10,
            imageTop + 58,
          );
        }
      } else {
        doc.setFontSize(12);
        doc.setTextColor(102, 112, 133);
        doc.text(
          "Photo placeholder - upload an image to embed it here.",
          margin + 10,
          imageTop + 58,
        );
      }

      doc.setFontSize(9);
      doc.setTextColor(15, 118, 110);
      doc.text(
        `Issue Date: ${employee.issueDate}`,
        margin + 2,
        imageTop + imageHeight + 8,
      );

      if (index < employees.length - 1) {
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(
          `Batch ${index + 1} of ${employees.length}`,
          pageWidth / 2,
          pageHeight - 8,
          {
            align: "center",
          },
        );
      }

      setProgress({
        phase: `Rendering PDF page ${index + 1} of ${employees.length}`,
        percent: Math.round(((index + 1) / employees.length) * 80),
        status: "working",
      });
      await nextFrame();
    }

    setProgress({ phase: "Saving PDF", percent: 85, status: "working" });
    await nextFrame();
    doc.save(`${exportFileName}.pdf`);
    setProgress({
      phase: "PDF export complete",
      percent: 100,
      status: "complete",
    });
  };

  const exportDocx = async () => {
    if (!employees.length) {
      return;
    }

    setProgress({
      phase: "Preparing DOCX export",
      percent: 10,
      status: "working",
    });
    await nextFrame();

    const children: Array<Paragraph | Table> = [];

    for (const [index, employee] of employees.entries()) {
      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 35, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph(employee.fullName || "Employee Name"),
                  ],
                }),
                new TableCell({
                  width: { size: 18, type: WidthType.PERCENTAGE },
                  children: [new Paragraph(employee.idNumber || "EMP-001")],
                }),
                new TableCell({
                  width: { size: 47, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph(
                      `${employee.department || "Department"} • ${employee.role || "Role"}`,
                    ),
                  ],
                }),
              ],
            }),
          ],
        }),
      );

      if (employee.imageUrl) {
        try {
          const renderedImage = await renderTransformedImage(
            employee.imageUrl,
            employee.imageTransform,
            1400,
            980,
            employee.imageCrop,
          );

          children.push(
            new Paragraph({
              children: [
                new ImageRun({
                  data: dataUrlToBytes(renderedImage) as any,
                  transformation: { width: 600, height: 420 },
                } as any),
              ],
            }),
          );
        } catch {
          children.push(
            new Paragraph("Photo could not be embedded in DOCX export."),
          );
        }
      } else {
        children.push(
          new Paragraph(
            "Photo placeholder - upload an image to embed it here.",
          ),
        );
      }

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Issue Date: ${employee.issueDate}`,
              size: 16,
            }),
          ],
        }),
      );

      if (index < employees.length - 1) {
        children.push(new Paragraph({ children: [new PageBreak()] }));
      }

      setProgress({
        phase: `Rendering DOCX page ${index + 1} of ${employees.length}`,
        percent: Math.round(((index + 1) / employees.length) * 80),
        status: "working",
      });
      await nextFrame();
    }

    const doc = new Document({ sections: [{ children }] });

    setProgress({ phase: "Saving DOCX", percent: 85, status: "working" });
    await nextFrame();
    const blob = await Packer.toBlob(doc);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${exportFileName}.docx`;
    link.click();
    URL.revokeObjectURL(link.href);
    setProgress({
      phase: "DOCX export complete",
      percent: 100,
      status: "complete",
    });
  };

  const statusTone =
    progress.status === "error"
      ? "text-red-600"
      : progress.status === "complete"
        ? "text-emerald-700"
        : "text-slate-600";

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <header className="sticky top-0 z-30 border-b border-[var(--border)]/70 bg-[var(--bg)]/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-6">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--muted)]">
                <BadgePlus size={12} />
                HR ID Card Automata
              </div>
              <p className="mt-1 text-sm font-semibold text-[var(--text)]">
                Batch input, sample-aligned preview, PDF/DOCX export
              </p>
            </div>

            <div className="hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 md:block">
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--muted)]">
                Batch Queue
              </div>
              <div className="mt-1 flex items-center gap-2 text-sm font-semibold">
                <Users size={14} />
                {queuedCount} employees queued
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <button
              className="secondary-button"
              onClick={() => setIsDarkTheme((current) => !current)}
              title="Toggle theme"
              aria-label="Toggle theme">
              {isDarkTheme ? <Sun size={16} /> : <Moon size={16} />}
              {isDarkTheme ? "Light theme" : "Dark theme"}
            </button>
            <button className="secondary-button" onClick={exportPdf}>
              <Download size={16} />
              Export PDF
            </button>
            <button className="primary-button" onClick={exportDocx}>
              <FileText size={16} />
              Export DOCX
            </button>
          </div>

          <div className="relative flex items-center gap-2 md:hidden">
            <button
              className="secondary-button"
              onClick={() => setIsPreviewOpen(true)}>
              <Eye size={16} />
              Preview
            </button>
            <button
              className="secondary-button"
              onClick={() => setIsHeaderMenuOpen((current) => !current)}
              aria-controls="mobile-header-menu"
              aria-label="Open export and theme menu">
              <Menu size={16} />
              More
              <ChevronDown size={14} />
            </button>
            {isHeaderMenuOpen ? (
              <div
                id="mobile-header-menu"
                className="absolute right-0 top-full z-40 mt-2 w-56 rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-2 shadow-2xl">
                <button
                  className="mobile-menu-button"
                  onClick={() => {
                    setIsHeaderMenuOpen(false);
                    setIsDarkTheme((current) => !current);
                  }}>
                  <span className="flex items-center gap-2">
                    {isDarkTheme ? <Sun size={16} /> : <Moon size={16} />}
                    {isDarkTheme ? "Light theme" : "Dark theme"}
                  </span>
                </button>
                <button
                  className="mobile-menu-button"
                  onClick={() => {
                    setIsHeaderMenuOpen(false);
                    void exportPdf();
                  }}>
                  <span className="flex items-center gap-2">
                    <Download size={16} />
                    Export PDF
                  </span>
                </button>
                <button
                  className="mobile-menu-button"
                  onClick={() => {
                    setIsHeaderMenuOpen(false);
                    void exportDocx();
                  }}>
                  <span className="flex items-center gap-2">
                    <FileText size={16} />
                    Export DOCX
                  </span>
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1600px] gap-6 px-4 py-6 lg:grid-cols-[420px_minmax(0,1fr)] lg:px-6 xl:grid-cols-[460px_minmax(0,1fr)]">
        <section className="panel flex min-h-0 flex-col border border-[var(--border)] p-4 shadow-xl">
          <input
            ref={csvInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            title="Import employee CSV"
            aria-label="Import employee CSV"
            onChange={handleCsvImport}
          />

          <div className="segment">
            {(["employees", "template", "export"] as const).map((tab) => (
              <button
                key={tab}
                className={
                  tab === activeTab ? "segment-active" : "segment-inactive"
                }
                onClick={() => setActiveTab(tab)}
                type="button">
                {tab === "employees"
                  ? "Employees"
                  : tab === "template"
                    ? "Template"
                    : "Export"}
              </button>
            ))}
          </div>

          <div className="mt-4 flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
            {activeTab === "employees" && (
              <>
                <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-3">
                  <DataEntry
                    data={selectedEmployee}
                    onChange={updateSelectedEmployee}
                  />
                </div>

                <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-3">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="eyebrow">Batch list</p>
                      <p className="text-sm text-[var(--muted)]">
                        Select a row to edit a single employee, or keep adding
                        rows for a batch export.
                      </p>
                    </div>
                    <button className="mini-button" onClick={resetSampleBatch}>
                      Reset sample
                    </button>
                  </div>
                  <p className="mb-3 text-xs text-[var(--muted)]">
                    CSV headers supported: fullName, department, role, idNumber,
                    issueDate, imageUrl, imageScale, imageOffsetX, imageOffsetY,
                    imageCropX, imageCropY, imageCropWidth, imageCropHeight.
                  </p>

                  <div className="max-h-[260px] overflow-y-auto rounded-2xl border border-[var(--border)]">
                    {employees.map((employee, index) => (
                      <button
                        key={employee.id}
                        className={`w-full border-b border-[var(--border)] px-3 py-3 text-left transition last:border-b-0 ${index === selectedIndex ? "bg-[var(--accent-soft)]" : "bg-transparent hover:bg-black/5"}`}
                        onClick={() => setSelectedIndex(index)}
                        type="button">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-[var(--text)]">
                              {employee.fullName || "Untitled employee"}
                            </p>
                            <p className="text-xs text-[var(--muted)]">
                              {employee.idNumber} ·{" "}
                              {employee.department || "No department"}
                            </p>
                          </div>
                          <span className="cell-label">{index + 1}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-3">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="eyebrow">Actions</p>
                      <p className="text-sm text-[var(--muted)]">
                        Quick batch tools with icon-first controls on mobile.
                      </p>
                    </div>
                    <span className="cell-label">5</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2 md:flex md:flex-wrap">
                    {[
                      {
                        label: "Add row",
                        icon: Plus,
                        onClick: addEmployee,
                        disabled: false,
                      },
                      {
                        label: "Duplicate",
                        icon: Copy,
                        onClick: duplicateEmployee,
                        disabled: !selectedEmployee,
                      },
                      {
                        label: "Remove",
                        icon: Trash2,
                        onClick: removeEmployee,
                        disabled: employees.length <= 1,
                      },
                      {
                        label: "Import CSV",
                        icon: Upload,
                        onClick: openCsvPicker,
                        disabled: false,
                      },
                      {
                        label: "Sample CSV",
                        icon: FileText,
                        onClick: () =>
                          window.open(
                            "/sample-employee-batch.csv",
                            "_blank",
                            "noopener,noreferrer",
                          ),
                        disabled: false,
                      },
                    ].map((action) => (
                      <button
                        key={action.label}
                        className="icon-action-button"
                        onClick={action.onClick}
                        disabled={action.disabled}
                        type="button"
                        title={action.label}
                        aria-label={action.label}>
                        <action.icon size={22} />
                        <span className="icon-action-label">
                          {action.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === "template" && (
              <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-3">
                <TemplateEditor
                  config={template}
                  onChange={setTemplate}
                  onReset={() => setTemplate(DEFAULT_TEMPLATE)}
                />
              </div>
            )}

            {activeTab === "export" && (
              <div className="space-y-4 rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-4">
                <div>
                  <p className="eyebrow">Export status</p>
                  <h2 className="mt-2 text-xl font-bold text-[var(--text)]">
                    Generate one file for all selected employees
                  </h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    PDF and DOCX exports follow the sample document structure:
                    table row, image block, and issue date footer.
                  </p>
                </div>

                <div className="rounded-[22px] border border-[var(--border)] bg-[var(--bg)] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{progress.phase}</p>
                      <p className={`text-xs ${statusTone}`}>
                        {progress.status.toUpperCase()}
                      </p>
                    </div>
                    <div className="text-right text-sm font-bold">
                      {progress.percent}%
                    </div>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/10">
                    <progress
                      className="app-progress w-full"
                      value={progress.percent}
                      max={100}
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <button className="primary-button" onClick={exportPdf}>
                    <Download size={16} />
                    Export PDF
                  </button>
                  <button className="secondary-button" onClick={exportDocx}>
                    <FileText size={16} />
                    Export DOCX
                  </button>
                </div>

                <div className="rounded-[22px] border border-[var(--border)] bg-[var(--bg)] p-4 text-sm text-[var(--muted)]">
                  <div className="flex items-start gap-2">
                    <Sparkles
                      size={16}
                      className="mt-0.5 text-[var(--accent)]"
                    />
                    <p>
                      The output uses the current employee batch, so if you add
                      multiple rows they will be exported into the same PDF/DOCX
                      file with page breaks between records.
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[22px] border border-[var(--border)] bg-[var(--bg)] p-4">
                    <p className="cell-label">Selected employee</p>
                    <p className="mt-2 font-semibold text-[var(--text)]">
                      {selectedEmployee?.fullName || "None selected"}
                    </p>
                  </div>
                  <div className="rounded-[22px] border border-[var(--border)] bg-[var(--bg)] p-4">
                    <p className="cell-label">Queued records</p>
                    <p className="mt-2 font-semibold text-[var(--text)]">
                      {employees.length}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="panel hidden min-h-0 flex-col border border-[var(--border)] p-4 shadow-xl lg:flex">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Live preview</p>
              <h2 className="mt-1 text-2xl font-black text-[var(--text)]">
                Sample-aligned document sheet
              </h2>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-xs font-semibold text-[var(--muted)]">
              <Clock3 size={14} />
              {employees.length} item batch
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-auto rounded-[28px] border border-[var(--border)] bg-[var(--paper-bg)] p-4 shadow-inner">
            {selectedEmployee ? (
              <div className="mx-auto w-[920px] max-w-none">
                <IDCard config={template} data={selectedEmployee} />
              </div>
            ) : (
              <div className="flex h-full min-h-[520px] items-center justify-center rounded-[24px] border border-dashed border-[var(--border)] bg-white/60 text-[var(--muted)]">
                Add an employee to preview the sheet here.
              </div>
            )}

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {employees.map((employee, index) => (
                <div
                  key={employee.id}
                  className="rounded-[22px] border border-[var(--border)] bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-[var(--paper-text)]">
                      {employee.fullName}
                    </p>
                    {index === selectedIndex ? (
                      <CheckCircle2 size={16} className="text-emerald-600" />
                    ) : null}
                  </div>
                  <p className="mt-2 text-xs text-[var(--paper-muted)]">
                    {employee.idNumber}
                  </p>
                  <p className="mt-1 text-sm text-[var(--paper-text)]">
                    {employee.department || "Department"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {isPreviewOpen ? (
          <div
            className="fixed inset-0 z-50 bg-black/55 p-3 lg:hidden"
            role="presentation"
            onClick={() => setIsPreviewOpen(false)}>
            <div
              className="flex h-full flex-col overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--bg)] shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile preview"
              onClick={(event) => event.stopPropagation()}>
              <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-4">
                <div>
                  <p className="eyebrow">Live preview</p>
                  <h2 className="mt-1 text-lg font-black text-[var(--text)]">
                    Batch sheet preview
                  </h2>
                </div>
                <button
                  className="secondary-button"
                  onClick={() => setIsPreviewOpen(false)}
                  aria-label="Close preview">
                  <X size={16} />
                  Close
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-auto bg-[var(--paper-bg)] p-4">
                <div className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-white p-3 shadow-inner">
                  {selectedEmployee ? (
                    <div className="mx-auto w-[920px] max-w-none">
                      <IDCard config={template} data={selectedEmployee} />
                    </div>
                  ) : (
                    <div className="flex h-full min-h-[480px] items-center justify-center rounded-[24px] border border-dashed border-[var(--border)] bg-white/60 text-[var(--muted)]">
                      Add an employee to preview the sheet here.
                    </div>
                  )}
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {employees.map((employee, index) => (
                    <div
                      key={employee.id}
                      className="rounded-[22px] border border-[var(--border)] bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-[var(--paper-text)]">
                          {employee.fullName}
                        </p>
                        {index === selectedIndex ? (
                          <CheckCircle2
                            size={16}
                            className="text-emerald-600"
                          />
                        ) : null}
                      </div>
                      <p className="mt-2 text-xs text-[var(--paper-muted)]">
                        {employee.idNumber}
                      </p>
                      <p className="mt-1 text-sm text-[var(--paper-text)]">
                        {employee.department || "Department"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </main>

      <footer className="border-t border-[var(--border)] bg-[var(--bg)]">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-2 px-4 py-4 text-sm text-[var(--muted)] lg:flex-row lg:items-center lg:justify-between lg:px-6">
          <div>
            Ready for offline use, local template storage, and batch export.
          </div>
          <div className="font-semibold">
            Built by{" "}
            <a
              href="https://sotonye-dagogo.is-a.dev"
              target="_blank"
              rel="noreferrer noopener"
              className="underline">
              S.D.
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
