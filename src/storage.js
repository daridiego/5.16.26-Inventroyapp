const STORAGE_KEY = "resto-inv-v3";
const SHARE_PARAM = "inv";

function parseSharedData() {
  try {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get(SHARE_PARAM);
    if (!encoded) return null;
    const json = atob(encoded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function writeSharedData(data) {
  try {
    const params = new URLSearchParams(window.location.search);
    params.set(SHARE_PARAM, btoa(JSON.stringify(data)));
    const query = params.toString();
    const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
    window.history.replaceState({}, "", nextUrl);
    return true;
  } catch {
    return false;
  }
}

export async function loadInventoryData() {
  const sharedData = parseSharedData();
  if (sharedData) return sharedData;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function saveInventoryData(data) {
  let saved = false;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    saved = true;
  } catch {
    // ignore localStorage failures and still try to persist in URL
  }

  return writeSharedData(data) || saved;
}
