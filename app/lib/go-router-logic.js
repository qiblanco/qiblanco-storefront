/**
 * Reine Entscheidungslogik des LP-Routers /go (Konzept landingpage-4lp-abcd-konzept,
 * Kap. 4.2/4.6). KEIN Request/Fetch/Remix-Import hier — nur Funktionen auf einfachen
 * Werten, damit sie ohne Build-Toolchain per `node --test` prüfbar sind (Repo hat
 * keinen JS-Testrunner konfiguriert; `node:test` ist Bestand ab Node 18, keine neue
 * Abhängigkeit). Die Remix/Oxygen-Verdrahtung liegt in go-router.server.js.
 */

export const LP_PFAD = {
  A: '/pages/schlaf-zellen-schutz',
  B: '/pages/zell-schutz',
  C: '/pages/tiefer-schlaf',
  D: '/pages/E-Smog-Schutz',
};

export const PFAD_ZU_KUERZEL = Object.fromEntries(
  Object.entries(LP_PFAD).map(([kuerzel, pfad]) => [pfad, kuerzel]),
);

// Einkompilierter Default (Kap. 4.4/4.6 #4) — letzte Reserve, wenn die Zuteilungstabelle
// nicht ladbar/unguelig ist. modus:'aus' => Kaskade faellt sofort auf 'default' zurueck.
export const DEFAULT_ZUTEILUNG = Object.freeze({
  version: 'kompiliert-default',
  modus: 'aus',
  default: LP_PFAD.A,
  herkunft: {},
  bandit: {A: 0.25, B: 0.25, C: 0.25, D: 0.25},
  rotation_reihenfolge: ['A', 'C', 'B', 'D'],
});

const KASKADEN_TIEFE = {aus: 0, herkunft: 1, 'herkunft+profil': 2, voll: 3};

/**
 * Validiert/normalisiert eine geladene Zuteilungstabelle. Liefert null bei
 * strukturell kaputten Daten (Aufrufer faellt dann auf DEFAULT_ZUTEILUNG zurueck —
 * Fail-soft, Konzept Kap. 8 #3).
 */
export function validiereZuteilung(daten) {
  if (!daten || typeof daten !== 'object') return null;
  if (typeof daten.modus !== 'string' || !(daten.modus in KASKADEN_TIEFE)) return null;
  if (typeof daten.default !== 'string' || !daten.default.startsWith('/')) return null;
  return {
    version: typeof daten.version === 'string' ? daten.version : 'unbekannt',
    modus: daten.modus,
    default: daten.default,
    herkunft:
      daten.herkunft && typeof daten.herkunft === 'object' && !Array.isArray(daten.herkunft)
        ? daten.herkunft
        : {},
    bandit:
      daten.bandit && typeof daten.bandit === 'object' && !Array.isArray(daten.bandit)
        ? daten.bandit
        : {},
    rotation_reihenfolge: Array.isArray(daten.rotation_reihenfolge)
      ? daten.rotation_reihenfolge.filter((k) => k in LP_PFAD)
      : DEFAULT_ZUTEILUNG.rotation_reihenfolge,
  };
}

/**
 * Kaskaden-Schritt 1 (Herkunft, Kap. 4.3): utm_content (Ad) ist spezifischer als
 * utm_term (AdSet) -> Ad-Treffer zuerst. Herkunft-Map-Keys sind 'ad:<id>'/'adset:<id>'
 * (Konzept 4.4-Beispiel), Werte sind bereits fertige LP-Pfade.
 */
export function herkunftTreffer(searchParams, herkunft) {
  if (!herkunft) return null;
  const utmContent = searchParams.get('utm_content');
  const utmTerm = searchParams.get('utm_term');
  if (utmContent && herkunft[`ad:${utmContent}`]) return herkunft[`ad:${utmContent}`];
  if (utmTerm && herkunft[`adset:${utmTerm}`]) return herkunft[`adset:${utmTerm}`];
  return null;
}

/** Gewichteter Zufallszug ueber die Bandit-Gewichte (Thompson-Gewichte, Kap 4.4/6.3). */
export function bandItZiehen(bandit, zufall = Math.random) {
  const eintraege = Object.entries(bandit || {}).filter(
    ([kuerzel, gewicht]) => kuerzel in LP_PFAD && typeof gewicht === 'number' && gewicht > 0,
  );
  if (!eintraege.length) return 'A';
  const summe = eintraege.reduce((s, [, w]) => s + w, 0);
  let ziel = zufall() * summe;
  for (const [kuerzel, gewicht] of eintraege) {
    ziel -= gewicht;
    if (ziel <= 0) return kuerzel;
  }
  return eintraege[eintraege.length - 1][0];
}

/** Naechste im rotation_reihenfolge noch nicht gesehene Perspektive (Kap. 4.5). */
export function naechsteUngeseheneKuerzel(reihenfolge, gesehen) {
  const seen = new Set(gesehen || []);
  const liste =
    Array.isArray(reihenfolge) && reihenfolge.length
      ? reihenfolge
      : DEFAULT_ZUTEILUNG.rotation_reihenfolge;
  return liste.find((k) => !seen.has(k)) || null;
}

/**
 * Reine Prioritaets-Kaskade (Konzept Kap. 4.6, in dieser Reihenfolge):
 *   1. Herkunft eindeutig               -> [h]
 *   2. Consent-Cookie vorhanden + generisch -> naechste ungesehene Perspektive [p]
 *   3. modus=voll                       -> Bandit-Gewichte [b]
 *   4. sonst/Fehler                     -> default [f]
 * "gesehen" ist null, wenn KEIN qb_lp_hist-Cookie vorhanden war (unterscheidet sich
 * von einer leeren, aber vorhandenen Historie). Sind bei Schritt 2 bereits alle
 * Perspektiven gesehen, faellt die Kaskade bewusst zu Schritt 3/4 durch (kein
 * eigener Grund-Code dafuer noetig — Bandit bzw. Default IST "die beste bekannte LP").
 */
export function kaskadeEntscheiden(searchParams, zuteilung, gesehen, consentOk, zufall = Math.random) {
  const tiefe = KASKADEN_TIEFE[zuteilung?.modus] ?? 0;

  if (tiefe >= 1) {
    const treffer = herkunftTreffer(searchParams, zuteilung.herkunft);
    if (treffer) {
      return {pfad: treffer, grund: 'h', kuerzelGezeigt: PFAD_ZU_KUERZEL[treffer] || null};
    }
  }

  if (tiefe >= 2 && consentOk && gesehen !== null) {
    const naechste = naechsteUngeseheneKuerzel(zuteilung.rotation_reihenfolge, gesehen);
    if (naechste) {
      return {pfad: LP_PFAD[naechste], grund: 'p', kuerzelGezeigt: naechste};
    }
  }

  if (tiefe >= 3) {
    const kuerzel = bandItZiehen(zuteilung.bandit, zufall);
    return {pfad: LP_PFAD[kuerzel] || zuteilung.default, grund: 'b', kuerzelGezeigt: kuerzel};
  }

  return {pfad: zuteilung?.default || DEFAULT_ZUTEILUNG.default, grund: 'f', kuerzelGezeigt: null};
}

const HIST_COOKIE_NAME = 'qb_lp_hist';
const HIST_COOKIE_MAXAGE_S = 60 * 60 * 24 * 90; // 90 Tage (Kap. 4.5)

/** null = Cookie fehlt komplett (unterscheidet sich von einer leeren Historie). */
export function parseHistCookie(cookieHeader) {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${HIST_COOKIE_NAME}=([^;]*)`));
  if (!match) return null;
  let roh = '';
  try {
    roh = decodeURIComponent(match[1] || '');
  } catch {
    return [];
  }
  return roh
    .split(':')
    .map((s) => s.trim().toUpperCase())
    .filter((s) => s in LP_PFAD);
}

/** Inhalt NUR LP-Kuerzel (z.B. "A:C") — keine IDs, keine PII (Kap. 4.5). */
export function serialisiereHistCookie(kuerzelListe) {
  const wert = encodeURIComponent((kuerzelListe || []).join(':'));
  return `${HIST_COOKIE_NAME}=${wert}; Path=/; Max-Age=${HIST_COOKIE_MAXAGE_S}; HttpOnly; SameSite=Lax`;
}

/**
 * Consent-Signal fuer Schritt 2 (Kap. 4.5): dieselbe Quelle, die MetaPixel.jsx
 * clientseitig fuer window.Cookiebot.consent.marketing prueft (Cookiebot-Standard-
 * cookie 'CookieConsent', serverseitig ueber den Request-Cookie-Header lesbar).
 * KEIN neuer Consent-Mechanismus — Wiederverwendung des etablierten Bestands.
 */
export function hatMarketingConsent(cookieHeader) {
  if (!cookieHeader) return false;
  const match = cookieHeader.match(/(?:^|;\s*)CookieConsent=([^;]*)/);
  if (!match) return false;
  let roh = '';
  try {
    roh = decodeURIComponent(match[1] || '');
  } catch {
    return false;
  }
  return /marketing[=:]\s*true/i.test(roh);
}

/**
 * Ziel-URL PFLICHT-Invariante (Kap. 4.2/8 #1): Ziel + '?' + KOMPLETTER Original-Query
 * (roh, aus url.search — NICHT ueber URLSearchParams neu serialisiert, damit fbclid
 * byte-identisch bleibt) + '&lp_m=<grund>'.
 */
export function zielUrl(pfad, originalSearch, grund) {
  const suffix = originalSearch ? `${originalSearch}&lp_m=${grund}` : `?lp_m=${grund}`;
  return `${pfad}${suffix}`;
}
