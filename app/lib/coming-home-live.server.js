/**
 * coming-home-live.server — Daten und Anmelde-Naht der Seite /pages/live
 * (Grossjob 20261018-GROSSJOB-coming-home-zoom-aufnahme-transkript-
 * zusammenfassung-homepage-reiter-live, Segment s04; Christian 18.10.2026).
 *
 * NUR SERVER (Endung .server.js): Loader und Action von
 * app/routes/pages.live.jsx rufen diese Datei, der Browser bekommt nur das
 * fertige Ergebnis. Der Zoom-Link bleibt so aus HTML und Bundle, bis die
 * Action ihn herausgibt.
 *
 * INHALT KOMMT AUS DEM SHOPIFY-BLOG `coming-home` (Nahtvertrag N3 im
 * KONZEPT.md des Grossjobs, s03 schreibt): ein Artikel je Termin, Handle
 * coming-home-YYYY-MM-DD, Tags ch-termin, ch-datum-YYYY-MM-DD, ch-zeit-HHMM
 * (Ortszeit Europe/Berlin; ch-zeit-offen oder kein Zeit-Tag = "Uhrzeit
 * folgt", nie eine erfundene Uhrzeit) und genau einer von ch-vorschau (vor dem Call:
 * Thema) oder ch-rueckblick (nach dem Call: Geschichte). Sortiert wird nach
 * dem Datum im Tag, nicht nach publishedAt. Kein Laufzeit-Abruf des
 * AI-Servers für Inhalte (Lehre Produktberatung "Termine laden nicht").
 *
 * ANMELDUNG über DEN EIGENEN DIENST (Nahtvertrag N4, s05 liefert):
 * POST {basis}/api/anmeldung | /api/bestaetigen | /api/abmelden, JSON, Frist
 * 4 s, Kopf X-CH-Kunde-IP (Mengen-Deckel je Mensch statt je Oxygen-Knoten)
 * und X-CH-Probe unveraendert durchgereicht (Testmodus der Probe, die Mail
 * geht dann in den Probe-Ausgang). POST wird NIE wiederholt: ein zweiter
 * Versuch nach verlorener Antwort könnte zwei Mails ausloesen.
 *
 * SPEZIAL BEIM GASTGEBER (Grossjob 20261025-webinar-heal-world-0111, s03,
 * Naht N1; Christian
 * 25.10.2026: „das bitte auf live so implemtnieren das die leute sich anmelden
 * können. bitte dazu schreiben das anmeldung notwendig ist“). Ein Vorschau-
 * Artikel mit Tag ch-anmeldung-extern ist ein Termin bei einem anderen
 * Gastgeber mit eigener Zoom-Anmeldung. Die Anmelde-URL ist der erste Link im
 * Artikeltext, der auf ANMELDE_URL_RX passt (nur Zoom-Registrierung). Kein
 * passender Link: die Karte zeigt keinen Knopf, weder einen toten noch den
 * Coming-Home-Knopf, der zum falschen Termin anmelden würde.
 *
 * TESTUMGEBUNG: Env COMING_HOME_API lenkt die Anmeldung auf einen
 * Wegwerf-Endpunkt um. Env COMING_HOME_FIXTUR=leer|vorschau|drei|spezial ersetzt den
 * Blog durch die Testdaten unten (Sicht-Tor und Design-Messung der Zustaende,
 * nie erfundene Artikel im echten Blog). Auf Oxygen ist keine der beiden
 * gesetzt.
 */

export const ENDPUNKT = 'https://live.65-108-150-121.sslip.io';
export const FRIST_MS = 4000;
export const BLOG_HANDLE = 'coming-home'; // Spiegel in pages.live.jsx (Client-Link)
export const ZEITZONE = 'Europe/Berlin';

/**
 * So lange nach dem Beginn gilt ein Termin mit Uhrzeit noch als "der nächste".
 * 90 Minuten: so plant Zoom den Sonntag (coming-home stand.json
 * naechster_termin.dauer_min, Grossjob 20261020 Coming Home neu, s02).
 */
export const DAUER_MIN = 90;
/** So viele Rueckblicke zeigt die Seite, neueste zuerst (ein halbes Jahr). */
export const RUECKBLICK_MAX = 26;

/** Der Token aus den Mail-Links reist im Cookie, nie in der Adresse. */
export const COOKIE_NAME = 'ch_live';
const COOKIE_MAX_S = 86400;
const TOKEN_RX = /^[A-Za-z0-9_-]{16,256}$/;

export function apiBasis(env) {
  const wert = env?.COMING_HOME_API;
  return (typeof wert === 'string' && wert.trim()) || ENDPUNKT;
}

export function tokenGueltig(token) {
  return TOKEN_RX.test(String(token || ''));
}

/** Token aus dem Cookie der Anfrage, sonst ''. */
export function tokenAusCookie(request) {
  const roh = request.headers.get('Cookie') || '';
  for (const teil of roh.split(';')) {
    const i = teil.indexOf('=');
    if (i > 0 && teil.slice(0, i).trim() === COOKIE_NAME) {
      try {
        const t = decodeURIComponent(teil.slice(i + 1).trim());
        return tokenGueltig(t) ? t : '';
      } catch {
        return '';
      }
    }
  }
  return '';
}

/** HttpOnly, host-only, Path=/pages (die .data-Abrufe liegen unter /pages/live.data). */
export function tokenCookie(token) {
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/pages; Max-Age=${COOKIE_MAX_S}; HttpOnly; Secure; SameSite=Lax`;
}

export function tokenCookieLoeschen() {
  return `${COOKIE_NAME}=; Path=/pages; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;
}

function signal(ms) {
  return typeof AbortSignal !== 'undefined' &&
    typeof AbortSignal.timeout === 'function'
    ? AbortSignal.timeout(ms)
    : undefined;
}

/**
 * Ein POST an den Anmeldedienst. Rückgabe {status, body}; Netzfehler und
 * Zeitueberschreitung geben status 0.
 */
export async function apiPost(
  basis,
  weg,
  daten,
  {kundeIp = '', probe = '', holer = fetch, ms = FRIST_MS} = {},
) {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (kundeIp) headers['X-CH-Kunde-IP'] = kundeIp;
  if (probe) headers['X-CH-Probe'] = probe;
  try {
    const res = await holer(`${basis}${weg}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(daten),
      signal: signal(ms),
    });
    const text = await res.text();
    let body = null;
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
    return {status: res.status, body};
  } catch {
    return {status: 0, body: null};
  }
}

/**
 * Antwort von /api/anmeldung -> Zustand der Seite.
 * doi_gesendet | schon_bestaetigt | gedrosselt | fehler (400) | direkt
 * (Dienst aus oder unverstaendlich: der Zoom-Link kommt direkt, niemand wird
 * ausgesperrt).
 */
export function anmeldeZustand(r) {
  if (r.status === 200) {
    const s = r.body?.status;
    if (s === 'doi_gesendet' || s === 'schon_bestaetigt' || s === 'gedrosselt') {
      return s;
    }
    return 'direkt';
  }
  if (r.status === 400 || r.status === 422) return 'fehler';
  return 'direkt';
}

/** Antwort von /api/bestaetigen -> Zustand. */
export function bestaetigeZustand(r) {
  if (r.status === 200 && r.body?.status === 'bestaetigt') return 'bestaetigt';
  if (r.status === 410 || r.status === 404) return 'ungueltig';
  return 'direkt';
}

/** Antwort von /api/abmelden -> Zustand. */
export function abmeldeZustand(r) {
  if (r.status === 200 && r.body?.status === 'abgemeldet') return 'abgemeldet';
  if (r.status === 410 || r.status === 404) return 'ungueltig';
  return 'fehler';
}

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Eingabe des Formulars prüfen; Rückgabe {ok, name, email, grund}.
 * `version` ist die Einwilligungs-Version, die das Formular zeigt (eine
 * Stelle: die Route, weil das Formular sie im Browser braucht).
 */
export function eingabePruefen(form, version) {
  const name = String(form.get('name') || '').trim().slice(0, 120);
  const email = String(form.get('email') || '').trim().slice(0, 254);
  const gesetzt = String(form.get('einwilligung_version') || '');
  if (!name) return {ok: false, name, email, grund: 'name'};
  if (!EMAIL_RX.test(email)) return {ok: false, name, email, grund: 'email'};
  if (!version || gesetzt !== version) {
    return {ok: false, name, email, grund: 'einwilligung'};
  }
  return {ok: true, name, email, grund: ''};
}

// ─── Zeit (Europe/Berlin, ohne Bibliothek) ──────────────────────────────────

function teileIn(zeitzone, d) {
  const teile = new Intl.DateTimeFormat('en-GB', {
    timeZone: zeitzone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(d);
  const w = {};
  for (const t of teile) w[t.type] = t.value;
  return w;
}

/** Kalendertag in Berlin als YYYY-MM-DD. */
export function berlinTag(d) {
  const w = teileIn(ZEITZONE, d);
  return `${w.year}-${w.month}-${w.day}`;
}

/** Ortszeit Berlin (YYYY-MM-DD, HHMM) -> Date (UTC-Zeitpunkt), sonst null. */
export function berlinZuUtc(datum, hhmm) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(datum || ''));
  const z = /^(\d{2})(\d{2})$/.exec(String(hhmm || ''));
  if (!m || !z) return null;
  const [y, mo, da] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const [h, mi] = [Number(z[1]), Number(z[2])];
  if (h > 23 || mi > 59) return null;
  const soll = Date.UTC(y, mo - 1, da, h, mi);
  // Zweimal den Versatz der Zone an der Vermutung messen (Sommerzeit-Wechsel).
  let t = soll;
  for (let i = 0; i < 2; i += 1) {
    const w = teileIn(ZEITZONE, new Date(t));
    const gesehen = Date.UTC(
      Number(w.year),
      Number(w.month) - 1,
      Number(w.day),
      Number(w.hour),
      Number(w.minute),
    );
    t += soll - gesehen;
  }
  return new Date(t);
}

/**
 * Der nächste Sonntag als Kalendertag in Berlin, heute eingeschlossen. Ohne
 * Uhrzeit: die kennt erst der Termin ("Uhrzeit folgt"). `start` ist der
 * Mittag des Tages, nur für Datumsanzeige und Sortierung.
 */
export function naechsterSonntag(jetzt) {
  for (let i = 0; i < 8; i += 1) {
    const tag = berlinTag(new Date(jetzt.getTime() + i * 86400000));
    const start = berlinZuUtc(tag, '1200');
    if (!start) return null;
    const wochentag = new Intl.DateTimeFormat('en-GB', {
      timeZone: ZEITZONE,
      weekday: 'short',
    }).format(start);
    if (wochentag === 'Sun') return {datum: tag, zeit: null, start};
  }
  return null;
}

/** "Sonntag, 25. Oktober 2026" */
export function datumLang(start) {
  return new Intl.DateTimeFormat('de-DE', {
    timeZone: ZEITZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(start);
}

/** "25. Oktober 2026" */
export function datumKurz(start) {
  return new Intl.DateTimeFormat('de-DE', {
    timeZone: ZEITZONE,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(start);
}

/** "12:00 Uhr"; ohne Uhrzeit null (die Seite zeigt "Uhrzeit folgt"). */
export function uhrzeit(hhmm) {
  return hhmm ? `${hhmm.slice(0, 2)}:${hhmm.slice(2)} Uhr` : null;
}

/** Noch nicht vorbei: mit Uhrzeit bis Ende des Calls, ohne bis Ende des Tages. */
function nochOffen(t, jetzt) {
  if (t.zeit) return t.start.getTime() + DAUER_MIN * 60000 > jetzt.getTime();
  return t.datum >= berlinTag(jetzt);
}

/**
 * Überschriften im Artikeltext eine Ebene unter das Thema der Woche setzen:
 * auf der Seite ist „Worüber wir gesprochen haben“ das h2 und das Thema das
 * h3, also werden „## Die Inhalte“ und „## Zum Mitnehmen“ aus dem Blog zu h4.
 * So bleibt es bei einem H2-Stil auf der Seite.
 */
export function ueberschriftenTiefer(html) {
  return String(html || '').replace(/<(\/?)h[1-3](?=[\s>])/gi, '<$1h4');
}

// ─── Blog-Artikel -> Termine ────────────────────────────────────────────────

/** Allowlist der externen Anmeldung (Naht N1): nur Zoom-Registrierungen. */
export const ANMELDE_URL_RX =
  /^https:\/\/([a-z0-9-]+\.)?zoom\.us\/meeting\/register\/[A-Za-z0-9_-]+$/;

function entitaetenLoesen(text) {
  return String(text || '')
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

/**
 * Erster Link im Artikeltext, dessen Ziel auf ANMELDE_URL_RX passt:
 * {url, gastgeber}. `gastgeber` kommt aus dem Linktext („Zur Anmeldung beim
 * Heal World Summit“), sonst ''. Ohne passenden Link {url: null, gastgeber: ''}.
 */
export function anmeldungExtern(html) {
  const rx = /<a\b[^>]*?\bhref\s*=\s*(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi;
  for (const m of String(html || '').matchAll(rx)) {
    const url = entitaetenLoesen(m[2]).trim();
    if (!ANMELDE_URL_RX.test(url)) continue;
    const linktext = entitaetenLoesen(m[3].replace(/<[^>]+>/g, ' '))
      .replace(/\s+/g, ' ')
      .trim();
    const g = /\bbei(?:m| der| dem)?\s+(.+)$/.exec(linktext);
    return {url, gastgeber: g ? g[1].replace(/[.!]+$/, '').trim() : ''};
  }
  return {url: null, gastgeber: ''};
}

/** Schluss „Anmeldung notwendig.“ eines Teasers; die Karte zeigt ihn eigens. */
export function teaserOhnePflicht(teaser) {
  return String(teaser || '')
    .replace(/\s*Anmeldung (ist )?notwendig\.?\s*$/i, '')
    .trim();
}

/** Tags eines Artikels lesen; null, wenn er kein Coming-Home-Termin ist. */
export function terminAusArtikel(a) {
  const tags = Array.isArray(a?.tags) ? a.tags.map((t) => String(t).trim()) : [];
  if (!tags.includes('ch-termin')) return null;
  let datum = '';
  let zeit = '';
  for (const t of tags) {
    const d = /^ch-datum-(\d{4}-\d{2}-\d{2})$/.exec(t);
    if (d) datum = d[1];
    const z = /^ch-zeit-(\d{4})$/.exec(t);
    if (z) zeit = z[1];
  }
  const vorschau = tags.includes('ch-vorschau');
  const rueckblick = tags.includes('ch-rueckblick');
  if (!datum || vorschau === rueckblick) return null;
  // ch-zeit-offen (oder kein Zeit-Tag): Uhrzeit unbekannt, nie geraten.
  const hhmm = tags.includes('ch-zeit-offen') ? null : zeit || null;
  const start = berlinZuUtc(datum, hhmm || '1200');
  if (!start) return null;
  const html = String(a.contentHtml || '');
  // Nur eine Vorschau kann extern sein: ein Rückblick hat keine Anmeldung.
  const extern =
    vorschau && tags.includes('ch-anmeldung-extern')
      ? anmeldungExtern(html)
      : null;
  return {
    art: vorschau ? 'vorschau' : 'rueckblick',
    datum,
    zeit: hhmm,
    start,
    handle: String(a.handle || ''),
    titel: String(a.title || '').trim(),
    teaser: String(a.excerpt || '').trim(),
    html,
    extern,
  };
}

/** Nach ch-datum, bei gleichem Tag nach Uhrzeit (ohne Uhrzeit zuletzt). */
function frueherZuerst(a, b) {
  if (a.datum !== b.datum) return a.datum < b.datum ? -1 : 1;
  return (a.zeit || '9999') < (b.zeit || '9999') ? -1 : 1;
}

/**
 * Artikel -> {naechster, weitere, rueckblicke, rueckblickeGesamt}.
 * `naechster` ist die Vorschau mit dem kleinsten ch-datum, die noch nicht
 * vorbei ist; ohne sie der nächste Sonntag mit "Thema folgt" und "Uhrzeit
 * folgt". `rueckblicke` neueste zuerst, hoechstens RUECKBLICK_MAX.
 */
export function seitenDaten(artikel, jetzt) {
  const termine = (artikel || []).map(terminAusArtikel).filter(Boolean);
  const offen = termine
    .filter((t) => t.art === 'vorschau' && nochOffen(t, jetzt))
    .sort(frueherZuerst);
  const rueckblicke = termine
    .filter((t) => t.art === 'rueckblick')
    .sort((a, b) => frueherZuerst(b, a));

  const zeige = (t) => ({
    datum: t.datum,
    datumLang: datumLang(t.start),
    datumKurz: datumKurz(t.start),
    uhrzeit: uhrzeit(t.zeit),
    // Ohne Uhrzeit nur der Tag: kein erfundener Zeitpunkt im <time>.
    startUtc: t.zeit ? t.start.toISOString() : t.datum,
    titel: t.titel,
    teaser: t.extern ? teaserOhnePflicht(t.teaser) : t.teaser,
    handle: t.handle,
    extern: t.extern,
  });

  let naechster;
  if (offen.length) {
    naechster = {...zeige(offen[0]), quelle: 'blog', html: offen[0].html};
  } else {
    const s = naechsterSonntag(jetzt);
    naechster = s
      ? {
          datum: s.datum,
          datumLang: datumLang(s.start),
          datumKurz: datumKurz(s.start),
          uhrzeit: uhrzeit(s.zeit),
          startUtc: s.datum,
          titel: '',
          teaser: '',
          handle: '',
          html: '',
          extern: null,
          quelle: 'annahme',
        }
      : null;
  }
  return {
    naechster,
    weitere: offen.slice(1, 4).map(zeige),
    rueckblicke: rueckblicke
      .slice(0, RUECKBLICK_MAX)
      .map((t) => ({...zeige(t), html: t.html})),
    rueckblickeGesamt: rueckblicke.length,
  };
}

export const ARTIKEL_QUERY = `#graphql
  query ComingHomeLive($language: LanguageCode, $blogHandle: String!)
  @inContext(language: $language) {
    blog(handle: $blogHandle) {
      handle
      # 250 = Hoechstwert je Seite; sortiert wird danach nach ch-datum.
      articles(first: 250, sortKey: PUBLISHED_AT, reverse: true) {
        nodes {
          handle
          title
          excerpt
          contentHtml
          tags
          publishedAt
        }
      }
    }
  }
`;

/**
 * Artikel des Blogs holen. Rückgabe {artikel, ladeFehler}. Ein fehlender
 * Blog ist KEIN Fehler (leere Liste), eine gescheiterte Abfrage schon.
 */
export async function artikelLaden(context) {
  const fixtur = context?.env?.COMING_HOME_FIXTUR;
  if (typeof fixtur === 'string' && fixtur.trim()) {
    return {artikel: fixturArtikel(fixtur.trim(), new Date()), ladeFehler: false};
  }
  try {
    const {blog} = await context.storefront.query(ARTIKEL_QUERY, {
      variables: {blogHandle: BLOG_HANDLE},
      cache: context.storefront.CacheShort(),
    });
    return {artikel: blog?.articles?.nodes || [], ladeFehler: false};
  } catch {
    return {artikel: [], ladeFehler: true};
  }
}

// ─── Testdaten (nur mit COMING_HOME_FIXTUR, nie auf Oxygen) ─────────────────

function tagPlus(jetzt, tage) {
  return berlinTag(new Date(jetzt.getTime() + tage * 86400000));
}

function fixturRueckblick(datum, titel, teaser, absatz, inhalte) {
  const liste = inhalte
    .map(([stichwort, satz]) => `<li><strong>${stichwort}</strong> ${satz}</li>`)
    .join('');
  return {
    handle: `coming-home-${datum}`,
    title: titel,
    excerpt: teaser,
    contentHtml:
      `<p>${absatz}</p><h2>Die Inhalte</h2><ul>${liste}</ul>` +
      '<h2>Zum Mitnehmen</h2><p>Testgedanke für die Woche.</p>',
    tags: ['ch-termin', `ch-datum-${datum}`, 'ch-zeit-1200', 'ch-rueckblick'],
  };
}

/**
 * Fixtur `spezial`: der nächste Sonntag, an dem 11 Uhr noch offen ist, als
 * Termin beim Gastgeber (Tag ch-anmeldung-extern, Aufbau wie der Artikel aus
 * coming-home/src/text/vorschau.py), danach drei Coming-Home-Sonntage und zwei
 * Rückblicke. Die Anmelde-URL ist eine Attrappe mit gültiger Form.
 */
export const FIXTUR_ANMELDE_URL =
  'https://us06web.zoom.us/meeting/register/NurTestumgebung01';

function fixturSpezial(jetzt) {
  let s = naechsterSonntag(jetzt);
  if (!s) return [];
  let tag = s.datum;
  const offen = (d) =>
    berlinZuUtc(d, '1100').getTime() + DAUER_MIN * 60000 > jetzt.getTime();
  if (!offen(tag)) tag = tagPlus(new Date(`${tag}T12:00:00Z`), 7);
  const plus = (n) => tagPlus(new Date(`${tag}T12:00:00Z`), 7 * n);
  const vorschau = (datum, title) => ({
    handle: `coming-home-${datum}`,
    title,
    excerpt: 'Testtext für die Vorschau. Er steht nur in der Testumgebung.',
    contentHtml: '<p>Testtext für die Vorschau.</p>',
    tags: ['ch-termin', `ch-datum-${datum}`, 'ch-zeit-1200', 'ch-vorschau'],
  });
  const inhalte = [
    ['Teststichwort eins:', 'Testsatz zum ersten Inhalt. Er steht nur in der Testumgebung.'],
    ['Teststichwort zwei:', 'Testsatz zum zweiten Inhalt.'],
  ];
  return [
    {
      handle: `coming-home-${tag}`,
      title: 'Testspezial: Live beim Testgastgeber',
      excerpt:
        'Testteaser des Spezials: Christian spricht live beim Testgastgeber ' +
        'über ein Testthema, das etwas länger ist. Anmeldung notwendig.',
      contentHtml:
        '<p>Testtext des Spezials. </p> <p>Anmeldung notwendig: Testsatz. </p> ' +
        `<p><a href="${FIXTUR_ANMELDE_URL}">Zur Anmeldung beim Testgastgeber Summit. </a></p>`,
      tags: [
        'ch-termin',
        `ch-datum-${tag}`,
        'ch-zeit-1100',
        'ch-vorschau',
        'ch-anmeldung-extern',
      ],
    },
    vorschau(plus(1), 'Testspezial zwei: Präsentation'),
    vorschau(plus(2), 'Testthema lang – mit Umbruch auf dem Handy'),
    vorschau(plus(3), 'Testthema kurz'),
    fixturRueckblick(plus(-1), 'Testthema eins: Zuhören als erster Schritt',
      'Testteaser eins. Er steht nur in der Testumgebung.',
      'Testabsatz eins der Zusammenfassung.', inhalte),
    fixturRueckblick(plus(-2), 'Testthema zwei: Fragen, die man sonst nicht stellt',
      'Testteaser zwei. Er steht nur in der Testumgebung.',
      'Testabsatz zwei der Zusammenfassung.', inhalte),
  ];
}

export function fixturArtikel(art, jetzt) {
  if (art === 'leer') return [];
  if (art === 'spezial') return fixturSpezial(jetzt);
  const s = naechsterSonntag(jetzt);
  const naechster = s ? s.datum : tagPlus(jetzt, 7);
  const vorschau = {
    handle: `coming-home-${naechster}`,
    title: 'Testthema: Wie viel Ruhe braucht ein Abend?',
    excerpt: 'Testtext für die Vorschau. Er steht nur in der Testumgebung.',
    contentHtml: '<p>Testtext für die Vorschau.</p>',
    tags: ['ch-termin', `ch-datum-${naechster}`, 'ch-zeit-1200', 'ch-vorschau'],
  };
  // Vorschau-Zustand mit offener Uhrzeit (bis Zoom die Zeit liefert).
  if (art === 'vorschau') {
    return [{...vorschau, tags: ['ch-termin', `ch-datum-${naechster}`, 'ch-zeit-offen', 'ch-vorschau']}];
  }
  const vor = (n) => tagPlus(new Date(`${naechster}T12:00:00Z`), -7 * n);
  const inhalte = [
    ['Teststichwort eins:', 'Testsatz zum ersten Inhalt. Er steht nur in der Testumgebung.'],
    ['Teststichwort zwei:', 'Testsatz zum zweiten Inhalt, etwas länger, damit die Zeile umbricht.'],
    ['Teststichwort drei:', 'Testsatz zum dritten Inhalt.'],
  ];
  return [
    vorschau,
    fixturRueckblick(
      vor(1),
      'Testthema eins: Zuhören als erster Schritt',
      'Testteaser eins. Er steht nur in der Testumgebung.',
      'Testabsatz eins: worüber wir gesprochen haben, Ausgangsfrage und roter Faden.',
      inhalte,
    ),
    fixturRueckblick(
      vor(2),
      'Testthema zwei: Fragen, die man sonst nicht stellt',
      'Testteaser zwei. Er steht nur in der Testumgebung.',
      'Testabsatz zwei der Zusammenfassung.',
      inhalte,
    ),
    fixturRueckblick(
      vor(3),
      'Testthema drei: Ein Sonntag ohne Programm',
      'Testteaser drei. Er steht nur in der Testumgebung.',
      'Testabsatz drei der Zusammenfassung.',
      inhalte,
    ),
  ];
}
