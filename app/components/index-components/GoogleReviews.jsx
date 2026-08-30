import {ReviewsSlider} from '~/components/index-components/ReputonWidget';
import {
  GOOGLE_KUNDENERFAHRUNGEN_ANKER_ID,
  REVIEWS_SEKTION_ATTR,
} from '~/components/reusables/GoogleRezensionenBereich';
import {GOOGLE_REVIEWS_CURATED} from '~/lib/googleReviewsCurated';

/**
 * GoogleReviews — das obere „Beeindruckende Kundenerfahrungen"-Widget.
 *
 * Christian 2026-08-01: Die frühere statische Sprechblasen-Grid-Variante
 * (Name unten, kein Datum/„weiterlesen", ungleiche Höhe) ist ENTFERNT und
 * durch denselben sauberen Slider wie das untere Widget ersetzt — EIN
 * einheitliches Kartendesign, kein zweites Layout mehr.
 *
 * Inhalt: 12 KURATIERTE, ECHTE 5-Sterne-Google-Rezensionen
 * (googleReviewsCurated) — die eindrucksvollsten, authentischen Kunden-
 * geschichten (menschlich geprüft, keine Ironie/Satire, nichts Erfundenes).
 * Gleiche Optik + gleiches Verhalten wie das untere Widget (Avatar+Name+Datum
 * oben, Google-„G", Sterne, Text, „weiterlesen" inline, Scroll+Drag,
 * zeitverzögerter Autoslider) über den geteilten ReviewsSlider.
 */
export function GoogleReviews({dataSection}) {
  return (
    // Anker (Responsive-Repair 2026-08-04): Sprungziel des 4,8-Klicks im
    // Header-Banner. Vorher anker-los — der Klick sprang an dieser Sektion
    // vorbei zur weiter unten liegenden #google-rezensionen-Sektion.
    <section
      id={GOOGLE_KUNDENERFAHRUNGEN_ANKER_ID}
      className="GoogleKundenerfahrungen NormalSectionSize"
      {...{[REVIEWS_SEKTION_ATTR]: ''}}
      {...(dataSection ? {'data-section': dataSection} : {})}
    >
      <h2 className="text-[1.6rem] sm:text-4xl font-semibold text-center mb-6 mt-2">
        Beeindruckende Kundenerfahrungen
      </h2>
      <ReviewsSlider
        reviews={GOOGLE_REVIEWS_CURATED}
        label="Beeindruckende Kundenerfahrungen von Qi Blanco"
      />
    </section>
  );
}
