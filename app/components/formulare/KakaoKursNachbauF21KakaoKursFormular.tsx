// app/components/formulare/KakaoKursNachbauF21KakaoKursFormular.tsx
// Mail-Manager-Formular „Kakao-Kurs (Nachbau f21-kakao-kurs)“ (Formular-ID 21). Erzeugt im Reiter Formulare;
// nach einer Textaenderung dort neu kopieren (der Endpunkt nimmt eine veraltete Einwilligung nicht an).
import {MailManagerFormular, type MmFormularKonfig, type MmKlassen} from '../MailManagerFormular';

export const KONFIG: MmFormularKonfig = {
  "formularId": "21",
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
      "label": "Email Adresse",
      "pflicht": true
    }
  ],
  "titel": "",
  "hinweis": "",
  "knopf": "Kurs jetzt starten ►",
  "einwilligung": "Ja, ich möchte den kostenlosen Kakao-Kurs und danach den Newsletter von Qi Blanco per E-Mail bekommen. Abmelden kann ich mich jederzeit mit einem Klick.",
  "einwilligungId": "3c0506138a25",
  "dankeTitel": "",
  "dankeText": "Achtung: Du bist noch nicht angemeldet!\nUm deine Anmeldung abzuschließen,\nbestätige bitte jetzt die E-Mail in deinem Postfach. Die E-Mail wird sofort verschickt - schau auch in deinem Spamordner nach!",
  "erfolgsseite": "",
  "liste": "Double-Optin - Kakaokurs",
  "tags": [
    "#kakao"
  ]
};

export function KakaoKursNachbauF21KakaoKursFormular(props: {className?: string; klassen?: MmKlassen; style?: React.CSSProperties}) {
  return <MailManagerFormular konfig={KONFIG} {...props} />;
}

export default KakaoKursNachbauF21KakaoKursFormular;

