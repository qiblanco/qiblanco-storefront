import rechtsseiteAppleStyles from '~/styles/rechtsseite-apple.css?url';
import {AppleSeite} from '~/components/apple-seite/AppleSeite';

/**
 * RECHTSSEITE — das gemeinsame Grundlayout aller Dokument-/Reintext-Seiten.
 *
 * Zweck (Job 20260815-designmeister-rechtsseiten...): Vor diesem Bau baute
 * jede Rechtsseite ihren Rahmen selbst — `<div className="NormalSectionSize"
 * style={{maxWidth: '860px', padding: '3rem 1.5rem 5rem'}}>` stand in vier
 * Routen wortgleich, dazu ~15 weitere inline-styles je Datei. Wer eine neue
 * Seite anlegte, kopierte entweder diesen Block oder bekam den ungestalteten
 * Default.
 *
 * Diese Komponente ist der EINE Ort dafür. Sie trägt keine eigenen Werte:
 * alles Sichtbare kommt aus app/styles/rechtstext.css (global geladen), damit
 * es genau EIN Token-System für Dokumentseiten gibt.
 *
 * Verwendung:
 *   <Rechtsseite titel="Impressum">
 *     <section> ... </section>
 *   </Rechtsseite>
 *
 * `titel` rendert die H1 im einheitlichen Kopf. Wer eine eigene Kopfzone
 * braucht, lässt `titel` weg und liefert sie als erstes Kind.
 *
 * APPLE-FASSUNG (Grossjob 20261029-GROSSJOB-alle-shop-seiten-apple-niveau-
 * ausser-seo-geo, s12): `apple` ist `appleSeiteLaden(context, <seite>)` aus
 * dem Loader der Route. Mit `apple.an` legt sich die Apple-Hülle um dasselbe
 * Dokument (Marker data-apple-seite, Token-CSS apple-seite.css) und
 * rechtsseite-apple.css biegt die rs-Tokens auf --as-* um. NUR Typografie und
 * Farbe: Text, Reihenfolge und Elemente bleiben Zeichen für Zeichen gleich.
 * Ohne `apple` (oder Schalter aus) rendert C unverändert.
 *
 * @param {{titel?: string, stand?: string, apple?: {seite: string|null, an: boolean}|null, children: import('react').ReactNode}} props
 */
export function Rechtsseite({titel, stand, apple = null, children}) {
  const dokument = (
    <div className="rs-doc">
      <div className="rs-doc__inner">
        {titel ? (
          <header className="rs-doc__kopf">
            <h1>{titel}</h1>
            {stand ? <p className="rs-doc__meta">Stand: {stand}</p> : null}
          </header>
        ) : null}
        {children}
      </div>
    </div>
  );
  if (!apple?.an || !apple.seite) return dokument;
  return (
    <>
      <link rel="stylesheet" href={rechtsseiteAppleStyles} />
      <AppleSeite seite={apple.seite}>{dokument}</AppleSeite>
    </>
  );
}

export default Rechtsseite;
