import {useLoaderData} from 'react-router';
import {INHALT} from '~/components/campaign/longevity-guide-2027-inhalt.de';
import {buildFaqPageJsonLd} from '~/lib/faq-schema';
import {canonicalLink, absoluteCanonical, CANONICAL_ORIGIN} from '~/lib/seo';
import {seitenSignale, teilbild, MARKE, ORG_ID} from '~/lib/seiten-seo';
import guideStyles from '~/styles/longevity-guide-2027.css?url';

/**
 * /pages/best-wearables-for-longevity-2027 — „Die besten Wearables für
 * Longevity (Guide 2027)", Global Deutsch-Shop.
 *
 * Christian, 27.10.2026: eine Guide-Seite, die Qi Blanco als Longevity-Tool
 * einordnet — „reines Messen ist nett, aber wirkliche Verbesserung entsteht,
 * wenn man aktiv was in den Zellen ändert". Eigner des Wortlauts ist der
 * PR-Manager (Grossjob 20261027-pr-page-best-wearables-longevity-2027-
 * messen-vs-zelle, s01); diese Route gestaltet nur. Der Text kommt 1:1 aus
 * ~/components/campaign/longevity-guide-2027-inhalt.de.js (= guide.json "de").
 *
 * NUR-ROUTE-SEITE: es gibt kein Shopify-Seitenobjekt. Indexierbar, mit
 * eigenem Canonical. Die hreflang-Gegenseite (qi-blanco.com, gleicher Pfad)
 * entsteht im Segment s03; das Paar gehört in shop-switch/shop-mapping.yaml,
 * sobald BEIDE Seiten 200 liefern (root.jsx setzt hreflang zentral).
 *
 * STRUKTURIERTE DATEN: Article + FAQPage + ItemList + BreadcrumbList.
 * Das FAQPage-Schema läuft durch buildFaqPageJsonLd und damit durch dessen
 * Deny-Netz: die Frage zum Gitterchip nennt „kohärentes Wasser" und bleibt
 * deshalb sichtbar, aber ohne Auszeichnung (Hausregel faq-schema.js).
 *
 * RÜCKWEG: hb-deploy revert --sha <merge> nimmt Route, CSS und Inhalt zurück.
 */

const PFAD = '/pages/best-wearables-for-longevity-2027';
const VEROEFFENTLICHT = '2026-10-27';

export function links() {
  return [{rel: 'stylesheet', href: guideStyles}];
}

export const meta = () => {
  const url = absoluteCanonical(PFAD);
  return [
    {title: INHALT.seo_title},
    {name: 'description', content: INHALT.meta_description},
    canonicalLink(PFAD),
    ...seitenSignale({
      pfad: PFAD,
      titel: INHALT.seo_title,
      beschreibung: INHALT.meta_description,
      hauptknoten: false,
    }),
    {'script:ld+json': artikelSchema(url)},
    ...faqEintrag(),
    {'script:ld+json': vergleichSchema(url)},
  ];
};

function artikelSchema(url) {
  const bild = teilbild(PFAD);
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${url}#artikel`,
    headline: INHALT.hero.h1,
    description: INHALT.meta_description,
    inLanguage: 'de-DE',
    datePublished: VEROEFFENTLICHT,
    dateModified: VEROEFFENTLICHT,
    author: {'@type': 'Organization', '@id': ORG_ID, name: MARKE},
    publisher: {'@id': ORG_ID},
    mainEntityOfPage: url,
    image: bild.url,
  };
}

function faqEintrag() {
  const schema = buildFaqPageJsonLd(
    INHALT.faq.fragen.map((f) => ({q: f.frage, a: f.antwort})),
    {
      inLanguage: 'de-DE',
      author: MARKE,
      datePublished: VEROEFFENTLICHT,
      dateModified: VEROEFFENTLICHT,
    },
  );
  return schema ? [{'script:ld+json': schema}] : [];
}

/** ItemList in der Reihenfolge der Vergleichstabelle. */
function vergleichSchema(url) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${url}#vergleich`,
    name: INHALT.vergleich.h2,
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    numberOfItems: INHALT.vergleich.zeilen.length,
    itemListElement: INHALT.vergleich.zeilen.map((z, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: z.wearable,
      ...(z.link ? {url: `${CANONICAL_ORIGIN}${z.link}`} : {}),
    })),
  };
}

export async function loader({context}) {
  let data = {};
  try {
    data = await context.storefront.query(GUIDE_PRODUKTE_QUERY, {
      cache: context.storefront.CacheShort(),
    });
  } catch (fehler) {
    // Ohne Bilder bleibt die Seite vollständig lesbar: die Karten zeigen
    // dann nur Text. Kein 500er für einen Ratgeber.
    console.error(
      '[longevity-guide-2027] Produkt-Query fehlgeschlagen:',
      fehler?.message || fehler,
    );
  }
  const bilder = {};
  for (const p of Object.values(data || {})) {
    if (p?.handle && p.featuredImage?.url) {
      bilder[`/products/${p.handle}`] = p.featuredImage;
    }
  }
  // Der Qi Alpha trägt in der Storefront-API kein Hauptbild (gemessen
  // 27.10.2026); seine Kaufseite zeigt dieses Frontbild
  // (the-alpha-shop-daten.js, KOPF.bilder[0]).
  for (const [pfad, bild] of Object.entries(ERSATZBILD)) {
    if (!bilder[pfad]) bilder[pfad] = bild;
  }
  return {bilder};
}

export default function LongevityGuide2027() {
  const {bilder} = useLoaderData();
  const G = INHALT;
  return (
    <div className="lg27">
      <header className="lg27-hero">
        <div className="lg27-wrap lg27-hero__inner">
          <p className="lg27-eyebrow">{G.hero.eyebrow}</p>
          <h1 className="lg27-hero__titel">{G.hero.h1}</h1>
          <p className="lg27-hero__lead">{G.hero.lead}</p>
          <p className="lg27-hero__sublead">{G.hero.sublead}</p>
          <div className="lg27-hero__ctas">
            <a className="lg27-btn" href={G.hero.cta_primaer.ziel}>
              {G.hero.cta_primaer.text}
            </a>
            <a
              className="lg27-btn lg27-btn--zweit"
              href={G.hero.cta_sekundaer.ziel}
            >
              {G.hero.cta_sekundaer.text}
            </a>
          </div>
        </div>
      </header>

      <section
        className="lg27-sek lg27-sek--flaeche"
        aria-labelledby="lg27-kurz"
      >
        <div className="lg27-wrap lg27-schmal">
          <h2 id="lg27-kurz">{G.kurz_gesagt.h2}</h2>
          {G.kurz_gesagt.text.map((t) => (
            <p key={t} className="lg27-text-lead">
              {t}
            </p>
          ))}
        </div>
      </section>

      <section className="lg27-sek" aria-labelledby="lg27-kategorien">
        <div className="lg27-wrap">
          <h2 id="lg27-kategorien">{G.zwei_kategorien.h2}</h2>
          <div className="lg27-kategorien">
            {G.zwei_kategorien.karten.map((k, i) => (
              <article
                key={k.titel}
                className={`lg27-kategorie${i === 1 ? ' lg27-kategorie--wirken' : ''}`}
              >
                <h3>{k.titel}</h3>
                <p className="lg27-kategorie__unter">{k.untertitel}</p>
                <p>{k.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="lg27-sek lg27-sek--flaeche"
        aria-labelledby="lg27-kriterien"
      >
        <div className="lg27-wrap">
          <h2 id="lg27-kriterien">{G.kriterien.h2}</h2>
          <ol className="lg27-kriterien">
            {G.kriterien.punkte.map((p, i) => (
              <li key={p.titel} className="lg27-kriterium">
                <span className="lg27-kriterium__nr" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3>{p.titel}</h3>
                <p>{p.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        className="lg27-sek"
        id={G.vergleich.anker}
        aria-labelledby="lg27-vergleich"
      >
        <div className="lg27-wrap">
          <h2 id="lg27-vergleich">{G.vergleich.h2}</h2>
          {/* Scrollbare Tabelle: per Tastatur erreichbar (axe scrollable-region-focusable). */}
          <div
            className="lg27-tabelle"
            role="region"
            aria-labelledby="lg27-vergleich"
            // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
            tabIndex={0}
          >
            <table>
              <thead>
                <tr>
                  {G.vergleich.spalten.map((s) => (
                    <th key={s} scope="col">
                      {s}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {G.vergleich.zeilen.map((z) => (
                  <tr
                    key={z.wearable}
                    className={
                      z.kategorie === 'Wirken' ? 'lg27-zeile--wirken' : ''
                    }
                  >
                    <th scope="row">
                      {z.link ? <a href={z.link}>{z.wearable}</a> : z.wearable}
                    </th>
                    <td>
                      <span
                        className={`lg27-marke lg27-marke--${z.kategorie === 'Wirken' ? 'wirken' : 'messen'}`}
                      >
                        {z.kategorie}
                      </span>
                    </td>
                    <td>{z.tut}</td>
                    <td>{z.zielgruppe}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section
        className="lg27-sek lg27-sek--flaeche"
        aria-labelledby="lg27-messend"
      >
        <div className="lg27-wrap">
          <h2 id="lg27-messend">{G.messende_geraete.h2}</h2>
          <p className="lg27-einleitung">{G.messende_geraete.einleitung}</p>
          <div className="lg27-tracker-raster">
            {G.messende_geraete.liste.map((g) => (
              <article key={g.name} className="lg27-tracker">
                <h3>{g.name}</h3>
                <p>{g.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="lg27-sek"
        id={G.aktiv_wirken.anker}
        aria-labelledby="lg27-wirken"
      >
        <div className="lg27-wrap">
          <h2 id="lg27-wirken">{G.aktiv_wirken.h2}</h2>
          <p className="lg27-einleitung">{G.aktiv_wirken.einleitung}</p>
          <div className="lg27-produkte">
            {G.aktiv_wirken.produkte.map((p) => (
              <ProduktKarte key={p.name} p={p} bild={bilder[p.link]} />
            ))}
          </div>
          <a className="lg27-zuhause" href={G.aktiv_wirken.zuhause.link}>
            <span className="lg27-zuhause__name">
              {G.aktiv_wirken.zuhause.name}
            </span>
            <span>{G.aktiv_wirken.zuhause.text}</span>
          </a>
        </div>
      </section>

      <section
        className="lg27-sek lg27-sek--flaeche"
        aria-labelledby="lg27-belege"
      >
        <div className="lg27-wrap">
          <h2 id="lg27-belege">{G.belege.h2}</h2>
          <div className="lg27-belege">
            {G.belege.karten.map((b) => (
              <figure key={b.titel} className="lg27-beleg">
                <figcaption className="lg27-beleg__titel">{b.titel}</figcaption>
                <p className="lg27-beleg__zahl">{b.zahl}</p>
                <p className="lg27-beleg__quelle">{b.quelle}</p>
              </figure>
            ))}
          </div>
          <p className="lg27-belege__fuss">
            {G.belege.fusszeile}{' '}
            <a href={G.belege.link.ziel}>{G.belege.link.text}</a>
          </p>
        </div>
      </section>

      <section className="lg27-sek" aria-labelledby="lg27-kombi">
        <div className="lg27-wrap">
          <h2 id="lg27-kombi">{G.kombinieren.h2}</h2>
          <p className="lg27-einleitung">{G.kombinieren.text}</p>
          <dl className="lg27-ziele">
            {G.kombinieren.ziele.map((z) => (
              <div key={z.ziel} className="lg27-ziel">
                <dt>{z.ziel}</dt>
                <dd>{z.kombination}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section
        className="lg27-sek lg27-sek--flaeche"
        aria-labelledby="lg27-faq"
      >
        <div className="lg27-wrap lg27-schmal">
          <h2 id="lg27-faq">{G.faq.h2}</h2>
          <div className="lg27-faq">
            {G.faq.fragen.map((f) => (
              <details key={f.frage} className="lg27-frage">
                <summary>
                  <h3>{f.frage}</h3>
                </summary>
                <p>{f.antwort}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section
        className="lg27-sek lg27-sek--dunkel"
        aria-labelledby="lg27-abschluss"
      >
        <div className="lg27-wrap lg27-schmal">
          <h2 id="lg27-abschluss">{G.abschluss.h2}</h2>
          <p className="lg27-text-lead">{G.abschluss.text}</p>
          <a className="lg27-btn" href={G.abschluss.cta.ziel}>
            {G.abschluss.cta.text}
          </a>
        </div>
      </section>

      <section
        className="lg27-sek lg27-sek--quellen"
        aria-labelledby="lg27-quellen"
      >
        <div className="lg27-wrap lg27-schmal">
          <h2 id="lg27-quellen">Quellen</h2>
          <ol className="lg27-quellen">
            {G.quellen.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}

function ProduktKarte({p, bild}) {
  return (
    <article className="lg27-produkt">
      <div className="lg27-produkt__bild">
        {bild ? (
          <img
            src={bild.url}
            alt={ALT[p.link] || p.name}
            width={bild.width || 720}
            height={bild.height || 720}
            loading="lazy"
            decoding="async"
          />
        ) : null}
      </div>
      <h3>{p.name}</h3>
      <p className="lg27-produkt__nutzen">{p.nutzen}</p>
      <p>{p.text}</p>
      <a className="lg27-btn lg27-btn--zweit" href={p.link}>
        {p.cta}
      </a>
    </article>
  );
}

/**
 * Alt-Texte je Produktkarte: eigene statt der Shopify-Bildtexte, weil diese
 * am 27.10.2026 für QiOne® 2 Pro und QiBracelet® „Aluminium" nennen, während
 * die Kaufseiten Chirurgenstahl 316L führen (gemeldet im RESULT von s02).
 */
const ALT = {
  '/products/qione-2-pro': 'QiOne® 2 Pro Anhänger, Vorderseite',
  '/products/qibracelet': 'QiBracelet® offener Armreif, Vorderansicht',
  '/products/qione-kette': 'Necklace, Kette für den QiOne®',
  '/products/qi-alpha':
    'Qi Alpha®, Vorderseite mit Diamant in goldener Fassung',
};

const ERSATZBILD = {
  '/products/qi-alpha': {
    url: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qi-alpha-01-front.jpg?v=1792849253&width=720',
    width: 720,
    height: 720,
  },
};

const GUIDE_PRODUKTE_QUERY = `#graphql
  fragment GuideProdukt on Product {
    handle
    featuredImage {
      url(transform: {maxWidth: 720, maxHeight: 720})
      altText
      width
      height
    }
  }

  query LongevityGuideProdukte($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    qione: product(handle: "qione-2-pro") {
      ...GuideProdukt
    }
    bracelet: product(handle: "qibracelet") {
      ...GuideProdukt
    }
    kette: product(handle: "qione-kette") {
      ...GuideProdukt
    }
    alpha: product(handle: "qi-alpha") {
      ...GuideProdukt
    }
  }
`;
