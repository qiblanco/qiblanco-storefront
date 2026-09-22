import {useId, useState} from 'react';
import {ChevronDown} from 'lucide-react';

/**
 * FaqListe — die EINE Frage-Antwort-Liste des Hauses.
 *
 * WARUM ES DIESE DATEI GIBT (Grossjob 20260922-GROSSJOB-alle-knoepfe-kommen-
 * aus-dem-bausatz, Christian am 22.09.2026: „kontrollier gleich mal alle
 * Knoepfe auf der Homepage nach diesem bekannten Fehler und lass sie
 * reparieren"):
 *
 * Gemessen am ausgelieferten Dokument trugen ZEHN Knoepfe auf /pages/support
 * je 225 Zeichen `style`-Attribut — eine zweite, von Hand gezeichnete
 * Akkordeon-Fassung in `app/routes/pages.support.jsx`. Sie war nicht bloss
 * anders gestaltet, sie war SCHLECHTER als der Bestand: ohne Klasse, ohne
 * `aria-expanded`, ohne `aria-controls`. Ein Screenreader konnte den Zustand
 * einer Frage dort nicht ansagen.
 *
 * DIESE DATEI IST EINE EXTRAKTION, KEIN NEUENTWURF. Jede Zeile unten stand
 * vorher in `app/components/ProductFAQ.jsx` und ist von dort hierher gezogen;
 * ProductFAQ ruft sie jetzt auf, statt sie zu enthalten. Damit hat das Haus
 * EINE Akkordeon-Mechanik statt zweier — und die Support-Seite bekommt die
 * bessere, nicht die Support-Seite eine dritte.
 *
 * WAS BEWUSST NICHT MITGEWANDERT IST: die aufklappbare Ueberschrift, der
 * Rahmen (`.ProductFAQ NormalSectionSize`) und das FAQPage-JSON-LD. Alle drei
 * gehoeren dem AUFRUFER, nicht der Liste — und beim JSON-LD ist das eine
 * Sachentscheidung, keine Bequemlichkeit: /pages/support fuehrt einen dritten,
 * inhaltlich ungeprueften FAQ-Bestand (drei bekannte Widersprueche zu anderen
 * Live-Flaechen, siehe Kopf von pages.support.jsx). Ihn als strukturierte
 * Daten zu veroeffentlichen waere eine Inhaltsentscheidung — und die ist laut
 * Kopf von `app/lib/faq-schema.js` ein Christian-Gate.
 *
 * DIE KLASSEN HEISSEN WEITER `.ProductFAQ__*`, OBWOHL SIE JETZT GETEILT SIND.
 * Das ist entschieden, nicht vergessen: die Regeln stehen in der global
 * geteilten `app/styles/app.css`, und ihre Beruehrung zieht jede importierende
 * Seite in den Deploy-Diff — darunter Seiten mit vorbestehender Pixelschuld,
 * an der der Deploy dann blockt (dieselbe Begruendung steht seit dem
 * 2026-09-11 im Kopf von ProductFAQ.jsx). Ein reiner Namensgewinn ist diesen
 * Preis nicht wert. Die Umbenennung ist als Befund gemeldet, nicht still
 * unterlassen.
 *
 * @param {{items: Array<{q: string, a: string}>}} props
 */
export function FaqListe({items}) {
  const [openIndex, setOpenIndex] = useState(null);
  const baseId = useId();

  return (
    <div className="ProductFAQ__list">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        const answerId = `${baseId}-faq-answer-${i}`;
        return (
          <div key={i} className="ProductFAQ__item">
            <button
              type="button"
              className="ProductFAQ__question"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
              aria-controls={answerId}
            >
              <span>{item.q}</span>
              <ChevronDown
                size={20}
                style={{
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.25s ease',
                  flexShrink: 0,
                }}
              />
            </button>
            {/* Antwort IMMER im DOM (SSR/crawlbar); nur visuell per hidden geklappt. */}
            {/*
              Absaetze: eine Antwort mit Leerzeile wird in <p> zerlegt, sonst
              liefe der zweite Absatz an den ersten an (Textknoten kollabiert
              den Umbruch). Antworten OHNE Leerzeile bleiben ein nackter
              Textknoten wie bisher — das Markup jedes Bestands-Items ist
              damit byte-identisch. Das JSON-LD ist nicht betroffen:
              normalizeText() faltet den Umbruch ohnehin zu einem Leerzeichen.

              ABSTAND INLINE statt in app.css: app/styles/app.css ist global
              geteilt, und seine Beruehrung zieht Seiten mit VORBESTEHENDER
              Pixelschuld (qibracelet-details, schlaf-zellen-schutz) in den
              Deploy-Diff und blockt ihn -- an einer Schuld, die dieser Bau
              nicht verursacht hat. Der Chevron daneben setzt seinen Stil aus
              demselben Grund schon inline.
            */}
            <div
              id={answerId}
              className="ProductFAQ__answer"
              role="region"
              hidden={!isOpen}
            >
              {item.a.includes('\n\n')
                ? item.a
                    .split(/\n{2,}/)
                    .map((absatz, k) => (
                      <p key={k} style={{margin: k === 0 ? 0 : '0.9rem 0 0'}}>
                        {absatz}
                      </p>
                    ))
                : item.a}
            </div>
          </div>
        );
      })}
    </div>
  );
}
