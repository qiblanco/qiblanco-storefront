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
 * Diese Komponente ist der EINE Ort dafuer. Sie traegt keine eigenen Werte:
 * alles Sichtbare kommt aus app/styles/rechtstext.css (global geladen), damit
 * es genau EIN Token-System fuer Dokumentseiten gibt.
 *
 * Verwendung:
 *   <Rechtsseite titel="Impressum">
 *     <section> ... </section>
 *   </Rechtsseite>
 *
 * `titel` rendert die H1 im einheitlichen Kopf. Wer eine eigene Kopfzone
 * braucht, laesst `titel` weg und liefert sie als erstes Kind.
 *
 * @param {{titel?: string, stand?: string, children: import('react').ReactNode}} props
 */
export function Rechtsseite({titel, stand, children}) {
  return (
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
}

export default Rechtsseite;
