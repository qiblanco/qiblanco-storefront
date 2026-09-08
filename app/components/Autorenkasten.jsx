import {AUTORENKASTEN} from '~/lib/autorenkasten';
import {CdnBild} from '~/components/reusables/CdnBild';

/**
 * Der Autorenkasten am ENDE eines Fachartikels — "wie in einem guten Buch".
 *
 * Oben am Artikel bleibt es knapp (Datum, Name); wer bis hierher gelesen hat,
 * darf wissen, wer da geschrieben hat. Das ist der Grund für die Position,
 * nicht die Optik.
 *
 * BAUFORM: EIN Bauteil. Der Kasten kann baulich nicht doppelt entstehen —
 * siehe app/lib/autorenkasten.js. Der Marker `data-autorenkasten` ist die
 * Messflaeche von blog-redaktion/pruefungen/probe_autorenkasten_naht.py; er
 * steht am aeusseren Element und genau einmal.
 *
 * SEIT 2026-09-08 STEHT EIN FOTO IM KASTEN. Der foto-lose Zweig bleibt
 * trotzdem: er ist kein toter Code, sondern der Rueckweg. Wird `foto.bild_id`
 * je geleert — weil ein Bild zurueckgezogen wird —, rendert der Kasten weiter
 * und bleibt heil, statt eine leere 96px-Spalte zu zeigen, die wie ein nicht
 * geladenes Bild aussieht. Deshalb steht das Foto in einem eigenen Zweig und
 * nicht in einer Grid-Spalte, die ohne Inhalt zusammenfaellt.
 *
 * DER ZUSCHNITT IST EINE ENTSCHEIDUNG UND STEHT DESHALB IM CSS, NICHT HIER:
 * die Masterdatei ist hochformatig (1200x1535), die Flaeche im Kasten ist
 * quadratisch. `CdnBild` beschneidet grundsaetzlich nicht — das wäre eine
 * Aussage über den Bildinhalt, und die trifft der Aufrufer. Getroffen ist sie
 * in app/styles/blog.css (`object-fit: cover` auf ein 1:1-Feld, Bildmitte oben):
 * Kopf und Schultern sitzen im oberen Quadrat, der Zuschnitt verzerrt nichts
 * und schneidet kein Gesicht an. `breite`/`hoehe` nennen deshalb 96x96 — also
 * das, was wirklich gerendert wird. Stuende hier das Seitenverhaeltnis der
 * Masterdatei, würde der Browser die falsche Flaeche reservieren und die Seite
 * spraenge beim Nachladen.
 *
 * WER ENTSCHEIDET: nicht diese Komponente, sondern der LOADER der Route. Die
 * Sichtbarkeit hängt an der angefragten URL, und die kennt nur der Server.
 * Würde die Komponente selbst entscheiden, wären Server-Render und Hydration
 * zwei verschiedene Antworten auf dieselbe Frage -- der Kasten könnte auf dem
 * Server fehlen und im Browser erscheinen. EINE Entscheidungsstelle, im Loader.
 *
 * @param {{sichtbar?: boolean}} p
 */
export function Autorenkasten({sichtbar}) {
  if (!sichtbar) return null;

  const {name, saetze, foto} = AUTORENKASTEN;
  const hatFoto = Boolean(foto?.bild_id);

  return (
    <aside
      className={`article-autor${hatFoto ? '' : ' article-autor--ohne-foto'}`}
      data-autorenkasten=""
      aria-label={`Über den Autor ${name}`}
    >
      {hatFoto ? (
        <div className="article-autor__foto">
          {/* Feste Masse gegen den Layout-Sprung; die Leiter klemmt an der
              Anzeigebreite. Bewusst lazy: der Kasten steht am Seitenende. */}
          <CdnBild
            src={foto.bild_id}
            alt={foto.alt}
            anzeigeBreite={96}
            breite={96}
            hoehe={96}
            masterBreite={foto.masterBreite}
            loading="lazy"
          />
        </div>
      ) : null}
      <div className="article-autor__text">
        <p className="article-autor__label">Über den Autor</p>
        <p className="article-autor__name">{name}</p>
        {saetze.map((satz) => (
          <p key={satz.slice(0, 40)} className="article-autor__satz">
            {satz}
          </p>
        ))}
      </div>
    </aside>
  );
}
