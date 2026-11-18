import test from "node:test";
import assert from "node:assert/strict";
import { shouldAdopt, setStorePresence, isStoreOn } from "../src/sync.js";

const LOCS = [{ name: "Walk In", code: 3 }, { name: "Dry Storage", code: 7 }];

// ── The bug Diego hit ────────────────────────────────────────────────────

test("a refresh while a save is in flight does not adopt the older server copy", () => {
  // Tick Rio Bravo, then tap Location before the write has landed. That tap
  // refreshes. The server has not got the tick yet.
  assert.equal(
    shouldAdopt({ remoteVersion: 41, knownVersion: 41, savesInFlight: 1, adoptedOnce: true }),
    false,
  );
});

test("even a newer server version waits until our own save has landed", () => {
  assert.equal(
    shouldAdopt({ remoteVersion: 99, knownVersion: 41, savesInFlight: 1, adoptedOnce: true }),
    false,
  );
});

test("ticking a store twice over is still ticked, not flipped back", () => {
  const item = { id: "1", name: "Red Bell Peppers", storeInfo: {} };
  // Applied to the screen...
  const once = setStorePresence(item, "Rio Bravo", true, LOCS);
  // ...then applied again on top of what the server turned out to hold,
  // which by then already had it.
  const twice = setStorePresence(once, "Rio Bravo", true, LOCS);
  assert.equal(isStoreOn(twice, "Rio Bravo"), true);
  assert.equal(twice, once, "no pointless new object when nothing changes");
});

test("unticking a store twice over stays unticked", () => {
  const item = { id: "1", storeInfo: { "Rio Bravo": { par: 2 } } };
  const once = setStorePresence(item, "Rio Bravo", false, LOCS);
  const twice = setStorePresence(once, "Rio Bravo", false, LOCS);
  assert.equal(isStoreOn(twice, "Rio Bravo"), false);
});

// ── Refreshing still works ───────────────────────────────────────────────

test("someone else's save is adopted", () => {
  assert.equal(
    shouldAdopt({ remoteVersion: 42, knownVersion: 41, savesInFlight: 0, adoptedOnce: true }),
    true,
  );
});

test("the same version again is not adopted — nothing to gain, a local edit to lose", () => {
  assert.equal(
    shouldAdopt({ remoteVersion: 41, knownVersion: 41, savesInFlight: 0, adoptedOnce: true }),
    false,
  );
});

test("an older version is never adopted", () => {
  assert.equal(
    shouldAdopt({ remoteVersion: 12, knownVersion: 41, savesInFlight: 0, adoptedOnce: true }),
    false,
  );
});

test("the first load takes whatever is there", () => {
  assert.equal(
    shouldAdopt({ remoteVersion: 41, knownVersion: 0, savesInFlight: 0, adoptedOnce: false }),
    true,
  );
});

test("a server that reports no version refreshes as it always did", () => {
  assert.equal(
    shouldAdopt({ remoteVersion: undefined, knownVersion: 41, savesInFlight: 0, adoptedOnce: true }),
    true,
  );
});

test("called with nothing at all, it does not throw", () => {
  assert.equal(shouldAdopt(), true);
});

// ── Ticking and unticking ────────────────────────────────────────────────

test("ticking a store seeds it from that store's first location", () => {
  const next = setStorePresence({ storeInfo: {} }, "Rio Bravo", true, LOCS);
  assert.deepEqual(next.storeInfo["Rio Bravo"], {
    location: "Walk In", storeOrder: 3, par: 0, reorder: 0,
  });
});

test("ticking a store with no locations set up still works", () => {
  const next = setStorePresence({ storeInfo: {} }, "Scott's", true, []);
  assert.deepEqual(next.storeInfo["Scott's"], {
    location: "", storeOrder: 1, par: 0, reorder: 0,
  });
});

test("ticking one store leaves the others alone", () => {
  const item = { storeInfo: { "Rio Bravito": { location: "Corner Far", par: 4 } } };
  const next = setStorePresence(item, "Rio Bravo", true, LOCS);
  assert.deepEqual(next.storeInfo["Rio Bravito"], { location: "Corner Far", par: 4 });
  assert.equal(isStoreOn(next, "Rio Bravo"), true);
});

test("unticking a store does not touch the item's other fields", () => {
  const item = { id: "7", name: "Limes", vendor: "SJ", storeInfo: { "Rio Bravo": {} } };
  const next = setStorePresence(item, "Rio Bravo", false, LOCS);
  assert.equal(next.name, "Limes");
  assert.equal(next.vendor, "SJ");
  assert.deepEqual(next.storeInfo, {});
});

test("ticking does not mutate the item it was given", () => {
  const item = { storeInfo: {} };
  setStorePresence(item, "Rio Bravo", true, LOCS);
  assert.deepEqual(item.storeInfo, {});
});

test("a store ticked with everything at zero still counts as ticked", () => {
  // par 0 and reorder 0 are real answers, not an empty entry to be swept up.
  const next = setStorePresence({ storeInfo: {} }, "Rio Bravo", true, LOCS);
  assert.equal(isStoreOn(next, "Rio Bravo"), true);
});

test("isStoreOn copes with an item that has no storeInfo at all", () => {
  assert.equal(isStoreOn({}, "Rio Bravo"), false);
  assert.equal(isStoreOn(undefined, "Rio Bravo"), false);
});
