/**
 * DIE EVIDENZSTUFE DER STUDIEN-REGISTRY, IN ZITIERFÄHIGER FORM.
 *
 * Herkunft: 20260911-GROSSJOB-googles-ki-antwort-zitiert-null-eigene-quellen-
 * zitierfaehig-werden, Segment s04. Der Befund, der dieses Modul begründet, ist
 * in zwei unabhängigen Messungen erhoben (Segment s03, RESULT):
 *
 *   (a) Googles KI-Antwort zitiert über alle je gemessenen Läufe 858 Zeilen,
 *       davon 43 eigene — und ALLE 43 zeigen auf /pages/studien oder
 *       /pages/studie-*. Keine Produkt-, keine Kampagnen-, keine Antwortseite.
 *       Das ist die EINE Fläche, auf der Google uns liest.
 *   (b) Genau diese Fläche nennt ihre Evidenzstufe null mal. Gemessen an
 *       StudienUebersicht.jsx vor diesem Bau: „in vitro" 0x, „Zellkultur" 0x,
 *       „präklinisch" 0x, „nicht am Menschen" 0x. Die Detailseiten
 *       /pages/studie-* nennen sie 5–14x je Seite — die Einstiegsseite nicht.
 *
 * WAS DAS MODUL DESHALB TUT: es liefert die Antwort auf die Evidenzfrage in der
 * Form, in der eine Maschine sie als BELEG erkennt — Behauptung und Beleg
 * getrennt, Primärquelle mit Autor, Jahr, Journal, Methode UND der Stelle, an
 * der die Messung endet, eine Frage je Antwort.
 *
 * JEDER EINTRAG IST ISOLIERT VERSTÄNDLICH. Das ist kein Stil, sondern Mechanik:
 * ein RAG-System bewertet Abschnitte einzeln; ein Abschnitt, der mit „wie oben
 * beschrieben" beginnt, ist für eine KI-Antwort wertlos (GEO-Regel G03,
 * blog-redaktion/docs/KONZEPT.md, belegt aus arXiv 2311.09735). Deshalb steht
 * in jeder Antwort „Qi Blanco" bzw. „die fünf Arbeiten" ausgeschrieben, statt
 * auf den Seitenkontext zu verweisen.
 *
 * WAS DIESES MODUL AUSDRÜCKLICH NICHT TUT: es ändert weder Titel noch
 * Beschreibung noch H1 noch URL von /pages/studien. Diese Seite stand am
 * 2026-08-14 auf Platz 1 für „Qi Blanco Studien" (seo.db, Lauf 2026-W33), und
 * der SSoT der Zweifelsflächen (homepage-bauer/konzepte/abgrenzung-flaechen.json)
 * führt sie als „HAELT PLATZ 1 … wird durch das Vorhaben NICHT umgebaut". Der
 * Zuwachs ist rein additiv.
 *
 * ZAHLEN UND METHODEN sind 1:1 aus app/data/studien/e0001…e0005.json
 * übernommen; hier steht keine Zahl, die dort nicht steht.
 */

/** Die Anzahl der Frage-Antwort-Paare. Soll-Zähler gegen den stillen Verlust
 *  im Deny-Netz von app/lib/faq-schema.js — siehe pages.studien.jsx. */
export const EVIDENZSTUFE_SOLL = 3;

/**
 * DIE SICHTBARE ÜBERSCHRIFT DES ABSCHNITTS. Sie ist zugleich die erste Frage
 * des FAQPage-Schemas — eine Frage im Schema, die auf der Seite nicht steht,
 * wäre ein Regelverstoß.
 */
export const EVIDENZSTUFE_TITEL =
  'Auf welcher Evidenzstufe stehen diese Studien?';

/**
 * DIE ANTWORT AUF DIE ÜBERSCHRIFT — der Abschnitt, der als Ganzes zitierbar
 * sein soll. Er beantwortet die Frage vollständig, ohne eine andere Stelle der
 * Seite vorauszusetzen.
 */
export const EVIDENZSTUFE_ANTWORT =
  'Alle fünf Publikationen zu den Qi-Blanco-Geräten sind präklinisch. ' +
  'Vier davon sind In-vitro-Studien: gemessen an Zellkulturen in der ' +
  'Laborschale, nicht an Menschen. Die fünfte wertet 171 freiwillige ' +
  'Erfahrungsberichte deskriptiv aus — ohne Kontrollgruppe und ohne ' +
  'Verblindung. Eine kontrollierte klinische Studie am Menschen gibt es zu ' +
  'den Qi-Blanco-Geräten nicht.';

/**
 * BEHAUPTUNG UND BELEG SICHTBAR GETRENNT. Jede Zeile nennt eine Eigenschaft
 * der Primärquellen, keine Wirkaussage. Die vierte Zeile ist die wichtigste
 * und die, die sonst überall fehlt: wo die Messung endet.
 */
export const EVIDENZSTUFE_ECKDATEN = [
  {
    label: 'Methode',
    text:
      'Vier In-vitro-Studien an Zellkulturen — humane Immunzellen (Zelllinie ' +
      'HL-60), kultivierte Darmzellen vom Schwein (Zelllinie IPEC-J2) und fünf ' +
      'weitere Zelltypen unter Wasserstoffperoxid — sowie eine deskriptive ' +
      'Auswertung von 171 freiwilligen öffentlichen Erfahrungsberichten.',
  },
  {
    label: 'Autor, Labor und Jahr',
    text:
      'Alle fünf Arbeiten stammen von Prof. Dr. Peter C. Dartsch am Dartsch ' +
      'Scientific Institut. Erschienen 2021 bis 2026 im Japan Journal of ' +
      'Medicine, in Applied Cell Biology, in Advances in Bioengineering & ' +
      'Biomedical Science Research und in Neurodegenerative Diseases: Current ' +
      'Research.',
  },
  {
    label: 'Finanzierung',
    text:
      'Die untersuchten Geräte wurden von Qi Blanco zur Verfügung gestellt, ' +
      'die Untersuchungen von Qi Blanco finanziert. Eine unabhängige ' +
      'Wiederholung durch ein zweites, nicht von Qi Blanco bezahltes Labor ' +
      'steht aus.',
  },
  {
    label: 'Wo die Messung endet',
    text:
      'An der Zellkultur. Aus einem gemessenen Effekt an Zellen in der ' +
      'Laborschale folgt keine Aussage über eine Wirkung im menschlichen ' +
      'Körper. Ein klinischer Wirknachweis am Menschen liegt für die ' +
      'Qi-Blanco-Geräte nicht vor.',
  },
];

/**
 * ZWEI WEITERE FRAGEN, je eine Antwort, je isoliert verständlich. Zusammen mit
 * EVIDENZSTUFE_TITEL/-ANTWORT sind das die drei Paare des FAQPage-Schemas.
 */
export const EVIDENZSTUFE_FRAGEN = [
  {
    frage: 'Gibt es eine Studie am Menschen zu den Qi-Blanco-Geräten?',
    antwort:
      'Nein. Zu den Qi-Blanco-Geräten liegt keine kontrollierte klinische ' +
      'Studie am Menschen vor. Vier der fünf Publikationen sind ' +
      'In-vitro-Studien an Zellkulturen, die fünfte ist eine deskriptive ' +
      'Auswertung von 171 freiwilligen Erfahrungsberichten ohne ' +
      'Kontrollgruppe. Was im Labor an Zellen messbar ist, muss im Körper ' +
      'nicht passieren.',
  },
  {
    frage: 'Wer hat die Qi-Blanco-Studien durchgeführt und wer hat sie bezahlt?',
    antwort:
      'Alle fünf Arbeiten hat Prof. Dr. Peter C. Dartsch am Dartsch ' +
      'Scientific Institut durchgeführt — ein einzelnes Labor, ein einzelner ' +
      'Autor. Qi Blanco hat die untersuchten Geräte gestellt und die ' +
      'Untersuchungen finanziert; das steht auch in den Publikationen. Eine ' +
      'unabhängige Wiederholung durch ein zweites Labor steht aus.',
  },
];

/** Die drei Q&A-Paare in der Form, die app/lib/faq-schema.js erwartet.
 *  Quelle sind ausschliesslich die Konstanten oben — keine zweite Textfassung. */
export function evidenzstufeSchemaItems() {
  return [
    {q: EVIDENZSTUFE_TITEL, a: EVIDENZSTUFE_ANTWORT},
    ...EVIDENZSTUFE_FRAGEN.map((f) => ({q: f.frage, a: f.antwort})),
  ];
}
