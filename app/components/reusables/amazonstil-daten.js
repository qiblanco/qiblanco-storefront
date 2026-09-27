/*
 * amazonstil-daten.js — Texte, Schalter und reine Logik der Amazon-Stil-
 * Stufe 2 auf den drei Geräte-Kaufseiten: Gerätevergleich und Kundenfragen
 * weit oben (Grossjob growth-m-lp-produktseite-verkauft, s04, 27.09.2026;
 * Leitplanke Folie 11). Komponenten: ./AmazonStil.jsx, Stylesheet:
 * styles/amazonstil.css, Test: ./amazonstil-daten.test.mjs.
 *
 * Liegt in reusables/ statt app/data/, weil die Scope-Allowlist des
 * Deploy-Wegs (homepage-bauer/config/deploy.conf) app/data/ nur namentlich
 * freigibt. Muster wie app/data/produkt-videos.js: reine Daten, EIN Ort je Text.
 *
 * KEIN NEUER WERBETEXT (Folie 15): jede sichtbare Zeile ist Bestand dieser
 * Seiten (Fundstelle je Feld), ein Tabellenkopf oder ein Bedienwort.
 * Christians Wortlaut ersetzt eine Zeile hier 1:1. Textmappen-Plätze:
 * <handle>.geraetevergleich und <handle>.kundenfragen (data-textplatz).
 *
 * RÜCKWEG OHNE CODE-LOGIK: VERGLEICH.produkte = [] (kein Vergleich, keine
 * Preisabfrage, kein Stylesheet) und KUNDENFRAGEN.seiten = [] (FAQ unten
 * wieder vollständig, trägt ihr Schema selbst). Beide aus = byte-gleich zum
 * Stand vor s04 (Test). Mit Code: hb-deploy revert.
 *
 * Nur relative Importe, kein React: läuft unter `node --test` ohne Build.
 */
import {PRODUKT_TRIO} from '../../lib/redesign3themen.js';
import {anzeigeSatz, formatPreis, ganzEuroAnzeige} from '../../lib/markt-pricing.js';
import {isSchemaSafe} from '../../lib/faq-schema.js';
import {monatsrate} from './raten-angebot.js';

/* ---- Gerätevergleich ------------------------------------------------------ */

/* Spalten: das Gerät DIESER Seite zuerst (Amazon "Dieser Artikel"), dann die
   anderen zwei. Name, Bild, Bildtext aus PRODUKT_TRIO (lib/redesign3themen.js). */
export const VERGLEICH = {
  // Tabellenkopf: die drei Produktnamen, wie PRODUKT_TRIO sie schreibt.
  titel: 'QiOne® 2 Pro, QiBracelet® und QiHome® Air im Vergleich',
  // Tabellenköpfe. "Raten" nur im Markt DE, wie unter dem Kaufknopf (KaufZusage.jsx).
  zeilen: {
    preis: 'Preis',
    einsatz: 'Einsatz',
    material: 'Material',
    wasser: 'Wasser und Sauna',
    studie: 'Zellstudie',
    raten: 'Raten',
  },
  // Bedienwörter; das Ziel steht im Wort (kein dreifaches "Ansehen" im Screenreader).
  zumGeraet: (name) => `Zum ${name}`,
  dieserArtikel: 'Dieser Artikel',
  produkte: [
    {
      handle: 'qione-2-pro',
      // product-faqs.js FAQ_QIBRACELET[0].a: "Der QiOne® 2 Pro ist als Gehäuse
      // mit einem Anhänger konzipiert und eignet sich daher ideal zum Tragen
      // um den Hals."
      einsatz: 'Anhänger zum Tragen um den Hals',
      // product-faqs.js FAQ_QIONE_2_PRO[2].a ("... Gehäuse ... Chirurgenstahl,
      // ... Gitterchip™ ... 750er Goldlegierung"). Legierungsgrad und 316L
      // bewusst weg: der Bestand nennt sie je Gerät verschieden (750er / High-
      // Carat), in der Tabelle läse sich das als Unterschied. Voller Wortlaut:
      // die Material-Frage direkt darunter.
      material: 'Gehäuse aus Chirurgenstahl, Gitterchip™ aus Goldlegierung',
      // product-faqs.js FAQ_QIONE_2_PRO[3] "Darf der QiOne® in die Sauna bzw.
      // nass werden?", Antwort beginnt mit "Ja!".
      wasser: 'Ja',
      // data/studien/e0001.json + e0002.json, kachel.zeile1/zeile2
      // ("Wissenschaftliche Publikation an Immunzellen ... 30. April 2021",
      // "... an Darmepithelzellen ... Applied Cell Biology 2021").
      studien: [
        {text: 'Immunzellen, 2021', href: '/pages/studie-immunzellen'},
        {text: 'Darmepithelzellen, 2021', href: '/pages/studie-darmbarriere'},
      ],
    },
    {
      handle: 'qibracelet',
      // product-faqs.js FAQ_QIBRACELET[0].a: "... ist das QiBracelet® als
      // Armreifen aus Chirurgenstahl gestaltet ... Tragestil am Handgelenk."
      einsatz: 'Armreifen zum Tragen am Handgelenk',
      // product-faqs.js FAQ_QIBRACELET[2].a (Chirurgenstahl, Gitterchip™,
      // Goldlegierung); Grad weg wie beim QiOne® 2 Pro.
      material: 'Gehäuse aus Chirurgenstahl, Gitterchip™ aus Goldlegierung',
      // product-faqs.js FAQ_QIBRACELET[3].a: "... bedenkenlos in feuchten
      // Umgebungen ... eignet sich auch für Saunabesuche ...".
      wasser: 'Ja',
      // data/studien/e0003.json, kachel ("zum Schutz vor oxidativem Stress",
      // "... Applied Cell Biology am 12. Januar 2024").
      studien: [
        {text: 'Oxidativer Stress, 2024', href: '/pages/studie-oxidativer-stress'},
      ],
    },
    {
      handle: 'qihome-air',
      // components/UpsellLineUp.jsx ITEMS[2].description: "Ein Gitterchip™
      // für den ganzen Raum: Das QiHome® Air ist auf einen Radius von bis zu
      // 160 m ausgelegt." Radius als Auslegung, nie in Quadratmetern
      // (GL-SPR-0007, Christian 2026-09-16).
      einsatz: 'Für den ganzen Raum, auf einen Radius von bis zu 160\u00a0m ausgelegt',
      // product-faqs.js FAQ_QIHOME_AIR[2].a: "Das Gehäuse besteht aus
      // hochwertigem Chirurgenstahl, der exklusive Gitterchip™ wird aus einer
      // maßgeschneiderten High-Carat-Goldlegierung gefertigt, und die
      // Holzelemente ... aus regionaler deutscher Eiche" (Grad weg, s. o.).
      material:
        'Gehäuse aus Chirurgenstahl, Gitterchip™ aus Goldlegierung, Holzelemente aus regionaler deutscher Eiche',
      // Raumgerät: die Frage stellt sich nicht; der Strich wie bei fehlendem Preis.
      wasser: '–',
      // data/studien/e0005.json, kachel ("an neuronalen Zellen", "...
      // Neurodegenerative Diseases: Current Research 2026").
      studien: [
        {text: 'Neuronale Zellen, 2026', href: '/pages/studie-qihome-air'},
      ],
    },
  ],
};

/** Ist der Vergleich eingeschaltet (Schalter: VERGLEICH.produkte)? */
export function vergleichAn(vergleich = VERGLEICH) {
  return Array.isArray(vergleich?.produkte) && vergleich.produkte.length > 0;
}

/* Preis wie in der Kaufbox: dieselbe Rechnung wie components/ProductPrice.jsx
   (anzeigeSatz -> ganzEuroAnzeige -> formatPreis 'pdp'), ohne Streichpreis. */
export function preisAnzeige(money, handle, land) {
  const betrag = Number.parseFloat(money?.amount);
  if (!Number.isFinite(betrag)) return null;
  const waehrung = money?.currencyCode || 'EUR';
  const roh = betrag * (1 + anzeigeSatz(handle, waehrung, land));
  const wert = ganzEuroAnzeige(roh, land);
  return formatPreis(Math.round(wert), waehrung, 'pdp');
}

/* Monatsrate wie die Ratenzeile unter dem Kaufknopf (KaufZusage.jsx): nur DE,
   nur EUR, 12 Raten ab 500 EUR (raten-angebot.js). */
export function ratenAnzeige(money, handle, land) {
  if (land !== 'DE') return null;
  if ((money?.currencyCode || 'EUR') !== 'EUR') return null;
  const betrag = Number.parseFloat(money?.amount);
  if (!Number.isFinite(betrag)) return null;
  const rate = monatsrate(ganzEuroAnzeige(betrag * (1 + anzeigeSatz(handle, 'EUR', land)), land));
  // Fussnote ² wie an der Ratenzeile (Fuss jeder Seite).
  return rate ? `12 Raten à ${rate} €²` : null;
}

/* Spalten für EINE Seite. `preise` {handle: money} aus ladeVergleichsPreise;
   das eigene Gerät nimmt den Preis seiner Kaufbox (`eigenerPreis`). */
export function vergleichSpalten(handle, {preise = {}, eigenerPreis = null, land = 'DE'} = {},
  vergleich = VERGLEICH) {
  if (!vergleichAn(vergleich)) return [];
  const trio = Object.fromEntries(PRODUKT_TRIO.map((p) => [p.handle, p]));
  const spalten = vergleich.produkte
    .filter((g) => trio[g.handle])
    .map((g) => {
      const money = g.handle === handle && eigenerPreis ? eigenerPreis : preise[g.handle];
      return {
        ...g,
        name: trio[g.handle].title,
        bild: trio[g.handle].bild,
        alt: trio[g.handle].alt,
        eigenes: g.handle === handle,
        preis: preisAnzeige(money, g.handle, land),
        raten: ratenAnzeige(money, g.handle, land),
      };
    });
  return [...spalten.filter((s) => s.eigenes), ...spalten.filter((s) => !s.eigenes)];
}

/* Die drei Preise in EINER Abfrage, aus dem Feld der Kaufbox
   (selectedOrFirstAvailableVariant ohne Optionen = die Variante, mit der die
   Kaufseite öffnet). Muster: CAMPAIGN_PRODUCTS_QUERY, pages.tiefer-schlaf.jsx. */
export const VERGLEICH_PREISE_QUERY = `#graphql
  fragment VergleichPreis on Product {
    handle
    selectedOrFirstAvailableVariant(
      selectedOptions: []
      ignoreUnknownOptions: true
      caseInsensitiveMatch: true
    ) {
      price {
        amount
        currencyCode
      }
    }
  }
  query GeraeteVergleichPreise($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    qione: product(handle: "qione-2-pro") {
      ...VergleichPreis
    }
    bracelet: product(handle: "qibracelet") {
      ...VergleichPreis
    }
    qihome: product(handle: "qihome-air") {
      ...VergleichPreis
    }
  }
`;

/* Für den Loader. Fail-soft: Abfrage aus -> Vergleich ohne Preis, die
   Kaufseite bleibt stehen. Vergleich aus -> keine Abfrage (null). */
export async function ladeVergleichsPreise(storefront, vergleich = VERGLEICH) {
  if (!vergleichAn(vergleich)) return null;
  try {
    const daten = await storefront.query(VERGLEICH_PREISE_QUERY, {
      cache: storefront.CacheShort(),
    });
    const preise = {};
    for (const p of [daten?.qione, daten?.bracelet, daten?.qihome]) {
      const money = p?.selectedOrFirstAvailableVariant?.price;
      if (p?.handle && money) preise[p.handle] = money;
    }
    return preise;
  } catch (fehler) {
    console.error('[geraetevergleich] Preisabfrage fehlgeschlagen:', fehler?.message || fehler);
    return {};
  }
}

/* ---- Kundenfragen --------------------------------------------------------- */

/*
 * WELCHE FRAGEN NACH OBEN: alle, deren Bestandsantwort das Haus schon als
 * sauber auszeichnet (isSchemaSafe, lib/faq-schema.js, dieselbe Regel wie das
 * FAQPage-Schema). Was das Haus nicht verstärkt, zieht auch dieser Block nicht
 * nach oben. REIHENFOLGE nach dem Kundenworte-Zähler aus s03 (claude-jobs/
 * growth-m-lp-produktseite-verkauft-s03/mess/kundenfragen-zaehler.json,
 * 2026-09-26): Anteil Verkaufs-Chat in eigenen Worten (Nenner 377) plus Anteil
 * deutsche Support-Chats (Gorgias, Nenner 1.029): Tragen 6,4 + 26,2 = 32,6;
 * Sauna/Wasser 0,5 + 18,4 = 18,9; Preis/Raten 8,5 + 4,4 = 12,9; Material
 * 1,6 + 2,8 = 4,4. SCHEMA: unten bleibt keine saubere Frage, die FAQ unten gibt
 * kein FAQPage mehr aus; der Block oben gibt es über die VOLLE Liste aus,
 * byte-gleich zu vorher. Genau ein FAQPage je Seite.
 */
export const KUNDENFRAGEN = {
  // Überschrift des Blocks (Bedienwort, Christians Wortlaut ersetzt sie).
  titel: 'Kunden fragen',
  // Schalter: Seiten, auf denen der Block steht. [] = aus.
  seiten: ['qione-2-pro', 'qibracelet', 'qihome-air'],
  // Themen in Rangfolge; Fragen wörtlich aus data/product-faqs.js.
  rang: [
    {
      thema: 'tragen',
      fragen: [
        'Kann ich den QiOne® an einer anderen Kette tragen?',
        'Wie sollte ich den QiOne® tragen?',
      ],
    },
    {
      thema: 'sauna-wasser',
      fragen: [
        'Darf der QiOne® in die Sauna bzw. nass werden?',
        'Darf das QiBracelet® nass werden, bzw. in die Sauna?',
      ],
    },
    {thema: 'preis-raten', fragen: ['Wie funktioniert die Finanzierung über Klarna?']},
    {
      thema: 'material',
      fragen: [
        'Ist das QiBracelet® sicher für Anwender mit Allergien?',
        'Aus welchem Material bestehen die Qi Blanco® Produkte?',
      ],
    },
  ],
};

function rangVon(frage, rang) {
  let i = 0;
  for (const t of rang) {
    for (const f of t.fragen) {
      if (f === frage) return i;
      i += 1;
    }
  }
  return Number.MAX_SAFE_INTEGER;
}

/* `oben` = saubere Fragen nach Rang, `unten` = der Rest. Aus oder nichts
   Sauberes: oben leer, unten DASSELBE Array (Seite wie vor s04). */
export function teileFragen(handle, items, kundenfragen = KUNDENFRAGEN) {
  const liste = Array.isArray(items) ? items : [];
  const an = Array.isArray(kundenfragen?.seiten) && kundenfragen.seiten.includes(handle);
  const sauber = an ? liste.filter((it) => isSchemaSafe(it)) : [];
  if (!sauber.length) return {oben: [], unten: items};
  const rang = kundenfragen.rang || [];
  const oben = sauber
    .map((it, i) => ({it, i}))
    .sort((a, b) => rangVon(a.it.q, rang) - rangVon(b.it.q, rang) || a.i - b.i)
    .map((x) => x.it);
  return {oben, unten: liste.filter((it) => !oben.includes(it))};
}

/** Brauchen die Blöcke dieser Seite ihr Stylesheet? */
export function amazonstilAn(handle, vergleich = VERGLEICH, kundenfragen = KUNDENFRAGEN) {
  return vergleichAn(vergleich) ||
    (Array.isArray(kundenfragen?.seiten) && kundenfragen.seiten.includes(handle));
}
