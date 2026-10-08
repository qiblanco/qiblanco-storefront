import {ROBOTS_KOPF, WEBINARE, WebinarSeite, webinarMeta} from '~/components/campaign/WebinarSeite';
import webinarStyles from '~/styles/webinar.css?url';

/**
 * /pages/webinar-elektrosmog — Anmeldeseite zum kostenlosen Webinar „Strahlung im
 * Alltag“ (Grossjob Webinar-Manager, s02). Texte, Termin und Formular-Id stehen in
 * WEBINARE.esmog (components/campaign/WebinarSeite.jsx). noindex ohne canonical
 * (Kampagnenseite). Bestätigung und Zoom-Link: /pages/webinar-elektrosmog-angemeldet.
 */
const W = WEBINARE.esmog;

export const links = () => [{rel: 'stylesheet', href: webinarStyles}];
export const meta = () => webinarMeta(W);
export const headers = () => ROBOTS_KOPF;

export default function WebinarElektrosmog() {
  return <WebinarSeite w={W} />;
}
