import appleSeiteStyles from '~/styles/apple-seite.css?url';
import {APPLE_SEITE_ATTR} from '~/lib/apple-seiten';
import {Sektion} from './AppleSektionen';

/*
 * WURZEL JEDER APPLE-FASSUNG (Grossjob 20261029-GROSSJOB-alle-shop-seiten-
 * apple-niveau-ausser-seo-geo, s03; Bauvertrag claude-jobs/<grossjob>/s03/
 * BAUKASTEN.md). Trägt den Marker data-apple-seite="<seite>" (Naht-Vertrag
 * KONZEPT §4.1) und lädt das Token-CSS selbst: links() einer Route kennt die
 * Loaderdaten nicht, mit Schalter aus bleiben die <link>-Tags der Seite also
 * dieselben wie vorher (Muster Konfigurator in routes/products.qione-2-pro.jsx).
 *
 *   <AppleSeite seite="start-b" sektionen={[{art: 'hero', …}, …]} />
 *   <AppleSeite seite="start-b">{eigene Sektionen}</AppleSeite>
 */
export function AppleSeite({seite, sektionen = null, children = null}) {
  const attr = {[APPLE_SEITE_ATTR]: seite};
  return (
    <>
      <link rel="stylesheet" href={appleSeiteStyles} />
      <div className="as-seite" {...attr}>
        {sektionen
          ? sektionen.map((s, i) => <Sektion key={`${s.art}-${i}`} index={i} {...s} />)
          : null}
        {children}
      </div>
    </>
  );
}

/**
 * A oder C in einer Zeile: mit `an` die Apple-Fassung, sonst die heutige
 * Seite (C) unverändert.
 *   const {appleSeite} = useLoaderData();   // appleSeiteLaden(context, '<seite>')
 *   return <AppleSeiteWeiche an={appleSeite.an} seite="<seite>" sektionen={…} alt={<HeutigeSeite />} />;
 */
export function AppleSeiteWeiche({an, seite, sektionen = null, children = null, alt}) {
  if (!an) return alt ?? null;
  return (
    <AppleSeite seite={seite} sektionen={sektionen}>
      {children}
    </AppleSeite>
  );
}

export default AppleSeite;
