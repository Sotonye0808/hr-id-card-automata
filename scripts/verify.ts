import assert from "node:assert/strict";
import {
    createEmployeeRecord,
    createDefaultImageTransform,
    duplicateEmployeeRecord,
    loadPersistedBatch,
    parseEmployeeCsv,
    savePersistedBatch,
} from "../src/lib/employeeStore";

class FakeLocalStorage {
    private store = new Map<string, string>();

    getItem(key: string) {
        return this.store.get(key) ?? null;
    }

    setItem(key: string, value: string) {
        this.store.set(key, value);
    }

    removeItem(key: string) {
        this.store.delete(key);
    }
}

type StoredImage = { id: string; imageUrl: string };

class FakeRequest<T> {
    result: T | undefined;
    error: Error | null = null;
    onsuccess: null | (() => void) = null;
    onerror: null | (() => void) = null;
    onupgradeneeded: null | (() => void) = null;
}

class FakeObjectStore {
    constructor(private readonly store: Map<string, StoredImage>) { }

    get(id: string) {
        const request = new FakeRequest<StoredImage | undefined>();
        queueMicrotask(() => {
            request.result = this.store.get(id);
            request.onsuccess?.();
        });
        return request;
    }

    put(value: StoredImage) {
        const request = new FakeRequest<undefined>();
        queueMicrotask(() => {
            this.store.set(value.id, value);
            request.result = undefined;
            request.onsuccess?.();
        });
        return request;
    }

    delete(id: string) {
        const request = new FakeRequest<undefined>();
        queueMicrotask(() => {
            this.store.delete(id);
            request.result = undefined;
            request.onsuccess?.();
        });
        return request;
    }

    getAllKeys() {
        const request = new FakeRequest<string[]>();
        queueMicrotask(() => {
            request.result = [...this.store.keys()];
            request.onsuccess?.();
        });
        return request;
    }
}

class FakeDatabase {
    readonly objectStoreNames = {
        contains: (name: string) => name === "images",
    };

    constructor(private readonly store: Map<string, StoredImage>) { }

    createObjectStore() {
        return new FakeObjectStore(this.store);
    }

    transaction() {
        return {
            objectStore: () => new FakeObjectStore(this.store),
        };
    }

    close() { }
}

class FakeIndexedDB {
    private readonly store = new Map<string, StoredImage>();

    open() {
        const request = new FakeRequest<FakeDatabase>();
        queueMicrotask(() => {
            const database = new FakeDatabase(this.store);
            request.result = database;
            request.onupgradeneeded?.();
            request.onsuccess?.();
        });
        return request;
    }
}

async function main() {
    const globalScope = globalThis as typeof globalThis & {
        window?: {
            localStorage: FakeLocalStorage;
            indexedDB: FakeIndexedDB;
        };
    };

    const localStorage = new FakeLocalStorage();
    const indexedDB = new FakeIndexedDB();
    globalScope.window = { localStorage, indexedDB };

    const csv = `fullName,department,role,idNumber,issueDate,imageScale,imageOffsetX,imageOffsetY\nJane Doe,Ops,Coordinator,OPS001,2026-05-06,1.2,10,-5\nJohn Roe,Finance,Analyst,FIN002,2026-05-06,0.9,0,15\n`;
    const parsed = parseEmployeeCsv(csv);
    assert.equal(parsed.length, 2);
    assert.equal(parsed[0]?.fullName, "Jane Doe");
    assert.equal(parsed[0]?.department, "Ops");
    assert.equal(parsed[0]?.imageTransform?.scale, 1.2);
    assert.equal(parsed[0]?.imageTransform?.offsetX, 10);
    assert.equal(parsed[0]?.imageTransform?.offsetY, -5);

    const employee = createEmployeeRecord(parsed[0] ?? {}, 0);
    assert.equal(employee.fullName, "Jane Doe");
    const defaultEmployee = createEmployeeRecord({}, 3);
    assert.deepEqual(defaultEmployee.imageTransform, createDefaultImageTransform());

    const duplicate = duplicateEmployeeRecord(employee, 1);
    assert.notEqual(duplicate.id, employee.id);
    assert.match(duplicate.idNumber, /-02$/);

    const batch = [
        {
            ...employee,
            imageUrl: "data:image/png;base64,AAAA",
        },
        createEmployeeRecord(parsed[1] ?? {}, 1),
    ];

    await savePersistedBatch({ employees: batch, selectedIndex: 1 });
    const restored = await loadPersistedBatch();

    assert.ok(restored);
    assert.equal(restored?.selectedIndex, 1);
    assert.equal(restored?.employees.length, 2);
    assert.equal(restored?.employees[0].fullName, "Jane Doe");
    assert.equal(restored?.employees[0].imageUrl, "data:image/png;base64,AAAA");
    assert.equal(restored?.employees[1].fullName, "John Roe");

    console.log("Verification passed: CSV parsing, persistence, and export-ready batch state are healthy.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
