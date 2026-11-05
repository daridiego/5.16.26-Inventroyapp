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
// So `pickUpFrom` says where to GO. The supplier and the price underneath
// are untouched and keep costing the item.
//
// ── Why `vendor` is read as a fallback ──────────────────────────────────
//
// Before this field existed, the only place to record it was `vendor`, so
// 24 items carry "Cafesito", "Rio Bravo" or "Scotts" there. That is not bad
// data -- it is this exact fact, written in the only box available. Reading
// it keeps those items working with nothing to migrate, and the moment the
// field is set on an item, the explicit value wins.

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

// Where an item is picked up from, or "" when it is ordered from a supplier
// like anything else.
export function pickUpFrom(item) {
  if (!item) return "";
  const explicit = String(item.pickUpFrom || "").trim();
  if (explicit) return explicit;
  return LEGACY[String(item.vendor || "").trim().toLowerCase()] || "";
}

// The same, but for the restaurant you are ordering for.
//
// The pick-up place is one fact on the item, shared by every restaurant that
// uses it: Rio Bravito fetches fries from Scott's. Ordering for Scott's, that
// same item is not a pick-up at all -- Scott's is where it lives, and Scott's
// buys it from whoever sells it. Without this guard the order guide tells
// Scott's to go and collect fries from Scott's, and the fries never get
// ordered by anyone.
export function pickUpFromFor(item, store) {
  const place = pickUpFrom(item);
  if (!place) return "";
  if (store && String(store).trim().toLowerCase() === place.trim().toLowerCase()) return "";
  return place;
}

// True when this item's pick-up place came from the legacy `vendor` field
// rather than from someone setting it. The UI says so, because the two
// should look different: one is a record, the other is an inference.
export function pickUpIsInferred(item) {
  return !String(item?.pickUpFrom || "").trim() && !!pickUpFrom(item);
}

// Options for the picker: our places, plus anything already saved on an item
// so a value can never be dropped by not being on the list.
export function pickUpOptions(items) {
  const extra = (items || [])
    .map((i) => String(i?.pickUpFrom || "").trim())
    .filter((v) => v && !PICKUP_PLACES.includes(v));
  return ["", ...PICKUP_PLACES, ...Array.from(new Set(extra)).sort()];
}
