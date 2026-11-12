import { strict as assert } from "node:assert";
import test from "node:test";
// The fallback chain: what a store with no answer of its own falls back to.
// `pickUpFrom` was renamed `itemLevelPickUp` when the field became per-store
// -- same reading, clearer name now that it is the fallback and not the fact.
import { itemLevelPickUp, pickUpFromFor, pickUpIsInferred, pickUpLabel, PICKUP_PLACES } from "../src/pickUp.js";

test("an item with no pick-up place is ordered like anything else", () => {
  assert.equal(itemLevelPickUp({ name: "Canned Coke", vendor: "Restaurant Depot" }), "");
  assert.equal(itemLevelPickUp({}), "");
  assert.equal(itemLevelPickUp(null), "");
});

test("an explicit pick-up place is used as written", () => {
  assert.equal(itemLevelPickUp({ pickUpFrom: "El Cafecito", vendor: "Imperial Brady" }), "El Cafecito");
});

test("an explicit place beats the legacy vendor", () => {
  assert.equal(itemLevelPickUp({ pickUpFrom: "Rio Bravo", vendor: "Cafesito" }), "Rio Bravo");
});

test("the legacy vendor spellings in the data are read as pick-up places", () => {
  // These are the values actually on items today.
  assert.equal(itemLevelPickUp({ vendor: "Cafesito" }), "El Cafecito");
  assert.equal(itemLevelPickUp({ vendor: "Rio Bravo" }), "Rio Bravo");
  assert.equal(itemLevelPickUp({ vendor: "Scotts" }), "Scott's");
});

test("legacy matching ignores case and surrounding space", () => {
  assert.equal(itemLevelPickUp({ vendor: "  cafesito " }), "El Cafecito");
  assert.equal(itemLevelPickUp({ vendor: "SCOTT'S" }), "Scott's");
});

test("a real supplier in the vendor field is never read as a pick-up", () => {
  for (const v of ["Restaurant Depot", "US Foods Allen", "Harbor", "Columbia",
                   "Costco", "Amazon", "Don Pancho", "SJ", "Acunas", "Saars",
                   "Cash and Carry", "Dollar Tree", "Imperial Brady", "Panes Bakery"])
    assert.equal(itemLevelPickUp({ vendor: v }), "", v);
});

test("an inferred place is flagged, an explicit one is not", () => {
  assert.equal(pickUpIsInferred({ vendor: "Cafesito" }), true);
  assert.equal(pickUpIsInferred({ pickUpFrom: "El Cafecito", vendor: "Cafesito" }), false);
  assert.equal(pickUpIsInferred({ vendor: "Restaurant Depot" }), false);
});

test("an emptied field falls back rather than reading as blank-on-purpose", () => {
  // Clearing the box leaves "" or whitespace; that is not a decision to
  // override the legacy vendor, so the legacy reading still applies.
  assert.equal(itemLevelPickUp({ pickUpFrom: "   ", vendor: "Cafesito" }), "El Cafecito");
});

test("the group heading reads as an instruction, not a supplier", () => {
  assert.equal(pickUpLabel("El Cafecito"), "Pick up — El Cafecito");
});

test("every place offered is one we can also infer from a legacy vendor", () => {
  for (const p of PICKUP_PLACES) assert.equal(itemLevelPickUp({ vendor: p }), p, p);
});

test("ordering for the place itself is not a pick-up", () => {
  // Scott's doesn't drive to Scott's for its own fries — it buys them.
  const fries = { name: "Fries", vendor: "Scotts" };
  assert.equal(pickUpFromFor(fries, "Rio Bravito"), "Scott's");
  assert.equal(pickUpFromFor(fries, "Scott's"), "");
});

test("the self-pick-up guard ignores case and space", () => {
  assert.equal(pickUpFromFor({ pickUpFrom: "El Cafecito" }, " el cafecito "), "");
});

test("with no store given, the guard does nothing", () => {
  assert.equal(pickUpFromFor({ vendor: "Cafesito" }, ""), "El Cafecito");
  assert.equal(pickUpFromFor({ vendor: "Cafesito" }, undefined), "El Cafecito");
});

test("the guard does not invent a pick-up for an ordinary item", () => {
  assert.equal(pickUpFromFor({ vendor: "Restaurant Depot" }, "Scott's"), "");
});
