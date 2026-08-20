const STORAGE_KEY = "resto-inv-v3";

const DB_URL = import.meta.env.VITE_INVENTORY_DB_URL;
const DB_AUTH_TOKEN = import.meta.env.VITE_INVENTORY_DB_AUTH_TOKEN;

function hasDatabaseConfig() {
  return typeof DB_URL === "string" && DB_URL.trim().length > 0;
}

function buildHeaders() {
  const headers = { "Content-Type": "application/json" };

  if (DB_AUTH_TOKEN) {
    headers.Authorization = `Bearer ${DB_AUTH_TOKEN}`;
  }

  return headers;
}

async function loadFromDatabase() {
  if (!hasDatabaseConfig()) return null;

  const response = await fetch(DB_URL, {
    method: "GET",
    headers: buildHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Database load failed (${response.status})`);
  }

  const payload = await response.json();

  if (!payload || typeof payload !== "object") return null;

  // Supports direct payload shape ({items, counts}) or wrapped shape ({data: {items, counts}})
  return payload.data && typeof payload.data === "object" ? payload.data : payload;
}

async function saveToDatabase(data) {
  if (!hasDatabaseConfig()) return false;

  const response = await fetch(DB_URL, {
    method: "PUT",
    headers: buildHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Database save failed (${response.status})`);
  }

  return true;
}

function loadFromLocalStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveToLocalStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export async function loadInventoryData() {
  try {
    const fromDb = await loadFromDatabase();
    if (fromDb) {
      saveToLocalStorage(fromDb);
      return fromDb;
    }
  } catch {
    // Fall back to localStorage if DB is unavailable.
  }

  return loadFromLocalStorage();
}

export async function saveInventoryData(data) {
  const localSaved = saveToLocalStorage(data);

  try {
    const dbSaved = await saveToDatabase(data);
    return dbSaved || localSaved;
  } catch {
    // If DB fails, keep app usable with local persistence.
    return localSaved;
  }
}

// ── Suppliers, read-only from the supplier-compare app ─────────────────
// Suppliers are managed in that app only. We just mirror the names here
// so this app's vendor picker stays in sync without duplicate/misspelled
// entries. If the fetch fails for any reason, we simply fall back to an
// empty list — this app keeps working exactly as it always has.

const SUPPLIER_NAMES_CACHE_KEY = "resto-inv-v3-supplier-names-cache";

const SUPPLIER_COMPARE_API_URL =
  import.meta.env.VITE_SUPPLIER_COMPARE_API_URL ||
  "https://riobravito-supplier-compare.vercel.app/api/suppliers";

export async function loadSupplierNames() {
  try {
    const res = await fetch(SUPPLIER_COMPARE_API_URL, { method: "GET" });
    if (!res.ok) throw new Error(`Supplier fetch failed (${res.status})`);
    const payload = await res.json();
    const names = Array.isArray(payload?.suppliers)
      ? payload.suppliers.map((s) => s.name).filter(Boolean)
      : [];
    try {
      localStorage.setItem(SUPPLIER_NAMES_CACHE_KEY, JSON.stringify(names));
    } catch {
      // ignore cache write failures
    }
    return names;
  } catch {
    try {
      const raw = localStorage.getItem(SUPPLIER_NAMES_CACHE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}