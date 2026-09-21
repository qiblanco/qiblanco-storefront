/**
 * /pages/bewertungen — der Text der Seite als Datenmodul.
 *
 * WARUM EIN DATENMODUL UND KEIN TEXT IN DER KOMPONENTE: dieselbe Bauform wie
 * app/data/kritik-vorwuerfe.js und app/data/fragen.js. Wer den Text ändert,
 * ändert diese Datei; Route und Komponente tragen keinen Inhalt.
 *
 * WAS DIESE SEITE IST (Grossjob 20260921-GROSSJOB-die-bewertenden-
 * markenbegriffe-gehoeren-uns, Segment s04): der Landeplatz für die Suche
 * „Qi Blanco Bewertungen" — zugleich Sitelink-Ziel der Marken-Kampagne und
 * organische Antwortseite. Am 2026-09-21 hatte der Begriff 0 von 10 eigenen
 * Treffern und /pages/bewertungen antwortete mit 404.
 *
 * DIE BEWERTUNGEN SELBST STEHEN NICHT HIER. Sie kommen live aus dem
 * Google-Unternehmensprofil über den Standard-Baustein Bewertungsblock
 * (app/components/reusables/Bewertungsblock.jsx): oben zwölf ausgewählte
 * echte Rezensionen (googleReviewsCurated.js, von Hand geprüft), unten der
 * Live-Feed der neuesten Fünf-Sterne-Rezensionen mit Note und Anzahl, so wie
 * Google sie zählt. KEINE Bewertung wird hier erfunden, umgeschrieben oder
 * gekauft — und der Text unten sagt genau das, weil es die Frage ist, die
 * jemand mit dieser Suche mitbringt.
 *
 * TONLAGE (Elternauftrag): keine Sammlung von Vorwürfen, keine Verteidigung.
 * Die Frage hinter der Suche wird positiv und aus eigener Kraft beantwortet.
 * Wer die kritischen Fragen einzeln lesen will, findet den Weg nach
 * /pages/kritik; wer die Belege will, nach /pages/studien. Diese Seite
 * wiederholt beides nicht (Abgrenzungs-SSoT homepage-bauer/konzepte/
 * abgrenzung-flaechen.json).
 *
 * KEINE ZAHL IM TEXT: Note und Anzahl der Google-Bewertungen stehen im
 * Baustein und ändern sich mit jedem Feed-Lauf. Eine Zahl hier würde still
 * veralten und der Zahl daneben widersprechen.
 *
 * HAUSSTIMME: Antwort zuerst, ein Gedanke je Satz, kein Text über sich
 * selbst. Geprüft mit homepage-bauer/bin/stil-pruefe.
 */

export const BEWERTUNGEN_SEITE = {
  vorspann: 'Qi Blanco Bewertungen',
  titel: 'Was Kundinnen und Kunden über Qi Blanco schreiben',
  antwort:
    'Alle Bewertungen hier kommen aus unserem Google-Unternehmensprofil, mit Note und Anzahl, so wie Google sie zählt.',
  einleitung: [
    'Jede Rezension stammt von einem Google-Konto und ist dort öffentlich nachlesbar. Wir schreiben keine um, wir kaufen keine, und wir bezahlen niemanden für eine Bewertung.',
    'In der oberen Reihe stehen zwölf Stimmen, die wir aus den Google-Rezensionen ausgewählt haben, weil sie am genauesten beschreiben, was Menschen im Alltag gemerkt haben: bei Schlaf, Ruhe und Energie. Darunter läuft der Feed der neuesten Fünf-Sterne-Rezensionen. Alle anderen, auch die kritischen, liest du mit einem Klick auf die Note im Google-Profil.',
  ],

  herkunft: {
    titel: 'Woher die Bewertungen kommen',
    absaetze: [
      'Die Quelle ist das Google-Unternehmensprofil von Qi Blanco. Google prüft, dass hinter jeder Rezension ein Konto steht, zeigt sie öffentlich an und lässt uns keine löschen.',
      'Für eine Bewertung gibt es bei uns keinen Gutschein, keinen Rabatt und keine Gegenleistung. Wer unzufrieden ist, schreibt das dort genauso wie jemand, der begeistert ist.',
      'Was du hier siehst, aktualisiert sich von selbst. Der Feed liest das Profil mehrmals täglich; eine neue Rezension erscheint ohne unser Zutun.',
    ],
  },

  grenzen: {
    titel: 'Was Bewertungen nicht zeigen',
    absaetze: [
      'Eine Bewertung ist ein Erlebnis, kein Messwert. Was jemand gemerkt hat, sagt viel über diesen Menschen und nichts darüber, was du merken wirst.',
      'Deshalb steht neben den Stimmen der Kunden noch etwas anderes: fünf veröffentlichte Arbeiten aus dem Labor, mit Methode, Zahlen und den Grenzen, die die Autoren selbst nennen. Sie beantworten eine andere Frage als eine Rezension, und beides zusammen ergibt das Bild.',
    ],
    links: [
      {pfad: '/pages/studien', text: 'Die fünf Studien im Original'},
      {pfad: '/pages/kritik', text: 'Die härtesten Fragen, einzeln beantwortet'},
      {pfad: '/pages/erfahrungen', text: 'Menschen, die in eigenen Videos erzählen'},
    ],
  },

  pruefen: {
    titel: 'Selbst prüfen: 20 Tage',
    absaetze: [
      'Du musst keiner Bewertung glauben. Du kannst den QiOne® 2 Pro 20 Tage ab Erhalt tragen und benutzen und ihn zurückgeben, ohne einen Grund zu nennen. „Ich merke nichts" reicht völlig; angeben musst du ohnehin keinen.',
      'Das gilt zusätzlich zum gesetzlichen Widerrufsrecht von 14 Tagen. Der Ablauf ist kurz: Melde dich bei uns, sende zurück, du bekommst den Kaufpreis erstattet. Die unmittelbaren Kosten der Rücksendung trägst du.',
    ],
    weiter: {
      pfad: '/pages/qione-2-pro-details',
      text: 'Den QiOne® 2 Pro ansehen',
    },
    fristen: {
      pfad: '/pages/neu-oder-gebraucht',
      text: 'Beide Fristen mit Quelle nachlesen',
    },
  },
};
