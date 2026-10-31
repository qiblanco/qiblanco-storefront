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
 * Ratenangebot der ganzen Auswahl: Gerät plus gewählte Kette. Bezahlart-Karten,
 * Hinweis und Zusammenfassung rechnen damit auf derselben Summe; bis
 * 29.10.2026 nahmen Karten und Hinweis nur den Gerätepreis und blieben bei
 * gewählter Kette stehen (Christian Z3).
 */
export function auswahlAngebot({hauptPreis, kettePreis = 0, waehrung = 'EUR', land}) {
  const summe = (Number(hauptPreis) || 0) + (Number(kettePreis) || 0);
  return ratenAngebot({brutto: summe, waehrung, land});
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
  varianteName: anzeige = null,
  hauptPreis,
  kette = null,
  kettePreis = 0,
  zahlart = 'direkt',
  waehrung = 'EUR',
  land,
}) {
  // `anzeige`: Anzeigename der Variante (VARIANTE.namen, z. B. „S“ statt
  // Shopifys „S – 17“); ohne ihn der Shopify-Titel.
  const varianteName =
    variante?.title && !OHNE_AUSWAHL.has(variante.title) ? anzeige || variante.title : null;
  const posten = [
    {
      schluessel: 'produkt',
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

/**
 * Weitere Box-Teile als Bild mit Bildunterschrift (Daten BOX.kacheln:
 * [{name, bild: {url, alt}}]). Nur Teile mit Name UND Bild; eine Zeile ohne
 * Bild gibt es in der Box nicht mehr (Christian 29.10.2026 Z1: „nicht mehr
 * unten drunter anzeigen … wie beim qi bracelet“).
 */
export function boxKacheln(kacheln) {
  return (kacheln ?? [])
    .filter((k) => typeof k?.name === 'string' && k.name.trim() && k?.bild?.url && k?.bild?.alt)
    .map((k, i) => ({schluessel: `teil-${i + 1}`, name: k.name, bild: k.bild}));
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
 * LinesAdd-Aktion. Ohne kaufbares Gerät keine Zeile. `attribute` (optional)
 * hängt an der Gerätezeile, z. B. die Kettenlänge eines Sets, dessen Kette
 * Shopify nicht als Variante führt (s13-r3).
 */
export function warenkorbZeilen(variante, kette = null, attribute = null) {
  if (!variante?.id || !variante.availableForSale) return [];
  const haupt = {merchandiseId: variante.id, quantity: 1, selectedVariant: variante};
  if (attribute?.length) haupt.attributes = attribute;
  const zeilen = [haupt];
  if (kette?.variante?.id) {
    zeilen.push({merchandiseId: kette.variante.id, quantity: 1, selectedVariant: kette.variante});
  }
  return zeilen;
}

/** Name des Messabschnitts eines Schritts (qpx-basis: [A-Za-z0-9_.:-]{1,64}). */
export function schrittAbschnitt(schritt) {
  return `konfig-${String(schritt).replace(/[^A-Za-z0-9_.:-]/g, '-')}`.slice(0, 64);
}

/**
 * Sichtbare FAQ des Konfigurators (Slot AlphaFaq, s08): {rate}/{rate12} aus
 * dem Ratenangebot; ohne Angebot entfällt jede Frage, die eine Rate nennt
 * (nie ein Raten-Versprechen ohne Angebot, wie BEZAHLART.titelDirekt).
 * Eingang [{f, a}], Ausgang [{f, a}] ohne Platzhalter.
 */
export function faqSichtbar(fragen, angebot) {
  const rate = /\{rate(?:12)?\}/;
  return (fragen ?? [])
    .filter((x) => x?.f && x?.a)
    .filter((x) => angebot || !rate.test(`${x.f} ${x.a}`))
    .map((x) => ({f: mitRate(x.f, angebot), a: mitRate(x.a, angebot)}));
}

/*
 * KETTE IM SET (s13-r3, Angebot /products/pjdz538hgs0 „QiOne® 2 Pro +
 * Necklace“): Shopify führt das Set mit EINER Variante, die Kette liegt bei.
 * Ihre Länge geht als Zeilenattribut an die Bestellung (KETTENLAENGE_ATTR,
 * ohne Unterstrich, damit Kasse und Bestellung sie zeigen). Bis 31.10.2026
 * kam sie nur an, wenn jemand sie selbst in die Notiz schrieb (3 von 12
 * Bestellungen, s13/mess/r3/angebot-bestellungen.json).
 */
export const KETTENLAENGE_ATTR = 'Kettenlänge';

/**
 * Längen-Kacheln der beiliegenden Kette aus den Varianten des Kettenprodukts:
 * ALLE Längen, kurz nach lang, mit Lieferbarkeit (ausverkauft = sichtbar,
 * nicht wählbar). Keine Variante wird gekauft, nur die Länge gemerkt.
 */
export function laengenKacheln(produkt) {
  return (produkt?.variants?.nodes ?? [])
    .map((v) => ({cm: laengeCm(v?.title), verfuegbar: Boolean(v?.availableForSale)}))
    .filter((x) => x.cm)
    .sort((a, b) => a.cm - b.cm)
    .map((x) => ({schluessel: `laenge-${x.cm}`, ...x}));
}

/** Vorwahl: die gewünschte Länge, wenn lieferbar, sonst die erste lieferbare. */
export function startLaenge(kacheln, vorwahl = null) {
  const lieferbar = (kacheln ?? []).filter((k) => k.verfuegbar);
  return (lieferbar.find((k) => k.cm === vorwahl) ?? lieferbar[0] ?? null)?.cm ?? null;
}

/** Zeilenattribut der gewählten Länge; ohne Länge keins. */
export function laengenAttribut(cm) {
  return cm ? [{key: KETTENLAENGE_ATTR, value: `${cm} cm`}] : null;
}
