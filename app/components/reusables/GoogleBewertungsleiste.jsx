import {useContext, useId} from 'react';
import {UNSAFE_DataRouterStateContext} from 'react-router';
import {ReviewsSlider, GoogleIcon} from '~/components/index-components/ReputonWidget';
import {StarRating} from '~/components/reusables/StarRating';
import {
  GOOGLE_RATING_FALLBACK,
  GOOGLE_REVIEWS_URL,
  istPlausibel,
  ratingKomma,
} from '~/lib/googleRating';

/*
 * GoogleBewertungsleiste — DIE EINE BEWERTUNGSLEISTE (Standard-Komponente).
 *
 * Christian 11.11.2026 (Job 20261111-prio1-bewertungsslider-original-google-
 * 5-sterne-neueste-20-ueberall-gleich): „dass das wieder Originalbewertungen
 * sind von Google, dass man das auch erkennt und dass man die auch
 * durchsliden kann und immer die neueste 5-Sterne-Bewertung es anfängt und
 * dann eben 20 Bewertungen geladen werden und dass diese Bewertungsleisten
 * wieder an allen Positionen gleich ist." Überschrift: „gerne 4,8 und dann
 * 5 Sterne bei Google". Variante „Das sagen Menschen, die ihn tragen" nur
 * mit den Sternen darunter.
 *
 * WAS SIE IST: Überschrift (Google-Note + fünf goldene Sterne + „bei
 * Google", als Link aufs Google-Profil) und darunter der bewährte
 * ReviewsSlider (ReputonWidget.jsx, Bestand seit 31.07.2026): echte
 * Google-Karten mit G-Zeichen, Name, Datum und goldenen Sternen,
 * wisch- und ziehbar, Pfeile, ruhiger Autolauf.
 *
 * DATEN (Aufbau der alten Variante, Christian Nachtrag 2): der root-Loader
 * lädt den Reputon-Feed des Google-Profils (googleRating.server.js), hält
 * ihn 6 h im Cache, nimmt nur 5-Sterne-Bewertungen mit Text, sortiert die
 * neueste nach vorn und lässt die Einträge der Ausschlussliste weg
 * (googleReviewsAusschluss.server.js, Satire/Ironie). Eine neue
 * 5-Sterne-Bewertung steht also nach dem nächsten Abruf vorne. Ob sie ernst
 * gemeint ist, urteilt der Rezensions-Melder (rt rezensions-neuzugang-melder).
 * Diese Leiste wählt nichts aus und erfindet nichts: sie zeigt die ersten
 * ANZAHL der Liste, die der Loader liefert.
 *
 * KEINE KI-ZUSAMMENFASSUNG als erste Karte: Christian will, dass die
 * neueste 5-Sterne-Bewertung die Leiste anfängt.
 *
 * STANDARD: jede Bewertungsposition (Apple-Baukasten AppleStimmen,
 * Apple-Kaufseiten AlphaStimmen) rendert diese Komponente. Wer eine
 * Bewertungsposition baut, nimmt sie und baut keine eigenen Stimmen-Karten
 * (homepage-bauer/wissen/bewertungsleiste-standard.md, Gate-Probe
 * pruefungen/probe_bewertungsleiste_standard.py).
 */

export const BEWERTUNGSLEISTE_ANZAHL = 20;

/**
 * Dieselben root-Daten wie useGoogleRating/useGoogleReviews, aber über den
 * Kontext gelesen: außerhalb eines Data-Routers (Unit-SSR, Generator der
 * Startseite des Global Englisch-Shops) gibt es dann die Fallback-Note und
 * keine Karten statt eines Absturzes.
 */
function useGoogleDaten() {
  const zustand = useContext(UNSAFE_DataRouterStateContext);
  const roh = zustand?.loaderData?.root?.googleRating;
  const g = istPlausibel(roh) ? roh : GOOGLE_RATING_FALLBACK;
  const reviews = roh && Array.isArray(roh.reviews) ? roh.reviews : [];
  return {komma: ratingKomma(g.rating), total: g.total, url: GOOGLE_REVIEWS_URL, reviews};
}

export function GoogleBewertungsleiste({
  titel = null,
  dataSection = 'bewertungsleiste',
  anzahl = BEWERTUNGSLEISTE_ANZAHL,
  klasse = '',
}) {
  const id = useId();
  const g = useGoogleDaten();
  const {reviews} = g;
  const leiste = reviews.filter((r) => Number(r.rating) === 5).slice(0, anzahl);
  const sterne = (
    <span className="qb-gbl__sterne" aria-hidden="true">
      <StarRating value={5} size={titel ? 20 : 26} qb="" />
    </span>
  );
  const linkLabel = `${g.komma} von 5 Sternen bei Google, alle ${g.total} Bewertungen ansehen`;
  const note = (
    <>
      <span className="qb-gbl__note">{g.komma}</span>
      {sterne}
      <span className="qb-gbl__bei">bei Google</span>
    </>
  );
  return (
    <section
      className={`qb-gbl ${klasse}`.trim()}
      aria-labelledby={id}
      data-section={dataSection}
      data-bewertungsleiste="google"
      data-bewertungen={leiste.length}
    >
      {titel ? (
        <>
          <h2 id={id} className="qb-gbl__titel">
            {titel}
          </h2>
          <a className="qb-gbl__zeile" href={g.url} aria-label={linkLabel} target="_blank" rel="noopener noreferrer">
            {note}
          </a>
        </>
      ) : (
        <h2 id={id} className="qb-gbl__titel">
          <a className="qb-gbl__titel-link" href={g.url} aria-label={linkLabel} target="_blank" rel="noopener noreferrer">
            {note}
          </a>
        </h2>
      )}
      <p className="qb-gbl__unter">
        <GoogleIcon />
        <span>Die neuesten 5-Sterne-Bewertungen</span>
      </p>
      <ReviewsSlider reviews={leiste} label="Neueste Google-Rezensionen von Qi Blanco, nur 5 Sterne" />
    </section>
  );
}
