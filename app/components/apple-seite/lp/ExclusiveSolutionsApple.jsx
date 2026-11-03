import lpAppleStyles from '~/styles/lp-apple.css?url';
import exclusiveStyles from '~/styles/lp-apple-exclusive.css?url';
import {
  GeldheldenPakete,
  HERO_VIDEO,
  PROBLEM_CARDS,
} from '~/components/campaign/ExclusiveSolutions';
import {YoutubeTimestamp} from '~/components/reusables/YoutubeTimestamp';
import {AppleSeite} from '../AppleSeite';
import {AppleAnna, AppleCtaBand, AppleFakten, AppleHero, AppleKapitel, AppleStimmen} from '../AppleSektionen';
import {BILD, STIMMEN, STUDIEN} from './lp-gemeinsam.js';

/*
 * APPLE-FASSUNG /pages/exclusive-solutions (Grossjob 20261029-GROSSJOB-alle-shop-
 * seiten-apple-niveau-ausser-seo-geo, s07-r8). Die drei Pakete sind dieselbe
 * Komponente wie in C: Bündel, Rabattcodes, Größenwahl und Warenkorb bleiben
 * unverändert, nur die Schilder entfallen und die Fläche kommt aus --as-*.
 * Aussortiert gegenüber C: Kennzahlen im Kopf, Nutzerzahlen, Emojis und die
 * doppelten Studien- und Vorteilsblöcke. Texte aus C.
 *   return appleSeite?.an ? <ExclusiveSolutionsApple … /> : <ExclusiveSolutions … />;
 */
const ANKER = '#pakete';

const FAKTEN_VERTRAUEN = [
  {zahl: '10', titel: 'Jahre Forschung', satz: 'In Zellstudien gemessen und in Fachzeitschriften veröffentlicht.'},
  {zahl: '100%', titel: 'Made in Germany', satz: 'Entwickelt und hergestellt in Deutschland mit hochwertigsten Materialien.'},
  {zahl: '20', titel: 'Tage risikofrei', satz: 'Nicht überzeugt? Volle Rückerstattung ohne Wenn und Aber. Inkl. Käuferschutz.'},
];

function Interview() {
  if (!HERO_VIDEO.youtubeId) return null;
  return (
    <section className="as-sektion" data-section="as-interview">
      <h2 className="as-h2">Das Interview mit Christian.</h2>
      <div className="as-ex-video">
        <YoutubeTimestamp
          videoId={HERO_VIDEO.youtubeId}
          startSeconds={HERO_VIDEO.startSeconds || 0}
          thumbnail={HERO_VIDEO.thumbnail}
          titel="Das Interview mit Christian."
        />
      </div>
    </section>
  );
}

function Loesung() {
  return (
    <section className="as-sektion" data-section="as-loesung">
      <p className="as-etikett">Die Lösung</p>
      <h2 className="as-h2">Ein unsichtbarer Schutzschild für dein Zuhause.</h2>
      <p className="as-absatz as-ex-absatz">
        Der Gitterchip® im Inneren jedes Qi Blanco Produkts erzeugt ein kohärentes Feld. Dieses Feld
        unterstützt die natürliche Struktur des Wassers in deinen Zellen. Keine Batterien, kein Strom,
        kein Verschleiß.
      </p>
      <div className="as-ex-video">
        <YoutubeTimestamp
          videoId="PQfmajgjR7E"
          startSeconds={0}
          thumbnail="https://i.ytimg.com/vi/PQfmajgjR7E/maxresdefault.jpg"
          titel="So funktioniert der Schutz"
        />
      </div>
    </section>
  );
}

export function ExclusiveSolutionsApple({seite, products = []}) {
  return (
    <>
      <link rel="stylesheet" href={lpAppleStyles} />
      <link rel="stylesheet" href={exclusiveStyles} />
      <AppleSeite seite={seite}>
        <AppleHero
          overline="Geldhelden-exklusiv"
          titel="Schütz dein Umfeld. Schärf deinen Fokus. Sichere deine Leistung."
          unter="Drei Pakete für alle, die nicht einsteigen, sondern ankommen wollen."
          bild={BILD.paar}
          cta={{text: 'Paket wählen', href: ANKER}}
        />
        <Interview />
        <AppleFakten
          titel="Was du nicht siehst, kann deiner Familie trotzdem schaden."
          kacheln={PROBLEM_CARDS.map((k, i) => ({zahl: String(i + 1), titel: k.title, satz: k.body}))}
        />
        <Loesung />
        <GeldheldenPakete products={products} schild={false} />
        <AppleKapitel
          etikett="Die Wissenschaft"
          titel="10 Jahre Forschung. In Zellstudien gemessen."
          absaetze={STUDIEN.slice(0, 2).map((s) => `${s.titel}: ${s.ergebnis} ${s.grenze}`)}
          quellen={STUDIEN.slice(0, 2).map((s) => s.quelle)}
        />
        <AppleStimmen titel="Erfahrungen, die für sich sprechen." stimmen={STIMMEN} />
        <AppleFakten titel="Warum Qi Blanco" kacheln={FAKTEN_VERTRAUEN} />
        <AppleCtaBand
          titel="Sicher dir jetzt dein Paket."
          text="Einmalig, kein Abo, 20 Tage risikofrei."
          cta={{text: 'Paket wählen', href: ANKER}}
          hell
        />
        <AppleAnna />
      </AppleSeite>
    </>
  );
}

export default ExclusiveSolutionsApple;
