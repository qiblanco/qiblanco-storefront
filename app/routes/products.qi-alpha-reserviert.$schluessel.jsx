import {redirect} from 'react-router';
import {loader as kaufseitenLoader} from './products.qi-alpha';
import {reservierungZu} from '~/lib/qi-alpha-reservierung';
import {RESERVIERUNGEN} from '~/lib/qi-alpha-reservierungen.server';

/*
 * PREMIUM-KUNDEN-CHECKOUT /products/qi-alpha-reserviert/<schlüssel>
 * (Christian 01.11.2026, Job 20261101-prio2-qi-alpha-premium-checkout-
 * reservierte-nummern-links): „dass sie dann im Prinzip auf einem eigenen
 * Checkout-Bereich kommen, der 1:1 ist wie der andere auch. Also dass es
 * gespiegelt ist, außer eben diese Buttons.“
 *
 * SPIEGEL, KEINE KOPIE: Seite, Stil und Daten sind die von /products/qi-alpha
 * (default + links aus products.qi-alpha.jsx, deren Loader liefert Produkt und
 * Add-ons). Dazu kommt nur `reservierung` — dann zeigt TheAlphaShop oben die
 * reservierte(n) Nummer(n) mit Namen und darunter die freie Auswahl. Jede
 * Änderung an der Kaufseite gilt hier sofort mit.
 *
 * UNBEKANNTER ODER ENTFERNTER SCHLÜSSEL: 302 auf die normale Kaufseite. Wer
 * einen Link rät, landet im Shop, sieht aber keine reservierte Nummer.
 *
 * NICHT INDEXIERT: noindex,nofollow im HTML, kein canonical, nicht in der
 * Sitemap (der Pfad ist nur über den persönlichen Link erreichbar).
 */
export {default, links} from './products.qi-alpha';

/** @type {MetaFunction<typeof loader>} */
export const meta = ({data}) => [
  {title: `${data?.product?.title ?? 'Qi Alpha®'} | Qi Blanco`},
  {name: 'robots', content: 'noindex,nofollow'},
];

/** @param {LoaderFunctionArgs} args */
export async function loader(args) {
  const url = new URL(args.request.url);
  const reservierung = reservierungZu(RESERVIERUNGEN, args.params.schluessel);
  if (!reservierung) {
    throw redirect('/products/qi-alpha', 302);
  }
  // Der Loader der Kaufseite prüft seinen Pfad (eine Schreibweise, 301). Er
  // bekommt deshalb die Anfrage unter ihrer Adresse, mit derselben Abfrage
  // und denselben Köpfen (Cookies, Markt).
  const kaufUrl = new URL(`/products/qi-alpha${url.search}`, url);
  const daten = await kaufseitenLoader({
    ...args,
    request: new Request(kaufUrl, args.request),
  });
  return {...daten, reservierung};
}

/** @typedef {import('react-router').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
