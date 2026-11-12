// "Pick up from" is a per-store fact. These are Diego's own examples, plus
// the migration guarantee that today's order guides keep printing what they
// print now.
import { strict as assert } from "node:assert";
import test from "node:test";
import {
  pickUpFromFor, storePickUp, hasStorePickUp, pickUpSource,
  pickUpIsInferred, pickUpOptions, migrateItemPickUp, itemLevelPickUp,
} from "../src/pickUp.js";

const item = (over = {}) => ({ name: "x", vendor: "Restaurant Depot", storeInfo: {}, ...over });
const stores = (...names) => Object.fromEntries(names.map((n) => [n, { par: 0, location: "" }]));

// ── the two cases that prompted the change ──────────────────────────────

test("roma tomatoes: Scott's collects from Rio Bravo, Bravito orders them", () => {
  const roma = item({
    name: "Roma Tomatoes",
    storeInfo: {
      "Rio Bravito": { par: 4, pickUpFrom: "" },
      "Scott's": { par: 1, pickUpFrom: "Rio Bravo" },
    },
  });
  assert.equal(pickUpFromFor(roma, "Rio Bravito"), "", "Bravito buys them");
  assert.equal(pickUpFromFor(roma, "Scott's"), "Rio Bravo", "Scott's walks over");
});

test("red bell peppers: Bravito collects from Rio Bravo, Rio Bravo buys them", () => {
  const peppers = item({
    name: "Red Bell Peppers",
    storeInfo: {
      "Rio Bravito": { pickUpFrom: "Rio Bravo" },
      "Rio Bravo": { pickUpFrom: "Rio Bravo" }, // the self-guard handles this
    },
  });
  assert.equal(pickUpFromFor(peppers, "Rio Bravito"), "Rio Bravo");
  assert.equal(pickUpFromFor(peppers, "Rio Bravo"), "", "nobody collects from themselves");
});

test("an empty per-store value is an answer, not a gap", () => {
  // The whole bug in one assertion: Bravito says "I order these" and must not
  // inherit the old shared value that Scott's still uses.
  const it = item({
    pickUpFrom: "El Cafecito", // the old shared answer
    storeInfo: { "Rio Bravito": { pickUpFrom: "" }, "Scott's": { pickUpFrom: "El Cafecito" } },
  });
  assert.equal(pickUpFromFor(it, "Rio Bravito"), "");
  assert.equal(pickUpFromFor(it, "Scott's"), "El Cafecito");
});

// ── the fallback chain, for stores with no answer yet ───────────────────

test("a store with no answer inherits the item's old shared value", () => {
  const it = item({ pickUpFrom: "El Cafecito", storeInfo: stores("Rio Bravito") });
  assert.equal(pickUpFromFor(it, "Rio Bravito"), "El Cafecito");
  assert.equal(pickUpSource(it, "Rio Bravito"), "inherited");
});

test("a store with no answer falls back to the vendor box", () => {
  const it = item({ vendor: "Cafesito", storeInfo: stores("Rio Bravito") });
  assert.equal(pickUpFromFor(it, "Rio Bravito"), "El Cafecito");
  assert.equal(pickUpSource(it, "Rio Bravito"), "guessed");
  assert.equal(pickUpIsInferred(it, "Rio Bravito"), true);
});

test("a real supplier in the vendor box is not a pick-up", () => {
  const it = item({ vendor: "Restaurant Depot", storeInfo: stores("Rio Bravito") });
  assert.equal(pickUpFromFor(it, "Rio Bravito"), "");
  assert.equal(pickUpSource(it, "Rio Bravito"), "none");
});

test("a store's own answer beats both fallbacks and is never 'inferred'", () => {
  const it = item({
    vendor: "Cafesito", pickUpFrom: "El Cafecito",
    storeInfo: { "Scott's": { pickUpFrom: "Rio Bravo" } },
  });
  assert.equal(pickUpFromFor(it, "Scott's"), "Rio Bravo");
  assert.equal(pickUpSource(it, "Scott's"), "set");
  assert.equal(pickUpIsInferred(it, "Scott's"), false);
});

test("spacing and case don't break the self-guard", () => {
  const it = item({ storeInfo: { "Scott's": { pickUpFrom: "  scott's " } } });
  assert.equal(pickUpFromFor(it, "Scott's"), "");
});

// ── migration: today's order guides must not change ─────────────────────

const guideBefore = (it, store) => {
  // What the OLD single-value code produced, reimplemented here so the
  // migration is checked against the real previous behaviour.
  const place = itemLevelPickUp(it);
  if (!place) return "";
  return place.trim().toLowerCase() === store.trim().toLowerCase() ? "" : place;
};

test("migration preserves every store's current instruction", () => {
  // The seven real items that have a pick-up place and are used outside
  // Rio Bravito, as the live data had them on 12 Nov 2026.
  const live = [
    item({ name: "Mexican Code 1/2L", pickUpFrom: "Scott's", storeInfo: stores("Rio Bravito", "Rio Bravo", "Scott's") }),
    item({ name: "Topo chico", pickUpFrom: "Scott's", storeInfo: stores("Scott's", "Rio Bravito") }),
    item({ name: "Cooking Oil", vendor: "Cafesito", storeInfo: stores("Rio Bravito", "Scott's") }),
    item({ name: "Gloves-M", vendor: "Cafesito", storeInfo: stores("Rio Bravito", "Scott's") }),
    item({ name: "Gloves-XL", vendor: "Cafesito", storeInfo: stores("Rio Bravito", "Scott's") }),
    item({ name: "Fries", pickUpFrom: "Scott's", storeInfo: stores("Rio Bravito", "Scott's") }),
    item({ name: "Jalapenos Fresh", pickUpFrom: "Rio Bravo", storeInfo: stores("Rio Bravito", "Scott's") }),
    item({ name: "Canned Coke", vendor: "Restaurant Depot", storeInfo: stores("Rio Bravito", "Scott's") }),
  ];
  for (const it of live) {
    const after = migrateItemPickUp(it);
    for (const store of Object.keys(it.storeInfo)) {
      assert.equal(pickUpFromFor(after, store), guideBefore(it, store),
        `${it.name} @ ${store} changed instruction`);
    }
  }
});

test("migration gives every store an explicit answer", () => {
  const after = migrateItemPickUp(item({ pickUpFrom: "El Cafecito", storeInfo: stores("Rio Bravito", "Scott's") }));
  assert.equal(hasStorePickUp(after, "Rio Bravito"), true);
  assert.equal(hasStorePickUp(after, "Scott's"), true);
  assert.equal(storePickUp(after, "Rio Bravito"), "El Cafecito");
});

test("migration writes '' for the store that IS the place", () => {
  const after = migrateItemPickUp(item({ pickUpFrom: "Scott's", storeInfo: stores("Rio Bravito", "Scott's") }));
  assert.equal(after.storeInfo["Scott's"].pickUpFrom, "", "not \"Scott's picks up from Scott's\"");
  assert.equal(after.storeInfo["Rio Bravito"].pickUpFrom, "Scott's");
});

test("migration never overwrites an answer already given", () => {
  const it = item({
    pickUpFrom: "El Cafecito",
    storeInfo: { "Rio Bravito": { pickUpFrom: "" }, "Scott's": { par: 2 } },
  });
  const after = migrateItemPickUp(it);
  assert.equal(after.storeInfo["Rio Bravito"].pickUpFrom, "", "the deliberate '' survives");
  assert.equal(after.storeInfo["Scott's"].pickUpFrom, "El Cafecito");
});

test("migration is idempotent and keeps the other store fields", () => {
  const it = item({ pickUpFrom: "Rio Bravo", storeInfo: { "Scott's": { par: 7, location: "Walk-in", reorder: 2 } } });
  const once = migrateItemPickUp(it);
  const twice = migrateItemPickUp(once);
  assert.deepEqual(once, twice);
  assert.equal(once.storeInfo["Scott's"].par, 7);
  assert.equal(once.storeInfo["Scott's"].location, "Walk-in");
  assert.equal(once.storeInfo["Scott's"].reorder, 2);
});

test("an item in no store at all is left alone", () => {
  const it = item({ pickUpFrom: "Rio Bravo", storeInfo: {} });
  assert.deepEqual(migrateItemPickUp(it), it);
  assert.deepEqual(migrateItemPickUp({ name: "y" }), { name: "y" });
});

// ── picker options ──────────────────────────────────────────────────────

test("the picker offers our places plus anything already saved", () => {
  const opts = pickUpOptions([
    item({ storeInfo: { "Scott's": { pickUpFrom: "The Garage" } } }),
    item({ pickUpFrom: "El Cafecito" }),
  ]);
  assert.equal(opts[0], "", "blank first, meaning ordered");
  assert.ok(opts.includes("The Garage"), "a saved value is never dropped");
  assert.ok(opts.includes("Rio Bravo"));
  assert.equal(new Set(opts).size, opts.length, "no duplicates");
});

test("nothing throws on missing or malformed items", () => {
  assert.equal(pickUpFromFor(null, "Scott's"), "");
  assert.equal(pickUpFromFor(undefined, undefined), "");
  assert.equal(storePickUp({}, "Scott's"), "");
  assert.equal(hasStorePickUp(null, "Scott's"), false);
  assert.equal(pickUpSource({}, "Scott's"), "none");
  assert.deepEqual(pickUpOptions(null).slice(0, 1), [""]);
});
