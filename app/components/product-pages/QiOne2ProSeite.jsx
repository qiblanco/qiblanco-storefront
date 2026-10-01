import {QiOneBuyBox, QiOneBenefitList} from '~/components/product-pages/QiOneBuyBox';
import QiOne2Pro from '~/components/product-pages/QiOne2Pro';
import {GitterchipMoleculesScrub} from '~/components/reusables/GitterchipMoleculesScrub';
import {GoogleRezensionenBereich} from '~/components/reusables/GoogleRezensionenBereich';
import {EuGewaehrleistungsListenpunkt} from '~/components/EuGewaehrleistungsLabel';
import {KaufZusagePunkte} from '~/components/reusables/KaufZusage';
import {IgTestimonialSlideshow} from '~/components/reusables/IgTestimonialSlideshow';
import igStyles from '~/styles/ig-testimonials.css?url';
import {StarRating, SterneSprung} from '~/components/reusables/StarRating';
import pdpQiStyles from '~/styles/pdp-qi.css?url';
import produktVideoStyles from '~/styles/produkt-videos.css?url';
import {ProduktVideoKachel} from '~/components/reusables/ProduktVideos';
import amazonstilStyles from '~/styles/amazonstil.css?url';
import {Geraetevergleich, Kundenfragen} from '~/components/reusables/AmazonStil';
import {amazonstilAn, teileFragen} from '~/components/reusables/amazonstil-daten';
import {BLOCK_LP, BLOCK_PUBLIC} from '~/components/reusables/blockLinks';
import {FAQ_QIONE_2_PRO} from '~/data/product-faqs';

/*
 * DIE SEITE /products/qione-2-pro UND IHR LP-SPIEGEL /pages/qione-2-pro —
 * EINE KOMPONENTE (Christian 28.09.2026: "diese Shopseiten ... bitte auch
 * anpassen auf das Niveau von /products/qione-2-pro, d.h. die Seiten sind
 * gleich bis auf den Beschreibungstext oben beim Produkt").
 *
 * Bis zum 28.09.2026 gab es zwei Fassungen (Rumpf in der Route
 * products.qione-2-pro.jsx, Nachbau in QiOne2ProShop.jsx), und der Spiegel
 * blieb hinter der Produktseite zurück: keine Instagram-Stimmen, kein
 * Gerätevergleich, keine Kundenfragen. Seitdem rendern BEIDE Routen diese
 * Komponente; was hier geändert wird, gilt auf beiden.
 *
 * Was je Route verschieden bleibt, steht in der ROUTE, nicht hier:
 *   - meta/headers: /products indexierbar mit Produkt-Auszeichnung,
 *     /pages noindex,nofollow (Doppelgate) ohne canonical.
 *   - Loader: /products mit Localize-Redirect, /pages mit hartem Handle.
 * Was die Route hier hereingibt:
 *   - beschreibung: der Text oben am Produkt (die EINZIGE sichtbare
 *     Abweichung).
 *   - block: BLOCK_LP auf /pages -> Karten und Vergleich verlinken die
 *     Geschwister-Landeziele, die CTAs springen auf die Buy-Box dieser Seite
 *     (Zwei-Block-IA, reusables/blockLinks.js, Wache selftest_zweiblock.py).
 *   - ankerId/anker: Sprungziel und data-section-Messanker des Spiegels
 *     (verhaltens-schicht sektion_registry.yaml: shopq-buybox,
 *     shopq-gitterchip-video, shopq-reputon-reviews). Unsichtbar; die
 *     organische PDP bleibt anker-frei.
 * Die Stylesheets der Seite liefert qiOne2ProSeiteLinks() an beide links().
 */

/*
 * ZWEI route-gebundene Stylesheets — zwei Gründe, keines ersetzt das andere.
 *
 * MERGE-NOTIZ (2026-09-12): dieser Block war ein echter Konflikt. PR #376
 * (IG-Testimonial-Slideshow) und PR #377 (Token-Schicht pdp-qi) haben
 * unabhängig voneinander je einen links()-Export an genau diese Stelle
 * geschrieben; aufgelöst wird additiv.
 *
 * - ig-testimonials.css (PR #376): Slideshow-Fläche, steht auf vier
 *   Kaufseiten. Setzt ihre Token bewusst auf `.qb-igt` statt auf `:root` —
 *   ein Route-Stylesheet mit :root-Token wäre auf jeder anderen Route
 *   undefiniert, und `var(--x)` ohne Rückfall kippt dort still in Vererbung.
 * - pdp-qi.css (PR #377): Token-Schicht genau der zwei Flaggschiff-
 *   Kaufseiten (Score 59 -> 84 bzw. 56 -> 83), innen zusätzlich auf `main`
 *   gescoped. Jeder ihrer Selektoren trifft hier gemessen (h2,
 *   .NormalSectionSize, .snap-start, .HeroBannerAlt, main img) — der
 *   Entfall-Grund von zweifel-beleg.css oben ("Stylesheet für eine Klasse,
 *   die es hier nicht mehr gibt") spricht also nicht gegen diese Zeile,
 *   sondern verlangt genau diese Prüfung.
 *
 * REIHENFOLGE IST TRAGEND: pdp-qi.css steht HINTER ig-testimonials.css.
 * Beide sind ungelayert; bei gleicher Spezifität gewinnt die später
 * geladene. pdp-qi.css setzt den EINEN H2-Stil dieser Seite und braucht
 * deshalb die letzte Stimme — die Slideshow-Überschrift ist genau der Fall,
 * den Commit 765faef schon einmal auf die H2-Regel der Gastgeber-Seite
 * zurückgeholt hat.
 */
export function qiOne2ProSeiteLinks() {
  return [
    {rel: 'stylesheet', href: igStyles},
    {rel: 'stylesheet', href: pdpQiStyles},
    // Video-Kachel im Vorschaustreifen + Video-Dialog (Maßnahme „Produktseite,
    // die verkauft“, 26.09.2026). Eigene Klassen (.qb-pv-*), berührt keinen
    // Selektor von pdp-qi.css — die Reihenfolge darüber bleibt tragend.
    {rel: 'stylesheet', href: produktVideoStyles},
    // Gerätevergleich + Kundenfragen (Amazon-Stil Stufe 2, s04, 27.09.2026).
    // Eigene Klassen (.qb-gv-*, .qb-kf-*); beide Schalter aus = keine Zeile.
    ...(amazonstilAn('qione-2-pro') ? [{rel: 'stylesheet', href: amazonstilStyles}] : []),
  ];
}

/**
 * @param {{
 *   product: object,
 *   vergleichsPreise?: object,
 *   beschreibung: import('react').ReactNode,
 *   block?: string,
 *   ankerId?: string,
 *   anker?: {buybox?: string, gitterchip?: string, rezensionen?: string},
 * }} props
 */
export function QiOne2ProSeite({
  product,
  vergleichsPreise,
  beschreibung,
  block = BLOCK_PUBLIC,
  ankerId = 'product',
  anker = {},
}) {
  const lp = block === BLOCK_LP;
  // Kundenfragen oben, der Rest bleibt in der FAQ unten (Regel und
  // Reihenfolge in amazonstil-daten.js). Schalter aus: oben leer, unten die
  // unveränderte Liste.
  const fragen = teileFragen('qione-2-pro', FAQ_QIONE_2_PRO);

  // Buy-Box-Struktur (Bilder + Preis + Varianten + ATC + Analytics) lebt
  // geteilt in QiOneBuyBox (Query-SSoT-Bau T1). Beide Routen übergeben
  // dieselben Slots; allein `description` kommt von der Route (Beschreibung).
  return (
    <>
      <QiOneBuyBox
        /* VIDEOS IM VORSCHAUSTREIFEN (Amazon-Muster, Maßnahme „Produktseite,
           die verkauft“, Christian 26.09.2026): Zellvideo, Stimme aus dem
           Podcast, GitterChip-Animation hinter EINER Kachel. Daten und Texte:
           app/data/produkt-videos.js. Seit dem 28.09.2026 auch auf
           /pages/qione-2-pro (dieselbe Seite, Kopf dieser Datei). */
        videoKachel={<ProduktVideoKachel handle="qione-2-pro" />}
        /* SPRUNGZIEL DER BEIDEN "#product"-CTAs im Inhalt darunter
           (product-pages/QiOne2Pro.jsx, ctaAnchor-Default). Der Kopfkommentar
           dort fuehrte sie seit der Extraktion als "toter Anker — bleibt dort
           unveraendert (Byte-Identität)": der Bau, der das schrieb, wollte die
           organische PDP nicht anfassen und hat den Schaden deshalb ehrlich
           stehen lassen statt ihn zu verschweigen. Er war real — am
           2026-09-16 zeigten 2 der 3 toten Sprungziele des ganzen Ladens
           hierher (Zensus über 102 ausgelieferte Seiten).

           `id="product"` ist dabei kein neuer Name, sondern der, den
           products.qibracelet.jsx, products.qihome-air.jsx und
           products.zeremonie-kakao.jsx für dieselbe Stelle schon tragen.
           /pages/qione-2-pro übergibt ankerId="shopq-buybox" (ihr Sprungziel
           seit 2026-07-16) und dieselbe Id als Ziel der CTAs darunter — zwei
           gleiche Ids in einem Dokument wären kein Anker mehr. */
        ankerId={ankerId}
        dataSection={anker.buybox}
        product={product}
        /* Die Pflichtmitteilung hängt auf dieser Seite NICHT mehr unter dem
           Kauf-Knopf, sondern weiter unten im benefitList-Slot (Elina
           EL-20260908-d8349a01). Sie ist damit verschoben, nicht entfernt —
           und dieser Schalter ist die einzige Stelle, die verhindert, dass
           sie zweimal auf der Seite steht. Jede andere Kaufflaeche behaelt
           den Default (siehe ProductForm.jsx). */
        gewaehrleistungsHinweis={false}
        socialProof={
          <SterneSprung className="product-rating"><span style={{color: 'var(--color-accent-ink)'}}>4.8</span> <StarRating value={4.8} />{' '}<span>Über 14.000 Nutzer</span></SterneSprung>
        }
        /* DIE EINZIGE ABWEICHUNG ZWISCHEN DEN BEIDEN ROUTEN (Christian
           28.09.2026: "gleich bis auf den Beschreibungstext oben beim
           Produkt"). /products übergibt den Shopify-Beschreibungstext,
           /pages die Hero-Punkte der Landingpage-Fassung. */
        description={beschreibung}
        topBadge={
          <p className="mt-2">
            <b>Mehr als 14.000+ aktive Nutzer</b>
          </p>
        }
        priceLabel={<div className="BestsellerLabel">Bestseller Angebot</div>}
        /* HIER STAND BIS ZUM 2026-09-08 DIE ZWEIFEL-ZEILE ("Wirkt das
           überhaupt? …"). Elina EL-20260908-d8349a01 nimmt sie ERSATZLOS
           heraus — ausdrücklich ohne Ersatzformulierung — und setzt an genau
           diese Stelle den Gewährleistungs-Trigger, der vorher weiter oben
           unter dem Kauf-Knopf hing.

           DIE ORTSBEGRÜNDUNG VON DAMALS TRÄGT DEN NEUEN INHALT MIT: unter der
           Nutzen-Liste, direkt neben Preis und Kaufknopf — die Stelle, an der
           VOR dem Kauf abgewogen wird. Für eine Pflichtmitteilung ist das
           sogar der schärfere Ort: Art. 6 Abs. 1 lit. l RL 2011/83/EU verlangt
           sie "in hervorgehobener Weise", BEVOR der Verbraucher gebunden ist.

           SEIT ELINA EL-20260909-395f848c STEHT ER NICHT MEHR NEBEN DER LISTE,
           SONDERN IN IHR — als fünfter Punkt derselben <ul>. Bestellt war der
           Eindruck ("wie ein weiterer Punkt, nicht wie ein separater Block
           darunter"); die Bauform ist der Weg dorthin, weil Zeilenabstand,
           Icon-Größe und Schrift dann GEERBT statt nachgebaut sind. Der Ort
           bleibt derselbe, die Begründung darüber gilt unverändert.

           Weiterhin Slot statt eigener Sektion, damit die Anker-frei-Regel
           dieser PDP unberührt bleibt: ein neues data-section hätte den
           Design-Rubrik-Collector verschoben. */
        benefitList={
          /* Rücknahme, Raten und der Weg zu den Bewertungen stehen seit dem
             26.09.2026 OBEN in derselben Liste, also direkt unter dem
             Kaufknopf (Job 20260926-growth-kaufweg-vertrauen-dach, Begründung
             in reusables/KaufZusage.jsx). */
          <QiOneBenefitList
            vorPunkte={
              /* Monatsbetrag der Ratenzeile aus dem Preis dieser Variante
                 (Job 20260926-kaufblock-raten-und-testzeit-qione-2-pro-prio35,
                 Begründung in reusables/KaufZusage.jsx). */
              <KaufZusagePunkte
                preis={product?.selectedOrFirstAvailableVariant?.price}
                handle={product?.handle}
              />
            }
            zusatzPunkt={<EuGewaehrleistungsListenpunkt />}
          />
        }
      />
      {/*
        DIE INSTAGRAM-STIMMEN — WEIT OBEN, und zwar hier und nicht tiefer:
        unmittelbar nach dem Kaufblock (QiOneBuyBox trägt Bilder, Preis,
        Varianten, Kaufknopf) und VOR dem langen Inhaltsteil. Das ist die
        Stelle, an der der Zweifel vor dem Kauf entsteht — dieselbe
        Begründung, aus der hier bis zum 2026-09-08 der ZweifelBeleg stand.

        BEWUSST OHNE dataSection: diese PDP ist anker-frei. Ein erstes
        data-section würde den Design-Rubrik-Collector auf genau eine Sektion
        einengen (Watch-Regression) — dieselbe Begründung wie bei
        GitterchipMoleculesScrub und GoogleRezensionenBereich darunter.

        BEKANNTE NEBENWIRKUNG, gemeldet und nicht hier repariert: die Fläche
        steht damit im DOM ÜBER dem YouTube-Kasten des Inhaltsteils. Das
        fremde Messgerät homepage-bauer/bin/mess_videoumschaltung.py liest
        seine Spur über document.querySelector('[data-qb-video-zustand]'),
        also global statt am gemessenen Kasten, und zeigt dann den Zustand
        UNSERER ersten Kachel. Das verfälscht kein Verdikt (der Wahl-Schritt
        verwirft unsere Kacheln ohnehin, weil ihre Vorschau kein ytimg-Bild
        ist), aber es verfälscht jede Spur, die ein Mensch danach liest.
        Befund beim Eigentümer: review
        20260911-GROSSJOB-ig-testimonial-slideshow-auf-die-produktseiten-weit-oben-s03:software:h:09efed4e1f
      */}
      <IgTestimonialSlideshow produkt="QiOne 2 Pro" />
      {/*
        AMAZON-STIL STUFE 2 (Christian 26.09.2026, Leitplanke Folie 11;
        Grossjob growth-m-lp-produktseite-verkauft, s04): der Vergleich der
        drei Geräte und die häufigsten Kundenfragen direkt nach den
        Instagram-Stimmen, statt bei 90 % Seitentiefe. Seit dem 28.09.2026
        auch auf /pages/qione-2-pro (bis dahin Kontrollgruppe der
        Wirkungsmessung). `block` hält die Geräte-Links im Landing-Bereich.
        BEWUSST ohne dataSection (Anker-frei-Regel dieser PDP, siehe oben).
      */}
      <Geraetevergleich
        handle="qione-2-pro"
        block={block}
        preise={vergleichsPreise}
        eigenerPreis={product?.selectedOrFirstAvailableVariant?.price}
      />
      {/* Vertrauensblock vor den Kundenfragen, die Kundenfragen direkt
          darunter (Christian 28.09.2026 ~19:45: "das FAQ kommt direkt
          darunter, nicht oben drüber, dann wirkt es insgesamt stimmiger";
          löst die Reihenfolge von ~19:25 ab). Genau einmal auf der Seite. */}
      {/* Messanker ohne Eingriff in den geteilten Baustein: display:contents
          erzeugt keine eigene Box, das Layout bleibt wie ohne Hülle. */}
      <div data-qb-block="zufriedene-kunden" style={{display: 'contents'}}>
        <GoogleRezensionenBereich dataSection={anker.rezensionen} />
      </div>
      <Kundenfragen handle="qione-2-pro" oben={fragen.oben} alle={FAQ_QIONE_2_PRO} />
      {/* GitterChip-Molecules-Scrub nach dem Gitterchip-Erklärblock, von
          Christian am 2026-07-17 für die organische PDP freigegeben (Job
          20260717-gitterchip-animation-3seiten-rollout); die Kampagnenseite
          trug ihn schon vorher. Aktiviert hier in der Seite, der Default in
          QiOne2Pro bleibt null. Auf /products ohne dataSection: ein erster
          data-section-Anker würde den Design-Rubrik-Collector auf eine
          Sektion einengen (Watch-Regression). /pages übergibt ihren
          bisherigen Anker shopq-gitterchip-video. */}
      {/* Google-Rezensionsbereich (Job 20260731-google-rezensionen): auf
          dieser PDP fehlte er komplett (Christian-Bug — 4,8-Klick im Banner
          lief ins Leere). Gleicher Slot wie auf der Campaign-PDP
          /pages/qione-2-pro (trustNachSlider nach dem InfoSlider), Inhalt =
          Live-Reputon-Widget + Überschrift. BEWUSST ohne dataSection
          (Anker-frei-Regel dieser PDP, siehe oben). */}
      {/* Im Landing-Bereich zeigen die CTAs des Inhalts auf die Buy-Box
          DIESER Seite (kein Sprung zur SEO-PDP), die Karten per `block` auf
          die Geschwister-Landeziele (Zwei-Block-IA). Ohne LP-Block gelten
          die Defaults von QiOne2Pro. */}
      <QiOne2Pro
        block={block}
        ctaHref={lp ? `#${ankerId}` : undefined}
        ctaAnchor={lp ? `#${ankerId}` : undefined}
        gitterchipAnimation={
          <GitterchipMoleculesScrub dataSection={anker.gitterchip} />
        }
        faqItems={fragen.unten}
      />
    </>
  );
}
