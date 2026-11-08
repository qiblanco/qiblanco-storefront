import {
  getAttributionCartAttributes,
  getOriginCartAttributes,
  hasAttributionConsent,
} from '~/lib/cart-attribution.server';
import {holeJson} from '~/lib/inapp-bruecke';
import {buyerIpAusRequest, istInternerZugriff} from '~/lib/interner-verkehr';
import {LAND_CODES, TEXT, nettoWegMoeglich, zielErlaubt} from '~/lib/b2b-netto';

/**
 * Serverseite des Netto-Wegs (Route app/routes/b2b-netto.jsx). Regeln und Sätze
 * in ~/lib/b2b-netto.js, Vertrag der Tür in b2b-ust/README.md („Netto-Weg“).
 */
export const ENDPUNKT = 'https://b2b.dienst.qiblanco.com';

/** Wie lange ein /healthz-Ergebnis gilt (Auftrag: kurzer Cache ≤ 60 s). */
export const STAND_GILT_MS = 60_000;
/** /healthz ist ein Dateilesen auf dem Server; länger warten heißt: kein Knopf. */
export const STAND_ZEIT_MS = 1500;
/**
 * Die Tür prüft VIES mit 3 s Zeitlimit und legt danach den Entwurf an (Ziel
 * ≤ 3 s gesamt). Die harte Grenze hier liegt darüber: wer einen fertigen
 * Entwurf abschneidet, schickt den Kunden zur Kasse, obwohl die Bezahlseite
 * schon bereitlag.
 */
export const ANFRAGE_ZEIT_MS = 9000;

/**
 * @param {{env?: Record<string, string | undefined>} | undefined} context
 */
export function basis(context) {
  const env = context?.env?.B2B_NETTO_API;
  return (typeof env === 'string' && env.trim()) || ENDPUNKT;
}

// Je Laufzeit-Instanz ein Merkposten: höchstens ein /healthz-Abruf je 60 s.
const merk = {wert: '', bis: 0, anfrage: null};

/**
 * Stand des Schalters NETTO am Server: 'an' | 'trocken' | 'aus' | '' (keine
 * Antwort). Wirft nie. Ein Fehlschlag gilt nur 10 s, damit ein kurzer Aussetzer
 * den Knopf nicht eine volle Minute verschwinden lässt.
 *
 * @param {any} context
 * @param {{jetzt?: number, hole?: typeof holeJson}} [opt] Prüfnaht für Tests
 * @returns {Promise<string>}
 */
export async function nettoStand(context, opt = {}) {
  const jetzt = opt.jetzt ?? Date.now();
  if (merk.bis > jetzt) return merk.wert;
  if (merk.anfrage) return merk.anfrage;
  const hole = opt.hole || holeJson;
  merk.anfrage = (async () => {
    const r = await hole(
      `${basis(context)}/healthz`,
      {headers: {Accept: 'application/json'}},
      STAND_ZEIT_MS,
    );
    const wert =
      r?.status === 200 && r.body?.ok === true && typeof r.body?.netto === 'string'
        ? r.body.netto
        : '';
    merk.wert = wert;
    merk.bis = jetzt + (wert ? STAND_GILT_MS : 10_000);
    return wert;
  })();
  try {
    return await merk.anfrage;
  } finally {
    merk.anfrage = null;
  }
}

/** Nur für Tests: Merkposten leeren. */
export function vergiss() {
  merk.wert = '';
  merk.bis = 0;
  merk.anfrage = null;
}

/**
 * Sichtbar für Kunden nur bei NETTO=an. Interne Zugriffe (Haus-Marker im
 * User-Agent, Server-IP) sehen ihn auch bei 'trocken': so messen die stummen
 * Proben Knopf und Formular, bevor der Weg scharf ist. Die Tür antwortet ihnen
 * dann mit dem Satz „gerade nicht verfügbar“ und die normale Kasse bleibt.
 *
 * @param {string} stand
 * @param {boolean} intern
 */
export function knopfSichtbar(stand, intern) {
  if (stand === 'an') return true;
  return Boolean(intern) && stand === 'trocken';
}

/** @param {Request} request */
export function istIntern(request) {
  return istInternerZugriff({
    userAgent: request.headers.get('User-Agent'),
    ip: buyerIpAusRequest(request),
  });
}

/**
 * Formular -> Anfrage an die Tür. Prüft nur, was ohne Netz geht und der Server
 * ohnehin noch einmal prüft; liefert {fehler} mit einem Satz oder {anfrage}.
 *
 * @param {FormData} form
 * @param {any} cart
 * @param {Record<string, string>} merkmale
 */
export function anfrageAusFormular(form, cart, merkmale) {
  const feld = (name, max) => String(form.get(name) || '').trim().slice(0, max);
  if (feld('website', 200)) return {fehler: TEXT.fehler};
  if (!nettoWegMoeglich(cart)) return {fehler: TEXT.fehler};
  const land = feld('land', 2).toUpperCase();
  if (!LAND_CODES.has(land)) {
    return {
      fehler:
        'Ohne Mehrwertsteuer mit USt-IdNr. geht es nur bei Lieferung in ein anderes EU-Land.',
    };
  }
  const anfrage = {
    zeilen: cart.lines.nodes.map((z) => ({
      variante: z.merchandise.id,
      menge: Number(z.quantity),
    })),
    uid: feld('uid', 20),
    email: feld('email', 254),
    firma: feld('firma', 120),
    adresse: {
      vorname: feld('vorname', 60),
      nachname: feld('nachname', 60),
      // Schlüssel des Tür-Vertrags (b2b-ust netto.py), im Formular heißt das Feld anschrift.
      "strasse": feld('anschrift', 120),
      zusatz: '',
      plz: feld('plz', 20),
      ort: feld('ort', 60),
      land,
      telefon: '',
    },
    merkmale,
  };
  return {anfrage};
}

/**
 * Tracking-Schlüssel für die Bestellung (Cross-Boundary), dieselben wie am
 * Kassenknopf (cart.attribution.jsx): was schon am Warenkorb steht, die
 * einwilligungsfreien Herkunfts-Marker immer und, nur mit Einwilligung, was
 * dieser Request an Cookies und Klick-IDs trägt. Der
 * Server lässt davon nur seine Allowlist durch (netto.MERKMAL_ERLAUBT) und
 * schreibt sie als customAttributes an den Entwurf, aus dem Shopify beim
 * Bezahlen die note_attributes der Bestellung macht.
 *
 * @param {Request} request
 * @param {any} env
 * @param {any} cart
 * @param {unknown} [clientMarker] Ankunfts-Wort aus dem Formular ('yes'|'no'), wie am Kassenknopf
 * @returns {Record<string, string>}
 */
export function merkmaleFuer(request, env, cart, clientMarker = null) {
  const aus = {};
  for (const a of cart?.attributes || []) {
    if (a?.key && a?.value) aus[a.key] = String(a.value);
  }
  for (const a of getOriginCartAttributes(request, {
    clientMarker: typeof clientMarker === 'string' ? clientMarker : null,
    bestehendeAttribute: cart?.attributes ?? null,
  })) {
    if (a?.key && a?.value) aus[a.key] = String(a.value);
  }
  if (hasAttributionConsent(request, env)) {
    for (const a of getAttributionCartAttributes(request)) {
      if (a?.key && a?.value) aus[a.key] = String(a.value);
    }
  }
  return aus;
}

/**
 * Antwort der Tür -> Antwort an den Browser. Nur ok, wenn die Tür ok UND eine
 * erlaubte Bezahlseite liefert; sonst ihr Satz (oder unserer).
 *
 * @param {{status: number, body: any}} r
 * @returns {{ok: true, url: string} | {ok: false, text: string}}
 */
export function antwortAus(r) {
  const b = r?.body;
  if (r?.status === 200 && b?.ok === true && zielErlaubt(b.url)) {
    return {ok: true, url: String(b.url)};
  }
  const text = typeof b?.text === 'string' && b.text.trim() ? b.text.trim() : TEXT.fehler;
  return {ok: false, text: text.slice(0, 400)};
}

/**
 * @param {any} context
 * @param {object} anfrage
 * @param {{hole?: typeof holeJson}} [opt]
 */
export async function frageTuer(context, anfrage, opt = {}) {
  const hole = opt.hole || holeJson;
  const r = await hole(
    `${basis(context)}/api/netto`,
    {
      method: 'POST',
      headers: {'Content-Type': 'application/json', Accept: 'application/json'},
      body: JSON.stringify(anfrage),
    },
    ANFRAGE_ZEIT_MS,
  );
  return antwortAus(r);
}
