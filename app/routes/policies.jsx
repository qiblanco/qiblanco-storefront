import {Outlet} from 'react-router';
import {Rechtsseite} from '~/components/Rechtsseite';

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
export default function PoliciesLayout() {
  return (
    <Rechtsseite>
      <Outlet />
    </Rechtsseite>
  );
}
