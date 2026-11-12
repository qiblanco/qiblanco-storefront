import {AnnaKugel, annaChatProps} from '~/components/anna-kugel/AnnaKugel';
import {mitMarkeR} from '~/components/reusables/MarkeR';
import {YoutubeIframe} from '~/components/reusables/YoutubeIframe';
import {useGoogleRating} from '~/lib/googleRating';

/*
 * Bausteine der Kaufseiten QiOne® 2 Pro und QiHome® Air für die BF-Deal-Seiten
 * (Elina EL-20261112-452cdd56). Markup 1:1 wie die Funktionen QiOneNutzen,
 * QiOneWeltrekord (app/routes/products.qione-2-pro.jsx) und Einsatz
 * (app/routes/products.qihome-air.jsx); die INHALTE kommen aus denselben
 * Datenmodulen wie dort, eine Textänderung am Original erscheint also auch hier.
 * Die Routen selbst bleiben unberührt (ihre Seiten tragen eigene offene
 * Design-Belege, die einen Deal-Bau nicht aufhalten sollen). Zusammenlegen ist
 * als eigener Auftrag vorgemerkt.
 */

/** Nutzen-Raster (s03 nutzen) nach Apple: vier Spalten, Etikett, Titel, Text. */
export function QiOneNutzen({daten}) {
  const google = useGoogleRating();
  if (!daten?.spalten?.length) return null;
  return (
    <div className="avq-nutzen" data-av-nutzen="">
      <h2 className="tas-box-titel">{mitMarkeR(daten.ueberschrift)}</h2>
      <ul className="avq-nutzen-raster">
        {daten.spalten.map((s) => {
          const link = s.link
            ? {
                text: s.link.text.replace('{sterne}', google.komma),
                href: s.link.href === 'google' ? google.url : s.link.href,
                fremd: s.link.href === 'google',
              }
            : null;
          return (
            <li key={s.etikett} className="avq-spalte">
              {/* Service-Spalte: Lichtkern-Kugel, Kugel und Titel öffnen Annas Chat (Christian 12.11.2026). */}
              {s.anna ? <AnnaKugel groesse={32} className="avq-anna-kugel" /> : null}
              <p className="avq-etikett">{s.etikett}</p>
              <h3 className="avq-titel">
                {s.anna ? (
                  <button type="button" className="anna-chat-text" {...annaChatProps('titel')}>
                    {mitMarkeR(s.titel)}
                  </button>
                ) : (
                  mitMarkeR(s.titel)
                )}
              </h3>
              <p className="avq-text">{mitMarkeR(s.text)}</p>
              {link ? (
                <a
                  className="avq-link"
                  href={link.href}
                  {...(link.fremd ? {target: '_blank', rel: 'noopener noreferrer'} : {})}
                >
                  {link.text}
                </a>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Weltrekordhalter (s03 weltrekord): Video-Fassade links, Text rechts. */
export function QiOneWeltrekord({daten}) {
  if (!daten?.video) return null;
  return (
    <div className="avq-weltrekord" data-av-weltrekord="">
      <div className="avq-weltrekord-video">
        <YoutubeIframe
          link={`https://www.youtube.com/embed/${daten.video}`}
          titel={daten.videoTitel}
        />
      </div>
      <div className="avq-weltrekord-text">
        <p className="taw-etikett">{daten.siegel}</p>
        <h2 className="tas-box-titel">{daten.titel}</h2>
        <p>{daten.text}</p>
        {daten.quellen?.length ? (
          <ul className="avq-quellen" aria-label="Quellen">
            {daten.quellen.map((q) => (
              <li key={q.href}>
                <a href={q.href} target="_blank" rel="noopener noreferrer">
                  {q.text}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

/*
 * EINSATZ (nur QiHome Air, s04): drei Orte, keine Auswahl. Kachel-Stil der
 * Faktenkacheln (av-kacheln), eine Überschrift im H2-Stil der Slots.
 */
export function Einsatz({daten}) {
  if (!daten?.zeilen?.length) return null;
  return (
    <div className="av-einsatz" data-av-einsatz="" style={{marginBottom: 'var(--tas-s-8)'}}>
      <h2 className="tas-box-titel">{mitMarkeR(daten.ueberschrift)}</h2>
      <ul className="av-kacheln">
        {daten.zeilen.map((z) => (
          <li key={z.titel} className="av-kachel">
            <span className="av-kachel-zahl">{z.titel}</span>
            <span className="av-kachel-satz">{mitMarkeR(z.zeile)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
