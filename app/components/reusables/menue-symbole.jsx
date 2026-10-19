/**
 * MENÜ-SYMBOLE UND DIE ORDNUNG UNTER „MEHR" — die eine Stelle dafür.
 *
 * Christian, 19.10.2026 (Diktat, Grossjob
 * 20261019-GROSSJOB-hauptmenue-start-shop-studien-beratung-live-mehr-alphabetisch-mit-symbolen):
 *   „Und alles, was unter Mehr ist, würde ich dann gerne mal alphabetisch
 *    sortiert haben. … Und idealerweise bekommt jeder Punkt unter Mehr ein
 *    kleines Gimmick, was es beschreibt. Und beim Shop zum Beispiel, bei
 *    Crystal Kakao, fehlt auch noch das Symbol davor."
 *
 * WARUM CRYSTAL CACAO KEIN SYMBOL HATTE, und warum das hier anders gebaut ist:
 *   Header.jsx band jedes Symbol an den MENÜTITEL (`child.title === "…"`,
 *   für den Kakao `title.includes('Kakao')`). Im Shopify-Menü heißt der Punkt
 *   seit der Umbenennung „Crystal Cacao®" — der Vergleich traf nie mehr, und
 *   nichts wurde rot. Hier gilt deshalb zuerst das ZIEL des Menüpunkts (Pfad),
 *   der Titel nur als Rückfall. Eine Umbenennung im Admin kostet kein Symbol
 *   mehr, ein umgehängtes Ziel fällt auf den Titel zurück.
 *
 * DIE GESTALT: Produkte tragen ihr freigestelltes Produktbild (129-px-Master
 * auf dem Shopify-CDN, wie bisher). Die Punkte unter „Mehr" haben kein
 * Produkt; sie tragen ein Linien-Piktogramm in derselben 45-px-Spalte, in der
 * gedämpften Tinte (--qb-text-gedaempft), ohne Gold — Gold bleibt Handlung
 * und Beweis vorbehalten (DESIGN-PFLICHT). svg inline: kein Abruf, scharf auf
 * jeder Dichte.
 *
 * Der US-Laden (Liquid, qi-blanco.com) trägt dieselben Piktogramme in
 * snippets/qb-menue-symbol.liquid. Wer hier ein Piktogramm ändert, ändert es
 * dort mit; website-navigation/bin/navigation stand vergleicht beide.
 */
import {CdnBild} from '~/components/reusables/CdnBild';

const CDN = 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/';

/* Linien-Piktogramme, 24er-Raster, Strich 1.5. Jedes beschreibt seinen Punkt:
   Lupe = prüfen, Tropfen = Wasser, Sprechblase mit Herz = Erfahrungen,
   Buch = Fachartikel, Bildschirm mit Abspielzeichen = Kurse, Person mit Plus =
   mitmachen, Mikrofon = Podcast, Headset = Service, zwei Sprechblasen =
   Gespräch unter vier Augen, Sendezeichen = live. */
const PIKTOGRAMME = {
  lupe: (
    <>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="M15 15l5.5 5.5" />
    </>
  ),
  tropfen: (
    <>
      <path d="M12 3.2c3.2 4.1 6 7.4 6 10.6a6 6 0 0 1-12 0c0-3.2 2.8-6.5 6-10.6z" />
      <path d="M9 14.4c1-.8 2-.8 3 0s2 .8 3 0" />
    </>
  ),
  erfahrung: (
    <>
      <path d="M4 5h16v11H10.5L6.5 19.5V16H4z" />
      <path d="M12 13.4l-2.2-2.1a1.35 1.35 0 0 1 1.95-1.85l.25.25.25-.25a1.35 1.35 0 0 1 1.95 1.85z" />
    </>
  ),
  buch: (
    <>
      <path d="M12 6.5C10.2 5.2 7.8 4.7 4.5 5v12.5c3.3-.3 5.7.2 7.5 1.5 1.8-1.3 4.2-1.8 7.5-1.5V5c-3.3-.3-5.7.2-7.5 1.5z" />
      <path d="M12 6.5V19" />
    </>
  ),
  kurs: (
    <>
      <rect x="3.5" y="4.5" width="17" height="11.5" rx="1.5" />
      <path d="M10.5 7.8v5l4-2.5z" />
      <path d="M9 20h6M12 16v4" />
    </>
  ),
  partner: (
    <>
      <circle cx="9.5" cy="8.5" r="3.5" />
      <path d="M3.5 19.5c.6-3.4 3-5.5 6-5.5s5.4 2.1 6 5.5" />
      <path d="M18.5 8v6M15.5 11h6" />
    </>
  ),
  mikrofon: (
    <>
      <rect x="9" y="3.5" width="6" height="10.5" rx="3" />
      <path d="M6 11.5a6 6 0 0 0 12 0M12 17.5v3M9 20.5h6" />
    </>
  ),
  headset: (
    <>
      <path d="M4.5 14v-2a7.5 7.5 0 0 1 15 0v2" />
      <rect x="3.5" y="13" width="4" height="6" rx="1.5" />
      <rect x="16.5" y="13" width="4" height="6" rx="1.5" />
      <path d="M18.5 19c0 1.2-1.5 2-4 2H13" />
    </>
  ),
  live: (
    <>
      <circle cx="12" cy="12" r="2" />
      <path d="M8.5 15.5a5 5 0 0 1 0-7M15.5 8.5a5 5 0 0 1 0 7M5.6 18.4a9 9 0 0 1 0-12.8M18.4 5.6a9 9 0 0 1 0 12.8" />
    </>
  ),
  gespraech: (
    <>
      <path d="M3.5 4.5h11v8H8.5l-3 2.5v-2.5h-2z" />
      <path d="M17.5 8.5h3v8H19V19l-3-2.5h-5.5v-2" />
    </>
  ),
};

/**
 * Die Zuordnung. `pfade` sind normalisierte Pfade (ohne Host, ohne
 * Sprachpräfix /en, ohne Schrägstrich am Ende), `titel` normalisierte Titel
 * (klein, ohne ®/™, Bindestrich = Leerzeichen).
 */
export const MENUE_SYMBOLE = [
  // Shop — die fünf Produkte
  {pfade: ['/products/qione-2-pro'], titel: ['qione 2 pro'], bild: 'icon-qione.png?v=1760088701'},
  {pfade: ['/products/qibracelet'], titel: ['qibracelet'], bild: 'icon-bracelet.png?v=1760089233'},
  {pfade: ['/products/qihome-air'], titel: ['qihome air'], bild: 'icon-home.png?v=1760089232'},
  {pfade: ['/products/qione-kette'], titel: ['necklace für den qione'], bild: 'icon-necklace.png?v=1760090696'},
  // Freigestellter Awake-Beutel, 129-px-Master, angelegt am 16.10.2026 vom
  // Auftrag 20261016-design-update-s07-folge-menue-crystal-cacao-bild-merge
  // (Christian 15.10.: „crystal cacao tanzt optisch aus der reihe").
  {
    pfade: ['/pages/crystal-cacao', '/pages/kristall-kakao'],
    titel: ['crystal cacao', 'kristall kakao'],
    bild: 'icon-crystal-cacao.png?v=1792177524',
  },
  // Mehr
  {pfade: ['/pages/sprechstunde'], titel: ['1:1 sessions mit christian'], svg: 'gespraech'},
  {pfade: ['/pages/kritik'], titel: ['belege und offene fragen'], svg: 'lupe'},
  {pfade: ['/pages/was-ist-kohaerentes-wasser'], titel: ['deep dive: kohärentes wasser'], svg: 'tropfen'},
  {pfade: ['/pages/erfahrungen'], titel: ['erfahrungen'], svg: 'erfahrung'},
  {pfade: ['/blogs/wissen'], titel: ['fachartikel'], svg: 'buch'},
  {pfade: [], titel: ['online kurse'], svg: 'kurs'},
  {pfade: ['/pages/affiliate-partnerprogramm'], titel: ['partner werden'], svg: 'partner'},
  {pfade: ['/pages/podcasts'], titel: ['podcasts'], svg: 'mikrofon'},
  {pfade: ['/pages/support'], titel: ['service & kontakt'], svg: 'headset'},
  // Live steht seit 19.10.2026 oben; der Eintrag trägt den Rückweg (altes Menü)
  {pfade: ['/pages/live'], titel: ['live'], svg: 'live'},
];

export function normPfad(pfad) {
  if (!pfad || pfad === '#') return '';
  let p = String(pfad).replace(/^https?:\/\/[^/]+/i, '') || '/';
  p = p.split(/[?#]/)[0].toLowerCase();
  p = p.replace(/^\/(en|de)(?=\/|$)/, '');
  if (p.length > 1) p = p.replace(/\/+$/, '');
  return p;
}

export function normTitel(titel) {
  return String(titel || '')
    .toLowerCase()
    .replace(/[®™]/g, '')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * @param {string} pfad   aufgelöstes Ziel (resolveMenuItemLink().to)
 * @param {string} titel  Menütitel
 */
export function symbolFuer(pfad, titel) {
  const p = normPfad(pfad);
  if (p) {
    const nachPfad = MENUE_SYMBOLE.find((s) => s.pfade.includes(p));
    if (nachPfad) return nachPfad;
  }
  const t = normTitel(titel);
  return MENUE_SYMBOLE.find((s) => s.titel.includes(t)) || null;
}

/**
 * Trägt dieses Untermenü eine Symbolspalte? Ja, sobald einer seiner Punkte ein
 * Symbol hat (heute Shop und Mehr). Studien bleibt reine Textliste — die
 * Entscheidung hängt an den Daten, nicht an einem Menünamen.
 */
export function hatSymbolSpalte(items) {
  return (items || []).some((c) => symbolFuer(c?.url, c?.title));
}

/**
 * Ein Symbol in der festen Spalte. Ohne Treffer bleibt die Spalte LEER, aber
 * sie bleibt stehen (`data-symbol="fehlt"`) — so fluchten die Titel weiter,
 * und die Abnahme findet den Punkt ohne Symbol am Marker statt am Augenmaß.
 */
export function MenueSymbol({pfad, titel, groesse = 45}) {
  const s = symbolFuer(pfad, titel);
  if (s && s.bild) {
    return (
      <span className="menue-symbol" data-symbol="bild" style={{width: groesse, height: groesse}}>
        <CdnBild
          breite={groesse}
          hoehe={groesse}
          anzeigeBreite={groesse}
          masterBreite={129}
          src={CDN + s.bild}
          alt=""
        />
      </span>
    );
  }
  if (s && s.svg && PIKTOGRAMME[s.svg]) {
    return (
      <span className="menue-symbol" data-symbol={s.svg} style={{width: groesse, height: groesse}}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          {PIKTOGRAMME[s.svg]}
        </svg>
      </span>
    );
  }
  return <span className="menue-symbol" data-symbol="fehlt" aria-hidden="true" style={{width: groesse, height: groesse}} />;
}

/*
 * ALPHABETISCH, deutsch: Umlaute zählen wie ihr Grundbuchstabe, ß wie ss,
 * Ziffern vor Buchstaben („1:1 Sessions mit Christian" steht vorn).
 * Bewusst ohne Intl.Collator: Server (Oxygen) und Browser müssen
 * byte-gleich dieselbe Reihenfolge rechnen, sonst bricht die Hydration.
 * Die Reihenfolge im Shopify-Admin spielt für „Mehr" deshalb keine Rolle;
 * ein neuer Punkt steht ohne Handgriff an seinem Platz.
 */
export function sortierSchluessel(titel) {
  return String(titel || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ß/g, 'ss')
    .toLowerCase()
    .trim();
}

export function alphabetisch(items) {
  return [...(items || [])].sort((a, b) => {
    const x = sortierSchluessel(a?.title);
    const y = sortierSchluessel(b?.title);
    return x < y ? -1 : x > y ? 1 : 0;
  });
}

/** Der eine Ort, an dem steht, welcher Hauptpunkt „Mehr" ist. */
export function istMehr(item) {
  return normTitel(item?.title) === 'mehr';
}
