import {useRef} from 'react';
import {useActionData, useLocation} from 'react-router';

/**
 * Die Antwort einer Formular-Aktion, gehalten über eine Revalidierung hinweg.
 *
 * WARUM: beantwortet ein Kunde den Cookie-Banner mit "Notwendige Cookies
 * akzeptieren", ruft Hydrogens useCustomerPrivacy (Root) revalidate(). Für
 * React Router ist das eine Navigation ohne formMethod, und dann setzt der
 * Router actionData auf null (react-router 7.16, completeNavigation:
 * isActionReload ist falsch). Jede Ansicht, die nur aus useActionData() lebt,
 * verliert dabei ihre Antwort: "Danke für deine Nachricht!" wird wieder zum
 * leeren Formular, eine Fehlermeldung verschwindet. Belegfälle F-2566 (PR #724,
 * /widerruf/bestaetigen) und der Folgejob 20261001-kontakt-produktberatung-
 * revalidierung-wirft-erfolgsmeldung-weg-prio30 (Kontakt, Produktberatung, Konto).
 *
 * WARUM NICHT AM CONSENT-SYNC: die Revalidierung ist gewollt. Sie lässt den
 * Root-Loader die Token nach der Wahl neu lesen; Wahl und Tracking bleiben, wie
 * sie sind. Kaputt ist nur, dass eine Ansicht ihr Gedächtnis an etwas hängt,
 * das eine Revalidierung löscht.
 *
 * WARUM JE location.key: eine Revalidierung behält den Ort und damit den
 * Schlüssel; jede echte Navigation (neues Absenden, Link, Zurück) bringt einen
 * anderen. Gehalten wird also genau über die Revalidierung hinweg und nicht
 * darüber hinaus. Wer die Seite neu betritt, bekommt den alten Zustand nicht
 * untergeschoben.
 *
 * Neue Seite mit useActionData()? Diesen Hook nehmen. Oder useFetcher: dessen
 * fetcher.data überlebt eine Revalidierung ohnehin (so der Warenkorb).
 */
export function halteAktionsergebnis(gehalten, actionData, key) {
  if (actionData) return {key, data: actionData};
  if (gehalten.key !== key) return {key, data: null};
  return gehalten;
}

export function useAktionsergebnisUeberRevalidierung() {
  const actionData = useActionData();
  const {key} = useLocation();
  const gehalten = useRef({key: null, data: null});
  gehalten.current = halteAktionsergebnis(gehalten.current, actionData, key);
  return gehalten.current.data;
}
