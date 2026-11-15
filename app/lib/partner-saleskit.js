/**
 * Sales-Kit Stufe 2 im Partnerbereich (/account/partner): Kundenfragen, Einwände,
 * Beispieltexte und der Zähler, der misst, ob Partner sie nutzen.
 * Job 20261007-sales-kit-stufe2-einbindung-partnerbereich.
 *
 * WOHER DIE TEXTE KOMMEN: aus genau einer Quelle auf dem Server,
 * partner-manager/exports/sales-kit.json. Der Datendienst des Partnerbereichs
 * liefert sie mit dem Bereich aus (gemeinsam.saleskit), nur mit den Feldern
 * seiner Weissliste. In diesem Repo steht kein einziger dieser Texte.
 *
 * WAS DIESE DATEI TUT: nur reine Funktionen ohne Hydrogen-Kontext. Deshalb
 * laufen sie unter `node --test` (partner-saleskit.test.mjs) und in der
 * Ressourcenroute account.partner.ereignis.jsx mit demselben Code.
 *
 * DER ZÄHLER: die Seite meldet jedes geöffnete Kapitel und jeden Kopier-Klick
 * an die eigene Ressourcenroute (gleicher Ursprung, Sitzungs-Cookie). Die reicht
 * das Kundentoken serverseitig an den Datendienst weiter. Der Dienst prüft das
 * Token selbst bei Shopify, zählt nur Partner und nur IDs, die es im aktuellen
 * Kit gibt. Diese Datei prüft vorab nur die Form, damit kein Freitext unterwegs ist.
 */

export const PARTNER_EREIGNIS_API =
  'https://partner.65-108-150-121.sslip.io/v1/ereignis';
export const EREIGNIS_ROUTE = '/account/partner/ereignis';
export const LINK_PLATZHALTER = '[dein Link]';

const ABSCHNITTE = ['fragen', 'einwaende', 'beispieltexte'];
const ARTEN = ['aufgeklappt', 'kopiert'];
const ID_MUSTER = /^(?:K[FE]-\d{1,3}|BT-[a-z0-9-]{1,60})$/;

/**
 * Prüft ein Ereignis auf seine Form. Gibt {abschnitt, art, id} zurück oder null.
 * Ob es die id im Kit gibt, entscheidet der Datendienst.
 * @param {{abschnitt?: unknown, art?: unknown, id?: unknown}} roh
 */
export function pruefeEreignis(roh) {
  if (!roh || typeof roh !== 'object') return null;
  const abschnitt = roh.abschnitt;
  const art = roh.art;
  const id = roh.id == null ? '' : roh.id;
  if (!ABSCHNITTE.includes(abschnitt) || !ARTEN.includes(art)) return null;
  if (typeof id !== 'string') return null;
  if (id && !ID_MUSTER.test(id)) return null;
  if (art === 'kopiert' && (abschnitt !== 'beispieltexte' || !id)) return null;
  return {abschnitt, art, id};
}

/**
 * Ereignis aus einem Formular-Rumpf (sendBeacon schickt URLSearchParams).
 * @param {FormData | URLSearchParams} formular
 */
export function ereignisAusFormular(formular) {
  return pruefeEreignis({
    abschnitt: formular.get('abschnitt'),
    art: formular.get('art'),
    id: formular.get('id') || '',
  });
}

/**
 * Reicht ein geprüftes Ereignis mit dem Kundentoken an den Datendienst.
 * Gibt den HTTP-Status des Dienstes zurück, 0 bei Netzfehler oder Zeitablauf.
 * @param {{token: string, ereignis: {abschnitt: string, art: string, id: string},
 *   url?: string, fetchImpl?: typeof fetch, zeitMs?: number}} p
 */
export async function ereignisWeiterleiten({
  token,
  ereignis,
  url = PARTNER_EREIGNIS_API,
  fetchImpl = fetch,
  zeitMs = 3000,
}) {
  try {
    const antwort = await fetchImpl(url, {
      method: 'POST',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
        'User-Agent': 'qiblanco-storefront/partnerbereich',
      },
      body: JSON.stringify(ereignis),
      signal: AbortSignal.timeout(zeitMs),
    });
    return antwort.status;
  } catch {
    return 0;
  }
}

/**
 * Der persönliche Link für einen Text über dieses Produkt: der Produktlink mit
 * der Kennung des Partners, sonst sein allgemeiner Link, sonst null.
 * @param {{link?: string | null, links?: Array<{name: string, link?: string | null}>}} konto
 * @param {string} produkt
 */
export function linkFuerProdukt(konto, produkt) {
  const treffer = (konto?.links || []).find(
    (l) => l.name === produkt && l.link,
  );
  return treffer?.link || konto?.link || null;
}

/**
 * Zerlegt einen Text an jedem Platzhalter [dein Link] in Teile, damit die Seite
 * den eingesetzten Link hervorheben kann. Ohne Link bleibt der Platzhalter stehen.
 * @param {string} text
 * @param {string | null} link
 * @returns {Array<{art: 'text' | 'link', wert: string}>}
 */
export function textTeile(text, link) {
  const teile = [];
  const segmente = String(text || '').split(LINK_PLATZHALTER);
  segmente.forEach((segment, i) => {
    if (i > 0)
      teile.push(
        link
          ? {art: 'link', wert: link}
          : {art: 'text', wert: LINK_PLATZHALTER},
      );
    if (segment) teile.push({art: 'text', wert: segment});
  });
  return teile;
}

/** Der Text, wie er in die Zwischenablage geht: mit dem Link des Partners. */
export function textMitLink(text, link) {
  return textTeile(text, link)
    .map((t) => t.wert)
    .join('');
}

/** Stehen nach dem Einsetzen noch Stellen in eckigen Klammern im Text ([Name] ...)? */
export function hatPlatzhalter(text) {
  return /\[[^\]\n]{1,40}\]/.test(String(text || ''));
}

/**
 * Gruppiert Einträge nach einem Feld, in der Reihenfolge ihres ersten Auftretens.
 * @template T
 * @param {T[]} eintraege
 * @param {(e: T) => string} schluessel
 * @returns {Array<{schluessel: string, eintraege: T[]}>}
 */
export function gruppiere(eintraege, schluessel) {
  const gruppen = [];
  const index = new Map();
  for (const e of eintraege || []) {
    const k = schluessel(e) || '';
    if (!index.has(k)) {
      index.set(k, gruppen.length);
      gruppen.push({schluessel: k, eintraege: []});
    }
    gruppen[index.get(k)].eintraege.push(e);
  }
  return gruppen;
}

/**
 * Meldet ein Ereignis aus dem Browser an die eigene Ressourcenroute. Wirft nie,
 * blockiert nichts: ein verlorenes Ereignis kostet eine Zählung, nie die Seite.
 */
export function meldeEreignis(ereignis) {
  if (typeof window === 'undefined') return;
  const e = pruefeEreignis(ereignis);
  if (!e) return;
  const rumpf = new URLSearchParams(e);
  try {
    if (navigator.sendBeacon && navigator.sendBeacon(EREIGNIS_ROUTE, rumpf))
      return;
  } catch {
    // sendBeacon fehlt oder ist blockiert: unten der normale Weg
  }
  fetch(EREIGNIS_ROUTE, {
    method: 'POST',
    body: rumpf,
    keepalive: true,
    credentials: 'same-origin',
  }).catch(() => {});
}
