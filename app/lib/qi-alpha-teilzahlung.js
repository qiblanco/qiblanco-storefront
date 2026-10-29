/*
 * GETEILTE ZAHLUNG AM QI ALPHA (Christian 27.10.2026 Z1–Z4; Grossjob
 * 20261027-qi-alpha-geteilte-zahlung-10000-raten-rest-sofort, Segment s03).
 * „Ratenzahlung nur bis 10.000 Euro … und der Restbetrag als Einmal-
 * Sofortzahlung … erst wenn beides bezahlt ist, wird die Ware versendet.“
 *
 * WEG (KONZEPT.md des Grossjobs, Abschnitt 3): zwei verknüpfte Bestellungen.
 * Teil 1 ist ein verstecktes Shopify-Produkt „Qi Alpha – Ratenanteil“ über
 * genau 10.000 € ohne Versand, bezahlt in einem eigenen Checkout mit PayPal
 * oder Klarna. Den Rest-Link mit der Ware schickt der Server-Wächter
 * (shared-state/qi-alpha-teilzahlung) erst, wenn Bestellung 1 da ist.
 *
 * VERTRAG: die Konstanten unten sind die aus qi-alpha-teilzahlung/config/
 * vertrag.json. Die Naht-Probe in test/qi-alpha-teilzahlung.test.mjs liest
 * die Datei und hält beide Seiten gleich; wer eine Zahl hier ändert, ändert
 * sie dort im selben Schritt.
 *
 * TRACKING (Auftrag Punkt 5): Schritt 1 sendet am Storefront KEIN
 * AddToCart und kein InitiateCheckout. Der Knopf ist ein Link auf den
 * Permalink; der Warenkorb entsteht auf dem Server, der Kunde geht direkt in
 * die Kasse (kein Cart-Event, kein CartSummary). Gezählt wird der Kauf dort,
 * wo das Geld fließt: Bestellung 1 (10.000 €) und Bestellung 2 (Rest nach
 * Anrechnung) ergeben zusammen genau den Preis der Konfiguration, also kein
 * doppelter Qi-Alpha-Umsatz. Ein AddToCart über 10.000 € für einen Artikel
 * ohne Ware hätte Meta dagegen einen zweiten Qi-Alpha-Warenkorb gemeldet.
 * Herkunfts- und Tracking-Merkmale des Permalinks bleiben unverändert.
 *
 * Regeln ohne eigenes Netz und ohne React: gelesen von der Kaufseite
 * (TheAlphaShop.jsx), vom Warenkorb-Permalink (routes/cart.$lines.jsx) und
 * von der Warenkorb-Action (routes/cart.jsx, bindeRatenanteil bekommt den
 * Warenkorb-Handler der Route übergeben).
 */

export const TEILZAHLUNG = {
  // Shopify-Variante „qi-alpha-ratenanteil“ (angelegt 2026-10-28, s06).
  variante: '66048336396556',
  // Ratenobergrenze von PayPal Ratenzahlung und Klarna Finanzierung in DE.
  betrag: 10000,
  waehrung: 'EUR',
  // Nur hier trägt der Katalog den Ratenanteil (CH/International entfernt).
  maerkte: ['DE', 'AT'],
  merkmale: {vorgang: '_qa_vorgang', konfig: '_qa_konfig'},
};

/** Bietet dieser Markt die geteilte Zahlung an? */
export function ratenMarkt({waehrung, land}) {
  return (
    waehrung === TEILZAHLUNG.waehrung && TEILZAHLUNG.maerkte.includes(land)
  );
}

/**
 * Die Live-Aufteilung zur gewählten Konfiguration. null heißt: keine
 * Aufteilung (Markt ohne Ratenanteil oder Summe bis 10.000 €, dort trägt der
 * normale Ratenweg an der Kasse). Gerechnet wird auf den Cent.
 */
export function aufteilung({summe, waehrung, land}) {
  const gesamt = Number(summe);
  if (!Number.isFinite(gesamt) || !ratenMarkt({waehrung, land})) return null;
  const cent = Math.round(gesamt * 100);
  const ratenCent = TEILZAHLUNG.betrag * 100;
  if (cent <= ratenCent) return null;
  return {
    gesamt: cent / 100,
    raten: TEILZAHLUNG.betrag,
    sofort: (cent - ratenCent) / 100,
  };
}

/** „gid://shopify/ProductVariant/123“ oder „123“ -> „123“, sonst „-“. */
function varianteNr(id) {
  const nr = String(id ?? '').split('/').pop();
  return /^\d{1,20}$/.test(nr) ? nr : '-';
}

const CODE_RX = /^[\w-]{1,40}$/;

/** Das Merkmal _qa_konfig im Format des Vertrags (konfig_format). */
export function konfigText({qiAlpha, nummer, kette, partner = null}) {
  const p = partner && CODE_RX.test(partner) ? partner : '-';
  return [
    `qi-alpha=${varianteNr(qiAlpha)}`,
    `nummer=${varianteNr(nummer)}`,
    `kette=${varianteNr(kette)}`,
    `partner=${p}`,
  ].join(';');
}

const KONFIG_RX =
  /^qi-alpha=\d{1,20};nummer=(?:\d{1,20}|-);kette=(?:\d{1,20}|-);partner=(?:[\w-]{1,40}|-)$/;
const VORGANG_RX = /^[A-Za-z0-9_-]{1,40}$/;

/** Eine Vorgangskennung für _qa_vorgang: Zeit plus vier Zufallszeichen. */
export function vorgangsKennung(zufall = Math.random, jetzt = Date.now()) {
  const z = Math.floor(zufall() * 36 ** 4)
    .toString(36)
    .padStart(4, '0')
    .slice(-4);
  return `qa-${Math.floor(jetzt).toString(36)}-${z}`;
}

/** Adresse des Schritt-1-Checkouts: nur der Ratenanteil, Menge 1. */
export function teil1Link({vorgang, konfig}) {
  const q = new URLSearchParams();
  if (vorgang) q.set(TEILZAHLUNG.merkmale.vorgang, vorgang);
  if (konfig) q.set(TEILZAHLUNG.merkmale.konfig, konfig);
  const such = q.toString();
  return `/cart/${TEILZAHLUNG.variante}:1${such ? `?${such}` : ''}`;
}

/**
 * Warenkorb-Merkmale aus der Adresse des Permalinks. Angenommen werden NUR
 * die zwei Schlüssel des Vertrags und nur in ihrer Form; alles andere fällt
 * weg, nichts wird gekürzt oder repariert. Herkunfts- und Tracking-Merkmale
 * kommen nie über diesen Weg (die setzt cart-attribution.server.js).
 *
 * `sitzungsCodes`: Rabattcodes des Warenkorbs, den der Kunde schon hat (sein
 * Partnercode). Steht in _qa_konfig `partner=-`, setzt der erste brauchbare
 * Code dort ein; ob er sich mit der Anrechnung verträgt, prüft der Wächter.
 */
export function merkmaleAusQuery(searchParams, {sitzungsCodes = []} = {}) {
  const out = [];
  const vorgang = searchParams.get(TEILZAHLUNG.merkmale.vorgang);
  if (vorgang && VORGANG_RX.test(vorgang)) {
    out.push({key: TEILZAHLUNG.merkmale.vorgang, value: vorgang});
  }
  let konfig = searchParams.get(TEILZAHLUNG.merkmale.konfig);
  if (konfig && konfig.length <= 200 && KONFIG_RX.test(konfig)) {
    if (konfig.endsWith(';partner=-')) {
      const code = sitzungsCodes.find(
        (c) => CODE_RX.test(String(c)) && !/^QA-REST-/i.test(String(c)),
      );
      if (code) konfig = `${konfig.slice(0, -1)}${code}`;
    }
    out.push({key: TEILZAHLUNG.merkmale.konfig, value: konfig});
  }
  return out;
}

/**
 * Darf dieser Permalink einen Warenkorb anlegen? Trägt er den Ratenanteil,
 * nur im Markt DE/AT: der Storefront-Warenkorb nimmt die Zeile in CH/US
 * sonst trotzdem an (s06 gemessen: 9.409 CHF / 9.538 USD ohne Fehler), und
 * der Ratenanteil wäre dort kein 10.000-€-Teil mehr.
 */
export function teil1Erlaubt({varianten, land}) {
  return !mitRatenanteil(varianten) || TEILZAHLUNG.maerkte.includes(land);
}

/**
 * Trägt der Permalink den Ratenanteil? Verglichen wird die Variante so, wie
 * Shopify sie liest: die führenden Ziffern, ohne führende Nullen. Gemessen am
 * 28.10.2026 im Markt CH: „0<Variante>“, „<Variante>e0“ und „<Variante>abc“
 * legten je einen Ratenanteil-Warenkorb zu 9.427 CHF an. Die zweite Linie
 * im Permalink prüft danach den angelegten Warenkorb selbst.
 */
export function mitRatenanteil(varianten) {
  return varianten.some((v) => {
    const roh = String(v).split('/').pop().replace(/^\D+/, '');
    return roh.match(/^\d*/)[0].replace(/^0+/, '') === TEILZAHLUNG.variante;
  });
}

/**
 * Permalink-Zeilen vor dem Anlegen: der Ratenanteil steht höchstens einmal
 * und mit Menge 1 darin. Gemessen am 29.10.2026 (DE): `/cart/<R>:2` und
 * `/cart/<R>:1,0<R>:1` legten je 20.000 € an. Eine zweite Ratenanteil-Zeile
 * fällt weg, jede Schreibweise zählt so, wie Shopify sie liest
 * (mitRatenanteil). Eine Menge unter 1 bleibt, wie sie ist: dann legt der
 * Permalink wie bisher keinen Warenkorb an.
 */
export function permalinkZeilen(zeilen) {
  let gesehen = false;
  const out = [];
  for (const z of zeilen) {
    if (!mitRatenanteil([z.merchandiseId])) {
      out.push(z);
      continue;
    }
    if (gesehen) continue;
    gesehen = true;
    out.push(z.quantity >= 1 ? {...z, quantity: 1} : z);
  }
  return out;
}

/**
 * Korrektur eines gelesenen Warenkorbs (POST /cart): der Ratenanteil steht
 * nur in DE/AT darin, dort höchstens eine Zeile mit Menge 1. Zählen muss
 * jedes Land, das am Warenkorb hängt (Markt der Anfrage UND Land des
 * Warenkorbs): ein in DE angelegter Ratenanteil wäre nach einem Wechsel auf
 * CH ein CHF-Betrag. `zeilen`: [{id, quantity, variantId}].
 * Ergebnis im Format von bindungsKorrektur (lib/qi-master-addons.js).
 */
export function ratenanteilKorrektur({zeilen, laender}) {
  const erlaubt =
    laender.length > 0 &&
    laender.every((l) => TEILZAHLUNG.maerkte.includes(l));
  const entfernen = [];
  const aendern = [];
  let behalten = false;
  for (const z of zeilen) {
    if (!mitRatenanteil([z.variantId])) continue;
    if (!erlaubt || behalten) {
      entfernen.push(z.id);
      continue;
    }
    behalten = true;
    if (z.quantity !== 1) aendern.push({id: z.id, quantity: 1});
  }
  return {entfernen, aendern};
}

/**
 * Die eine Schreibweise, die nachweislich NICHT der Ratenanteil ist: die
 * kanonische GID eines anderen Artikels. Jede andere Form kann Shopify als
 * Ratenanteil lesen. Gemessen am 29.10.2026 (K3-Widerleger s02): auch
 * „6604_8336396556“ (Unterstrich wie in Ruby-Zahlen), die Base64-GID und
 * „…/66048336396556?a=/“ legten den Ratenanteil an, ohne dass mitRatenanteil
 * sie erkannte. Entschieden wird deshalb am angelegten Warenkorb, nie an der
 * Schreibweise; die Schreibweise sagt nur, ob nachgelesen werden muss.
 */
const KANONISCH_RX = /^gid:\/\/shopify\/ProductVariant\/[1-9]\d{0,19}$/;

function sicherKeinRatenanteil(id) {
  const s = String(id ?? '');
  return KANONISCH_RX.test(s) && s.split('/').pop() !== TEILZAHLUNG.variante;
}

/**
 * Muss nachgelesen werden? Ja, sobald eine Zeile der Aktion der Ratenanteil
 * sein KANN (jede Schreibweise außer der kanonischen eines anderen Artikels)
 * oder eine Menge über 1 setzt. Ein normaler Klick mit der GID eines anderen
 * Artikels kostet keinen zusätzlichen Lesezugriff.
 */
export function ratenanteilPruefen({action, inputs}) {
  const lines = inputs?.lines;
  if (action !== 'LinesAdd' && action !== 'LinesUpdate') return false;
  if (!Array.isArray(lines)) return true;
  if (action === 'LinesAdd') {
    return lines.some((l) => !sicherKeinRatenanteil(l?.merchandiseId));
  }
  return lines.some(
    (l) =>
      (l?.merchandiseId !== undefined &&
        !sicherKeinRatenanteil(l.merchandiseId)) ||
      !(Number(l?.quantity ?? 0) <= 1),
  );
}

// Höchstwert der Storefront-API je Seite.
const SEITE = 250;
// Shopify nimmt höchstens 500 Zeilen je Warenkorb an; 8 Seiten lassen Luft.
const SEITEN_MAX = 8;
const RUNDEN = 3;

const ZEILEN_QUERY = `#graphql
  query RatenanteilZeilen($cartId: ID!, $nach: String) {
    cart(id: $cartId) {
      buyerIdentity {
        countryCode
      }
      lines(first: ${SEITE}, after: $nach) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          quantity
          merchandise {
            ... on ProductVariant {
              id
            }
          }
        }
      }
    }
  }
`;

/**
 * ALLE Zeilen eines Warenkorbs, Seite für Seite. Eine einzelne Seite ist
 * nicht der Warenkorb: mit einem Ratenanteil an Position 1, 250 anderen
 * Zeilen und einem zweiten Ratenanteil an Position 252 sah die Bindung nur
 * eine saubere Zeile, und nach dem Entfernen der 250 lagen 20.000 € im
 * Warenkorb (K3-Widerleger s02, Runde 2, live gemessen 29.10.2026).
 * Wirft, wenn der Warenkorb nicht vollständig lesbar ist (Lesefehler,
 * mehr Seiten als SEITEN_MAX): ein halber Warenkorb ist kein Warenkorb.
 * Ergebnis: {zeilen: [{id, quantity, variantId}], land}.
 */
export async function alleZeilen({storefront, cartId}) {
  const zeilen = [];
  let nach = null;
  let land = null;
  for (let seite = 0; seite < SEITEN_MAX; seite += 1) {
    const daten = await storefront.query(ZEILEN_QUERY, {
      variables: {cartId, nach},
      cache: storefront.CacheNone(),
    });
    const korb = daten?.cart;
    if (!korb) throw new Error('Warenkorb nicht lesbar');
    land = korb.buyerIdentity?.countryCode ?? null;
    for (const z of korb.lines?.nodes || []) {
      zeilen.push({
        id: z.id,
        quantity: z.quantity,
        variantId: z.merchandise?.id,
      });
    }
    const info = korb.lines?.pageInfo;
    if (!info?.hasNextPage) return {zeilen, land};
    nach = info.endCursor;
  }
  throw new Error('Warenkorb hat mehr Seiten als erwartet');
}

/**
 * Bindung in routes/cart.jsx und routes/cart.$lines.jsx (Muster
 * bindeQiMasterAddons): liest den angelegten Warenkorb VOLLSTÄNDIG
 * (alleZeilen) und wendet ratenanteilKorrektur an; danach liest sie nach,
 * ob er sauber ist, höchstens RUNDEN Mal.
 * Fail-soft: scheitert das Lesen oder Korrigieren, bleibt das letzte
 * Ergebnis stehen. Dann bleibt der Wächter die Linie: er stellt für eine
 * Bestellung 1, die nicht genau eine Zeile zu 10.000 € in EUR trägt, keinen
 * Code aus.
 */
export async function bindeRatenanteil({
  cart,
  storefront,
  action,
  inputs,
  result,
  land,
}) {
  const cartId = result?.cart?.id;
  if (!cartId || !ratenanteilPruefen({action, inputs})) return result;
  let neu = result;
  for (let runde = 0; runde < RUNDEN; runde += 1) {
    let gelesen;
    try {
      gelesen = await alleZeilen({storefront, cartId});
    } catch {
      return neu;
    }
    const laender = [land, gelesen.land].filter(Boolean);
    const {entfernen, aendern} = ratenanteilKorrektur({
      zeilen: gelesen.zeilen,
      laender,
    });
    if (!entfernen.length && !aendern.length) return neu;
    try {
      if (entfernen.length) {
        const r = await cart.removeLines(entfernen, {cartId});
        if (r?.cart) neu = r;
      }
      if (aendern.length) {
        const r = await cart.updateLines(aendern, {cartId});
        if (r?.cart) neu = r;
      }
    } catch {
      return neu;
    }
  }
  return neu;
}

/**
 * `?discount=` als Komma-Liste: der Restzahlungs-Link des Wächters trägt den
 * Anrechnungscode und, wenn kombinierbar, den Partnercode. Ein einzelner
 * Code bleibt ein Code (bisheriges Verhalten). Höchstens fünf.
 */
export function rabattcodesAusQuery(searchParams) {
  const roh = searchParams.get('discount') || '';
  const codes = [];
  for (const teil of roh.split(',')) {
    const c = teil.trim();
    if (c && !codes.includes(c)) codes.push(c);
    if (codes.length === 5) break;
  }
  return codes;
}
