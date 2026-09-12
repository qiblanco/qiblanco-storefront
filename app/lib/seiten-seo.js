/**
 * Open Graph und strukturierte Daten der /pages-Klasse (DACH).
 *
 * Reine Datenfabrik ohne React-Import (Node-unit-testbar, wie app/lib/seo.js,
 * produkt-seo.js und blog-seo.js).
 *
 * WARUM ES DIESE DATEI GIBT (Vollzensus der Live-Sitemap am 2026-09-12,
 * Nenner zur Laufzeit erhoben, keine Stichprobe): von 38 indexierbaren
 * /pages-URLs trugen 32 KEIN og:image und 23 KEINE strukturierten Daten.
 * Wer einen dieser Links teilt, bekommt einen nackten Link ohne Bild; eine
 * Suchmaschine sieht einen Textblock, dem niemand sagt, WAS er ist.
 *
 * Produktseiten (produkt-seo.js) und Blog-Artikel (blog-seo.js) haben ihre
 * og-Signale seit August. Die /pages-Klasse hatte KEINEN gemeinsamen Ort
 * dafür — jede Route baute ihr Social-Markup selbst oder gar nicht, und
 * „gar nicht" war der Normalfall. Genau diese fehlende Stelle ist der Fix-Ort:
 * nicht 32 Seiten, sondern eine Funktion und ihre Aufrufer.
 *
 * WARUM NEBEN app/lib/seo.js UND NICHT DARIN — die Begründung ist nicht neu,
 * sie steht wörtlich in den Köpfen von produkt-seo.js und entity-schema.js:
 * seo.js wird von sehr vielen Routen importiert; hb-deploy Gate 12 (Formate)
 * löst eine geänderte geteilte Datei über die Import-Closure auf und verlangt
 * für jede damit erreichte Seite einen gültigen Alle-Formate-Nachweis. Eine
 * Änderung an seo.js zöge damit fremde, unbeteiligte Seiten in die Prüfmenge.
 * Diese Datei wird ausschließlich von den /pages-Routen importiert; ihre
 * Closure ist genau die Klasse, für die sie gebaut ist.
 *
 * WAS SIE AUSDRÜCKLICH NICHT TUT: sie setzt weder <title> noch
 * `name=description` noch den Canonical. Die stehen in jeder Route bereits
 * und folgen dort einer eigenen, begründeten Rangfolge (seiten-beschreibung.js
 * für die Beschreibung, canonicalLink/noindexMeta für die Index-Signale, mit
 * der Regel ENTWEDER noindex ODER canonical). Diese Datei ist ADDITIV — sie
 * hängt an, was fehlt, und fasst nicht an, was steht. Ein Helfer, der die
 * ganze meta-Liste übernimmt, hätte 31 Routen gleichzeitig umgebaut und jede
 * dieser gewachsenen Begründungen mitverhandelt.
 *
 * WARUM ES KEINEN SITE-WEITEN EMITTER IN app/root.jsx GIBT: react-router 7
 * merged `meta` nicht baumweit, der nächste Leaf gewinnt vollständig — ein
 * root-Default käme auf keiner Route an, die selbst ein `meta` exportiert
 * (also auf keiner /pages-Route). Und ein zusätzlicher Emitter NEBEN den
 * Route-Emittern erzeugt Duplikate: genau das ist auf der Startseite schon
 * einmal passiert (zwei og:image aus PR #197 und #198, konfliktfrei gemergt,
 * live doppelt). Die Bauform ist deshalb PRO ROUTE, wie bei #187/#189.
 */

// Bewusst RELATIV statt über den '~'-Alias: der Alias wird nur von Vite
// aufgelöst, nicht von Node. Der hermetische Test (node --test, ohne Bundler)
// könnte diese Datei sonst gar nicht laden.
import {CANONICAL_ORIGIN, absoluteCanonical} from './seo.js';
import {beschreibungTags} from './seiten-beschreibung.js';

/**
 * Marke im og:site_name — dieselbe Schreibweise wie in produkt-seo.js
 * (MARKE) und blog-seo.js (MARKEN_SUFFIX): eine Marke, die in Titel, Schema
 * und Wikidata identisch heißt, ist für Google EINE Entität statt dreier.
 * Bewusst als eigene Konstante und NICHT als Import: ein Import aus
 * produkt-seo.js koppelte die /pages- an die Produkt-Import-Closure.
 */
export const MARKE = 'Qi Blanco';

/**
 * Anker des Entitäts-Graphen. Sie werden hier NEU GEBILDET statt aus
 * app/lib/entity-schema.js importiert, und das ist eine bewusste Ausnahme von
 * „nie zwei Wahrheiten":
 *
 * entity-schema.js sagt in seinem eigenen Kopf: „WER DIESE DATEI SPÄTER VON
 * EINER ZWEITEN ROUTE IMPORTIERT, ZIEHT DEREN SEITE IN DIE CLOSURE." Sie wird
 * heute NUR von app/routes/_index.jsx importiert, ihre Closure ist damit
 * {Startseite}. Würde diese Datei sie importieren, hinge künftig jede Änderung
 * an entity-schema.js an einem gültigen Formate-Nachweis für alle 31
 * /pages-Routen — für einen String, der sich seit seiner Entstehung nicht
 * geändert hat.
 *
 * DIE DRIFT IST TROTZDEM ZUGENAGELT, und zwar an der einzigen Stelle, an der
 * das ohne Closure-Kosten geht: test/seiten-seo.test.mjs importiert BEIDE
 * Dateien und vergleicht die Werte. Weicht einer ab, ist der Test rot. Der
 * gemeinsame Teil — die Domain — wird ohnehin aus seo.js GELESEN, nicht
 * kopiert; ein Domainwechsel zieht beide Seiten automatisch mit.
 */
export const ORG_ID = `${CANONICAL_ORIGIN}/#organization`;
export const SITE_ID = `${CANONICAL_ORIGIN}/#website`;

/**
 * Das Standard-Teilbild der Marke.
 *
 * IDENTISCH zu OG_BILD in app/routes/_index.jsx: dieselbe Datei, dieselbe
 * Größe. Dort steht die ausführliche Begründung, warum es dieses Bild ist und
 * nicht das Shopify-Markenlogo (das ist weiß auf Transparenz; Netzwerke
 * flachen Transparenz auf Weiß ab, es wäre unsichtbar).
 *
 * NATIVGRÖSSE 1024x1024, AM 2026-09-12 AM DATEIKOPF NACHGEMESSEN — und dabei
 * eine Annahme widerlegt, die man sonst übernommen hätte: das Shopify-CDN
 * skaliert mit `?width=` NICHT HOCH, es deckelt nur. `?width=1200` an diesem
 * Bild liefert weiter 1024x1024. Die Breitenangabe ist also kein Mittel,
 * eine Größe zu ERZEUGEN, sondern nur eine, sie zu BEGRENZEN.
 */
export const MARKEN_TEILBILD = {
  url:
    'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/' +
    'qiblanco-com-qione-2-pro-transparent_1.webp?width=1024',
  breite: 1024,
  hoehe: 1024,
  alt: 'QiOne® 2 Pro von Qi Blanco – das Gerät für den Alltag',
};

/**
 * Teilbilder je Seitenpfad.
 *
 * DER SCHLÜSSEL IST DER PFAD, NICHT DER HANDLE — aus demselben Grund wie in
 * seiten-beschreibung.js: ein Handle ist nur innerhalb seiner Familie
 * eindeutig, ein Pfad immer.
 *
 * WORAUS DIE VIER PRODUKTBILDER STAMMEN: es sind EXAKT die Bilder, die die
 * vier Produktseiten live schon als og:image ausliefern (am 2026-09-12 an der
 * Live-Auslieferung von /products/… abgelesen). Eine Detailseite zeigt beim
 * Teilen damit dasselbe Bild wie ihre Kaufseite — statt zwei Bilder für
 * dasselbe Produkt zu pflegen, die auseinanderlaufen.
 *
 * ALLE MASSE SIND GEMESSEN, NICHT GESCHÄTZT (HTTP-Abruf + Dateikopf,
 * 2026-09-12). Das ist nicht pedantisch: `QiHomeAir-Front-Alpha-Web2_1024x1024
 * _741c3ad5….webp` trägt „1024x1024" IM DATEINAMEN und ist real 1024x906. Wer
 * og:image:height aus dem Namen ableitet, gibt eine falsche Zusage ab.
 *
 * KEIN og:image:type: der Content-Type folgt hier NICHT der Dateiendung —
 * dieselben `.webp`-URLs kommen je nach Accept-Header als image/png oder
 * image/jpeg zurück (gemessen 2026-09-12). Ein Feld, dessen Wert sich nicht
 * zuverlässig vorhersagen lässt, ist als Zusage schlechter als sein Fehlen.
 *
 * DIE ALT-TEXTE SIND NICHT ERFUNDEN, sondern aus dem Repo übernommen, wo
 * dasselbe Bild schon mit alt-Text steht (QiBracelet.jsx Z. 301 für die drei
 * Armbänder, MmWirktDas.jsx für den GitterChip). Für ein Bild ohne
 * vorhandenen alt-Text wird keiner geraten — dann bleibt es draußen.
 * @type {Record<string, {url: string, breite: number, hoehe: number, alt: string}>}
 */
export const TEILBILDER = {
  '/pages/qione-2-pro-details': {
    url:
      'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/' +
      'QiOne1.webp?width=1200',
    breite: 1200,
    hoehe: 1200,
    alt: 'QiOne® 2 Pro, Vorderseite mit sichtbarem GitterChip',
  },
  '/pages/qibracelet-details': {
    url:
      'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/' +
      'QiBracelet1.webp?width=1200',
    breite: 1200,
    hoehe: 1200,
    alt: 'Der QiBracelet® von Qi Blanco',
  },
  '/pages/qihome-details': {
    url:
      'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/' +
      'QiHome1.webp?width=1200',
    breite: 1200,
    hoehe: 1200,
    alt: 'Das QiHome® Air von Qi Blanco',
  },
};

// Die Kakao-Familie teilt EIN Bild: die Produktpackung, die auch
// /products/crystal-cacao-create und -awake als og:image ausliefern.
const KAKAO_TEILBILD = {
  url:
    'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/' +
    'Doypack_Mockup__v3-min.png?width=1200',
  breite: 1200,
  hoehe: 1194,
  alt: 'Crystal Cacao® von Qi Blanco in der Standbodenbeutel-Verpackung',
};
for (const pfad of [
  '/pages/crystal-cacao',
  '/pages/was-ist-zeremonie-kakao',
  '/pages/kakao-anwendung',
  '/pages/meditieren-mit-zeremonie-kakao',
  '/pages/intuition-erfahren',
  '/pages/zeremonie-kakao-kurs',
]) {
  TEILBILDER[pfad] = KAKAO_TEILBILD;
}

/**
 * Das Teilbild eines Pfades — kuratiert, sonst das Standardbild der Marke.
 *
 * ES GIBT BEWUSST KEINEN „KEIN BILD"-FALL FÜR INDEXIERBARE SEITEN: das
 * Standardbild ist gepflegt, gemessen und wird von der Startseite seit dem
 * 2026-09-05 ausgeliefert. Der Fall, vor dem die Regel „ein Fallback-Teilbild
 * ist eine Zusage" warnt, ist ein ANDERER — `twitter:card:
 * summary_large_image` OHNE Bild. Genau deshalb steht die Kartenangabe unten
 * in derselben Bedingung wie das Bild und nie daneben.
 * @param {string} pfad
 */
export function teilbild(pfad) {
  return TEILBILDER[pfad] || MARKEN_TEILBILD;
}

/**
 * NUR das Teilbild und die Twitter-Karte — für Routen, die ihre uebrigen
 * og-Tags bereits von Hand setzen.
 *
 * WARUM ES DIESE ZWEITE, KLEINERE FUNKTION GIBT (und nicht einen Schalter an
 * der großen): acht /pages-Routen tragen schon einen vollstaendigen
 * og-Satz — und zwar einen HANDVERLESENEN. `warum-qi-blanco` setzt
 * `og:type: article` statt `website`; `studien` setzt bewusst eine ANDERE
 * og:description als die meta description (die eine zählt die Publikationen
 * auf, die andere nennt die Wirkung). Diesen acht Routen die große Funktion
 * ueberzustuelpen haette genau diese Unterschiede eingeebnet — und zwar
 * still, weil niemand ein verlorenes `article` im Diff sucht.
 *
 * Ihnen fehlte am 2026-09-12 gemessen nur EINES: das Bild. Sie bekommen
 * deshalb nur das Bild. Das ist kein Sonderweg, sondern die Anwendung
 * derselben Regel, die den ganzen Bau trägt — anhängen, was fehlt, nicht
 * anfassen, was steht.
 *
 * @param {string} pfad
 * @returns {Array<object>} meta-Descriptoren für react-router 7
 */
export function teilbildTags(pfad) {
  const bild = teilbild(pfad);
  return [
    {property: 'og:image', content: bild.url},
    {property: 'og:image:width', content: String(bild.breite)},
    {property: 'og:image:height', content: String(bild.hoehe)},
    {property: 'og:image:alt', content: bild.alt},
    // Gedeckt durch das og:image direkt darüber — Begründung an
    // seitenSignale().
    {name: 'twitter:card', content: 'summary_large_image'},
  ];
}

/**
 * Der Seitenname ohne Marken-Suffix — für Brotkrume und schema.org-`name`.
 * „Impressum | Qi Blanco" -> „Impressum", „Qi Blanco | E-Smog" -> „E-Smog".
 * Bleibt nach dem Abschneiden nichts übrig, gewinnt der volle Titel.
 * @param {string|undefined|null} titel
 */
export function kurzName(titel) {
  const roh = (titel || '').trim();
  if (!roh) return MARKE;
  const ohne = roh
    .replace(new RegExp(`\\s*[|–—-]\\s*${MARKE}\\s*$`), '')
    .replace(new RegExp(`^\\s*${MARKE}\\s*[|–—-]\\s*`), '')
    .trim();
  return ohne || roh;
}

/**
 * Open Graph, Twitter-Karte und strukturierte Daten EINER /pages-Seite.
 *
 * Additiv gedacht: das Ergebnis wird an die bestehende meta-Liste einer Route
 * ANGEHÄNGT (`...seitenSignale({…})`), es ersetzt sie nicht.
 *
 * `beschreibung` darf der ROHE Shopify-Wert sein (auch leer/undefined): die
 * Auffanglinie aus seiten-beschreibung.js wird hier mit DERSELBEN Funktion
 * angewandt, die die Route für `name=description` benutzt. Das ist der Punkt
 * und keine Bequemlichkeit — stünden hier zwei Wege zum selben Text, zeigte
 * ein geteilter Link früher oder später etwas anderes als das Suchergebnis
 * (dieselbe Zwei-Versprechen-Falle, die produkt-seo.js für Titel und
 * Beschreibung schon benennt).
 *
 * `hauptknoten: false` für eine Seite, die bereits einen eigenen
 * Seiten-Entitätsknoten ausliefert (FAQPage, AboutPage, CollectionPage,
 * Article …). Dann entsteht KEIN zweiter WebPage-Knoten für dieselbe URL —
 * eine URL hat eine Hauptentität. Die Brotkrume entsteht trotzdem: sie ist
 * kein Seiten-Typ, sondern ein Weg dorthin, und steht auch bei den
 * Produktseiten als eigener Knoten neben dem Product-Knoten
 * (produkt-schema.js, brotkrumeSchema).
 *
 * @param {{pfad: string, titel?: string, beschreibung?: string|null,
 *          hauptknoten?: boolean}} args
 * @returns {Array<object>} meta-Descriptoren für react-router 7
 */
export function seitenSignale({pfad, titel, beschreibung, hauptknoten = true}) {
  const url = absoluteCanonical(pfad);
  const name = kurzName(titel);
  const vollerTitel = (titel || '').trim() || `${name} | ${MARKE}`;
  // IDENTISCH zur Route: dieselbe Funktion, dieselbe Rangfolge. `[0]` ist
  // leer, wenn es nichts zu sagen gibt — dann entsteht auch hier kein Tag.
  const text = beschreibungTags(pfad, beschreibung)[0]?.content;
  const bild = teilbild(pfad);

  const descriptoren = [
    {property: 'og:type', content: 'website'},
    {property: 'og:site_name', content: MARKE},
    {property: 'og:locale', content: 'de_DE'},
    // Muss dem <title> der Route folgen, nicht einem eigenen Rohwert: sonst
    // zeigt ein geteilter Link etwas anderes als das Suchergebnis.
    {property: 'og:title', content: vollerTitel},
    {property: 'og:url', content: url},
    {property: 'og:image', content: bild.url},
    {property: 'og:image:width', content: String(bild.breite)},
    {property: 'og:image:height', content: String(bild.hoehe)},
    {property: 'og:image:alt', content: bild.alt},
    // Die Kartenangabe steht in derselben Liste wie das Bild und ist von ihm
    // gedeckt: `summary_large_image` sagt einem Netzwerk ein großes Bild ZU.
    // Ohne og:image wäre das eine Zusage ohne Deckung — und genau so begründet
    // der Kakao-Laden (crystal-cacao, app/routes/_index.jsx) seine
    // ABWESENHEIT. Hier ist das Bild unbedingt gesetzt, also ist die Zusage
    // gedeckt. Eigene twitter:title/twitter:description entstehen bewusst
    // NICHT: zwei Quellen für denselben Text driften auseinander, X/Twitter
    // fällt dokumentiert auf die og-Tags zurück.
    {name: 'twitter:card', content: 'summary_large_image'},
  ];
  if (text) {
    descriptoren.push({property: 'og:description', content: text});
  }

  if (hauptknoten) {
    const knoten = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      // Eigene @id mit Fragment, damit der Knoten neben einer Brotkrume
      // desselben Dokuments eindeutig adressierbar bleibt.
      '@id': `${url}#webpage`,
      url,
      name,
      inLanguage: 'de-DE',
      isPartOf: {'@id': SITE_ID},
      publisher: {'@id': ORG_ID},
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: bild.url,
        width: bild.breite,
        height: bild.hoehe,
      },
    };
    if (text) knoten.description = text;
    // react-router 7 rendert diesen Descriptor nativ als
    // <script type="application/ld+json"> und maskiert den Inhalt selbst.
    descriptoren.push({'script:ld+json': knoten});
  }

  descriptoren.push({'script:ld+json': brotkrume({pfad, url, name})});
  return descriptoren;
}

/**
 * Brotkrume Startseite -> diese Seite. Zwei Stufen, weil es zwischen der
 * Startseite und einer /pages-Seite keine echte dritte gibt: eine erfundene
 * Zwischenstufe („Seiten") entspricht keinem Link, den ein Besucher je sieht,
 * und eine Brotkrume, die einen nicht existierenden Weg behauptet, ist für
 * Google ein Fehler und kein Signal.
 * @param {{pfad: string, url: string, name: string}} args
 */
export function brotkrume({url, name}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${url}#brotkrume`,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Startseite',
        item: `${CANONICAL_ORIGIN}/`,
      },
      {'@type': 'ListItem', position: 2, name, item: url},
    ],
  };
}
