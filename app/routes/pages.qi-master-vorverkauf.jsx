import {redirect} from 'react-router';

/*
 * /pages/qi-master-vorverkauf — 301 auf /pages/The-Alpha.
 *
 * SEIT 2026-10-26 ZIEL /pages/The-Alpha (Christian Z4 vom 25.10.2026: „wir
 * gehen im link weg von qi-alpha hin zu the alpha"; Grossjob 20261025-prio1-
 * the-alpha-..., s06). Ein Sprung, keine Kette über /pages/qi-alpha-vorverkauf.
 *
 * Christian am 2026-10-17: „es heißt nun Qi Alpha" (Grossjob
 * 20261017 zum neuen Namen, Segment s02). Die Landingpage steht seitdem unter pages.qi-alpha-vorverkauf.jsx;
 * dieser Pfad hält die Links aus der Mailkette am Leben. Query-String
 * bleibt erhalten. Bauform wie products.qi-master-goldkette.jsx.
 * Rückweg: diese Datei durch den Stand vor dem Umbau ersetzen (git).
 */

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader({request}) {
  const url = new URL(request.url);
  throw redirect(`/pages/The-Alpha${url.search}`, 301);
}

export default function QiMasterVorverkaufRedirect() {
  return null;
}

/** @typedef {import('react-router').LoaderFunctionArgs} LoaderFunctionArgs */
