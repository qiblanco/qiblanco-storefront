/**
 * Netto-Weg für EU-Firmen im Warenkorb (Global Deutsch-Shop), geteilte Regeln
 * für Komponente und Route. Christian 08.11.2026: „… dass die Rechnung und die
 * Zahlung gleich ohne Mehrwertsteuer erfolgt und auch gleich eine Prüfung
 * einbauen, dass die Mehrwertsteuer[-Nummer] geprüft wird.“
 *
 * Die Arbeit macht der Server (b2b-ust/src/netto.py hinter
 * https://b2b.dienst.qiblanco.com): er prüft die USt-IdNr. bei VIES, legt einen
 * steuerbefreiten Entwurf zum Nettopreis an, liest ihn zurück (Stop-Loss) und
 * antwortet mit der Bezahlseite. Dieser Shop zeigt nur den Weg dorthin und
 * leitet weiter. Vertrag: b2b-ust/README.md, Abschnitt „Netto-Weg“.
 *
 * Zusatz mit Rückfall (DEPLOY-FAEHIGKEIT.md, „Kaufweg ohne eigenen Server“):
 * der Browser ruft unseren Server nie direkt. Antwortet er nicht, gibt es den
 * Knopf nicht, und die normale Kasse bleibt der einzige Weg.
 */
import {geschenkVermerkt} from '~/lib/geschenk';

export const B2B_NETTO_ROUTE = '/b2b-netto';

/**
 * Rückweg ohne Server: false = der Knopf erscheint nie (ein Deploy). Sofort und
 * ohne Deploy: NETTO=aus in b2b-ust/config/b2b-ust.conf, dann meldet /healthz
 * nicht mehr „an“ und der Knopf verschwindet nach höchstens 60 s.
 */
export const B2B_NETTO_AN = true;

/**
 * Lieferländer: EU ohne Deutschland. Dieselbe Menge wie b2b_ust.EU minus
 * HEIMATLAND; der Server prüft sie noch einmal und lehnt alles andere mit
 * eigenem Satz ab. Griechenland ist GR als Land, die Nummer beginnt mit EL.
 */
export const LAENDER = [
  ['AT', 'Österreich'],
  ['BE', 'Belgien'],
  ['BG', 'Bulgarien'],
  ['DK', 'Dänemark'],
  ['EE', 'Estland'],
  ['FI', 'Finnland'],
  ['FR', 'Frankreich'],
  ['GR', 'Griechenland'],
  ['IE', 'Irland'],
  ['IT', 'Italien'],
  ['HR', 'Kroatien'],
  ['LV', 'Lettland'],
  ['LT', 'Litauen'],
  ['LU', 'Luxemburg'],
  ['MT', 'Malta'],
  ['NL', 'Niederlande'],
  ['PL', 'Polen'],
  ['PT', 'Portugal'],
  ['RO', 'Rumänien'],
  ['SE', 'Schweden'],
  ['SK', 'Slowakei'],
  ['SI', 'Slowenien'],
  ['ES', 'Spanien'],
  ['CZ', 'Tschechien'],
  ['HU', 'Ungarn'],
  ['CY', 'Zypern'],
];
export const LAND_CODES = new Set(LAENDER.map(([code]) => code));

/** Sätze, die der Shop selbst sagt. Die Ablehnungssätze kommen vom Server (Feld text). */
export const TEXT = {
  auf: 'Als Firma ohne MwSt bestellen (EU, mit USt-IdNr.)',
  satz:
    'Für Firmen mit Sitz in einem anderen EU-Land. Wir prüfen Ihre USt-IdNr. sofort bei der EU und Sie zahlen den Preis ohne Mehrwertsteuer.',
  senden: 'Weiter zur Zahlung ohne MwSt',
  sendet: 'USt-IdNr. wird geprüft …',
  weiter: 'Geprüft. Sie werden zur Zahlung weitergeleitet …',
  normal: 'Normal zur Kasse',
  // Kein Versprechen über die normale Kasse: dort bleibt der Betrag brutto
  // (b2b-ust README, „Nativ geht es nicht“), nur der Ausweis ändert sich.
  fehler: 'Das hat gerade nicht geklappt. Sie können normal zur Kasse gehen und dort bestellen.',
};

/**
 * Kann der Server diesen Warenkorb ohne Verlust abbilden? Er übernimmt je
 * Zeile nur Variante und Menge. Was darüber hinaus am Warenkorb hängt, ginge
 * im Entwurf verloren: ein Rabatt (der Kunde zahlte mehr als angezeigt), auch
 * ein automatischer auf den ganzen Warenkorb (erkennbar an total < subtotal,
 * das Fragment fragt keine Warenkorb-Rabatte ab), ein Zeilen-Merkmal
 * (Wunschnummer, Kette, Reservierung, Paket, Geschenk), ein Geschenk-Vermerk
 * oder eine Notiz am Warenkorb, ein Abo-/Ratenplan, eine Geschenkkarte. Dann
 * gibt es den Knopf nicht, und die normale Kasse bleibt.
 * Rein: wirft nie, alles Unbekannte heißt nein.
 *
 * @param {any} cart
 * @returns {boolean}
 */
export function nettoWegMoeglich(cart) {
  try {
    const zeilen = cart?.lines?.nodes;
    if (!Array.isArray(zeilen) || zeilen.length === 0) return false;
    const waehrung = cart?.cost?.subtotalAmount?.currencyCode;
    if (waehrung && waehrung !== 'EUR') return false;
    if ((cart?.discountCodes || []).some((c) => c?.applicable)) return false;
    if ((cart?.appliedGiftCards || []).length) return false;
    const zwischen = parseFloat(cart?.cost?.subtotalAmount?.amount);
    const gesamt = parseFloat(cart?.cost?.totalAmount?.amount);
    if (Number.isFinite(zwischen) && Number.isFinite(gesamt) && gesamt < zwischen - 0.005) {
      return false;
    }
    if (String(cart?.note || '').trim()) return false;
    if (geschenkVermerkt(cart?.attributes)) return false;
    for (const z of zeilen) {
      if (!/^gid:\/\/shopify\/ProductVariant\/\d+$/.test(z?.merchandise?.id || '')) {
        return false;
      }
      if (!(Number(z?.quantity) >= 1)) return false;
      if ((z?.attributes || []).length) return false;
      if (z?.sellingPlanAllocation) return false;
      const rabatt = (z?.discountAllocations || []).some(
        (d) => parseFloat(d?.discountedAmount?.amount || '0') > 0,
      );
      if (rabatt) return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Nur auf die Bezahlseite eines Shopify-Entwurfs weiterleiten, nie anderswohin:
 * eine kaputte oder fremde Antwort darf den Kunden nicht wegschicken.
 *
 * @param {unknown} url
 * @returns {boolean}
 */
export function zielErlaubt(url) {
  try {
    const u = new URL(String(url || ''));
    if (u.protocol !== 'https:') return false;
    const h = u.hostname.toLowerCase();
    return (
      h === 'checkout.qiblanco.com' ||
      h === 'qiblanco.com' ||
      h === 'www.qiblanco.com' ||
      h === 'shop.qiblanco.com' ||
      h === 'qi-blanco.myshopify.com'
    );
  } catch {
    return false;
  }
}
