import {OHNE_RISIKO, SAUNA_WEG, ohneRisikoAn} from './ohne-risiko-daten';

/*
 * OhneRisikoKaufen: Rückgabe und Raten als EIN Abschnitt, die Fragen als
 * Überschrift, die Antworten offen darunter (kein Akkordeon: eine zugeklappte
 * Antwort trägt `hidden` und zählt weder für den Leser noch als Antwort unter
 * der Überschrift). SaunaWeg: die sichtbare Zeile zur Sauna-Antwortseite
 * direkt unter „Kunden fragen". Texte, Schalter und Begründung:
 * ./ohne-risiko-daten.js. Stil: styles/qb-ohne-risiko.css (nur die
 * QiBracelet-Seite lädt es).
 *
 * BEWUSST OHNE data-section: die Kaufseiten sind anker-frei (Design-Rubrik-
 * Collector, siehe QiBraceletSeite.jsx). data-qb-ohne-risiko und
 * data-qb-sauna-weg sind die Messanker, data-textplatz der Platz in der
 * Textmappe.
 */
export function OhneRisikoKaufen({handle}) {
  if (!ohneRisikoAn(handle)) return null;
  const titelId = `qb-or-titel-${handle}`;
  return (
    <section
      className="qb-or NormalSectionSize"
      data-qb-ohne-risiko=""
      data-textplatz={`${handle}.ohne-risiko`}
      aria-labelledby={titelId}
    >
      <h2 id={titelId} className="qb-or__titel">
        {OHNE_RISIKO.titel}
      </h2>
      {OHNE_RISIKO.fragen.map((f) => (
        <div key={f.id} className="qb-or__frage">
          <h3 id={f.id}>{f.frage}</h3>
          {f.absaetze.map((absatz) => (
            <p key={absatz}>{absatz}</p>
          ))}
        </div>
      ))}
    </section>
  );
}

export function SaunaWeg({handle}) {
  if (!ohneRisikoAn(handle, SAUNA_WEG)) return null;
  return (
    <p className="qb-or-weg NormalSectionSize" data-qb-sauna-weg="">
      {SAUNA_WEG.vorspann} <a href={SAUNA_WEG.pfad}>{SAUNA_WEG.text}</a>
    </p>
  );
}
