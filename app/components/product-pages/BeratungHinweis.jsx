/*
 * HINWEIS AUF DIE PRODUKTBERATUNG AN DER KAUFSEITE (Hypothese GS-426 der
 * Geschäftssteuerung, Auftrag 20261125-produktberatung-einstieg-kaufseiten-bau).
 * Gemessen 01.-24.11.2026: die Beratungsseite erreichten ~0,5 % der
 * Tagesbesucher, von /products/qihome-air und /products/qi-alpha kam in 14
 * Tagen kein einziger Wechsel. Die Zeile steht unter den Fragen, also im
 * Bereich der Kaufzweifel und nie vor dem Kaufbereich.
 *
 * Bewusst ein einfaches <a>, kein <Link>: der volle Seitenaufruf trägt den
 * Verweis, daraus zählt entry.server.jsx (anonMeldung) den Wechsel
 * „von=/products/<handle>“ (Frühindikator von GS-426). `?von=kaufseite` geht
 * als Buchungsquelle durch QUELLEN_AUS_LINK (pages.produktberatung.jsx) und
 * die Allowlist von produktberatung/src/server.py.
 *
 * NICHT auf /products/qi-alpha: Christian 28.10.2026 Z13 „von dieser
 * Produktseite kommt man nirgendwo anders dahin. Außer in den Warenkorb“.
 * Rückweg: das Prop `nachsatz` an AlphaFaqMitRate in products.qihome-air.jsx
 * entfernen (oder hb-deploy revert des PR).
 */
import {useRef} from 'react';
import {useElinaBewegung} from '~/components/reusables/useElinaBewegung';

export const BERATUNG_HINWEIS = {
  satz: 'Noch unsicher, ob es zu dir passt? Sprich 20 Minuten mit Christian, kostenlos auf Zoom.',
  linkText: 'Termin wählen',
  href: '/pages/produktberatung?von=kaufseite',
};

/** @param {{handle: string}} props */
export function BeratungHinweis({handle}) {
  // Elinas Baukasten (EL-20261108-5bf00bf2): weich einblenden und leicht
  // hochgleiten, einmalig; ohne JavaScript und bei „Bewegung reduzieren“
  // steht die Zeile sofort da.
  const wurzel = useRef(null);
  useElinaBewegung(wurzel);
  return (
    <div className="taf-beratung" ref={wurzel} data-beratung-hinweis={handle}>
      <p className="taf-beratung-satz" data-eb="">
        {BERATUNG_HINWEIS.satz}{' '}
        <a className="taf-beratung-link" href={BERATUNG_HINWEIS.href} data-beratung-link="">
          {BERATUNG_HINWEIS.linkText}
        </a>
      </p>
    </div>
  );
}
