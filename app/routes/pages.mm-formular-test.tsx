// app/routes/pages.mm-formular-test.tsx
// Versteckte Testseite der Mail-Manager-Formulare auf qiblanco.com (Elina, GO vom 03.11.2026): nicht verlinkt, noindex,
// nicht in der Sitemap. Ersetzt kein bestehendes Formular. Der Browser sendet direkt an den Endpunkt, damit die echte
// Anmelde-IP im Einwilligungsnachweis steht.
// Rückbau: diese Datei und app/styles/mm-formular-test.css löschen, alles andere stört ohne Aufrufer nicht.
import {MailManagerFormular} from '../components/MailManagerFormular';
import * as F15 from '../components/formulare/NewsletterDACHNachbauF15NewsletterDachFormular';
import * as F13 from '../components/formulare/SuperhumanKursNachbauF13SuperhumanFormular';
import * as F21 from '../components/formulare/KakaoKursNachbauF21KakaoKursFormular';
import * as F33 from '../components/formulare/ComingHomeNachbauF33ComingHomeFormular';
import * as F27 from '../components/formulare/PreAccessBlackFridayDENachbauF27PreAccesFormular';
import testseiteStyles from '../styles/mm-formular-test.css?url';

const ENDPUNKT = 'https://anmelden.dienst.qiblanco.com';

export function links() {
  return [{rel: 'stylesheet', href: testseiteStyles}];
}

export const meta = () => [
  {title: 'Formular-Test - Qi Blanco'},
  {name: 'robots', content: 'noindex,nofollow'},
];

export function headers() {
  return {'X-Robots-Tag': 'noindex, nofollow'};
}

// Reihenfolge wie im Auftrag; Liste und Formular-ID kommen aus der Konfiguration des Formulars selbst.
const FORMULARE = [
  {name: 'Newsletter DACH', konfig: F15.KONFIG},
  {name: 'Superhuman-Kurs DE', konfig: F13.KONFIG},
  {name: 'Kakao-Kurs', konfig: F21.KONFIG},
  {name: 'Coming Home', konfig: F33.KONFIG},
  {name: 'Pre-Access Black Friday DE', konfig: F27.KONFIG},
];

export default function MmFormularTest() {
  return (
    <div className="mm-testseite">
      <h1>Formular-Test</h1>
      <p className="mm-testseite__hinweis">
        Testseite für qiblanco.com: im Shop nicht verlinkt und in keiner Suchmaschine. Jedes Formular meldet echt über
        den Mail Manager an. Danach kommt die Bestätigungsmail.
      </p>
      {FORMULARE.map((f) => (
        <section key={f.konfig.formularId} className="mm-testseite__kachel" id={`formular-${f.konfig.formularId}`}>
          <h2>{f.name}</h2>
          <p className="mm-testseite__kennung">Formular {f.konfig.formularId} · Liste {f.konfig.liste}</p>
          <MailManagerFormular konfig={f.konfig} direkt={ENDPUNKT} />
        </section>
      ))}
    </div>
  );
}
