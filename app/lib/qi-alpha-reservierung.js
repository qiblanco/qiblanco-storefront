/*
 * PREMIUM-KUNDEN-CHECKOUT FÜR RESERVIERTE QI-ALPHA®-NUMMERN (Christian
 * 01.11.2026, Job 20261101-prio2-qi-alpha-premium-checkout-reservierte-
 * nummern-links). Reine Regeln, kein Netz, kein React: testbar mit node --test
 * (test/qi-alpha-reservierung.test.mjs).
 *
 * DER WEG: persönlicher Link /pages/Qi-Alpha?reservierung=<schlüssel> ->
 * Landingpage (unverändert) -> der rote Knopf führt nach
 * /products/qi-alpha-reserviert/<schlüssel> -> dieselbe Kaufseite wie
 * /products/qi-alpha (TheAlphaShop), nur die Nummernauswahl zeigt oben die
 * reservierte(n) Nummer(n) mit „Reserviert für <Name>“ und darunter die freie
 * Auswahl. Christian: „Und bei der Nummernauswahl ist dann wirklich oben nur
 * 88 reserviert für diese und unten drunter ist dann freie Nummerauswahl.
 * Sonst wird kein weiterer Vorschlag gemacht.“
 *
 * DIE LISTE der Reservierungen steht an EINER Stelle:
 * app/lib/qi-alpha-reservierungen.server.js (nur Server, die Schlüssel
 * gelangen nie in das Browser-Paket). Neue Links:
 * homepage-bauer/bin/qi-alpha-reservierung neu --nummer N --name NAME.
 *
 * NAME NIE AUF DER GRAVUR: die Gravur bleibt „88/111 - 1st. Edition“
 * (gravurText). Der Name steht in der Auswahl und als Zeilen-Merkmal
 * „Reservierung“ an der Nummern-Zeile, also auf Bestellung und Rechnung
 * (Christian: „Das steht nur bei der Auswahl und eventuell auf der Rechnung.“).
 */

/** Abfrage-Parameter des persönlichen Links auf der Landingpage. */
export const RESERVIERUNG_PARAM = 'reservierung';

/** Pfad des Premium-Bereichs (Kaufseite mit reservierter Nummer). */
export const RESERVIERT_PFAD = '/products/qi-alpha-reserviert';

/** Kaufseite, auf die der rote Knopf der Landingpage sonst führt. */
const KAUFSEITE = '/products/qi-alpha';

/** Schlüssel: 16 bis 40 Zeichen aus Buchstaben und Ziffern (nicht erratbar). */
export const SCHLUESSEL_RX = /^[A-Za-z0-9]{16,40}$/;

/** Zeilen-Merkmale an der Nummern-Zeile. Unterstrich = in der Kasse unsichtbar. */
export const MERKMAL_SCHLUESSEL = '_reservierung';
export const MERKMAL_NAME = 'Reservierung';

/** Ist das ein formal gültiger Schlüssel? */
export function istSchluessel(s) {
  return typeof s === 'string' && SCHLUESSEL_RX.test(s);
}

/**
 * Wohin der rote Knopf führt: mit gültigem Schlüssel in der Adresse der
 * Landingpage in den Premium-Bereich, sonst unverändert auf die Kaufseite.
 * Andere Ziele (z. B. ein Testarm) bleiben, wie sie sind.
 */
export function kaufZiel(ziel, schluessel) {
  if (ziel !== KAUFSEITE || !istSchluessel(schluessel)) return ziel;
  return `${RESERVIERT_PFAD}/${schluessel}`;
}

/**
 * Die Reservierung zu einem Schlüssel, oder null. Liefert nur, was der Browser
 * braucht (Schlüssel, Nummern, Namen) — keine anderen Reservierungen.
 * @param {Array<{schluessel: string, shop?: string, nummern: Array<{n: number, name: string}>}>} liste
 */
export function reservierungZu(liste, schluessel, shop = 'deutsch') {
  if (!istSchluessel(schluessel)) return null;
  const r = (liste || []).find(
    (x) => x?.schluessel === schluessel && (x.shop ?? 'deutsch') === shop,
  );
  if (!r || !Array.isArray(r.nummern) || !r.nummern.length) return null;
  return {
    schluessel: r.schluessel,
    nummern: r.nummern.map(({n, name}) => ({n: Number(n), name: String(name)})),
  };
}

/** Alle reservierten Nummern eines Shops (für die Sperre im normalen Shop). */
export function reservierteNummern(liste, shop = 'deutsch') {
  const aus = new Set();
  for (const r of liste || []) {
    if ((r?.shop ?? 'deutsch') !== shop) continue;
    for (const x of r.nummern || []) aus.add(Number(x.n));
  }
  return [...aus].sort((a, b) => a - b);
}

/**
 * Prüft die Liste beim Laden: jeder Schlüssel gültig und einmalig, jede
 * Nummer in 1..serie und nur in EINER Reservierung, jeder Name nicht leer.
 * Rückgabe: Liste der Fehler (leer = in Ordnung).
 */
export function listeFehler(liste, serie = 111) {
  const fehler = [];
  const schluessel = new Set();
  const nummern = new Map();
  for (const [i, r] of (liste || []).entries()) {
    if (!istSchluessel(r?.schluessel)) fehler.push(`#${i}: Schlüssel ungültig`);
    else if (schluessel.has(r.schluessel))
      fehler.push(`#${i}: Schlüssel doppelt`);
    else schluessel.add(r.schluessel);
    if (!['deutsch', 'englisch'].includes(r?.shop ?? 'deutsch')) {
      fehler.push(`#${i}: Shop unbekannt (${r.shop})`);
    }
    if (!Array.isArray(r?.nummern) || !r.nummern.length) {
      fehler.push(`#${i}: keine Nummer`);
      continue;
    }
    for (const x of r.nummern) {
      const n = Number(x?.n);
      if (!Number.isInteger(n) || n < 1 || n > serie) {
        fehler.push(`#${i}: Nummer ${x?.n} nicht in 1..${serie}`);
      }
      if (!String(x?.name ?? '').trim())
        fehler.push(`#${i}: Nummer ${n} ohne Namen`);
      const k = `${r.shop ?? 'deutsch'}:${n}`;
      if (nummern.has(k)) fehler.push(`Nummer ${n} in zwei Reservierungen`);
      nummern.set(k, i);
    }
  }
  return fehler;
}

/** Nummer aus einem Variantentitel „88/111“, „Alpha 88/111“, „Alpha 88/100“. */
export function nummerAusVariantenTitel(titel) {
  const m = /^\s*(?:Alpha\s*)?(\d{1,3})\s*\//i.exec(String(titel || ''));
  return m ? Number(m[1]) : null;
}

/** Zeilen-Merkmale der Nummern-Zeile einer reservierten Nummer. */
export function reservierungsMerkmale(schluessel, name) {
  return [
    {key: MERKMAL_SCHLUESSEL, value: schluessel},
    {key: MERKMAL_NAME, value: name},
  ];
}

/**
 * DIE SPERRE IM WARENKORB, rein (kein Netz). Eingabe: Nummern-Zeilen des
 * gelesenen Warenkorbs {id, nummer, attributes}. Eine reservierte Nummer
 * bleibt nur, wenn die Zeile den Schlüssel GENAU der Reservierung trägt, zu
 * der diese Nummer gehört. Sonst fällt sie heraus — egal ob sie über die
 * Kaufseite, den Warenkorb-Permalink oder einen selbst gebauten POST kam.
 * Ausgabe: IDs der zu entfernenden Zeilen.
 */
export function reservierungsSperre(zeilen, liste, shop = 'deutsch') {
  const zuSchluessel = new Map();
  for (const r of liste || []) {
    if ((r?.shop ?? 'deutsch') !== shop) continue;
    for (const x of r.nummern || [])
      zuSchluessel.set(Number(x.n), r.schluessel);
  }
  const entfernen = [];
  for (const z of zeilen || []) {
    const soll = zuSchluessel.get(z?.nummer);
    if (!soll) continue;
    const ist = (z.attributes || []).find(
      (a) => a?.key === MERKMAL_SCHLUESSEL,
    )?.value;
    if (ist !== soll) entfernen.push(z.id);
  }
  return entfernen;
}

/**
 * Stand der reservierten Nummern auf der Kaufseite: je Nummer die
 * Shopify-Variante, wenn sie kaufbar ist ('reserviert'), sonst 'vergeben'
 * (schon gekauft: Shopify sperrt sie nach der Bestellung).
 */
export function reserviertStand(reservierung, varianten) {
  const jeNummer = new Map();
  for (const v of varianten || []) {
    const n = nummerAusVariantenTitel(v?.title);
    if (n && !jeNummer.has(n)) jeNummer.set(n, v);
  }
  return (reservierung?.nummern || []).map(({n, name}) => {
    const v = jeNummer.get(n);
    const kaufbar = Boolean(v?.availableForSale);
    return {
      n,
      name,
      variante: kaufbar ? v : null,
      status: kaufbar ? 'reserviert' : 'vergeben',
    };
  });
}

/**
 * Warenkorbzeilen für mehrere Geräte: je Gerät eine Nummern-Zeile und eine
 * Ketten-Zeile, dazu der Qi Alpha® in der Menge der Geräte. Christian: „wenn
 * er die zwei Nummern auswählt, dann kommen auch zwei G-Master in den Korb …
 * zweimal G-Master und einmal Goldkette und einmal Stahlkette“. Zwei gleiche
 * Ketten führt Shopify als eine Zeile mit Menge 2 („dann würde im Shop auch
 * unten zwei angezeigt werden“).
 *
 * Reihenfolge wie auf der Kaufseite: Shopify legt die Zeilen umgekehrt in den
 * Warenkorb, übergeben wird je Gerät Kette, Nummer und am Ende der Qi Alpha®.
 * @param {{haupt: object, geraete: Array<{nummer: object|null, merkmale?: Array, kette: object|null}>, linie: Function}} p
 *   `linie` = addonLinien aus lib/qi-master-addons.js (Merkmal _qm_addon).
 */
export function geraeteLinien({haupt, geraete, linie}) {
  if (!haupt?.id || !geraete?.length) return [];
  const aus = [];
  for (const g of [...geraete].reverse()) {
    const zeilen = linie({
      wunschnummer: g.nummer ?? null,
      kette: g.kette ?? null,
    });
    for (const z of zeilen) {
      if (g.merkmale?.length && z.merchandiseId === g.nummer?.id) {
        z.attributes = [...(z.attributes || []), ...g.merkmale];
      }
    }
    aus.push(...zeilen.reverse());
  }
  aus.push({
    merchandiseId: haupt.id,
    quantity: geraete.length,
    selectedVariant: haupt,
  });
  return aus;
}
