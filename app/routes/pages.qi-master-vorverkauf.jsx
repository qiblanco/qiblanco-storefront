import {redirect} from 'react-router';

/*
 * /pages/qi-master-vorverkauf — 301 auf /pages/qi-alpha-vorverkauf.
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
  throw redirect(`/pages/qi-alpha-vorverkauf${url.search}`, 301);
}

export default function QiMasterVorverkaufRedirect() {
  return null;
}

/** @typedef {import('react-router').LoaderFunctionArgs} LoaderFunctionArgs */
