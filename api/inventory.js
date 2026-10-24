// api/inventory.js
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const KEY = "inventory";

async function kv(method, ...args) {
  const res = await fetch(`${UPSTASH_URL}/${method}/${args.map(encodeURIComponent).join("/")}`, {
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
  });
  return res.json();
}

// Writes require the shared save password; reads stay open so the supplier
// compare app, the dish creator, and Quick Order can keep reading this data
// over plain GETs.
//
// The password lives only in this Vercel project's APP_WRITE_TOKEN
// environment variable. It is never part of the frontend bundle, because
// anything built into the frontend can be read by anyone who opens the
// deployed site.
//
// If APP_WRITE_TOKEN isn't set, writes are refused rather than quietly
// allowed: a deployment that lost its environment variable should fail
// loudly instead of silently going back to accepting anonymous writes.
function writeAuthFailure(req) {
  const expected = process.env.APP_WRITE_TOKEN;
  if (!expected) {
    return {
      status: 503,
      body: { error: "Writes are disabled: this deployment has no APP_WRITE_TOKEN set." },
    };
  }
  const header = req.headers.authorization || "";
  const provided = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!provided || provided !== expected) {
    return { status: 401, body: { error: "Save password missing or incorrect." } };
  }
  return null;
}

// Decides whether a PUT can go through, given what's currently stored and the
// incoming request body. Pulled out as a plain function so this concurrency logic
// can be unit-tested without a live Redis connection.
//
// `current` is the parsed value already in Redis (or null if nothing saved yet).
// `body` is the parsed PUT body: { expectedVersion, items, counts, lists }.
//
// If the caller's expectedVersion doesn't match what's actually stored, someone
// else saved in between their read and this write — reject instead of silently
// clobbering that change. A missing expectedVersion (an older client that hasn't
// picked up this change yet) is let through for backward compatibility, but the
// data still gets versioned going forward so newer clients can rely on it.
//
// Note: this is a read-then-write check inside one request, not a single atomic
// Redis operation — it closes the window from "unbounded" down to the few
// milliseconds between this function's own get and set, which is enough for a
// small team, but two writes landing in that exact instant could in theory both
// pass. A real compare-and-swap (e.g. a Lua script) would close that fully.
function resolvePut(current, body) {
  const currentVersion = current && typeof current.version === "number" ? current.version : 0;
  const { expectedVersion, ...data } = body || {};
  if (typeof expectedVersion === "number" && expectedVersion !== currentVersion) {
    return { ok: false, current: current || {} };
  }
  const version = currentVersion + 1;
  return { ok: true, version, payload: { ...data, version } };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    const result = await kv("get", KEY);
    const data = result.result ? JSON.parse(result.result) : null;
    return res.status(200).json(data || {});
  }

  if (req.method === "PUT") {
    const denied = writeAuthFailure(req);
    if (denied) return res.status(denied.status).json(denied.body);

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const result = await kv("get", KEY);
    const current = result.result ? JSON.parse(result.result) : null;
    const resolved = resolvePut(current, body);
    if (!resolved.ok) {
      return res.status(409).json({ error: "conflict", current: resolved.current });
    }
    await kv("set", KEY, JSON.stringify(resolved.payload));
    return res.status(200).json({ ok: true, version: resolved.version });
  }

  return res.status(405).json({ error: "Method not allowed" });
}

export { resolvePut };
