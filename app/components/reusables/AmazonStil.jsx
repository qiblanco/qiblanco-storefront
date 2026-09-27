import {CdnBild} from './CdnBild';
import {FaqListe} from './FaqListe';
import {produktLink, BLOCK_PUBLIC} from './blockLinks';
import {faqPageJsonLdString} from '~/lib/faq-schema';
import {useMarktLand} from '~/lib/markt-land';
import {KUNDENFRAGEN, VERGLEICH, vergleichSpalten} from './amazonstil-daten';

/*
 * AMAZON-STIL STUFE 2 — Gerätevergleich und Kundenfragen weit oben auf den
 * drei Geräte-Kaufseiten (/products/qione-2-pro, /products/qibracelet,
 * /products/qihome-air). Grossjob growth-m-lp-produktseite-verkauft, s04,
 * 27.09.2026. Warum weit oben: 73,5 % der Nichtkäufer kommen nicht über 25 %
 * Scrolltiefe (Messung 26.09.), und "Vergleich" ist eines der drei Themen,
 * die Kunden im Verkaufs-Chat am häufigsten in eigenen Worten fragen.
 *
 * Texte, Schalter und Auswahlregel: ./amazonstil-daten.js. Diese Datei
 * setzt nur zusammen.
 *
 * NUR DIE /products/-SEITEN: die /pages/-Kaufseiten derselben Geräte sind die
 * Kontrollgruppe der Wirkungsmessung (Hypothese hce22957c, reif 25.10.) und
 * tragen keinen dieser Blöcke.
 *
 * MESSANKER (Vertrag der Abnahme-Probe probe_amazonstil_s04.py, nicht
 * umbenennen): data-qb-geraetevergleich, data-qb-vergleich-produkt,
 * data-qb-vergleich-preis, data-qb-kundenfragen, data-qb-kundenfrage.
 * data-textplatz ist der Anker der Textmappe für Christians Wortlaut.
 * BEWUSST KEIN data-section: diese Kaufseiten sind anker-frei, ein erster
 * Anker würde den Sektions-Kollektor der Design-Rubrik auf eine Sektion
 * einengen (Kommentar in routes/products.qione-2-pro.jsx).
 */

/**
 * Vergleich der drei Geräte. `preise` kommt aus dem Loader
 * (ladeVergleichsPreise), `eigenerPreis` ist der Preis der Kaufbox dieser
 * Seite. Aus (Schalter) oder ohne Spalten: nichts.
 *
 * @param {{handle: string, preise?: object|null, eigenerPreis?: object|null}} props
 */
export function Geraetevergleich({handle, preise = null, eigenerPreis = null}) {
  const land = useMarktLand();
  const spalten = vergleichSpalten(handle, {preise: preise || {}, eigenerPreis, land});
  if (spalten.length < 2) return null;
  const mitRaten = spalten.some((s) => s.raten);
  const z = VERGLEICH.zeilen;
  const titelId = `qb-gv-titel-${handle}`;

  return (
    <section
      className="qb-gv NormalSectionSize"
      data-qb-geraetevergleich=""
      data-textplatz={`${handle}.geraetevergleich`}
      aria-labelledby={titelId}
    >
      <h2 id={titelId} className="qb-gv__titel">
        {VERGLEICH.titel}
      </h2>
      <div className={`qb-gv__raster${mitRaten ? ' qb-gv__raster--raten' : ''}`}>
        {spalten.map((s) => {
          const ziel = produktLink(s.handle, BLOCK_PUBLIC, 'kauf');
          const nameId = `qb-gv-name-${handle}-${s.handle}`;
          const bild = (
            <CdnBild
              src={s.bild}
              alt=""
              anzeigeBreite={120}
              breite={120}
              hoehe={120}
              sizes="120px"
              loading="lazy"
              className="qb-gv__bild"
            />
          );
          return (
            <article
              key={s.handle}
              className={`qb-gv__geraet${s.eigenes ? ' qb-gv__geraet--eigenes' : ''}`}
              data-qb-vergleich-produkt={s.handle}
              aria-labelledby={nameId}
            >
              <h3 id={nameId} className="qb-gv__kopf">
                {s.eigenes ? (
                  <span className="qb-gv__kopf-inhalt">
                    {bild}
                    <span className="qb-gv__name">{s.name}</span>
                  </span>
                ) : (
                  <a className="qb-gv__kopf-inhalt" href={ziel}>
                    {bild}
                    <span className="qb-gv__name">{s.name}</span>
                  </a>
                )}
              </h3>
              <dl className="qb-gv__merkmale">
                <div className="qb-gv__zeile qb-gv__zeile--preis">
                  <dt>{z.preis}</dt>
                  <dd data-qb-vergleich-preis="">{s.preis || '–'}</dd>
                </div>
                <div className="qb-gv__zeile">
                  <dt>{z.einsatz}</dt>
                  <dd>{s.einsatz}</dd>
                </div>
                <div className="qb-gv__zeile">
                  <dt>{z.material}</dt>
                  <dd>{s.material}</dd>
                </div>
                <div className="qb-gv__zeile">
                  <dt>{z.wasser}</dt>
                  <dd>{s.wasser}</dd>
                </div>
                <div className="qb-gv__zeile">
                  <dt>{z.studie}</dt>
                  <dd>
                    {s.studien.map((st) => (
                      <a key={st.href} className="qb-gv__studie" href={st.href}>
                        {st.text}
                      </a>
                    ))}
                  </dd>
                </div>
                {mitRaten ? (
                  <div className="qb-gv__zeile">
                    <dt>{z.raten}</dt>
                    <dd>{s.raten || '–'}</dd>
                  </div>
                ) : null}
              </dl>
              <div className="qb-gv__fuss">
                {s.eigenes ? (
                  <span className="qb-gv__marke">{VERGLEICH.dieserArtikel}</span>
                ) : (
                  <a className="btn--text qb-gv__weg" href={ziel}>
                    {VERGLEICH.zumGeraet(s.name)}
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

/**
 * Die häufigsten Kundenfragen mit ihren Bestandsantworten. `oben` ist die
 * Auswahl aus teileFragen(), `alle` die volle Liste der Seite: das
 * FAQPage-Schema wird hier über die VOLLE Liste ausgegeben (byte-gleich zu
 * dem, was die FAQ unten vorher ausgab), die FAQ unten gibt keines mehr aus.
 *
 * Jede Frage hat ihre eigene FaqListe: so bekommt jeder Eintrag seinen
 * Messanker, ohne dass die geteilte Akkordeon-Mechanik (FaqListe.jsx) eine
 * zweite Fassung bekommt oder angefasst wird.
 *
 * @param {{handle: string, oben: Array, alle: Array}} props
 */
export function Kundenfragen({handle, oben, alle}) {
  if (!oben?.length) return null;
  const jsonLd = faqPageJsonLdString(alle);
  const titelId = `qb-kf-titel-${handle}`;
  return (
    <section
      className="qb-kf NormalSectionSize"
      data-qb-kundenfragen=""
      data-textplatz={`${handle}.kundenfragen`}
      aria-labelledby={titelId}
    >
      {jsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html: jsonLd}} />
      ) : null}
      <h2 id={titelId} className="qb-kf__titel">
        {KUNDENFRAGEN.titel}
      </h2>
      <div className="qb-kf__liste">
        {oben.map((item) => (
          <div key={item.q} data-qb-kundenfrage="">
            <FaqListe items={[item]} />
          </div>
        ))}
      </div>
    </section>
  );
}
