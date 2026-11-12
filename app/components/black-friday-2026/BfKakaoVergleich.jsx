import {useRef} from 'react';
import vergleichStyles from '~/styles/bf-kakao-vergleich.css?url';
import elinaBewegungStyles from '~/styles/elina-bewegung.css?url';
import {useElinaBewegung} from '~/components/reusables/useElinaBewegung';
import {SORTENVERGLEICH} from '~/components/reusables/amazonstil-daten';
import {KAKAO_STIMMEN, datumDeutsch} from '~/crystal-spiegel/data/kakao-stimmen';

/*
 * KAKAO-DEAL-SEITE: GEGENÜBERSTELLUNG AWAKE VS. CREATE + EIN GEMEINSAMER BLOCK
 * (Elina EL-20261112-cb3c35ca, Präzisierung zu EL-20261112-452cdd56, 12.11.2026).
 *
 * Statt der kompletten Sections beider Crystal-Cacao-Produktseiten: zwei Spalten
 * (mobil untereinander, ab 640 px nebeneinander), je Sorte Bild, EIN Satz
 * wofür/wann und drei Stichpunkte; danach EIN Block „Für beide“ mit Bio,
 * Herstellung, Zubereitung und zwei Kundenstimmen. Danach folgen Schluss-Banner
 * und FAQ aus dem Rahmen der Deal-Seiten (EL-20261112-452cdd56).
 *
 * KEINE NEUEN WIRKAUSSAGEN — jede Zeile kommt aus dem Bestand der Kakao-Seiten:
 * - Name, Bild, Wofür-Satz, Bohne, Profil, Bio: SORTENVERGLEICH (derselbe
 *   Datensatz wie der Sortenvergleich auf /products/crystal-cacao-awake und
 *   -create). Ändert sich dort etwas, kommt es hier von selbst mit.
 * - Geschmack: Herkunftstexte der Sortenseiten (sorten-profil.js, „volle
 *   Bouquet frischer Fruchtnoten, feiner Kokosnuancen“ bzw. „tropischer
 *   Früchte, feiner Kokosnoten und Zitrusnuancen“).
 * - Herstellung: Herkunftstexte der Sortenseiten (vermahlen, 420-g-Tafel,
 *   kristallisiert). „in Deutschland“ ist Elinas Vorgabe aus dem Auftrag.
 * - Zubereitung: SortenSeite.jsx, Abschnitt „Zubereitung“, wortgleich.
 * - Kundenstimmen: die echten Google-Bewertungen aus kakao-stimmen.js,
 *   ungekürzt; nur die zwei, die den Kakao selbst beschreiben.
 * Die Analyseberichte bleiben weg (Laborname, EL-20261112-0a9978b4), und kein
 * Link führt zurück in den Shop (geschlossener Funnel).
 */

const GESCHMACK = {
  'crystal-cacao-awake': 'Frische Fruchtnoten, feine Kokosnuancen',
  'crystal-cacao-create': 'Tropische Früchte, feine Kokosnoten und Zitrusnuancen',
};

/* Kurzname der Sorte für die Spaltenüberschrift („Crystal Cacao® Awake“ -> „Awake“). */
function kurzname(name) {
  return String(name).replace(/^Crystal Cacao®?\s*/, '');
}

/* Die zwei Stimmen, die über den Kakao sprechen (die dritte betrifft den Kundendienst). */
const STIMMEN = KAKAO_STIMMEN.slice(0, 2);

function Sterne({zahl}) {
  return (
    <span className="bkv__sterne" aria-label={`${zahl} von 5 Sternen`}>
      {'★'.repeat(zahl)}
    </span>
  );
}

export function BfKakaoVergleich() {
  const wurzel = useRef(null);
  useElinaBewegung(wurzel);
  const sorten = SORTENVERGLEICH.sorten;
  const bio = sorten[0]?.bio;

  return (
    <section
      ref={wurzel}
      className="bkv"
      aria-labelledby="bkv-titel"
      data-section="bf-kakao-vergleich"
    >
      <link rel="stylesheet" href={vergleichStyles} />
      <link rel="stylesheet" href={elinaBewegungStyles} />
      <h2 id="bkv-titel" className="bkv__titel" data-eb="">
        Awake oder Create?
      </h2>
      <div className="bkv__spalten" data-eb="gruppe">
        {sorten.map((s) => (
          <article
            key={s.handle}
            className="bkv__sorte"
            data-bkv-sorte={s.handle}
            aria-labelledby={`bkv-${s.handle}`}
          >
            <figure className="bkv__bild" data-eb="zoom">
              <img
                src={`${s.bild}&width=600`}
                srcSet={`${s.bild}&width=400 400w, ${s.bild}&width=600 600w, ${s.bild}&width=900 900w`}
                sizes="(min-width: 640px) 22rem, 80vw"
                width="600"
                height="600"
                alt={`${s.name}, Packung`}
                loading="lazy"
                decoding="async"
              />
            </figure>
            <h3 id={`bkv-${s.handle}`} className="bkv__name">
              {kurzname(s.name)}
            </h3>
            <p className="bkv__claim">{s.wofuer[0]}</p>
            <p className="bkv__wofuer">{s.wofuer[1]}</p>
            <ul className="bkv__punkte">
              <li>
                <b>Geschmack:</b> {GESCHMACK[s.handle]}
              </li>
              <li>
                <b>Bohne:</b> {s.bohne}
              </li>
              <li>
                <b>Profil:</b> {s.profil}
              </li>
            </ul>
          </article>
        ))}
      </div>

      <div className="bkv__beide" data-eb="">
        <h2 className="bkv__titel bkv__titel--beide">Für beide gilt</h2>
        <ul className="bkv__fakten" data-eb="gruppe">
          <li>
            <b>Bio:</b> {bio}
          </li>
          <li>
            <b>Herstellung in Deutschland:</b> schonend bei niedriger Temperatur
            vermahlen, als 420-g-Tafel gegossen und in Ruhe auskristallisiert
          </li>
          <li>
            <b>Zubereitung:</b> 15 g in 75 ml warmer Milch oder Wasser (max. 85 °C)
          </li>
        </ul>
        <div className="bkv__stimmen" data-eb="gruppe">
          {STIMMEN.map((st) => (
            <figure key={st.id} className="bkv__stimme">
              <Sterne zahl={st.sterne} />
              <blockquote>{st.text}</blockquote>
              <figcaption>
                {st.name} · {datumDeutsch(st.datum)} · Google-Bewertung
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
