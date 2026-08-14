/**
 * Renderer EINER Studien-Einzelseite. Vier Routen teilen ihn sich — der
 * Unterschied zwischen den Seiten ist ausschließlich das Daten-JSON.
 *
 * AUFBAU (von oben nach unten, so beauftragt):
 *   1. Kopf: H1, Journal/Autor/Datum sichtbar (E-E-A-T), Original-PDF
 *   2. Antwort in Normalsprache — der Featured-Snippet-Kandidat, ganz oben
 *   3. Ehrliche Einordnung direkt darunter (nicht im Kleingedruckten)
 *   4. Inhaltsverzeichnis mit Sprungmarken
 *   5. Der deutsche Volltext mit Abbildungen und Tabellen
 *   6. Grenzen, FAQ, Zitation, verwandte Studien, Produktbezug
 *
 * WARUM DIE LAIEN-EBENE VOR DEM VOLLTEXT STEHT: der Kaufueberzeugungs-Kanon
 * misst, dass wissenschaftlicher Beweis kein Hook ist, sondern ein Closer —
 * er wirkt beim Zweifel. Wer hier landet, zweifelt bereits und sucht eine
 * Antwort, keine Methodik. Die Methodik muss trotzdem vollständig da sein,
 * denn sie ist der Grund, warum die Antwort trägt.
 */

import {Link} from 'react-router';
import {UEBERSICHT_PFAD, studienPfad, verwandteStudien} from '~/data/studien';

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

          <dl className="qb-st-eckdaten">
            <Eckdatum label="Autor">{e.autor}</Eckdatum>
            <Eckdatum label="Institut">{e.institut}</Eckdatum>
            <Eckdatum label="Journal">
              {e.journal}
              {e.band ? `, ${e.band}` : ''}
            </Eckdatum>
            {e.veroeffentlicht ? (
              <Eckdatum label="Veröffentlicht">
                <time dateTime={e.veroeffentlicht}>{datum(e.veroeffentlicht)}</time>
              </Eckdatum>
            ) : null}
            {e.doi ? (
              <Eckdatum label="DOI">
                <a href={`https://doi.org/${e.doi}`} rel="noopener">
                  {e.doi}
                </a>
              </Eckdatum>
            ) : null}
            {e.issn ? <Eckdatum label="ISSN">{e.issn}</Eckdatum> : null}
            {e.lizenz ? <Eckdatum label="Lizenz">{e.lizenz}</Eckdatum> : null}
          </dl>
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
          {laie.einordnung ? (
            <p className="qb-st-einordnung">
              <strong>Ehrlich eingeordnet:</strong> {laie.einordnung}
            </p>
          ) : null}
        </section>

        <div className="qb-st-pdf-zeile">
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

        {studie.grenzen?.length ? (
          <section className="qb-st-grenzen" id="grenzen">
            <h2>Was diese Studie nicht zeigt</h2>
            <ul>
              {studie.grenzen.map((g, i) => (
                <li key={i}>{g}</li>
              ))}
            </ul>
          </section>
        ) : null}

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
                  Vier Publikationen auf einen Blick
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

function Eckdatum({label, children}) {
  return (
    <div className="qb-st-eckdatum">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function Abbildung({grafik}) {
  if (!grafik.url) return null;
  // Anzeigebreite auf die native Aufloesung deckeln: bei 2x Pixeldichte traegt
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
