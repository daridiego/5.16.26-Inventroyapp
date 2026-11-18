// Keeping a half-finished change from being wiped by a refresh.
//
// Two people share this data, so the app re-reads the server at every natural
// "look before you act" moment: opening a field to edit, switching tab or
// store, coming back to the app. That is good for seeing someone else's work.
// It was bad for seeing your own.
//
// Ticking a store is saved in the background: the screen updates at once and
// the write goes out after it. If a refresh landed in that gap it adopted the
// server's copy — which did not have the tick yet — and the box unticked
// itself. The commonest way to hit it was the natural one: tick Rio Bravo,
// then tap Location to fill it in, and that tap is itself a refresh.
//
// So a refresh is now only allowed to move forward.

// `savesInFlight` is how many background writes have not finished. While any
// is out, this browser knows something the server does not, and the server's
// copy is the older story.
//
// `remoteVersion` / `knownVersion` are the server's counter, which only ever
// goes up. Equal means nothing has changed since we last looked, so there is
// nothing to gain by adopting it and something to lose. Only a higher number
// is actual news.
//
// A server that does not report a version at all still refreshes as it always
// did; the in-flight guard above is what stops the unticking either way.
export function shouldAdopt({ remoteVersion, knownVersion, savesInFlight = 0, adoptedOnce = false } = {}) {
  if (savesInFlight > 0) return false;
  if (!adoptedOnce) return true;
  if (typeof remoteVersion === "number" && typeof knownVersion === "number") {
    return remoteVersion > knownVersion;
  }
  return true;
}

// Saying what you want, instead of saying "the other one".
//
// A change is applied twice: once to what is on screen, then again on top of
// whatever the server turns out to hold, so that two people editing at once
// don't lose each other's work. Applying "add it" twice is harmless. Applying
// "flip it" twice is not — the second flip undoes the first, and what reaches
// the server is the opposite of what was asked for. The screen stayed ticked
// and the saved copy wasn't, so it came back unticked later.
//
// This takes the answer, not the reversal, so running it again on different
// data still lands on the answer.
export function setStorePresence(item, store, on, locations) {
  const info = { ...(item?.storeInfo || {}) };
  const present = Object.prototype.hasOwnProperty.call(info, store);
  if (on === present) return item;
  if (on) {
    const first = (locations || [])[0];
    info[store] = {
      location: first?.name ?? "",
      storeOrder: first?.code ?? 1,
      par: 0,
      reorder: 0,
    };
  } else {
    delete info[store];
  }
  return { ...item, storeInfo: info };
}

// Whether a store is ticked for this item.
export function isStoreOn(item, store) {
  return Object.prototype.hasOwnProperty.call(item?.storeInfo || {}, store);
}
