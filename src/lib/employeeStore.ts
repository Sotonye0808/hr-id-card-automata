/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
    EmployeeImageCrop,
    EmployeeImageTransform,
    EmployeeRecord,
} from "../types";

export interface PersistedBatchState {
    selectedIndex: number;
    employees: EmployeeRecord[];
}

const BATCH_STORAGE_KEY = "hr-id-card-automata.batch";
const DB_NAME = "hr-id-card-automata.images";
const DB_VERSION = 1;
const STORE_NAME = "images";

function today() {
    return new Date().toISOString().split("T")[0];
}

export function createDefaultImageTransform(): EmployeeImageTransform {
    return {
        scale: 1,
        offsetX: 0,
        offsetY: 0,
    };
}

export function createDefaultImageCrop(): EmployeeImageCrop {
    return {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
    };
}

export function createEmployeeId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }

    return `employee-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createEmployeeRecord(
    seed: Partial<EmployeeRecord>,
    index: number,
): EmployeeRecord {
    const id = seed.id ?? createEmployeeId();

    return {
        id,
        employeeId: seed.employeeId ?? seed.idNumber ?? id,
        fullName: seed.fullName ?? `New Employee ${index + 1}`,
        department: seed.department ?? "",
        role: seed.role ?? "",
        idNumber: seed.idNumber ?? `EMP-${String(index + 1).padStart(3, "0")}`,
        imageUrl: seed.imageUrl ?? null,
        issueDate: seed.issueDate ?? today(),
        imageTransform: {
            ...createDefaultImageTransform(),
            ...(seed.imageTransform ?? {}),
        },
        imageCrop: {
            ...createDefaultImageCrop(),
            ...(seed.imageCrop ?? {}),
        },
    };
}

export function duplicateEmployeeRecord(
    seed: EmployeeRecord,
    index: number,
): EmployeeRecord {
    return {
        ...seed,
        id: createEmployeeId(),
        employeeId: `${seed.employeeId}-${String(index + 1).padStart(2, "0")}`,
        fullName: `${seed.fullName} ${index + 1}`.trim(),
        idNumber: `${seed.idNumber}-${String(index + 1).padStart(2, "0")}`,
        imageTransform: {
            ...seed.imageTransform,
        },
        imageCrop: {
            ...seed.imageCrop,
        },
    };
}

function normalizeHeader(value: string) {
    return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function parseDelimitedText(text: string) {
    const rows: string[][] = [];
    let currentField = "";
    let currentRow: string[] = [];
    let inQuotes = false;

    for (let index = 0; index < text.length; index += 1) {
        const character = text[index];
        const nextCharacter = text[index + 1];

        if (character === '"') {
            if (inQuotes && nextCharacter === '"') {
                currentField += '"';
                index += 1;
            } else {
                inQuotes = !inQuotes;
            }
            continue;
        }

        if (character === "," && !inQuotes) {
            currentRow.push(currentField.trim());
            currentField = "";
            continue;
        }

        if ((character === "\n" || character === "\r") && !inQuotes) {
            if (character === "\r" && nextCharacter === "\n") {
                index += 1;
            }

            currentRow.push(currentField.trim());
            if (currentRow.some((cell) => cell.length > 0)) {
                rows.push(currentRow);
            }
            currentRow = [];
            currentField = "";
            continue;
        }

        currentField += character;
    }

    if (currentField.length > 0 || currentRow.length > 0) {
        currentRow.push(currentField.trim());
        if (currentRow.some((cell) => cell.length > 0)) {
            rows.push(currentRow);
        }
    }

    return rows;
}

export function parseEmployeeCsv(text: string): Partial<EmployeeRecord>[] {
    const rows = parseDelimitedText(text.trim());

    if (rows.length === 0) {
        return [];
    }

    const [headerRow, ...dataRows] = rows;
    const headers = headerRow.map(normalizeHeader);

    return dataRows.map((row) => {
        const record: Partial<EmployeeRecord> = {};

        row.forEach((cell, index) => {
            const header = headers[index];

            switch (header) {
                case "fullname":
                case "name":
                case "employeename":
                    record.fullName = cell;
                    break;
                case "department":
                case "dept":
                    record.department = cell;
                    break;
                case "role":
                case "jobtitle":
                case "position":
                    record.role = cell;
                    break;
                case "idnumber":
                case "employeeid":
                case "id":
                case "serial":
                    record.idNumber = cell;
                    break;
                case "issuedate":
                case "date":
                case "issue":
                    record.issueDate = cell;
                    break;
                case "imageurl":
                case "image":
                case "photo":
                    record.imageUrl = cell || null;
                    break;
                case "imagescale":
                    record.imageTransform = {
                        ...(record.imageTransform ?? createDefaultImageTransform()),
                        scale: Number.parseFloat(cell) || 1,
                    };
                    break;
                case "imageoffsetx":
                    record.imageTransform = {
                        ...(record.imageTransform ?? createDefaultImageTransform()),
                        offsetX: Number.parseFloat(cell) || 0,
                    };
                    break;
                case "imageoffsety":
                    record.imageTransform = {
                        ...(record.imageTransform ?? createDefaultImageTransform()),
                        offsetY: Number.parseFloat(cell) || 0,
                    };
                    break;
                case "imagecropx":
                case "cropx":
                    record.imageCrop = {
                        ...(record.imageCrop ?? createDefaultImageCrop()),
                        x: Number.parseFloat(cell) || 0,
                    };
                    break;
                case "imagecropy":
                case "cropy":
                    record.imageCrop = {
                        ...(record.imageCrop ?? createDefaultImageCrop()),
                        y: Number.parseFloat(cell) || 0,
                    };
                    break;
                case "imagecropwidth":
                case "cropwidth":
                    record.imageCrop = {
                        ...(record.imageCrop ?? createDefaultImageCrop()),
                        width: Number.parseFloat(cell) || 100,
                    };
                    break;
                case "imagecropheight":
                case "cropheight":
                    record.imageCrop = {
                        ...(record.imageCrop ?? createDefaultImageCrop()),
                        height: Number.parseFloat(cell) || 100,
                    };
                    break;
                default:
                    break;
            }
        });

        return record;
    });
}

function openDatabase() {
    return new Promise<IDBDatabase | null>((resolve, reject) => {
        if (typeof window === "undefined" || !window.indexedDB) {
            resolve(null);
            return;
        }

        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = () => {
            const database = request.result;
            if (!database.objectStoreNames.contains(STORE_NAME)) {
                database.createObjectStore(STORE_NAME, { keyPath: "id" });
            }
        };

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

function readImage(database: IDBDatabase, employeeId: string) {
    return new Promise<string | null>((resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(employeeId);

        request.onsuccess = () => {
            const result = request.result as { imageUrl?: string } | undefined;
            resolve(result?.imageUrl ?? null);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

async function loadImageMap(employeeIds: string[]) {
    const database = await openDatabase();

    if (!database) {
        return new Map<string, string>();
    }

    const entries = await Promise.all(
        employeeIds.map(async (employeeId) => [employeeId, await readImage(database, employeeId)] as const),
    );

    database.close();
    return new Map(entries.filter(([, imageUrl]) => Boolean(imageUrl)) as Array<readonly [string, string]>);
}

async function writeImage(database: IDBDatabase, employeeId: string, imageUrl: string) {
    return new Promise<void>((resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put({ id: employeeId, imageUrl });

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

async function deleteImage(database: IDBDatabase, employeeId: string) {
    return new Promise<void>((resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(employeeId);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

async function listStoredImageIds(database: IDBDatabase) {
    return new Promise<string[]>((resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAllKeys();

        request.onsuccess = () => {
            resolve(
                (request.result as IDBValidKey[]).map((value) => String(value)),
            );
        };

        request.onerror = () => reject(request.error);
    });
}

export async function loadPersistedBatch() {
    if (typeof window === "undefined") {
        return null;
    }

    const payload = window.localStorage.getItem(BATCH_STORAGE_KEY);
    if (!payload) {
        return null;
    }

    try {
        const parsed = JSON.parse(payload) as PersistedBatchState;
        const normalizedEmployees = parsed.employees.map((employee, index) =>
            createEmployeeRecord(employee, index),
        );
        const imageMap = await loadImageMap(
            normalizedEmployees.map((employee) => employee.id),
        );

        return {
            selectedIndex:
                normalizedEmployees.length > 0
                    ? Math.min(parsed.selectedIndex ?? 0, normalizedEmployees.length - 1)
                    : 0,
            employees: normalizedEmployees.map((employee) => ({
                ...employee,
                imageUrl: imageMap.get(employee.id) ?? employee.imageUrl,
            })),
        };
    } catch {
        window.localStorage.removeItem(BATCH_STORAGE_KEY);
        return null;
    }
}

export async function savePersistedBatch(state: PersistedBatchState) {
    if (typeof window === "undefined") {
        return;
    }

    const database = await openDatabase();
    const payload: PersistedBatchState = {
        selectedIndex: state.selectedIndex,
        employees: state.employees.map((employee) => ({
            ...employee,
            imageUrl: null,
        })),
    };

    window.localStorage.setItem(BATCH_STORAGE_KEY, JSON.stringify(payload));

    if (!database) {
        return;
    }

    const currentIds = new Set(state.employees.map((employee) => employee.id));
    const storedIds = await listStoredImageIds(database);

    await Promise.all(
        state.employees.map((employee) => {
            if (employee.imageUrl) {
                return writeImage(database, employee.id, employee.imageUrl);
            }

            return deleteImage(database, employee.id);
        }),
    );

    await Promise.all(
        storedIds
            .filter((storedId) => !currentIds.has(storedId))
            .map((storedId) => deleteImage(database, storedId)),
    );

    database.close();
}

export async function renderTransformedImage(
    source: string,
    transform: EmployeeImageTransform,
    width: number,
    height: number,
    crop?: EmployeeImageCrop,
) {
    return new Promise<string>((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = "anonymous";
        image.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const context = canvas.getContext("2d");

            if (!context) {
                reject(new Error("Unable to render image canvas"));
                return;
            }

            const cropX = (Math.max(0, Math.min(crop?.x ?? 0, 100)) / 100) * image.naturalWidth;
            const cropY = (Math.max(0, Math.min(crop?.y ?? 0, 100)) / 100) * image.naturalHeight;
            const cropWidth = (Math.max(1, Math.min(crop?.width ?? 100, 100)) / 100) * image.naturalWidth;
            const cropHeight = (Math.max(1, Math.min(crop?.height ?? 100, 100)) / 100) * image.naturalHeight;
            const boundedCropWidth = Math.max(1, Math.min(cropWidth, image.naturalWidth - cropX));
            const boundedCropHeight = Math.max(1, Math.min(cropHeight, image.naturalHeight - cropY));
            const isFullCrop =
                cropX === 0 &&
                cropY === 0 &&
                boundedCropWidth >= image.naturalWidth &&
                boundedCropHeight >= image.naturalHeight;
            const baseScale = isFullCrop
                ? Math.min(width / image.naturalWidth, height / image.naturalHeight)
                : Math.max(width / boundedCropWidth, height / boundedCropHeight);
            const scale = baseScale * transform.scale;
            const drawWidth = boundedCropWidth * scale;
            const drawHeight = boundedCropHeight * scale;
            const offsetX = (transform.offsetX / 100) * width;
            const offsetY = (transform.offsetY / 100) * height;
            const drawX = (width - drawWidth) / 2 + offsetX;
            const drawY = (height - drawHeight) / 2 + offsetY;

            context.clearRect(0, 0, width, height);
            context.drawImage(
                image,
                cropX,
                cropY,
                boundedCropWidth,
                boundedCropHeight,
                drawX,
                drawY,
                drawWidth,
                drawHeight,
            );
            resolve(canvas.toDataURL("image/png"));
        };
        image.onerror = () => reject(new Error("Unable to load image for export"));
        image.src = source;
    });
}