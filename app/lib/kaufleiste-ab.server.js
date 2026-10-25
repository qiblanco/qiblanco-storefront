/**
 * A/B-TEST DER KAUFLEISTE — Zuteilung im Loader der Kaufseite.
 * Grossjob 20261025-design-ai-anna-fenster-wie-apple-handy-hochrutschen-ab-
 * jetzt-kaufen, s03; Christian 25.10.2026 (Z4): „bei diesem jetzt in den
 * warenkorb legen auch mal anddere Variatnen ausprobieren. statt dem Preis
 * etwas wie "E-Smog Schutz" "Jetzt kaufen" also eine Nutzenaussage“.
 *
 * Was die Arme zeigen und warum: components/reusables/kaufleiste-lage.js
 * (kaufleisteAnzeige, KAUFLEISTE_NUTZEN). Hier steht nur, WER welchen Arm
 * sieht.
 *
 * ENTSCHEIDE, je begründet:
 *  - EIN KOMPONENTENTEST, KEINE WEICHE: beide Arme leben auf DERSELBEN Route.
 *    Ein 302 wie in experiment-weiche.server.js trennte die Arme am Pfad,
 *    hier gibt es keinen zweiten Pfad. Der Arm steht deshalb im SSR fest (die
 *    Seite ist oxygen-full-page-cache: uncacheable, gemessen 25.10.2026), und
 *    die Leiste meldet ihn beim ersten Sichtbarwerden als Stempel
 *    ab_zuteilung an den eigenen Receiver (events.db, Tabelle ab_zuteilung,
 *    dieselbe Grundlage wie die Tests des Global Englisch-Shops).
 *  - STABIL JE BESUCHER, OHNE SPEICHER AUF DEM GERÄT: besucherEimer aus
 *    lp-ab-v2.server.js (FNV-1a über Salz|IP|UA), nicht nachgebaut. Eigenes
 *    Salz, also unabhängig von den Seiten-Experimenten. Dasselbe Salz für
 *    alle Kaufseiten: wer zwei Produkte ansieht, sieht zweimal denselben Arm.
 *  - 50/50: zwei Arme, gleiche Aufteilung gibt bei gleichem Verkehr die
 *    kleinste Unsicherheit über den Unterschied.
 *  - IMMER ARM a: Crawler und Bots (isbot), unser eigener Verkehr
 *    (interner-verkehr.js, IP und UA-Marker QiBlancoInternal), Zugriffe ohne
 *    Client-IP und Produkte ohne Nutzenaussage (qi-master).
 *  - PIN für Messwerkzeuge: ?kaufleiste=a|b. Ein Pin wird im Stempel als
 *    erzwungen=1 markiert und zählt in keiner Auswertung.
 *  - KILL: KAUFLEISTE_AB_AKTIV = false (PR) oder Env KAUFLEISTE_AB_MODE=off
 *    (Handgriff). Dann sieht jeder Arm a, auch mit Pin, und es wird nichts
 *    gestempelt. Nur 'off' schaltet ab.
 *
 * CROSS-BOUNDARY-LINKAGE: kein neuer Identitäts-Key, kein Cookie, kein
 * Query-Umbau; der Knopf ruft denselben AddToCartButton mit denselben Zeilen.
 */
import {isbot} from 'isbot';
import {KAUFLEISTE_NUTZEN} from '../components/reusables/kaufleiste-lage.js';
import {buyerIpAusRequest, istInternerZugriff} from './interner-verkehr.js';
import {besucherEimer} from './lp-ab-v2.server.js';

/** Code-Schalter des Tests. false = alle sehen Arm a, kein Stempel. */
export const KAUFLEISTE_AB_AKTIV = true;

/** Salz der Zuteilung. Neuer Test = neues Salz. */
export const KAUFLEISTE_AB_SALZ = 'kaufleiste-z4';

/** Eimer < ANTEIL_B -> Arm b. */
export const ANTEIL_B = 50;

/** Pin-Parameter für Messwerkzeuge. */
export const PIN_PARAM = 'kaufleiste';

/** Kill per Env: NUR der Wert 'off' schaltet ab. */
export function kaufleisteAbAktiv(env, codeSchalter = KAUFLEISTE_AB_AKTIV) {
  if (!codeSchalter) return false;
  return !(env && env.KAUFLEISTE_AB_MODE === 'off');
}

/**
 * Reine Entscheidung: welcher Arm für diesen Request und dieses Produkt?
 *
 * @param {Request} request
 * @param {Record<string, string>|undefined} env
 * @param {string} handle Produkt der Kaufseite
 * @param {boolean} [codeSchalter]
 * @returns {{arm: 'a'|'b', erzwungen: boolean} | null} null = nicht im Test
 *   (Seite zeigt den Bestand, kein Stempel)
 */
export function kaufleisteArm(request, env, handle, codeSchalter = KAUFLEISTE_AB_AKTIV) {
  if (!request || !kaufleisteAbAktiv(env, codeSchalter)) return null;
  if (!KAUFLEISTE_NUTZEN[String(handle || '')]) return null;
  let url;
  try {
    url = new URL(request.url);
  } catch {
    return null;
  }
  const pin = url.searchParams.get(PIN_PARAM);
  if (pin === 'a' || pin === 'b') return {arm: pin, erzwungen: true};
  const ua = request.headers?.get?.('user-agent') || '';
  if (isbot(ua)) return null;
  const ip = request.headers?.get ? buyerIpAusRequest(request) : '';
  if (istInternerZugriff({userAgent: ua, ip})) return null;
  if (!ip) return null;
  const eimer = besucherEimer(ip, ua, KAUFLEISTE_AB_SALZ);
  return {arm: eimer < ANTEIL_B ? 'b' : 'a', erzwungen: false};
}

/**
 * Für den Loader: Schlüssel `kaufleisteAb` in den Loaderdaten, oder nichts.
 * Ohne Test bleibt der Schlüssel weg; die Loaderdaten sind dann gleich wie
 * vor s03.
 */
export function kaufleisteAbDaten({request, context}, handle) {
  const ab = kaufleisteArm(request, context?.env, handle);
  return ab ? {kaufleisteAb: ab} : {};
}
