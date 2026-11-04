// app/components/formulare/SuperhumanKursNachbauF13SuperhumanFormular.tsx
// Mail-Manager-Formular „Superhuman-Kurs (Nachbau f13-superhuman)“ (Formular-ID 13). Erzeugt im Reiter Formulare;
// nach einer Textaenderung dort neu kopieren (der Endpunkt nimmt eine veraltete Einwilligung nicht an).
import {MailManagerFormular, type MmFormularKonfig, type MmKlassen} from '../MailManagerFormular';

export const KONFIG: MmFormularKonfig = {
  "formularId": "13",
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
      "label": "E-Mail Adresse",
      "pflicht": true
    }
  ],
  "titel": "",
  "hinweis": "",
  "knopf": "► Kurs jetzt starten!",
  "einwilligung": "Ja, ich möchte den kostenlosen Superhuman-Kurs und danach den Newsletter von Qi Blanco per E-Mail bekommen. Abmelden kann ich mich jederzeit mit einem Klick.",
  "einwilligungId": "fed19f9d6fb4",
  "dankeTitel": "",
  "dankeText": "Achtung: Du bist noch nicht angemeldet!\nUm deine Anmeldung abzuschließen,\nbestätige bitte jetzt die E-Mail in deinem Postfach.\nDie E-Mail wird sofort verschickt - schau auch in deinem Spamordner nach!",
  "erfolgsseite": "https://qiblanco.com/pages/superhuman-kurs-bestatigung",
  "liste": "Double-Optin - MN",
  "tags": [
    "#5ssh"
  ]
};

export function SuperhumanKursNachbauF13SuperhumanFormular(props: {className?: string; klassen?: MmKlassen; style?: React.CSSProperties}) {
  return <MailManagerFormular konfig={KONFIG} {...props} />;
}

export default SuperhumanKursNachbauF13SuperhumanFormular;

