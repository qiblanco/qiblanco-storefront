import {mitMarkeR} from '~/components/reusables/MarkeR';
import {useKaufleisteSicht} from '~/lib/kaufleiste-sicht';
import {DETAIL_KAUFLEISTE_AN, detailKaufleisteSichtbar} from './detail-kaufleiste-lage';

/*
 * KAUFLEISTE DER DETAILSEITEN — fest am unteren Rand, mobil, von nach dem Kopf
 * bis zum Seitenende. Regel und Anlass: detail-kaufleiste-lage.js.
 *
 * NICHTS NEUES: Name, Preis und Knopf sind dieselben wie im Kopf der Seite
 * (derselbe Wortlaut „Jetzt kaufen“, dieselbe Kaufseite, der Preis aus
 * startseite-preise.js). Ein Link, kein Warenkorb-Knopf: die Detailseite
 * führt auf die Kaufseite wie jeder ihrer Knöpfe.
 *
 * CHAT-KUGEL UND DIALOGE wie die Schlussleiste: der Inhalt steht nur im
 * sichtbaren Zustand im DOM (KaufknopfChatSignal misst per childList),
 * data-qb-chat-weicht schiebt Annas Kugel über die Leiste.
 *
 * Der eigene Knopf trägt data-as-cta="leiste", nicht "primary": die Regel
 * sucht die Kaufknöpfe der Seite über [data-as-cta='primary'] und darf sich
 * nicht selbst finden.
 *
 * @param {{seite: string, name: string, href: string, preis?: string|null}} props
 */
export function DetailKaufleiste({seite, name, href, preis = null}) {
  const sichtbar = useKaufleisteSicht(
    () => {
      const wurzel = document.querySelector(`[data-apple-seite='${seite}']`);
      const kopf = wurzel?.querySelector('[data-section="as-hero"]');
      if (!kopf) return null;
      const knoepfe = Array.from(wurzel.querySelectorAll(`[data-as-cta='primary'][href='${href}']`));
      return {kopf, knoepfe};
    },
    (lage) => {
      const mobil =
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(max-width: 749px)').matches;
      return detailKaufleisteSichtbar({
        geraetAn: mobil ? DETAIL_KAUFLEISTE_AN.mobil : DETAIL_KAUFLEISTE_AN.desktop,
        kopf: lage.kopf,
        knoepfe: lage.knoepfe,
      });
    },
    [seite, href],
  );
  return (
    <div
      className={`pd-kaufleiste${sichtbar ? ' pd-kaufleiste--sichtbar' : ''}`}
      data-section="pd-kaufleiste"
      data-kaufleiste-mobil={DETAIL_KAUFLEISTE_AN.mobil ? 'an' : 'aus'}
      data-qb-chat-weicht={sichtbar ? '' : undefined}
      aria-hidden={sichtbar ? undefined : 'true'}
    >
      {sichtbar && (
        <>
          <p className="pd-kaufleiste-auswahl">
            <span className="pd-kaufleiste-name">{mitMarkeR(name)}</span>
            {preis ? <span className="pd-kaufleiste-preis">{preis}</span> : null}
          </p>
          <a className="btn btn--primary as-knopf" href={href} data-as-cta="leiste">
            Jetzt kaufen
          </a>
        </>
      )}
    </div>
  );
}

export default DetailKaufleiste;
