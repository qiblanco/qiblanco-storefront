// app/components/formulare/PreAccessBlackFridayDENachbauF27PreAccesFormular.tsx
// Mail-Manager-Formular „Pre-Access Black Friday DE (Nachbau f27-pre-access-bf-de)“ (Formular-ID 27). Erzeugt im Reiter Formulare;
// nach einer Textaenderung dort neu kopieren (der Endpunkt nimmt eine veraltete Einwilligung nicht an).
import {MailManagerFormular, type MmFormularKonfig, type MmKlassen} from '../MailManagerFormular';

export const KONFIG: MmFormularKonfig = {
  "formularId": "27",
  "sprache": "de",
  "felder": [
    {
      "name": "vorname",
      "typ": "text",
      "label": "Vorname",
      "pflicht": true
    },
    {
      "name": "email",
      "typ": "email",
      "label": "E-Mail",
      "pflicht": true
    }
  ],
  "titel": "",
  "hinweis": "",
  "knopf": "Jetzt sofort Zugriff erhalten!",
  "einwilligung": "Ja, ich möchte den exklusiven Vorab-Zugang zu Black Friday und danach den Newsletter von Qi Blanco per E-Mail bekommen. Abmelden kann ich mich jederzeit mit einem Klick.",
  "einwilligungId": "306b8446a221",
  "dankeTitel": "",
  "dankeText": "Fast fertig... Bitte bestätige deine Mail-Adresse, um deinen Zugriff auf die Deals zu erhalten. Checke auch deinen Spam-Ordner.",
  "erfolgsseite": "",
  "liste": "PRE-BF DE",
  "tags": [
    "#prebf"
  ]
};

export function PreAccessBlackFridayDENachbauF27PreAccesFormular(props: {className?: string; klassen?: MmKlassen; style?: React.CSSProperties}) {
  return <MailManagerFormular konfig={KONFIG} {...props} />;
}

export default PreAccessBlackFridayDENachbauF27PreAccesFormular;

