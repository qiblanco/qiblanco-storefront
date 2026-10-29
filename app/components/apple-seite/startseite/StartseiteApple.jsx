import startseiteAppleStyles from '~/styles/start-b-apple.css?url';
import {mitMarkeR} from '~/components/reusables/MarkeR';
import {StickyKaufknopf} from '~/components/rookie/start/StickyKaufknopf';
import {AppleSeite} from '../AppleSeite';
import {Sektion} from '../AppleSektionen';
import {bildSrcSet, mitBreite} from '../apple-seite-logik';
import {MODELLE, startseiteSektionen} from './startseite-daten';
import {useStartseitePreise} from './startseite-preise';

/*
 * APPLE-FASSUNG DER STARTSEITE (s04): / rendert Arm A, /pages/start-b Arm B
 * von start-e1-gs081. Welche Sektionen in welcher Reihenfolge stehen, sagt
 * startseite-daten.js; hier steht nur der Rahmen und die Gerätereihe, die der
 * Baukasten nicht kennt. Ihr Stil liegt in styles/start-b-apple.css und nimmt
 * nur --as-*-Tokens.
 *
 * Messanker wie der Baukasten: data-section="as-modelle" für die Reihe,
 * B trägt den Sticky-Kaufknopf der Rookie (data-section
 * "start-b-sticky-kaufknopf", Stil aus rookie-start.css, das links() von
 * start-b weiter lädt).
 */

function Modelle({preise}) {
  return (
    <section className="as-sektion sa-modelle" data-section="as-modelle">
      <h2 className="as-h2">{mitMarkeR(MODELLE.titel)}</h2>
      <ul className="sa-modelle-liste">
        {MODELLE.liste.map((g) => (
          <li key={g.name} className="sa-modell">
            <img
              className="as-bild sa-modell-bild"
              src={mitBreite(g.bild.url, 750)}
              srcSet={bildSrcSet(g.bild.url, [480, 750, 1080])}
              sizes="(min-width: 750px) 33vw, 100vw"
              alt={g.bild.alt}
              width={g.bild.breite}
              height={g.bild.hoehe}
              loading="lazy"
              decoding="async"
            />
            <h3 className="sa-modell-name">{mitMarkeR(g.name)}</h3>
            <p className="sa-modell-zeile">{g.zeile}</p>
            {preise[g.kaufen] ? <p className="as-preis">{preise[g.kaufen]}</p> : null}
            <div className="sa-modell-wege">
              <a className="btn btn--primary as-knopf" href={g.kaufen} data-as-cta="primary">
                Jetzt kaufen
              </a>
              <a className="as-link" href={g.details}>
                Mehr erfahren
              </a>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * @param {{seite: 'startseite'|'start-b', produkte?: Array<any>}} props
 *   produkte: aus startseiteProdukte() im Loader; jeder Kaufknopf bekommt
 *   den Preis seiner Kaufseite als Zeile darunter.
 */
export function StartseiteApple({seite, produkte = []}) {
  const arm = seite === 'start-b' ? 'b' : 'a';
  const preise = useStartseitePreise(produkte);
  const sektionen = startseiteSektionen(arm).map((s) =>
    s.cta?.href && preise[s.cta.href] ? {...s, preis: preise[s.cta.href]} : s,
  );
  return (
    <>
      <link rel="stylesheet" href={startseiteAppleStyles} />
      <AppleSeite seite={seite}>
        {sektionen.map((s, i) =>
          s.art === 'modelle' ? (
            <Modelle key="modelle" preise={preise} />
          ) : (
            <Sektion key={`${s.art}-${i}`} index={i} {...s} />
          ),
        )}
        {arm === 'b' ? (
          <StickyKaufknopf
            kopfSelektor="[data-apple-seite='start-b'] [data-section='as-hero']"
            kaufknopfSelektor="[data-apple-seite='start-b'] [data-section='as-band'] [data-as-cta='primary']"
          />
        ) : null}
      </AppleSeite>
    </>
  );
}

export default StartseiteApple;
