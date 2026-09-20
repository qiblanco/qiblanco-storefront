import {useId, useState} from 'react';
import {ChevronDown, ChevronUp} from 'lucide-react';
import {faqPageJsonLdString} from '~/lib/faq-schema';

/**
 * FAQ accordion component for product pages.
 *
 * Crawlbarkeit (FJ2, GEO/AEO): Die Antworten stehen JETZT server-seitig im
 * initialen HTML — sie werden IMMER gerendert und per `hidden`-Attribut nur
 * visuell ein-/ausgeklappt (WAI-ARIA-Accordion-Muster) statt bedingt gemountet.
 * Zusaetzlich wird ein FAQPage-JSON-LD emittiert, ABER NUR für faktisch saubere
 * Q&A-Items (faqPageJsonLdString filtert geflaggte + eso-/wirkmechanismus-
 * behaftete Items heraus — Content-Bereinigung = Christian-Gate).
 *
 * @param {{ items: Array<{q: string, a: string, flag?: string}> }} props
 */
export function ProductFAQ({items}) {
  const [sectionOpen, setSectionOpen] = useState(true);
  const [openIndex, setOpenIndex] = useState(null);
  const baseId = useId();

  // Reine Datenauszeichnung — nur saubere Items (Rest wartet auf Christian-Go).
  const jsonLd = faqPageJsonLdString(items);

  return (
    <div className="ProductFAQ NormalSectionSize" style={{maxWidth: '860px', padding: '3rem 1.5rem 5rem'}}>
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{__html: jsonLd}}
        />
      ) : null}

      <div
        className="ProductFAQ__header"
        onClick={() => setSectionOpen((o) => !o)}
      >
        <h2 style={{marginBottom: 0}}>Häufig gestellte Fragen (FAQ)</h2>
        {sectionOpen ? <ChevronUp size={28} /> : <ChevronDown size={28} />}
      </div>

      {sectionOpen && (
        <div className="ProductFAQ__list">
          {items.map((item, i) => {
            const isOpen = openIndex === i;
            const answerId = `${baseId}-faq-answer-${i}`;
            return (
              <div key={i} className="ProductFAQ__item">
                <button
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
                          <p
                            key={k}
                            style={{margin: k === 0 ? 0 : '0.9rem 0 0'}}
                          >
                            {absatz}
                          </p>
                        ))
                    : item.a}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
