import lpAppleStyles from '~/styles/lp-apple.css?url';
import kakaoKursStyles from '~/styles/lp-apple-kakao-kurs.css?url';
import {ActiveCampaignForm} from '~/components/reusables/ActiveCampaignForm';
import {AppleSeite} from '../AppleSeite';
import {AppleAnna, AppleCtaBand, AppleHero, AppleKapitel} from '../AppleSektionen';

/*
 * APPLE-FASSUNG /pages/zeremonie-kakao-kurs (Grossjob 20261101-GROSSJOB-
 * crystal-cacao-apple-stil-1zu1-spiegel-videos-selbst-hosten-r2, s03; Muster
 * SuperhumanApple.jsx aus dem Grossjob 20261029). Dasselbe Formular wie C
 * (formId 21, Weiche ActiveCampaignForm), Annas und Christians Vorstellung
 * Wort für Wort. Aussortiert gegenüber C: „Warum ist dieser Kurs kostenlos?“
 * und der Fließtext „Was dich erwartet“ (dieselben Themen stehen in den vier
 * Video-Kacheln), das zweite Anmeldeformular am Ende (der Knopf führt zum
 * ersten), der Hintergrund-Banner (2043 × 744, auf dem Handy 142 px hoch).
 *   return appleSeite?.an ? <KakaoKursApple seite={appleSeite.seite} /> : <KakaoKurs />;
 */
const ANKER = '#anmeldung';
const CDN = 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/';

const BILD_KURS = {
  url: `${CDN}Mockup-Kakao-Zeremonie-Kurs-v2-2x-1024x599.jpg_1.webp?v=1670867359`,
  alt: 'Der Zeremonie-Kakao-Kurs auf Laptop und Handy',
  breite: 1024,
  hoehe: 599,
};

const BILD_PAAR = {
  url: `${CDN}2022-07-26-qiblanco-berlin-1001088.png?v=1679327456`,
  alt: 'Anna und Christian Bernd Bauer',
  breite: 2995,
  hoehe: 3058,
};

// Christians und Annas Vorstellung aus C (components/kurse/KakaoKurs.jsx), Wortlaut.
const VORSTELLUNG = [
  'Wir sind Anna und Christian, und zusammen haben wir uns dazu entschieden, unser Wissen und unsere Erfahrungen in einem Kurs zu teilen. Christian, als Ingenieur, Physiker und Biochemiker betrachtet den menschlichen Körper aus einer einzigartigen Perspektive, die ihm geholfen hat, seine eigene persönliche Leidensgeschichte zu überwinden. Anna hat ein besonderes Gespür und Händchen, wenn es um die Entfaltung der Intuition und der Wiedervereinigung mit unserer Urkraft geht.',
  'Durch den Kurs wirst du lernen, wie du deine Intuition stärken und dich mit deinem Körper und deiner Seele verbinden kannst.',
];

// Die vier Videos aus C, Titel und Fragen im Wortlaut, Minuten aus C.
const VIDEOS = [
  {
    nr: '1',
    titel: 'Intuition erfahren',
    dauer: '9 min',
    punkte: ['Was ist Intuition?', 'Welchen Vorteil bringt dir das im Alltag?', 'Was hat Zeremonie-Kakao damit zu tun?'],
  },
  {
    nr: '2',
    titel: 'Zeremonie-Kakao. Was ist das?',
    dauer: '8 min',
    punkte: ['Warum enthält er so viele Inhaltsstoffe?', 'Wo kommt er her?', 'Wie wird er hergestellt?'],
  },
  {
    nr: '3',
    titel: 'Die Kakao-Kur in der Anwendung',
    dauer: '8 min',
    punkte: ['Wie erwärmt man ihn richtig?', 'Wie schont man die Inhaltsstoffe?', 'Wie konsumiert man ihn?'],
  },
  {
    nr: '4',
    titel: 'Mit Zeremonie-Kakao meditieren',
    dauer: '4 min',
    punkte: ['Warum überhaupt meditieren?', 'Wie und wie lange?', 'Welche Effekte bringt es mit sich?'],
  },
];

function Anmeldung() {
  return (
    <section className="as-sektion as-kk-anmeldung" id="anmeldung" data-section="as-anmeldung">
      <h2 className="as-h2">Hol dir den Kurs jetzt kostenfrei.</h2>
      <div className="as-kk-karte">
        <ActiveCampaignForm formId="21" />
      </div>
      <p className="as-kk-klein">
        Deine Eintragung ist unverbindlich. Wenn dir der Kurs nicht gefällt, kannst du dich
        jederzeit mit nur einem Klick wieder austragen und du erhältst keine weiteren E-Mails von uns.
        Wenn du dich für den Kurs anmeldest, erhältst du außerdem die neuesten Biohacking-Tipps und
        Informationen über Qi Blanco® in deinen Posteingang.
      </p>
    </section>
  );
}

function Videos() {
  return (
    <section className="as-sektion" data-section="as-fakten">
      <h2 className="as-h2">Vier Videos, 29 Minuten</h2>
      <ul className="as-kacheln">
        {VIDEOS.map((v) => (
          <li key={v.nr} className="as-kachel">
            <span className="as-kachel-zahl">{v.nr}</span>
            <span className="as-kachel-titel">{v.titel}</span>
            <span className="as-kachel-satz as-kk-dauer">{v.dauer}</span>
            {v.punkte.map((p) => (
              <span key={p} className="as-kachel-satz">
                {p}
              </span>
            ))}
          </li>
        ))}
      </ul>
    </section>
  );
}

/*
 * DER KAKAO ZUM KURS (s11, 2026-11-14, Entscheidung E1 des Grossjobs): der Weg
 * zum Kakao fuehrt direkt auf die zwei Kaufseiten statt auf die Uebersicht
 * /pages/crystal-cacao. Er ersetzt den zweiten Knopf „Zu Crystal Cacao“ im
 * Schlussband. Linktext „… ansehen“, nicht „… kaufen“: ohne Preis daneben
 * sperrt das Sicht-Tor einen Kaufknopf (kaufknopf_kontext, s10 belegt).
 */
function KakaoZumKurs() {
  return (
    <section className="as-sektion as-kk-kakao" data-section="as-kakao">
      <p className="as-etikett">Crystal Cacao</p>
      <h2 className="as-h2">Der Kakao zum Kurs.</h2>
      <p className="as-unter">Zwei Sorten aus Peru. Awake öffnet das Herz, Create schärft den Fokus.</p>
      <div className="as-knoepfe">
        <a className="btn btn--secondary as-knopf" href="/products/crystal-cacao-awake" data-as-cta="secondary">
          Awake ansehen
        </a>
        <a className="btn btn--secondary as-knopf" href="/products/crystal-cacao-create" data-as-cta="secondary">
          Create ansehen
        </a>
      </div>
    </section>
  );
}

export function KakaoKursApple({seite}) {
  return (
    <>
      <link rel="stylesheet" href={lpAppleStyles} />
      <link rel="stylesheet" href={kakaoKursStyles} />
      <AppleSeite seite={seite}>
        <AppleHero
          bildZuerst
          overline="Kostenloser Videokurs"
          titel="Dein Kakao-Ritual für Zuhause."
          unter="Raus aus dem Kopf und rein ins Herz. Vier Videos von Anna und Christian Bernd Bauer."
          bild={BILD_KURS}
          cta={{text: 'Kurs jetzt starten', href: ANKER}}
        />
        <Anmeldung />
        <Videos />
        <AppleKapitel
          etikett="Präsentiert von"
          titel="Anna und Christian Bernd Bauer"
          absaetze={VORSTELLUNG}
          bild={BILD_PAAR}
        />
        <KakaoZumKurs />
        <AppleCtaBand
          titel="Los geht's!"
          text="Melde dich jetzt für den kostenlosen Videokurs an."
          cta={{text: 'Kurs jetzt starten', href: ANKER}}
          hell
        />
        <AppleAnna />
      </AppleSeite>
    </>
  );
}

export default KakaoKursApple;
