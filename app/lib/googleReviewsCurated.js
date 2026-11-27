/**
 * googleReviewsCurated — 12 kuratierte, ECHTE 5-Sterne-Google-Rezensionen für
 * das obere „Beeindruckende Kundenerfahrungen"-Widget (Christian 2026-08-01).
 * Texte WORTWÖRTLICH aus dem echten Reputon-Google-Feed (Profil Qi Blanco),
 * nichts erfunden/gefälscht. Menschlich kuratiert nach Wirkung; Ironie/Satire,
 * Service-Einzeiler und Heilungsschilderungen ausgeschlossen (auch nicht als
 * Option in dieser Client-Datei, Job 20260926-rezensionen-curated-optional-
 * heilungsschilderungen-raus). datum (ISO) → LIVE-Relativzeit (self-updating).
 * Reihenfolge = Anzeigereihenfolge (sortier-/pflegbar).
 *
 * `bilder` = vom Kunden bei Google GEPOSTETE Fotos (Feed-Feld `images`),
 * NICHT zu verwechseln mit `foto` = Google-Profilbild/Avatar des Verfassers.
 * Nur 3 der 37 Feed-Rezensionen tragen überhaupt Fotos, zwei davon stehen in
 * dieser Kuration — sie sind deshalb bewusst auf Position 1 und 2 gezogen
 * (Job 20260807-…-kundenfotos-konzept), damit die wenigen vorhandenen Fotos
 * zuverlässig gesehen werden statt zufällig. Wer hier umsortiert, verliert
 * genau diese Wirkung. Die übrigen Einträge tragen `bilder: []`.
 *
 * EIGENE ABLAGE seit 2026-11-27 (Job 20261127-rezensionsfotos-eigene-ablage-
 * statt-google-rotation): `foto`, `bilder[].url` und `bilder[].thumb` zeigen
 * auf das Shopify-CDN (cdn.shopify.com, Shopify Files des Deutsch-Shops,
 * Namensraum qb-rezensionen--…, Manifest medien-hosting/data/manifest.db),
 * NICHT mehr auf lh3.googleusercontent.com. Grund: Google rotiert die
 * Google-Fotoadressen der Kundenfotos alle paar Wochen (dann 403 text/html,
 * das Foto verschwindet per onError still aus der Karte); dreimal von Hand
 * nachgezogen (PR #319, #902, #1724). Die Bilder sind einmal von Google
 * übernommen, inhaltlich unverändert. `thumb` ist eine eigene 112-px-Datei
 * (Googles =s112-c, 56 px bei DPR 2), weil bildThumbUrl() nur Google-URLs
 * verkleinert. Neue Rezension mit Foto: Bild per medien-hosting/bin/
 * cdn-publish --bereich rezensionen hochladen, nie die Google-Adresse
 * eintragen. Wache: homepage-bauer/pruefungen/probe_rezensionsbilder_
 * erreichbar.py misst diese Adressen.
 */
export const GOOGLE_REVIEWS_CURATED = [
  {
    "id": "253716832",
    "name": "Mirko Naber",
    "foto": "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-rezensionen--profil-mirko-naber--328aae8761fe.png?v=1795755969",
    // FOTO ZURÜCK 2026-10-12 (Job 20261011-eilbefund-storefront-rezensionsbild-
    // und-umschalter-prio22). Am 2026-09-10 war es entfernt worden, weil seine
    // Google-Fotoadresse mit 403 antwortete — eine von Google ROTIERTE Adresse,
    // kein gelöschtes Foto (Klasse im Kopf von ReviewKarte, ReputonWidget.jsx).
    // Der Live-Feed führt dasselbe Foto unter neuer Id; gemessen 200 image/jpeg.
    // Damit ist die Reihenfolge wieder stimmig: Foto-Einträge zuerst (Kopf).
    // NACHGEZOGEN 2026-11-25 (Job 20261125-folge-h9a3e7e-rezensionsfotos-
    // nachziehen-r2): beide Google-Fotoadressen (Mirko Naber, Therin Moreland)
    // wieder rotiert (403), neue Ids aus dem Reputon-Feed, je 200 image/jpeg.
    // EIGENE ABLAGE 2026-11-27: Foto auf das Shopify-CDN übernommen (Dateikopf),
    // damit ist dieser Nachzug nicht mehr nötig.
    "bilder": [
      {
        "url": "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-rezensionen--foto-mirko-naber--4916f626c519.jpg?v=1795756076",
        "thumb": "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-rezensionen--foto-mirko-naber-thumb--651aba56efc1.jpg?v=1795756082"
      }
    ],
    "rating": 5,
    "text": "Als Sportler und Trainer hatte ich schon sehr intensive Zeiten erlebt und bin im Nachhinein sehr, sehr dankbar, QiOne und das gesamte Umfeld sowie die Thematik kennengelernt zu haben. Themen wie Zellenschutz und Verbesserungen interessierten mich natürlich schon, doch die eigene Intuition nochmal zu schärfen und der neue, gesunde Weg, die eigene Zukunft noch bewusster zu gehen und es täglich zu spüren, ist der absolute positive Wahnsinn.\nDanke an das gesamte QiBlanco Team und besonders an Anna und Christian. Ich bin sehr glücklich damit.\nLiebe Grüße\nMirko",
    "datum": "2026-04-03"
  },
  {
    "id": "253206200",
    "name": "Therin Moreland",
    "foto": "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-rezensionen--profil-therin-moreland--2c628c87a0cf.png?v=1795755975",
    "bilder": [
      {
        "url": "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-rezensionen--foto-therin-moreland--260395364b75_ca5a4f06-70f4-401c-9e90-817d95dfeefc.jpg?v=1795756123",
        "thumb": "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-rezensionen--foto-therin-moreland-thumb--3a291f4af22d.jpg?v=1795756131"
      }
    ],
    "rating": 5,
    "text": "I believe I am officially what is referred to as an “Old Fart” as of December 28 this year I will be celebrating my 65th birthday!\nHowever, I have had more energy since Day1 of wearing my Qi chip!\nIt took about 2 weeks before I really noticed the difference and then I started on my journey to feeling better and younger everyday! I know getting rid of 90lbs. so far since February has complimented my results but the underlying energy I have flowing through my body is profoundly evident to me personally on a daily basis!\nThank you to everyone at Qi Blanco!\nAnd Merry Christmas!\nTherin Moreland",
    "datum": "2025-12-04"
  },
  {
    "id": "-1034576208",
    "name": "Vonni Wr",
    "foto": "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-rezensionen--profil-vonni-wr--8da73af961e4.png?v=1795755981",
    "bilder": [],
    "rating": 5,
    "text": "Seit über zwei Jahren trage ich meinen QiOne 2 Pro und ich möchte ihn nicht mehr missen. 💚\nIch bin ein sehr analytischer Mensch und manchmal eher skeptisch. Bevor ich mich für etwas entscheide, informiere ich mich ausführlich und hinterfrage vieles. Genau deshalb war ich selbst überrascht, wie deutlich ich die Veränderung für mich wahrgenommen habe.\nPersönlich fühle ich mich mit dem QiOne ausgeglichener, innerlich ruhiger, leistungsfähiger und ich schlafe deutlich entspannter. Um sicherzugehen, habe ich ihn sogar eine Zeit lang abgelegt und genau dieser Vergleich hat mich überzeugt.\nAus dieser Überzeugung heraus habe ich mir inzwischen auch das QiBracelet gekauft. Wunderschön verarbeitet, hochwertig und mit viel Liebe zum Detail gestaltet.\n\nWas mich aber genauso begeistert wie die Produkte selbst, sind die Menschen dahinter. So viel Herzlichkeit, echte Kundenfreundlichkeit und persönliches Interesse erlebt man heute nur noch selten.\n\nDanke für diese tollen Produkte und den wunderbaren Service mit Herz. 🙏✨🩷",
    "datum": "2026-07-02"
  },
  {
    "id": "699506123",
    "name": "Regina Schiele",
    "foto": "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-rezensionen--profil-regina-schiele--c504c30d19f7.png?v=1795755987",
    "bilder": [],
    "rating": 5,
    "text": "Viele meiner Bekannten tragen bereits die Qi Bianco Kette und sind vollkommen begeistert von ihrer Wirkung. Für mich persönlich war das Bracelet die bessere Wahl, da es für mich persönlich praktischer ist und perfekt zu meinem Alltag passt. Schon nach kurzer Zeit konnte ich selbst spüren, wie sich etwas in mir verändert hat: Ich fühlte mich innerlich ruhiger, gleichzeitig voller Energie und mit einer neuen Leichtigkeit im Alltag.\n\nDie ersten beiden Nächte waren etwas unruhig, und ich habe kurz überlegt, ob ich eine Pause einlegen sollte. Doch genau diese Phase hat mir gezeigt, dass mein Körper intensiv arbeitet und sich auf etwas Neues einstellt. Ab der dritten Nacht kam die Wende: Mein Schlaf wurde tiefer und erholsamer als je zuvor. Seither wache ich mit einem klaren Kopf auf und fühle mich fokussierter, strukturierter und einfach ausgeglichener. Meine teilweise innere Unruhe ist wie weggeblasen.\n\nBesonders berührt hat mich, wie schnell ich mich nach einer Operation erholt habe. Ich bin überzeugt, dass das Bracelet auch hier einen entscheidenden Beitrag geleistet hat – mein Körper fühlte sich gestärkt, mein Geist positiv und voller Zuversicht.\n\nFür mich ist das Qi Bianco Bracelet deshalb weit mehr als nur ein Schmuckstück. Es ist ein treuer Begleiter, der mir Tag für Tag innere Ruhe, neue Energie und Lebensfreude schenkt – und dabei auch noch wunderschön aussieht. Ich trage es mit Stolz und Dankbarkeit und kann es von Herzen weiterempfehlen.",
    "datum": "2025-12-04"
  },
  {
    "id": "288627209",
    "name": "Helena Bernardt",
    "foto": "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-rezensionen--profil-helena-bernardt--1303746cc514.png?v=1795755998",
    "bilder": [],
    "rating": 5,
    "text": "Ich trage den Qi Blanco Anhänger seit einigen Monaten fast durchgängig und er fühlt sich für mich wie eine liebevolle, ruhige Begleitung in meinem Feld an. Während meines Wasserfastens hatte ich ein Erlebnis, das mir noch einmal sehr deutlich gezeigt hat, wie unterstützend er wirkt.\n\nAn einem Fastentag war ich voller Energie, war bei einer Massage und habe den Anhänger dafür abgelegt – und danach vergessen, ihn wieder anzulegen. Am Abend wurde mir plötzlich extrem schlecht, ich hatte das Gefühl ich muss mich übergeben, mein ganzes System fühlte sich überlastet an, nichts hat wirklich geholfen.\n\nAls ich mich gefragt habe, was heute anders ist, wurde mir klar: Ich trage meinen Qi Blanco nicht. Also habe ich ihn wieder umgelegt – noch mit einem kleinen Schmunzeln, ob er mir jetzt wohl bei meinen Detoxsymptomen helfen wird. Und tatsächlich: Nach wenigen Minuten war die Übelkeit komplett verschwunden und ich war wieder ganz in meiner Energie.\nFür mich war das ein so schönes, klares Zeichen. Seitdem trage ich den Anhänger noch bewusster und spüre, wie er mich in meiner Energie stabil und liebevoll hält.",
    "datum": "2025-12-04"
  },
  {
    "id": "-956054649",
    "name": "Simone Wüst",
    "foto": "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-rezensionen--profil-simone-wust--4aae96c7be92.png?v=1795756008",
    "bilder": [],
    "rating": 5,
    "text": "Einfach nur wow! DAS hätte ich wirklich nicht erwartet. Seit ich die Kette trage brennt wie ein kleines Feuer in mir. Ich fühle so viel Energie, wie ein angenehmes Kribbeln im ganzen Körper. Und so eine angenehme Klarheit. Zum Schlafen kann ich sie (noch) nicht tragen, sonst bin ich einfach zu wach. Ich gebe sie nicht mehr her 😊😉",
    "datum": "2025-12-04"
  },
  {
    "id": "-729236865",
    "name": "Shari Wenzel",
    "foto": "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-rezensionen--profil-shari-wenzel--7a1cc2965def.png?v=1795756018",
    "bilder": [],
    "rating": 5,
    "text": "Super Produkte und wirklich guter Service:\nIch habe den QiOne Pro2 und das Bracelet und merke einen enormen Unterschied in meinem Alltag.\nIch bin viel ruhiger und selbst in stressigen Situationen viel gelassener.\nDer Anhänger war schon gold wert, aber in Verbindung mit dem Bracelet (jetzt als Ergänzung nach zwei Jahren) ist es einfach noch mal ein ganz anderes Level.\nAuch in meinem Bekanntenkreis gibt es 4 Leute, die total begeistert sind.",
    "datum": "2026-01-03"
  },
  {
    "id": "-1321031249",
    "name": "Pamela Hüster",
    "foto": "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-rezensionen--profil-pamela-huster--bf927f962c04.png?v=1795756030",
    "bilder": [],
    "rating": 5,
    "text": "Ich habe mein Qi Blanco erst wenige Tage und mein Schlaf hat sich deutlich verbessert. Die letzten Wochen hatte ich schon gar keine Tiefschlafphasen mehr und nun wieder 2-3 Stück pro Nacht nachweislich über meinen Fitnesstracker. Auch wache ich dadurch wesentlich erholter auf. Ich bin froh mich für den Qi Blanco entschieden zu haben! Vielleicht kommen mit der Zeit weitere messbare Veränderungen hinzu, ich bin sehr gespannt 🤗",
    "datum": "2025-12-04"
  },
  {
    "id": "-181533564",
    "name": "Birgit Desire",
    "foto": "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-rezensionen--profil-birgit-desire--c0aab55214c9.png?v=1795756039",
    "bilder": [],
    "rating": 5,
    "text": "Beim ersten Tragen habe ich eine Veränderung gespürt, war aber zunächst skeptisch, da ich Urlaub hatte und mich nicht in meinem gewohnten Arbeitsumfeld aufgehalten habe. Als ich das erste Mal wieder im Großraumbüro war, habe ich den Unterschied deutlich gespürt. Bisher war ich spätestens nach zwei Stunden nicht mehr in der Lage konzentriert zu arbeiten. Mit der Qui Blanco Kette konnte ich ohne Probleme den Tag überstehen.\nFazit: Eine Investition, die kein Urlaub ersetzen kann.\nBirgit Desire",
    "datum": "2025-11-04"
  },
  {
    "id": "850007411",
    "name": "Stefania Stock",
    "foto": "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-rezensionen--profil-stefania-stock--28a84a941089.png?v=1795756052",
    "bilder": [],
    "rating": 5,
    "text": "Nach kürzester Zeit hat der QiOne 2 Pro mir bei einer emotionalen Herausforderung geholfen, mich wieder innerlich zu zentrieren und auch auszubalancieren.\nIch kann wieder durchschlafen und selbst bei wenigen Stunden Schlaf, bin ich am nächsten Tag erholt\nIch kann den QiOne 2 Pro jedem empfehlen, den es ruft 💖",
    "datum": "2026-06-02"
  },
  {
    "id": "-906010528",
    "name": "Marla Wilhelmina von Spätzle",
    "foto": "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-rezensionen--profil-marla-wilhelmina-von-spatzle--e1b8fd585d4d.png?v=1795756062",
    "bilder": [],
    "rating": 5,
    "text": "Eine der wenigen Ketten, die man im Leben wirklich braucht. Elektrosmog: auf Nimmerwiedersehen. Bringt schon nach wenigen Tagen eine gesteigerte Ausgeglichenheit, erholsamen Schlaf und mehr Energie. Wenn man die Kette ablegt, spürt man, dass etwas fehlt. In meiner Familie trägt jeder eine.",
    "datum": "2026-02-02"
  },
  {
    "id": "-1868946154",
    "name": "Sabine Kohlweiss",
    "foto": "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-rezensionen--profil-sabine-kohlweiss--f374014c1ff3.png?v=1795756068",
    "bilder": [],
    "rating": 5,
    "text": "Seit ich den QiOne®2Pro trage, habe ich mehr Klarheit bei Entscheidungen und fühle mich selbstsicherer. Ich möchte ihn nicht mehr missen.",
    "datum": "2025-12-04"
  }
];
