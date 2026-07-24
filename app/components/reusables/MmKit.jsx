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
                    <span className="mm-haken" aria-hidden="true">&#10003;</span>
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
            <p key={i} className="mm-problem__text" style={i ? {marginTop: '16px'} : undefined}>
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

export function MmDiagramWasser({caption}) {
  return (
    <figure className="mm-diagramm">
      <svg viewBox="0 0 520 200" role="img" aria-label="Von ungeordneten zu geordneten Wassermolekülen">
        <rect x="0" y="0" width="520" height="200" fill="none" />
        <text x="90" y="24" textAnchor="middle" fontSize="13" fill="#5c574d">ungeordnet</text>
        <text x="430" y="24" textAnchor="middle" fontSize="13" fill="#8a6a24">geordnet / kohärent</text>
        {/* linke Wolke: zufällige Punkte */}
        {[[40,70],[70,110],[110,60],[130,120],[60,150],[100,150],[150,95],[45,110],[95,95],[135,75]].map(([x,y],i)=>(
          <circle key={`l${i}`} cx={x} cy={y} r="6" fill="#cdbf9f" opacity="0.8" />
        ))}
        {/* Pfeil */}
        <line x1="200" y1="110" x2="300" y2="110" stroke="#a9822f" strokeWidth="2" />
        <polygon points="300,110 290,104 290,116" fill="#a9822f" />
        <text x="250" y="98" textAnchor="middle" fontSize="11" fill="#a9822f">Gitterchip</text>
        {/* rechtes Gitter: geordnete Punkte */}
        {Array.from({length: 3}).map((_, r) =>
          Array.from({length: 4}).map((__, c) => (
            <circle key={`g${r}-${c}`} cx={360 + c * 34} cy={70 + r * 34} r="6" fill="#a9822f" opacity="0.9" />
          )),
        )}
      </svg>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}

export function MmDiagramChip({caption}) {
  return (
    <figure className="mm-diagramm">
      <svg viewBox="0 0 360 200" role="img" aria-label="Aufbau des Gitterchips im Querschnitt">
        <rect x="60" y="50" width="240" height="100" rx="10" fill="#f3efe8" stroke="#e2dbcf" />
        <rect x="60" y="50" width="240" height="100" rx="10" fill="none" stroke="#a9822f" strokeWidth="1.5" />
        {/* Gitterstruktur */}
        {Array.from({length: 4}).map((_, r) =>
          Array.from({length: 9}).map((__, c) => (
            <circle key={`c${r}-${c}`} cx={80 + c * 25} cy={70 + r * 22} r="4" fill="#a9822f" opacity="0.85" />
          )),
        )}
        <text x="180" y="180" textAnchor="middle" fontSize="12" fill="#5c574d">
          750er Gold-Gitter im Chirurgenstahl-Körper
        </text>
      </svg>
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
          <p style={{marginTop: '32px'}}>
            <Link className="mm-cta mm-cta--sekundaer" to={mehrHref} prefetch="intent">
              {mehrLabel || 'Alle Studien im Detail'}
            </Link>
          </p>
        ) : null}
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
            <h2 style={{fontSize: 'var(--mm-fs-h2)', marginBottom: 'var(--mm-s3)'}}>{title}</h2>
            <p className="mm-problem__text">{text}</p>
            {note ? <p className="mm-mech__note" style={{marginTop: 'var(--mm-s4)'}}>{note}</p> : null}
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
        {title ? <h2 style={{fontSize: 'var(--mm-fs-xl)', marginBottom: 'var(--mm-s4)'}}>{title}</h2> : null}
        <div className="mm-trust">
          {kuratiert.map((b, i) => (
            <div className="mm-badge" key={i}>
              <span className="mm-badge__mark" aria-hidden="true">{b.mark}</span>
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
                  <Link className="mm-cta" to={`/products/${h.handle}`} prefetch="intent">
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
            <Link className="mm-cta mm-cta--sekundaer" to={ctaSekundaer.href} prefetch="intent" style={{color: 'var(--mm-text-hell)', borderColor: 'rgba(244,240,233,0.3)'}}>
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
