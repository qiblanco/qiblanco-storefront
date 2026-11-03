// app/components/formulare/NewsletterDACHNachbauF15NewsletterDachFormular.tsx
// Mail-Manager-Formular „Newsletter DACH (Nachbau f15-newsletter-dach)“ (Formular-ID 15). Erzeugt im Reiter Formulare;
// nach einer Textaenderung dort neu kopieren (der Endpunkt nimmt eine veraltete Einwilligung nicht an).
import {MailManagerFormular, type MmFormularKonfig, type MmKlassen} from '../MailManagerFormular';

export const KONFIG: MmFormularKonfig = {
  "formularId": "15",
  "sprache": "de",
  "felder": [
    {
      "name": "vorname",
      "typ": "text",
      "label": "Dein Vor- und Nachname",
      "pflicht": true
    },
    {
      "name": "email",
      "typ": "email",
      "label": "Deine E-Mail Adresse",
      "pflicht": true
    }
  ],
  "titel": "",
  "hinweis": "",
  "knopf": "Jetzt anmelden",
  "einwilligung": "Ja, ich möchte den Newsletter von Qi Blanco per E-Mail bekommen. Abmelden kann ich mich jederzeit mit einem Klick.",
  "einwilligungId": "c656c0c34890",
  "dankeTitel": "",
  "dankeText": "Achtung: Du bist noch nicht angemeldet!\nUm deine Anmeldung abzuschließen,\nbestätige bitte jetzt die E-Mail in deinem Postfach.\nDie E-Mail wird sofort verschickt - schau auch in deinem Spamordner nach!",
  "erfolgsseite": "",
  "liste": "Newsletter DACH",
  "tags": []
};

export function NewsletterDACHNachbauF15NewsletterDachFormular(props: {className?: string; klassen?: MmKlassen; style?: React.CSSProperties}) {
  return <MailManagerFormular konfig={KONFIG} {...props} />;
}

export default NewsletterDACHNachbauF15NewsletterDachFormular;

