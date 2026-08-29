/**
 * Renderer EINER Studien-Einzelseite. Alle Routen teilen ihn sich — der
 * Unterschied zwischen den Seiten ist ausschließlich das Daten-JSON.
 *
 * AUFBAU (von oben nach unten) — GOLDSTANDARD seit 2026-08-15, Auftrag
 * 20260815-studien-oberbereich-goldstandard-us-layout-de-qa:
 *   1. Kopf: Kicker, H1, Originaltitel
 *   2. Antwort in Normalsprache mit Befund-Bullets — der Featured-Snippet-
 *      Kandidat, ganz oben
 *   3. Beleg-Kopf: Titelseite (PDF-Klickziel) UND Metadaten NEBENEINANDER
 *   4. Inhaltsverzeichnis mit Sprungmarken
 *   5. Der deutsche Volltext mit Abbildungen und Tabellen
 *   6. FAQ, Zitation, verwandte Studien, Produktbezug
 *
 * WAS SICH GEGENUEBER DEM VORGAENGER-AUFBAU GEAENDERT HAT: die Metadaten
 * standen bis dahin als schlichte Liste IM Kopf, also VOR der Antwort, und
 * die PDF-Titelseite in einer eigenen Zeile DANACH. Beides ist jetzt der
 * gemeinsame `.qb-st-belegkopf` unterhalb der Antwort — die Anordnung der
 * US-Studienseiten, die Christian als Vorbild benannt hat.
 *
 * WARUM DIE LAIEN-EBENE VOR DEM VOLLTEXT STEHT: der Kaufueberzeugungs-Kanon
 * misst, dass wissenschaftlicher Beweis kein Hook ist, sondern ein Closer —
 * er wirkt beim Zweifel. Wer hier landet, zweifelt bereits und sucht eine
 * Antwort, keine Methodik. Die Methodik muss trotzdem vollständig da sein,
 * denn sie ist der Grund, warum die Antwort trägt.
 */

import {Link} from 'react-router';
import {
  STUDIEN,
  UEBERSICHT_PFAD,
  studienPfad,
  verwandteStudien,
  zahlwort,
} from '~/data/studien';

export function StudieSeite({studie}) {
  const e = studie.eckdaten;
  const laie = studie.laienSummary || {};
  const grafikNach = Object.fromEntries(
    (studie.grafiken || []).map((g) => [g.key, g]),
  );
  const tabelleNach = Object.fromEntries(
    (studie.tabellen || []).map((t) => [t.key, t]),
  );
  const verwandt = verwandteStudien(studie);

  return (
    <div className="qb-st qb-st-einzel">
      <article className="qb-st-wrap">
        <nav className="qb-st-krume" aria-label="Sie sind hier">
          <Link to="/">Start</Link>
          <span aria-hidden="true">›</span>
          <Link to={UEBERSICHT_PFAD}>Studien</Link>
          <span aria-hidden="true">›</span>
          <span aria-current="page">{studie.seo.h1}</span>
        </nav>

        <header className="qb-st-kopf">
          <p className="qb-st-kicker">Fachpublikation · {e.produkt}</p>
          <h1>{studie.seo.h1}</h1>
          <p className="qb-st-original" lang="en">
            {e.titelOriginal}
          </p>
        </header>

        <section className="qb-st-antwort" aria-labelledby="kurz">
          <h2 id="kurz">{laie.frage || 'Worum geht es in dieser Studie?'}</h2>
          <p className="qb-st-antwort-text">{laie.antwort}</p>
          {laie.punkte?.length ? (
            <ul className="qb-st-punkte">
              {laie.punkte.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          ) : null}
          {/* Der selbstkritische Einordnungs-Absatz aus `laienSummary.einordnung`
              wird bewusst NICHT mehr gerendert — Christian-Auftrag
              20260815-studienseiten-funding-limitations-sektionen-entfernen:
              ersatzlos, KEINE Ersatz-Formulierung. Das Datenfeld bleibt in
              app/data/studien/*.json erhalten (reiner Render-Rückbau, kein
              Datenverlust; Rückweg = diesen Block wiederherstellen).
              Wortlaut der alten Überschrift bewusst nicht zitiert: er würde
              sonst im Client-Bundle stehen und die Live-Proben falsch-rot machen. */}
        </section>

        {/*
          BELEG-KOPF (Goldstandard, Auftrag 20260815-studien-oberbereich-
          goldstandard-us-layout-de-qa): Titelseite und Metadaten stehen
          NEBENEINANDER statt untereinander — die Anordnung der US-Seiten,
          die Christian als Vorbild benannt hat.

          WARUM ER HIER STEHT UND NICHT MEHR IM <header>: der Kaufueberzeugungs-
          Kanon misst, dass wissenschaftlicher Beweis kein Hook ist, sondern
          ein Closer. Wer auf dieser Seite landet, zweifelt und sucht ZUERST
          die Antwort — die Q&A-Box darueber. Journal, DOI und ISSN sind das,
          was den Zweifel danach trägt. Sie vor die Antwort zu stellen (der
          alte Aufbau) verschenkt beides: die Antwort kommt spaeter, der Beleg
          wirkt, bevor jemand ihn braucht.
        */}
        <div className="qb-st-belegkopf">
          <a
            className="qb-st-pdf-karte"
            href={e.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={e.coverUrl}
              alt={`Titelseite der Publikation „${e.titelOriginal}“`}
              width="160"
              height="207"
              loading="lazy"
            />
            <span>
              <strong>Original-Publikation als PDF</strong>
              <span className="qb-st-pdf-meta">
                {e.journal} · englisch · öffnet in neuem Tab
              </span>
            </span>
          </a>

          <dl className="qb-st-eckdaten">
            <Eckdatum label="Veröffentlicht in">
              {e.journal}
              {e.band ? `, ${e.band}` : ''}
            </Eckdatum>
            {e.veroeffentlicht ? (
              <Eckdatum label="Datum">
                <time dateTime={e.veroeffentlicht}>{datum(e.veroeffentlicht)}</time>
              </Eckdatum>
            ) : null}
            {/*
              Die drei folgenden Felder sind die DACH-Haelfte des Goldstandard-
              Kreuztauschs: die US-Seiten trugen sie (Study type / Cells-
              material / Device tested), die DACH-Seiten nicht — gemessen am
              2026-08-15 auf allen 10 Live-Seiten.

              `materialLabel` ist ein DATENFELD und keine Konstante, weil e0004
              KEINE Zellstudie ist (171 Anwenderberichte, keine Kontrollgruppe).
              Eine fest verdrahtete Zeile "Zellen / Material" wäre dort eine
              sachliche Falschaussage auf einer Beleg-Seite.
            */}
            {e.studientyp ? (
              <Eckdatum label="Studientyp">{e.studientyp}</Eckdatum>
            ) : null}
            {e.material ? (
              <Eckdatum label={e.materialLabel || 'Zellen / Material'}>
                {e.material}
              </Eckdatum>
            ) : null}
            {e.geprueft ? (
              <Eckdatum label="Geprüftes Produkt">{e.geprueft}</Eckdatum>
            ) : null}
            <Eckdatum label="Autor">{e.autor}</Eckdatum>
            <Eckdatum label="Institut">{e.institut}</Eckdatum>
            {/*
              DOI: genannt IMMER, verlinkt nur wenn er auch aufloest.
              Setzt eine Studie `doiAufloesbar: false`, ist der DOI beim
              Resolver nicht registriert (bei der QiHome-Air-Arbeit belegt:
              doi.org antwortet 404, ein Kontroll-DOI im selben Lauf 302/200).
              Ihn trotzdem zu verlinken würde ausgerechnet auf der Beleg-Seite
              einen toten Beleg-Link erzeugen und damit den häufigsten Einwand
              ueberhaupt bedienen ("Wirkt das ueberhaupt?"). Ihn wegzulassen
              wäre die andere Haelfte des Fehlers: die Kennung gehört zur
              Zitierbarkeit. Ohne das Feld bleibt alles wie bisher.
            */}
            {e.doi ? (
              <Eckdatum
                label="DOI"
                klasse={e.doiAufloesbar === false ? 'qb-st-eckdatum--voll' : ''}
              >
                {e.doiAufloesbar === false ? (
                  <>
                    <span>{e.doi}</span>
                    {/*
                      NACHTRAG 2026-08-29 (Job 20260829-dach-studienseiten-doi-
                      ohne-offenlegung): Den Link wegzulassen war nur die HALBE
                      Heilung. Wer den DOI danach selbst nachschlägt, landet im
                      404 und muss die Quelle für erfunden halten — ausgerechnet
                      auf der Seite, die den Zweifel ausräumen soll. Ein nicht
                      auflösender DOI OHNE Hinweis ist schlechter als gar keiner.
                      Die US-Seiten legen das seit 2026-08-15 offen; DACH war auf
                      dieser Achse der schlechtere Stand. Wortlaut sinngemäß
                      von dort übernommen, nicht neu erfunden (P10).

                      WARUM DER WORTLAUT HIER STEHT UND NICHT JE JSON: das Feld
                      doiAufloesbar ist bereits die eine Wahrheit darüber, OB ein
                      DOI auflöst, und sie steht je Studie in den Daten. Den
                      Satz dreimal danebenzulegen hieße, dieselbe Aussage an
                      vier Orten zu pflegen — und eine sechste Studie könnte das
                      Flag setzen und den Text vergessen: eine stille Lücke
                      genau der Art, die dieser Job schließt. Aus den Daten
                      kommt deshalb nur, was je Studie WIRKLICH verschieden ist:
                      der DOI selbst und das Messdatum (`doiGeprueft`).
                    */}
                    {/*
                      EIN Template-Literal statt JSX-Fließtext, und das ist
                      kein Stilgeschmack: JSX macht aus jedem Zeilenumbruch ein
                      Leerzeichen. Als mehrzeiliger JSX-Text gesetzt, rendert
                      der Satz sichtbar falsch — „registriert (geprüft am
                      29. August 2026) : https://doi.org/ 10.31488/JJM.165“ mit
                      Leerzeichen vor dem Doppelpunkt und mitten in der URL
                      (lokal am 2026-08-29 so gemessen, bevor es hierher kam).
                      Ausgerechnet auf der Beleg-Seite sieht eine zerbrochene
                      URL nach Schlamperei aus.
                    */}
                    <p className="qb-st-doi-hinweis">
                      {`Der Verlag hat diesen DOI abgedruckt, aber er ist im DOI-System nicht registriert${
                        e.doiGeprueft
                          ? ` (geprüft am ${datum(e.doiGeprueft)})`
                          : ''
                      }: https://doi.org/${e.doi} antwortet mit HTTP 404 ohne Weiterleitung, ein Kontroll-DOI im selben Lauf mit 302. Wir nennen ihn deshalb, verlinken ihn aber nicht — die Publikation erreichen Sie über das PDF oben.`}
                    </p>
                  </>
                ) : (
                  <a href={`https://doi.org/${e.doi}`} rel="noopener">
                    {e.doi}
                  </a>
                )}
              </Eckdatum>
            ) : null}
            {e.issn ? <Eckdatum label="ISSN">{e.issn}</Eckdatum> : null}
            {e.lizenz ? <Eckdatum label="Lizenz">{e.lizenz}</Eckdatum> : null}
          </dl>
        </div>

        <nav className="qb-st-toc" aria-labelledby="toc-titel">
          <h2 id="toc-titel">Inhalt der Studie</h2>
          <ol>
            {studie.abschnitte.map((a) => (
              <li key={a.id}>
                <a href={`#${a.id}`}>{a.titel}</a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="qb-st-volltext">
          <p className="qb-st-hinweis">
            Nachfolgend die vollständige Publikation in getreuer deutscher
            Wiedergabe. Maßgeblich ist das englische Original, das über die
            Titelseite oben abrufbar ist.
          </p>

          {studie.abschnitte.map((a) => (
            <section key={a.id} id={a.id} className="qb-st-abschnitt">
              <h2>{a.titel}</h2>
              {/*
                KORREKTUR 2026-08-15 (Christian, Job 20260815-studienseiten-
                textfix): Die Abschnitts-Einordnung ("Einordnung der Redaktion")
                wurde hier ERSATZLOS ENTFERNT — der redaktionelle Zusatz gehört
                nicht in die Wiedergabe der Publikation.
                CHESTERTON-NOTIZ, damit niemand den Zaun blind wieder aufstellt:
                der Block stand hier bewusst, weil der Volltext eine GETREUE
                Wiedergabe ist (Glätten wäre Quellenfälschung) und das
                Inhaltsverzeichnis den Direktsprung mitten in den Text erlaubt.
                Das Feld `einordnung` bleibt in den JSON-Daten erhalten und ist
                unverändert — ein Rückbau ist damit ein reiner Render-Revert
                ohne Datenverlust.
              */}
              {(a.absaetze || []).map((p, i) => (
                <p key={i}>{p}</p>
              ))}

              {(a.listen || []).map((l, i) => (
                <div key={i} className="qb-st-liste">
                  {l.titel ? <h3>{l.titel}</h3> : null}
                  <ul>
                    {l.punkte.map((p, j) => (
                      <li key={j}>{p}</li>
                    ))}
                  </ul>
                </div>
              ))}

              {(a.tabellen || []).map((key) =>
                tabelleNach[key] ? (
                  <Tabelle key={key} tabelle={tabelleNach[key]} />
                ) : null,
              )}

              {(a.abbildungen || []).map((key) =>
                grafikNach[key] ? (
                  <Abbildung key={key} grafik={grafikNach[key]} />
                ) : null,
              )}
            </section>
          ))}

          {/* Tabellen/Abbildungen, die kein Abschnitt referenziert, gehen nicht
              verloren — sie hängen am Ende an, statt still zu verschwinden. */}
          {(studie.tabellen || [])
            .filter((t) => !referenziert(studie, 'tabellen', t.key))
            .map((t) => (
              <Tabelle key={t.key} tabelle={t} />
            ))}
          {(studie.grafiken || [])
            .filter((g) => !referenziert(studie, 'abbildungen', g.key))
            .map((g) => (
              <Abbildung key={g.key} grafik={g} />
            ))}
        </div>

        {/* Die Grenzen-Sektion aus `studie.grenzen` (vormals id="grenzen",
            Klasse qb-st-grenzen) wird bewusst NICHT mehr gerendert —
            Christian-Auftrag 20260815-studienseiten-funding-limitations-
            sektionen-entfernen: ersatzlos, KEINE Ersatz-Formulierung.
            Sie trug zugleich die Funding-/Unabhängigkeits-Offenlegung (Gerät
            vom Hersteller gestellt, keine unabhängige Replikation): auf DACH
            gab es dafür nie eine eigene Sektion, sie steckte in diesen Bullets
            — deshalb ist der US-Block `disclosure` hier mit abgedeckt.
            Das Datenfeld `grenzen` bleibt in app/data/studien/*.json erhalten
            (reiner Render-Rückbau, kein Datenverlust; Rückweg = diesen Block
            wiederherstellen). Alte Überschriften bewusst nicht zitiert: sie
            stünden sonst im Client-Bundle und machten die Proben falsch-rot. */}

        {studie.faq?.length ? (
          <section className="qb-st-faq" id="fragen">
            <h2>Häufige Fragen zu dieser Studie</h2>
            {studie.faq.map((f, i) => (
              <details key={i}>
                <summary>{f.frage}</summary>
                <p>{f.antwort}</p>
              </details>
            ))}
          </section>
        ) : null}

        <section className="qb-st-zitat" id="zitieren">
          <h2>So zitieren Sie diese Studie</h2>
          <p className="qb-st-zitat-text">{studie.zitation.text}</p>
          {studie.zitation.doiUrl ? (
            <p>
              <a href={studie.zitation.doiUrl} rel="noopener">
                {studie.zitation.doiUrl}
              </a>
            </p>
          ) : null}
          {/* Loest der DOI nicht auf, braucht die Seite trotzdem EINEN
              nachpruefbaren Weg zur Originalquelle — sonst ist die Zitation
              eine Behauptung. Fehlt das Feld, rendert nichts. */}
          {e.artikelUrl ? (
            <p>
              <a href={e.artikelUrl} target="_blank" rel="noopener noreferrer">
                Artikelseite beim Journal öffnen
              </a>
            </p>
          ) : null}
        </section>

        {verwandt.length ? (
          <section className="qb-st-verwandt">
            <h2>Passend dazu</h2>
            <div className="qb-st-verwandt-grid">
              {verwandt.map((v) => (
                <Link key={v.id} to={studienPfad(v.slug)} className="qb-st-verwandt-karte">
                  <span className="qb-st-verwandt-kicker">{v.eckdaten.produkt}</span>
                  <strong>{v.seo.h1}</strong>
                  <span className="qb-st-verwandt-text">
                    {v.laienSummary?.frage || ''}
                  </span>
                </Link>
              ))}
              <Link to={UEBERSICHT_PFAD} className="qb-st-verwandt-karte qb-st-verwandt-alle">
                <span className="qb-st-verwandt-kicker">Übersicht</span>
                <strong>Alle Studien und die HRV-Messreihe</strong>
                <span className="qb-st-verwandt-text">
                  {zahlwort(STUDIEN.length)} Publikationen auf einen Blick
                </span>
              </Link>
            </div>
          </section>
        ) : null}
      </article>
    </div>
  );
}

function referenziert(studie, feld, key) {
  return studie.abschnitte.some((a) => (a[feld] || []).includes(key));
}

// `klasse` ist optional und additiv: ohne sie rendert das Eckdatum exakt wie
// bisher. Gebraucht wird sie bisher nur von der DOI-Offenlegung, die als
// Fließtext über die volle Rasterbreite laufen muss — in einer 220-px-Spalte
// wäre der Satz eine schmale Säule neben lauter Einzeilern.
function Eckdatum({label, children, klasse}) {
  return (
    <div className={klasse ? `qb-st-eckdatum ${klasse}` : 'qb-st-eckdatum'}>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function Abbildung({grafik}) {
  if (!grafik.url) return null;
  // Anzeigebreite auf die native Aufloesung deckeln: bei 2x Pixeldichte erlaubt
  // eine 660-px-Quelle hoechstens 330 px CSS-Breite, sonst skaliert der Browser
  // sichtbar hoch (hb-formate: bild-aufloesung kaputt). width/height nehmen
  // zusaetzlich den Layoutsprung beim Nachladen heraus.
  const stil = grafik.breite
    ? {maxWidth: `min(100%, ${Math.round(grafik.breite / 2)}px)`}
    : undefined;
  return (
    <figure className="qb-st-abb">
      <img
        src={grafik.url}
        alt={grafik.alt}
        width={grafik.breite || undefined}
        height={grafik.hoehe || undefined}
        style={stil}
        loading="lazy"
      />
      <figcaption>
        <strong>{grafik.nummer}:</strong> {grafik.bildunterschrift}
      </figcaption>
    </figure>
  );
}

function Tabelle({tabelle}) {
  return (
    <figure className="qb-st-tab">
      {tabelle.titel ? <figcaption>{tabelle.titel}</figcaption> : null}
      <div className="qb-st-tab-scroll">
        <table>
          <thead>
            <tr>
              {tabelle.kopf.map((k, i) => (
                <th key={i} scope="col">
                  {k}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tabelle.zeilen.map((z, i) => (
              <tr key={i}>
                {z.map((c, j) =>
                  j === 0 ? (
                    <th key={j} scope="row">
                      {c}
                    </th>
                  ) : (
                    <td key={j}>{c}</td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {tabelle.fussnote ? (
        <p className="qb-st-tab-fuss">{tabelle.fussnote}</p>
      ) : null}
    </figure>
  );
}

function datum(iso) {
  const [j, m, t] = String(iso).split('-');
  if (!j) return iso;
  if (!m) return j;
  const monate = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
  ];
  const mn = monate[Number(m) - 1] || m;
  return t ? `${Number(t)}. ${mn} ${j}` : `${mn} ${j}`;
}
