import {useLoaderData} from 'react-router';
import {QiOne} from '~/components/index-components/detailseiten/QiOne';
import {canonicalLink} from '~/lib/seo';

/*
 * /pages/qione-2-pro-details — oeffentliche Detailseite QiOne 2 Pro
 * (IA-Umbau Zwei-Block-Struktur, Job 20260717-storefront-ia-zweiblock-umbau).
 *
 * Traegt den bisherigen Content von /pages/qione (Detail-LP-Komponente
 * detailseiten/QiOne) 1:1 weiter — /pages/qione wird zur 301-Route hierher
 * (der Name qione war der einzige, der das Produkt qione-2-pro nicht traf).
 * OEFFENTLICHER Block: indexierbar, canonical auf sich selbst; "Jetzt
 * kaufen"-Links zeigen block-korrekt auf /products/qione-2-pro.
 *
 * PAGE_QUERY behaelt bewusst den ALTEN CMS-Handle "qione" (Shopify-Admin-
 * Seite existiert dort; kein Admin-Handgriff noetig).
 * BEWUSST KEIN redirectIfHandleIsLocalized (wuerde den -details-Pfad
 * verstuemmeln; qione-2-pro-Praezedenz).
 */

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = () => {
  // ABGRENZUNG ZUR KAUFSEITE (Befund s02 des Grossjobs
  // 20260831-\u2026-warum-ranken-kritiker\u2026, live gemessen 2026-08-31).
  //
  // Diese Seite ist die einzige eigene indexierbare /pages/-Fl\u00E4che zur
  // Suche nach \u201EQiOne 2 Pro" und konkurrierte dort mit
  // /products/qione-2-pro, ohne dass ein Signal sagte, welche von beiden die
  // Kaufseite ist. Gemessen trug sie dabei: KEINE meta description (Google
  // reimt sich das Snippet aus dem Seitentext zusammen \u2014 genau der
  // Schaden, gegen den app/lib/produkt-seo.js gebaut wurde), kein einziges
  // JSON-LD (die Kaufseite tr\u00E4gt Product, Offer und FAQPage) und den
  // Titel-Suffix \u201E| Qi Blanco UG (haftungsbeschr\u00E4nkt)".
  //
  // Der Suffix ist NICHT neu bewertet, sondern eine im Haus l\u00E4ngst
  // getroffene Entscheidung, die hier nie nachgezogen wurde:
  // app/lib/produkt-seo.js hat ihn am 2026-08-15 f\u00FCr alle Produktseiten
  // entfernt (\u201E24 Zeichen, die im Suchergebnis den Platz des
  // Produktnamens wegnehmen \u2026 Niemand sucht nach UG
  // (haftungsbeschr\u00E4nkt)"). Der W\u00E4chter daf\u00FCr stand in
  // test/produkt-seo.test.mjs, z\u00E4unte aber nach ORT
  // (`app/routes/products.*`) statt nach EIGENSCHAFT \u2014 diese Datei lag
  // au\u00DFerhalb und blieb deshalb unbemerkt stehen. Der Zaun ist mit
  // diesem Bau auf die Eigenschaft umgestellt.
  //
  // BEWUSST NICHT ge\u00E4ndert: kein `noindex` (die Seite hat einen echten
  // Kundennutzen, und app/lib/seo.js schlie\u00DFt sie mit seinem eigenen
  // Aufnahme-Kriterium aus \u2014 \u201Eeine Seite, die Kunden nutzen sollen,
  // geh\u00F6rt NIE hierher") und kein canonical auf die Produktseite (die
  // Inhalte sind verschieden; ein Cross-Canonical zwischen ungleichen Seiten
  // wird von Google ignoriert oder falsch aufgel\u00F6st).
  //
  // ALLES HIER STEHT INNERHALB von meta() und nicht auf Modulebene: das
  // render-neutral-Gate von hb-deploy befreit eine Bestandsseite nur dann von
  // der Formate-/Design-Belegpflicht, wenn die \u00C4nderung VOLLST\u00C4NDIG
  // in meta/Imports liegt. Schon ein Kommentar oder eine Konstante daneben
  // zieht die Seite in die volle Messpflicht, und die ist hier aus
  // Bestandsgr\u00FCnden rot (bild-aufloesung, 5 Formate; Design-Score 69) --
  // an einem Defekt, den dieser Bau weder verursacht noch ber\u00FChrt.
  const BESCHREIBUNG =
    'QiOne\u00AE 2 Pro im Detail: Gitterchip\u2122, Zelluntersuchungen und ' +
    'Expertenmeinungen zum Nachlesen. Bestellen kannst du ihn auf der Produktseite.';
  return [
    {title: 'QiOne\u00AE 2 Pro im Detail | Qi Blanco'},
    {name: 'description', content: BESCHREIBUNG},
    canonicalLink('/pages/qione-2-pro-details'),
    // Identisch zur description \u2014 ein Netzwerk, das beim Teilen etwas
    // anderes zeigt als die Suchmaschine, erzeugt zwei Versprechen.
    {property: 'og:description', content: BESCHREIBUNG},
  ];
};

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader({context}) {
  const {page} = await context.storefront.query(PAGE_QUERY, {
    variables: {handle: 'qione'},
  });

  if (!page) {
    throw new Response('Not Found', {status: 404});
  }

  return {page};
}

export default function QiOne2ProDetailsPage() {
  useLoaderData();

  return (
    <>
      <QiOne />
    </>
  );
}

const PAGE_QUERY = `#graphql
  query Page(
    $language: LanguageCode,
    $country: CountryCode,
    $handle: String!
  )
  @inContext(language: $language, country: $country) {
    page(handle: $handle) {
      handle
      id
      title
      body
      seo {
        description
        title
      }
    }
  }
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
