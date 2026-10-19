import {redirect} from 'react-router';
import {SprechstundeSeite} from '~/components/campaign/SprechstundeSeite';
import sprechstundeStyles from '~/styles/sprechstunde.css?url';
import {canonicalLink, absoluteCanonical} from '~/lib/seo';
import {MARKE, teilbildTags} from '~/lib/seiten-seo';
import {ORG_ID} from '~/lib/entity-schema';
import {buyerIpAusRequest} from '~/lib/interner-verkehr';
import {
  getAttributionCartAttributes,
  getOriginCartAttributes,
  getTrackedCheckoutUrl,
  hasAttributionConsent,
} from '~/lib/cart-attribution.server';
import {
  COOKIE_TICKET,
  COOKIE_VERWALTEN,
  basis,
  cookieWert,
  holeJson,
  holeMitWiederholung,
  istFluechtig,
  setzeCookie,
  termineBrauchbar,
  ticketCode,
} from '~/lib/sprechstunde-abruf.server';

/**
 * /pages/sprechstunde — Sprechstunde mit Christian: eine Stunde 1:1 per Zoom,
 * freitags 20 Uhr in Christians Ortszeit, Ticket 300 EUR.
 *
 * Grossjob 20261019-GROSSJOB-sprechstunde-mit-christian-ticket-300-eur-freitags-
 * 20-uhr-buchung-live-unter-mehr, Segment s05 (Christian 19.10.2026, Konzept
 * shared-state/sprechstunde/konzept/KONZEPT.md Abschnitte 2, 2a und 5).
 * Muster: pages.produktberatung.jsx (Loader mit zweitem Versuch, Token im
 * Cookie) und cart.$lines.jsx (Warenkorb anlegen, Tracking mitnehmen, weiter
 * in die Kasse).
 *
 * DER KALENDER IST NICHT HIER. Freitage, Sperre gegen Doppelbuchung, Tickets,
 * Zoom und Mails leben im Sprechstunden-Dienst (shared-state/sprechstunde,
 * öffentlich über Caddy). Diese Route ist nur die Tür.
 *
 * KAUFWEG: Freitag wählen -> Angaben -> „Ticket kaufen" (POST, intent
 * reservieren). Die Action reserviert den Freitag 30 Minuten beim Dienst, legt
 * einen NEUEN Warenkorb mit genau der Ticket-Zeile an (Zeilenattribute
 * _sp_reservierung, Termin, Name unverändert aus der Antwort des Dienstes; der
 * Takt erkennt die Buchung allein an _sp_reservierung) und leitet in die
 * Shopify-Kasse. Ein neuer Warenkorb wie bei cart.$lines.jsx: das Ticket wird
 * eine eigene Bestellung, ohne Versand und ohne andere Ware daneben.
 * Scheitert der Warenkorb, gibt die Action die Reservierung sofort frei.
 *
 * TRACKING-NAHT: dieselben Warenkorb-Attribute wie der Kassenweg
 * cart.$lines.jsx (Herkunft immer, Klick-IDs nur mit Einwilligung) und
 * dieselbe Kassen-Adresse (getTrackedCheckoutUrl). Kein neuer Identitäts- oder
 * Tracking-Key, TRACKING_COOKIE_NAMES bleibt unberührt. Die Kunden-IP geht nur
 * als X-SP-Kunde-IP an den eigenen Dienst (Deckel je Kundin statt je
 * Oxygen-Knoten, KONZEPT 2a).
 *
 * ZWEI MAIL-LINKS, KEIN TOKEN IN DER ADRESSE: ?b=<token> (Verwalten) und
 * ?ticket=<code> (Freitag wählen) tauscht der Loader gegen HttpOnly-Cookies und
 * leitet mit 303 auf ?verwalten=1 bzw. ?einloesen=1 um
 * (lib/sprechstunde-abruf.server.js). Die Kalenderdatei kommt über
 * ?verwalten=1&kalender=1 aus demselben Loader.
 *
 * BUCHUNG ZU (SP_BUCHUNG_MODE=off im Dienst, Zoom aus): die Freitage bleiben
 * sichtbar, statt des Formulars steht „Die Buchung öffnet in Kürze." Kein
 * toter Knopf. Geschaltet wird im Dienst, nicht hier.
 *
 * FÄLLT DER DIENST AUS, RENDERT DIE SEITE TROTZDEM, mit dem Satz, dass die
 * Freitage gerade nicht laden, und der Service-Adresse. Kein 500.
 *
 * SICHTBARKEIT: canonical, Sitemap über NUR_ROUTE_SEITEN (app/lib/seo.js),
 * Menüpunkt „1:1 Sessions mit Christian" unter Mehr (website-navigation).
 * Persönliche Ansichten (?verwalten, ?einloesen) tragen noindex.
 * AD-WEICHE: Pfad in AUSSCHLUSS_SEGMENTE (app/lib/ad-weiche.server.js).
 *
 * TESTUMGEBUNG: Env SPRECHSTUNDE_API lenkt auf einen Wegwerf-Endpunkt um.
 */

/** Hier und nicht aus der .server-Datei: meta() und JSON-LD laufen auch im Browser-Bundle. */
const PFAD = '/pages/sprechstunde';

const NICHT_ERREICHBAR =
  'Das hat gerade nicht geklappt. Bitte versuch es gleich noch einmal oder schreib uns an service@qiblanco.com.';
const KASSE_FEHLT =
  'Der Warenkorb ließ sich gerade nicht anlegen. Bitte versuch es gleich noch einmal oder schreib uns an service@qiblanco.com.';

export function links() {
  return [{rel: 'stylesheet', href: sprechstundeStyles}];
}

/** Persönliche Daten und frische Freitage: nie in einem Zwischenspeicher. */
export const headers = () => ({'Cache-Control': 'private, no-store'});

function weiter(ziel, cookies = []) {
  const h = new Headers({'Cache-Control': 'private, no-store'});
  for (const c of cookies) h.append('Set-Cookie', c);
  h.set('Location', ziel);
  return new Response(null, {status: 303, headers: h});
}

/** Gemeinsame Felder aus einer Antwort mit termine_antwort() des Dienstes. */
function angebot(body) {
  return {
    termine: Array.isArray(body?.termine) ? body.termine : [],
    buchungMoeglich: Boolean(body?.buchung_moeglich),
    preisText: body?.preis_text || '300 EUR',
    vorzeitigVorUtc: body?.vorzeitig_vor_utc || '',
    anliegenMin: Number(body?.anliegen_min) || 20,
  };
}

export async function loader({request, context}) {
  const url = new URL(request.url);
  const api = basis(context);
  const status = (url.searchParams.get('status') || '').trim();

  // Mail-Links: Token und Code in den Cookie, Adresse ohne sie.
  const ausLink = (url.searchParams.get('b') || '').trim();
  if (ausLink) {
    const s = ['gebucht', 'umgebucht'].includes(status) ? `&status=${status}` : '';
    throw weiter(`${PFAD}?verwalten=1${s}`, [
      setzeCookie(COOKIE_VERWALTEN, ausLink.slice(0, 200)),
    ]);
  }
  if (url.searchParams.has('ticket')) {
    const code = ticketCode(url.searchParams.get('ticket'));
    throw weiter(`${PFAD}?einloesen=1`, [setzeCookie(COOKIE_TICKET, code)]);
  }

  const kopf = {headers: {Accept: 'application/json'}};
  const basisDaten = {ansicht: 'buchen', status, ladeFehler: false};

  if (url.searchParams.has('verwalten')) {
    const token = cookieWert(request, COOKIE_VERWALTEN);
    if (!token) {
      return {
        ...basisDaten,
        ...angebot(null),
        ansicht: 'verwalten',
        fehler:
          'Öffne bitte den Link aus deiner Bestätigungsmail noch einmal, dann siehst du deinen Termin.',
      };
    }
    if (url.searchParams.get('kalender') === '1') {
      const res = await fetch(
        `${api}/api/buchung?t=${encodeURIComponent(token)}&ics=1`,
      ).catch(() => null);
      if (!res || res.status !== 200)
        throw new Response('Die Kalenderdatei lädt gerade nicht.', {
          status: 503,
          headers: {'Cache-Control': 'no-store'},
        });
      return new Response(await res.text(), {
        status: 200,
        headers: {
          'Content-Type': 'text/calendar; charset=utf-8',
          'Content-Disposition':
            'attachment; filename="sprechstunde-qiblanco.ics"',
          'Cache-Control': 'private, no-store',
        },
      });
    }
    const r = await holeMitWiederholung(
      `${api}/api/buchung?t=${encodeURIComponent(token)}`,
      kopf,
      (x) => !istFluechtig(x),
    );
    if (r.status === 200 && r.body?.ok) {
      return {
        ...basisDaten,
        ...angebot(r.body),
        ansicht: 'verwalten',
        buchung: r.body.buchung,
        umbuchenMoeglich: Boolean(r.body.umbuchen_moeglich),
      };
    }
    return {
      ...basisDaten,
      ...angebot(null),
      ansicht: 'verwalten',
      ladeFehler: istFluechtig(r),
      fehler:
        r.body?.text ||
        'Dein Termin lädt gerade nicht. Bitte versuch es gleich noch einmal oder schreib uns an service@qiblanco.com.',
    };
  }

  if (url.searchParams.has('einloesen')) {
    const code = cookieWert(request, COOKIE_TICKET);
    if (!code) {
      return {
        ...basisDaten,
        ...angebot(null),
        ansicht: 'einloesen',
        fehler:
          'Öffne bitte den Link aus deiner Ticket-Mail noch einmal oder gib deinen Ticketcode unten ein.',
      };
    }
    const r = await holeMitWiederholung(
      `${api}/api/ticket?code=${encodeURIComponent(code)}`,
      kopf,
      (x) => !istFluechtig(x),
    );
    if (r.status === 200 && r.body?.ok) {
      return {
        ...basisDaten,
        ...angebot(r.body),
        ansicht: 'einloesen',
        ticket: r.body.ticket,
        einloesbar: Boolean(r.body.einloesbar),
        hinweis: r.body.text || '',
        buchung: r.body.buchung || null,
        vorzeitigVorUtc:
          r.body.ticket?.vorzeitig_vor_utc || r.body.vorzeitig_vor_utc || '',
      };
    }
    return {
      ...basisDaten,
      ...angebot(null),
      ansicht: 'einloesen',
      ladeFehler: istFluechtig(r),
      fehler:
        r.body?.text ||
        'Dein Ticket lädt gerade nicht. Bitte versuch es gleich noch einmal oder schreib uns an service@qiblanco.com.',
    };
  }

  const r = await holeMitWiederholung(
    `${api}/api/termine`,
    kopf,
    termineBrauchbar,
  );
  if (termineBrauchbar(r)) return {...basisDaten, ...angebot(r.body)};
  return {...basisDaten, ...angebot(null), ladeFehler: true};
}

const FELDER = ['name', 'email', 'telefon', 'anliegen'];

export async function action({request, context}) {
  const form = await request.formData();
  const intent = String(form.get('intent') || '');
  const api = basis(context);
  const kopf = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-SP-Kunde-IP': buyerIpAusRequest(request),
  };
  const post = (weg, body) =>
    holeJson(
      `${api}${weg}`,
      {method: 'POST', headers: kopf, body: JSON.stringify(body)},
      15000,
    );
  const ja = (k) => ['1', 'on', 'ja', 'true'].includes(String(form.get(k)));
  const tz = String(form.get('tz') || '').slice(0, 64);
  const start = String(form.get('start_utc') || '');

  if (intent === 'reservieren') {
    const eingabe = Object.fromEntries(
      FELDER.map((k) => [k, String(form.get(k) || '').slice(0, 2000)]),
    );
    if (!start)
      return {intent, ok: false, text: 'Wähl bitte zuerst einen Freitag.', eingabe};
    const r = await post('/api/reservieren', {
      ...eingabe,
      start_utc: start,
      tz,
      zustimmung_bedingungen: ja('zustimmung_bedingungen'),
      zustimmung_vorzeitig: ja('zustimmung_vorzeitig'),
      website: String(form.get('website') || ''),
    });
    if (r.status === 200 && r.body?.ok && !r.body.reservierung) {
      // Honigtopf: der Dienst reserviert nicht und sagt nichts. Die Seite auch nicht.
      return {intent, ok: true, eingabe: {}};
    }
    const w = r.body?.warenkorb;
    const resId = r.body?.reservierung?.id;
    if (!(r.status === 200 && r.body?.ok && w?.variante_gid && resId)) {
      return {
        intent,
        ok: false,
        text: r.body?.text || NICHT_ERREICHBAR,
        code: r.body?.code || '',
        eingabe,
      };
    }
    const {cart, env} = context;
    const einwilligung = hasAttributionConsent(request, env);
    const attribute = [
      ...getOriginCartAttributes(request),
      ...(einwilligung ? getAttributionCartAttributes(request) : []),
    ];
    let angelegt = null;
    try {
      angelegt = await cart.create({
        lines: [
          {
            merchandiseId: w.variante_gid,
            quantity: 1,
            attributes: (w.attribute || []).map(({key, value}) => ({
              key: String(key),
              value: String(value),
            })),
          },
        ],
        ...(attribute.length ? {attributes: attribute} : {}),
      });
    } catch {
      angelegt = null;
    }
    const neu = angelegt?.cart;
    if (!neu?.checkoutUrl || angelegt?.errors?.length || !neu.totalQuantity) {
      await post('/api/reservierung/freigeben', {reservierung_id: resId});
      return {intent, ok: false, text: KASSE_FEHLT, eingabe};
    }
    const h = cart.setCartId(neu.id);
    h.set('Cache-Control', 'private, no-store');
    const kasse = einwilligung
      ? getTrackedCheckoutUrl(neu.checkoutUrl, request, env)
      : neu.checkoutUrl;
    return redirect(kasse, {status: 303, headers: h});
  }

  if (intent === 'einloesen') {
    const code = cookieWert(request, COOKIE_TICKET);
    if (!code)
      return {
        intent,
        ok: false,
        text: 'Öffne bitte den Link aus deiner Ticket-Mail noch einmal.',
      };
    if (!start)
      return {intent, ok: false, text: 'Wähl bitte zuerst einen Freitag.'};
    const r = await post('/api/einloesen', {
      code,
      start_utc: start,
      tz,
      anliegen: String(form.get('anliegen') || '').slice(0, 2000),
      zustimmung_vorzeitig: ja('zustimmung_vorzeitig'),
    });
    if (r.status === 200 && r.body?.ok && r.body.t) {
      throw weiter(`${PFAD}?verwalten=1&status=gebucht`, [
        setzeCookie(COOKIE_VERWALTEN, r.body.t),
        setzeCookie(COOKIE_TICKET, ''),
      ]);
    }
    return {intent, ok: false, text: r.body?.text || NICHT_ERREICHBAR};
  }

  if (intent === 'umbuchen') {
    const t = cookieWert(request, COOKIE_VERWALTEN);
    if (!start)
      return {intent, ok: false, text: 'Wähl bitte zuerst einen neuen Freitag.'};
    const r = await post('/api/umbuchen', {t, start_utc: start});
    if (r.status === 200 && r.body?.ok && r.body.t) {
      // Das alte Token zeigt danach auf die umgebuchte Buchung: weiter auf das NEUE.
      throw weiter(`${PFAD}?verwalten=1&status=umgebucht`, [
        setzeCookie(COOKIE_VERWALTEN, r.body.t),
      ]);
    }
    return {intent, ok: false, text: r.body?.text || NICHT_ERREICHBAR};
  }
  return {intent, ok: false, text: NICHT_ERREICHBAR};
}

/**
 * Titel: Hauptgegenstand und Kundenwort zuerst (GEO R3), Marke am Ende.
 * Beschreibung: die Fakten der Seite (GEO R4), in Christians Worten.
 */
const TITEL = 'Sprechstunde mit Christian: 1:1 per Zoom | Qi Blanco';
const BESCHREIBUNG =
  'Ein sehr tiefes Gespräch mit Christian, auf Basis des Jetzt. Eine Stunde live per Zoom, ein Termin pro Woche am Freitag, Ticket 300 EUR.';

/** @type {MetaFunction<typeof loader>} */
export const meta = ({location}) => {
  const such = new URLSearchParams(location?.search || '');
  const persoenlich = ['verwalten', 'einloesen', 'b', 'ticket'].some((k) =>
    such.has(k),
  );
  return [
    {title: TITEL},
    {name: 'description', content: BESCHREIBUNG},
    canonicalLink(PFAD),
    ...(persoenlich ? [{name: 'robots', content: 'noindex, nofollow'}] : []),
    ...teilbildTags(PFAD),
    {property: 'og:type', content: 'website'},
    {property: 'og:title', content: TITEL},
    {property: 'og:description', content: BESCHREIBUNG},
    {property: 'og:url', content: absoluteCanonical(PFAD)},
    {property: 'og:site_name', content: MARKE},
  ];
};

function jsonLd() {
  const url = absoluteCanonical(PFAD);
  const graph = [
    {
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: 'Sprechstunde mit Christian',
      description: BESCHREIBUNG,
      inLanguage: 'de',
      isPartOf: {'@type': 'WebSite', url: absoluteCanonical('/')},
      breadcrumb: {'@id': `${url}#breadcrumb`},
      mainEntity: {'@id': `${url}#service`},
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Start',
          item: absoluteCanonical('/'),
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Sprechstunde mit Christian',
          item: url,
        },
      ],
    },
    {
      '@type': 'Service',
      '@id': `${url}#service`,
      name: 'Sprechstunde mit Christian',
      serviceType: '1:1 Gespräch per Zoom',
      description:
        'Eine Stunde 1:1 mit Christian live per Zoom, freitags, ein Termin pro Woche.',
      url,
      provider: {'@type': 'Organization', '@id': ORG_ID, name: MARKE},
      areaServed: [
        {'@type': 'Country', name: 'DE'},
        {'@type': 'Country', name: 'AT'},
        {'@type': 'Country', name: 'CH'},
      ],
      availableLanguage: 'de',
      offers: {
        '@type': 'Offer',
        price: '300',
        priceCurrency: 'EUR',
        url,
      },
    },
  ];
  return JSON.stringify({'@context': 'https://schema.org', '@graph': graph}).replace(
    /</g,
    '\\u003c',
  );
}

export default function SprechstundeRoute() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: jsonLd()}}
      />
      <SprechstundeSeite />
    </>
  );
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
