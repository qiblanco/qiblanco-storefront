/*
 * amazonstil-daten.js — Texte, Schalter und reine Logik der Amazon-Stil-
 * Stufe 2 auf den drei Geräte-Kaufseiten: Gerätevergleich und Kundenfragen
 * weit oben (Grossjob growth-m-lp-produktseite-verkauft, Segment s04,
 * 27.09.2026; Christians Leitplanke 26.09. Folie 11 "Amazon Style Produkte
 * Seite"). Komponenten: reusables/AmazonStil.jsx, Stylesheet:
 * styles/amazonstil.css, hermetischer Test: amazonstil-daten.test.mjs.
 *
 * WARUM DIESE DATEI IN reusables/ LIEGT UND NICHT IN app/data/: die
 * Scope-Allowlist des Deploy-Wegs (homepage-bauer/config/deploy.conf) gibt
 * app/data/ nur namentlich frei, reusables/* dagegen als Ganzes. Das Muster
 * ist dasselbe wie app/data/produkt-videos.js: reine Daten, EIN Ort je Text.
 *
 * KEIN NEUER WERBETEXT (Folie 15: Christian schreibt die Texte selbst). Jede
 * sichtbare Zeile ist Bestand dieser Seiten, ein Tabellenkopf oder ein
 * Bedienwort; die Fundstelle steht je Feld im Kommentar. Christians Wortlaut
 * ersetzt eine Zeile hier 1:1, ohne dass eine Komponente angefasst wird. Die
 * Plätze der Textmappe heissen <handle>.geraetevergleich und
 * <handle>.kundenfragen (data-textplatz an der Wurzel beider Blöcke).
 *
 * RÜCKWEG OHNE CODE-LOGIK (zwei Schalter, beide Listen):
 *   VERGLEICH.geraete = []      -> kein Vergleich, keine Preisabfrage im
 *                                  Loader, kein Stylesheet
 *   KUNDENFRAGEN.seiten = []    -> keine Kundenfragen oben, die FAQ unten ist
 *                                  wieder vollständig und trägt ihr Schema
 *                                  wieder selbst
 * Beide aus = die drei Seiten liefern byte-gleich den Stand vor s04 aus
 * (geprüft in amazonstil-daten.test.mjs). Mit Code: hb-deploy revert.
 *
 * Nur relative Importe, kein React: die Datei muss unter `node --test` ohne
 * Build laufen (Kopf von lib/markt-pricing.js, gleiche Begründung).
 */
import {PRODUKT_TRIO} from '../../lib/redesign3themen.js';
import {anzeigeSatz, formatPreis, ganzEuroAnzeige} from '../../lib/markt-pricing.js';
import {isSchemaSafe} from '../../lib/faq-schema.js';
import {monatsrate} from './raten-angebot.js';

/* ---- Gerätevergleich ------------------------------------------------------ */

/*
 * Reihenfolge der Spalten: das Gerät DIESER Seite zuerst (Amazon "Dieser
 * Artikel"), danach die zwei anderen in der Reihenfolge dieser Liste.
 * Name, Bild und Bildtext kommen aus PRODUKT_TRIO (lib/redesign3themen.js,
 * die Daten des Produkt-Trios), nicht aus einer zweiten Liste.
 */
export const VERGLEICH = {
  // Tabellenkopf: die drei Produktnamen, wie PRODUKT_TRIO sie schreibt.
  titel: 'QiOne® 2 Pro, QiBracelet® und QiHome® Air im Vergleich',
  // Zeilenköpfe (Tabellenköpfe). "Raten" steht nur im Markt DE, wie die
  // Ratenzeile unter dem Kaufknopf (reusables/KaufZusage.jsx).
  zeilen: {
    preis: 'Preis',
    einsatz: 'Einsatz',
    material: 'Material',
    wasser: 'Wasser und Sauna',
    studie: 'Zellstudie',
    raten: 'Raten',
  },
  // Bedienwörter. Das Ziel heisst im Wort mit, damit ein Screenreader nicht
  // dreimal dasselbe "Ansehen" vorliest.
  zumGeraet: (name) => `Zum ${name}`,
  dieserArtikel: 'Dieser Artikel',
  geraete: [
    {
      handle: 'qione-2-pro',
      // product-faqs.js FAQ_QIBRACELET[0].a: "Der QiOne® 2 Pro ist als Gehäuse
      // mit einem Anhänger konzipiert und eignet sich daher ideal zum Tragen
      // um den Hals."
      einsatz: 'Anhänger zum Tragen um den Hals',
      // product-faqs.js FAQ_QIONE_2_PRO[2].a: "Für das Gehäuse verwenden wir
      // ausschließlich hochwertigen Chirurgenstahl, während der Gitterchip™
      // auf Basis einer maßgeschneiderten 750er Goldlegierung gefertigt wird."
      material: 'Gehäuse aus Chirurgenstahl, Gitterchip™ aus 750er Goldlegierung',
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
      einsatz: 'Armreif zum Tragen am Handgelenk',
      // product-faqs.js FAQ_QIBRACELET[4].a ("Chirurgenstahl 316L als
      // Gehäusematerial") und FAQ_QIBRACELET[2].a (Gitterchip™, 750er
      // Goldlegierung).
      material: 'Gehäuse aus Chirurgenstahl 316L, Gitterchip™ aus 750er Goldlegierung',
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
      einsatz: 'Für den ganzen Raum, auf einen Radius von bis zu 160 m ausgelegt',
      // product-faqs.js FAQ_QIHOME_AIR[2].a: "Das Gehäuse besteht aus
      // hochwertigem Chirurgenstahl, der exklusive Gitterchip™ wird aus einer
      // maßgeschneiderten High-Carat-Goldlegierung gefertigt, und die
      // Holzelemente ... aus regionaler deutscher Eiche".
      material:
        'Gehäuse aus Chirurgenstahl, Gitterchip™ aus High-Carat-Goldlegierung, Holzelemente aus regionaler deutscher Eiche',
      // Ein Raumgerät geht nicht ins Wasser: die Frage entfällt (Bedienwort).
      wasser: 'Entfällt',
      // data/studien/e0005.json, kachel ("an neuronalen Zellen", "...
      // Neurodegenerative Diseases: Current Research 2026").
      studien: [
        {text: 'Neuronale Zellen, 2026', href: '/pages/studie-qihome-air'},
      ],
    },
  ],
};

/** Ist der Vergleich eingeschaltet (Schalter: VERGLEICH.geraete)? */
export function vergleichAn(vergleich = VERGLEICH) {
  return Array.isArray(vergleich?.geraete) && vergleich.geraete.length > 0;
}

/*
 * Der Preis steht im Vergleich so, wie er in der Kaufbox des Geräts steht:
 * dieselbe Rechnung wie components/ProductPrice.jsx (anzeigeSatz ->
 * ganzEuroAnzeige -> formatPreis 'pdp'), nur ohne den Streichpreis. Nicht
 * nachgebaut, sondern aus demselben Preis-Kanon (lib/markt-pricing.js).
 */
export function preisAnzeige(money, handle, land) {
  const betrag = Number.parseFloat(money?.amount);
  if (!Number.isFinite(betrag)) return null;
  const waehrung = money?.currencyCode || 'EUR';
  const roh = betrag * (1 + anzeigeSatz(handle, waehrung, land));
  const wert = ganzEuroAnzeige(roh, land);
  return formatPreis(Math.round(wert), waehrung, 'pdp');
}

/*
 * Monatsrate wie in der Ratenzeile unter dem Kaufknopf (KaufZusage.jsx):
 * nur im Markt DE, nur in EUR, 12 Raten ab 500 EUR (raten-angebot.js).
 */
export function ratenAnzeige(money, handle, land) {
  if (land !== 'DE') return null;
  if ((money?.currencyCode || 'EUR') !== 'EUR') return null;
  const betrag = Number.parseFloat(money?.amount);
  if (!Number.isFinite(betrag)) return null;
  const rate = monatsrate(ganzEuroAnzeige(betrag * (1 + anzeigeSatz(handle, 'EUR', land)), land));
  // Fussnote ² wie an der Ratenzeile: Genehmigung durch den Anbieter,
  // deutscher Wohnsitz (Fuss jeder Seite).
  return rate ? `12 Raten à ${rate} €²` : null;
}

/*
 * Die Spalten für EINE Seite: das eigene Gerät zuerst. `preise` ist
 * {handle: {amount, currencyCode}} aus dem Loader (ladeVergleichsPreise);
 * das eigene Gerät nimmt den Preis seiner eigenen Kaufbox (`eigenerPreis`),
 * damit Kaufbox und Vergleich aus derselben Variante rechnen.
 */
export function vergleichSpalten(handle, {preise = {}, eigenerPreis = null, land = 'DE'} = {},
  vergleich = VERGLEICH) {
  if (!vergleichAn(vergleich)) return [];
  const trio = Object.fromEntries(PRODUKT_TRIO.map((p) => [p.handle, p]));
  const spalten = vergleich.geraete
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

/*
 * Die Preise der drei Geräte in EINER Abfrage — dasselbe Feld, aus dem die
 * Kaufbox jeder Seite ihren Preis nimmt (selectedOrFirstAvailableVariant,
 * ohne gewählte Optionen = die Variante, mit der die Kaufseite öffnet).
 * Muster: CAMPAIGN_PRODUCTS_QUERY in routes/pages.tiefer-schlaf.jsx.
 */
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

/*
 * Für den Loader. Fail-soft: fällt die Abfrage aus, rendert der Vergleich
 * ohne Preis, die Kaufseite bleibt stehen (kein 500er wegen eines
 * Nebenblocks). Ist der Vergleich aus, fragt der Loader gar nicht erst.
 */
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
 * WELCHE FRAGEN NACH OBEN: alle Fragen, deren Bestandsantwort das Haus heute
 * schon als sauber auszeichnet (isSchemaSafe aus lib/faq-schema.js, dieselbe
 * Regel, die über das FAQPage-Schema entscheidet). Was das Haus nicht
 * verstärkt, zieht auch dieser Block nicht nach oben; es bleibt unten stehen.
 *
 * IN WELCHER REIHENFOLGE: nach dem Zähler der Kundenworte aus s03
 * (claude-jobs/growth-m-lp-produktseite-verkauft-s03/mess/kundenfragen-
 * zaehler.json, Stand 2026-09-26): Anteil der Gespräche im Verkaufs-Chat, in
 * denen das Thema in EIGENEN Worten vorkam (Nenner 377), plus Anteil der
 * deutschen Support-Chats (Gorgias, Nenner 1.029). Tragen 6,4 + 26,2 = 32,6;
 * Sauna/Wasser 0,5 + 18,4 = 18,9; Preis/Raten 8,5 + 4,4 = 12,9;
 * Material 1,6 + 2,8 = 4,4. Fragen ohne Thema stehen am Ende.
 *
 * DAS SCHEMA BLEIBT EINES: weil oben ALLE sauberen Fragen stehen, trägt die
 * FAQ unten keine saubere Frage mehr und gibt kein FAQPage-JSON-LD mehr aus.
 * Der Block oben gibt es statt ihrer aus, über die VOLLE Liste — byte-gleich
 * zu dem, was die FAQ vorher ausgab. Genau ein FAQPage je Seite.
 */
export const KUNDENFRAGEN = {
  // Überschrift des Blocks (Bedienwort, Christians Wortlaut ersetzt sie).
  titel: 'Kunden fragen',
  // Schalter: Seiten, auf denen der Block steht. [] = aus.
  seiten: ['qione-2-pro', 'qibracelet', 'qihome-air'],
  // Themen in Rangfolge (siehe oben), je Thema die Fragen aus
  // data/product-faqs.js, wörtlich als Schlüssel.
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

/*
 * Teilt die FAQ einer Seite: `oben` = die sauberen Fragen nach Rang, `unten`
 * = der Rest in Bestandsreihenfolge. Aus (Schalter) oder nichts Sauberes:
 * oben leer, unten ist DIESELBE Liste (dasselbe Array), die Seite rendert
 * damit exakt wie vor s04.
 */
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
