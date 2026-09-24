import {Fragment} from 'react';
import {Link} from 'react-router';
import {
  GrafikLeit,
  GrafikDomaene,
  GrafikAusschlusszone,
} from '~/components/campaign/KwGrafiken';
import {Szene, GrafikGitterChip, GrafikKette} from '~/components/campaign/GcGrafiken';
import {BalkenDiagramm} from '~/components/reusables/BalkenDiagramm';
import {YoutubeTimestamp} from '~/components/reusables/YoutubeTimestamp';
import {GitterchipMoleculesScrub} from '~/components/reusables/GitterchipMoleculesScrub';
import {STUDIEN_NACH_SLUG, studienPfad} from '~/data/studien';
import {SEITE, KETTE, STUFEN, QUELLEN} from '~/data/gitterchip-seite';

/**
 * Die Seite „Wie funktioniert der GitterChip im QiOne?“, Darstellung.
 * DIESE DATEI TRÄGT KEINEN TEXT: jeder Satz und jede Studienzahl steht in
 * app/data/gitterchip-seite.js.
 *
 * AUFBAU: ein Kopf mit der Antwort und dem GitterChip im Querschnitt, dann
 * sieben Stufen. Jede Stufe führt oben die Kette Chip → Wasser → Zelle mit
 * ihrem Glied und endet mit einem Weiter, die letzte mit dem Kaufweg. So wird
 * die Seite eine durchgehende Erzählung, und jede Grafik spielt einmal, wenn
 * der Leser sie erreicht (Szene in GcGrafiken.jsx).
 *
 * DIE DATEN-ATTRIBUTE SIND DER VERTRAG MIT DER PROBE am Kundenrand
 * (worker-pool/pruefungen/probe_gitterchip_seite_siegel_und_einmal_animiert__20260924.py):
 * section[data-gc-stufe] für das Verkaufs-Siegel je Stufe, a[data-gc-weiter]
 * für die Führung, [data-gc-szene] für die Einmal-Animation und
 * [data-gc-kennzahl] für die Zahlen-Naht zur Studienseite.
 */

const GRAFIKEN = {
  leit: GrafikLeit,
  domaene: GrafikDomaene,
  ausschlusszone: GrafikAusschlusszone,
};

function Kette({glied}) {
  return (
    <ol className="gc-kette" aria-hidden="true">
      {KETTE.map((k, i) => (
        <Fragment key={k.id}>
          {i > 0 ? <li className="gc-kette__pfeil">→</li> : null}
          <li
            className={glied === 'alle' || glied === k.id ? 'gc-kette__glied ist-an' : 'gc-kette__glied'}
          >
            {k.name}
          </li>
        </Fragment>
      ))}
    </ol>
  );
}

function Grafik({stufe}) {
  const g = stufe.grafik;
  if (!g) return null;
  if (g.typ === 'kette') {
    return (
      <Szene name="kette" className="gc-szene--breit" legende={g.legende}>
        <GrafikKette glieder={g.glieder} />
      </Szene>
    );
  }
  const Bauteil = GRAFIKEN[g.typ];
  if (!Bauteil || !g.werte) return null;
  return (
    <Szene name={g.typ} legende={g.legende}>
      <Bauteil {...g.werte} />
    </Szene>
  );
}

function Video({video}) {
  return (
    <div className="gc-video" data-section="gc-video">
      <h3 className="gc-video__titel">{video.ueberschrift}</h3>
      <YoutubeTimestamp
        videoId={video.id}
        titel={video.titel}
        posterAlt={video.posterAlt}
        sizes="(min-width: 672px) 640px, 100vw"
        dataSection="gc-video-player"
      />
      <p className="gc-video__legende">{video.legende}</p>
      <p className="gc-video__liste">
        <a href={video.playlistUrl} target="_blank" rel="noopener noreferrer">
          {video.playlistText}
        </a>
      </p>
    </div>
  );
}

function Studien({stufe}) {
  return (
    <div className="gc-studien">
      <div className="gc-studien__balken">
        {stufe.diagramme.map((d) => (
          <div className="gc-studien__diagramm" key={d.id}>
            <BalkenDiagramm
              titel={
                <>
                  {d.titel[0]}
                  <br />
                  {d.titel[1]}
                </>
              }
              messgroesse={d.messgroesse}
              balken={d.balken}
              studieHref={studienPfad(d.studie)}
              studieZeile={d.zeile}
            />
          </div>
        ))}
      </div>
      <div className="gc-studien__kennzahlen">
        {stufe.kennzahlen.map((k) => (
          <Link
            key={k.id}
            to={studienPfad(k.studie)}
            prefetch="intent"
            className="gc-kennzahl"
            data-gc-kennzahl={k.wert}
            data-gc-quelle={studienPfad(k.studie)}
          >
            <span className="gc-kennzahl__wert">{k.anzeige}</span>
            <span className="gc-kennzahl__text">{k.text}</span>
            <span className="gc-kennzahl__zeile">{k.zeile}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Stufe({stufe, nr}) {
  const mitGrafik = stufe.grafik && stufe.grafik.typ !== 'kette';
  return (
    <section
      className={mitGrafik ? 'gc-stufe gc-stufe--zweispaltig' : 'gc-stufe'}
      id={stufe.anker}
      data-gc-stufe={stufe.id}
      data-section={`gc-${stufe.id}`}
      aria-labelledby={`${stufe.anker}-titel`}
    >
      <header className="gc-stufe__kopf">
        <p className="gc-marke">
          <span className="gc-marke__nr">Stufe {nr}</span> {stufe.marke}
        </p>
        <Kette glied={stufe.glied} />
        <h2 id={`${stufe.anker}-titel`}>{stufe.titel}</h2>
      </header>
      {stufe.oeffner === 'innenansicht' ? (
        <div className="gc-innenansicht">
          <GitterchipMoleculesScrub
            dataSection="gc-innenansicht"
            heightVhDesktop={200}
            heightVhMobile={160}
          />
        </div>
      ) : null}
      <div className="gc-stufe__inhalt">
        <div className="gc-stufe__text">
          {stufe.absaetze.map((a) => (
            <p key={a.slice(0, 40)}>{a}</p>
          ))}
        </div>
        {mitGrafik ? <Grafik stufe={stufe} /> : null}
      </div>
      {stufe.grafik && stufe.grafik.typ === 'kette' ? <Grafik stufe={stufe} /> : null}
      {stufe.video ? <Video video={stufe.video} /> : null}
      {stufe.diagramme ? <Studien stufe={stufe} /> : null}
      {stufe.kauf ? (
        <div className="gc-kauf">
          <Link to={stufe.kauf.href} prefetch="intent" className="btn--primary">
            {stufe.kauf.text}
          </Link>
          <Link to={stufe.neben.href} prefetch="intent" className="btn--text">
            {stufe.neben.text}
          </Link>
        </div>
      ) : null}
      {stufe.weiter ? (
        <p className="gc-weiter">
          <a href={`#${stufe.weiter.anker}`} data-gc-weiter="">
            {stufe.weiter.text}
          </a>
        </p>
      ) : null}
    </section>
  );
}

function Quellen() {
  const slugs = [];
  for (const s of STUFEN) {
    for (const d of s.diagramme || []) if (!slugs.includes(d.studie)) slugs.push(d.studie);
    for (const k of s.kennzahlen || []) if (!slugs.includes(k.studie)) slugs.push(k.studie);
  }
  return (
    <section className="gc-quellen" id="quellen" data-section="gc-quellen" aria-labelledby="quellen-titel">
      <h2 id="quellen-titel">{QUELLEN.titel}</h2>
      <ul className="gc-quellen__liste">
        {QUELLEN.forschung.map((z) => (
          <li key={z}>{z}</li>
        ))}
      </ul>
      <h3>{QUELLEN.studienTitel}</h3>
      <ul className="gc-quellen__liste">
        {slugs.map((slug) => {
          const st = STUDIEN_NACH_SLUG[slug];
          if (!st) return null;
          const e = st.eckdaten;
          return (
            <li key={slug}>
              {e.autor}: <Link to={studienPfad(slug)} prefetch="intent">{e.titelDeutsch}</Link>. {e.journal} {e.band}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function GitterChipSeite() {
  return (
    <article className="gc">
      <header className="gc-kopf" data-section="gc-kopf">
        <div className="gc-kopf__text">
          <p className="gc-dachzeile">{SEITE.dachzeile}</p>
          <h1>{SEITE.h1}</h1>
          {SEITE.kurz.map((p) => (
            <p className="gc-kurz" key={p.slice(0, 40)}>
              {p}
            </p>
          ))}
          <nav className="gc-inhalt" aria-label={SEITE.inhaltTitel}>
            <p className="gc-inhalt__titel">{SEITE.inhaltTitel}</p>
            <ol>
              {STUFEN.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.anker}`}>{s.marke}</a>
                </li>
              ))}
            </ol>
          </nav>
        </div>
        <figure className="gc-figur gc-figur--kopf">
          <GrafikGitterChip {...SEITE.kopfGrafik} />
          <figcaption>{SEITE.kopfGrafik.legende}</figcaption>
        </figure>
      </header>
      {STUFEN.map((s, i) => (
        <Stufe key={s.id} stufe={s} nr={i + 1} />
      ))}
      <Quellen />
    </article>
  );
}
