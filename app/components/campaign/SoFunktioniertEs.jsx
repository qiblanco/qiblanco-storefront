/* ───────── Baustein „So funktioniert es“ (VORBEREITET, nirgends eingebunden) ─────────
   Christian, 17.10.2026 (Übergabe #29 des Grossjobs 20261017-GROSSJOB-seiten-
   umbau-kreislauf-simulation-als-tor-vor-b-seite-15-prozent-durchschlupf-
   optimiert-sim): „Und wenn diese ganze Landingpage-Optimierung durch ist, ist
   für mich die größte Frage: Was für ein Bedürfnis ist noch da für die User?
   Also ein ‚How does it work?‘ vielleicht in kurz und knapp: Enthält keine
   elektronischen Bauteile. Wirkt durch seinen passiven Gitterchip. Hilft dabei,
   naheliegende Wassermoleküle in den Superzustand des Wassers übergehen zu
   lassen, den sogenannten kohärenten Zustand, bei dem der Winkel von 104,5 Grad
   in 108,5 übergeht oder so.“ Bestätigt ~11:35Z: „Ja, 104,5 und 109,5. Passt.“

   WORTLAUT: seiner. Geändert sind nur der Winkel (109,5 statt „108,5 oder so“,
   seine Bestätigung), die Marke (Gitterchip® wie auf der Seite) und die
   Satzgrenzen: aus dem Relativsatz „bei dem der Winkel …“ wird ein eigener Satz.
   Grund für die Trennung: der Salesletter-Entwurf (Job 20261017-update-prio1-
   zuarbeit-salesletter-pdf-und-entwurf-im-sprachprofil-christian) stellt die
   Chip-Aussage und die Winkel-Aussage ebenfalls in zwei Sätze, weil sie zwei
   verschiedene Grundlagen haben (siehe QUELLEN). Gleiche Gliederung wie dort:
   „Keine Elektronik, kein Akku. Passiver GitterChip. Winkel 104,5° → 109,5°.“

   QUELLEN (Gesundheits- und Fachaussagen nur mit Grundlage):
   - Winkel 104,5° → 109,5°: Warnke, U. & Warnke, F., Bionisches Wasser (2019),
     S. 81 („desto stärker weiten sich die normalen 104,5-Grad-Bindungswinkel
     auf: zu 109 Grad und mehr“), S. 99 nach Brüesch 2011; Vortrag Warnke,
     Baden-Baden 2018 (qi-brain/brain/Quellen/Warnke/BadenBaden2018/
     Transkript.md:136-138). Gegenüberstellung mit fünf Quellen: die
     YAML-Datei „kohärente Wasserstruktur, Gegenüberstellung“ unter
     qi-brain/brain/Marketing/ (Zeilen 113-129, 197-199: kohärente Domäne und
     EZ-Wasser 109,5°). Ein Buch
     und ein Vortrag, keine begutachtete Studie. Winkel im freien Molekül
     104,48°: Császár et al. 2005, J. Chem. Phys. 122, 214305 (data/wasser-
     infoseite.js); Tetraederwinkel 109,47°: Bernal & Fowler 1933.
   - Keine Elektronik, passiv: data/gitterchip-seite.js („Im Chip steckt keine
     Elektronik, kein Akku und keine Batterie, und er sendet nichts“),
     data/product-faqs.js („ein passives Bauteil ohne Elektronik“).
   - GitterChip → kohärenter Zustand: Wortlaut der freigegebenen LP
     (IntroSection, SchlafZellenSchutz.jsx). Eine Studie, die den Chip mit dem
     Winkel verbindet, gibt es in unserem Material nicht; deshalb steht die
     Quellenzeile unter dem Baustein beim Winkel, nicht beim Chip.

   WANN: erst NACH der Ausoptimierung der Ads-LP (Hypothese GS-176, nicht vor
   dem Urteil von szs-e3-gs079/szs-e4-gs174). Dann als eigener Arm durch das
   Sim-Tor (abschnitte_b mit lp-a-so-funktioniert) und vor dem Merge durch
   die Menschlichkeits-Prüfung (Werkzeug unter menschlichkeit/bin/, Freigabe,
   Zweck lp-block; Stufenplan textregel).
   Bis dahin rendert ihn keine Route. */

export const SO_FUNKTIONIERT_ES = Object.freeze({
  titel: 'So funktioniert es',
  saetze: [
    'Enthält keine elektronischen Bauteile.',
    'Wirkt durch seinen passiven Gitterchip®.',
    'Er hilft dabei, naheliegende Wassermoleküle in den Superzustand des Wassers übergehen zu lassen, den sogenannten kohärenten Zustand.',
    'Dabei geht der Winkel im Wassermolekül von 104,5 Grad in 109,5 Grad über.',
  ],
  quelle: 'Winkel: Warnke & Warnke, Bionisches Wasser (2019), S. 81.',
});

export function SoFunktioniertEs({dataSection = 'lp-a-so-funktioniert'}) {
  return (
    <section className="lp-vp-section" data-section={dataSection}>
      <h2>{SO_FUNKTIONIERT_ES.titel}</h2>
      <p className="lp-vp-section__lede">{SO_FUNKTIONIERT_ES.saetze.join(' ')}</p>
      <p className="lp-vp-pricing__fineprint">{SO_FUNKTIONIERT_ES.quelle}</p>
    </section>
  );
}
