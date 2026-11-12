/*
 * DIE LEBENDIGE KUGEL — die eine Standard-Komponente für AI Anna als Kugel.
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
 * unberührt.
 *
 * Stil: app/styles/anna-kugel.css (per @import in apple-seite.css und
 * the-alpha-faq.css, also ohne eigenen <link>). Nur CSS, kein JS-Takt.
 *
 * STANDARD: Christian hat am 12.11.2026 gewählt: „Und bei der Kugel passt es
 * auch mit dem Lichtkern. Empfehlung 3." Also 'lichtkern' (Kugel = 3).
 *
 * KLICK ÖFFNET DEN CHAT (Christian 12.11.2026: „Und wenn jemand draufklickt,
 * dann eben auf diesen Kugel, dann geht der AI-Chat auf"). Die Kugel ist ein
 * <button data-anna-chat>. Den Klick nimmt der Anna-Loader (qi-salesbot,
 * src/lib, „Anna auf Zuruf“) selbst entgegen und öffnet den Chat wie der
 * Launcher. Die Seite braucht dafür kein eigenes Skript. Mit knopf={false}
 * bleibt sie ein reines Bild (aria-hidden).
 * Job 20261112-prio1-ai-anna-kugel-3-lichtkern (beide Shops live).
 */

export const ANNA_KUGEL_VARIANTEN = Object.freeze(['atem', 'planet', 'lichtkern', 'orbit']);
export const STANDARD = 'lichtkern';

/** Das Attribut, auf das der Anna-Loader hört (qi-salesbot, „Anna auf Zuruf“). */
export const ANNA_CHAT_ATTR = 'data-anna-chat';

/** Props für jedes Element, das Annas Chat öffnen soll (Kugel, Überschrift). */
export function annaChatProps(wo = 'titel') {
  return {[ANNA_CHAT_ATTR]: wo};
}

/**
 * @param {{groesse?: number, variante?: string, className?: string, knopf?: boolean, label?: string}} props
 *   groesse in px (Standard 56, wie die Bestandskugel bei „Noch eine Frage?").
 *   knopf: true = <button>, Klick öffnet Annas Chat (Standard).
 */
export function AnnaKugel({
  groesse = 56,
  variante = STANDARD,
  className = '',
  knopf = true,
  label = 'Chat mit Anna öffnen',
}) {
  const v = ANNA_KUGEL_VARIANTEN.includes(variante) ? variante : STANDARD;
  const Huelle = knopf ? 'button' : 'span';
  const knopfProps = knopf
    ? {type: 'button', 'aria-label': label, ...annaChatProps('kugel')}
    : {'aria-hidden': 'true'};
  return (
    <Huelle
      className={`anna-kugel${knopf ? ' anna-kugel--knopf' : ''}${className ? ` ${className}` : ''}`}
      data-variante={v}
      data-anna-kugel=""
      {...knopfProps}
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
    </Huelle>
  );
}

export default AnnaKugel;
