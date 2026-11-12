/*
 * DIE LEBENDIGE KUGEL — die eine Standard-Komponente fuer AI Anna als Kugel.
 *
 * Job 20261112-prio2-ai-anna-lebendige-kugel-standarddesign-frag-anna,
 * Christian 12.11.2026 („eine wirklich lebendige Kugel … ein Standarddesign …
 * unsere Planetenidee und unsere kuenstliche Intelligenz").
 *
 * Ueberall, wo Anna als goldene Kugel/Kreis erscheint, steht DIESE Komponente:
 *   - „Eine Frage? Frag Anna."  (AppleAnna, apple-seite/AppleSektionen.jsx)
 *   - „Noch eine Frage?"        (TheAlphaFaq, campaign/TheAlphaFaq.jsx)
 * Der Chat-Launcher (qi-salesbot, Annas Gesicht im blauen Kreis) ist ein
 * eigener, von Christian am 25.10.2026 festgelegter Zustand und bleibt davon
 * unberuehrt.
 *
 * Stil: app/styles/anna-kugel.css (per @import in apple-seite.css und
 * the-alpha-faq.css, also ohne eigenen <link>). Nur CSS, kein JS-Takt.
 *
 * STANDARD: die Fassung, die Christian waehlt. Bis zu seiner Wahl steht hier
 * die Empfehlung 'lichtkern'; die Wahl ist genau diese eine Zeile.
 */

export const ANNA_KUGEL_VARIANTEN = Object.freeze(['atem', 'planet', 'lichtkern', 'orbit']);
export const STANDARD = 'lichtkern';

/**
 * @param {{groesse?: number, variante?: string, className?: string}} props
 *   groesse in px (Standard 56, wie die Bestandskugel bei „Noch eine Frage?").
 */
export function AnnaKugel({groesse = 56, variante = STANDARD, className = ''}) {
  const v = ANNA_KUGEL_VARIANTEN.includes(variante) ? variante : STANDARD;
  return (
    <span
      className={`anna-kugel${className ? ` ${className}` : ''}`}
      data-variante={v}
      data-anna-kugel=""
      aria-hidden="true"
      style={{'--ak-groesse': `${groesse}px`}}
    >
      <span className="anna-kugel__schein" />
      <span className="anna-kugel__bahn" />
      <span className="anna-kugel__koerper">
        <span className="anna-kugel__flaeche" />
        <span className="anna-kugel__kern" />
        <span className="anna-kugel__kern2" />
        <span className="anna-kugel__glanz" />
      </span>
      <span className="anna-kugel__bahn-vorn" />
      <span className="anna-kugel__mond-y">
        <span className="anna-kugel__mond-x">
          <span className="anna-kugel__mond" />
        </span>
      </span>
    </span>
  );
}

export default AnnaKugel;
