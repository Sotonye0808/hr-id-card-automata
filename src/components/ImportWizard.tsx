/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, ChevronDown, ChevronRight, Copy } from "lucide-react";
import { RawImportRow } from "../types";
import { FieldMapping, detectFieldMappings } from "../lib/employeeStore";

export interface ImportWizardProps {
  headers: string[];
  rawRows: string[][];
  onConfirm: (selectedRows: string[][]) => void;
  onCancel: () => void;
}

export default function ImportWizard({
  headers,
  rawRows,
  onConfirm,
  onCancel,
}: ImportWizardProps) {
  const [step, setStep] = useState<"mapping" | "select">("mapping");
  const [mappings, setMappings] = useState<Map<number, string | null>>(new Map());
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [expandedMappings, setExpandedMappings] = useState(false);

  // Initialize mappings and selected rows on mount
  useEffect(() => {
    // Detect initial mappings
    const detected = detectFieldMappings(headers);
    const mappingMap = new Map<number, string | null>();

    headers.forEach((header, index) => {
      const mapping = detected.find((m) => m.sourceHeader === header);
      mappingMap.set(index, mapping?.targetField ?? null);
    });

    setMappings(mappingMap);

    // Select all rows by default
    setSelectedRows(new Set(rawRows.map((_, i) => i)));
  }, [headers, rawRows]);

  const targetFields = ["fullName", "department", "role", "idNumber", "issueDate"];

  const updateMapping = (headerIndex: number, targetField: string | null) => {
    const newMappings = new Map(mappings);
    newMappings.set(headerIndex, targetField);
    setMappings(newMappings);
  };

  const toggleRowSelection = (rowIndex: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(rowIndex)) {
      newSelected.delete(rowIndex);
    } else {
      newSelected.add(rowIndex);
    }
    setSelectedRows(newSelected);
  };

  const selectAllRows = () => {
    setSelectedRows(new Set(rawRows.map((_, i) => i)));
  };

  const deselectAllRows = () => {
    setSelectedRows(new Set());
  };

  const invertSelection = () => {
    const newSelected = new Set<number>();
    rawRows.forEach((_, i) => {
      if (!selectedRows.has(i)) {
        newSelected.add(i);
      }
    });
    setSelectedRows(newSelected);
  };

  const hasValidMappings = Array.from(mappings.values()).some((m) => m !== null);
  const hasSelectedRows = selectedRows.size > 0;

  const handleConfirm = () => {
    const selectedData = Array.from(selectedRows)
      .sort()
      .map((i) => rawRows[i]);

    // Include header row
    const dataWithHeaders = [headers, ...selectedData];
    onConfirm(dataWithHeaders);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-[24px] border border-[var(--border)] bg-[var(--bg)] shadow-2xl">
        {/* Header */}
        <div className="border-b border-[var(--border)] px-6 py-4">
          <h2 className="text-lg font-bold text-[var(--text)]">Import Spreadsheet Data</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {step === "mapping"
              ? "Map columns to template fields"
              : "Select rows to import"}
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {step === "mapping" ? (
            <div className="space-y-4">
              {/* Field Mappings */}
              <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-4">
                <button
                  onClick={() => setExpandedMappings(!expandedMappings)}
                  className="flex w-full items-center justify-between py-2 text-left"
                  type="button">
                  <div>
                    <p className="eyebrow">Field Mappings</p>
                    <p className="text-xs text-[var(--muted)]">
                      Map source columns to ID card template fields
                    </p>
                  </div>
                  {expandedMappings ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>

                {expandedMappings && (
                  <div className="mt-4 space-y-3 border-t border-[var(--border)] pt-4">
                    {headers.map((header, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="flex-1 rounded-lg bg-[var(--bg)] px-3 py-2 text-sm font-medium text-[var(--text)]">
                          {header}
                        </div>
                        <div className="text-xs text-[var(--muted)]">→</div>
                        <select
                          value={mappings.get(index) ?? ""}
                          onChange={(e) =>
                            updateMapping(index, e.target.value || null)
                          }
                          className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)]">
                          <option value="">Not mapped</option>
                          {targetFields.map((field) => (
                            <option key={field} value={field}>
                              {field === "fullName"
                                ? "Full Name"
                                : field === "idNumber"
                                  ? "ID/Code"
                                  : field.charAt(0).toUpperCase() +
                                    field.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Row Preview */}
              <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-4">
                <p className="eyebrow">Data Preview</p>
                <p className="text-xs text-[var(--muted)]">
                  {rawRows.length} rows detected
                </p>

                <div className="mt-3 max-h-[200px] overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--bg)]">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border)]">
                        {headers.map((header, index) => (
                          <th
                            key={index}
                            className="whitespace-nowrap border-r border-[var(--border)] px-3 py-2 text-left font-semibold text-[var(--text)] last:border-r-0">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rawRows.slice(0, 3).map((row, rowIndex) => (
                        <tr
                          key={rowIndex}
                          className="border-b border-[var(--border)] last:border-b-0">
                          {row.map((cell, cellIndex) => (
                            <td
                              key={cellIndex}
                              className="whitespace-nowrap border-r border-[var(--border)] px-3 py-2 text-[var(--muted)] last:border-r-0">
                              {String(cell ?? "").slice(0, 20)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {!hasValidMappings && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
                    <AlertCircle size={16} className="flex-shrink-0" />
                    <p>
                      At least one field should be mapped to recognize the data
                      properly.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Row Selection */}
              <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="eyebrow">Select Rows to Import</p>
                    <p className="text-xs text-[var(--muted)]">
                      {selectedRows.size} of {rawRows.length} rows selected
                    </p>
                  </div>
                  <button
                    onClick={selectAllRows}
                    className="mini-button"
                    type="button">
                    All
                  </button>
                  <button
                    onClick={deselectAllRows}
                    className="mini-button"
                    type="button">
                    None
                  </button>
                  <button
                    onClick={invertSelection}
                    className="mini-button"
                    type="button">
                    Invert
                  </button>
                </div>

                <div className="max-h-[400px] space-y-2 overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3">
                  {rawRows.map((row, rowIndex) => {
                    const isSelected = selectedRows.has(rowIndex);
                    const firstCell = String(row[0] ?? "").slice(0, 50);

                    return (
                      <button
                        key={rowIndex}
                        onClick={() => toggleRowSelection(rowIndex)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition ${
                          isSelected
                            ? "bg-[var(--accent-soft)]"
                            : "bg-transparent hover:bg-black/5"
                        }`}
                        type="button">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          className="h-4 w-4"
                        />
                        <span className="flex-1 truncate text-sm text-[var(--text)]">
                          {firstCell || "(empty row)"}
                        </span>
                        <span className="text-xs text-[var(--muted)]">
                          Row {rowIndex + 1}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {!hasSelectedRows && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
                    <AlertCircle size={16} className="flex-shrink-0" />
                    <p>Select at least one row to import.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[var(--border)] px-6 py-4">
          <button
            onClick={onCancel}
            className="secondary-button"
            type="button">
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {step === "select" && (
              <button
                onClick={() => setStep("mapping")}
                className="secondary-button"
                type="button">
                Back
              </button>
            )}
            <button
              onClick={
                step === "mapping"
                  ? () => setStep("select")
                  : handleConfirm
              }
              disabled={
                step === "mapping"
                  ? !hasValidMappings
                  : !hasSelectedRows
              }
              className="primary-button disabled:opacity-50 disabled:cursor-not-allowed"
              type="button">
              {step === "mapping" ? (
                <>
                  <ChevronRight size={16} />
                  Next
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  Import {selectedRows.size} rows
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
