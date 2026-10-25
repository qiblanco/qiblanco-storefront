import {Link} from 'react-router';
import {THE_ALPHA_SCHLUSS, THE_ALPHA_KAUF_ZIEL} from '~/components/campaign/the-alpha-daten';

/*
 * KAUF-BAUSTEIN THE ALPHA — der rote Knopf „Jetzt Exklusiv Reservieren“ für
 * alle drei Varianten (A /pages/The-Alpha, C /pages/The-Alpha-B,
 * B /pages/The-Alpha-C), Grossjob 20261025-prio1-the-alpha-landingpage-
 * figma-vorlage-a-server-b-ki-c, s03. B und C importieren ihn (keine Kopie).
 *
 * WOHIN ER FÜHRT: auf die Kaufseite, an EINER Datenstelle
 * (THE_ALPHA_KAUF_ZIEL in app/components/campaign/the-alpha-daten.js). Christian hat am 25.10.2026
 * den Kauf auf die neue Shopseite /products/the-alpha gelegt (Z9/Z10,
 * Nachtrag Coworker BS 09:32Z: „Der Knopf ‚Jetzt Exklusiv Reservieren‘ auf
 * A/B/C führt auf /products/the-alpha“). Bis die Shopseite live ist, zeigt
 * die Datenstelle auf die heute kaufbare Seite (Wunschnummer wählt man dort).
 *
 * Ein Link, kein Knopf mit Zustand: er funktioniert ohne JavaScript, und
 * „klickbar“ heißt hier „führt auf eine Seite, auf der man kauft“.
 *
 * DAS WURZEL-ELEMENT TRÄGT `data-the-alpha-kauf`: daran misst die Naht-Probe
 * probe_naht_kaufbaustein.py, dass alle drei Varianten DIESEN Baustein tragen.
 * Stil: .ta-kauf/.ta-knopf in app/styles/the-alpha.css (das Rot der Vorlage
 * steht nur hier).
 */

/**
 * @param {{knopfText?: string, ziel?: string, className?: string}} props
 */
export function TheAlphaKauf({
  knopfText = THE_ALPHA_SCHLUSS.knopf,
  ziel = THE_ALPHA_KAUF_ZIEL,
  className = '',
}) {
  return (
    <div className={`ta-kauf ${className}`} data-the-alpha-kauf="">
      <Link className="ta-knopf" to={ziel} prefetch="intent">
        {knopfText}
      </Link>
    </div>
  );
}

export default TheAlphaKauf;
