import {UEBERSICHT_BEREICHE} from '~/data/uebersicht-links';
import uebersichtStyles from '~/styles/uebersicht.css?url';

/**
 * /pages/uebersicht — ÜBERSICHT aller Seiten des Shops.
 *
 * Auftrag 20260728-pages-uebersicht-linkliste-live-noindex (Christian
 * 2026-07-28): eine nicht crawlbare Seite, die ALLE Links der Seite in
 * Bereichen führt und sich autonom nachführt, wenn etwas dazukommt oder
 * wegfällt. Segment s02 baut die Seite, s04 schaltet die Nachführung scharf.
 *
 * WOHER DIE LISTE KOMMT — und warum nicht zur Laufzeit:
 * Oxygen läuft am Edge und kann `shared-state` zur Laufzeit NICHT lesen. Die
 * Liste ist deshalb ein GENERIERTES, committetes Datenmodul
 * (`app/data/uebersicht-links.js`), erzeugt von
 * `codemeister uebersicht generiere` (shared-state/homepage-bauer/src/
 * uebersicht.py) aus der UNION von Code-Kartographie und Shopify-Katalog.
 * Diese Route rendert es und NICHTS SONST — sie enthält bewusst keine eigene
 * Linkliste. Wer hier von Hand einen Link ergänzt, verliert ihn beim nächsten
 * Reconciler-Lauf: die Änderung gehört in den Generator.
 *
 * WARUM DIE UNION (die tragende Erkenntnis des Baus, gemessen 2026-07-29):
 * keine der beiden Quellen ist allein vollständig. Die Kartographie kennt die
 * konkreten Code-Routen, aber ~48 Live-URLs laufen über Catch-alls und stehen
 * nirgends im Code; der Shopify-Katalog kennt genau die, aber ~28 Code-Routen
 * (u. a. /pages/schlaf-zellen-schutz, /pages/tiefer-schlaf) fehlen dort,
 * obwohl sie HTTP 200 liefern. Eine Einzelquelle übersieht je eine Hälfte.
 *
 * ZWECK UND ZUSTAND (Auftrag 20260916-162-seiten-und-bei-keiner-steht-warum,
 * Christian: „162 Seiten, und bei keiner steht, warum"): jede Zeile trägt den
 * Zweck der Seite. Er kommt aus demselben Datenmodul und stammt aus der
 * kuratierten Quelle shared-state/homepage-bauer/data/seitenzweck/<shop>.yaml,
 * aufgelöst über exports/seitenregister.json. `unklar` ist dort ein gültiger
 * Wert — ein leeres Feld wird als „noch nicht festgestellt" gezeigt und NICHT
 * mit einem plausiblen Satz gefüllt.
 *
 * DIE LEGENDE IM KOPF IST TRAGEND, NICHT SCHMUCK: die Abnahme-Probe
 * homepage-bauer/pruefungen/probe_seitenregister.py (Arm D) misst, ob die
 * Wörter „Zweck" und „Zustand" im SICHTBAREN Text stehen. Wer sie umformuliert,
 * färbt Arm D rot — das ist gewollt und der Grund, warum die Zusage eine
 * gemessene ist und keine behauptete.
 *
 * BEIDE LÄDEN AUF EINER FLÄCHE: qi-blanco.com ist ein fremder Liquid-Store, den
 * dieses Repo nicht deployt; ein eigenes Seiten-Objekt gibt es dort nicht (live
 * gemessen 2026-09-16: /pages/uebersicht, /pages/overview, /pages/bf-uebersicht,
 * /pages/site-overview je HTTP 404, und `shopify-write check` führt kein Token
 * für den US-Shop). Der US-Laden steht deshalb als eigener Bereich HIER — eine
 * Arbeitsfläche, nicht zwei Wahrheiten.
 *
 * DESIGN: eigenes Token-System `styles/uebersicht.css` (Scope .ue) nach dem
 * Referenz-Rezept der LP A — modulare Typo-Skala, 8pt-Grid, warmes Neutral,
 * EIN Gold-Akzent nur auf Handlung/Beweis, EIN Radius, EIN H2-Stil.
 *
 * TRACKING-NAHT: diese Seite setzt KEINE Cookies, führt KEINEN neuen
 * Identitäts-/Tracking-Key ein und enthält keinen eigenen Pixel. Die
 * R1/R2/R3-Kette hängt pfad-agnostisch im root-Layout (Hausmuster D-006) —
 * `TRACKING_COOKIE_NAMES` bleibt unangetastet, es gibt an dieser Route keine
 * Bereichsgrenze, über die etwas verloren gehen könnte.
 */

export function links() {
  return [{rel: 'stylesheet', href: uebersichtStyles}];
}

/**
 * noindex, nofollow — interne Übersicht, ausdrücklich kein Suchmaschinen-Ziel
 * (Christian 2026-07-28: „nicht crawlbar"). Doppelgate nach Hausmuster D-006:
 * Meta-robots UND X-Robots-Tag, damit das Signal auch greift, wenn ein Bot das
 * HTML-head nicht parst.
 *
 * BEWUSST KEIN canonical: noindex plus ein canonical auf eine andere URL sind
 * widersprüchliche Signale — ein Bot, der dem canonical folgt, kann das noindex
 * der Zielseite zuordnen.
 * @type {MetaFunction}
 */
export const meta = () => [
  {title: 'Übersicht — alle Seiten | Qi Blanco'},
  {name: 'robots', content: 'noindex,nofollow'},
];

/**
 * X-Robots-Tag als zweite, vom HTML unabhängige Sperre (Hausmuster D-006).
 *
 * BEWUSST OHNE Cache-Control: no-store — das trägt nur
 * /pages/schlaf-zellen-schutz, weil dort ein A/B-Split im Loader sitzt, den
 * eine CDN-Kopie einfrieren würde. Diese Seite hat keinen Split; der Kopf
 * gehört zum Split, nicht zum noindex.
 * @type {HeadersFunction}
 */
export const headers = () => ({'X-Robots-Tag': 'noindex, nofollow'});

/**
 * `zustand` kommt als MASCHINENWERT aus dem Register und kann eine Adresse
 * tragen: `ersetzt-durch:/pages/qihome-details`. Ungefiltert stünde ein
 * Doppelpunkt-Schlüssel auf der Seite. Hier wird genau dieser eine Fall
 * aufgelöst — alle übrigen Werte (live, unfertig, archiviert) gehen unverändert
 * durch, damit ein künftiger Zustand nicht stillschweigend verschluckt wird.
 */
function zustandText(zustand) {
  const marke = 'ersetzt-durch:';
  return zustand.startsWith(marke)
    ? `ersetzt durch ${zustand.slice(marke.length)}`
    : zustand;
}

/**
 * Ein Eintrag = eine Zeile MIT ihrem Zweck darunter. Der Pfad ist die
 * Hauptinformation (Monospace), der Shop-Titel die Beifügung, der Zweck die
 * Antwort auf die Frage, warum es die Seite gibt.
 *
 * WARUM DER ZWECK AUSSERHALB DES <a> STEHT: ein ganzer Satz im Linktext macht
 * die Vorlesereihenfolge unbrauchbar und die Trefferfläche über die halbe
 * Zeilenhöhe. Der Link bleibt der Pfad; der Zweck ist Text daneben.
 *
 * MARKER TRAGEN NUR, WAS GEMESSEN IST: `noindex` aus dem Routen-Code (deshalb
 * `crawlbar === false` und nicht `!crawlbar` — für den US-Laden erhebt dieses
 * Repo kein noindex, dort FEHLT das Feld, und ein fehlender Wert ist keine
 * Aussage), der Ads-Status aus der Ads-Steuerung, der Zustand aus dem Register.
 *
 * `live` bekommt bewusst KEINEN Marker: er trifft auf die große Mehrheit zu und
 * würde die Liste zupflastern, statt das Auffällige zu zeigen. Sichtbar ist,
 * was vom Normalfall abweicht.
 */
function Eintrag({eintrag}) {
  const {pfad, url, titel, crawlbar, ads, zweck, zustand, saison} = eintrag;
  return (
    <li className="ue-zeile">
      <a className="ue-link" href={url}>
        <span className="ue-pfad">{pfad}</span>
        {titel ? <span className="ue-titel">{titel}</span> : null}
        {crawlbar === false ? <span className="ue-marker">noindex</span> : null}
        {zustand && zustand !== 'live' ? (
          <span className="ue-marker ue-marker--zustand">{zustandText(zustand)}</span>
        ) : null}
        {saison ? <span className="ue-marker">{saison}</span> : null}
        {ads ? (
          <span className={ads === 'aktiv' ? 'ue-marker ue-marker--aktiv' : 'ue-marker'}>
            {ads === 'aktiv' ? 'Ads aktiv' : `Ads ${ads}`}
          </span>
        ) : null}
      </a>
      <p className={zweck ? 'ue-zweck' : 'ue-zweck ue-zweck--offen'}>
        {zweck || 'Zweck noch nicht festgestellt.'}
      </p>
    </li>
  );
}

export default function Uebersicht() {
  const alle = UEBERSICHT_BEREICHE.flatMap((b) => b.eintraege);
  const gesamt = alle.length;
  const live = alle.filter((e) => e.zustand === 'live').length;
  const offen = alle.filter((e) => !e.zweck).length;

  return (
    <div className="ue">
      <section className="ue-abschnitt ue-kopf" data-section="ue-kopf">
        <div className="ue-innen">
          <h1>Übersicht — alle Seiten</h1>
          <p className="ue-lead">
            Jede Seite beider Läden, nach Bereichen geordnet: die öffentliche
            Seite, die Landingpages im Einsatz und im Bau, Sales-, Rechts- und
            Systemseiten, dazu der US-Laden. Diese Übersicht ist eine
            Arbeitsfläche und selbst nicht für Suchmaschinen freigegeben.
          </p>
          <p className="ue-legende">
            Zweck heißt: was die Seite dem Besucher bringt. Zustand heißt: live,
            unfertig, archiviert oder ersetzt — angezeigt wird er nur, wo er von
            live abweicht.
          </p>
          <p className="ue-stand">
            {gesamt} Einträge in {UEBERSICHT_BEREICHE.length} Bereichen · {live}{' '}
            live, {gesamt - live} abweichend · {offen} ohne festgestellten Zweck
          </p>
        </div>
      </section>

      <nav className="ue-abschnitt ue-anker" aria-label="Bereiche" data-section="ue-anker">
        <div className="ue-innen">
          <ul className="ue-anker-liste">
            {UEBERSICHT_BEREICHE.map((bereich) => (
              <li key={bereich.schluessel}>
                <a className="ue-anker-eintrag" href={`#${bereich.schluessel}`}>
                  {bereich.titel}
                  <span className="ue-anker-zahl">{bereich.eintraege.length}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {UEBERSICHT_BEREICHE.map((bereich) => (
        <section
          key={bereich.schluessel}
          id={bereich.schluessel}
          className="ue-abschnitt ue-bereich"
          data-section={`ue-${bereich.schluessel}`}
        >
          <div className="ue-innen">
            <h2>{bereich.titel}</h2>
            <p className="ue-bereich-text">{bereich.beschreibung}</p>
            <ul className="ue-liste">
              {bereich.eintraege.map((eintrag) => (
                <Eintrag key={eintrag.pfad} eintrag={eintrag} />
              ))}
            </ul>
          </div>
        </section>
      ))}

      <section className="ue-abschnitt ue-fuss" data-section="ue-fuss">
        <div className="ue-innen">
          <p>
            Diese Liste führt sich selbst nach: kommt eine Seite dazu oder fällt
            eine weg, erzeugt der Übersichts-Reconciler das Datenmodul neu und
            meldet die Abweichung. Änderungen deshalb nie hier, sondern am
            Generator.
          </p>
        </div>
      </section>
    </div>
  );
}
