/*
 * BLACK FRIDAY 2026 (Grossjob 20261103-prio6-black-friday-2026-landingpage-
 * apple-stil-4-angebote-ohne-bundles-countdown, s04). Reine Regeln, kein React:
 *   node --test test/black-friday-2026.test.mjs
 *
 * EINE QUELLE (Regel K1, Lehre aus ten-years-deals.js: die Stilllegung schützte
 * die Erreichbarkeit, nicht die Wahrheit der Zahlen). Beträge, Produkte und
 * Zeitfenster stehen nur in black-friday-2026.json, einer byte-gleichen Kopie
 * von angebote-bf2026.json aus dem Job-Ordner. Die Shopify-Rabatte werden aus
 * denselben Zahlen angelegt (s03). Hier steht nichts, was nicht daraus folgt.
 *
 * SCHALTER BF2026_SEITEN = off | vorschau | on. Die Umgebung gewinnt vor dem
 * Code-Standard (Muster lib/apple-seiten.js), jeder andere Wert lässt den
 * Standard gelten. Standard off: die fünf Pfade laufen durch den heutigen Code
 * (404, dann greift der Admin-Redirect). Ein versehentlicher Merge ändert
 * damit nichts. Livegang: s06 auf Elinas Wort.
 */
import quelle from './black-friday-2026.json' with {type: 'json'};
import {betragText} from '../lib/betrag-text.js';

export const BF2026 = quelle;
export const BF2026_SCHALTER = 'BF2026_SEITEN';
export const BF2026_STANDARD = 'off';

const MODI = new Set(['off', 'vorschau', 'on']);
const START_MS = Date.parse(quelle.fenster.start_utc);
const ENDE_MS = Date.parse(quelle.fenster.ende_utc);
const ZEITZONE = quelle.fenster.zeitzone_anzeige;

/** Stellung des Schalters. @param {Record<string, string>|undefined} env */
export function bf2026Modus(env) {
  const wert = env?.[BF2026_SCHALTER];
  return MODI.has(wert) ? wert : BF2026_STANDARD;
}

/** Das Angebot zu einer alten URL oder null. */
export function getBf2026AngebotByHandle(handle) {
  const klein = String(handle ?? '').toLowerCase();
  return quelle.angebote.find((a) => a.url_handle === klein) ?? null;
}

/**
 * Die Uhr der Seite. `?bf_jetzt=<ISO>` verstellt sie nur in der Vorschau;
 * live zählt allein die echte Zeit.
 * @returns {{ms: number, gepinnt: string|null}}
 */
export function bf2026Jetzt({modus, url, ms = Date.now()}) {
  if (modus !== 'vorschau') return {ms, gepinnt: null};
  let roh = null;
  try {
    roh = new URL(url).searchParams.get('bf_jetzt');
  } catch {
    return {ms, gepinnt: null};
  }
  const pin = roh ? Date.parse(roh) : NaN;
  return Number.isFinite(pin) ? {ms: pin, gepinnt: roh} : {ms, gepinnt: null};
}

/** vor | waehrend | vorbei. Beide Grenzen gehören zum Fenster. */
export function bf2026Phase(ms) {
  if (ms < START_MS) return 'vor';
  return ms <= ENDE_MS ? 'waehrend' : 'vorbei';
}

/** Der Zeitpunkt, auf den die Uhr zählt (ISO aus der Quelle), vorbei: null. */
export function bf2026Ziel(phase) {
  if (phase === 'vor') return quelle.fenster.start_utc;
  return phase === 'waehrend' ? quelle.fenster.ende_utc : null;
}

/** Restzeit bis zum Ziel, nie negativ. */
export function bf2026Restzeit(zielIso, ms) {
  const rest = Math.max(0, Math.floor((Date.parse(zielIso) - ms) / 1000));
  return {
    tage: Math.floor(rest / 86400),
    stunden: Math.floor((rest % 86400) / 3600),
    minuten: Math.floor((rest % 3600) / 60),
    sekunden: rest % 60,
  };
}

function teileBerlin(iso) {
  const teile = new Intl.DateTimeFormat('de-DE', {
    timeZone: ZEITZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: 'numeric',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(iso));
  return Object.fromEntries(teile.map((t) => [t.type, t.value]));
}

/** „Freitag, 27. November, 0 Uhr“ (immer Zeit in Berlin, nie die des Geräts). */
export function bf2026Zeitpunkt(iso) {
  const t = teileBerlin(iso);
  const stunde = Number(t.hour);
  const zeit = t.minute === '00' ? `${stunde} Uhr` : `${stunde}:${t.minute} Uhr`;
  return `${t.weekday}, ${t.day}. ${t.month}, ${zeit}`;
}

/** „27.–30. November“ aus dem Fenster. */
export function bf2026Zeitraum() {
  const von = teileBerlin(quelle.fenster.start_utc);
  const bis = teileBerlin(quelle.fenster.ende_utc);
  return von.month === bis.month
    ? `${von.day}.–${bis.day}. ${bis.month}`
    : `${von.day}. ${von.month} – ${bis.day}. ${bis.month}`;
}

/** „27. November“: der erste Tag. */
export function bf2026Starttag() {
  const von = teileBerlin(quelle.fenster.start_utc);
  return `${von.day}. ${von.month}`;
}

/**
 * Stimmt der Preis von heute aus der Quelle noch mit dem, was dieser Markt
 * gerade zahlt? `ist` = {betrag, waehrung} der Einzelprodukte des Angebots aus
 * Shopify. Nur dann nennt die Seite den BF-Preis (nie ein Preis, den der
 * Warenkorb nicht zieht).
 */
export function bf2026PreisStimmt(angebot, ist) {
  if (!ist || ist.waehrung !== quelle.waehrung) return false;
  return Math.abs(Number(ist.betrag) - angebot.preis_heute_eur) < 0.005;
}

/**
 * Was die Karte in dieser Phase über den Preis sagt. BF-Preis und „Du sparst“
 * nur im Fenster, davor „ab … für …“, danach gar kein Preis.
 */
export function bf2026PreisStand(angebot, phase, ist) {
  if (phase === 'vorbei') return {};
  const stimmt = bf2026PreisStimmt(angebot, ist);
  const bf = betragText(angebot.bf_preis_eur);
  const heute = betragText(angebot.preis_heute_eur);
  if (phase === 'vor') {
    return stimmt
      ? {zeile: `Heute ${heute}`, zusatz: `ab ${bf2026Starttag()} für ${bf}`}
      : {zusatz: `Ab ${bf2026Starttag()} zieht der Rabatt automatisch im Warenkorb.`};
  }
  return stimmt
    ? {preis: bf, statt: `statt ${heute}`, zusatz: `Du sparst ${betragText(angebot.rabatt_eur)}`}
    : {zusatz: 'Der Rabatt zieht automatisch im Warenkorb.'};
}

/** Die normale Produktseite, auf die ein Angebot nach dem Ende führt. */
export function bf2026NormalePfad(angebot) {
  return `/products/${angebot.artikel[0].produkt}`;
}

/** Ein interner Link der Aktion: trägt el, in der Vorschau auch die Uhr. */
export function bf2026Link(pfad, gepinnt = null) {
  const suche = new URLSearchParams({el: quelle.el_parameter});
  if (gepinnt) suche.set('bf_jetzt', gepinnt);
  return `${pfad}?${suche}`;
}

/** Wählbare Varianten eines Produkts; eine einzige Variante ist keine Wahl. */
export function bf2026Varianten(produkt) {
  const alle = produkt?.variants?.nodes ?? [];
  return alle.length > 1 ? alle : [];
}

/**
 * Vorwahl je Produkt: `vorwahl` (id-Finder), sonst die mittlere lieferbare
 * Variante. Ausverkauftes wird nie vorgewählt.
 */
export function bf2026StartVariante(produkt, istVorwahl = null) {
  const alle = produkt?.variants?.nodes ?? [];
  const lieferbar = alle.filter((v) => v?.availableForSale);
  if (!lieferbar.length) return null;
  const gesucht = istVorwahl ? lieferbar.find(istVorwahl) : null;
  return (gesucht ?? lieferbar[Math.floor((lieferbar.length - 1) / 2)]).id;
}

/**
 * Die Warenkorbzeilen eines Angebots: immer die Einzelprodukte, nie ein
 * Bundle-Produkt. Fehlt eine Variante oder ist sie ausverkauft, gibt es keine
 * Zeile: ein halbes Angebot legt der Knopf nie in den Warenkorb.
 * @param {object} angebot aus der Quelle
 * @param {Record<string, object>} produkte Handle -> Storefront-Produkt
 * @param {Record<string, string>} wahl Handle -> Varianten-id
 */
export function bf2026Zeilen(angebot, produkte, wahl) {
  const zeilen = [];
  for (const artikel of angebot.artikel) {
    const nodes = produkte?.[artikel.produkt]?.variants?.nodes ?? [];
    const variante = nodes.find((v) => v.id === wahl?.[artikel.produkt]) ?? null;
    if (!variante?.availableForSale) return [];
    zeilen.push({merchandiseId: variante.id, quantity: artikel.menge, selectedVariant: variante});
  }
  return zeilen;
}
