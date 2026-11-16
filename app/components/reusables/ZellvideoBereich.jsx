import {mitMarkeR} from '~/components/reusables/MarkeR';
import {ImgixVideo} from '~/components/reusables/ImgixVideo';
import {zellvideoBereich} from './zellvideo-bereich-daten';

/*
 * ZellvideoBereich — „What do I get“ der Zellstudie, mit dem farbigen Zellvideo
 * der Studie des Produkts (Christian 16.11.2026, Job 20261116-prio2-produktseiten-
 * zellvideo-bereich-je-studie-bracelet-home-qione2pro-de-us). Texte und Zuordnung:
 * app/components/reusables/zellvideo-bereich-daten.js.
 *
 * Apple-Stil der Alpha-Vorlage (tas-Tokens): Etikett, eine Aussage mit Produkt
 * und Nutzen, zwei große Zahlen als Vergleich, Studientext, Quelle, „Zur Studie“.
 * Mobil: Video zuerst über volle Breite, darunter der Text. Ab 750 px zwei Spalten.
 *
 * Video: <ImgixVideo> wie überall im Laden, selbst gehostet (Shopify-Video aus
 * video-quellen.js), stumm, Endlos-Schleife, Autostart erst in Sichtweite,
 * abgelehnter Autostart (iOS Stromsparen) wird bei Sicht und Berührung
 * nachgeholt; bis dahin steht das Standbild. Kein Ton, also kein Ton-Knopf.
 *
 * Kein Scroll-Effekt am Video oder an den Zahlen: die Seite blendet nur ein
 * (Hausrezept Christians Seiten), nichts rastet, nichts blockiert das Scrollen.
 */
export function ZellvideoBereich({handle}) {
  const b = zellvideoBereich(handle);
  if (!b) return null;
  const titelId = `zvb-titel-${handle}`;
  return (
    <section
      className={`zvb${b.video ? '' : ' zvb--ohne-video'}`}
      data-zellvideo-bereich={handle}
      aria-labelledby={titelId}
    >
      {b.video ? (
        <figure className="zvb-film">
          <ImgixVideo
            className="zvb-video"
            videoPath={b.video.pfad}
            fallbackImage={`${b.video.ersatzbild}&width=720`}
          />
          {b.video.bildzeile ? (
            <figcaption className="zvb-bildzeile">{mitMarkeR(b.video.bildzeile)}</figcaption>
          ) : null}
        </figure>
      ) : null}
      <div className="zvb-text">
        <p className="zvb-etikett">{mitMarkeR(b.etikett)}</p>
        <h2 id={titelId} className="zvb-titel">
          {mitMarkeR(b.titel)}
        </h2>
        {b.vergleich?.length ? (
          <dl className="zvb-zahlen">
            {b.vergleich.map((z) => (
              <div key={z.wert} className={`zvb-zahl${z.gold ? ' zvb-zahl--gold' : ''}`}>
                <dt>{z.wert}</dt>
                <dd>{mitMarkeR(z.zeile)}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        <p className="zvb-absatz">{mitMarkeR(b.text)}</p>
        <p className="zvb-quelle">
          {mitMarkeR(b.quelle)}
          {b.link?.href ? (
            <>
              {' · '}
              <a href={b.link.href} className="zvb-link">
                {b.link.text}
              </a>
            </>
          ) : null}
        </p>
      </div>
    </section>
  );
}
