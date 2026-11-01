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
 * RÜCKWEG, ein Schritt: STARTSEITEN_LEISTE = 'bewertung' (alter 4,8-Sterne-
 * Banner überall), MENUE_QI_ALPHA = false (Menüpunkt weg). Oder hb-deploy
 * revert des Merges.
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
 * Alle anderen Seiten zeigen IMMER den 4,8-Sterne-Banner.
 */
export const BANNER_VARIANTEN = Object.freeze(['bewertung', 'qi-alpha']);
export const STARTSEITEN_LEISTE = 'qi-alpha';

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

export function istFreigeschaltet(jetztMs) {
  return Number.isFinite(jetztMs) && jetztMs >= QI_ALPHA_FREISCHALTUNG_MS;
}

/**
 * Welche Leiste zeigt diese Seite? Reine Funktion, damit Probe und Seite
 * dieselbe Entscheidung rechnen.
 */
export function bannerVariante({pathname, freigeschaltet, wahl = STARTSEITEN_LEISTE}) {
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
