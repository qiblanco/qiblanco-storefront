import {Link} from 'react-router';

/**
 * MmKit — geteilte Sektions-Bausteine der neuen Message-Match- & Trust-Ketten-
 * Landingpages (Job 20260723-neue-landingpages-message-match-trust-kette-welle-abc).
 *
 * WARUM EIN File: Diese LP-Familie teilt EIN nüchtern-evidenzbasiertes
 * Design-System (styles/mm-lp.css, scope .mm-lp). Die Sektionen sind reine
 * Präsentation (props rein, JSX raus) — jede Seite (composer in
 * components/campaign/Mm*.jsx) wählt Reihenfolge + Inhalt.
 *
 * PFLICHT-INVARIANTEN:
 *  - KEIN Pixel-/Tracking-Code hier (R1/R2/R3 hängen global im root-Layout;
 *    ein Pixel hier = Doppelzählung, Attributions-Bruch — homepage-bauer D-006).
 *  - KEIN Countdown/Timer-JS (der bekannte paid-Landing-JS-Crash). Interaktion
 *    ausschließlich nativ (<details> im FAQ) = null Laufzeit-Risiko.
 *  - SSR-safe: keine id-Kollisionen, kein window-Zugriff im Render (Hydrogen
 *    streamt serverseitig).
 */

/* ------------------------------------------------------------------ Helpers */

export function mmPreis(amount, currency = 'EUR') {
  const n = Number(amount);
  if (!Number.isFinite(n)) return null;
  try {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${Math.round(n)} ${currency}`;
  }
}

export function mmFinde(products, handle) {
  return (products || []).find((p) => p && p.handle === handle) || null;
}

/* ------------------------------------------------------------------- Icons */
/*
 * Strich-Icon-Set (24er-Raster, 1.5er Strich, currentColor) — ersetzt die
 * Unicode-Glyphen der Trust-Badges (Rendering war font-abhängig und wirkte
 * grob). Die Composer-API bleibt unverändert: `mark` trägt weiter dieselben
 * Zeichen, MmIcon mappt sie auf gezeichnete Icons (unbekannt -> stiller Punkt).
 */
const MM_ICON_PATHS = {
  '✦': ['M12 4l1.8 6.2L20 12l-6.2 1.8L12 20l-1.8-6.2L4 12l6.2-1.8z'],
  '⚑': ['M6 21V4', 'M6 5h11l-2.5 3.5L17 12H6'],
  '▤': ['M4.5 5.5h15v13h-15z', 'M4.5 10.5h15', 'M4.5 15h15'],
  '↺': ['M5 8.5A8 8 0 1 1 4.5 13', 'M5 4.5v4h4'],
  '★': ['M12 4.5l2.2 4.9 5.3.5-4 3.6 1.2 5.2-4.7-2.8-4.7 2.8 1.2-5.2-4-3.6 5.3-.5z'],
  '∞': ['M8.5 8.5a3.5 3.5 0 1 0 0 7c3 0 4-7 7-7a3.5 3.5 0 1 1 0 7c-3 0-4-7-7-7z'],
  '⚙': [
    'M12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z',
    'M12 4.5V7M12 17v2.5M4.5 12H7M17 12h2.5M6.7 6.7l1.8 1.8M15.5 15.5l1.8 1.8M17.3 6.7l-1.8 1.8M8.5 15.5l-1.8 1.8',
  ],
  '♨': [
    'M8 5c-1.3 1.7-1.3 3.3 0 5s1.3 3.3 0 5',
    'M12 5c-1.3 1.7-1.3 3.3 0 5s1.3 3.3 0 5',
    'M16 5c-1.3 1.7-1.3 3.3 0 5s1.3 3.3 0 5',
  ],
  '◇': ['M12 4.5L19.5 12 12 19.5 4.5 12z'],
  '◈': ['M12 4.5L19.5 12 12 19.5 4.5 12z', 'M12 10.5l1.5 1.5-1.5 1.5-1.5-1.5z'],
  '∅': ['M12 5a7 7 0 1 1 0 14 7 7 0 0 1 0-14z', 'M7.5 16.5l9-9'],
  '✎': ['M5 19l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L9 18l-4 1z', 'M14.5 6.5l3 3'],
  '⇩': ['M12 4.5V15', 'M7.5 10.5L12 15l4.5-4.5', 'M5 19.5h14'],
  '✓': ['M4.5 12.5l5 5L19.5 7'],
};

export function MmIcon({zeichen}) {
  const pfade = MM_ICON_PATHS[zeichen] || ['M12 10.5l1.5 1.5-1.5 1.5-1.5-1.5z'];
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {pfade.map((d, i) => (
        <path d={d} key={i} />
      ))}
    </svg>
  );
}

/* -------------------------------------------------------------- Page-Rahmen */

export function MmPage({scope, children}) {
  return <main className={`mm-lp ${scope || ''}`.trim()}>{children}</main>;
}

export function MmBahn({variante, schmal, children, id}) {
  const cls = ['mm-bahn'];
  if (schmal) cls.push('mm-bahn--schmal');
  if (variante === 'flaeche') cls.push('mm-bahn--flaeche');
  if (variante === 'dunkel') cls.push('mm-bahn--dunkel');
  return (
    <section className={cls.join(' ')} id={id}>
      {children}
    </section>
  );
}

/* --------------------------------------------------------------------- Hero */

export function MmHero({eyebrow, headline, sub, bullets, cta, ctaSekundaer, media, dataSection}) {
  return (
    <section className="mm-hero" data-section={dataSection}>
      <div className="mm-bahn">
        <div className="mm-hero__grid">
          <div>
            {eyebrow ? <span className="mm-eyebrow">{eyebrow}</span> : null}
            <h1>{headline}</h1>
            {sub ? <p className="mm-hero__sub">{sub}</p> : null}
            {bullets && bullets.length ? (
              <ul className="mm-hero__bullets">
                {bullets.map((b, i) => (
                  <li key={i}>
                    <span className="mm-haken" aria-hidden="true"><MmIcon zeichen={'✓'} /></span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="mm-hero__actions">
              {cta ? (
                <Link className="mm-cta" to={cta.href} prefetch="intent">
                  {cta.label}
                </Link>
              ) : null}
              {ctaSekundaer ? (
                <Link className="mm-cta mm-cta--sekundaer" to={ctaSekundaer.href} prefetch="intent">
                  {ctaSekundaer.label}
                </Link>
              ) : null}
            </div>
          </div>
          {media ? (
            <figure className="mm-hero__media">
              <img src={media.src} alt={media.alt || ''} loading="eager" width="720" height="540" />
              {media.hint ? <figcaption className="mm-hero__mediahint">{media.hint}</figcaption> : null}
            </figure>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Problem */

export function MmProblem({eyebrow, title, text, punkte, variante, dataSection}) {
  return (
    <MmBahn variante={variante}>
      <div className="mm-problem" data-section={dataSection}>
        {eyebrow ? <span className="mm-eyebrow">{eyebrow}</span> : null}
        <h2>{title}</h2>
        {Array.isArray(text) ? (
          text.map((t, i) => (
            <p key={i} className="mm-problem__text">
              {t}
            </p>
          ))
        ) : (
          <p className="mm-problem__text">{text}</p>
        )}
        {punkte && punkte.length ? (
          <ul className="mm-problem__punkte">
            {punkte.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </MmBahn>
  );
}

/* -------------------------------------------------------------- Mechanismus */

export function MmMechanism({eyebrow, title, intro, schritte, note, kinder, variante, dataSection}) {
  return (
    <MmBahn variante={variante}>
      <div className="mm-mech" data-section={dataSection}>
        {eyebrow ? <span className="mm-eyebrow">{eyebrow}</span> : null}
        <h2>{title}</h2>
        {intro ? <p className="mm-mech__intro">{intro}</p> : null}
        {schritte && schritte.length ? (
          <div className="mm-mech__schritte">
            {schritte.map((s, i) => (
              <div className="mm-mech__schritt" key={i}>
                <h3>{s.titel}</h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        ) : null}
        {kinder}
        {note ? <p className="mm-mech__note">{note}</p> : null}
      </div>
    </MmBahn>
  );
}

/* -------------------------------------------------- Inline-SVG-Diagramme */

/*
 * Beide Diagramme: SVG rein grafisch (Strich-Präzision, Farben über CSS-
 * Klassen aus den Tokens), Beschriftung als HTML daneben — kein SVG-<text>
 * (skaliert auf Mobile unter 12px und rendert unscharf).
 */

const MM_DIA_FREI = [
  [30, 40], [62, 26], [96, 50], [140, 30], [168, 56],
  [38, 84], [76, 72], [116, 92], [156, 86],
  [58, 112], [100, 116], [142, 114],
];
const MM_DIA_REIHEN = [
  {y: 32, xs: [40, 80, 120, 160]},
  {y: 66, xs: [60, 100, 140]},
  {y: 100, xs: [40, 80, 120, 160]},
];

function mmGitterKanten() {
  const kanten = [];
  MM_DIA_REIHEN.forEach((reihe, ri) => {
    reihe.xs.forEach((x, xi) => {
      if (xi + 1 < reihe.xs.length) kanten.push([x, reihe.y, reihe.xs[xi + 1], reihe.y]);
      const folge = MM_DIA_REIHEN[ri + 1];
      if (folge) {
        folge.xs.forEach((nx) => {
          if (Math.abs(nx - x) === 20) kanten.push([x, reihe.y, nx, folge.y]);
        });
      }
    });
  });
  return kanten;
}

export function MmDiagramWasser({caption}) {
  return (
    <figure className="mm-diagramm">
      <div className="mm-diagramm__panels" role="img" aria-label="Von ungeordneten zu geordneten Wassermolekülen">
        <div className="mm-diagramm__panel">
          <svg viewBox="0 0 200 132" aria-hidden="true">
            {MM_DIA_FREI.map(([x, y], i) => (
              <circle key={`f${i}`} cx={x} cy={y} r="5" className="mm-dia-frei" />
            ))}
          </svg>
          <span className="mm-diagramm__label">Ungeordnet</span>
        </div>
        <div className="mm-diagramm__panel mm-diagramm__panel--gold">
          <svg viewBox="0 0 200 132" aria-hidden="true">
            {mmGitterKanten().map(([x1, y1, x2, y2], i) => (
              <line key={`k${i}`} x1={x1} y1={y1} x2={x2} y2={y2} className="mm-dia-gitter" />
            ))}
            {MM_DIA_REIHEN.map((reihe, ri) =>
              reihe.xs.map((x) => (
                <circle key={`g${ri}-${x}`} cx={x} cy={reihe.y} r="4.5" className="mm-dia-dot" />
              )),
            )}
          </svg>
          <span className="mm-diagramm__label mm-diagramm__label--gold">Geordnet / kohärent</span>
        </div>
        <span className="mm-diagramm__wechsel" aria-hidden="true">
          <svg viewBox="0 0 16 16">
            <path d="M2.5 8h10M9 4.5L12.5 8 9 11.5" className="mm-dia-pfeil" />
          </svg>
        </span>
      </div>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}

export function MmDiagramChip({caption}) {
  return (
    <figure className="mm-diagramm">
      <div className="mm-diagramm__einzel" role="img" aria-label="Aufbau des Gitterchips im Querschnitt">
        <svg viewBox="0 0 320 168" aria-hidden="true">
          <rect x="40" y="28" width="240" height="104" rx="8" className="mm-dia-flaeche" />
          <rect x="40" y="28" width="240" height="104" rx="8" className="mm-dia-kontur" />
          <rect x="54" y="42" width="212" height="76" rx="4" className="mm-dia-ring" />
          {Array.from({length: 4}).map((_, r) => (
            <line key={`h${r}`} x1="66" y1={54 + r * 17.33} x2="254" y2={54 + r * 17.33} className="mm-dia-gitter" />
          ))}
          {Array.from({length: 8}).map((_, c) => (
            <line key={`v${c}`} x1={66 + c * 26.85} y1="54" x2={66 + c * 26.85} y2="106" className="mm-dia-gitter" />
          ))}
          {Array.from({length: 4}).map((_, r) =>
            Array.from({length: 8}).map((__, c) => (
              <circle key={`c${r}-${c}`} cx={66 + c * 26.85} cy={54 + r * 17.33} r="3" className="mm-dia-dot" />
            )),
          )}
          <path d="M40 146v8M280 146v8M40 150h240" className="mm-dia-mass" />
        </svg>
        <span className="mm-diagramm__label">750er-Gold-Gitter im Chirurgenstahl-Körper</span>
      </div>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}

/* ----------------------------------------------------------------- Stat-Band */

export function MmStatBand({stats, variante, dataSection}) {
  return (
    <MmBahn variante={variante || 'flaeche'}>
      <div className="mm-statband" data-section={dataSection}>
        {(stats || []).map((s, i) => (
          <div className="mm-stat" key={i}>
            <div className="mm-stat__zahl">{s.zahl}</div>
            <div className="mm-stat__label">{s.label}</div>
          </div>
        ))}
      </div>
    </MmBahn>
  );
}

/* ------------------------------------------------------------------ Evidenz */

export function MmEvidenz({eyebrow, title, intro, studien, mehrHref, mehrLabel, variante, dataSection}) {
  return (
    <MmBahn variante={variante}>
      <div className="mm-evidenz" data-section={dataSection}>
        {eyebrow ? <span className="mm-eyebrow">{eyebrow}</span> : null}
        <h2>{title}</h2>
        {intro ? <p className="mm-evidenz__intro">{intro}</p> : null}
        <div className="mm-evidenz__grid">
          {(studien || []).map((s, i) => (
            <article className="mm-karte" key={i}>
              <span className="mm-karte__tag">{s.tag}</span>
              <h3>{s.titel}</h3>
              <p className="mm-karte__meta">{s.meta}</p>
              <p className="mm-karte__body">{s.body}</p>
              {s.href ? (
                <a href={s.href} target="_blank" rel="noreferrer">
                  {s.linkText || 'Publikation ansehen (PDF)'} &rarr;
                </a>
              ) : null}
            </article>
          ))}
        </div>
        {mehrHref ? (
          <div className="mm-evidenz__mehr">
            <Link className="mm-cta mm-cta--sekundaer" to={mehrHref} prefetch="intent">
              {mehrLabel || 'Alle Studien im Detail'}
            </Link>
          </div>
        ) : null}
      </div>
    </MmBahn>
  );
}

/* ------------------------------------------------------- Publikations-Belege */

/*
 * MmBelege — die Titelseiten der Publikationen als Beleg-Reihe, jede verlinkt
 * auf ihr PDF. Bewusst KEIN Diagramm: für einen Skeptiker ist die reale,
 * nachprüfbare Publikation der stärkere Beleg (Kanon ew-05 „erreichbarer
 * Beleg-Ort" — billig zu erfüllen, teuer zu ignorieren). Ein Cover ohne
 * Klickziel wäre Dekoration, deshalb ist `href` die tragende Eigenschaft.
 *
 * Die Cover haben UNTERSCHIEDLICHE Seitenverhältnisse (957x1024 bis
 * 2480x3508 bis 1080x1080). Deshalb feste Bahn + object-fit: contain statt
 * Zuschnitt: ein Zuschnitt würde bei einem Deckblatt den Titel abschneiden.
 */
export function MmBelege({eyebrow, title, intro, belege, note, variante, dataSection}) {
  return (
    <MmBahn variante={variante}>
      <div className="mm-belege" data-section={dataSection}>
        {eyebrow ? <span className="mm-eyebrow">{eyebrow}</span> : null}
        <h2>{title}</h2>
        {intro ? <p className="mm-evidenz__intro">{intro}</p> : null}
        <div className="mm-belege__grid">
          {(belege || []).map((b, i) => (
            <a className="mm-beleg" key={i} href={b.href} target="_blank" rel="noreferrer">
              <span className="mm-beleg__bild">
                <img src={b.bild} alt={b.alt || ''} loading="lazy" width="480" height="640" />
              </span>
              <span className="mm-beleg__t">{b.titel}</span>
              <span className="mm-beleg__s">{b.meta}</span>
              <span className="mm-beleg__pfeil">{b.linkText || 'PDF ansehen'} &rarr;</span>
            </a>
          ))}
        </div>
        {note ? <p className="mm-mech__note">{note}</p> : null}
      </div>
    </MmBahn>
  );
}

/* ------------------------------------------------------------------ Berichte */

export function MmReports({eyebrow, title, text, balken, note, variante, dataSection}) {
  return (
    <MmBahn variante={variante || 'flaeche'}>
      <div data-section={dataSection}>
        {eyebrow ? <span className="mm-eyebrow">{eyebrow}</span> : null}
        <div className="mm-reports">
          <div>
            <h2>{title}</h2>
            <p className="mm-problem__text">{text}</p>
            {note ? <p className="mm-mech__note">{note}</p> : null}
          </div>
          <div className="mm-reports__balken">
            {(balken || []).map((b, i) => (
              <div key={i}>
                <div className="mm-balken__label">
                  <span>{b.label}</span>
                  <strong>{b.wert}</strong>
                </div>
                <div className="mm-balken__spur">
                  <div className="mm-balken__fuell" style={{width: b.prozent}} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MmBahn>
  );
}

/* --------------------------------------------------------------- Trust-Reihe */

export function MmTrust({eyebrow, title, badges, variante, dataSection}) {
  const kuratiert = (badges || []).slice(0, 6); // MM-Regel: <=6 kuratierte Signale (+CVR)
  return (
    <MmBahn variante={variante}>
      <div data-section={dataSection}>
        {eyebrow ? <span className="mm-eyebrow">{eyebrow}</span> : null}
        {title ? <h2>{title}</h2> : null}
        <div className="mm-trust">
          {kuratiert.map((b, i) => (
            <div className="mm-badge" key={i}>
              <span className="mm-badge__mark" aria-hidden="true"><MmIcon zeichen={b.mark} /></span>
              <span>
                <span className="mm-badge__t">{b.titel}</span>
                <br />
                <span className="mm-badge__s">{b.sub}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </MmBahn>
  );
}

/* --------------------------------------------------------------- Risiko-Umkehr */

export function MmRisk({ring, title, text, punkte, variante, dataSection}) {
  return (
    <MmBahn variante={variante} schmal>
      <div className="mm-risk" data-section={dataSection}>
        <div className="mm-risk__ring">{ring || '20'}</div>
        <h2>{title}</h2>
        <p className="mm-risk__text">{text}</p>
        {punkte && punkte.length ? (
          <ul className="mm-risk__punkte">
            {punkte.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </MmBahn>
  );
}

/* ----------------------------------------------------------------------- FAQ */

export function MmFaq({title, items, variante, dataSection}) {
  return (
    <MmBahn variante={variante} schmal>
      <div className="mm-faq" data-section={dataSection}>
        <h2>{title || 'Häufige Fragen'}</h2>
        <div className="mm-faq__liste">
          {(items || []).map((it, i) => (
            <details key={i}>
              <summary>{it.frage}</summary>
              <div className="mm-faq__a">{it.antwort}</div>
            </details>
          ))}
        </div>
      </div>
    </MmBahn>
  );
}

/* ------------------------------------------------------------ Funnel-Navigation */

export function MmFunnel({title, links, variante, dataSection}) {
  return (
    <MmBahn variante={variante || 'flaeche'}>
      <div className="mm-funnel" data-section={dataSection}>
        <h2>{title || 'Weiterlesen — die ganze Kette'}</h2>
        <div className="mm-funnel__grid">
          {(links || []).map((l, i) => (
            <Link className="mm-funnel__karte" to={l.href} key={i} prefetch="intent">
              <h3>{l.titel}</h3>
              <p>{l.text}</p>
              <span className="mm-funnel__pfeil">{l.cta || 'Ansehen'} &rarr;</span>
            </Link>
          ))}
        </div>
      </div>
    </MmBahn>
  );
}

/* ------------------------------------------------------------- Produkt-Auswahl */

export function MmPick({title, products, handles, variante, dataSection}) {
  const liste = (handles || []).map((h) => mmFinde(products, h.handle) || null);
  return (
    <MmBahn variante={variante}>
      <div className="mm-pick" data-section={dataSection}>
        <h2>{title || 'Deine Auswahl'}</h2>
        <div className="mm-pick__grid">
          {(handles || []).map((h, i) => {
            const p = liste[i];
            const preis = p ? mmPreis(p.priceRange?.minVariantPrice?.amount, p.priceRange?.minVariantPrice?.currencyCode) : null;
            const streich = p ? mmPreis(p.variants?.nodes?.[0]?.compareAtPrice?.amount, p.variants?.nodes?.[0]?.compareAtPrice?.currencyCode) : null;
            const bild = p?.featuredImage?.url || p?.images?.[0]?.url || h.fallbackImg;
            return (
              <article className="mm-produkt" key={h.handle}>
                <div className="mm-produkt__bild">
                  {bild ? <img src={bild} alt={p?.title || h.name} loading="lazy" /> : null}
                </div>
                <div className="mm-produkt__body">
                  <span className="mm-produkt__name">{p?.title || h.name}</span>
                  {h.note ? <span className="mm-badge__s">{h.note}</span> : null}
                  <span className="mm-produkt__preis">
                    {preis || h.fallbackPreis || ''}
                    {streich ? <span className="mm-produkt__streich" style={{marginLeft: '8px'}}>{streich}</span> : null}
                  </span>
                  {/* Kauf-CTA -> /pages-Kaufseite (Christian 2026-07-24, Stufe 3;
                      Default-Variante vorselektiert wie /pages/qihome-air-Beispiel) */}
                  <Link className="mm-cta" to={`/pages/${h.handle}?Title=Default+Title`} prefetch="intent">
                    {h.cta || 'Ansehen'}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </MmBahn>
  );
}

/* ------------------------------------------------------------------ Schluss-CTA */

export function MmFinal({title, text, cta, ctaSekundaer, dataSection}) {
  return (
    <MmBahn variante="dunkel" schmal>
      <div className="mm-final" data-section={dataSection}>
        <h2>{title}</h2>
        {text ? <p>{text}</p> : null}
        <div className="mm-hero__actions" style={{justifyContent: 'center'}}>
          {cta ? (
            <Link className="mm-cta" to={cta.href} prefetch="intent">
              {cta.label}
            </Link>
          ) : null}
          {ctaSekundaer ? (
            <Link className="mm-cta mm-cta--sekundaer" to={ctaSekundaer.href} prefetch="intent">
              {ctaSekundaer.label}
            </Link>
          ) : null}
        </div>
      </div>
    </MmBahn>
  );
}

/* -------------------------------------------------------- Ehrliche Grenzen */

export function MmGrenzen({children, dataSection}) {
  return (
    <MmBahn schmal>
      <p className="mm-grenzen" data-section={dataSection}>
        {children}
      </p>
    </MmBahn>
  );
}
