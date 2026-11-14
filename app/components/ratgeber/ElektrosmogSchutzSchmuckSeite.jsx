import {useRef} from 'react';
import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {useLpPreis, waehrungVon} from '~/lib/lp-preis';
import {bruttoAnzeige, formatPreis} from '~/lib/markt-pricing';
import {absoluteCanonical} from '~/lib/seo';
import {istSchemaSicher} from '~/lib/koerpersperre';
import {useElinaBewegung} from '~/components/reusables/useElinaBewegung';
import {
  ACHTEN,
  BELEG,
  PFAD,
  PRODUKTE,
  SEITE,
  STIMME,
  fragen,
} from '~/data/elektrosmog-schutz-schmuck';

/**
 * Darstellung und strukturierte Daten von /pages/elektrosmog-schutz-schmuck.
 * Inhalt: app/data/elektrosmog-schutz-schmuck.js. Route:
 * app/routes/pages.elektrosmog-schutz-schmuck.jsx (lädt nur Preise und Bilder).
 *
 * NICHT unter app/components/campaign/ (harte Fläche kaufweg): die Seite ist
 * ein Ratgeber, ihre Knöpfe führen per <Link> auf die Kaufseiten, der Kaufweg
 * selbst bleibt dort unberührt.
 *
 * TRACKING-NAHT: keine Cookies, kein neuer Identitäts- oder Tracking-Key,
 * kein eigener Pixel. Die R1/R2/R3-Kette hängt pfad-agnostisch im root-Layout,
 * TRACKING_COOKIE_NAMES bleibt unangetastet.
 *
 * BEWEGUNG (elina-design-regel D1-D7): Baukasten useElinaBewegung. Der Kopf
 * (H1, Antwort) steht ohne Animation da; Karten blenden als Gruppe ein, die
 * Kaufpunkte füllen eine senkrechte Linie, Bilder zoomen minimal. Bei
 * „Bewegung reduzieren" steht alles still (Baukasten + elina-bewegung.css).
 */

/** Anzeigepreis in Euro für die Antworten und das Schema, sonst null. */
export function preisInEuro(products, handle, land = 'DE') {
  const p = (products || []).find((x) => x?.handle === handle);
  if (!p || waehrungVon(p) !== 'EUR') return null;
  return formatPreis(bruttoAnzeige(p.priceRange.minVariantPrice.amount, handle, 'EUR', land), 'EUR');
}

export function preiseFuerFragen(products, land) {
  return {
    qione: preisInEuro(products, 'qione-2-pro', land),
    bracelet: preisInEuro(products, 'qibracelet', land),
  };
}

/**
 * Drei Knoten: CollectionPage mit ItemList der tragbaren Produkte (Seitentyp
 * Kategorie, GEO-Seitenregel R6), FAQPage (nur Fragen, die die Körpersperre
 * passieren, GL-SPR-0008). Die Brotkrume kommt aus seitenSignale() der Route.
 */
export function strukturierteDaten(products = [], land = 'DE') {
  const url = absoluteCanonical(PFAD);
  const liste = {
    '@type': 'ItemList',
    '@id': `${url}#produkte`,
    name: 'Elektrosmog-Schutz zum Tragen',
    numberOfItems: PRODUKTE.length,
    itemListElement: PRODUKTE.map((p, i) => {
      const api = products.find((x) => x?.handle === p.handle);
      const eintrag = {
        '@type': 'ListItem',
        position: i + 1,
        name: `${p.titel} (${p.art})`,
        url: absoluteCanonical(`/products/${p.handle}`),
      };
      if (api?.featuredImage?.url) eintrag.image = api.featuredImage.url;
      return eintrag;
    }),
  };
  const seite = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${url}#seite`,
    url,
    name: SEITE.h1,
    description: SEITE.beschreibung,
    inLanguage: 'de-DE',
    datePublished: SEITE.veroeffentlicht,
    dateModified: SEITE.geaendert,
    publisher: {'@type': 'Organization', name: 'Qi Blanco', url: absoluteCanonical('/')},
    mainEntity: liste,
  };
  const sicher = fragen(preiseFuerFragen(products, land)).filter((f) =>
    istSchemaSicher(`${f.q}\n${f.a}`),
  );
  const faq = sicher.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        '@id': `${url}#fragen`,
        inLanguage: 'de-DE',
        mainEntity: sicher.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: {'@type': 'Answer', text: f.a},
        })),
      }
    : null;
  return [seite, faq].filter(Boolean);
}

function ProduktKarte({produkt, api, preis}) {
  const bild = api?.featuredImage;
  return (
    <li className="ess__karte" id={`produkt-${produkt.handle}`}>
      {bild?.url ? (
        <figure className="ess__bild" data-eb="zoom">
          <Image
            data={{
              url: bild.url,
              altText: bild.altText || `${produkt.titel}, ${produkt.art} von Qi Blanco`,
              width: bild.width,
              height: bild.height,
            }}
            aspectRatio="1/1"
            sizes="(min-width: 768px) 320px, 90vw"
            loading="lazy"
          />
        </figure>
      ) : null}
      <p className="ess__art">{produkt.art}</p>
      <h3>{produkt.titel}</h3>
      <p>{produkt.text}</p>
      <p className="ess__karte-fuss">
        {preis ? <span className="ess__preis">{preis}</span> : null}
        <Link
          className={produkt.haupt ? 'ess__knopf knopf-gold' : 'ess__weiter'}
          data-qa={produkt.haupt ? 'cta' : undefined}
          to={`/products/${produkt.handle}`}
        >
          {produkt.linktext}
        </Link>
      </p>
    </li>
  );
}

export function ElektrosmogSchutzSchmuckSeite({products = [], land = 'DE'}) {
  const wurzel = useRef(null);
  useElinaBewegung(wurzel);
  const {preisLabelVon} = useLpPreis();
  const apiVon = (handle) => products.find((x) => x?.handle === handle) || null;
  const preisVon = (handle) => {
    const p = apiVon(handle);
    return p ? preisLabelVon(p) : null;
  };

  return (
    <div className="ess" ref={wurzel}>
      <section className="ess__kopf" data-section="ess-kopf">
        <div className="ess__inhalt">
          <p className="ess__vorspann">{SEITE.vorspann}</p>
          <h1>{SEITE.h1}</h1>
          {SEITE.antwort.map((absatz, i) => (
            <p className={i === 0 ? 'ess__lead' : undefined} key={absatz.slice(0, 24)}>
              {absatz}
            </p>
          ))}
          <p className="ess__sprung">
            <a href="#produkte">Zur Übersicht</a>
            <a href="#worauf-achten">Worauf achten</a>
            <a href="#fragen">Häufige Fragen</a>
          </p>
        </div>
      </section>

      <section data-section="ess-produkte" id="produkte">
        <div className="ess__inhalt ess__inhalt--breit">
          <h2 data-eb>Armband, Anhänger und Kette im Überblick</h2>
          <ul className="ess__karten" data-eb="gruppe">
            {PRODUKTE.map((p) => (
              <ProduktKarte key={p.handle} produkt={p} api={apiVon(p.handle)} preis={preisVon(p.handle)} />
            ))}
          </ul>
          <p className="ess__quelle">
            Preise tagesaktuell aus unserem Shop. Für deine Räume gibt es das{' '}
            <Link to="/products/qihome-air">QiHome® Air</Link>.
          </p>
        </div>
      </section>

      <section className="ess__achten-teil" data-section="ess-achten" id="worauf-achten">
        <div className="ess__inhalt">
          <h2 data-eb>Worauf achten beim Kauf eines Elektrosmog-Schutzes?</h2>
          <div className="ess__schritte">
            <div className="ess__schiene" data-eb="linie-senkrecht" aria-hidden="true" />
            <ol className="ess__punkte">
              {ACHTEN.map((a) => (
                <li className="ess__punkt" key={a.id} id={`achten-${a.id}`} data-eb>
                  <h3>{a.frage}</h3>
                  <p>{a.text}</p>
                  <p className="ess__punkt-link">
                    <Link to={a.link.to}>{a.link.text}</Link>
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section data-section="ess-beleg" id="belege">
        <div className="ess__inhalt">
          <h2 data-eb>{BELEG.titel}</h2>
          <blockquote className="ess__stimme" data-eb>
            <p>{STIMME.text}</p>
            <p className="ess__quelle">{STIMME.quelle}</p>
          </blockquote>
          <p>{BELEG.material}</p>
          <h3 className="ess__klasse">{BELEG.klasse}</h3>
          <p>{BELEG.zahl}</p>
          <p className="ess__quelle">
            Quelle: <Link to="/pages/studie-immunzellen">Studie Immunzellen</Link>, Japan Journal of
            Medicine, 2021, DOI 10.31488/JJM.165. <Link to="/pages/studien">Alle fünf Arbeiten</Link>
          </p>
          <h3 className="ess__klasse">{BELEG.klasseErfahrung}</h3>
          <p>{BELEG.erfahrung}</p>
          <p className="ess__quelle">
            Quelle: <Link to="/pages/studie-nutzererfahrung">Studie Nutzererfahrung</Link>, 171
            Erfahrungsberichte, 2024
          </p>
          <div className="ess__handlung" data-eb>
            <p>{BELEG.einladung}</p>
            <p className="ess__knoepfe">
              {/* Wortlaut = linktext der Produktkarte: EIN Wortlaut je Ziel-URL
                  (CTA-Einstimmigkeit) und wie die Schwester-Ratgeber ein Weg zur
                  Kaufseite, kein Kaufknopf auf dieser Seite (echtgeraet_probe:
                  Kaufknopf verlangt einen aktiven Knopf am Seitenende). */}
              <Link className="ess__knopf knopf-gold" data-qa="cta" to="/products/qione-2-pro">
                {PRODUKTE.find((p) => p.handle === 'qione-2-pro')?.linktext}
              </Link>
              <Link className="ess__weiter" to="/products/qibracelet">
                {PRODUKTE.find((p) => p.handle === 'qibracelet')?.linktext}
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section className="ess__fragen-teil" data-section="ess-fragen" id="fragen">
        <div className="ess__inhalt">
          <h2 data-eb>Häufige Fragen</h2>
          <dl className="ess__fragen">
            {fragen(preiseFuerFragen(products, land)).map((f) => (
              <div className="ess__frage" key={f.id} id={f.id}>
                <dt>{f.q}</dt>
                <dd>{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </div>
  );
}
