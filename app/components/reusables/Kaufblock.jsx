/**
 * Kaufblock — der gestaltete Kaufknopf: Produktbild, Titel, Preiszeile,
 * Kaufknopf und Zusage als EIN Block.
 *
 * WARUM ES IHN GIBT — Christian, 15.10.2026, zu den nackten „Jetzt kaufen"-
 * Knöpfen der Schlafseite: „die Jetzt-kaufen-Button sind sowas von außerhalb
 * vom Design, dass es weh tut … das verhindert definitiv Käufe, dass sowas
 * niemandem auffällt ist echt krass." Das Sicht-Tor führt dieselben Stellen
 * als Befunde: Knopf ohne Kontext (F-032, F-179, F-188), zwei Knöpfe direkt
 * untereinander (F-030), Knopf auf der Abschnitts-Naht (F-031, F-439).
 *
 * DER BAUPLAN KOMMT AUS DEM STANDARD, nicht von hier:
 * design-meister/db/designstandard/_basis.yaml, Bausteine `kauf_block`,
 * `preiszeile`, `karte` und `abschnitt_uebergang`. Reihenfolge Bild, Titel,
 * Preiszeile, Kaufknopf, Zusage; der Knopf steht nie ohne Preis im selben
 * Block; der Block hält zu jeder Naht mindestens einen Rasterschritt Abstand.
 * Jeder Wert in styles/qb-kaufblock.css ist eine Rolle aus
 * styles/designstandard-dach.css (erzeugt, nicht von Hand).
 *
 * ANWENDUNGSREGEL
 *   Nimm ihn, wo ein Kaufknopf zwischen Inhalten steht — also überall dort,
 *   wo sonst ein freistehender Knopf stünde.
 *   Nicht für die Kaufbox der Produktseite (sie trägt Variante, Menge und
 *   Warenkorb) und nicht für die Produktreihe (das ist eine Kartenreihe).
 *   Nie zwei direkt untereinander: zwei Kaufblöcke brauchen mindestens einen
 *   Inhaltsabschnitt zwischen sich.
 *
 * WAS DIE AUFRUFSTELLE MITBRINGT UND WARUM
 *   - `zusage` ist eine Aussage, die die Seite schon trifft, WORTGLEICH. Der
 *     Baustein erfindet keine Zusage und kürzt keine.
 *   - `knopfKlasse`: eine Knopfform je Seite. Ohne Angabe ist es der Knopf
 *     aus dem Bausatz (`btn--primary`, baukasten/qb-knopf); eine Seite mit
 *     eigener Knopfform reicht ihre Klasse durch, damit derselbe Kauf nicht in
 *     zwei Knopfformen auf einer Seite steht.
 *   - `dataSection` ist der Schlüssel in verhalten.db. Er bleibt der des
 *     Knopfs, den der Block ersetzt — sonst hinge seine Historie an einem
 *     neuen Namen.
 *   - `imAbschnitt`: der Block steht INNERHALB eines Abschnitts statt
 *     zwischen zweien. Wirkt nur im Schalterzustand `aus` (dort trägt der
 *     Knopf wie früher 64 px Abstand selbst).
 *
 * WAS BEWUSST NICHT IM LINK STEHT: das Bild. KaufknopfChatSignal erkennt
 * einen Kaufknopf auch daran, dass er kein Bild enthält (hatBild); und je
 * Ziel gibt es genau EINE Formulierung (probe_lp_cta_einstimmig.py) — ein
 * zweiter Link mit dem Bild als Beschriftung wäre eine zweite. Der Knopf
 * spannt seine Trefferfläche deshalb per CSS über die ganze Karte
 * (qb-kaufblock.css, `__knopf::after`), ohne zweiten Link.
 *
 * DER SCHALTER (mobil und desktop getrennt ausgerollt): KAUFBLOCK_AN sagt je
 * Gerät, ob der Block seine Gestalt zeigt. `aus` zeigt auf diesem Gerät nur
 * den Knopf, genau wie vor dem Block — dieselbe Klasse, kein Abstand. Ein
 * Gerät lässt sich damit zurücknehmen, ohne das andere anzufassen.
 */
export const KAUFBLOCK_AN = {desktop: true, mobil: false};

export function Kaufblock({
  bild,
  bildSizes,
  bildAlt,
  titel,
  preis,
  streichpreis,
  ziel,
  knopfText,
  knopfKlasse = 'btn--primary',
  zusage,
  dataSection,
  imAbschnitt = false,
}) {
  return (
    <div
      className={`qb-kaufblock${imAbschnitt ? ' qb-kaufblock--im-abschnitt' : ''}`}
      data-section={dataSection}
      data-kaufblock-desktop={KAUFBLOCK_AN.desktop ? 'an' : 'aus'}
      data-kaufblock-mobil={KAUFBLOCK_AN.mobil ? 'an' : 'aus'}
    >
      <div className="qb-kaufblock__karte">
        <div className="qb-kaufblock__bild">
          <img
            {...bild}
            sizes={bildSizes}
            alt={bildAlt}
            width="120"
            height="120"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="qb-kaufblock__kopf">
          <p className="qb-kaufblock__titel">{titel}</p>
          <p className="qb-kaufblock__preiszeile">
            {streichpreis && (
              <s className="qb-kaufblock__streichpreis">{streichpreis}</s>
            )}
            <span className="qb-kaufblock__preis">{preis}</span>
          </p>
        </div>
        <a className={`${knopfKlasse} qb-kaufblock__knopf`} href={ziel}>
          {knopfText}
        </a>
        {zusage && <p className="qb-kaufblock__zusage">{zusage}</p>}
      </div>
    </div>
  );
}
