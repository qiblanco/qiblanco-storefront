/**
 * Claims-SSoT-Konsument — GENERIERT, NICHT HAND-EDITIEREN.
 *
 * Quelle (Single Source of Truth): fakten-basis.yaml claims[]
 *   (/srv/openclaw/_design/gorgias-fact-gate/fakten-basis.yaml, stand 2026-07-16)
 * Generator: /srv/openclaw/_design/gorgias-fact-gate/claims_emit.py
 *   (Filter: kanal enthaelt 'homepage')
 *
 * Produkt-Werbeaussagen leben genau EINMAL im SSoT (Konzept Lernfeedback
 * Zell-Schutz Kap. 2, 2026-07-14). Text-Aenderungen NUR dort (Governance:
 * Vorschlag + Patch-Ledger + Christian), danach neu emittieren.
 */

export const CLAIMS = {
  'WM-design-elegant-luxurioes': {
    aussage: 'Elegantes, luxuriöses Design',
    status: 'legitimiert',
    produkt: ['qibracelet', 'qione'],
    kanal: ['homepage', 'lp', 'ads', 'sales'],
  },
  'WM-zellwasser-ganzer-koerper': {
    aussage: 'Kohärentes Zellwasser für den ganzen Körper',
    status: 'legitimiert',
    produkt: ['qibracelet', 'qione'],
    kanal: ['homepage', 'lp', 'ads', 'sales'],
  },
  'WM-qibracelet-gleiche-leistung': {
    aussage: 'Gleiche Leistung wie der QiOne® 2 Pro',
    status: 'legitimiert',
    produkt: ['qibracelet'],
    kanal: ['homepage', 'lp', 'ads', 'sales', 'support'],
  },
  'WM-qihome-atmosphaere-raum': {
    aussage: 'Kohärente Atmosphäre für den ganzen Raum',
    status: 'legitimiert',
    produkt: ['qihomeair'],
    kanal: ['homepage', 'lp', 'ads', 'sales'],
  },
  'WM-qihome-staerker': {
    aussage: 'Deutlich stärker als QiOne® und QiBracelet®',
    status: 'legitimiert',
    produkt: ['qihomeair'],
    kanal: ['homepage', 'lp', 'ads', 'sales'],
  },
  'WM-qihome-schlafzimmer-buero': {
    aussage: 'Ideal für Schlafzimmer und Büro',
    status: 'legitimiert',
    produkt: ['qihomeair'],
    kanal: ['homepage', 'lp', 'ads', 'sales'],
  },
  'WM-qibracelet-zellschutz-unterwegs': {
    aussage: 'Zellschutz für unterwegs',
    status: 'entwurf',
    produkt: ['qibracelet'],
    kanal: ['homepage', 'lp'],
  },
  'WM-qione-allrounder-tag-nacht': {
    aussage: 'Der Allrounder — Tag und Nacht',
    status: 'entwurf',
    produkt: ['qione'],
    kanal: ['homepage', 'lp'],
  },
  'WM-qione-tragbar-anhaenger': {
    aussage: 'Tragbar als Anhänger',
    status: 'entwurf',
    produkt: ['qione'],
    kanal: ['homepage', 'lp'],
  },
  'WM-qione-bestseller': {
    aussage: 'Unser Bestseller',
    status: 'entwurf',
    produkt: ['qione'],
    kanal: ['homepage', 'lp'],
  },
  'WM-qihome-zellschutz-raum': {
    aussage: 'Zellschutz im ganzen Raum',
    status: 'entwurf',
    produkt: ['qihomeair'],
    kanal: ['homepage', 'lp'],
  },
  'WM-bewertung-4-8-sterne': {
    aussage: '4,8 ★',
    status: 'legitimiert',
    produkt: ['qione', 'qibracelet', 'qihomeair'],
    kanal: ['homepage', 'lp'],
  },
  'WM-nutzer-ueber-14000': {
    aussage: 'Über 14.000 Nutzer',
    status: 'legitimiert',
    produkt: ['qione', 'qibracelet', 'qihomeair'],
    kanal: ['homepage', 'lp'],
  },
};

/** Claim-Text per ID — fail-loud bei unbekannter ID (kein stilles ''). */
export function claim(id) {
  const c = CLAIMS[id];
  if (!c) {
    throw new Error(
      `Unbekannte Claim-ID: ${id} — SSoT ist fakten-basis.yaml claims[] (claims_emit.py)`,
    );
  }
  return c.aussage;
}
