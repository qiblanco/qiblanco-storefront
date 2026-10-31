import {Outlet, useLoaderData} from 'react-router';
import {Rechtsseite} from '~/components/Rechtsseite';
import {appleSeiteLaden, appleSeiteFuerPfad} from '~/lib/apple-seiten';

/**
 * SEGMENT-LAYOUT für /policies/*  (flatRoutes-Konvention).
 *
 * WARUM ES DIESE DATEI GIBT (Job 20260815-designmeister-rechtsseiten...):
 * Bis hierher war /policies/* unveraenderte Hydrogen-Boilerplate — ein
 * ungestyltes <div className="policy"> mit zwei <br />. Ein Design-Fix nur in
 * policies.$handle.jsx hätte dieselbe Luecke für jede KUENFTIGE Route unter
 * /policies gelassen.
 *
 * Weil diese Datei den Namens-Stamm der Gruppe trägt, macht flatRoutes sie
 * automatisch zum Eltern-Layout von policies._index.jsx UND
 * policies.$handle.jsx — und von allem, was spaeter unter /policies dazukommt.
 * Der Design-Rahmen ist damit nicht mehr "mitzudenken", sondern strukturell
 * unumgehbar: eine neue Policy-Route kann gar nicht mehr ungestaltet
 * erscheinen, weil sie ohne dieses Layout nicht gerendert wird.
 *
 * (Die Gegenrichtung ist im Repo belegt: widerruf_.bestaetigen.jsx nutzt den
 * Unterstrich-Suffix, um sich BEWUSST aus einem Eltern-Layout auszuhaengen.)
 */
/**
 * Apple-Fassung (Grossjob 20261029 alle-shop-seiten-apple-niveau, s12): der
 * Schalter hängt an der KIND-Seite (/policies, /policies/refund-policy, …),
 * das Layout kennt sie nur über den Pfad. Ohne Zeile in app/lib/apple-seiten.js
 * bleibt die Seite C.
 */
export function loader({request, context}) {
  const pfad = new URL(request.url).pathname.replace(/\/+$/, '') || '/';
  return {appleSeite: appleSeiteLaden(context, appleSeiteFuerPfad(pfad))};
}

/** Das Layout bleibt beim Wechsel zwischen zwei Policies stehen; sein Loader
 * muss trotzdem neu laufen, weil jede Policy ihren eigenen Schalter hat. */
export function shouldRevalidate({currentUrl, nextUrl, defaultShouldRevalidate}) {
  return currentUrl.pathname !== nextUrl.pathname || defaultShouldRevalidate;
}

export default function PoliciesLayout() {
  const {appleSeite} = useLoaderData();
  return (
    <Rechtsseite apple={appleSeite}>
      <Outlet />
    </Rechtsseite>
  );
}
