import {useKaufleisteSicht} from '~/lib/kaufleiste-sicht';
import {SCHLUSSLEISTE_AN, schlussleisteSichtbar} from './schlussleiste-lage';

/*
 * DIE SCHLUSSLEISTE DER KONFIGURATOR-KAUFSEITEN — fest am unteren Rand, mobil,
 * sobald der Kaufknopf der Zusammenfassung nach oben weggescrollt ist. Regel
 * und Anlass: schlussleiste-lage.js.
 *
 * NICHTS NEUES, ALLES AUS DER ZUSAMMENFASSUNG: die Aufrufstelle reicht Name,
 * Summe und GENAU DEN Knopf herein, den die Zusammenfassung zeigt (dieselben
 * Warenkorbzeilen, dieselbe Beschriftung, derselbe Ablauf danach). Kein neuer
 * Wortlaut. Benutzt von product-pages/AlphaVorlage.jsx und
 * campaign/TheAlphaShop.jsx.
 *
 * CHAT-KUGEL UND DIALOGE wie die Kaufleiste der B-Fassung (Kaufleiste.jsx):
 * der Inhalt steht nur im sichtbaren Zustand im DOM (KaufknopfChatSignal misst
 * per childList), data-qb-chat-weicht schiebt die Kugel über die Leiste,
 * html[data-dialog-offen] blendet sie aus. Der Fuß bekommt mobil ihre Höhe als
 * festes Polster (the-alpha-shop.css), damit Impressum, Datenschutz und
 * Widerruf frei bleiben.
 *
 * @param {{
 *   wurzel: {current: HTMLElement | null},
 *   name: import('react').ReactNode,
 *   betrag: import('react').ReactNode,
 *   abschnitt?: string,
 *   children: import('react').ReactNode,
 * }} props
 */
export function Schlussleiste({wurzel, name, betrag, abschnitt = 'schlussleiste', children}) {
  const sichtbar = useKaufleisteSicht(
    () => {
      const seite = wurzel?.current;
      if (!seite) return null;
      return {knopf: seite.querySelector('[data-tas-zusammenfassung] .tas-kaufknopf')};
    },
    (lage) => {
      const mobil =
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(max-width: 749px)').matches;
      return schlussleisteSichtbar({
        geraetAn: mobil ? SCHLUSSLEISTE_AN.mobil : SCHLUSSLEISTE_AN.desktop,
        knopf: lage.knopf,
      });
    },
    [wurzel],
  );
  return (
    <div
      className={`tas-schlussleiste${sichtbar ? ' tas-schlussleiste--sichtbar' : ''}`}
      data-section={abschnitt}
      data-schlussleiste-mobil={SCHLUSSLEISTE_AN.mobil ? 'an' : 'aus'}
      data-schlussleiste-desktop={SCHLUSSLEISTE_AN.desktop ? 'an' : 'aus'}
      data-qb-chat-weicht={sichtbar ? '' : undefined}
      aria-hidden={sichtbar ? undefined : 'true'}
    >
      {sichtbar && (
        <>
          <p className="tas-schlussleiste-auswahl">
            <span className="tas-schlussleiste-name">{name}</span>
            <span className="tas-schlussleiste-betrag">{betrag}</span>
          </p>
          <div className="tas-schlussleiste-knopf">{children}</div>
        </>
      )}
    </div>
  );
}
