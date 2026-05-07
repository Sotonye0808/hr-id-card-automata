/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Search,
  X,
} from "lucide-react";
import { detectFieldMappings } from "../lib/employeeStore";

export interface ImportWizardProps {
  headers: string[];
  rawRows: string[][];
  onConfirm: (
    selectedRows: string[][],
    fieldToHeaderMap: Map<string, number | null>,
  ) => void;
  onCancel: () => void;
}

const TARGET_FIELDS = [
  { key: "fullName", label: "📝 Full Name", required: true },
  { key: "department", label: "🏢 Department/Grade", required: false },
  { key: "role", label: "💼 Role/Position", required: false },
  { key: "idNumber", label: "🔢 ID/Code", required: true },
  { key: "issueDate", label: "📅 Issue Date", required: false },
];

export default function ImportWizard({
  headers,
  rawRows,
  onConfirm,
  onCancel,
}: ImportWizardProps) {
  const [step, setStep] = useState<"mapping" | "select">("mapping");
  const [fieldToHeaderMap, setFieldToHeaderMap] = useState<
    Map<string, number | null>
  >(new Map());
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [searchFilter, setSearchFilter] = useState("");

  // Initialize mappings and selected rows on mount
  useEffect(() => {
    const detected = detectFieldMappings(headers);
    const fieldMap = new Map<string, number | null>();

    TARGET_FIELDS.forEach((field) => {
      const mapping = detected.find((m) => m.targetField === field.key);
      if (mapping) {
        const sourceIndex = headers.indexOf(mapping.sourceHeader);
        fieldMap.set(field.key, sourceIndex >= 0 ? sourceIndex : null);
      }
    });

    setFieldToHeaderMap(fieldMap);
    setSelectedRows(new Set(rawRows.map((_, i) => i)));
  }, [headers, rawRows]);

  const updateFieldMapping = (
    targetField: string,
    headerIndex: number | null,
  ) => {
    const newMap = new Map(fieldToHeaderMap);
    newMap.set(targetField, headerIndex);
    setFieldToHeaderMap(newMap);
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

  const hasValidMappings = TARGET_FIELDS.some(
    (field) => field.required && fieldToHeaderMap.get(field.key) !== null,
  );
  const hasSelectedRows = selectedRows.size > 0;

  const handleConfirm = () => {
    const selectedData = Array.from(selectedRows)
      .sort()
      .map((i) => rawRows[i]);

    const dataWithHeaders = [headers, ...selectedData];
    onConfirm(dataWithHeaders, fieldToHeaderMap);
  };

  // Filter rows based on search
  const filteredRowIndices = rawRows
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => {
      if (!searchFilter.trim()) return true;
      const searchLower = searchFilter.toLowerCase();
      return row.some((cell) =>
        String(cell ?? "")
          .toLowerCase()
          .includes(searchLower),
      );
    })
    .map(({ index }) => index);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-[24px] border border-[var(--border)] bg-[var(--bg)] shadow-2xl">
        {/* Header */}
        <div className="border-b border-[var(--border)] px-6 py-4">
          <h2 className="text-lg font-bold text-[var(--text)]">
            Import Spreadsheet Data
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {step === "mapping"
              ? "Assign columns to template fields"
              : "Select rows to import"}
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {step === "mapping" ? (
            <div className="space-y-4">
              {/* Field Mappings */}
              <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-4">
                <div className="mb-4">
                  <p className="eyebrow">Map Template Fields</p>
                  <p className="text-xs text-[var(--muted)]">
                    Select which imported column corresponds to each card field
                  </p>
                </div>

                <div className="space-y-3">
                  {TARGET_FIELDS.map((field) => (
                    <div
                      key={field.key}
                      className="flex flex-col gap-3 rounded-lg bg-[var(--bg)] p-3 sm:flex-row sm:items-center">
                      <div className="flex-shrink-0 sm:w-[160px]">
                        <label className="text-sm font-semibold text-[var(--text)]">
                          {field.label}
                          {field.required && (
                            <span className="text-red-500"> *</span>
                          )}
                        </label>
                      </div>

                      <div className="hidden text-xs text-[var(--muted)] sm:block">
                        →
                      </div>

                      <select
                        value={fieldToHeaderMap.get(field.key) ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          updateFieldMapping(
                            field.key,
                            value ? Number.parseInt(value, 10) : null,
                          );
                        }}
                        className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)]">
                        <option value="">Choose column...</option>
                        {headers.map((header, idx) => (
                          <option key={idx} value={idx}>
                            {header}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>

                {/* Auto-detection hint */}
                <div className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
                  <p className="font-medium">💡 Auto-Detected Matches</p>
                  <p className="mt-1 text-xs">
                    {detectFieldMappings(headers)
                      .map((m) => `${m.sourceHeader} → ${m.targetField}`)
                      .join(", ") ||
                      "Manual assignment needed for your column names"}
                  </p>
                </div>
              </div>

              {/* Row Preview */}
              <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-4">
                <p className="eyebrow">Data Preview</p>
                <p className="text-xs text-[var(--muted)]">
                  {rawRows.length} rows detected
                </p>

                <div className="mt-3 max-h-[220px] overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--bg)]">
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
                      Map at least the required fields (Full Name & ID) to
                      continue.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Row Selection with Search */}
              <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-4">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="eyebrow">Select Rows to Import</p>
                    <p className="text-xs text-[var(--muted)]">
                      {selectedRows.size} of {filteredRowIndices.length} rows
                      selected
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={selectAllRows}
                      className="mini-button"
                      type="button"
                      title="Select all visible rows">
                      All
                    </button>
                    <button
                      onClick={deselectAllRows}
                      className="mini-button"
                      type="button"
                      title="Deselect all rows">
                      None
                    </button>
                    <button
                      onClick={invertSelection}
                      className="mini-button"
                      type="button"
                      title="Invert selection">
                      Invert
                    </button>
                  </div>
                </div>

                {/* Search Box */}
                <div className="relative mb-3">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                  />
                  <input
                    type="text"
                    placeholder="Search rows by any value..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] pl-10 pr-3 py-2 text-sm text-[var(--text)] placeholder-[var(--muted)]"
                  />
                  {searchFilter && (
                    <button
                      onClick={() => setSearchFilter("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--text)]"
                      type="button"
                      title="Clear search">
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Filtered Rows List */}
                <div className="max-h-[350px] space-y-2 overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3">
                  {filteredRowIndices.length === 0 ? (
                    <div className="flex h-20 items-center justify-center text-center text-sm text-[var(--muted)]">
                      No rows match the search filter
                    </div>
                  ) : (
                    filteredRowIndices.map((rowIndex) => {
                      const isSelected = selectedRows.has(rowIndex);
                      const row = rawRows[rowIndex];
                      // Try to get a representative string from the row
                      const firstNonEmpty = row.find((cell) =>
                        String(cell ?? "").trim(),
                      );
                      const displayText = String(
                        firstNonEmpty ?? row[0] ?? "",
                      ).slice(0, 50);

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
                          <span className="flex-1 truncate text-sm text-[var(--text)] font-medium">
                            {displayText || "(empty row)"}
                          </span>
                          <span className="text-xs text-[var(--muted)]">
                            Row {rowIndex + 1}
                          </span>
                        </button>
                      );
                    })
                  )}
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
          <button onClick={onCancel} className="secondary-button" type="button">
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
                step === "mapping" ? () => setStep("select") : handleConfirm
              }
              disabled={
                step === "mapping" ? !hasValidMappings : !hasSelectedRows
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
