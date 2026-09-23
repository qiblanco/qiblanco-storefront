/* EINE Regel ist in dieser Datei abgeschaltet, und zwar benannt statt still:
   der Auftrag vom 22.09.2026 nennt `role="button"` am Auslöser ausdrücklich.
   Der Auslöser IST ein <button> und trägt die Rolle damit schon — jsx-a11y hat
   sachlich recht. Die Datei enthält genau ein Element mit einem role-Attribut,
   die Abschaltung deckt also nichts Fremdes mit ab. Wer die Zeile im Auftrag
   fallen lässt, entfernt diesen Block und das Attribut zusammen. */
/* eslint-disable jsx-a11y/no-redundant-roles */
/* Diese eine Regel ist hier abgeschaltet, und zwar benannt statt still:
   der Auftrag vom 22.09.2026 nennt `role="button"` am Auslöser ausdrücklich.
   Der Auslöser IST ein <button> und trägt die Rolle damit schon — jsx-a11y hat
   sachlich recht. Die Datei enthält genau ein Element mit einem role-Attribut,
   die Abschaltung deckt also nichts Fremdes mit ab. Wer die Zeile im Auftrag
   fallen lässt, kann diesen Block ersatzlos entfernen. */
import {useCallback, useEffect, useId, useRef, useState} from 'react';

/**
 * ERKLÄR-POPUP — der Überlagerungs-Baustein des Bausatzes.
 *
 * WARUM ER NEU IST UND NICHT WIEDERVERWENDET WIRD (P10, gemessen von s01):
 * In app/components/ gibt es kein Modal, kein Dialog, kein Tooltip, kein
 * Popover. Der einzige Namenstreffer DialogSignal.jsx ist etwas anderes, und
 * Aside.jsx ist der Warenkorb-/Menü-Schubladen-Drawer mit einem einzigen,
 * seitenweiten Zustand — er trägt genau einen offenen Inhalt je Seite und ist
 * für einen Erklärknopf im Fließtext baulich nicht geeignet.
 *
 * WARUM ALS BAUSTEIN UND NICHT AN DER KOPFZEILE: Christian will hier einen
 * Erklärknopf, und es wird nicht der letzte sein. Als Einzelanfertigung an der
 * Kopfzeile wäre der nächste eine zweite Bauart mit eigener Escape-Behandlung,
 * eigenem Schließkreuz und eigenem Randabstand. Dieser Baustein trägt die
 * Bedienung, der Aufrufer trägt den Inhalt.
 *
 * ER BRINGT KEINE EIGENE ORDNUNG MIT. Ebenenleiter (--z-dialog), Randabstand
 * (--overlay-rand-*) und Mindestgröße des Schließkreuzes (--schliesskreuz-min)
 * kommen aus app/styles/overlay-ordnung.css — erzeugt aus dem Web-Soll des
 * Design-Meisters. Deren Leitsatz gilt hier wörtlich: „Kein Bedienelement darf
 * sichtbar und zugleich nicht treffbar sein."
 *
 * DIE DREI ZUSTÄNDE, UND WARUM ES DREI SIND
 *   'zu'      — nichts offen.
 *   'schwebe' — mit dem Zeiger geöffnet. Verschwindet beim Verlassen, kein X.
 *   'fest'    — angeklickt oder angetippt. Bleibt stehen und schließt über das
 *               X, über Escape oder über einen Klick daneben.
 * Zwei Zustände würden nicht reichen: ein geklicktes Popup darf beim Wegfahren
 * der Maus nicht verschwinden, ein erschwebtes muss es.
 *
 * DER FINGER IST NICHT DIE NACHÜBERSETZUNG DES ZEIGERS. Christian ausdrücklich:
 * auf dem Handy gibt es kein Darüberfahren. Deshalb prüft der Baustein
 * `event.pointerType` an der Quelle — ein Touch-Zeiger löst nie den
 * Schwebe-Zustand aus. Eine nachträgliche Korrektur über eine Media-Query
 * hätte den Zustand erst gesetzt und dann wieder eingefangen; auf Geräten mit
 * beidem (Laptop mit Berührungsbildschirm) wäre das Verhalten geraten.
 *
 * DER INHALT WIRD IMMER GERENDERT, auch im Zustand 'zu'. Das ist Absicht:
 * entstünde er erst beim Öffnen, stünde er in keinem ausgelieferten Quelltext,
 * und weder eine Suchmaschine noch eine Messung am Rand sähe ihn je. Verborgen
 * wird er über `hidden` — damit ist er auch für Vorlesewerkzeuge zu, nicht nur
 * für das Auge.
 *
 * DER WEG VOM WORT INS FENSTER HÄLT ES OFFEN (WCAG 2.1, 1.4.13 „hoverable").
 * Christian am 23.09.2026: „wenn man vom Wort Richtung Popup fährt, muss das
 * Popup bleiben … auf dem Weg zum Popup (da gibt es einen Bereich, wo es
 * verschwinden kann)". Die erste Fassung schloss beim Verlassen des Wortes
 * SOFORT — bevor der Zeiger das Panel erreichen konnte. Jetzt tragen drei
 * Dinge, und keines allein genügt:
 *   1. Schließ-Verzögerung (SCHLIESSEN_MS): wer Wort und Panel verlässt, hat
 *      kurz Zeit zurückzukehren. Deckt die Lücke zwischen Wort und Panel.
 *   2. Sicheres Dreieck: verlässt der Zeiger das WORT, bleibt das Popup offen,
 *      solange er sich im Korridor zwischen Austrittspunkt und Panel bewegt —
 *      auch diagonal und auch dann, wenn das Panel als Blatt weit unten liegt
 *      (dort reicht keine Verzögerung). Ruht er im Korridor, schließt es nach
 *      KORRIDOR_MS; verlässt er ihn, nach SCHLIESSEN_MS.
 *   3. Hover-Intent (OEFFNEN_MS): Überstreichen des Wortes klappt nichts auf.
 * Klicken macht es weiterhin fest, Escape schließt weiterhin.
 *
 * AUF DEM HANDY IST ES EIN BLATT MIT VIER TÜREN HINAUS (Nielsen Norman Group,
 * Material 3 „Bottom sheets"): das X, das Antippen des abgedunkelten
 * Hintergrunds, das Herunterwischen am Greifstreifen, und die Zurück-Geste.
 * Die Zurück-Geste ist die Tür, an der viele Umsetzungen den Leser verlieren:
 * ohne eigenen Verlaufseintrag verlässt sie die SEITE. Das Blatt legt deshalb
 * beim Öffnen einen Eintrag an und nimmt ihn beim Schließen wieder weg. Solange
 * es modal ist, liegt der Fokus darin, die Seite dahinter scrollt nicht, und
 * beim Schließen kehrt der Fokus auf das Wort zurück. Dasselbe gilt für das
 * Blatt am Desktop (Lage 'blatt'): eine Form, dieselben Türen.
 *
 * @param {{
 *   ausloeser: React.ReactNode,   // der Text, der zum Knopf wird
 *   titel: string,                // Überschrift des Popups, benennt es für ARIA
 *   children: React.ReactNode,    // der Inhalt
 *   ausrichtung?: 'links'|'mitte', // wo das Panel unter dem Auslöser sitzt
 *   className?: string,
 * }} p
 */

/* Die Zeiten folgen den gängigen Werten für Hover-Menüs (Schließen 150–300 ms,
   Absicht ~100 ms). Der Korridor bekommt mehr, weil ein Weg zu einem Blatt am
   unteren Rand länger ist als der Sprung über eine Lücke von einem Raster. */
const OEFFNEN_MS = 100;
const SCHLIESSEN_MS = 250;
const KORRIDOR_MS = 700;
/* Ab dieser Strecke nach unten gilt Wischen als Schließen (oder schneller als
   WISCH_TEMPO px/ms über mindestens 24 px — ein kurzer, entschlossener Wisch). */
const WISCH_STRECKE = 80;
const WISCH_TEMPO = 0.6;
/* Dieselbe Grenze wie die Media-Query in qb-erklaer-popup.css. */
const SCHMAL = '(max-width: 749px)';

function imDreieck(p, a, b, c) {
  const s1 = (p.x - b.x) * (a.y - b.y) - (a.x - b.x) * (p.y - b.y);
  const s2 = (p.x - c.x) * (b.y - c.y) - (b.x - c.x) * (p.y - c.y);
  const s3 = (p.x - a.x) * (c.y - a.y) - (c.x - a.x) * (p.y - a.y);
  const neg = s1 < 0 || s2 < 0 || s3 < 0;
  const pos = s1 > 0 || s2 > 0 || s3 > 0;
  return !(neg && pos);
}

/** Liegt p in der konvexen Hülle aus Austrittspunkt und Panel-Rechteck? */
function imKorridor(p, spitze, r) {
  if (p.x >= r.left && p.x <= r.right && p.y >= r.top && p.y <= r.bottom) {
    return true;
  }
  const ecken = [
    {x: r.left, y: r.top},
    {x: r.right, y: r.top},
    {x: r.right, y: r.bottom},
    {x: r.left, y: r.bottom},
  ];
  for (let i = 0; i < 4; i += 1) {
    if (imDreieck(p, spitze, ecken[i], ecken[(i + 1) % 4])) return true;
  }
  return false;
}

export function ErklaerPopup({
  ausloeser,
  titel,
  children,
  ausrichtung = 'links',
  className = '',
}) {
  const [zustand, setZustand] = useState('zu');
  const offen = zustand !== 'zu';
  const wurzel = useRef(null);
  const ausloeserRef = useRef(null);
  const panelRef = useRef(null);
  const basisId = useId();
  const panelId = `${basisId}-panel`;

  // WOHIN DAS PANEL PASST — gemessen beim Öffnen, nicht geraten.
  // Das Panel hängt unter dem Auslöser. Steht der Auslöser weit unten auf der
  // Seite, endet ein angehängtes Panel unter der Sichtkante: gemessen am
  // 2026-09-22 auf der Startseite bei 1280x900 begann es bei y=444 und war
  // 702 px hoch, lief also 246 px über den Rand hinaus. Sichtbar wäre es nur
  // nach dem Weiterscrollen der SEITE, und das schließt es beim Zeiger-Weg.
  // Bleibt unter dem Auslöser zu wenig Platz, legt sich das Panel deshalb als
  // Blatt über den unteren Seitenrand — dieselbe Form, die das Handy ohnehin
  // benutzt.
  const [lage, setLage] = useState('unten');
  const [schmal, setSchmal] = useState(false);
  const MINDESTHOEHE = 320;

  // Modal ist nur das FESTGEHALTENE Blatt. Ein erschwebtes Blatt am Desktop
  // bleibt ein Schwebe-Zustand: ein Vorhang darüber nähme dem Zeiger den Weg.
  const modal = zustand === 'fest' && (schmal || lage === 'blatt');
  const modalRef = useRef(modal);
  modalRef.current = modal;

  useEffect(() => {
    if (!offen || !ausloeserRef.current) return undefined;
    const messen = () => {
      const r = ausloeserRef.current.getBoundingClientRect();
      const platz = window.innerHeight - r.bottom - 24;
      setLage(platz >= MINDESTHOEHE ? 'unten' : 'blatt');
      setSchmal(window.matchMedia(SCHMAL).matches);
      if (wurzel.current) {
        wurzel.current.style.setProperty(
          '--qb-erklaer-platz',
          `${Math.max(platz, 0)}px`,
        );
      }
    };
    messen();
    window.addEventListener('resize', messen);
    return () => window.removeEventListener('resize', messen);
  }, [offen]);

  // --- Zeiger: Absicht, Verzögerung, Korridor ------------------------------
  const oeffnenUhr = useRef(0);
  const schliessenUhr = useRef(0);
  const faellig = useRef(0);
  const korridor = useRef(null); // Austrittspunkt am Wort, solange der Weg zählt

  const schliessenAbbrechen = useCallback(() => {
    window.clearTimeout(schliessenUhr.current);
    schliessenUhr.current = 0;
    korridor.current = null;
  }, []);

  // Plant das Ende des Schwebens. `verschieben` darf einen laufenden Termin
  // nach hinten legen (der Zeiger ist im Korridor unterwegs); ohne es wird ein
  // Termin nur vorgezogen, nie verlängert.
  const schwebeEnde = useCallback((ms, verschieben = false) => {
    const termin = performance.now() + ms;
    if (schliessenUhr.current && !verschieben && faellig.current <= termin) {
      return;
    }
    window.clearTimeout(schliessenUhr.current);
    faellig.current = termin;
    schliessenUhr.current = window.setTimeout(() => {
      schliessenUhr.current = 0;
      korridor.current = null;
      setZustand((z) => (z === 'schwebe' ? 'zu' : z));
    }, ms);
  }, []);

  useEffect(
    () => () => {
      window.clearTimeout(oeffnenUhr.current);
      window.clearTimeout(schliessenUhr.current);
    },
    [],
  );

  // Der Korridor lauscht nur, solange geschwebt wird.
  useEffect(() => {
    if (zustand !== 'schwebe') {
      schliessenAbbrechen();
      return undefined;
    }
    const abbruch = new AbortController();
    document.addEventListener(
      'pointermove',
      (e) => {
        if (
          e.pointerType !== 'mouse' ||
          !korridor.current ||
          !panelRef.current
        ) {
          return;
        }
        const r = panelRef.current.getBoundingClientRect();
        if (imKorridor({x: e.clientX, y: e.clientY}, korridor.current, r)) {
          schwebeEnde(KORRIDOR_MS, true);
        } else {
          korridor.current = null;
          schwebeEnde(SCHLIESSEN_MS);
        }
      },
      {signal: abbruch.signal, passive: true},
    );
    return () => abbruch.abort();
  }, [zustand, schwebeEnde, schliessenAbbrechen]);

  const popupSchliessen = useCallback((fokusZurueck) => {
    setZustand('zu');
    if (fokusZurueck && ausloeserRef.current) ausloeserRef.current.focus();
  }, []);

  // Escape, Klick daneben, und im Modal die Tab-Schleife. Alle hängen am
  // Dokument und werden nur aufgespannt, solange wirklich etwas offen ist — ein
  // dauerhaft lauschender Zuhörer auf jeder Seite wäre Last ohne Gegenwert.
  useEffect(() => {
    if (!offen) return undefined;
    const abbruch = new AbortController();
    const {signal} = abbruch;
    document.addEventListener(
      'keydown',
      (e) => {
        if (e.key === 'Escape') {
          popupSchliessen(true);
          return;
        }
        const panel = panelRef.current;
        if (e.key !== 'Tab' || !modalRef.current || !panel) return;
        const ziele = [
          ...panel.querySelectorAll(
            'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          ),
        ].filter((el) => el.getClientRects().length > 0);
        if (!ziele.length) {
          e.preventDefault();
          panel.focus();
          return;
        }
        const erstes = ziele[0];
        const letztes = ziele[ziele.length - 1];
        const aktiv = document.activeElement;
        if (e.shiftKey && (aktiv === erstes || aktiv === panel)) {
          e.preventDefault();
          letztes.focus();
        } else if (
          !e.shiftKey &&
          (aktiv === letztes || !panel.contains(aktiv))
        ) {
          e.preventDefault();
          erstes.focus();
        }
      },
      {signal},
    );
    document.addEventListener(
      'pointerdown',
      (e) => {
        if (wurzel.current && !wurzel.current.contains(e.target))
          popupSchliessen(false);
      },
      {signal},
    );
    return () => abbruch.abort();
  }, [offen, popupSchliessen]);

  // Festgehalten heißt: der Fokus geht hinein. Das Panel selbst nimmt ihn
  // (tabIndex -1), damit kein Knopf darin ungefragt aktiviert aussieht.
  useEffect(() => {
    if (zustand === 'fest' && panelRef.current) {
      panelRef.current.focus({preventScroll: true});
    }
  }, [zustand]);

  // Das Modal: Seite steht still, und Zurück schließt das Blatt statt die
  // Seite zu verlassen. Der Verlaufseintrag trägt den Zustand des Routers mit
  // (key/idx), und der Zuhörer sitzt in der Capture-Phase und hält das Ereignis
  // an: der Router hat das Hinzufügen nie gesehen und soll das Wegnehmen auch
  // nicht sehen — sonst liefe eine Navigation auf dieselbe Adresse an.
  useEffect(() => {
    if (!modal) return undefined;
    const html = document.documentElement;
    const vorher = html.style.overflow;
    html.style.overflow = 'hidden';

    let eigenerEintrag = false;
    try {
      window.history.pushState(
        {...(window.history.state || {}), qbErklaer: panelId},
        '',
      );
      eigenerEintrag = true;
    } catch {
      eigenerEintrag = false;
    }
    const vomVerlauf = (e) => {
      e.stopImmediatePropagation();
      eigenerEintrag = false;
      popupSchliessen(true);
    };
    window.addEventListener('popstate', vomVerlauf, true);

    return () => {
      html.style.overflow = vorher;
      window.removeEventListener('popstate', vomVerlauf, true);
      // Über X, Vorhang, Wischen oder Escape geschlossen: den eigenen Eintrag
      // wieder wegnehmen, damit das nächste Zurück die Seite verlässt und
      // nicht ins Leere geht. Nur wenn er noch obenauf liegt — nach einer
      // Navigation liegt dort der Eintrag des Routers, und ein Zurück wäre ein
      // Sprung auf die vorige Seite.
      if (
        eigenerEintrag &&
        window.history.state &&
        window.history.state.qbErklaer === panelId
      ) {
        const schlucken = (e) => {
          e.stopImmediatePropagation();
          window.removeEventListener('popstate', schlucken, true);
        };
        window.addEventListener('popstate', schlucken, true);
        window.setTimeout(
          () => window.removeEventListener('popstate', schlucken, true),
          1500,
        );
        window.history.back();
      }
    };
  }, [modal, panelId, popupSchliessen]);

  // --- Wischen am Greifstreifen ------------------------------------------
  const wisch = useRef(null);
  const wischEnde = (e) => {
    const w = wisch.current;
    wisch.current = null;
    const panel = panelRef.current;
    if (!w || !panel) return;
    panel.style.transition = '';
    panel.style.transform = '';
    const tempo = w.dy / Math.max(1, performance.now() - w.t);
    if (
      e.type === 'pointerup' &&
      (w.dy >= WISCH_STRECKE || (w.dy >= 24 && tempo >= WISCH_TEMPO))
    ) {
      popupSchliessen(true);
    }
  };

  return (
    <span
      className={`qb-erklaer ${className}`.trim()}
      ref={wurzel}
      data-zustand={zustand}
      data-ausrichtung={ausrichtung}
      data-lage={lage}
      data-modal={modal ? 'ja' : undefined}
    >
      <button
        type="button"
        ref={ausloeserRef}
        className="qb-erklaer__ausloeser"
        data-wasser-ausloeser
        /* role="button" steht hier neben einem echten <button>, ist also
           technisch doppelt. Der Auftrag nennt es namentlich, und eine
           doppelte, korrekte Rolle ändert am Baum nichts — sie kostet ein
           Attribut und macht die Zusage im ausgelieferten Quelltext lesbar.
           jsx-a11y hält sie für überflüssig und hat damit recht — die Regel ist
           am Kopf dieser Datei mit Grund abgeschaltet, statt den Auftrag still
           zu kürzen. */
        role="button"
        aria-haspopup="dialog"
        aria-expanded={offen}
        aria-controls={panelId}
        onPointerEnter={(e) => {
          if (e.pointerType !== 'mouse') return;
          schliessenAbbrechen();
          if (zustand === 'zu') {
            window.clearTimeout(oeffnenUhr.current);
            oeffnenUhr.current = window.setTimeout(() => {
              setZustand((z) => (z === 'zu' ? 'schwebe' : z));
            }, OEFFNEN_MS);
          }
        }}
        onPointerLeave={(e) => {
          if (e.pointerType !== 'mouse') return;
          window.clearTimeout(oeffnenUhr.current);
          if (zustand === 'schwebe') {
            korridor.current = {x: e.clientX, y: e.clientY};
            schwebeEnde(SCHLIESSEN_MS);
          }
        }}
        /* ES GIBT BEWUSST KEIN onFocus. Die erste Fassung öffnete beim
           Fokussieren den Schwebe-Zustand — und ein Antipper fokussiert. Am
           Handy landete das Popup damit in genau dem Zustand, den man dort
           nicht mehr verlassen kann: ohne Zeiger gibt es kein Verlassen, und
           das Schließkreuz gehört nicht zum Schweben. Gemessen am 2026-09-22
           im Handy-Viewport: data-zustand blieb auf 'schwebe', das X stand auf
           display:none. Das WAR die nachträgliche Übersetzung der
           Zeigersteuerung, vor der der Auftrag warnt. Die Tastatur braucht sie
           auch nicht: Enter und Leertaste lösen den Klick aus, danach ist das
           X über Tab erreichbar und Escape schließt. */
        onClick={() => {
          window.clearTimeout(oeffnenUhr.current);
          schliessenAbbrechen();
          setZustand((z) => (z === 'fest' ? 'zu' : 'fest'));
        }}
      >
        {ausloeser}
      </button>
      {/* Der Vorhang ist Dekoration für das Auge und eine Tür für den Finger.
          Die Tastatur hat Escape und das X; deshalb weder Rolle noch Taste. */}
      <span
        className="qb-erklaer__vorhang"
        data-wasser-vorhang
        aria-hidden="true"
        hidden={!modal}
        onClick={() => popupSchliessen(true)}
      />
      <span
        className="qb-erklaer__panel"
        id={panelId}
        ref={panelRef}
        data-wasser-panel
        role="dialog"
        aria-label={titel}
        aria-modal={modal ? 'true' : undefined}
        tabIndex={-1}
        hidden={!offen}
        /* Fährt der Zeiger vom Auslöser in das Panel, soll es stehen bleiben —
           sonst wäre ein Popup, das man mit der Maus betreten will, nicht
           erreichbar. */
        onPointerEnter={(e) => {
          if (e.pointerType === 'mouse') schliessenAbbrechen();
        }}
        onPointerLeave={(e) => {
          if (e.pointerType !== 'mouse' || zustand !== 'schwebe') return;
          korridor.current = null;
          schwebeEnde(SCHLIESSEN_MS);
        }}
      >
        {/* Der Kopf trägt Greifstreifen und X. Am Desktop ist er kein eigener
            Kasten (display: contents), das X sitzt dort wie bisher in der
            Ecke des Panels. Im Blatt klebt er oben, damit das X auch nach dem
            Scrollen des Inhalts erreichbar bleibt. */}
        <span className="qb-erklaer__kopf">
          <span
            className="qb-erklaer__griff"
            data-wasser-griff
            aria-hidden="true"
            onPointerDown={(e) => {
              if (!modalRef.current || !panelRef.current) return;
              wisch.current = {y: e.clientY, t: performance.now(), dy: 0};
              e.currentTarget.setPointerCapture(e.pointerId);
              panelRef.current.style.transition = 'none';
            }}
            onPointerMove={(e) => {
              const w = wisch.current;
              if (!w || !panelRef.current) return;
              w.dy = Math.max(0, e.clientY - w.y);
              panelRef.current.style.transform = `translateY(${w.dy}px)`;
            }}
            onPointerUp={wischEnde}
            onPointerCancel={wischEnde}
          />
          <button
            type="button"
            className="qb-erklaer__schliessen"
            data-wasser-kreuz
            aria-label="Erklärung schließen"
            onClick={() => popupSchliessen(true)}
          >
            <span aria-hidden="true">×</span>
          </button>
        </span>
        {children}
      </span>
    </span>
  );
}

export default ErklaerPopup;

/* eslint-enable jsx-a11y/no-redundant-roles */
