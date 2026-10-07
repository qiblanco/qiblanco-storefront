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
 * KEINE ZAHL IN DIESER DATEI: Note und Anzahl der Google-Bewertungen ändern
 * sich mit jedem Feed-Lauf. Eine Zahl hier würde still veralten und der Zahl
 * daneben widersprechen. Seit 2026-09-25 steht die Note trotzdem als Satz im
 * Text — gebaut in BewertungenSeite.jsx aus useGoogleRating(), also aus
 * derselben Variablen wie das Widget, nie aus einem Literal hier.
 *
 * HAUSSTIMME: Antwort zuerst, ein Gedanke je Satz, kein Text über sich
 * selbst. Geprüft mit homepage-bauer/bin/stil-pruefe.
 */

/*
 * VORSPANN UND ANTWORT, GEÄNDERT AM 2026-10-07 (Grossjob 20261007-GROSSJOB-
 * seo-keyword-beobachtung-erweitern-nach-beliebtheit, s05, Massnahme
 * M-20261007-bewertungen-reviews). Google schlägt „qi blanco reviews" in DACH
 * auf Rang 1 vor; das Wort stand auf der Seite nirgends. Es steht jetzt im
 * Vorspann und im Antwortsatz, dort als das, was es bei Trustpilot heißt.
 * Der Antwortsatz sagte bis dahin „Alle Bewertungen hier kommen aus unserem
 * Google-Unternehmensprofil". Das stimmt seit dem 2026-10-06 nicht mehr:
 * TrustpilotStimmen steht mit auf der Seite (Job 20261006-bau-trustpilot-
 * scroller-ki-seiten-und-faq). Trustpilot ohne Gesamtzahl und ohne „unser
 * Profil": das Profil ist nicht beansprucht (Kopf von TrustpilotStimmen.jsx).
 */
export const BEWERTUNGEN_SEITE = {
  vorspann: 'Qi Blanco Bewertungen und Reviews',
  titel: 'Was Kundinnen und Kunden über Qi Blanco schreiben',
  antwort:
    'Die Google-Bewertungen kommen aus unserem Google-Unternehmensprofil, mit Note und Anzahl, so wie Google sie zählt. Dazu kommen Reviews von Trustpilot.',
  einleitung: [
    'Jede Google-Rezension stammt von einem Google-Konto und ist dort öffentlich nachlesbar. Wir schreiben keine um, wir kaufen keine, und wir bezahlen niemanden für eine Bewertung.',
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
      {pfad: '/pages/kritik', text: 'Sieben Fragen zur Kritik'},
      {pfad: '/pages/erfahrungen', text: 'Menschen, die in eigenen Videos erzählen'},
      // 2026-10-07, s05, Massnahme M-20261007-reddit-zufahrt: die Reddit-Seite
      // war aus dem Inhalt nur von /pages/faq verlinkt.
      {pfad: '/pages/was-auf-reddit-ueber-qi-blanco-steht', text: 'Was auf Reddit über Qi Blanco steht'},
    ],
  },

  test: {
    titel: 'Selbst prüfen: 20 Tage',
    absaetze: [
      'Du musst keiner Bewertung glauben. Du kannst den QiOne® 2 Pro 20 Tage ab Erhalt tragen und benutzen und ihn zurückgeben, ohne einen Grund zu nennen. „Ich merke nichts" reicht völlig; angeben musst du ohnehin keinen.',
      'Das gilt zusätzlich zum gesetzlichen Widerrufsrecht von 14 Tagen. Der Ablauf ist kurz: Melde dich bei uns, sende zurück, du bekommst den Kaufpreis erstattet. Die Rücksendung ist für dich kostenlos.',
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
