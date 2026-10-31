/**
 * Reine Regeln der Shopseite /products/the-alpha (Grossjob 20261025-prio1-
 * the-alpha-landingpage-figma-vorlage-a-server-b-ki-c, s12). Kein Netz, kein
 * React: testbar mit node --test (test/the-alpha-shop.test.mjs).
 *
 * BESTAND, NICHT NEU ERFUNDEN: Hauptprodukt, Wunschnummer und Goldkette sind
 * die Shopify-Produkte aus lib/qi-master-addons.js; die Warenkorbzeilen der
 * Add-ons entstehen über addonLinien(), die Bindung im Warenkorb macht
 * bindeQiMasterAddons() (lib/qi-master-addons.server.js). nummernStand ist die
 * Übergabe von s03 (uebergabe-s06/the-alpha.js), hier auf die Varianten aus
 * QM_ADDONS_QUERY gesetzt.
 */
import {THE_ALPHA_SERIE, THE_ALPHA_VERGEBEN} from './the-alpha-daten-serie-vergeben.js';
import {
  KETTE_STAHL,
  KETTE_STAHL_LAENGEN,
  KETTE_LAENGEN,
} from './the-alpha-shop-daten.js';
import {addonsImMarkt} from '../../lib/qi-master-addons.js';

/**
 * Nummer aus einem Variantentitel „Alpha 19/100“, „Alpha 105/111“ bzw. seit
 * 28.10.2026 „19/111“ (Christian 27.10.: Position „Qi Alpha® 19/111“).
 */
export function nummerAusTitel(titel) {
  const m = /^\s*(?:Alpha\s*)?(\d{1,3})\s*\//i.exec(String(titel || ''));
  return m ? Number(m[1]) : null;
}

/**
 * Stand der Serie 1..SERIE.
 * status: 'frei' (wählbar) | 'vergeben' (Shopify gesperrt ODER Christians
 * Liste) | 'fehlt' (keine Shopify-Variante, also nicht kaufbar).
 */
export function nummernStand(varianten, opt = {}) {
  const serie = opt.serie ?? THE_ALPHA_SERIE;
  const vergeben = new Set(opt.vergeben ?? THE_ALPHA_VERGEBEN);
  const jeNummer = new Map();
  for (const v of varianten || []) {
    const n = nummerAusTitel(v?.title);
    if (n && n >= 1 && n <= serie && !jeNummer.has(n)) jeNummer.set(n, v);
  }
  const nummern = [];
  for (let n = 1; n <= serie; n++) {
    const v = jeNummer.get(n);
    let status = 'frei';
    if (vergeben.has(n)) status = 'vergeben';
    else if (!v) status = 'fehlt';
    else if (!v.availableForSale) status = 'vergeben';
    nummern.push({n, variante: status === 'frei' ? v : null, status});
  }
  return {nummern, frei: nummern.filter((x) => x.status === 'frei').length};
}

/**
 * Die Kettenwahl der Seite: Christians drei Goldlängen (60 · 50 · 45, Z15–Z17,
 * in dieser Reihenfolge) aus den Shopify-Varianten, dahinter die Kette aus
 * Chirurgenstahl, die ohne Aufpreis dabei ist. Eine Länge ohne kaufbare
 * Variante fällt weg (nichts anbieten, was die Kasse nicht nimmt). 40 und
 * 75 cm gibt es in Shopify auch; Christians Vorlage nennt sie nicht.
 */
export function kettenOptionen(ketteProdukt, stahlProdukt = null) {
  const varianten = ketteProdukt?.variants?.nodes || [];
  const gold = KETTE_LAENGEN.map((laenge) => {
    const v = varianten.find((x) => x.title === laenge.titel && x.availableForSale);
    return v ? {...laenge, art: 'gold', variante: v} : null;
  }).filter(Boolean);
  return [...gold, ...stahlOptionen(stahlProdukt)];
}

/**
 * Die Stahlkette als kaufbare 0-€-Variante (Elina 30.10.2026,
 * EL-20261030-ae569366: eigene Warenkorbzeile), nur in 60 cm (Christian
 * 31.10.2026: „es gibt immer standardmäßig die 60iger kette. anosnsten nur in
 * gold auswählbar.“). Weitere Stahl-Varianten in Shopify zeigt die Seite nie. RÜCKFALL: fehlt das Produkt (Abfrage gescheitert, nicht
 * veröffentlicht) oder ist keine Länge kaufbar, bleibt die bisherige
 * 60-cm-Karte ohne Variante stehen; der Qi Alpha geht dann ohne Kettenzeile.
 */
function stahlOptionen(stahlProdukt) {
  const varianten = stahlProdukt?.variants?.nodes || [];
  const stahl = KETTE_STAHL_LAENGEN.map(({laenge, ...rest}) => {
    const v = varianten.find((x) => x.title === laenge && x.availableForSale);
    return v ? {...rest, art: 'stahl', variante: v} : null;
  }).filter(Boolean);
  return stahl.length ? stahl : [{...KETTE_STAHL, art: 'stahl', variante: null}];
}

/**
 * Was die Seite an Kauf-Optionen zeigt: Nummernstand, ob der Nummern-Schritt
 * erscheint, und die Kettenwahl. Entschieden wird am Markt des Qi Alpha, nicht
 * an einer Währungsliste (addonsImMarkt): im TH-Markt in THB erscheinen
 * Wunschnummer und Goldketten genauso wie in DE in EUR, sobald Shopify sie dort
 * mit Preis führt (Job 20261030-repair-kaufweg-addons-fremdwaehrung-fix-live,
 * F-2755). Ohne kaufbaren Qi Alpha bleibt nur die Stahlkette.
 */
export function kaufAuswahl(addons, haupt) {
  const marktAddons = addonsImMarkt(addons, haupt);
  // Stahlkette: dieselbe Marktregel wie die Goldkette (Preis in der Währung
  // des Qi Alpha), über addonsImMarkt in der Kettenrolle geprüft.
  const stahlImMarkt = addons?.stahlkette
    ? addonsImMarkt({kette: addons.stahlkette}, haupt).kette
    : null;
  const stand = marktAddons.wunschnummer
    ? nummernStand(marktAddons.wunschnummer.variants.nodes)
    : {nummern: [], frei: 0};
  return {
    marktAddons,
    stand,
    nummernAn: stand.frei > 0,
    ketten: kettenOptionen(marktAddons.kette, stahlImMarkt),
  };
}

/** „69/111 - 1st. Edition“; ohne Wunsch „xx/111 - 1st. Edition“. */
export function gravurText(nummer, serie = THE_ALPHA_SERIE) {
  return `${nummer ?? 'xx'}/${serie} - 1st. Edition`;
}

/*
 * Raten: bis 2026-10-28 stand hier ratenMoeglich() für den Ratencode 9.999 €
 * (nur ohne Wunschnummer und Goldkette). Seit der geteilten Zahlung (Grossjob
 * 20261027-qi-alpha-geteilte-zahlung-10000-raten-rest-sofort, s03) geht
 * Ratenzahlung mit jeder Konfiguration; die Regeln stehen in
 * lib/qi-alpha-teilzahlung.js.
 */

/** Ganzer Betrag ohne Nachkommastellen, echte Cents bleiben. */
export function betragText(wert, waehrung = 'EUR') {
  const zahl = Number(wert);
  if (!Number.isFinite(zahl)) return null;
  const ganz = Math.round(zahl * 100) % 100 === 0;
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: waehrung,
    minimumFractionDigits: ganz ? 0 : 2,
    maximumFractionDigits: ganz ? 0 : 2,
  }).format(zahl);
}

