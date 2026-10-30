/*
 * DIE EINE QUELLE der Qi-Alpha-Fragen (Christian 26.10.2026, Z172–Z208;
 * Grossjob 20261026-prio1-the-alpha-variante-a-designmeister-premium-
 * gestaltung, Segment s07). Gelesen von TheAlphaFaq.jsx auf /products/the-alpha
 * und auf den drei Landingpage-Varianten /pages/The-Alpha, -B und -C. Wer hier
 * eine Antwort ändert, ändert sie auf allen vier Seiten.
 *
 * DIE ACHT THEMEN SIND CHRISTIANS FOLGE (Z176–Z184): Stärke, für wen,
 * Unterschied, Gitterchip, Diamant, 6G, Sauna/Wasser, Rückgabe. Die Fragen
 * sind premium neu gestellt (Z188–Z193). Die erste steht wörtlich so, wie
 * Christian sie bestätigt hat (Z194: „wow, thats it“), und ist der Maßstab für
 * Ton und Niveau der übrigen sieben.
 *
 * DIE ANTWORTEN nennen zuerst, was der Mensch bekommt, und stehen ohne
 * Konjunktiv und ohne Weichmacher (Z175: „wir haben angst zu usnerer größe zu
 * stehen, das geht so nicht“). Geschrieben in der Rolle des PR-Managers nach
 * pr-manager/wissen/kanon-christian.md und qi-alpha-live-launch.md, frei-
 * gegeben in claude-jobs/<grossjob>/challenger/s07-pr-freigabe.md.
 *
 * BELEGE DER FAKTEN (Stand 26.10.2026): 111 Stück und vergebene Nummern
 * the-alpha-daten-serie-vergeben.js (Christian Z7 des Grossjobs 20261025);
 * 10.639 €, Wunschnummer 2.000 €, Goldkette 4.879 €, 20 Tage: live auf
 * /products/the-alpha gemessen; Versand im Januar 2027 für das ganze Paket:
 * Christian 30.10.2026 (ai-ceo/wissen/kanon/qi-alpha-fakten.json); Ratenpreis 9.999 €
 * mit Code von Anna: the-alpha-shop-daten.js RATEN; Vorverkauf 01.11.2026:
 * app/data/qi-master-wortlaut.json; Live am 8. November, 12 Uhr: Christians
 * Satz in der Anzeige A3 (pr-manager/wissen/qi-alpha-live-launch.md).
 * PREIS UND RATEN stehen bewusst NICHT in den Antworten: sie stehen auf der
 * Shopseite in Kaufbox und Bezahlart (Zahl aus Shopify), auf den LPs im roten
 * Balken; eine zweite, statische Preiszeile hier würde still veralten. Der
 * PR-Manager hat am 26.10. die Sammelantwort (Rückgabe + Preis + Raten +
 * Vorverkauf + Versand) als überladen zurückgegeben (s07-pr-freigabe.md).
 * Die vergebenen Nummern stehen NICHT als Text hier, sondern kommen aus
 * THE_ALPHA_VERGEBEN, damit diese Antwort Christians Liste nie widerspricht.
 */

import {
  THE_ALPHA_SERIE,
  THE_ALPHA_VERGEBEN,
} from './the-alpha-daten-serie-vergeben.js';

/** „2, 44, 88, 99 und 111“ aus der einen Liste. */
function vergebenText(liste) {
  const n = [...liste].sort((a, b) => a - b).map(String);
  if (n.length < 2) return n.join('');
  return `${n.slice(0, -1).join(', ')} und ${n[n.length - 1]}`;
}

export const THE_ALPHA_FAQ_TITEL = 'Deine Fragen zum Qi Alpha®.';

/** Christians Leitfrage, wörtlich (Z194/Z195). Eine Probe misst sie live. */
export const THE_ALPHA_FAQ_LEITFRAGE =
  'Was bekomme ich mit dem Qi Alpha®, das kein anderes Qi-Blanco-Produkt kann?';

export const THE_ALPHA_FAQ = [
  {
    id: 'mehr',
    frage: THE_ALPHA_FAQ_LEITFRAGE,
    antwort: [
      `Du trägst die Kraft eines QiHome® Air am Körper. Der Qi Alpha® schützt auf dem Niveau unseres Raumgeräts, nur eben dort, wo du gerade bist. Gegenüber dem QiOne® 2 Pro ist seine Stärke um den Faktor 100 erweitert.`,
      `Diese Kraft kommt aus dem zweiteiligen Gitterchip® der ultimativen Generation und aus „The One Eye“, einem hochreinen Naturdiamanten. Beides gibt es nur im Qi Alpha®. Es gibt ${THE_ALPHA_SERIE} Stück. Deine Nummer wählst du selbst, solange sie frei ist.`,
    ],
  },
  {
    id: 'bereit',
    frage: 'Bin ich bereit für den Qi Alpha®?',
    antwort: [
      'Ja, wenn du alles willst. Der Qi Alpha® ist gemacht für Menschen, die das Maximum aus ihrem Leben holen, beruflich und privat. Für den Alltag ist der QiOne® 2 Pro mehr als ausreichend.',
      'Der Vorverkauf startet am 01.11.2026. Am Sonntag, 8. November, um 12 Uhr halte ich ihn zum ersten Mal live für dich in die Kamera. Komm vorbei und stell mir deine Fragen!',
    ],
  },
  {
    id: 'unterschied',
    frage: 'Was trägt der Qi Alpha®, das mein QiOne® 2 Pro nicht hat?',
    antwort: [
      'Im Auge des Qi Alpha® sitzt „The One Eye“: ein hochreiner Naturdiamant in einer Iris mit 64 Strichen, 32 langen und 32 kurzen. Der Kern ist ein zweiteiliger Gitterchip® aus unserer eigenen 750er Goldlegierung, deren Atome in einer einmalig definierten Ordnung stehen.',
      (vergeben) =>
        `Jeder Qi Alpha® trägt seine eigene Nummer und wird von Spezialisten mit jahrzehntelanger Erfahrung Stück für Stück durch die Fertigung begleitet. Die finale Politur wird per Hand von Goldschmieden mit meisterhafter Genauigkeit durchgeführt. Bereits vergeben sind die Nummern ${vergeben}.`,
    ],
  },
  {
    id: 'gitterchip',
    frage: 'Wie arbeitet der Gitterchip® der ultimativen Generation?',
    antwort: [
      'Er ordnet das Wasser um dich herum: Seine Moleküle schwingen im Gleichtakt. Der Gitterchip® ist das Ergebnis von über einem Jahrzehnt Forschung am QiOne® und die außergewöhnlichste Erscheinung: eine Goldlegierung, deren Atome in einer einmalig definierten Ordnung stehen. Kohärent wirkend und ihre Umgebung aktiv prägend.',
      'Der Physiker Emilio Del Giudice hat solche geordneten Bereiche im Wasser beschrieben, ein Zehntel Mikrometer groß, mit Millionen Molekülen im selben Takt.',
    ],
  },
  {
    id: 'diamant',
    frage: 'Warum sitzt ein Diamant im Auge des Qi Alpha®?',
    antwort: [
      'Weil er dieselbe Sprache spricht wie deine Zellen: Licht. Deine Zellen leuchten, das hat der Biophysiker Fritz-Albert Popp über Jahrzehnte gemessen, und ein Diamant ordnet Licht.',
      'Zusammen mit dem Gitterchip® ordnet „The One Eye“ Licht und Wasser direkt an deinem Körper. Das gibt es nur im Qi Alpha®.',
    ],
  },
  {
    id: 'sechs-g',
    frage: 'Bin ich mit dem Qi Alpha® für 6G gerüstet?',
    antwort: [
      'Ja. Durch das einmalige Duett des Gitterchip® und „The One Eye“ ist der Qi Alpha® auf jegliche erdenkbare Zukunft vorbereitet, egal ob sie 6G, Umweltgifte oder Schicksalsschläge lautet.',
      'Den Gitterchip® des QiOne® 2 Pro hat Prof. Dr. Peter C. Dartsch unter der Strahlung eines sendenden Smartphones in zwei Zellstudien untersucht.',
    ],
  },
  {
    id: 'sauna-wasser',
    frage: 'Darf er mit in die Sauna, ins Meer und unter die Dusche?',
    antwort: [
      'Der Qi Alpha® begleitet dich überallhin. Der Gitterchip® ist unempfindlich gegen Wasser, Chlor und Salzwasser sowie gegen Schweiß und Hitze.',
      'Die Goldkette nehme ich selbst bei langen Stunden im Chlorwasser ab, wie jeden Goldschmuck.',
    ],
  },
  {
    id: 'passt-nicht',
    frage: 'Was ist, wenn er nicht zu mir passt?',
    antwort: [
      'Dann gibst du ihn zurück. Ab Erhalt hast du 20 Tage, um den Qi Alpha® in Ruhe zu erleben. Passt er nicht zu dir, bekommst du den vollen Kaufpreis zurück.',
      'Wir versenden im Januar 2027 kostenlos und voll versichert, nach der finalen Politur von Hand.',
    ],
  },
];

/**
 * Die Antworten als fertige Absätze: Funktionen (Absätze mit Live-Daten)
 * werden hier mit der einen Liste aufgelöst, damit Seite, Probe und
 * Freigabe-Prüfung denselben Text sehen.
 */
export function theAlphaFaqAufgeloest(vergeben = THE_ALPHA_VERGEBEN) {
  const v = vergebenText(vergeben);
  return THE_ALPHA_FAQ.map((f) => ({
    ...f,
    antwort: f.antwort.map((a) => (typeof a === 'function' ? a(v) : a)),
  }));
}

/** Der nächste Schritt nach den Fragen (Z174): Anna im Chat. */
export const THE_ALPHA_FAQ_ANNA = {
  titel: 'Noch eine Frage?',
  text: 'Anna kennt den Qi Alpha® in jedem Detail und antwortet dir sofort. Du findest sie unten rechts im Chat.',
};
