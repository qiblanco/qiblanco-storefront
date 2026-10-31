/**
 * /pages/potenzialtest — reine Funktionen (ohne React, ohne Netz), damit Route
 * und Komponente dieselben Regeln lesen und ein Test sie ohne Browser prüft
 * (potenzialtest.test.mjs).
 *
 * WAS HIER NICHT STEHT: die Auswertung. Umpolung, Prozente, Index und Typ
 * rechnet allein der Dienst (Grossjob 20261030-…-potenzialtest, s02, Vertrag
 * api_vertrag der Spezifikation). Eine zweite Rechnung auf der Seite könnte
 * still vom Server abweichen, und das Ergebnis auf der Seite wäre dann ein
 * anderes als das in der Mail.
 */
import {PT} from './potenzialtest-spec.js';

export const FRAGEN_IDS = PT.fragen.map((f) => f.id);
export const INTERESSE_IDS = PT.qInteresse.optionen.map((o) => o.id);
export const DIMENSIONEN_IDS = PT.dimensionen.map((d) => d.id);

/** Grobe Form einer Mail-Adresse; die echte Prüfung macht der Dienst. */
const MAIL_MUSTER = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Nur Buchstaben, Ziffern und wenige Zeichen: die Quelle landet im Journal des Dienstes. */
function sauber(wert) {
  return String(wert || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '')
    .slice(0, 60);
}

/**
 * Quelle aus der Einstiegs-URL: utm_source[/utm_campaign] oder 'direkt'
 * (Spezifikation: "utm_source/utm_campaign oder 'direkt'").
 */
export function quelleAusSuche(searchParams) {
  const s = sauber(searchParams?.get?.('utm_source'));
  const c = sauber(searchParams?.get?.('utm_campaign'));
  if (!s) return 'direkt';
  return c ? `${s}/${c}` : s;
}

/** Eine schon gebildete Quelle (verstecktes Feld) erneut säubern; nie freie Weitergabe. */
export function quelleSaeubern(wert) {
  const teile = String(wert || '')
    .split('/')
    .map(sauber)
    .filter(Boolean)
    .slice(0, 2);
  return teile.length ? teile.join('/') : 'direkt';
}

/** Ein Gesprächsangebot nur bei Produktinteresse UND Gesprächswunsch (regel_1zu1). */
export function gespraechGewuenscht(qInteresse, qGespraech) {
  return (
    INTERESSE_IDS.includes(qInteresse) &&
    qInteresse !== 'nur_ergebnis' &&
    qGespraech === 'ja'
  );
}

/**
 * Den Terminweg zeigt die Seite nur, wenn der Dienst ihn anbietet UND die
 * Antworten ihn verlangen. Beide Seiten müssen zustimmen: ein Fehler auf einer
 * Seite allein öffnet den Weg nie.
 */
export function terminwegZeigen(ergebnis, qInteresse, qGespraech) {
  return (
    Boolean(ergebnis?.gespraech_angeboten) &&
    gespraechGewuenscht(qInteresse, qGespraech)
  );
}

/**
 * Formular -> Anfrage an den Dienst. Liefert {fehler} mit Feld und Satz für
 * die Kundin oder {anfrage} in genau der Form des Vertrags.
 */
export function anfrageAusFormular(form) {
  const wert = (k) => String(form.get(k) ?? '').trim();
  const antworten = {};
  for (const id of FRAGEN_IDS) {
    const n = Number(wert(id));
    if (!Number.isInteger(n) || n < 1 || n > 5) {
      return {
        fehler: {
          feld: id,
          text: 'Bitte beantworte zuerst alle 15 Fragen.',
        },
      };
    }
    antworten[id] = n;
  }
  const qInteresse = wert('q_interesse');
  if (!INTERESSE_IDS.includes(qInteresse)) {
    return {
      fehler: {feld: 'q_interesse', text: 'Bitte wähle eine Antwort aus.'},
    };
  }
  // Ohne Produktinteresse fragt die Seite nicht nach dem Gespräch: dann gilt nein.
  const qGespraech =
    qInteresse === 'nur_ergebnis'
      ? 'nein'
      : ['ja', 'nein'].includes(wert('q_gespraech'))
        ? wert('q_gespraech')
        : '';
  if (!qGespraech) {
    return {
      fehler: {feld: 'q_gespraech', text: 'Bitte wähle Ja oder Nein.'},
    };
  }
  const email = wert('email').slice(0, 200);
  if (!email) {
    return {
      fehler: {feld: 'email', text: 'Bitte gib deine E-Mail-Adresse ein.'},
    };
  }
  if (!MAIL_MUSTER.test(email)) {
    return {
      fehler: {
        feld: 'email',
        text: 'Diese E-Mail-Adresse sieht unvollständig aus. Bitte prüf sie noch einmal.',
      },
    };
  }
  if (wert('einwilligung') !== 'ja') {
    return {
      fehler: {
        feld: 'einwilligung',
        text: 'Damit wir dir dein Ergebnis schicken dürfen, setz bitte den Haken.',
      },
    };
  }
  return {
    anfrage: {
      antworten,
      q_interesse: qInteresse,
      q_gespraech: qGespraech,
      vorname: wert('vorname').slice(0, 80),
      email,
      einwilligung: true,
      quelle: quelleSaeubern(wert('quelle')),
      test_lauf: wert('test_lauf') === '1',
    },
  };
}

/** Zahl 0..100 oder null. */
function prozent(x) {
  const n = Number(x);
  return Number.isFinite(n) && n >= 0 && n <= 100 ? Math.round(n) : null;
}

/**
 * Antwort des Dienstes prüfen. Fehlt ein Teil, den die Seite zeigen müsste,
 * ist das KEIN Ergebnis (null) — die Seite zeigt dann den Fehlersatz statt
 * halber Balken.
 */
export function ergebnisAusAntwort(body) {
  if (!body || body.ok !== true) return null;
  const index = prozent(body.index);
  const dims = body.dimensionen || {};
  const dimensionen = DIMENSIONEN_IDS.map((id) => ({id, wert: prozent(dims[id])}));
  const hebel = Array.isArray(body.hebel)
    ? body.hebel.filter((h) => typeof h === 'string' && h.trim())
    : [];
  if (
    index === null ||
    dimensionen.some((d) => d.wert === null) ||
    typeof body.typ_name !== 'string' ||
    !body.typ_name.trim() ||
    typeof body.satz !== 'string' ||
    hebel.length === 0
  ) {
    return null;
  }
  const pdf =
    typeof body.pdf_url === 'string' && /^https:\/\//.test(body.pdf_url)
      ? body.pdf_url
      : null;
  return {
    ergebnis_id: String(body.ergebnis_id || ''),
    typ: String(body.typ || ''),
    typ_name: body.typ_name,
    index,
    dimensionen,
    satz: body.satz,
    hebel: hebel.slice(0, 3),
    gespraech_angeboten: body.gespraech_angeboten === true,
    mail_status: String(body.mail_status || ''),
    pdf_url: pdf,
  };
}

/** Der Satz zur Mail — nur das, was wirklich passiert ist. */
export function mailSatz(mailStatus) {
  if (mailStatus === 'versandt') return 'Dein Ergebnis kommt auch per Mail, mit PDF.';
  if (mailStatus === 'test_unterdrueckt')
    return 'Testbetrieb: An diese Adresse geht noch keine Mail. Dein Ergebnis steht hier.';
  return 'Die Mail mit deinem Ergebnis konnte gerade nicht verschickt werden. Hier steht es vollständig.';
}

/** Fehlersätze je Antwort des Dienstes (Vertrag: 400, 429, 503). */
export function fehlerSatz(status, body) {
  if (status === 400)
    return (
      (typeof body?.text === 'string' && body.text.trim()) ||
      'Da fehlt noch eine Angabe. Bitte prüf deine Antworten und deine E-Mail-Adresse.'
    );
  if (status === 429)
    return 'Du hast den Test gerade schon mehrfach abgeschickt. Bitte versuch es in ein paar Minuten noch einmal.';
  return 'Die Auswertung ist gerade nicht erreichbar. Deine Antworten sind noch da: bitte versuch es gleich noch einmal oder schreib uns an service@qiblanco.com.';
}
