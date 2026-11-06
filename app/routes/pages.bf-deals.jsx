// `data` umbenannt: meta() destrukturiert selbst ein Argument namens `data`.
import {data as mitHeadern, useLoaderData} from 'react-router';
import {Bf2026Landing} from '~/components/black-friday-2026/Bf2026Seiten';
import {bf2026Modus} from '~/data/black-friday-2026';
import {bf2026HeaderAusLoader, bf2026Meta} from '~/lib/bf2026-meta';
import {bf2026LandingLaden} from '~/lib/bf2026-seiten.server';
import {noindexHeader} from '~/lib/seo';

/*
 * LANDINGPAGE BLACK FRIDAY 2026 (Grossjob 20261103-prio6-black-friday-2026-…, s04).
 * Schalter BF2026_SEITEN off (Standard): 404, wie heute, dann greift der
 * Admin-Redirect /pages/bf-deals -> / (storefrontRedirect feuert nur bei 404).
 * vorschau: noindex in Meta und Header. on: Livegang, nur auf Elinas Wort (s06).
 */
export const meta = ({data}) => bf2026Meta(data?.bf2026);

export const headers = bf2026HeaderAusLoader;

export async function loader(args) {
  const modus = bf2026Modus(args.context.env);
  if (modus === 'off') throw new Response(null, {status: 404});
  const bf2026 = await bf2026LandingLaden(args, modus);
  return mitHeadern({bf2026}, modus === 'vorschau' ? {headers: noindexHeader()} : undefined);
}

export default function BlackFridayLanding() {
  const {bf2026} = useLoaderData();
  return <Bf2026Landing seite={bf2026} />;
}

/** @typedef {import('react-router').LoaderFunctionArgs} LoaderFunctionArgs */
