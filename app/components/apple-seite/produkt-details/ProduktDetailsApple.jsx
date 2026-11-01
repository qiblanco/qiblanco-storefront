import produktDetailsAppleStyles from '~/styles/produkt-details-apple.css?url';
import {mitMarkeR} from '~/components/reusables/MarkeR';
import {ImgixVideo} from '~/components/reusables/ImgixVideo';
import {ScrollMikroskopVideo} from '~/components/index-components/ScrollMikroskopVideo';
import {AppleSeite} from '../AppleSeite';
import {Sektion} from '../AppleSektionen';
import {useStartseitePreise} from '../startseite/startseite-preise';
import {TechnikKette} from './TechnikKette';
import {DetailKaufleiste} from './DetailKaufleiste';
import {detailKaufleiste} from './detail-kaufleiste-lage';

/*
 * APPLE-FASSUNG DER PRODUKT-DETAILSEITEN (Grossjob 20261029-GROSSJOB-alle-
 * shop-seiten-apple-niveau-ausser-seo-geo, s05). Die Sektionen kommen als
 * Daten (produkt-details/<seite>-daten.js), hier stehen nur der Rahmen und
 * die zwei Videos, die der Baukasten nicht kennt (BAUKASTEN §7: Videos
 * bleiben, als eigenes Kind, mit Vorschaubild).
 *
 * Jeder Knopf auf eine Kaufseite bekommt deren Preis als Zeile darunter
 * (Sicht-Tor kaufknopf_kontext, Preisweg der Startseite: startseite-preise.js).
 * Stil: styles/produkt-details-apple.css, nur --as-*-Tokens.
 */

function VideoSektion({video}) {
  return (
    <section className="as-sektion pd-video" data-section="as-video">
      <h2 className="as-h2">{mitMarkeR(video.titel)}</h2>
      <div className="pd-video-rahmen">
        <ImgixVideo className="pd-video-film" videoPath={video.pfad} fallbackImage={video.poster} />
      </div>
    </section>
  );
}

function MikroskopSektion() {
  return (
    <section className="pd-mikroskop" data-section="as-mikroskop">
      <ScrollMikroskopVideo dataSection="as-mikroskop-video" />
    </section>
  );
}

/**
 * @param {{seite: string, sektionen: Array<any>, video?: any, technik?: any,
 *   produkte?: Array<any>}} props
 *   produkte: aus startseiteProdukte() im Loader (Preise der Kaufseiten).
 *   technik: „So wirkt er“ (TechnikKette), nur wo die Daten sie tragen.
 * Feste Kaufleiste mobil (DetailKaufleiste): Name je Seite, Kaufseite aus dem
 * Kopf (detail-kaufleiste-lage.js), damit am Seitenende ein Kaufknopf im Bild ist.
 */
export function ProduktDetailsApple({seite, sektionen, video = null, technik = null, produkte = []}) {
  const preise = useStartseitePreise(produkte);
  const kaufleiste = detailKaufleiste(seite, sektionen);
  return (
    <>
      <link rel="stylesheet" href={produktDetailsAppleStyles} />
      <AppleSeite seite={seite}>
        {sektionen.map((s, i) => {
          if (s.art === 'video') return video ? <VideoSektion key="video" video={video} /> : null;
          if (s.art === 'mikroskop') return <MikroskopSektion key="mikroskop" />;
          if (s.art === 'technik') return technik ? <TechnikKette key="technik" {...technik} /> : null;
          const preis = s.cta?.href ? preise[s.cta.href] : null;
          return <Sektion key={`${s.art}-${i}`} index={i} {...s} {...(preis ? {preis} : {})} />;
        })}
        {kaufleiste ? (
          <DetailKaufleiste
            seite={seite}
            name={kaufleiste.name}
            href={kaufleiste.href}
            preis={preise[kaufleiste.href] || null}
          />
        ) : null}
      </AppleSeite>
    </>
  );
}

export default ProduktDetailsApple;
