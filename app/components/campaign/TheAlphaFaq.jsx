import {useId, useState} from 'react';
import {
  THE_ALPHA_FAQ_ANNA,
  THE_ALPHA_FAQ_TITEL,
  theAlphaFaqAufgeloest,
} from './the-alpha-faq-daten.js';

/*
 * FRAGEN ZUM QI ALPHA (Christian 26.10.2026, Z172–Z208; Grossjob
 * 20261026-prio1-the-alpha-variante-a-designmeister-premium-gestaltung, s07).
 *
 * EIN BAUSTEIN, VIER SEITEN: /products/the-alpha (ton="hell", unter der
 * Wissens-Strecke) und die Landingpages /pages/The-Alpha, -B und -C
 * (ton="film", schwarz, nach der Edition-Szene, vor dem Shop-Fuß). Die Texte
 * kommen aus the-alpha-faq-daten.js, der einen Quelle.
 *
 * AKKORDEON NACH APPLE-ART: immer höchstens eine Frage offen; beim Laden ist
 * Christians Leitfrage offen (Z195), damit ihre Antwort das Erste ist, was
 * man liest. Jede Frage ist ein echter <button> mit aria-expanded und
 * aria-controls (Tastatur: Tab, Enter, Leertaste; Pfeil hoch/runter springt
 * zur Nachbarfrage). Die Antworten stehen IMMER im ausgelieferten HTML
 * (GEO R2), geschlossene nur ausgeblendet über `hidden`-Zustand im CSS, nicht
 * erst per JavaScript geladen.
 *
 * DIE KAUFLEISTE der Film-Seiten bleibt über diesem Abschnitt verborgen wie
 * im Abspann (Z40), weil er NACH der Edition-Szene steht: TheAlphaPremium
 * blendet die Leiste aus, solange [data-tap-ende] im Bild ODER schon oben
 * vorbei ist. Der Abschnitt trägt bewusst KEIN eigenes data-tap-ende: der
 * Beobachter führt nur EINEN Merker (endeDa), ein zweites Ende darunter
 * setzt ihn beim Zurückscrollen auf false, und die Leiste käme über der
 * Edition-Szene wieder.
 */
export function TheAlphaFaq({ton = 'hell', vergeben}) {
  const fragen = theAlphaFaqAufgeloest(vergeben);
  const [offen, setOffen] = useState(fragen[0]?.id ?? null);
  const basis = useId();

  function taste(e, i) {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const knoepfe = e.currentTarget
      .closest('[data-the-alpha-faq]')
      ?.querySelectorAll('[data-faq-frage]');
    if (!knoepfe?.length) return;
    e.preventDefault();
    const n = knoepfe.length;
    const ziel = e.key === 'ArrowDown' ? (i + 1) % n : (i - 1 + n) % n;
    knoepfe[ziel].focus();
  }

  return (
    <section
      className={`taf taf--${ton}`}
      aria-labelledby={`${basis}-titel`}
      data-the-alpha-faq=""
    >
      <div className="taf-innen">
        <h2 id={`${basis}-titel`} className="taf-titel">
          {THE_ALPHA_FAQ_TITEL}
        </h2>
        <ul className="taf-liste">
          {fragen.map((f, i) => {
            const istOffen = offen === f.id;
            const kopf = `${basis}-${f.id}-frage`;
            const rumpf = `${basis}-${f.id}-antwort`;
            return (
              <li
                key={f.id}
                className="taf-eintrag"
                data-offen={istOffen ? 'ja' : 'nein'}
              >
                <h3 className="taf-kopf">
                  <button
                    type="button"
                    id={kopf}
                    className="taf-frage"
                    aria-expanded={istOffen}
                    aria-controls={rumpf}
                    data-faq-frage={f.id}
                    onClick={() => setOffen(istOffen ? null : f.id)}
                    onKeyDown={(e) => taste(e, i)}
                  >
                    <span>{f.frage}</span>
                    <span className="taf-zeichen" aria-hidden="true" />
                  </button>
                </h3>
                <div
                  id={rumpf}
                  role="region"
                  aria-labelledby={kopf}
                  className="taf-antwort"
                  data-faq-antwort={f.id}
                >
                  <div className="taf-antwort-innen">
                    {f.antwort.map((a) => (
                      <p key={a}>{a}</p>
                    ))}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="taf-anna" data-the-alpha-faq-anna="">
          <span className="taf-kugel" aria-hidden="true" />
          <p className="taf-anna-titel">{THE_ALPHA_FAQ_ANNA.titel}</p>
          <p className="taf-anna-text">{THE_ALPHA_FAQ_ANNA.text}</p>
        </div>
      </div>
    </section>
  );
}

export default TheAlphaFaq;
