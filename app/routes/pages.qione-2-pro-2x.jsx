import {getSelectedProductOptions} from '@shopify/hydrogen';
import {PRODUCT_QUERY} from '~/lib/qioneProductQuery';
import {TenYearsDealPage} from '~/components/campaign/TenYearsDealPage';
import {getTenYearsDealByHandle} from '~/data/ten-years-deals';
import {StudienSlider} from '~/components/reusables/StudienSlider';
import {GitterchipMoleculesScrub} from '~/components/reusables/GitterchipMoleculesScrub';
import {InfoSlider} from '~/components/index-components/InfoSlider';
import tenYearsDealStyles from '~/styles/ten-years-deal-page.css?url';
import {withEuLabel} from '~/components/EuGewaehrleistungsLabel';

/*
 * Campaign-PDP /pages/qione-2-pro-2x — die 2er-Set-Fortsetzung der Paid-Strecke
 * (Ad → LP → Campaign-PDP). Sie ersetzt das Preis-Klon-Produkt „Sale: 2x
 * QiOne® 2 Pro" (Handle jhsdhze783, ARCHIVED, Tag gorgias_do_not_recommend)
 * durch den referenzierenden Ansatz aus Konzept „Shopseite nach LP" (2026-07-16,
 * Kap. 5 Lean-Produkt-Management): EIN Produkt (qione-2-pro), referenziert statt
 * dupliziert; der Set-Preis entsteht über einen Automatic Discount am Warenkorb,
 * NICHT über ein zweites Produkt.
 *
 * INHALT (EL-20260724-9b18d2ba, Elinas Inhalts-Korrektur): Design und Copy
 * 1:1 von der tatsächlichen Aktionsseite (TenYearsDealPage, wie sie
 * /products/jhsdhze783 trug) — 10-Jahre-Jubiläums-Thema, Countdown,
 * limitiert-Hinweis, Jubiläums-Kampagnenbezug. NICHT die generische
 * Produktseite. Korrigiert wurde NUR die bekannte Problemstelle: der
 * BF24-Resttitel („Black Friday Sale: …" → „10 Jahre Jubiläums Sale") und
 * die Kauf-Referenz (kanonisches qione-2-pro × 2 statt Klon-Variante des
 * ARCHIVED-Produkts; Set-Preis kommt vom Automatic Discount 166,40 € netto).
 *
 * HANDLE-KOLLISION: Die statische Code-Route `pages.qione-2-pro-2x.jsx` schlägt
 * `pages.$handle` UND ein etwaiges Shopify-Admin-Page-Objekt mit demselben
 * Handle (Code-Route gewinnt im Router). Deshalb bewusst KEIN Admin-Page-Objekt
 * „qione-2-pro-2x" anlegen (Sitemap-/noindex-Falle, Konzept Kap. 4).
 */

export function links() {
  return [{rel: 'stylesheet', href: tenYearsDealStyles}];
}

/*
 * noindex, nofollow (D-006): Campaign-Seite gehört NICHT in den Index, darf aber
 * über Traffic bekannt werden. Doppelgate Meta-robots + X-Robots-Tag (Gurt +
 * Hosenträger). BEWUSST KEIN canonical (noindex + fremdes canonical =
 * widersprüchliche Signale). robots.txt bleibt unangetastet.
 * @type {MetaFunction}
 */
export const meta = () => [
  {title: '2x QiOne® 2 Pro — 10 Jahre Jubiläums Sale | Qi Blanco'},
  {name: 'robots', content: 'noindex,nofollow'},
];

/** @type {HeadersFunction} */
export const headers = () => ({'X-Robots-Tag': 'noindex, nofollow'});

/*
 * Loader: geteilte PRODUCT_QUERY als EXISTENZ-GUARD (Handle hart „qione-2-pro",
 * das EINE kanonische Produkt) — die Deal-Seite selbst rendert aus der
 * Deal-Config, aber ohne kaufbares Kanon-Produkt wäre die Seite eine tote
 * Kaufstrecke und soll ehrlich 404 liefern statt still kaputt zu verkaufen.
 *
 * BEWUSST KEIN redirectIfHandleIsLocalized: der Helper würde bei einem
 * lokalisierten Handle auf /pages/<lokalisiert> umleiten — dieser Pfad existiert
 * als Code-Route NICHT und liefe in eine 404-Falle.
 *
 * @param {LoaderFunctionArgs} args
 */
export async function loader({context, request}) {
  const {product} = await context.storefront.query(PRODUCT_QUERY, {
    variables: {
      handle: 'qione-2-pro',
      selectedOptions: getSelectedProductOptions(request),
    },
    cache: context.storefront.CacheShort(),
  });

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  return {product};
}

/*
 * KEIN Pixel-Code in dieser Route (0-Pixel-Regel, D-006): AddToCart feuert
 * automatisch als Cart-Event (routen-unabhängig, mit der echten Set-Menge);
 * R1/R2/R3 hängen im root-Layout. Ein zusätzlicher fbq/gtag hier wäre
 * Doppelzählung. (Parität zur bisherigen Aktionsseite /products/jhsdhze783,
 * die denselben TenYearsDealPage-Baum ohne Route-Pixel trug.)
 */
/*
 * SEKTIONS-KARTE (Elina-Wunsch 2026-07-27, von Christian freigegeben; reine
 * Layout-Änderung, kein Preis-/Rechte-Bezug, kein Produkt-Duplikat):
 * Alle drei Bausteine sind REFERENZEN auf die geteilten Vorlagen, keine
 * Kopien — eine künftige Änderung am Original schlaegt hier automatisch
 * durch. Deshalb steht die Karte hier an der Route und nicht im Deal-Baum:
 * die uebrigen drei frequency-Deals (734husd8hh, sale-qibracelet,
 * sale-qihome-air) bleiben dadurch unveraendert.
 *
 *  1. studien       StudienSlider = dieselbe Vorlage wie /pages/exclusive-solutions
 *                   (seit heute app/components/reusables/StudienSlider.jsx).
 *                   Die Überschrift der Sektion bleibt stehen — der Wunsch
 *                   tauscht die DARSTELLUNG der Studien, und ein ersatzloser
 *                   Wegfall wäre eine Inhalts-Löschung. Sie steht bewusst
 *                   hier im Slot: so ist sie ohne Eingriff am geteilten Baum
 *                   änderbar, falls Elina sie doch anders will.
 *  2. wasserzustand GitterchipMoleculesScrub = dieselbe Vorlage wie
 *                   /products/qione-2-pro, ersetzt „Der Superzustand des Wassers".
 *  3. nachDealRail  InfoSlider = das geteilte Drei-Themen-Karussell
 *                   (Erholsame Nächte / Starkes Wohlbefinden / Klarer Kopf)
 *                   von /products/qione-2-pro, direkt hinter der Deal-Rail.
 *
 * dataSection-Praefix j2x-* = Watch-/Heatmap-Anker dieser Seite
 * (hb-heatmap-sync pflegt die sektion_registry daraus).
 */
function QiOne2Pro2xShopRoute() {
  const deal = getTenYearsDealByHandle('jhsdhze783');
  return (
    <TenYearsDealPage
      deal={deal}
      sektionen={{
        nachDealRail: <InfoSlider dataSection="j2x-drei-themen" />,
        wasserzustand: (
          <GitterchipMoleculesScrub dataSection="j2x-gitterchip-video" />
        ),
        studien: (
          <>
            <h2 className="text-center">
              Wirkung an menschlichen Zellen bestätigt!
            </h2>
            <StudienSlider dataSection="j2x-studien-kacheln" />
          </>
        ),
      }}
    />
  );
}

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').HeadersFunction} HeadersFunction */

/*
 * EU-Gewährleistungslabel: Overlay + Trigger hängen an DIESER Route,
 * nicht am globalen Seitengerüst (Elina EL-20260901-3fb38a2a).
 */
export default withEuLabel(QiOne2Pro2xShopRoute);
