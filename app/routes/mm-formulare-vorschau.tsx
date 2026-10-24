// app/routes/mm-formulare-vorschau.tsx
// Pruefseite der Mail-Manager-Formulare fuer qiblanco.com (Elina EL-20261023-d0d76dd3).
// NICHT verlinkt, noindex. Ersetzt keine bestehende Seite und kein bestehendes AC-Formular:
// sie zeigt nur die Nachbauten nebeneinander, damit Elina sie vor dem GO ansehen und absenden kann.
// Rueckbau: diese Datei, app/styles/mm-formulare-vorschau.css und die Dateien unter
// app/components/formulare/ loeschen (Komponente und Route stoeren ohne Aufrufer nicht).
import * as F15 from '../components/formulare/NewsletterDACHNachbauF15NewsletterDachFormular';
import * as F13 from '../components/formulare/SuperhumanKursNachbauF13SuperhumanFormular';
import * as F21 from '../components/formulare/KakaoKursNachbauF21KakaoKursFormular';
import * as F33 from '../components/formulare/ComingHomeNachbauF33ComingHomeFormular';
import * as F27 from '../components/formulare/PreAccessBlackFridayDENachbauF27PreAccesFormular';
import vorschauStyles from '../styles/mm-formulare-vorschau.css?url';

export function links() {
  return [{rel: 'stylesheet', href: vorschauStyles}];
}

export const meta = () => [
  {title: 'Vorschau Anmeldeformulare - Qi Blanco'},
  {name: 'robots', content: 'noindex,nofollow'},
];

export function headers() {
  return {'X-Robots-Tag': 'noindex, nofollow'};
}

// Reihenfolge wie im Auftrag; Liste und Formular-ID kommen aus der Konfiguration des Formulars selbst.
const FORMULARE = [
  {name: 'Newsletter', m: F15, Formular: F15.NewsletterDACHNachbauF15NewsletterDachFormular},
  {name: 'Superhuman-Kurs', m: F13, Formular: F13.SuperhumanKursNachbauF13SuperhumanFormular},
  {name: 'Kakao-Kurs', m: F21, Formular: F21.KakaoKursNachbauF21KakaoKursFormular},
  {name: 'Coming Home', m: F33, Formular: F33.ComingHomeNachbauF33ComingHomeFormular},
  {name: 'Pre-Access Black Friday', m: F27, Formular: F27.PreAccessBlackFridayDENachbauF27PreAccesFormular},
];

export default function MmFormulareVorschau() {
  return (
    <div className="mm-vorschau">
      <h1>Anmeldeformulare aus dem Mail Manager</h1>
      <p className="mm-vorschau__hinweis">
        Vorschau für qiblanco.com: im Shop nicht verlinkt und in keiner Suchmaschine. Jedes Formular meldet echt an.
        Danach kommt die Bestätigungsmail.
      </p>
      {FORMULARE.map((f) => (
        <section key={f.m.KONFIG.formularId} className="mm-vorschau__kachel" id={`formular-${f.m.KONFIG.formularId}`}>
          <h2>{f.name}</h2>
          <p className="mm-vorschau__kennung">Formular {f.m.KONFIG.formularId} · Liste {f.m.KONFIG.liste}</p>
          <f.Formular />
        </section>
      ))}
    </div>
  );
}
