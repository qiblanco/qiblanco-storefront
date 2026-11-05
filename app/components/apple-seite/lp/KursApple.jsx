import {Children, Fragment, cloneElement, isValidElement} from 'react';
import lpAppleStyles from '~/styles/lp-apple.css?url';
import lpAppleKursStyles from '~/styles/lp-apple-kurs.css?url';
import {AppleSeite} from '../AppleSeite';
import {AppleAnna} from '../AppleSektionen';
import {scharfeLektionsbilder} from './kurs-bilder';

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
 * Trägt das Kind einen Lektionstext (`body`), bekommen dessen Bilder hier die
 * passende Dateigröße (kurs-bilder.js, s07-r12): nur in A, C bleibt gleich.
 */
// Die Lektion steht direkt als Kind oder in einem Fragment (eine Kurs-Route
// stellt einen Hinweis davor); tiefer wird nicht gesucht.
function mitScharfenBildern(kind) {
  if (!isValidElement(kind)) return kind;
  if (typeof kind.props?.body === 'string') {
    return cloneElement(kind, {body: scharfeLektionsbilder(kind.props.body)});
  }
  if (kind.type === Fragment) {
    return cloneElement(kind, {}, Children.map(kind.props.children, mitScharfenBildern));
  }
  return kind;
}

export function KursApple({seite, children}) {
  const inhalt = mitScharfenBildern(children);
  return (
    <>
      <link rel="stylesheet" href={lpAppleStyles} />
      <link rel="stylesheet" href={lpAppleKursStyles} />
      <AppleSeite seite={seite}>
        <div className="as-kurs">{inhalt}</div>
        <AppleAnna />
      </AppleSeite>
    </>
  );
}

export default KursApple;
