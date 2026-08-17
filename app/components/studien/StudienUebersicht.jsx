/**
 * /pages/studien — die Übersicht der Studien-Sektion.
 *
 * WAS HIER BEWUSST GLEICH BLEIBT (und warum): Diese Seite stand am 2026-08-14
 * gemessen auf Platz 1 für "Qi Blanco Studien" und auf Platz 3 für die
 * Markensuche "Qi Blanco" (seo.db, Lauf 2026-W33). Wir verteidigen eine
 * Position, wir erobern sie nicht. Deshalb: gleiche URL, gleicher Titel,
 * gleiche Substanz — die HRV-Messreihe bleibt VOLLSTAENDIG erhalten. Alles
 * Neue kommt additiv dazu.
 *
 * WAS SICH AENDERT: (1) statt zwei ausformulierter Studien steht jetzt JEDE
 * als Karte mit Zusammenfassung in Normalsprache, eigener Abbildung und
 * Weg in den Volltext; (2) der Volltext selbst zieht auf Einzelseiten um,
 * damit jede Publikation ihre eigene Ranking-Flaeche mit eigenem
 * ScholarlyArticle-Schema bekommt; (3) die HRV-Messreihe steht jetzt
 * ausdrücklich als EIGENER Einzelnachweis da.
 *
 * ZU (3), das ist der inhaltlich wichtigste Punkt: die HRV-Zahlen
 * (biologisches HRV-Alter -14 Jahre, ANS +20 %) waren auf der alten Seite in
 * die Nähe der Nutzererfahrungs-Publikation geraten. Diese Publikation
 * enthält aber gar keine HRV-Messung — sie wertet 171 Forenbeitraege aus
 * (gegen den Volltext geprueft). Die HRV-Reihe ist eine eigene, hausinterne
 * Messung an zwei Probanden. Sie darf gezeigt werden, sie darf nur nicht als
 * Ergebnis einer Fachpublikation gelesen werden. Genau diese Trennung stellt
 * die neue Struktur her.
 */

import {useEffect, useRef, useState} from 'react';
import {Link} from 'react-router';
import {
  STUDIEN,
  studienPfad,
  untersuchteProdukte,
  zahlwort,
} from '~/data/studien';

/** Bestands-Idiom (reusables/useDragSwipe.js, campaign/SchlafZellenSchutzV3.jsx,
 * index-components/ReputonWidget.jsx) — hier wiederverwendet, nicht neu erfunden. */
function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/** „A, B und C" — deutsche Aufzaehlung ohne Oxford-Komma. */
function aufzaehlung(namen) {
  if (namen.length <= 1) return namen[0] || '';
  return `${namen.slice(0, -1).join(', ')} und ${namen[namen.length - 1]}`;
}

function initialCap(w) {
  return w.charAt(0).toUpperCase() + w.slice(1);
}

/**
 * DIE DARSTELLUNGSNORM DES FÄCHERS (titelbild-norm-v1) — Rechenteil.
 *
 * Alle Titelseiten sollen gleich groß erscheinen. "Gleich groß" heißt
 * hier gleiche Höhe des SICHTBAREN INHALTS, nicht gleiche Leinwand: die
 * Bilder sind Montagen auf transparentem Grund, und der transparente Rand
 * ist je Datei verschieden groß (gemessen 88,4 % bis 100,0 % Content-Anteil
 * an der Höhe). Wer nur die Leinwand angleicht, lässt 13,2 % Streuung
 * stehen — und der größte Ausreißer wäre ausgerechnet das kanonische
 * Titelbild der fünften Studie, das gar keinen Rand hat.
 *
 * Die Faktoren stehen je Studie in `eckdaten.coverNorm` und sind aus der
 * Bilddatei gerechnet (medien-hosting/bin/kanon-titelbilder messen), nicht
 * geschätzt. Die kanonische Zuordnung Studie -> Titelbild liegt in
 * medien-hosting/kanon/studien-titelbilder.yaml; diese Komponente liest sie
 * über die Studien-Registry und hält keine eigene Bildliste.
 *
 * FAIL-SOFT: fehlt einer Studie `coverNorm` (z. B. weil jemand eine sechste
 * Arbeit ohne Vermessung ergänzt), fällt genau diese Kachel auf die
 * Leinwand-Normierung zurück. Das ist sichtbar schlechter, aber nicht
 * kaputt — und es reißt nicht den ganzen Fächer.
 */
const FAECHER_UEBERLAPPUNG = 0.12;

/** Norm-Faktoren einer Studie, mit Rückfall auf die Leinwand. */
function coverNorm(studie) {
  const n = studie.eckdaten?.coverNorm;
  if (n && typeof n.kBox === 'number' && n.kBox > 0) return n;
  // Rückfall: ohne Vermessung ist die Content-Box unbekannt, also gilt die
  // Leinwand als Inhalt (kX/kY = 0, kH = 1).
  const m = studie.eckdaten?.coverMasse;
  const ratio = m?.w && m?.h ? m.w / m.h : 0.75;
  return {kH: 1, kW: ratio, kX: 0, kY: 0, kBox: ratio};
}

/**
 * Variablen des Fächers selbst. `--st-fae-kbox-eff` ist die Breite des
 * ganzen Stapels in Vielfachen der Fächer-Höhe — daraus deckelt das CSS
 * die Höhe so, dass der Fächer IMMER in seine Spalte passt, auch bei
 * einer sechsten oder siebten Studie. Ohne diesen Deckel wächst ein
 * höhen-normierter Fächer mit jeder weiteren Arbeit aus dem Container.
 */
function faecherVars(studien) {
  const kboxSumme = studien.reduce((s, st) => s + coverNorm(st).kBox, 0);
  const kboxEff = Math.max(
    0.5,
    kboxSumme - (studien.length - 1) * FAECHER_UEBERLAPPUNG,
  );
  return {
    '--st-fae-n': studien.length,
    '--st-fae-ovl': FAECHER_UEBERLAPPUNG,
    '--st-fae-kbox-eff': Number(kboxEff.toFixed(5)),
  };
}

/** Variablen einer einzelnen Kachel. `--st-i` steuert nur die Stapelfolge. */
function kachelVars(studie, i) {
  const n = coverNorm(studie);
  return {
    '--st-i': i,
    '--st-kh': n.kH,
    '--st-kw': n.kW,
    '--st-kx': n.kX,
    '--st-ky': n.kY,
    '--st-kbox': n.kBox,
  };
}

export function StudienUebersicht() {
  const produkte = untersuchteProdukte();
  const anzahl = zahlwort(STUDIEN.length);

  /**
   * KLICKVERHALTEN (Teil B2/B3): Klick/Enter/Space auf eine Titelseite im
   * Fächer vergrößert sie UND springt zur Karte derselben Studie weiter
   * unten. Die Auftrags-Prämisse "das gibt es schon" war an der Live-Seite
   * widerlegt (weder klickbar noch fokussierbar) — das hier ist Neubau,
   * nicht Nachbesserung.
   *
   * ID-BASIERT, NICHT POSITIONSBASIERT: Ziel ist `#${studie.id}`
   * (`e0001`…), nicht "die dritte Karte". Sortiert STUDIEN künftig um oder
   * kommt eine sechste Arbeit dazu, bleibt der Sprung korrekt — dieselbe
   * Wurzel wie bei der Kanon-Zuordnung in Teil A.
   */
  const [aktiveStudie, setAktiveStudie] = useState(null);
  const letzterAusloeserRef = useRef(null);
  const schliessenRef = useRef(null);

  function oeffneUndSpringe(studie, ausloeserEl) {
    letzterAusloeserRef.current = ausloeserEl;
    setAktiveStudie(studie);
    const ziel = document.getElementById(studie.id);
    if (ziel) {
      ziel.scrollIntoView({
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        block: 'start',
      });
    }
  }

  function schliessen() {
    setAktiveStudie(null);
    // FOKUS-RUECKGABE: ohne das verliert ein Tastatur-Nutzer nach dem
    // Schliessen die Position im Dokument — der Fokus fiele auf <body>
    // zurueck. Rueckgabe an genau das Element, das den Dialog geoeffnet hat.
    // { preventScroll: true } ist PFLICHT: .focus() scrollt das Ziel sonst
    // in den sichtbaren Bereich und reisst den Nutzer von der Studien-Karte,
    // zu der gerade gesprungen wurde, zurueck zur Faecher-Kachel — das
    // Sprung-Verhalten waere dann beim Schliessen wieder aufgehoben.
    letzterAusloeserRef.current?.focus({preventScroll: true});
  }

  // ESCAPE SCHLIESST — Idiom aus components/Aside.jsx uebernommen
  // (AbortController statt manuellem removeEventListener).
  useEffect(() => {
    if (!aktiveStudie) return undefined;
    const controller = new AbortController();
    document.addEventListener(
      'keydown',
      (ev) => {
        if (ev.key === 'Escape') schliessen();
      },
      {signal: controller.signal},
    );
    // Fokus IN den Dialog, sobald er steht — sonst bleibt der Tastatur-Fokus
    // auf der jetzt verdeckten Auslöser-Kachel stehen. preventScroll, damit
    // dieser Fokuswechsel die parallel laufende Sprung-Animation zur
    // Studien-Karte nicht unterbricht (der Knopf ist ohnehin fixiert und
    // damit immer im sichtbaren Bereich).
    schliessenRef.current?.focus({preventScroll: true});
    return () => controller.abort();
  }, [aktiveStudie]);

  return (
    <div className="qb-st qb-st-übersicht">
      <div className="qb-st-wrap">
        {/* BANNER — das Bild ist kein Schmuck, sondern der Beleg selbst.
            Gezeigt werden die echten Titelseiten aller Publikationen, nicht
            ein Stock-Motiv: die Profi-Praxis für Evidenz-Flächen ist, das
            Dokument zu zeigen statt eine Laborstimmung zu behaupten.
            WICHTIG: der Fächer rendert aus STUDIEN, nicht aus einer Liste im
            Markup. Die fünfte Arbeit (QiHome® Air) fehlte im Banner, WEIL die
            alte Fassung gar kein Bild hatte — eine handgepflegte Bildliste
            hätte denselben Fehler beim nächsten Zuwachs wiederholt. So ist
            Vollzähligkeit eine Eigenschaft der Datenquelle. */}
        <header className="qb-st-hero">
          <div className="qb-st-hero-text">
            <p className="qb-st-kicker">Belege statt Behauptungen</p>
            <h1>Wissenschaftlich getestet und in Fachpublikationen bestätigt</h1>
            <p>
              {initialCap(anzahl)} zellbiologische Untersuchungen zu{' '}
              {aufzaehlung(produkte.map((p) => p.name))}, durchgeführt am
              Institut für zellbiologische Testsysteme von Prof. Dr. Peter C.
              Dartsch und in Fachjournalen veröffentlicht. Jede Studie finden
              Sie hier in verständlicher Zusammenfassung, im vollständigen
              deutschen Text und als englisches Original-PDF.
            </p>
          </div>
          <div className="qb-st-hero-bild">
            <ul className="qb-st-hero-faecher" style={faecherVars(STUDIEN)}>
              {STUDIEN.map((s, i) => (
                <li key={s.id} style={kachelVars(s, i)}>
                  <button
                    type="button"
                    className="qb-st-hero-faecher-knopf"
                    aria-label={`Titelseite der Publikation „${s.eckdaten.titelOriginal}“ im ${s.eckdaten.journal} vergrößern und zur Studie springen`}
                    onClick={(ev) => oeffneUndSpringe(s, ev.currentTarget)}
                  >
                    <img
                      src={s.eckdaten.coverUrl}
                      alt={`Titelseite der Publikation „${s.eckdaten.titelOriginal}“ im ${s.eckdaten.journal}`}
                      width={s.eckdaten.coverMasse?.w}
                      height={s.eckdaten.coverMasse?.h}
                      loading="lazy"
                    />
                  </button>
                </li>
              ))}
            </ul>
            <p className="qb-st-hero-bildunter">
              Die Titelseiten der {anzahl} Publikationen — jede einzeln unten
              als Original-PDF abrufbar.
            </p>
          </div>
        </header>

        <section className="qb-st-sektion" id="studien" aria-labelledby="studien-titel">
          <h2 id="studien-titel">Die {anzahl} Publikationen</h2>
          <p className="qb-st-sektion-intro">
            Klicken Sie auf die Titelseite, um das Original-PDF zu öffnen, oder
            auf „Studie vollständig lesen“ für die deutsche Fassung mit allen
            Abbildungen und Messwerten.
          </p>

          <div className="qb-st-karten">
            {STUDIEN.map((s) => (
              <StudienKarte key={s.id} studie={s} />
            ))}
          </div>
        </section>

        <HrvMessreihe />

        <section className="qb-st-sektion" aria-labelledby="produkte-titel">
          <h2 id="produkte-titel">Die untersuchten Produkte</h2>
          <p className="qb-st-sektion-intro">
            {/* Eine Arbeit kann mehrere Geraete untersuchen — die Summe der
                Karten ist deshalb größer als die Zahl der Studien. */}
            {aufzaehlung(
              produkte.map(
                (p) =>
                  `${initialCap(zahlwort(p.anzahl))} ${
                    p.anzahl === 1 ? 'Arbeit untersucht' : 'Arbeiten untersuchen'
                  } den ${p.name}`,
              ),
            )}
            .
          </p>
          <div className="qb-st-verwandt-grid">
            {produkte.map((p) => (
              <Link key={p.name} to={p.pfad} className="qb-st-verwandt-karte">
                <span className="qb-st-verwandt-kicker">
                  Untersucht in {p.anzahl} {p.anzahl === 1 ? 'Studie' : 'Studien'}
                </span>
                <strong>{p.name}</strong>
                <span className="qb-st-verwandt-text">{p.text}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* LIGHTBOX (Teil B2/B3). role=dialog + aria-modal folgt dem
          Bestands-Muster aus components/Aside.jsx — hier zusaetzlich mit
          Fokus-Falle (Tab bleibt im Dialog) und Fokus-Rueckgabe beim
          Schliessen, was Aside.jsx noch nicht mitbringt. Schliessen geht
          DREIFACH: Escape (Effekt oben), Klick auf den Hintergrund, Klick
          auf das ×-Symbol — "auf Mobilgeraeten darf man nie feststecken". */}
      {aktiveStudie ? (
        // Fokus-Falle des ARIA-Dialog-Musters: der Tastatur-Handler gehoert
        // auf den Dialog-Container, damit Tab/Shift+Tab beim Rand umlaufen
        // statt in die dahinterliegende Seite zu wandern. Der Container
        // selbst bleibt unfokussierbar (kein tabIndex) — nur seine echten
        // interaktiven Kinder (Knopf, Link) sind Ziel der Falle.
        // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
        <div
          className="qb-st-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`Titelseite „${aktiveStudie.eckdaten.titelOriginal}“`}
          onKeyDown={(ev) => {
            // FOKUS-FALLE: Tab/Shift+Tab kreisen zwischen den zwei
            // fokussierbaren Elementen des Dialogs (Schliessen-Knopf,
            // Original-PDF-Link), statt in die verdeckte Seite zu wandern.
            // tabIndex=-1-Elemente (der grossflaechige Hintergrund-Knopf)
            // sind bewusst ausgeschlossen: er ist per Klick/Touch bedienbar,
            // aber ohne sichtbaren Fokus-Ring — in der Tab-Reihenfolge waere
            // er eine unsichtbare Falle fuer Tastatur-Nutzer.
            if (ev.key !== 'Tab') return;
            const fokussierbar = Array.from(
              ev.currentTarget.querySelectorAll('button, a[href]'),
            ).filter((el) => el.tabIndex !== -1);
            if (fokussierbar.length === 0) return;
            const erster = fokussierbar[0];
            const letzter = fokussierbar[fokussierbar.length - 1];
            if (ev.shiftKey && document.activeElement === erster) {
              ev.preventDefault();
              letzter.focus();
            } else if (!ev.shiftKey && document.activeElement === letzter) {
              ev.preventDefault();
              erster.focus();
            }
          }}
        >
          <button
            type="button"
            className="qb-st-lightbox-hintergrund"
            aria-label="Schließen"
            tabIndex={-1}
            onClick={schliessen}
          />
          <div className="qb-st-lightbox-inhalt">
            <button
              type="button"
              className="qb-st-lightbox-schliessen"
              aria-label="Schließen"
              ref={schliessenRef}
              onClick={schliessen}
            >
              ×
            </button>
            <img
              src={aktiveStudie.eckdaten.coverUrl}
              alt={`Titelseite der Publikation „${aktiveStudie.eckdaten.titelOriginal}“ im ${aktiveStudie.eckdaten.journal}`}
              width={aktiveStudie.eckdaten.coverMasse?.w}
              height={aktiveStudie.eckdaten.coverMasse?.h}
            />
            <a
              className="qb-st-btn qb-st-lightbox-pdf"
              href={aktiveStudie.eckdaten.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Original-PDF (öffnet im neuen Tab)
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StudienKarte({studie}) {
  const e = studie.eckdaten;
  const laie = studie.laienSummary || {};
  const jahr = (e.veroeffentlicht || '').slice(0, 4);

  return (
    /* AUFBAU (Desktop): EINE Karte je Zeile, Titelseite groß links, Text
       rechts. Der Vorgänger stellte die Karten nebeneinander
       (auto-fit/minmax) — bei fünf Karten wurde die Titelseite dabei auf
       96px gequetscht und war als Bild nicht mehr lesbar. Untereinander
       trägt jede Karte ihre Grafik in voller Größe.
       Warum überhaupt gestapelt: für Evidenz-Listen, die der Leser
       VERGLEICHT, schlägt die Zeilenform das Kachelraster — die Merkmale
       stehen dann bei jeder Studie an derselben Stelle untereinander. */
    <article className="qb-st-karte" id={studie.id} tabIndex={-1}>
      <a
        className="qb-st-karte-cover"
        href={e.pdfUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="Original-Publikation als PDF öffnen (neuer Tab)"
      >
        <img
          src={e.coverUrl}
          alt={`Titelseite der Publikation „${e.titelOriginal}“ im ${e.journal}`}
          width="300"
          height="388"
          loading="lazy"
        />
      </a>

      {/* Diese Spalte MUSS eine Klasse tragen. Ohne sie galt der Vorgabewert
          `min-width: auto` und die Spalte konnte nicht schmaler werden als ihr
          laengstes Wort — bei den deutschen Komposita (Darmepithelzellen,
          Nutzererfahrungen, Zellregeneration) lief sie deshalb aus dem Rahmen.
          Der Vertrag gilt im Grid genauso wie vorher im Flex-Kopf und steht
          in studien.css unter .qb-st-karte-inhalt. */}
      <div className="qb-st-karte-inhalt">
        <h3 className="qb-st-karte-titel">
          <Link to={studienPfad(studie.slug)}>{studie.seo.h1}</Link>
        </h3>
        <p className="qb-st-karte-meta">
          {e.journal}
          {jahr ? ` · ${jahr}` : ''} · {e.produkt}
        </p>
        <p className="qb-st-karte-text">{laie.antwort}</p>
        {laie.punkte?.[0] ? (
          <span className="qb-st-karte-zahl">{laie.punkte[0]}</span>
        ) : null}
        <div className="qb-st-karte-links">
          <Link className="qb-st-btn" to={studienPfad(studie.slug)}>
            Studie vollständig lesen
          </Link>
          <a
            className="qb-st-btn qb-st-btn-flach"
            href={e.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Original-PDF (öffnet im neuen Tab)
          </a>
        </div>
      </div>
    </article>
  );
}

/**
 * Die HRV-Messreihe — unveraendert übernommen aus der Vorgaengerseite, nur in
 * das Token-System der Sektion überfuehrt. Inhaltlich identisch: dieselben
 * Messungen, dieselben Bilder, dieselben Zahlen, dieselbe Anmerkung am Ende.
 * Neu ist ausschließlich die Überschrift-Ebene, die klarstellt, dass dies
 * KEINE der Publikationen ist. Die Anzahl im Hinweistext kommt aus den Daten:
 * genau dieser Satz wäre beim Ergänzen der fuenften Studie still falsch
 * geworden — und er ist der inhaltlich wichtigste der Seite, weil er die
 * hausinterne Messreihe von den Fachpublikationen trennt.
 */
function HrvMessreihe() {
  const rang = [
    {
      lage: ['Messung 1 – Start', 'Stressor – inaktiv', 'Qi Blanco Systeme – inaktiv'],
      src: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/diagram_1-1-1024x883.jpg_1.webp?v=1667543752',
      alt: 'Rangdiagramm der HRV-Messung 1 ohne Stressor und ohne Qi Blanco System',
      bild: 'biol. HRV-Alter (Kurzzeit-HRV): 56 Jahre',
    },
    {
      lage: ['Messung 2 – nach 13 min', 'Stressor – aktiv', 'Qi Blanco Systeme – inaktiv'],
      src: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/diagram_2-1-1024x883.jpg_1.webp?v=1667543774',
      alt: 'Rangdiagramm der HRV-Messung 2 mit aktivem WLAN-Stressor, ohne Qi Blanco System',
      bild: 'biol. HRV-Alter (Kurzzeit-HRV): 61 Jahre',
    },
    {
      lage: ['Messung 7 – nach 60 min', 'Stressor – aktiv', 'Qi Blanco Systeme – aktiv'],
      src: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/diagram_3-1-1024x883.jpg_1.webp?v=1667543810',
      alt: 'Rangdiagramm der HRV-Messung 7 mit aktivem Stressor und aktivem Qi Blanco System',
      bild: 'biol. HRV-Alter (Kurzzeit-HRV): 47 Jahre',
    },
  ];
  const ans = [
    {
      lage: ['Messung 1 – Start', 'Stressor – inaktiv', 'Qi Blanco Systeme – inaktiv'],
      src: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/ANS_1.png_1.webp?v=1667543906',
      alt: 'ANS-Status der Messung 1 ohne Stressor',
    },
    {
      lage: ['Messung 2 – nach 13 min', 'Stressor – aktiv', 'Qi Blanco Systeme – inaktiv'],
      src: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/ANS_2.png_1.webp?v=1667543930',
      alt: 'ANS-Status der Messung 2 mit aktivem Stressor',
    },
    {
      lage: ['Messung 7 – nach 60 min', 'Stressor – aktiv', 'Qi Blanco Systeme – aktiv'],
      src: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/ANS_3.png_1.webp?v=1667543973',
      alt: 'ANS-Status der Messung 7 mit aktivem Stressor und aktivem Qi Blanco System',
    },
  ];

  return (
    <section className="qb-st-sektion" id="hrv" aria-labelledby="hrv-titel">
      <h2 id="hrv-titel">HRV-Messungen</h2>
      <p className="qb-st-sektion-intro">
        <strong>Hinweis zur Einordnung:</strong> Die folgende Messreihe ist{' '}
        <em>keine</em> der {zahlwort(STUDIEN.length)} oben genannten
        Fachpublikationen, sondern eine eigene Versuchsreihe an zwei Probanden.
        Sie ist nicht peer-reviewed und versteht sich als Einzelnachweis.
      </p>

      <div className="qb-st-volltext">
        <p>
          Nachfolgend ist eine Versuchsreihe bzgl. der Einwirkungen von Qi Blanco
          Systemen auf Probanden dargestellt. Die Auswirkungen auf das vegetative
          Nervensystem sind durch die Herzratenvariabilitätsmessungen [HRV], ein
          hochauflösendes Elektrokardiogramm [EKG], dargestellt.
        </p>
        <p>
          Die HRV-Messung gibt ein „biologisches HRV-Alter“ aus, das das Alter
          des Körpers im Vergleich zum Durchschnittsmenschen widerspiegelt.
          Insgesamt wurden pro Proband 7 HRV-Messungen durchgeführt. Grafisch
          dargestellt sind folgende 3 Messungen:
        </p>
        <ul>
          <li>
            1. Messung: Verhalten des Körpers ohne zusätzlichen Stressor oder Qi
            Blanco Systemen
          </li>
          <li>2. Messung: Verhalten des Körpers mit einem zusätzlichen Stressor</li>
          <li>
            7. Messung: Verhalten des Körpers nach 1 Stunde Einwirkung durch den
            Stressor; Qi Blanco Systeme sind aktiv
          </li>
        </ul>

        <h3>1. Rangdiagramm</h3>
        <div className="qb-st-hrv-grid">
          {rang.map((m, i) => (
            <figure key={i} className="qb-st-hrv-bild">
              <img src={m.src} alt={m.alt} loading="lazy" />
              <figcaption>
                {m.lage.map((z, j) => (
                  <span key={j}>
                    {z}
                    <br />
                  </span>
                ))}
                <strong>{m.bild}</strong>
              </figcaption>
            </figure>
          ))}
        </div>
        <p>
          Trotz WLAN-Signals (Stressor) aus einer Entfernung &lt; 1 m sank bei
          der Aktivierung der Qi Blanco Systeme das biol. HRV-Alter um 14 Jahre.
          Dies entspricht einer Reduktion um 23 % (Messung 2 / Messung 7).
        </p>

        <h3>2. Autonomes Nervensystem [ANS] Status</h3>
        <div className="qb-st-hrv-grid">
          {ans.map((m, i) => (
            <figure key={i} className="qb-st-hrv-bild">
              <img src={m.src} alt={m.alt} loading="lazy" />
              <figcaption>
                {m.lage.map((z, j) => (
                  <span key={j}>
                    {z}
                    <br />
                  </span>
                ))}
              </figcaption>
            </figure>
          ))}
        </div>
        <p>
          Der ANS-Status verbessert sich im Vergleich zum Ausgangszustand, trotz
          Stressor, bei aktiven Qi Blanco Systemen um 20 %.
        </p>

        <h3>3. Versuchsaufbau</h3>
        <p>
          <strong>3.1 Getestete Produkte:</strong>
          <br />
          3.1.1) Qi Blanco – QiOne endless
          <br />
          3.1.2) Qi Blanco – QiOne Master Prototyp
        </p>
        <p>
          <strong>3.2 Messequipment:</strong>
          <br />
          3.2.1) HF Hochfrequenz-Analyser: 59B-HF Analyser Gigahertz Solutions –
          27 MHz – 25 000 MHz
          <br />
          3.2.2) HRV-Messgerät: HRV-Scanner standard Professional – Software
          Version 3.02.05
        </p>
        <p>
          <strong>3.3 Stressor:</strong>
          <br />
          WLAN-Router: NETGEAR WG602 – 54 Mbps / IEEE 802.11b/g / 2,412–2,472 GHz
          | Strahlungsintensität: &gt;20,00 µW/m² – befindet sich ca. 1 m Abstand
          auf Herzhöhe des Probanden.
        </p>

        <h3>4. Versuchsablauf</h3>
        <p>
          Durchgeführt wurden insgesamt 7 Messungen. Testproband: männlich, 32
          Jahre alt; Versuchsdauer: 1:11 h
        </p>
        <figure className="qb-st-hrv-bild">
          <img
            src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Strahlung_Messung-1024x357.png_1_600x600.webp?v=1667544462"
            alt="Zeitverlauf des Versuchsablaufs der HRV-Messreihe über sieben Messungen"
            loading="lazy"
          />
        </figure>
        <p>
          Während der 1. Messung waren weder der Stressor noch die Qi Blanco
          Systeme im Einsatz. Der Stressor wurde ab der 2. Messung angeschaltet
          und kontinuierlich bis zur 7. Messung eingesetzt. Die Qi Blanco Systeme
          wurden während der 3., 4., 5. und 7. Messung eingesetzt.
        </p>

        <h3>5. Validierung</h3>
        <p>Testproband: männlich, 43 Jahre alt; Versuchsdauer: 1:40 h</p>
        <figure className="qb-st-hrv-bild">
          <img
            src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Strahlung_Messung_Validierung-1024x357.png_1_600x600.webp?v=1667544595"
            alt="Zeitverlauf der Validierungsmessung am zweiten Probanden"
            loading="lazy"
          />
        </figure>
        <p>
          <strong>Merkmale der Validierung:</strong>
        </p>
        <ol>
          <li>
            Die geringe HF-Band Funktion steigt kontinuierlich über die
            Versuchsdauer, bis sie ein Normalniveau von ca. 250 ms² erreicht.
          </li>
          <li>
            Die Deaktivierung der Qi Blanco Systeme in Versuchsreihe 6 zeigt in
            beiden Fällen einen sprungartigen Anstieg der Körperaktivitäten.
          </li>
          <li>
            Die Aktivierung des Stressors ist deutlich in den Aufzeichnungen zu
            erkennen. Der Körper wird stark beansprucht.
          </li>
          <li>
            Mit aktiven Qi Blanco Systemen verbessern sich die Körperfunktionen
            mit zunehmender Einwirkdauer.
          </li>
        </ol>
        <p>Die Validierung ist somit erfolgreich.</p>

        <h3>6. Weiterführende Messungen</h3>
        <p>Testproband: männlich, 32 Jahre alt; Versuchsdauer: 2:29 h</p>
        <figure className="qb-st-hrv-bild">
          <img
            src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Strahlung_WeitereMessung-1024x319.png_1_600x600.webp?v=1667544753"
            alt="Zeitverlauf der weiterführenden HRV-Messungen über 2:29 Stunden"
            loading="lazy"
          />
        </figure>

        <h3>Anmerkung zu den Versuchen</h3>
        <p>
          Für weitere Fragen stehen wir unter{' '}
          <a href="mailto:info@qiblanco.com">info@qiblanco.com</a> zur Verfügung.
        </p>
        <p>
          Wir möchten darauf hinweisen, dass es sich hierbei um Einzelnachweise
          handelt. Jeder Mensch ist unterschiedlich und die jeweiligen
          Auswirkungen dadurch individuell. Die hier dargestellten Versuche
          dienen der Möglichkeit, die Auswirkungen der Qi Blanco® Systeme auf den
          menschlichen Körper qualitativ einstufen zu können.
        </p>
      </div>
    </section>
  );
}
