/**
 * QI BLANCO AUF TRUSTPILOT — Datenmodul für /pages/qi-blanco-auf-trustpilot.
 *
 * WOZU DIESE DATEI: Zum Zweifelsbegriff „Qi Blanco Trustpilot" lag unser
 * Eigenanteil in Googles KI-Antwort am 2026-09-30 bei 5 von 58 Zitatzeilen
 * (8,6 %, seo-manager/data/seo.db, Tabelle `flaeche`, letzte 14 Tage), und
 * der Begriff hatte keine zuständige Seite. Zitiert wurden vor allem die
 * Trustpilot-Seiten selbst. Die Antwort darauf ist eine Zählung mit Quelle
 * und Stand, kein Werbetext.
 *
 * DIE QUELLE IST EIN PROFIL, NICHT „GANZ TRUSTPILOT": de.trustpilot.com/
 * review/qiblanco.com, nachgelesen am 2026-10-01. trustpilot.com antwortet
 * dem Server mit HTTP 403; gelesen wurde über einen Abruf-Dienst, viermal
 * (de Seite 1, de Seite 2 zweimal, www). Zahl, TrustScore, Verteilung,
 * Profilstatus und Einladungs-Vermerk kamen in allen vier Lesungen gleich
 * an. DATUMSANGABEN NICHT: sie widersprachen sich zwischen den Lesungen.
 * Deshalb nennt die Seite kein einzelnes Bewertungsdatum und keinen Namen,
 * nur die Summe und den Stand.
 *
 * KEINE ZAHL IM TEXT IST EIN LITERAL außer in `PROFIL`: Anzahl, Verteilung
 * und „keine unter vier Sternen" werden aus `PROFIL.sterne` gezählt. Wer das
 * Profil neu nachliest, ändert die Seite an EINER Stelle, und `STAND` im
 * selben Commit. Die stehende Wache seo-manager/pruefungen/
 * probe_trustpilot_stand_auf_der_seite.py vergleicht den TrustScore der
 * Live-Seite täglich mit dem, den Google im Zensus neben dem Profil anzeigt.
 *
 * WAS BEWUSST NICHT HIER STEHT:
 * - Kein Name und kein Wortlaut einer Bewertung. Die Namen sind Daten
 *   Dritter, und die Wortlaute stehen bei Trustpilot, wo jede einzeln lesbar
 *   ist.
 * - Keine Note eines anderen Unternehmens. Google zeigt zur Suche auch die
 *   Profile von BLANCO (Küchenspülen). Wir sagen, wem sie gehören, nicht,
 *   wie sie bewertet sind.
 * - Kein Grund, warum das Profil nicht beansprucht ist. Das ist eine stehende
 *   Entscheidung (ruf-manager/konzepte/KONZEPTPLAN.md, Kapitel 9); die Seite
 *   nennt die Tatsache und was sie für den Leser bedeutet.
 */

/** Stand der Nachlese. Wer `PROFIL` ändert, zieht ihn im selben Commit nach. */
export const STAND = '2026-10-01';
export const STAND_TEXT = '1. Oktober 2026';

/**
 * Das Profil, wie Trustpilot es am Stand zeigte. `trustscore` ist die Zahl,
 * die Trustpilot selbst ausweist. Sie ist KEIN Durchschnitt der Sterne
 * (Trustpilot gewichtet nach eigenem Verfahren), deshalb wird sie hier nicht
 * nachgerechnet, sondern übernommen.
 */
export const PROFIL = {
  url: 'https://de.trustpilot.com/review/qiblanco.com',
  anzeige: 'de.trustpilot.com/review/qiblanco.com',
  trustscore: '4,7',
  sterne: {5: 26, 4: 1, 3: 0, 2: 0, 1: 0},
  beansprucht: false,
  einladungen: 0,
  unternehmensantworten: 0,
};

/**
 * Profile, die Google zur Suche „Qi Blanco Trustpilot" ebenfalls zeigt und
 * die NICHT zu uns gehören (seo.db, organisch und Bilder, 2026-09-22 bis
 * 2026-09-30). Gezeigt wird nur, wem sie gehören.
 */
export const FREMDE_PROFILE = ['blanco.de', 'www.blanco.com'];

/** Zahlwörter bis zwölf: im Fließtext liest sich „fünf" anders als „5". */
const WORT = [
  'keine', 'eine', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht',
  'neun', 'zehn', 'elf', 'zwölf',
];
export function zahlwort(n) {
  return Number.isInteger(n) && n >= 0 && n < WORT.length ? WORT[n] : String(n);
}

const s = PROFIL.sterne;
export const ZAHL = {
  alle: s[5] + s[4] + s[3] + s[2] + s[1],
  fuenf: s[5],
  vier: s[4],
  unterVier: s[3] + s[2] + s[1],
};

/** Google-Rezensionen, Studie, Videos: wo es mehr Stimmen gibt. */
export const BERICHTE_STUDIE = 171;

export const KOPF = {
  vorspann: 'Trustpilot, nachgelesen',
  titel: 'Qi Blanco auf Trustpilot',
  lead:
    `Auf Trustpilot stehen ${ZAHL.alle} Bewertungen zu Qi Blanco, mit einem ` +
    `TrustScore von ${PROFIL.trustscore} von 5. Alle ${ZAHL.alle} haben ` +
    'Kundinnen und Kunden ohne Einladung von uns geschrieben. Qi Blanco hat ' +
    'das Profil nicht beansprucht und verwaltet es nicht.',
  quelle:
    `Trustpilot-Profil ${PROFIL.anzeige}, einzeln nachgelesen. ` +
    `Stand: ${STAND_TEXT}.`,
};

/** Die Verteilung als Zeilen, von fünf Sternen abwärts. */
export const VERTEILUNG = [5, 4, 3, 2, 1].map((n) => ({
  sterne: n,
  anzahl: s[n],
}));

export const PROFIL_ABSCHNITT = {
  titel: 'Was im Profil steht',
  einleitung:
    `${ZAHL.fuenf} Bewertungen geben fünf Sterne, ` +
    `${zahlwort(ZAHL.vier)} gibt vier. ` +
    (ZAHL.unterVier === 0
      ? 'Mit drei Sternen oder weniger hat niemand bewertet.'
      : `${ZAHL.unterVier} Bewertungen liegen bei drei Sternen oder darunter.`),
  punkte: [
    {
      id: 'unaufgefordert',
      titel: 'Ohne Einladung geschrieben',
      text:
        'Jede Bewertung trägt bei Trustpilot den Vermerk „Unaufgeforderte ' +
        'Bewertung". Trustpilot hält außerdem fest, dass das Unternehmen ' +
        'seine Kundschaft nicht zum Bewerten eingeladen hat.',
    },
    {
      id: 'nicht-beansprucht',
      titel: 'Trustpilot führt das Profil',
      text:
        'Trustpilot führt das Profil als „nicht beansprucht". Qi Blanco hat ' +
        'dort kein Konto, lädt niemanden ein und antwortet nicht auf ' +
        'Bewertungen.',
    },
    {
      id: 'wenige',
      titel: `${ZAHL.alle} Stimmen sind ein kleiner Ausschnitt`,
      text:
        'Die meisten Rückmeldungen unserer Kundschaft stehen im ' +
        'Google-Unternehmensprofil von Qi Blanco.',
    },
  ],
};

export const FREMD = {
  titel: 'Zwei Profile, die nicht zu uns gehören',
  text:
    'Zur Suche „Qi Blanco Trustpilot" zeigt Google auch die Trustpilot-Profile ' +
    `von ${FREMDE_PROFILE.join(' und ')}. Sie gehören zu BLANCO, einem ` +
    'Hersteller von Küchenspülen und Armaturen. Ihre Bewertungen handeln von ' +
    'Küchen, nicht von Qi Blanco.',
  quelle:
    'Quelle: Googles Ergebnisse zur Suche „Qi Blanco Trustpilot" auf ' +
    'google.de, Abrufe vom 22. bis 30. September 2026.',
};

export const STIMMEN = {
  titel: 'Wo du mehr Stimmen liest',
  studie: {
    text:
      `${BERICHTE_STUDIE} Menschen haben ihre Erfahrungen mit dem QiOne® 2 Pro ` +
      'und dem QiBracelet® von sich aus in sozialen Medien geteilt. Eine 2024 ' +
      'veröffentlichte Arbeit hat diese Berichte gesammelt und beschreibend ' +
      'ausgewertet, ohne Kontrollgruppe.',
    beleg: 'P. C. Dartsch, Advances in Bioengineering & Biomedical Science Research, 2024',
    belegPfad: '/pages/studie-nutzererfahrung',
  },
  videos: {
    text:
      'Andere erzählen in eigenen Videos, mit Namen und Gesicht, was sie ' +
      'erlebt haben.',
    pfad: '/pages/erfahrungen',
    linktext: 'Erfahrungen in eigenen Worten',
  },
};

export const SELBST = {
  titel: 'Selbst ausprobieren',
  text:
    'Du musst weder Trustpilot noch uns glauben. Den QiOne® 2 Pro kannst du ' +
    '20 Tage ab Erhalt tragen und zurückgeben, ohne einen Grund zu nennen. ' +
    'Die unmittelbaren Kosten der Rücksendung trägst du.',
};

/**
 * KURZ GEFRAGT — sichtbar auf der Seite UND Quelle des FAQPage-Schemas. Eine
 * Frage im Schema, die nicht sichtbar dasteht, wäre ein Verstoß gegen Googles
 * Richtlinien für strukturierte Daten. Die Google-Note steht NICHT hier,
 * sondern im Abschnitt darüber, live aus useGoogleRating(): eine bewegliche
 * Zahl im Schema würde still veralten.
 */
export const FRAGEN = [
  {
    id: 'gibt-es',
    q: 'Ist Qi Blanco auf Trustpilot?',
    a:
      `Ja. Unter ${PROFIL.anzeige} stehen ${ZAHL.alle} Bewertungen mit einem ` +
      `TrustScore von ${PROFIL.trustscore} von 5 (Stand ${STAND_TEXT}).`,
  },
  {
    id: 'schlechte',
    q: 'Gibt es auf Trustpilot schlechte Bewertungen über Qi Blanco?',
    a:
      ZAHL.unterVier === 0
        ? `Nein. Am ${STAND_TEXT} hat keine der ${ZAHL.alle} Bewertungen ` +
          'weniger als vier Sterne.'
        : `Ja. Am ${STAND_TEXT} liegen ${ZAHL.unterVier} der ${ZAHL.alle} ` +
          'Bewertungen bei drei Sternen oder darunter.',
  },
  {
    id: 'eingeladen',
    q: 'Hat Qi Blanco Kunden zum Bewerten auf Trustpilot eingeladen?',
    a:
      'Nein. Jede Bewertung trägt dort den Vermerk „Unaufgeforderte ' +
      'Bewertung", und Trustpilot hält fest, dass das Unternehmen niemanden ' +
      'eingeladen hat.',
  },
  {
    id: 'antworten',
    q: 'Warum antwortet Qi Blanco nicht auf Trustpilot?',
    a:
      'Weil Qi Blanco das Profil nicht beansprucht hat und dort kein Konto ' +
      'führt. Fragen beantworten wir über unseren Kundenservice.',
  },
  {
    id: 'kuechen',
    q: 'Warum zeigt Google bei „Qi Blanco Trustpilot" Bewertungen über Küchen?',
    a:
      'Weil die Profile von blanco.de und blanco.com das Wort „Blanco" ' +
      'tragen. Sie gehören zu BLANCO, einem Hersteller von Küchenspülen, ' +
      'nicht zu Qi Blanco.',
  },
  {
    id: 'ausprobieren',
    q: 'Kann ich den QiOne® 2 Pro selbst ausprobieren?',
    a:
      'Ja. Du hast 20 Tage ab Erhalt, um ihn zurückzugeben, ohne einen Grund ' +
      'zu nennen. Die unmittelbaren Kosten der Rücksendung trägst du.',
  },
  {
    id: 'stand',
    q: 'Wie aktuell sind diese Angaben?',
    a:
      `Stand ist der ${STAND_TEXT}. Das Profil ist an diesem Tag einzeln ` +
      'nachgelesen. Die aktuelle Zahl steht jederzeit bei Trustpilot selbst.',
  },
];
