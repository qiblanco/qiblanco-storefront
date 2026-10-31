import lpAppleStyles from '~/styles/lp-apple.css?url';
import lpAppleKursStyles from '~/styles/lp-apple-kurs.css?url';
import {AppleSeite} from '../AppleSeite';
import {AppleAnna} from '../AppleSektionen';

/*
 * HÜLLE DER APPLE-KURSLEKTIONEN (Grossjob 20261029-GROSSJOB-alle-shop-seiten-
 * apple-niveau-ausser-seo-geo, s07-r3). Die Lektion selbst bleibt die von
 * components/kurse/CourseLesson.jsx: Titel, Video, der Text aus Shopify
 * (Christians Wortlaut, Zeichen für Zeichen) und die Kurs-Navigation. Apple
 * ist hier Satzspiegel und Ruhe: Lesebreite, Typo-Skala, ein Bild-Radius,
 * Weißraum (lp-apple-kurs.css, nur hier geladen, damit die übrigen Apple-LPs
 * vom Kurs-Satzspiegel unberührt bleiben), dazu Anna am Ende.
 *   const lektion = <CourseLesson … />;
 *   return appleSeite?.an ? <KursApple seite={appleSeite.seite}>{lektion}</KursApple> : lektion;
 */
export function KursApple({seite, children}) {
  return (
    <>
      <link rel="stylesheet" href={lpAppleStyles} />
      <link rel="stylesheet" href={lpAppleKursStyles} />
      <AppleSeite seite={seite}>
        <div className="as-kurs">{children}</div>
        <AppleAnna />
      </AppleSeite>
    </>
  );
}

export default KursApple;
