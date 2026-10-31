/**
 * Texte des eigenen Einwilligungshinweises (BAUVERTRAG Abschnitt 4 und 5).
 *
 * Neue Sprache = neuer Eintrag in TEXTE, kein Code. Die Fassung steigt in der
 * Hauptnummer, wenn eine Kategorie oder ein Statistik-/Marketing-Anbieter dazu-
 * kommt (dann fragt der Hinweis alle Besucher neu).
 *
 * texteHash(sprache) = die ersten 8 Hex-Zeichen von SHA-256 über
 * JSON.stringify(TEXTE[sprache]) (UTF-8). Das Protokoll (s03) speichert ihn je
 * Wahl und archiviert jede Fassung unter diesem Schlüssel im Volltext.
 *
 * Die drei Knöpfe stehen wörtlich so, wie Christian sie am 22.09. vorgegeben
 * hat: Cookies einstellen · Notwendige Cookies akzeptieren · Alle akzeptieren.
 */
export const EINWILLIGUNG_FASSUNG = '1.0';

export const TEXTE = {
  de: {
    bereich: 'Cookie-Hinweis',
    kurz:
      'Du kannst sofort weiterlesen und einkaufen. Erlaubst du Statistik und Werbung, sehen wir, welche Inhalte dir helfen, und zeigen dir passendere Angebote.',
    einstellen: 'Cookies einstellen',
    notwendig: 'Notwendige Cookies akzeptieren',
    alle: 'Alle akzeptieren',
    dialogTitel: 'Cookie-Einstellungen',
    dialogText:
      'Wähle, was wir speichern dürfen. Deine Wahl kannst du jederzeit über „Cookie-Einstellungen“ ändern.',
    kategorien: {
      necessary: ['Notwendig', 'Warenkorb, Kasse, Sicherheit und deine Cookie-Wahl. Immer aktiv.'],
      preferences: ['Präferenzen', 'Merkt sich Einstellungen wie Sprache und Region.'],
      statistics: ['Statistik', 'Zeigt uns, welche Seiten und Inhalte genutzt werden (Google Analytics, Microsoft Clarity).'],
      marketing: ['Marketing', 'Misst, welche Werbung wirkt, und zeigt dir passendere Anzeigen (Meta, Google Ads, UpPromote).'],
    },
    speichern: 'Auswahl speichern',
    zu: 'Schließen',
    erklaerung: 'Cookie-Erklärung',
    datenschutz: 'Datenschutz',
    fussLink: 'Cookie-Einstellungen',
  },
  en: {
    bereich: 'Cookie notice',
    kurz:
      'You can keep reading and shopping right away. If you allow statistics and advertising, we see which content helps you and show you more relevant offers.',
    einstellen: 'Cookie settings',
    notwendig: 'Accept necessary cookies',
    alle: 'Accept all',
    dialogTitel: 'Cookie settings',
    dialogText:
      'Choose what we may store. You can change your choice at any time via “Cookie settings”.',
    kategorien: {
      necessary: ['Necessary', 'Cart, checkout, security and your cookie choice. Always on.'],
      preferences: ['Preferences', 'Remembers settings such as language and region.'],
      statistics: ['Statistics', 'Shows us which pages and content are used (Google Analytics, Microsoft Clarity).'],
      marketing: ['Marketing', 'Measures which ads work and shows you more relevant ads (Meta, Google Ads, UpPromote).'],
    },
    speichern: 'Save selection',
    zu: 'Close',
    erklaerung: 'Cookie declaration',
    datenschutz: 'Privacy policy',
    fussLink: 'Cookie settings',
  },
};

export function texteFuer(sprache) {
  return TEXTE[sprache] || TEXTE.de;
}

// SHA-256, synchron und ohne Abhängigkeit (SSR und Browser rechnen gleich).
function sha256Hex(text) {
  const bytes = new TextEncoder().encode(text);
  const K = [];
  const H = [];
  const frac = (x) => ((x - Math.floor(x)) * 0x100000000) >>> 0;
  for (let n = 2, i = 0; i < 64; n++) {
    let prim = true;
    for (let d = 2; d * d <= n; d++) if (n % d === 0) prim = false;
    if (!prim) continue;
    if (i < 8) H.push(frac(Math.sqrt(n)));
    K.push(frac(Math.cbrt(n)));
    i++;
  }
  const len = bytes.length;
  const total = ((len + 9 + 63) >> 6) << 6;
  const m = new Uint8Array(total);
  m.set(bytes);
  m[len] = 0x80;
  const bits = len * 8;
  const dv = new DataView(m.buffer);
  dv.setUint32(total - 8, Math.floor(bits / 0x100000000));
  dv.setUint32(total - 4, bits >>> 0);
  const w = new Uint32Array(64);
  const r = (x, n) => (x >>> n) | (x << (32 - n));
  for (let o = 0; o < total; o += 64) {
    for (let i = 0; i < 16; i++) w[i] = dv.getUint32(o + i * 4);
    for (let i = 16; i < 64; i++) {
      const s0 = r(w[i - 15], 7) ^ r(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = r(w[i - 2], 17) ^ r(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }
    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      const t1 = (h + (r(e, 6) ^ r(e, 11) ^ r(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + w[i]) >>> 0;
      const t2 = ((r(a, 2) ^ r(a, 13) ^ r(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) >>> 0;
      h = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
    }
    [a, b, c, d, e, f, g, h].forEach((v, i) => (H[i] = (H[i] + v) >>> 0));
  }
  return H.map((v) => v.toString(16).padStart(8, '0')).join('');
}

export function texteHash(sprache) {
  return sha256Hex(JSON.stringify(texteFuer(sprache))).slice(0, 8);
}

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'})[c]);

/**
 * Markup von Banner und Dialog (Selektoren = Vertrag für die Proben, s05).
 * `entschieden`: am Server gelesene gültige Wahl -> Banner startet verborgen.
 */
export function hinweisHtml(sprache, {entschieden = false} = {}) {
  const t = texteFuer(sprache);
  const kat = ['preferences', 'statistics', 'marketing']
    .map(
      (k) =>
        `<label class="qb-ew-kat"><span class="qb-ew-kat__kopf"><input type="checkbox" data-qb-kategorie="${k}">` +
        `<strong>${esc(t.kategorien[k][0])}</strong></span><span class="qb-ew-kat__text">${esc(t.kategorien[k][1])}</span></label>`,
    )
    .join('');
  return (
    `<div id="qb-einwilligung" data-qb-einwilligung="banner" role="region" aria-label="${esc(t.bereich)}"` +
    ` data-qb-fassung="${EINWILLIGUNG_FASSUNG}" data-qb-sprache="${sprache}" data-qb-texte-hash="${texteHash(sprache)}"` +
    `${entschieden ? ' hidden' : ''}>` +
    `<p class="qb-ew-text">${esc(t.kurz)} <a href="/pages/cookie-erklaerung">${esc(t.erklaerung)}</a></p>` +
    `<div class="qb-ew-knoepfe">` +
    `<button type="button" class="qb-ew-knopf qb-ew-knopf--leise" data-qb-wahl="einstellungen">${esc(t.einstellen)}</button>` +
    `<button type="button" class="qb-ew-knopf qb-ew-knopf--grau" data-qb-wahl="notwendig">${esc(t.notwendig)}</button>` +
    `<button type="button" class="qb-ew-knopf qb-ew-knopf--gold" data-qb-wahl="alle">${esc(t.alle)}</button>` +
    `</div></div>` +
    `<div id="qb-einwilligung-dialog" data-qb-einwilligung="dialog" role="dialog" aria-modal="false" aria-labelledby="qb-ew-titel" hidden>` +
    `<button type="button" class="qb-ew-zu" data-qb-wahl="zu" aria-label="${esc(t.zu)}">×</button>` +
    // Kein <h2>: der Hinweis steht als erstes body-Kind im Server-HTML JEDER Seite; ein h2 dort änderte die
    // Abschnittsüberschriften aller Gewinnerseiten (Gewinnerschutz-Tor, s06-r6). role=heading trägt die Semantik.
    `<div id="qb-ew-titel" class="qb-ew-titel" role="heading" aria-level="2">${esc(t.dialogTitel)}</div>` +
    `<p class="qb-ew-text">${esc(t.dialogText)}</p>` +
    `<label class="qb-ew-kat"><span class="qb-ew-kat__kopf"><input type="checkbox" checked disabled>` +
    `<strong>${esc(t.kategorien.necessary[0])}</strong></span><span class="qb-ew-kat__text">${esc(t.kategorien.necessary[1])}</span></label>` +
    kat +
    `<div class="qb-ew-knoepfe">` +
    `<button type="button" class="qb-ew-knopf qb-ew-knopf--grau" data-qb-wahl="auswahl">${esc(t.speichern)}</button>` +
    `<button type="button" class="qb-ew-knopf qb-ew-knopf--gold" data-qb-wahl="alle">${esc(t.alle)}</button>` +
    `</div><p class="qb-ew-links"><a href="/pages/cookie-erklaerung">${esc(t.erklaerung)}</a> · <a href="/pages/datenschutz">${esc(t.datenschutz)}</a></p></div>`
  );
}
