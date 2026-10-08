import {ROBOTS_KOPF, WEBINARE, WebinarSeite, webinarMeta} from '~/components/campaign/WebinarSeite';
import webinarStyles from '~/styles/webinar.css?url';

/**
 * /pages/webinar-kohaerentes-wasser — Anmeldeseite zum kostenlosen Webinar „Das Geheimnis
 * im Wasser“ (Grossjob Webinar-Manager, s02). Texte, Termin und Formular-Id stehen in
 * WEBINARE.wasser (components/campaign/WebinarSeite.jsx). noindex ohne canonical
 * (Kampagnenseite). Bestätigung und Zoom-Link: /pages/webinar-kohaerentes-wasser-angemeldet.
 */
const W = WEBINARE.wasser;

export const links = () => [{rel: 'stylesheet', href: webinarStyles}];
export const meta = () => webinarMeta(W);
export const headers = () => ROBOTS_KOPF;

export default function WebinarWasser() {
  return <WebinarSeite w={W} />;
}
