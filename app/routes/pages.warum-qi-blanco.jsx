import {AbsichtSeite} from '~/components/campaign/AbsichtSeite';
import {ABSICHT, ABSENDER} from '~/data/absicht';
import {canonicalLink, absoluteCanonical, CANONICAL_ORIGIN} from '~/lib/seo';
import {ORGANISATION, ORG_ID, SITE_ID, MARKEN_PROFILE} from '~/lib/entity-schema';
import absichtStyles from '~/styles/absicht.css?url';

/**
 * /pages/warum-qi-blanco — DIE ABSICHT. LIVE UND AUSDRÜCKLICH CRAWLBAR.
 *
 * Auftrag: 20260911-BAU-die-absicht-warum-es-qi-blanco-gibt-zitierfaehig-und-
 * crawlbar (Christian, 2026-09-11, wörtlich: „Ich glaub, so was wär richtig
 * wichtig — so eine Absicht, warum es Qi Blanco überhaupt gibt, und und und.
 * Ich glaub, das ist zum jetzigen Zeitpunkt sehr, sehr wichtig, und glaub ich
 * auch für eine KI könnte das von zentraler Bedeutung sein.").
 *
 * ---------------------------------------------------------------------------
 * WARUM DIESE SEITE CRAWLBAR IST, OBWOHL IHRE NACHBARIN ES NICHT IST
 * ---------------------------------------------------------------------------
 * /pages/hypothesen steht auf noindex und bleibt es, bis Christian sie
 * freigibt. Diese Seite hier ist die AUSDRÜCKLICHE Ausnahme davon, und der
 * Grund ist inhaltlich, nicht technisch: die Hypothesenseite trägt
 * Wirkaussagen, die geprüft werden müssen. Diese Seite trägt keine einzige —
 * sie sagt, WARUM jemand an einer Frage arbeitet. Genau dafür ist sie gebaut.
 *
 * Der Anlass ist gemessen und keine Vermutung: Googles KI-Antwort zu uns
 * zitiert NULL eigene Quellen von sechs. Eine Maschine, die beantworten soll,
 * was Qi Blanco ist und warum es das gibt, findet bei uns Produkttexte und
 * Preise — aber keinen Satz, den sie zitieren kann. Also zitiert sie andere.
 * Eine ausgesprochene Absicht ist genau die Art Text, die zitiert wird:
 * zurechenbar, datiert, in der ersten Person, nicht verkaufend.
 *
 * ---------------------------------------------------------------------------
 * DIE VIER BEDINGUNGEN DER ZITIERFÄHIGKEIT — alle vier werden gemessen
 * ---------------------------------------------------------------------------
 * (1) ZURECHENBAR: `author` ist eine benannte PERSON mit `worksFor` auf die
 *     Organisation, nicht die Marke. Ein Text ohne Absender ist Werbematerial;
 *     ein Text mit Absender ist eine Quelle. Genau daran scheitert unsere
 *     heutige Sichtbarkeit.
 * (2) DATIERT: `datePublished` im JSON-LD UND ein sichtbares <time> im Text.
 *     Eine Aussage ohne Datum kann eine Maschine nicht einordnen.
 * (3) ORGANISATION: `publisher` per @id auf den EINEN Organisationsknoten aus
 *     app/lib/entity-schema.js. Der Knoten wird NICHT gedoppelt — zwei Knoten
 *     mit derselben Identität und verschiedenen Feldern sind genau die Drift,
 *     die eine Entitätsauflösung ruiniert (Begründung dort im Kopf).
 * (4) KEIN VERKAUFSTEXT: kein Preis, kein Kaufaufruf, kein Rabatt, kein
 *     Produkt als Zweck. Arm G der Wache misst das am ausgelieferten HTML.
 *
 * ---------------------------------------------------------------------------
 * SITEMAP — DIE FALLE, DIE MAN HIER NICHT SIEHT
 * ---------------------------------------------------------------------------
 * Die Sitemap entsteht aus der Shopify-Page-Liste. Eine reine Code-Route hat
 * kein Page-Objekt und kommt dort baulich NIE hinein — sie wäre live, hätte
 * HTTP 200 und stünde bei keiner Suchmaschine angemeldet. Das ist äußerlich
 * nicht davon zu unterscheiden, dass alles stimmt. Der Bestand hat dafür
 * bereits einen Weg: `NUR_ROUTE_SEITEN` in app/lib/seo.js (Nachtrag-Liste des
 * Sitemap-Bauers). Diese Seite steht dort mit Begründung und ihrer Wache —
 * nicht in einer zweiten, neuen Liste (P10).
 *
 * ---------------------------------------------------------------------------
 * KEIN LOADER: der Inhalt ist ein committetes Datenmodul (app/data/absicht.js).
 * Oxygen läuft am Edge und kann shared-state zur Laufzeit nicht lesen —
 * dieselbe Bauform wie /pages/kritik und /pages/erfahrungen.
 *
 * TRACKING-NAHT: diese Seite setzt KEINE Cookies, führt KEINEN neuen
 * Identitäts- oder Tracking-Key ein und enthält keinen eigenen Pixel. Die
 * R1/R2/R3-Kette hängt pfad-agnostisch im root-Layout; TRACKING_COOKIE_NAMES
 * bleibt unangetastet. Es gibt an dieser Route keine Bereichsgrenze, über die
 * ein Schlüssel verloren gehen könnte, und keinen Kaufweg zu messen.
 *
 * WACHE: homepage-bauer/pruefungen/probe_absicht_am_kundenrand.py
 * (sieben Arme, je eigener Marker, am ausgelieferten HTML).
 */

const PFAD = '/pages/warum-qi-blanco';

const TITEL = 'Warum es Qi Blanco gibt — die Absicht dahinter | Qi Blanco';

/**
 * Meta-Beschreibung. Sie sagt, was die Seite IST (eine Absicht in der ersten
 * Person) und was sie NICHT ist (ein Verkaufstext) — unter der
 * Snippet-Kappung von ~155 Zeichen.
 */
const BESCHREIBUNG =
  'Christian Bernd Bauer über zwanzig Jahre zwischen Ingenieurwesen, ' +
  'Metaphysik und Esoterik — warum es Qi Blanco gibt. Kein Verkaufstext, ' +
  'eine Absicht.';

export function links() {
  return [{rel: 'stylesheet', href: absichtStyles}];
}

/**
 * JSON-LD dieser Seite.
 *
 * `Article` und nicht `AboutPage`: Es ist ein zusammenhängender, datierter
 * Text EINER Person — genau die Form, die ein zitierendes System als Quelle
 * erkennt. `AboutPage` (so baut /pages/ueber-uns) beschreibt dagegen eine
 * Organisation; dort ist die Person der Verantwortliche, hier ist sie der
 * AUTOR. Das ist derselbe Mensch in zwei verschiedenen Rollen, und die
 * Auszeichnung muss die richtige nennen.
 *
 * `sameAs` an der Person steht bewusst NICHT: MARKEN_PROFILE sind die Profile
 * der MARKE, nicht die eines Menschen. Sie an eine Person zu hängen wäre eine
 * Identitätsbehauptung, die wir nicht belegen können — und ein falsches
 * sameAs kostet mehr Vertrauen, als ein fehlendes an Reichweite kostet
 * (Begründung im Kopf von app/lib/entity-schema.js). Die Marken-Profile
 * hängen deshalb an der ORGANISATION, wo sie hingehören.
 */
function absichtSchema() {
  const url = absoluteCanonical(PFAD);
  const personId = `${url}#person`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${url}#artikel`,
        url,
        mainEntityOfPage: url,
        headline: ABSICHT.titel,
        description: BESCHREIBUNG,
        inLanguage: 'de',
        isPartOf: {'@id': SITE_ID},
        author: {'@id': personId},
        publisher: {'@id': ORG_ID},
        datePublished: ABSENDER.stand,
        dateModified: ABSENDER.stand,
        about: {'@id': ORG_ID},
      },
      {
        '@type': 'Person',
        '@id': personId,
        name: ABSENDER.name,
        jobTitle: 'Geschäftsführer',
        worksFor: {'@id': ORG_ID},
        // Anschrift der Gesellschaft — dieselbe Quelle wie /pages/ueber-uns
        // (§ 18 Abs. 2 MStV nennt genau sie). Eine Privatanschrift stünde
        // hier nicht und wäre auch nicht belegt.
        address: {
          '@type': 'PostalAddress',
          streetAddress: ORGANISATION.streetAddress,
          postalCode: ORGANISATION.postalCode,
          addressLocality: ORGANISATION.addressLocality,
          addressCountry: ORGANISATION.addressCountry,
        },
      },
      {
        '@type': 'Organization',
        '@id': ORG_ID,
        sameAs: MARKEN_PROFILE.map((p) => p.url),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#brotkrume`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Startseite',
            item: `${CANONICAL_ORIGIN}/`,
          },
          {'@type': 'ListItem', position: 2, name: ABSICHT.titel, item: url},
        ],
      },
    ],
  };
}

/** @type {MetaFunction} */
export const meta = () => [
  {title: TITEL},
  {name: 'description', content: BESCHREIBUNG},
  // Die Autorenangabe auch als klassisches Meta — nicht jede Maschine, die
  // zitiert, wertet JSON-LD aus.
  {name: 'author', content: ABSENDER.name},
  canonicalLink(PFAD),
  {property: 'og:type', content: 'article'},
  {property: 'og:site_name', content: 'Qi Blanco'},
  {property: 'og:locale', content: 'de_DE'},
  {property: 'og:title', content: TITEL},
  {property: 'og:description', content: BESCHREIBUNG},
  {property: 'og:url', content: absoluteCanonical(PFAD)},
  {'script:ld+json': absichtSchema()},
];

export default function WarumQiBlanco() {
  return <AbsichtSeite />;
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
