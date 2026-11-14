/**
 * QI-ALPHA-FREISCHALTUNG 01.11.2026, 11:11 Uhr Berlin (= 10:11:00Z).
 *
 * Christian 01.11.2026 (Job 20261101-prio1-qi-alpha-freischaltung-1111-menue-
 * banner-now-available): „bei mal heute um 11.11 Uhr … schalten wir die
 * Homepage frei … wenn man oben auf Produkte klickt und dann G-Alpha
 * draufklickt. Und ich hätte gerne, dass dann oben noch ein Banner ist, statt
 * die 4,8 Sterne … schwarzen Banner und dann in roter Schrift the G-Alpha
 * Registry-Zeichen is now available. Und der Link führt dann auch auf die
 * G-Alpha Landingpage.“
 * Korrektur ~15 min später (Job 20261101-prio1-qi-alpha-banner-nur-startseite-
 * 4-8-sterne-waehlbar): „diese 4,8 Sterne Banner … soll nicht gelöscht werden,
 * sondern dass man das eben auswählen kann. Und der neue Banner ist nur auf
 * der Startseite … Nirgendwo sonst ist der Banner zu sehen.“
 *
 * Deshalb hier drei Dinge an EINER Stelle:
 *   1. die Uhrzeit (server-entschieden, siehe unten),
 *   2. die Banner-WAHL der Startseite (beide Varianten bleiben im Code),
 *   3. der Menüpunkt „Qi Alpha®“ unter „Shop“ -> Landingpage, nie Kaufseite.
 *
 * WARUM DIE SERVERZEIT ENTSCHEIDET: eine Kunden-Uhr, die vorgeht, hätte den
 * Banner vor 11:11 gezeigt (Vorab-Leak). Der Root-Loader schickt seine Uhrzeit
 * mit; der Client rechnet nur die RESTZEIT ab dieser Zeit herunter, liest die
 * eigene Uhr also nie absolut. Die Seiten sind `oxygen-full-page-cache:
 * uncacheable` (gemessen 01.11.2026), jede neue Seite kommt also mit frischer
 * Serverzeit.
 *
 * UMSCHALTEN OHNE CODE (Christian: „zurückholen und austauschen … auswählen“):
 * Shop-Metafeld `qb_kopfleiste.startseite` des Global Deutsch-Shops, Werte
 * 'qi-alpha' | 'bewertung' (Definition mit access.storefront=PUBLIC_READ, sonst
 * liefert die Storefront-API NULL). Umschalten per
 *   homepage-bauer/bin/kopfleiste-wahl setze bewertung
 * wirkt ohne Deploy. Cache 30 s frisch + 3600 s stale: danach sieht der erste
 * Aufruf je Kante noch den alten Wert und stößt die Erneuerung an, der nächste
 * sieht den neuen.
 * Reihenfolge der Quellen: Metafeld gültig -> sein Wert; unlesbar, Isolate hat
 * schon gelesen -> letzter Wert; sonst STARTSEITEN_LEISTE. Welche Quelle galt,
 * steht als data-kopfleiste-quelle im HTML.
 *
 * RÜCKWEG, ein Schritt: Metafeld auf 'bewertung' (alter 4,8-Sterne-Banner
 * überall). Menüpunkt: MENUE_QI_ALPHA = false. Oder hb-deploy revert.
 *
 * APPLE-KAUFSEITEN (Job 20261031-de-apple-seiten-ankuendigungsleiste-14000-
 * ausblenden, Christian 29.10.2026: „dieses verpflichtent 14000 nuter
 * preisanker dort … das passt nich mehr hin … also das wirklich dauerhaft
 * löaschen“): die drei Kaufseiten in APPLE_KAUFSEITEN_OHNE_LEISTE tragen keine
 * Leiste. Dasselbe Prinzip, zweites Feld: `qb_kopfleiste.apple_seiten`, Werte
 * 'keine' | 'bewertung', Vorgabe 'keine'. Zurückholen ohne Deploy:
 *   homepage-bauer/bin/kopfleiste-wahl --flaeche apple-seiten setze bewertung
 */

/** Freischaltung in UTC. 11:11 Uhr MEZ (Winterzeit seit 25.10.2026) = 10:11Z. */
export const QI_ALPHA_FREISCHALTUNG_AB = '2026-11-01T10:11:00Z';
export const QI_ALPHA_FREISCHALTUNG_MS = Date.parse(QI_ALPHA_FREISCHALTUNG_AB);

/** Die Landingpage (Christian: „die Landingpage-Seite ist da ausnahmsweise die
 *  Shop-Seite“). /pages/qi-alpha antwortet live 301 auf diese Schreibweise. */
export const QI_ALPHA_LP = '/pages/Qi-Alpha';

/**
 * BANNER-WAHL DER STARTSEITE (Christian: „auswählen kann“).
 *   'qi-alpha'  -> ab der Freischaltung „The Qi Alpha® is now available“
 *   'bewertung' -> der bisherige 4,8-Sterne-Banner (auch vor der Freischaltung)
 * Alle anderen Seiten zeigen den 4,8-Sterne-Banner, ausser den Apple-Kaufseiten
 * (APPLE_KAUFSEITEN_OHNE_LEISTE).
 */
export const BANNER_VARIANTEN = Object.freeze(['bewertung', 'qi-alpha']);
/** Rückfall, wenn das Metafeld nie lesbar war (Zustand beim Deploy). */
export const STARTSEITEN_LEISTE = 'qi-alpha';

/**
 * Die Kaufseiten ohne Leiste, genau diese drei Pfade. Die B-Fassungen
 * (/products/qione-2-pro-b …) und die Landingpages unter /pages/ behalten sie.
 */
export const APPLE_KAUFSEITEN_OHNE_LEISTE = Object.freeze([
  '/products/qione-2-pro',
  '/products/qibracelet',
  '/products/qihome-air',
]);
export const APPLE_LEISTE_VARIANTEN = Object.freeze(['keine', 'bewertung']);
/** Rückfall, wenn das Feld nie lesbar war (Zustand beim Deploy). */
export const APPLE_SEITEN_LEISTE = 'keine';

export const KOPFLEISTE_METAFELD = Object.freeze({namespace: 'qb_kopfleiste', key: 'startseite'});
export const KOPFLEISTE_QUERY = `#graphql
  query KopfleisteStartseite {
    shop {
      metafield(namespace: "qb_kopfleiste", key: "startseite") {
        value
      }
      appleSeiten: metafield(namespace: "qb_kopfleiste", key: "apple_seiten") {
        value
      }
    }
  }
`;

let zuletztWahl = null;
let zuletztApple = null;

/**
 * Bewertet einen Metafeld-Wert. Unbekannte Werte erzeugen keinen dritten
 * Zustand: sie zählen wie „unlesbar“.
 * @param {string|null|undefined} wert
 * @returns {{wahl: string, quelle: 'metafeld'|'zuletzt'|'vorgabe'}}
 */
export function uebernehmeLeistenWahl(wert) {
  const w = String(wert ?? '').trim().toLowerCase();
  if (BANNER_VARIANTEN.includes(w)) {
    zuletztWahl = w;
    return {wahl: w, quelle: 'metafeld'};
  }
  if (zuletztWahl) return {wahl: zuletztWahl, quelle: 'zuletzt'};
  return {wahl: STARTSEITEN_LEISTE, quelle: 'vorgabe'};
}

/**
 * Dieselbe Bewertung für das Feld der Apple-Kaufseiten: unbekannt zählt wie
 * unlesbar, kein dritter Zustand.
 * @param {string|null|undefined} wert
 * @returns {{appleSeiten: string, appleQuelle: 'metafeld'|'zuletzt'|'vorgabe'}}
 */
export function uebernehmeAppleWahl(wert) {
  const w = String(wert ?? '').trim().toLowerCase();
  if (APPLE_LEISTE_VARIANTEN.includes(w)) {
    zuletztApple = w;
    return {appleSeiten: w, appleQuelle: 'metafeld'};
  }
  if (zuletztApple) return {appleSeiten: zuletztApple, appleQuelle: 'zuletzt'};
  return {appleSeiten: APPLE_SEITEN_LEISTE, appleQuelle: 'vorgabe'};
}

/** Nur für Tests. */
export function leistenWahlZuruecksetzen() {
  zuletztWahl = null;
  zuletztApple = null;
}

/**
 * Liest die Wahl über die Storefront-API (Cache 30 s frisch + 3600 s stale,
 * Folge für das Umschalten im Kopf der Datei). Wirft nie.
 * @param {any} storefront Hydrogen-Storefront-Client
 */
export async function ladeLeistenWahl(storefront) {
  let wert = null;
  let appleWert = null;
  try {
    const cache =
      typeof storefront?.CacheCustom === 'function'
        ? storefront.CacheCustom({mode: 'public', maxAge: 30, staleWhileRevalidate: 3600})
        : undefined;
    const data = await storefront.query(KOPFLEISTE_QUERY, {cache});
    wert = data?.shop?.metafield?.value ?? null;
    appleWert = data?.shop?.appleSeiten?.value ?? null;
  } catch {
    wert = null;
    appleWert = null;
  }
  return {...uebernehmeLeistenWahl(wert), ...uebernehmeAppleWahl(appleWert)};
}

/**
 * NR.-1-LEISTE DER STARTSEITE (Christian 14.11.2026, Job 20261114-prio1-homepage-
 * banner-weltweit-nr1-kundenzufriedenheit-studien-de-en): „ob man unter dem
 * Banner G-Alpha Now Available und eben den anderen Banner mit den
 * 4.8-Sterne-Kundenbewertungen, dass man da einen Banner baut. Das heißt,
 * weltweit Nummer 1 bei Energieprodukten bezüglich Kundenzufriedenheit und
 * Studienergebnisse. … den Banner austauschen.“
 *
 * Die Leiste steht NUR auf der Startseite (`/` und `/pages/start-b`), direkt
 * unter der Qi-Alpha-Leiste. Sie führt Sterne und Nr.-1-Aussage zusammen und
 * ersetzt dort die 4,8-Sterne-Leiste: steht der Schalter qb_kopfleiste.startseite
 * auf 'bewertung', zeigt die Startseite nur diese Leiste (sie trägt die Sterne
 * schon). Alle anderen Seiten bleiben, wie sie sind.
 * Belege in der Leiste: Google-Note und Anzahl aus dem root-Loader (nie eine
 * feste Zahl), 5 Studien -> STUDIEN_SEITE. Ein Klick auf die Sterne springt zu
 * den Google-Rezensionen der Seite, jeder andere Klick auf die Studienseite.
 * RÜCKWEG: NR_EINS_LEISTE = false (Startseite wie vor dem 14.11.) oder
 * hb-deploy revert.
 */
export const NR_EINS_LEISTE = true;
export const NR_EINS_TEXT = 'Weltweit Nr. 1 bei Energieprodukten in Kundenzufriedenheit und Studien';
export const STUDIEN_SEITE = '/pages/studien';
export const STUDIEN_ANZAHL = 5;

/** Nr.-1-Leiste zeigen? Nur Startseite, nie auf einer Seite ohne Leiste. */
export function zeigeNrEinsLeiste({pathname, leiste, an = NR_EINS_LEISTE}) {
  if (!an || leiste === 'keine') return false;
  return istStartseite(pathname);
}

/** Menüpunkt „Qi Alpha®“ unter „Shop“ (Desktop + Handy) ab der Freischaltung. */
export const MENUE_QI_ALPHA = true;

/** Die Startseite hat zwei Arme: `/` und die B-Fassung, auf die `/` die Hälfte
 *  der Besucher 302 schickt (experiment-weiche.server.js, start-e1-gs081). */
export const STARTSEITEN_PFADE = Object.freeze(['/', '/pages/start-b']);

export function istStartseite(pathname) {
  let p = String(pathname || '/').split(/[?#]/)[0];
  if (p.length > 1) p = p.replace(/\/+$/, '');
  return STARTSEITEN_PFADE.includes(p.toLowerCase());
}

export function istAppleKaufseite(pathname) {
  let p = String(pathname || '/').split(/[?#]/)[0];
  if (p.length > 1) p = p.replace(/\/+$/, '');
  return APPLE_KAUFSEITEN_OHNE_LEISTE.includes(p.toLowerCase());
}

export function istFreigeschaltet(jetztMs) {
  return Number.isFinite(jetztMs) && jetztMs >= QI_ALPHA_FREISCHALTUNG_MS;
}

/**
 * Welche Leiste zeigt diese Seite? Reine Funktion, damit Probe und Seite
 * dieselbe Entscheidung rechnen.
 */
export function bannerVariante({
  pathname,
  freigeschaltet,
  wahl = STARTSEITEN_LEISTE,
  appleSeiten = APPLE_SEITEN_LEISTE,
}) {
  if (istAppleKaufseite(pathname) && appleSeiten !== 'bewertung') return 'keine';
  if (!freigeschaltet) return 'bewertung';
  if (wahl !== 'qi-alpha') return 'bewertung';
  return istStartseite(pathname) ? 'qi-alpha' : 'bewertung';
}

export const QI_ALPHA_MENUEPUNKT = Object.freeze({
  id: 'qb-menue-qi-alpha-lp',
  resourceId: null,
  tags: [],
  title: 'Qi Alpha®',
  type: 'HTTP',
  url: QI_ALPHA_LP,
  items: [],
});

/**
 * Hängt „Qi Alpha®“ als ERSTEN Punkt unter „Shop“ ein, wenn freigeschaltet.
 * Das Shopify-Menü selbst bleibt unberührt; steht der Punkt dort schon (jemand
 * pflegt ihn im Admin nach), wird er nicht doppelt eingefügt.
 */
export function menueMitQiAlpha(menu, freigeschaltet) {
  if (!menu || !freigeschaltet || !MENUE_QI_ALPHA) return menu;
  const items = menu.items || [];
  const shopIndex = items.findIndex(
    (i) => String(i?.title || '').trim().toLowerCase() === 'shop',
  );
  if (shopIndex < 0) return menu;
  const shop = items[shopIndex];
  const kinder = shop.items || [];
  const schonDa = kinder.some((k) =>
    /\/pages\/qi-alpha\/?$/i.test(String(k?.url || '').split(/[?#]/)[0]),
  );
  if (schonDa) return menu;
  const neu = items.slice();
  neu[shopIndex] = {...shop, items: [QI_ALPHA_MENUEPUNKT, ...kinder]};
  return {...menu, items: neu};
}

/**
 * Root-Loader-Feld. `jetzt` ist die Serverzeit dieser Antwort. Nur ausserhalb
 * der Produktion darf QI_ALPHA_PROBE_JETZT (ISO-Zeit) sie ersetzen - damit
 * lässt sich der Ablauf auf der Vorschau trocken fahren, live nie.
 */
export function freischaltungsDaten({env, istProduktion, jetztMs = Date.now()}) {
  let jetzt = jetztMs;
  const probe = env?.QI_ALPHA_PROBE_JETZT;
  if (!istProduktion && probe) {
    const p = Date.parse(probe);
    if (Number.isFinite(p)) jetzt = p;
  }
  return {ab: QI_ALPHA_FREISCHALTUNG_AB, jetzt};
}
