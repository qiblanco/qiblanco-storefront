import {ROBOTS_KOPF, WEBINARE, WebinarBestaetigung, zoomLinkAntwort} from '~/components/campaign/WebinarSeite';
import webinarStyles from '~/styles/webinar.css?url';

/**
 * /pages/webinar-kohaerentes-wasser-angemeldet — Bestätigung nach der Anmeldung zum Webinar
 * Wasser (noindex). Hierher führt die Anmeldeseite nach dem Absenden; dieselbe
 * Seite taugt als Ziel des Bestätigungsklicks.
 * ZOOM_LINK: der Beitrittslink (https://…zoom.us/j/…), nur hier und nur auf dem
 * Server; die Action gibt ihn nach der Anmeldung heraus. Bis zum Livegang null.
 */
const ZOOM_LINK = null;
const W = WEBINARE.wasser;

export const links = () => [{rel: 'stylesheet', href: webinarStyles}];
export const meta = () => [
  {title: `Du bist angemeldet: ${W.kurztitel} | Qi Blanco`},
  {name: 'robots', content: 'noindex,nofollow'},
];
export const headers = () => ROBOTS_KOPF;
export const action = ({request}) => zoomLinkAntwort(request, ZOOM_LINK);

export default function WebinarWasserAngemeldet() {
  return <WebinarBestaetigung w={W} />;
}
