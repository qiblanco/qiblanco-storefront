/**
 * Reine Regeln des Produkt-Konfigurators (Alpha-Vorlage) für /products/
 * qione-2-pro, /products/qihome-air und /products/qibracelet (Grossjob
 * 20261027-GROSSJOB-apple-konfigurator-qione-qihome-qibracelet-ab, s05,
 * KONZEPT §3). Kein Netz, kein React: testbar mit
 * `node --test app/components/product-pages/alpha-vorlage-logik.test.mjs`.
 *
 * BESTAND, NICHT NEU: der Monatsbetrag ist die Hausformel der Kaufseiten
 * (reusables/raten-angebot.js, ceil(Preis / 12), ab 500 €), der Betragstext
 * kommt aus lib/betrag-text.js (dieselbe Funktion wie auf /products/qi-alpha).
 * Varianten liest die Vorlage aus PRODUCT_QUERY (options[].optionValues[]
 * .firstSelectableVariant, selectedOrFirstAvailableVariant, adjacentVariants).
 */
import {monatsrate, RATEN_ANZAHL} from '../reusables/raten-angebot.js';
import {betragText} from '../../lib/betrag-text.js';

/** Shopifys Platzhalter für ein Produkt ohne echte Auswahl. */
const OHNE_AUSWAHL = new Set(['Default Title']);

/**
 * Wählbare Optionen eines Produkts: nur Optionen mit mehr als einem Wert und
 * nie Shopifys „Default Title“. Ohne solche Option entfällt der Schritt
 * Variante (QiOne® 2 Pro, QiHome® Air heute).
 * @returns {Array<{name: string, werte: Array<{name: string, verfuegbar: boolean, variante: object|null}>}>}
 */
export function variantenOptionen(product) {
  const optionen = product?.options ?? [];
  return optionen
    .map((o) => ({
      name: o?.name,
      werte: (o?.optionValues ?? [])
        .filter((w) => w?.name && !OHNE_AUSWAHL.has(w.name))
        .map((w) => ({
          name: w.name,
          variante: w.firstSelectableVariant ?? null,
          verfuegbar: Boolean(w.firstSelectableVariant?.availableForSale),
        })),
    }))
    .filter((o) => o.name && o.werte.length > 1);
}

/** Auswahl {Optionsname: Wert} der Startvariante (Shopify oder URL). */
export function startWahl(product) {
  const wahl = {};
  for (const s of product?.selectedOrFirstAvailableVariant?.selectedOptions ?? []) {
    if (s?.name) wahl[s.name] = s.value;
  }
  return wahl;
}

/**
 * Die Variante zur Auswahl. Gesucht wird unter allen Varianten, die die
 * Abfrage mitliefert; passt keine vollständig, gibt es null (nichts anbieten,
 * was die Kasse nicht nimmt). Ohne wählbare Option: die Startvariante.
 */
export function varianteZurWahl(product, wahl) {
  const start = product?.selectedOrFirstAvailableVariant ?? null;
  const optionen = variantenOptionen(product);
  if (!optionen.length) return start;
  const kandidaten = [
    start,
    ...(product?.adjacentVariants ?? []),
    ...optionen.flatMap((o) => o.werte.map((w) => w.variante)),
  ].filter(Boolean);
  const passt = (v) =>
    optionen.every((o) =>
      (v.selectedOptions ?? []).some((s) => s.name === o.name && s.value === wahl?.[o.name]),
    );
  return kandidaten.find(passt) ?? null;
}

/**
 * Ratenangebot für die Bezahlart: nur im Markt DE (Ratenzahlung steht nur
 * Kundinnen und Kunden mit deutschem Wohnsitz offen, KaufZusage.jsx), nur in
 * EUR und erst ab der Klarna-Schwelle (monatsrate liefert sonst null).
 * @returns {{anzahl: number, rate: number, text: string}|null}
 */
export function ratenAngebot({brutto, waehrung = 'EUR', land}) {
  if (land !== 'DE' || waehrung !== 'EUR') return null;
  const rate = monatsrate(brutto);
  if (!rate) return null;
  return {anzahl: RATEN_ANZAHL, rate, text: betragText(rate, waehrung)};
}

/**
 * Bezahl-Optionen der Daten mit eingesetztem Monatsbetrag. Platzhalter
 * `{rate}` bzw. `{rate12}` (Schreibweise der Texte aus s03/s04) werden durch
 * die Zahl ersetzt. Ohne Ratenangebot bleibt allein „direkt“.
 * @param {Array<{id: string, titel: string, zeile?: string}>} optionen
 */
export function bezahlOptionen(optionen, angebot) {
  return (optionen ?? [])
    .filter((o) => o?.id === 'direkt' || angebot)
    .map((o) => ({...o, zeile: mitRate(o.zeile, angebot)}));
}

/** `{rate}`/`{rate12}` durch den Monatsbetrag ersetzen (ohne „ €“ davor). */
export function mitRate(text, angebot) {
  if (typeof text !== 'string') return text ?? null;
  if (!angebot) return text;
  return text.replace(/\{rate(?:12)?\}/g, String(angebot.rate));
}

/**
 * Posten der Zusammenfassung: Gerät (mit gewählter Variante), Kette (wenn
 * gewählt), Summe und, bei Raten, die Monatsrate der Summe.
 * @returns {{posten: Array<{schluessel: string, name: string, betrag: number}>, summe: number, rate: object|null}}
 */
export function zusammenfassung({
  name,
  variante,
  hauptPreis,
  kette = null,
  kettePreis = 0,
  zahlart = 'direkt',
  waehrung = 'EUR',
  land,
}) {
  const varianteName =
    variante?.title && !OHNE_AUSWAHL.has(variante.title) ? variante.title : null;
  const posten = [
    {
      schluessel: 'geraet',
      name: varianteName ? `${name} · ${varianteName}` : name,
      betrag: hauptPreis || 0,
    },
  ];
  if (kette) posten.push({schluessel: 'kette', name: kette.name, betrag: kettePreis || 0});
  const summe = posten.reduce((s, p) => s + p.betrag, 0);
  const rate = zahlart !== 'direkt' ? ratenAngebot({brutto: summe, waehrung, land}) : null;
  return {posten, summe, rate};
}

/**
 * Inhalt von „What's in the Box“: die festen Teile des Produkts, dazu die
 * gewählte Kette. Ohne Kette steht nur, was immer in der Box liegt.
 * @param {Array<string>} teile  feste Teile (Daten je Produkt)
 */
export function boxInhalt(teile, kette = null) {
  const fest = (teile ?? []).filter((t) => typeof t === 'string' && t.trim());
  return kette?.box ? [...fest, kette.box] : fest;
}

/** Shopify-CDN-Breite anhängen, egal ob die URL schon eine Query trägt. */
export function mitBreite(url, breite) {
  if (!url) return url;
  return `${url}${url.includes('?') ? '&' : '?'}width=${breite}`;
}

/** Länge in cm aus dem Variantentitel („S - 45cm“, „L - 60 cm“). */
export function laengeCm(titel) {
  const m = /(\d{2,3})\s*cm/i.exec(String(titel || ''));
  return m ? Number(m[1]) : null;
}

/**
 * Ketten-Kacheln aus den Shopify-Varianten (Elinas Vorschau): nur kaufbare
 * Längen, kurz nach lang.
 */
export function kettenKacheln(produkt, art, texte) {
  const nodes = produkt?.variants?.nodes ?? [];
  return nodes
    .filter((v) => v?.availableForSale && v?.id)
    .map((v) => ({v, cm: laengeCm(v.title)}))
    .filter((x) => x.cm)
    .sort((a, b) => a.cm - b.cm)
    .map(({v, cm}) => ({
      schluessel: `${art}-${cm}`,
      art,
      cm,
      name: texte.name(cm),
      box: texte.box(cm),
      variante: v,
    }));
}

/**
 * Warenkorbzeilen: Gerät zuerst, die Kette als eigene Zeile derselben
 * LinesAdd-Aktion. Ohne kaufbares Gerät keine Zeile.
 */
export function warenkorbZeilen(variante, kette = null) {
  if (!variante?.id || !variante.availableForSale) return [];
  const zeilen = [{merchandiseId: variante.id, quantity: 1, selectedVariant: variante}];
  if (kette?.variante?.id) {
    zeilen.push({merchandiseId: kette.variante.id, quantity: 1, selectedVariant: kette.variante});
  }
  return zeilen;
}

/** Name des Messabschnitts eines Schritts (qpx-basis: [A-Za-z0-9_.:-]{1,64}). */
export function schrittAbschnitt(schritt) {
  return `konfig-${String(schritt).replace(/[^A-Za-z0-9_.:-]/g, '-')}`.slice(0, 64);
}
