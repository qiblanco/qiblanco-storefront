import {useEffect} from 'react';
import {
  ATTRIBUTION_SCHLUESSEL,
  mitPartnerRef,
  partnerParameterAus,
} from '~/lib/kakao-adressen';

/**
 * Partner-Brücke zum Kakao-Laden (Begründung und Messung:
 * app/lib/kakao-adressen.js, Abschnitt PARTNER-BRÜCKE). Ein Klick auf einen
 * Verweis nach crystal-cacao.com bekommt die beim Eintreffen gemerkte
 * Partner-Referenz (sca_ref, sca_source) angehängt. Rendert nichts, wirft nie.
 */
function gemerkt() {
  let roh = '';
  try {
    roh = window.sessionStorage.getItem(ATTRIBUTION_SCHLUESSEL) || '';
  } catch {
    roh = '';
  }
  if (!roh) {
    const m = document.cookie.match(new RegExp(`(?:^|; )${ATTRIBUTION_SCHLUESSEL}=([^;]*)`));
    if (m) {
      try {
        roh = decodeURIComponent(m[1]);
      } catch {
        roh = '';
      }
    }
  }
  return partnerParameterAus(roh);
}

export function KakaoPartnerBruecke() {
  useEffect(() => {
    function beiKlick(ereignis) {
      try {
        const a = ereignis.target?.closest?.('a[href]');
        if (!a) return;
        const neu = mitPartnerRef(a.href, gemerkt());
        if (neu !== a.href) a.setAttribute('href', neu);
      } catch {
        // Die Brücke darf keinen Klick stören.
      }
    }
    document.addEventListener('click', beiKlick, true);
    document.addEventListener('auxclick', beiKlick, true);
    return () => {
      document.removeEventListener('click', beiKlick, true);
      document.removeEventListener('auxclick', beiKlick, true);
    };
  }, []);
  return null;
}
