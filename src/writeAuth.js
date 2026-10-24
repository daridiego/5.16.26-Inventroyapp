// Writes to this app's API require a shared password.
//
// The password is checked on the server against its APP_WRITE_TOKEN
// environment variable. It is deliberately NOT built into this bundle:
// anything compiled into the frontend is readable by anyone who opens the
// deployed site, so a password kept here would protect nothing. Instead it
// is typed once per browser and remembered in localStorage from then on,
// so day-to-day use is unchanged after the first save.
//
// Reads are left open on purpose. The four apps read each other's data
// directly over plain GETs, and none of it is sensitive on its own.

const TOKEN_KEY = "riobravito-write-token";

export function getWriteToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

export function setWriteToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Private browsing or blocked storage: the password just won't be
    // remembered, and the next save will ask for it again.
  }
}

export function clearWriteToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}

export function promptForWriteToken(message) {
  const entered = window.prompt(message || "Enter the save password to continue:");
  if (entered === null) return ""; // cancelled
  const trimmed = entered.trim();
  if (trimmed) setWriteToken(trimmed);
  return trimmed;
}

export function writeHeaders(extra) {
  const headers = { "Content-Type": "application/json", ...(extra || {}) };
  const token = getWriteToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

// Sends a write request, and if the server reports the password missing or
// wrong (401), asks for it once and retries. Every other status is handed
// back untouched, so existing handling of 409 conflicts and other errors
// keeps working exactly as it did before.
export async function fetchWithWriteAuth(url, options = {}) {
  let response = await fetch(url, { ...options, headers: writeHeaders(options.headers) });

  if (response.status === 401) {
    const hadToken = !!getWriteToken();
    clearWriteToken();
    const token = promptForWriteToken(
      hadToken
        ? "That save password wasn't accepted. Enter it again:"
        : "Enter the save password to continue:"
    );
    if (!token) return response;
    response = await fetch(url, { ...options, headers: writeHeaders(options.headers) });
  }

  return response;
}
