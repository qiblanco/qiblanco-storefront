import lpAppleStyles from '~/styles/lp-apple.css?url';
import {AppleSeite} from '../AppleSeite';

/*
 * HÜLLE DER APPLE-LANDINGPAGES (s07): der Baukasten (AppleSeite, Marker
 * data-apple-seite) plus lp-apple.css, die nur Hausregeln im Scope
 * neutralisiert. Lädt ihr CSS selbst wie AppleSeite: links() der Route bleibt
 * unverändert, mit Schalter aus ändert sich am Kopf der Seite nichts.
 *   <LpApple seite={appleSeite.seite} sektionen={ALLTAG_SEKTIONEN} />
 */
export function LpApple({seite, sektionen}) {
  return (
    <>
      <link rel="stylesheet" href={lpAppleStyles} />
      <AppleSeite seite={seite} sektionen={sektionen} />
    </>
  );
}

export default LpApple;
