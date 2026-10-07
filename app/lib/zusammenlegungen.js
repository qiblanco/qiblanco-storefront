import {redirect} from 'react-router';

/**
 * ZUSAMMENGELEGTE SEITEN — welche alte Adresse per 301 in welcher Seite
 * aufgegangen ist.
 *
 * HERKUNFT: Entscheidung vom 07.10.2026 (Coworker A im Auftrag Christians):
 * „18 dünne Seiten per 301 in 8 bestehende zusammenlegen. Nichts löschen."
 * Gebaut von Job 20261007-seo-zusammenlegung-duenne-seiten-301-umsetzen. Die
 * Liste von → Ziel führt seo-manager/exports/seo-strategie.json
 * `zusammenlegungen[]`; welche Paare frei waren, entschied die Vorprüfung im
 * Wirkungskreislauf (seo-manager/exports/wirkungskreislauf.json
 * `zusammenlegung.paare[].erlaubt`). Hier stehen NUR die vollzogenen Paare.
 *
 * NICHT HIER, MIT GRUND:
 *  - /pages/lexikon-elektrosmog und /pages/kann-elektrosmog-den-schlaf-stoeren
 *    tragen eigene Impressionen mit Position ≤ 10 (Bedingung 1 der
 *    Entscheidung). Sie bleiben eigene Seiten.
 *  - /pages/wie-funktioniert-der-gitterchip-im-qione ist zurückgestellt: die
 *    Seite stand bis 01.10. auf noindex, ihre null Impressionen im
 *    Prüffenster sind eine Folge der Sperre und kein „nie gelesen".
 *
 * EIN TRÄGER FÜR ALLE LESER. Die Routen der Quellseiten werfen den 301 über
 * `leiteUm()`, `pages.$handle.jsx` (Shopify-Seite support-1) und
 * `products.$handle.jsx` (qione-1) fragen `zusammenlegungFuer()`, und jeder
 * Link-Baustein, der eine Adresse aus einem Datenmodul rendert (Lexikon,
 * Frageseiten, FAQ-Liste), geht über `adresse()`. So zeigt kein interner Link
 * auf eine Weiterleitung, auch wenn ein Datenmodul die alte Adresse noch als
 * Kennung trägt.
 *
 * DER ANKER zeigt auf den Abschnitt, in den der Inhalt übernommen wurde. Im
 * 301 steht er HINTER dem Query-String (`/ziel?fbclid=…#anker`): so bleiben
 * Klick-IDs und UTM über die Weiterleitung erhalten, und der Browser springt
 * an die richtige Stelle. Suchmaschinen werten den Anker nicht aus; für sie
 * zählt das Ziel.
 *
 * RÜCKWEG: einen Eintrag entfernen und die Quell-Route auf ihren Stand vor
 * dem Merge zurücksetzen (`hb-deploy revert --sha <merge>` macht beides).
 * Fällt eine Zielseite im Wirkungskreislauf ab, reiht er den Rückweg selbst
 * ein (Hypothese `rueckweg-301`).
 *
 * @type {Readonly<Record<string, {ziel: string, anker: string|null}>>}
 */
export const ZUSAMMENGELEGT = Object.freeze({
  '/pages/lexikon-energie': {ziel: '/pages/lexikon', anker: 'lexikon-energie'},
  '/pages/lexikon-frequenz': {
    ziel: '/pages/lexikon',
    anker: 'lexikon-frequenz',
  },
  '/pages/lexikon-high-vibe': {
    ziel: '/pages/lexikon',
    anker: 'lexikon-high-vibe',
  },
  '/pages/lexikon-hohe-frequenz-schwingen': {
    ziel: '/pages/lexikon',
    anker: 'lexikon-hohe-frequenz-schwingen',
  },
  '/pages/lexikon-low-vibe': {
    ziel: '/pages/lexikon',
    anker: 'lexikon-low-vibe',
  },
  '/pages/lexikon-ordnung': {ziel: '/pages/lexikon', anker: 'lexikon-ordnung'},
  '/pages/lexikon-spirituell-angebunden-sein': {
    ziel: '/pages/lexikon',
    anker: 'lexikon-spirituell-angebunden-sein',
  },
  '/pages/lexikon-kohaerentes-wasser': {
    ziel: '/pages/was-ist-kohaerentes-wasser',
    anker: 'lexikon-kohaerentes-wasser',
  },
  '/pages/was-senkt-elektrosmog-im-alltag': {
    ziel: '/pages/was-ist-elektrosmog',
    anker: 'was-senkt-elektrosmog-im-alltag',
  },
  '/pages/gibt-es-studien-zu-elektrosmog-schutz': {
    ziel: '/pages/studien',
    anker: 'gibt-es-studien-zu-elektrosmog-schutz',
  },
  '/pages/wie-funktioniert-schutz-vor-elektrosmog': {
    ziel: '/pages/technologie',
    anker: 'wie-funktioniert-schutz-vor-elektrosmog',
  },
  '/pages/wie-weit-reicht-elektrosmog-schutz': {
    ziel: '/pages/technologie',
    anker: 'wie-weit-reicht-elektrosmog-schutz',
  },
  '/pages/armband-duschen-sauna': {
    ziel: '/pages/faq',
    anker: 'armband-duschen-sauna',
  },
  '/pages/support-1': {ziel: '/pages/support', anker: null},
  '/products/qione-1': {ziel: '/products/qione-2-pro', anker: null},
});

/**
 * Der Eintrag zu einer alten Adresse — oder undefined.
 * @param {string} pfad
 */
export function zusammenlegungFuer(pfad) {
  return ZUSAMMENGELEGT[pfad];
}

/**
 * Wohin ein interner Link heute zeigen soll: auf das Ziel samt Anker, wenn
 * die Adresse zusammengelegt ist, sonst unverändert.
 * @param {string} pfad
 * @returns {string}
 */
export function adresse(pfad) {
  const z = ZUSAMMENGELEGT[pfad];
  if (!z) return pfad;
  return z.anker ? `${z.ziel}#${z.anker}` : z.ziel;
}

/**
 * Wirft den 301 für eine zusammengelegte Adresse. Der Query-String der
 * Anfrage bleibt erhalten (fbclid, gclid, UTM gehen über die Grenze mit).
 * Ruft eine Route das für eine Adresse ohne Eintrag auf, ist das ein
 * Baufehler und wird laut, statt still 200 zu liefern.
 * @param {Request} request
 * @param {string} pfad
 */
export function leiteUm(request, pfad) {
  const z = ZUSAMMENGELEGT[pfad];
  if (!z) {
    throw new Error(
      `Keine Zusammenlegung für ${pfad} in app/lib/zusammenlegungen.js`,
    );
  }
  const url = new URL(request.url);
  throw redirect(`${z.ziel}${url.search}${z.anker ? `#${z.anker}` : ''}`, 301);
}
