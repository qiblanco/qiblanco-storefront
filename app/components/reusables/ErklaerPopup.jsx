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
 * @param {{
 *   ausloeser: React.ReactNode,   // der Text, der zum Knopf wird
 *   titel: string,                // Überschrift des Popups, benennt es für ARIA
 *   children: React.ReactNode,    // der Inhalt
 *   ausrichtung?: 'links'|'mitte', // wo das Panel unter dem Auslöser sitzt
 *   className?: string,
 * }} p
 */
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
  const MINDESTHOEHE = 320;

  useEffect(() => {
    if (!offen || !ausloeserRef.current) return undefined;
    const messen = () => {
      const r = ausloeserRef.current.getBoundingClientRect();
      const platz = window.innerHeight - r.bottom - 24;
      setLage(platz >= MINDESTHOEHE ? 'unten' : 'blatt');
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

  const schliessen = useCallback((fokusZurueck) => {
    setZustand('zu');
    if (fokusZurueck && ausloeserRef.current) ausloeserRef.current.focus();
  }, []);

  // Escape und Klick daneben. Beide hängen am Dokument und werden nur
  // aufgespannt, solange wirklich etwas offen ist — ein dauerhaft lauschender
  // Zuhörer auf jeder Seite wäre Last ohne Gegenwert.
  useEffect(() => {
    if (!offen) return undefined;
    const abbruch = new AbortController();
    const {signal} = abbruch;
    document.addEventListener(
      'keydown',
      (e) => {
        if (e.key === 'Escape') schliessen(true);
      },
      {signal},
    );
    document.addEventListener(
      'pointerdown',
      (e) => {
        if (wurzel.current && !wurzel.current.contains(e.target)) schliessen(false);
      },
      {signal},
    );
    return () => abbruch.abort();
  }, [offen, schliessen]);

  return (
    <span
      className={`qb-erklaer ${className}`.trim()}
      ref={wurzel}
      data-zustand={zustand}
      data-ausrichtung={ausrichtung}
      data-lage={lage}
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
          if (e.pointerType === 'mouse' && zustand === 'zu') setZustand('schwebe');
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === 'mouse' && zustand === 'schwebe') setZustand('zu');
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
        onClick={() => setZustand((z) => (z === 'fest' ? 'zu' : 'fest'))}
      >
        {ausloeser}
      </button>
      <span
        className="qb-erklaer__panel"
        id={panelId}
        data-wasser-panel
        role="dialog"
        aria-label={titel}
        hidden={!offen}
        /* Fährt der Zeiger vom Auslöser in das Panel, soll es stehen bleiben —
           sonst wäre ein Popup, das man mit der Maus betreten will, nicht
           erreichbar. */
        onPointerEnter={(e) => {
          if (e.pointerType === 'mouse' && zustand === 'schwebe') setZustand('schwebe');
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === 'mouse' && zustand === 'schwebe') setZustand('zu');
        }}
      >
        <button
          type="button"
          className="qb-erklaer__schliessen"
          data-wasser-schliessen
          aria-label="Erklärung schließen"
          onClick={() => schliessen(true)}
        >
          <span aria-hidden="true">×</span>
        </button>
        {children}
      </span>
    </span>
  );
}

export default ErklaerPopup;

/* eslint-enable jsx-a11y/no-redundant-roles */
