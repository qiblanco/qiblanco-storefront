import lpAppleStyles from '~/styles/lp-apple.css?url';
import superhumanStyles from '~/styles/lp-apple-superhuman.css?url';
import {ActiveCampaignForm} from '~/components/reusables/ActiveCampaignForm';
import {AppleSeite} from '../AppleSeite';
import {AppleAnna, AppleCtaBand, AppleHero, AppleKapitel} from '../AppleSektionen';
import {BILD} from './lp-gemeinsam.js';

/*
 * APPLE-FASSUNG /pages/superhuman (Grossjob 20261029-GROSSJOB-alle-shop-seiten-
 * apple-niveau-ausser-seo-geo, s07-r8). Dasselbe Formular wie C (formId 13,
 * Weiche ActiveCampaignForm), Christians „Über mich“ Wort für Wort. Aussortiert
 * gegenüber C: „Warum kostenlos“ (derselbe Absatz wie in „Über mich“), die
 * Aufzählung vor den fünf Stufen (dieselben fünf Themen), Vorschaubilder der
 * Videos und Kurs-Showcase (Quellen 480 und 526 px breit, auf dieser Fläche unscharf).
 *   return appleSeite?.an ? <SuperhumanApple seite={appleSeite.seite} /> : <Superhuman />;
 */
const ANKER = '#anmeldung';

const BILD_CHRISTIAN = {
  url: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Christian.jpg?v=1668985845',
  alt: 'Christian Bernd Bauer',
  breite: 1200,
  hoehe: 1535,
};

const UEBER_MICH = [
  'Ich bin Christian Bernd Bauer.',
  'Meine persönliche Leidensgeschichte hat mich dazu gebracht, den menschlichen Körper aus Sicht eines Ingenieurs, Physikers und Biochemikers zu betrachten.',
  'Mit dem Wissen, das ich angewandt und hier in diesem kostenfreien Kurs zusammengeschrieben habe, gelang es mir mein Burnout zu überwinden, dauerhaft 10 kg abzunehmen und meinen Haarausfall aufzuhalten und diesen sogar langsam wieder umzukehren.',
  'Und auch du kannst Dinge wie diese und noch mehr erreichen, wenn du die Informationen aus diesem Kurs zu Herzen nimmst und konsistent anwendest.',
  'Ich habe mich dazu entschieden, diesen Kurs kostenlos anzubieten, weil ich glaube, dass jeder Mensch ein tieferes Verständnis von seinem Körper haben sollte, damit Leute wie du und ich in der Lage sind, unsere eigenen Entscheidungen zu treffen. Wenn man derart auf die Ratschläge anderer angewiesen ist, wie man es heutzutage auf dogmatische Ärzte ist, sind Gesundheitskrisen wie wir sie heute erleben, vorprogrammiert.',
  'Nimm deine Gesundheit jetzt in deine eigene Hand und erfahre, was tatsächlich möglich ist!',
];

const STUFEN = [
  {
    nr: '1',
    titel: 'Entgiftung',
    punkte: [
      'Warum Giftstoffe unsere Körperaktivitäten lähmen',
      'Wie du dich effektiv entgiftest und deine Zellen wieder vollfunktionsfähig machst',
    ],
  },
  {
    nr: '2',
    titel: 'Mentales Setting',
    punkte: [
      'Wie dein Gehirn deine physische Realität beeinflusst',
      'Wie du dein Gehirn neu programmieren kannst',
      'Wie du negative Verhaltensmuster löschen kannst',
    ],
  },
  {
    nr: '3',
    titel: 'Mineralien und Vitamine',
    punkte: [
      'Dein Körper braucht den richtigen Treibstoff',
      'Was zu wenig in unseren Lebensmitteln enthalten ist',
      'Was dein Körper braucht',
    ],
  },
  {
    nr: '4',
    titel: 'E-Smog',
    punkte: [
      'Wie erhöhte elektromagnetische Strahlung deinen Körper blockiert',
      'Wie du dich effektiv gegen E-Smog schützen kannst',
    ],
  },
  {
    nr: '5',
    titel: 'Kohärente Wasserstruktur',
    punkte: [
      'Was der Superzustand des Wassers ist',
      'Welche positiven Effekte dieser Zustand hat',
      'Wie du diesen Zustand erzeugen kannst',
    ],
  },
];

function Anmeldung() {
  return (
    <section className="as-sektion as-sh-anmeldung" id="anmeldung" data-section="as-anmeldung">
      <h2 className="as-h2">Hol dir den Kurs jetzt kostenfrei.</h2>
      <div className="as-sh-karte">
        <ActiveCampaignForm formId="13" />
      </div>
      <p className="as-sh-klein">
        Deine Eintragung ist absolut unverbindlich. Wenn dir der Kurs nicht gefällt, kannst du dich
        jederzeit mit nur einem Klick wieder austragen und du erhältst keine weiteren E-Mails von uns.
        Wenn du dich für den Kurs anmeldest, erhältst du außerdem die neuesten Biohacking-Tipps und
        Informationen über Qi Blanco® in deinen Posteingang.
      </p>
    </section>
  );
}

function Stufen() {
  return (
    <section className="as-sektion" data-section="as-fakten">
      <h2 className="as-h2">Was dich erwartet</h2>
      <p className="as-absatz as-sh-vorsatz">
        In den nächsten Tagen erfährst du, wie du deinen Körper in 5 einfachen Schritten zu seiner
        natürlichen Höchstform bringen kannst!
      </p>
      <ul className="as-kacheln">
        {STUFEN.map((s) => (
          <li key={s.nr} className="as-kachel">
            <span className="as-kachel-zahl">{s.nr}</span>
            <span className="as-kachel-titel">{s.titel}</span>
            {s.punkte.map((p) => (
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

export function SuperhumanApple({seite}) {
  return (
    <>
      <link rel="stylesheet" href={lpAppleStyles} />
      <link rel="stylesheet" href={superhumanStyles} />
      <AppleSeite seite={seite}>
        <AppleHero
          bildZuerst
          overline="Kostenloser Videokurs"
          titel="In 5 Stufen zum Superhuman"
          unter="Der kostenlose Videokurs von Gründer Christian Bernd Bauer"
          bild={BILD.laptop}
          cta={{text: 'Kurs jetzt starten', href: ANKER}}
        />
        <Anmeldung />
        <Stufen />
        <AppleKapitel
          etikett="Über mich"
          titel="Christian Bernd Bauer"
          absaetze={UEBER_MICH}
          bild={BILD_CHRISTIAN}
        />
        <AppleCtaBand
          titel="Los geht's!"
          text="Melde dich jetzt für den kostenlosen Videokurs an und mache den nächsten Schritt, um die beste Version von dir selbst zu werden."
          cta={{text: 'Kurs jetzt starten', href: ANKER}}
          hell
        />
        <AppleAnna />
      </AppleSeite>
    </>
  );
}

export default SuperhumanApple;
