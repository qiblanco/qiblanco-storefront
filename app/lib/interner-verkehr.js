/**
 * interner-verkehr — erkennt UNSEREN EIGENEN Zugriff auf der Storefront-Seite.
 *
 * Job 20260913-GROSSJOB-eigener-messverkehr-zaehlt-als-kundschaft..., Segment
 * s02. Christian: "Das muss repariert werden, weil sonst auch die
 * Ads-Steuerung falsch laeuft."
 *
 * WAS DAS IST: der Diskriminator fuer die ZWEITE Achse des Cart-Herkunfts-
 * Markers. `classifyUserAgent` kannte bis hierher webview_meta,
 * webview_andere, webview_vermutet, browser und unbekannt — und jeder
 * Zugriff unserer eigenen Wachen fiel damit in `browser`, also in dieselbe
 * Schublade wie ein Kunde. Der Warenkorb, den `kaufweg-nachlauf` 72x am Tag
 * anlegt, war von einem echten nicht zu unterscheiden.
 *
 * WARUM KEIN NEUER SCHLUESSEL: ein neuer Identitaets-Key muesste in
 * `TRACKING_COOKIE_NAMES` (app/lib/checkout-tracking.js) nachgetragen werden,
 * sonst faellt er an der Checkout-Domaingrenze weg — das ist der `_qpx_anon`-
 * Bug, der 90,6 % der Attribution faelschlich auf `direct` schrieb. Ein neuer
 * WERT in einem BESTEHENDEN Schluessel (`ua_class`) umgeht diese Fehlerklasse
 * baulich: der Schluessel reist schon heute ueber jede Grenze.
 *
 * DIES IST EIN SPIEGEL, KEINE ZWEITE QUELLE — und das ist der gefaehrliche
 * Teil. Die SSoT ist
 *   /srv/openclaw/shared-state/tracking-linkage/config/internal-traffic.conf
 * Die Storefront laeuft auf Oxygen und kann sie zur Laufzeit nicht lesen (kein
 * Dateisystem, kein Unterprozess); anders als das Node-Gegenstueck
 * `tracking-linkage/src/internal_client.mjs`, das `internal-traffic-check
 * export` aufruft. Die Werte stehen deshalb HIER — und damit sie nicht still
 * driften, vergleicht
 *   tracking-linkage/pruefungen/probe_eigenverkehr_zwei_achsen.py (ARM C)
 * sie TAEGLICH gegen die SSoT und gegen das Python-Verdikt je Korpus-Eintrag.
 * Zwei Kopien derselben Liste driften garantiert; die, die driftet, ist die,
 * die niemand prueft.
 *
 * UEBERSPERRUNG IST DER TEURERE FEHLER. Ein Kunde, der faelschlich `intern`
 * traegt, verschwindet aus genau den Zahlen, die dieser Bau sauber machen
 * soll — und niemand sieht es, weil die Zahl dann einfach kleiner ist. Jede
 * Unsicherheit faellt deshalb auf EXTERN: ein unparsbares Netz, eine
 * unparsbare IP, ein leerer UA ergeben `false`, nie `true`. Dieselbe Richtung
 * wie `internal_traffic.ist_intern` in der SSoT ("Ein FEHLENDER/unparsbarer
 * Wert ist NIE 'intern'").
 */

/**
 * Spiegel von INTERN_UA_MARKER (Substring, case-insensitiv).
 * @type {ReadonlyArray<string>}
 */
export const INTERN_UA_MARKER = [
  'QiBlancoInternal',
  'qiblanco-monitoring-leitstand',
  'qiblanco-sicherheitsmeister',
];

/**
 * Spiegel von INTERN_NETZE (CIDR).
 * @type {ReadonlyArray<string>}
 */
export const INTERN_NETZE = [
  '65.108.150.121/32',
  '2a01:4f9:c014:781e::/64',
];

/**
 * Traegt der User-Agent einen Marker, den die SSoT als intern fuehrt?
 *
 * @param {string | null | undefined} userAgent
 * @returns {boolean}
 */
export function istInternerUserAgent(userAgent) {
  const u = (userAgent || '').trim().toLowerCase();
  if (!u) return false;
  return INTERN_UA_MARKER.some((m) => u.includes(m.toLowerCase()));
}

/**
 * IPv4-Adresse -> 32-Bit-Zahl, oder null wenn sie keine ist.
 *
 * @param {string} roh
 * @returns {number | null}
 */
function ipv4Zahl(roh) {
  const teile = roh.split('.');
  if (teile.length !== 4) return null;
  let wert = 0;
  for (const t of teile) {
    if (!/^\d{1,3}$/.test(t)) return null;
    const n = Number(t);
    if (n > 255) return null;
    wert = wert * 256 + n;
  }
  return wert;
}

/**
 * IPv6-Adresse -> Array aus 8 Hextets, oder null.
 *
 * Bewusst eine eigene, enge Implementierung statt einer Bibliothek: Oxygen
 * bringt keine mit, und der Fall ist klein genug, um ihn vollstaendig zu
 * pruefen. Der IPv4-in-IPv6-Sonderfall (`::ffff:1.2.3.4`) wird ABGELEHNT
 * statt geraten — eine geratene Adresse in Richtung `intern` waere genau die
 * Uebersperrung, die hier nicht passieren darf.
 *
 * @param {string} roh
 * @returns {number[] | null}
 */
function ipv6Hextets(roh) {
  const s = roh.trim().toLowerCase().replace(/^\[|\]$/g, '');
  if (!s.includes(':')) return null;
  if (s.includes('.')) return null;
  const doppelt = s.split('::');
  if (doppelt.length > 2) return null;

  /** @param {string} teil */
  const zerlege = (teil) => {
    if (!teil) return [];
    const gruppen = teil.split(':');
    const out = [];
    for (const g of gruppen) {
      if (!/^[0-9a-f]{1,4}$/.test(g)) return null;
      out.push(parseInt(g, 16));
    }
    return out;
  };

  if (doppelt.length === 1) {
    const alle = zerlege(s);
    return alle && alle.length === 8 ? alle : null;
  }
  const links = zerlege(doppelt[0]);
  const rechts = zerlege(doppelt[1]);
  if (links === null || rechts === null) return null;
  const fehlend = 8 - links.length - rechts.length;
  if (fehlend < 1) return null;
  return [...links, ...new Array(fehlend).fill(0), ...rechts];
}

/**
 * Liegt `ip` in einem der SSoT-Netze?
 *
 * @param {string | null | undefined} ip
 * @param {ReadonlyArray<string>} [netze]
 * @returns {boolean}
 */
export function istInterneIp(ip, netze = INTERN_NETZE) {
  const roh = (ip || '').trim();
  if (!roh) return false;

  const v4 = ipv4Zahl(roh);
  const v6 = v4 === null ? ipv6Hextets(roh) : null;
  if (v4 === null && v6 === null) return false;

  for (const eintrag of netze) {
    const [netzRoh, praefixRoh] = eintrag.split('/');
    const praefix = Number(praefixRoh);
    if (!netzRoh || !Number.isInteger(praefix) || praefix < 0) continue;

    if (v4 !== null) {
      const netz = ipv4Zahl(netzRoh);
      if (netz === null || praefix > 32) continue;
      // `>>> 0` haelt das Ergebnis vorzeichenlos; ein Shift um 32 ist in JS
      // ein Shift um 0 und wuerde /0 zu "alles trifft" machen — deshalb der
      // Sonderfall, nicht die Maske.
      if (praefix === 0) continue; // /0 waere Uebersperrung, nie gemeint
      const maske = praefix === 32 ? 0xffffffff : (~0 << (32 - praefix)) >>> 0;
      if (((v4 & maske) >>> 0) === ((netz & maske) >>> 0)) return true;
      continue;
    }

    const netz6 = ipv6Hextets(netzRoh);
    if (!netz6 || praefix > 128 || praefix === 0) continue;
    let rest = praefix;
    let treffer = true;
    for (let i = 0; i < 8 && rest > 0; i += 1) {
      const bits = Math.min(16, rest);
      const maske = bits === 16 ? 0xffff : (0xffff << (16 - bits)) & 0xffff;
      if ((v6[i] & maske) !== (netz6[i] & maske)) {
        treffer = false;
        break;
      }
      rest -= bits;
    }
    if (treffer) return true;
  }
  return false;
}

/**
 * Buyer-IP aus dem Request.
 *
 * ZWEITE FASSUNG, UND DAS IST BEWUSST SO: dieselbe Reihenfolge steht in
 * `app/routes/collect.jsx`. Sie dort zu importieren geht NICHT — die Route
 * wird von `test/collect-proxy-transport.test.mjs` als Data-URL-Modul geladen
 * ("reines JS ohne Imports"), ein Import wuerde diesen Test baulich brechen.
 * Statt die Doppelung still zu lassen, vergleicht ARM C der Probe
 * `probe_eigenverkehr_zwei_achsen.py` die beiden Reihenfolgen taeglich.
 *
 * `oxygen-buyer-ip` ist der EINZIGE auf Oxygen belegte Traeger; die beiden
 * anderen sind Rueckfaelle fuer lokales `h2 dev`. Begruendung im Volltext im
 * Kopf von collect.jsx.
 *
 * @param {Request} request
 * @returns {string}
 */
export function buyerIpAusRequest(request) {
  const kandidaten = [
    request.headers.get('oxygen-buyer-ip'),
    request.headers.get('CF-Connecting-IP'),
    request.headers.get('X-Forwarded-For')?.split(',')[0],
  ];
  for (const roh of kandidaten) {
    const ip = roh?.trim();
    if (ip) return ip;
  }
  return '';
}

/**
 * Das Urteil: ist dieser Zugriff unser eigener?
 *
 * ZWEI ACHSEN, UND SIE LESEN VERSCHIEDENE GROESSEN — genau das macht sie
 * unabhaengig: die IP ist deterministisch und nicht faelschbar, der UA-Marker
 * traegt die Faelle, in denen keine Client-IP vorliegt. Faellt eine Achse
 * aus, traegt die andere weiter.
 *
 * @param {{userAgent?: string | null, ip?: string | null}} optionen
 * @returns {boolean}
 */
export function istInternerZugriff({userAgent, ip} = {}) {
  return istInterneIp(ip) || istInternerUserAgent(userAgent);
}
