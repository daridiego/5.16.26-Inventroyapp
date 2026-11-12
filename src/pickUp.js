// "I don't order this — I go and get it from one of our own places."
//
// Oil, gloves and napkins sit at El Cafecito; Marg Mix and tequila at Rio
// Bravo; menudo meat and beef tongue at Scott's. None of it gets ordered.
// Somebody drives over and picks it up.
//
// That is a different fact from who sells the item, and it has to stay
// separate from it:
//
//   - The oil costs whatever Imperial Brady charged when it was bought. It
//     does not get cheaper or dearer because it sat in another building.
//     Make El Cafecito a supplier with a price and the food cost app starts
//     costing dishes at a number nobody paid.
//   - Supplier Compare picks the cheapest supplier for an item. A made-up
//     El Cafecito price would enter that comparison and win or lose on it.
//
// So a pick-up place says where to GO. The supplier and the price underneath
// are untouched and keep costing the item.
//
// ── Why this is a per-store fact ────────────────────────────────────────
//
// It used to be one value on the item, shared by every restaurant. That is
// wrong, and the fix is the whole point of this module. Two real examples:
//
//   Roma tomatoes. Ordering for Rio Bravito, buy them from the best supplier.
//   Ordering for Scott's, walk over to Rio Bravo -- Scott's goes through a
//   handful and Rio Bravo is close by. One value on the item cannot say both:
//   set it and Bravito stops ordering tomatoes, leave it and Scott's drives
//   to a supplier for four tomatoes.
//
//   Red bell peppers. Rio Bravito collects them from Rio Bravo; Rio Bravo
//   itself buys them. That one works today only because of the self-guard
//   below, which is a special case of the same rule.
//
// So the answer lives in `storeInfo[store].pickUpFrom`, beside that store's
// par and location, and each restaurant gets its own. An empty string there
// is a real answer -- "this store orders it" -- not a missing one.
//
// ── The fallbacks, and why they still exist ─────────────────────────────
//
// Two older places recorded this, and both are still read when a store has
// no answer of its own:
//
//   1. `item.pickUpFrom`  -- the single shared value this replaced.
//   2. `item.vendor`      -- before even that field existed, 21 items had
//                            "Cafesito", "Rio Bravo" or "Scotts" typed into
//                            the vendor box, because it was the only box.
//
// A store with its own key never consults either. The chain only runs for a
// store that has not been answered yet -- a newly ticked restaurant, or data
// that predates the migration -- where inheriting the item's old shared
// answer is a better guess than silently deciding nobody picks it up.

// Our own places. A pick-up is from one of these; everything else is a
// supplier.
export const PICKUP_PLACES = ["Rio Bravito", "Rio Bravo", "Scott's", "El Cafecito"];

// What a legacy `vendor` value means, when it names one of our places.
// Spellings as they appear in the data, mapped to the one we show.
const LEGACY = {
  "cafesito": "El Cafecito",
  "el cafecito": "El Cafecito",
  "cafecito": "El Cafecito",
  "rio bravo": "Rio Bravo",
  "rio bravito": "Rio Bravito",
  "scotts": "Scott's",
  "scott's": "Scott's",
};

const clean = (v) => String(v ?? "").trim();
const sameplace = (a, b) => clean(a).toLowerCase() === clean(b).toLowerCase();
const has = (o, k) => !!o && Object.prototype.hasOwnProperty.call(o, k);

// The item's old shared answer: the explicit field, else what the vendor box
// is really saying. Exported because the migration needs the same reading.
export function itemLevelPickUp(item) {
  if (!item) return "";
  const explicit = clean(item.pickUpFrom);
  if (explicit) return explicit;
  return LEGACY[clean(item.vendor).toLowerCase()] || "";
}

// Has this store been given an answer of its own? An empty string counts --
// "Scott's orders it" is an answer, and the one the fallbacks must not undo.
export function hasStorePickUp(item, store) {
  return has(item?.storeInfo?.[store], "pickUpFrom");
}

// Where this store's answer comes from, which the UI shows differently:
//   set       -- somebody chose it for this store
//   inherited -- the item's old shared value, not yet reviewed per store
//   guessed   -- read out of the vendor box, which is an inference
//   none      -- it is ordered, and always was
export function pickUpSource(item, store) {
  if (hasStorePickUp(item, store)) return "set";
  if (clean(item?.pickUpFrom)) return "inherited";
  if (itemLevelPickUp(item)) return "guessed";
  return "none";
}

// The stored answer for one store, before the self-guard. This is what the
// picker shows and what gets saved.
export function storePickUp(item, store) {
  const info = item?.storeInfo?.[store];
  if (has(info, "pickUpFrom")) return clean(info.pickUpFrom);
  return itemLevelPickUp(item);
}

// Where to go when ordering FOR `store`, or "" when this store just orders it.
//
// The self-guard: a restaurant never collects from itself. Ordering for
// Scott's, an item kept at Scott's is not a pick-up -- it is Scott's stock,
// and Scott's buys it from whoever sells it. Without this the order guide
// tells Scott's to go and collect fries from Scott's, and nobody ever orders
// the fries.
export function pickUpFromFor(item, store) {
  const place = storePickUp(item, store);
  if (!place) return "";
  if (store && sameplace(store, place)) return "";
  return place;
}

// True when this store's place was not chosen for it but read out of the
// vendor box. The UI draws that differently: one is a record, the other a
// guess that deserves a glance.
export function pickUpIsInferred(item, store) {
  return pickUpSource(item, store) === "guessed";
}

// Options for the picker: our places, plus anything already saved anywhere,
// so a value can never be dropped just by not being on the list.
export function pickUpOptions(items) {
  const extra = [];
  (items || []).forEach((i) => {
    extra.push(clean(i?.pickUpFrom));
    Object.values(i?.storeInfo || {}).forEach((info) => extra.push(clean(info?.pickUpFrom)));
  });
  const unknown = Array.from(new Set(extra.filter((v) => v && !PICKUP_PLACES.includes(v)))).sort();
  return ["", ...PICKUP_PLACES, ...unknown];
}

// ── migration ───────────────────────────────────────────────────────────
//
// Give every store an explicit answer, derived from whatever the item said
// before, so that today's order guides keep printing exactly what they print
// now. Deliberately NOT "the old value belonged to Rio Bravito": four items
// (cooking oil, two glove sizes, fresh jalapenos) are collected by Scott's
// today, and reading the old value as Bravito-only would quietly move them
// onto Scott's order sheet without anybody deciding that.
//
// The self-guard is applied here too, so the stored value for the store that
// IS the place is a plain "" rather than a line that reads "Scott's picks up
// from Scott's".
export function migrateItemPickUp(item) {
  const info = item?.storeInfo;
  if (!info) return item;
  const stores = Object.keys(info);
  if (!stores.length) return item;
  if (stores.every((s) => has(info[s], "pickUpFrom"))) return item;

  const shared = itemLevelPickUp(item);
  const next = {};
  stores.forEach((s) => {
    const cur = info[s] || {};
    next[s] = has(cur, "pickUpFrom")
      ? cur
      : { ...cur, pickUpFrom: sameplace(s, shared) ? "" : shared };
  });
  return { ...item, storeInfo: next };
}

// What the order guide calls that group. Not a supplier name, and it reads
// as an instruction, because that's what it is.
export function pickUpLabel(place) {
  return `Pick up — ${place}`;
}
