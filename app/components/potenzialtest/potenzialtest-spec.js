/**
 * Texte des Potenzialtests — ÜBERNOMMEN, NICHT GESCHRIEBEN.
 *
 * Quelle: Spezifikation v1.0 aus dem Grossjob 20261030-GROSSJOB-linkedin-
 * christian-account-outreach-potenzialtest-ohne-werbebudget (s01),
 * claude-jobs/<grossjob>/konzept/potenzialtest-spec.json. Diese Datei ist aus
 * der Spezifikation erzeugt (Segment s03); eine Textänderung gehört zuerst in
 * die Spezifikation, sonst rechnet der Server (s02) mit anderen Fragen, als die
 * Seite zeigt. Die Auswertung (Umpolung, Prozente, Typ) lebt NUR im Server —
 * die Seite zeigt, was er zurückgibt.
 */
export const PT = {
  "version": "1.0",
  "titel": "Wie viel Potenzial nutzt du wirklich?",
  "untertitel": "15 Fragen, 3 Minuten. Du bekommst deinen Potenzial-Index, deinen Typ und drei Hebel, die zu dir passen.",
  "hinweis": "Der Test ist eine Selbsteinschätzung und keine medizinische Diagnose.",
  "skala": [
    "trifft gar nicht zu",
    "trifft eher nicht zu",
    "teils, teils",
    "trifft eher zu",
    "trifft voll zu"
  ],
  "dimensionen": [
    {
      "id": "energie",
      "name": "Energie",
      "grundlage": "Subjektive Vitalität (Ryan & Frederick 1997, Subjective Vitality Scale); WHO-5-Wohlbefindens-Index (WHO 1998; Topp et al. 2015)"
    },
    {
      "id": "erholung",
      "name": "Abschalten",
      "grundlage": "Recovery Experience Questionnaire, Facetten Detachment und Relaxation (Sonnentag & Fritz 2007); Effort-Recovery-Modell (Meijman & Mulder 1998)"
    },
    {
      "id": "schlaf",
      "name": "Schlaf",
      "grundlage": "Schlafgesundheit als mehrdimensionales Konstrukt, RU-SATED (Buysse 2014): Einschlafen/Effizienz, Durchschlafen, Erholtheit am Morgen"
    },
    {
      "id": "druck",
      "name": "Gelassenheit unter Druck",
      "grundlage": "Wahrgenommener Stress: Kontrollerleben und Überlastung (Cohen, Kamarck & Mermelstein 1983, Perceived Stress Scale); Allostatische Last (McEwen 1998)"
    },
    {
      "id": "fokus",
      "name": "Fokus und Wirksamkeit",
      "grundlage": "Arbeitsengagement, Facetten Vigor und Absorption (Schaufeli & Bakker 2003/2006, UWES-9); Flow (Csikszentmihalyi 1990)"
    }
  ],
  "fragen": [
    {
      "id": "e1",
      "text": "Ich wache morgens auf und habe Lust auf den Tag."
    },
    {
      "id": "r1",
      "text": "Nach Feierabend kann ich gedanklich von der Arbeit abschalten."
    },
    {
      "id": "s1",
      "text": "Ich schlafe in der Regel innerhalb von 20 Minuten ein."
    },
    {
      "id": "p1",
      "text": "Ich habe das Gefühl, die wichtigen Dinge in meinem Leben im Griff zu haben."
    },
    {
      "id": "f1",
      "text": "Ich kann mich eine Stunde am Stück auf eine Aufgabe konzentrieren, ohne zum Handy zu greifen."
    },
    {
      "id": "e2",
      "text": "Am Nachmittag fällt meine Energie spürbar ab."
    },
    {
      "id": "r2",
      "text": "Auch am Wochenende bin ich innerlich im Arbeitsmodus."
    },
    {
      "id": "s2",
      "text": "Ich wache nachts auf und liege wach, während die Gedanken kreisen."
    },
    {
      "id": "p2",
      "text": "Wenn etwas Unvorhergesehenes dazwischenkommt, werde ich schnell gereizt."
    },
    {
      "id": "f2",
      "text": "Ich erlebe regelmäßig Phasen, in denen die Arbeit wie von selbst läuft."
    },
    {
      "id": "e3",
      "text": "Ich habe Kraft übrig für Dinge, die mir neben der Arbeit wichtig sind."
    },
    {
      "id": "r3",
      "text": "Ich habe feste Zeiten, in denen ich bewusst runterfahre."
    },
    {
      "id": "s3",
      "text": "Nach dem Aufstehen fühle ich mich erholt."
    },
    {
      "id": "p3",
      "text": "Es türmt sich so viel auf, dass ich nicht mehr hinterherkomme."
    },
    {
      "id": "f3",
      "text": "Ich arbeite viel, aber das Ergebnis bleibt hinter dem zurück, was ich eigentlich kann."
    }
  ],
  "qInteresse": {
    "text": "Wobei möchtest du dich unterstützen lassen?",
    "optionen": [
      {
        "id": "qione",
        "text": "Schutz und Energie im Alltag, zum Tragen",
        "produkt": "QiOne® 2 Pro"
      },
      {
        "id": "qibracelet",
        "text": "Ein Armband, das ich jeden Tag trage",
        "produkt": "QiBracelet®"
      },
      {
        "id": "qialpha",
        "text": "Etwas Besonderes, das mich lange begleitet",
        "produkt": "Qi Alpha®"
      },
      {
        "id": "nur_ergebnis",
        "text": "Erst mal nur mein Ergebnis",
        "produkt": null
      }
    ]
  },
  "qGespraech": {
    "text": "Möchtest du dein Ergebnis in einem kurzen Gespräch (20 Minuten) mit uns besprechen?",
    "optionen": [
      {
        "id": "ja",
        "text": "Ja, gern"
      },
      {
        "id": "nein",
        "text": "Nein, danke"
      }
    ]
  },
  "einwilligung": "Ja, schickt mir mein Ergebnis per Mail. Ich kann jederzeit widersprechen."
};
