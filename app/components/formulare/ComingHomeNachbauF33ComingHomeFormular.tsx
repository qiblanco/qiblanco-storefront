// app/components/formulare/ComingHomeNachbauF33ComingHomeFormular.tsx
// Mail-Manager-Formular „Coming Home (Nachbau f33-coming-home)“ (Formular-ID 33). Erzeugt im Reiter Formulare;
// nach einer Textaenderung dort neu kopieren (der Endpunkt nimmt eine veraltete Einwilligung nicht an).
import {MailManagerFormular, type MmFormularKonfig, type MmKlassen} from '../MailManagerFormular';

export const KONFIG: MmFormularKonfig = {
  "formularId": "33",
  "sprache": "de",
  "felder": [
    {
      "name": "vorname",
      "typ": "text",
      "label": "Dein Name",
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
  "knopf": "Anmelden und Link bekommen",
  "einwilligung": "Mit der Anmeldung bekommst du unsere E-Mails: jede Woche die Einladung zu Coming Home und Neuigkeiten von Qi Blanco. Du bestätigst deine Adresse per E-Mail und kannst dich jederzeit mit einem Klick abmelden.",
  "einwilligungId": "7ae4e5ca7aad",
  "dankeTitel": "",
  "dankeText": "Achtung: Du bist noch nicht angemeldet!\nUm deine Anmeldung abzuschließen,\nbestätige bitte jetzt die E-Mail in deinem Postfach.\nDein Link für Sonntag 19 Uhr erscheint hier, wie heute auf der Seite (der Laden liefert ihn selbst aus).\nDie E-Mail wird sofort verschickt - schau auch in deinem Spamordner nach!",
  "erfolgsseite": "",
  "liste": "Newsletter DACH",
  "tags": [
    "coming-home"
  ]
};

export function ComingHomeNachbauF33ComingHomeFormular(props: {className?: string; klassen?: MmKlassen; style?: React.CSSProperties}) {
  return <MailManagerFormular konfig={KONFIG} {...props} />;
}

export default ComingHomeNachbauF33ComingHomeFormular;

