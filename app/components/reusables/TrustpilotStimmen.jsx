import {ReviewsSlider} from '~/components/index-components/ReputonWidget';
import trustpilotDaten from '~/data/trustpilot-bewertungen.json';

/* JSON statt JS: wortgleiche Kundenzitate sind fremder Volltext; die
   Seiten-Freigabe (hb-deploy Gate 25) führt JSON-Module dafür als Hausweg. */
const TRUSTPILOT_BEWERTUNGEN = trustpilotDaten.bewertungen;
const TRUSTPILOT_PROFIL_URL = trustpilotDaten.profil_url;

/*
 * DIE `!`-KLASSEN SIND ABSICHT: der Block steht in fremden Seitenrahmen
 * (.frg, .faq-a1, .tpt …), deren Element-Regeln für h2/p/a sonst Ausrichtung,
 * Breite und Abstand überschreiben (gemessen auf /pages/ist-qi-blanco-serioes
 * am Desktop: Überschrift links, Hinweis aus der Mitte gerückt).
 *
 * TrustpilotStimmen — Trustpilot-Bewertungen als Scroller, für die Wissens-
 * und Vertrauensseiten (Job 20261006-bau-trustpilot-scroller-ki-seiten-und-faq).
 *
 * CHRISTIAN 2026-10-06, wörtlich: „verlinken und auch einen Scroller bauen wie
 * bei den Googlebewertungen, aber nicht die Gesamtanzahl anzeigen, da es nur
 * 27 sind … an sinnvollen Stellen auf diesen AI-Seiten SEO/GEO, nicht auf den
 * Mainseiten, aber ja bei FAQ z.B. schon".
 *
 * DERSELBE SLIDER wie bei Google (ReviewsSlider mit quelle="trustpilot"),
 * kein zweites Kartendesign. Die Daten zieht trustpilot-wache/bin/scroller-
 * abgleich jeden Morgen aus der Bewertungs-Wache nach (app/data/trustpilot-
 * bewertungen.json, generiert).
 *
 * FESTE GRENZEN, hier durchgesetzt:
 *  - KEINE GESAMTZAHL, auch keine Durchschnittsnote. Die Note ohne Zahl
 *    dahinter wirft genau die Frage auf, die wir nicht beantworten wollen
 *    („aus wie vielen?"); die Sterne je Karte sagen genug.
 *  - KEIN TRUSTBOX-WIDGET, KEIN TRUSTPILOT-SKRIPT. Das Profil ist nicht
 *    beansprucht und bleibt es (sonst greifen Trustpilots AGB).
 *  - NUR WISSENS-/VERTRAUENSSEITEN UND FAQ. Nie Startseite, Produktseite,
 *    /pages/qione, Schlafseite, Warenkorb, Kasse: probe_trustpilot_orte
 *    (homepage-bauer/pruefungen) misst das an der gerenderten Seite.
 *
 * `praefix` ergibt das data-section dieses Blocks (Klicks zählt der
 * qpx-Pixel je data-section; der Link nach Trustpilot fällt dort als Ziel
 * „extern" an). `mitTatsachenLink` aus auf /pages/qi-blanco-auf-trustpilot
 * selbst, sonst verlinkte die Seite auf sich.
 */
export const TRUSTPILOT_SCROLLER_ATTR = 'data-qb-trustpilot-scroller';

export function TrustpilotStimmen({
  praefix = '',
  titel = 'Was Kundinnen und Kunden auf Trustpilot schreiben',
  mitTatsachenLink = true,
}) {
  if (!TRUSTPILOT_BEWERTUNGEN.length) return null;
  return (
    <section
      className="TrustpilotStimmen NormalSectionSize"
      data-section={`${praefix}trustpilot-stimmen`}
      {...{[TRUSTPILOT_SCROLLER_ATTR]: ''}}
    >
      <h2 className="text-[1.6rem] sm:text-4xl font-semibold text-center! mx-auto! max-w-none! mb-3! mt-2!">
        {titel}
      </h2>
      <p className="text-sm! text-gray-600 text-center! mb-6! mt-0! max-w-[38rem]! mx-auto!">
        Wortgleich von Trustpilot übernommen. Jede Karte führt per Klick auf das
        Trustpilot-Zeichen zur Bewertung im Original.
      </p>
      <ReviewsSlider
        reviews={TRUSTPILOT_BEWERTUNGEN}
        quelle="trustpilot"
        label="Bewertungen von Qi Blanco auf Trustpilot"
      />
      <p className="text-center! mt-4! mb-1! mx-auto! max-w-none!">
        <a
          href={TRUSTPILOT_PROFIL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium underline! underline-offset-4"
          data-qb-trustpilot-link="profil"
        >
          Alle Bewertungen auf Trustpilot ansehen
        </a>
      </p>
      {mitTatsachenLink ? (
        <p className="text-center! text-sm! text-gray-600 mt-0! mb-2! mx-auto! max-w-none!">
          <a
            href="/pages/qi-blanco-auf-trustpilot"
            className="underline! underline-offset-4"
          >
            Was auf Trustpilot über Qi Blanco steht, mit Quelle und Stand
          </a>
        </p>
      ) : null}
    </section>
  );
}
