import lpAppleStyles from '~/styles/lp-apple.css?url';
import webinarStyles from '~/styles/lp-apple-webinar.css?url';
import {
  Anmeldung,
  ERFAHRUNGEN,
  FOTO,
  FRAGEN,
  FUER_DICH,
  KalenderKnopf,
  MITNEHMEN,
  VERSPRECHEN,
  useWebinarLage,
} from '~/components/campaign/NachtWebinarSeite';
import {THEMA, terminText} from '~/components/campaign/nacht-webinar';
import {AppleSeite} from '../AppleSeite';
import {AppleAnna, AppleFakten, AppleFaq, AppleHero, AppleKapitel, AppleStimmen, AsBild} from '../AppleSektionen';
import {BILD} from './lp-gemeinsam.js';

/*
 * APPLE-FASSUNG /pages/webinar-die-nacht-entscheidet (Grossjob 20261029-GROSSJOB-
 * alle-shop-seiten-apple-niveau-ausser-seo-geo, s07-r8). Dieselben Texte, Fotos
 * und dasselbe Formular wie C (NachtWebinarSeite.jsx: Anmeldung, /w, Einwilligung,
 * Lead). Neu ist nur der Rahmen des Baukastens: großes Bild, Kacheln, Weißraum.
 * data-webinar bleibt, daran misst webinar-manager/pruefungen/probe_livegang_lp.py.
 *   if (daten.appleSeite?.an) return <NachtWebinarApple seite={daten.appleSeite.seite} daten={daten} />;
 */
const bildVon = (foto) => ({url: foto.src, alt: foto.alt, breite: foto.b, hoehe: foto.h});

function Sprecher() {
  return (
    <section className="as-sektion as-kapitel" data-section="as-kapitel">
      <header className="as-kapitel-kopf">
        <p className="as-etikett">Live im Webinar</p>
        <h2 className="as-h2">Christian</h2>
      </header>
      <div className="as-kapitel-raster">
        <figure className="as-kapitel-bild">
          <AsBild bild={bildVon(FOTO.christian)} sizes="(min-width: 1024px) 560px, 100vw" />
        </figure>
        <div className="as-kapitel-text">
          <p className="as-absatz">Christian, Diplom-Ingenieur und Gründer von Qi Blanco.</p>
          <blockquote className="as-nw-zitat" data-fremdtext="christian-cold-story-2b-20261008">
            <p>„Vor mehr als 10 Jahren habe ich Qi Blanco gegründet, aus meiner eigenen Leidensgeschichte heraus.“</p>
          </blockquote>
          <p className="as-absatz">Im Webinar erzählt er, wie es dazu kam, und beantwortet live deine Fragen.</p>
        </div>
      </div>
    </section>
  );
}

function Gast() {
  return (
    <section className="as-sektion" data-section="as-stimmen">
      <h2 className="as-h2">Ein Gedanke von Matthias Cebula</h2>
      <figure className="as-nw-gast">
        <blockquote className="as-nw-zitat" data-fremdtext="cebula-podcast-austherapiert-010910">
          <p>
            „… das grundsätzliche Wissen darum, dass wir hier unser Gehirn maximal schützen können, indem wir
            sagen, wir schlafen nicht im Elektrosmog …“
          </p>
        </blockquote>
        <figcaption className="as-stimme-quelle">
          Matthias Cebula, Autor von „Austherapiert“, im Podcast mit Christian (01:09:10)
        </figcaption>
      </figure>
    </section>
  );
}

function Person({foto, name, children}) {
  return (
    <li className="as-nw-person">
      <figure className="as-nw-person-bild">
        <AsBild bild={bildVon(foto)} sizes="(min-width: 750px) 540px, 100vw" />
        <figcaption className="as-stimme-quelle">{foto.vermerk}</figcaption>
      </figure>
      <h3 className="as-kachel-titel">{name}</h3>
      <p className="as-absatz">{children}</p>
    </li>
  );
}

function Pruefer() {
  return (
    <section className="as-sektion" data-section="as-vertrauen">
      <h2 className="as-h2">Wer für uns prüft</h2>
      <ul className="as-nw-personen">
        <Person foto={FOTO.dartsch} name="Prof. Dr. Peter C. Dartsch">
          Er leitet das Institut Dartsch Scientific und hat in unserem Auftrag vier Zellstudien zu unseren
          Produkten gemacht.
        </Person>
        <Person foto={FOTO.walach} name="Prof. Dr. Dr. Harald Walach">
          Eine placebokontrollierte Humanstudie mit HRV-Messung ist in Vorbereitung, Prof. Dr. Dr. Walach berät uns.
        </Person>
      </ul>
    </section>
  );
}

export function NachtWebinarApple({seite, daten}) {
  const {lage, setLage, versatz, termin} = useWebinarLage(daten);
  return (
    <>
      <link rel="stylesheet" href={lpAppleStyles} />
      <link rel="stylesheet" href={webinarStyles} />
      <AppleSeite seite={seite}>
        <div data-webinar={THEMA} data-webinar-seite="anmeldung">
          <AppleHero
            overline="Kostenloses Live-Webinar mit Christian"
            titel="Die Nacht entscheidet"
            unter={VERSPRECHEN}
            bild={BILD.paar}
            cta={{text: 'Zur Anmeldung', href: '#anmelden'}}
            preis={terminText(termin)}
          />
          <AppleFakten
            kacheln={[
              {zahl: 'Live', satz: 'Keine Aufzeichnung'},
              {zahl: '45 Minuten', satz: 'Danach deine Fragen'},
              {zahl: 'Kostenlos', satz: 'Per Zoom'},
            ]}
          />
          <AppleKapitel etikett="Für wen" titel="Für dich, wenn …" absaetze={FUER_DICH} />
          <AppleFakten
            titel="Das nimmst du mit"
            kacheln={MITNEHMEN.map((punkt, i) => ({zahl: String(i + 1), satz: punkt}))}
          />
          <Sprecher />
          <Gast />
          <Pruefer />
          <AppleStimmen
            titel="Was andere erleben"
            stimmen={ERFAHRUNGEN.map(([wer, was]) => ({text: was, quelle: `${wer}, sinngemäß aus dem Video`}))}
          />
          <section className="as-sektion as-nw-anmeldung" id="anmelden" data-section="as-anmeldung">
            <h2 className="as-h2">Melde dich kostenlos an</h2>
            <p className="as-absatz" data-webinar-termin={termin ? termin.webinar_id : ''}>
              {terminText(termin)} · live per Zoom
            </p>
            <div className="wn as-nw-formular">
              {daten.bestaetigt ? (
                <div className="wn-karte wn-bestaetigt" role="status" data-webinar-zustand="bestaetigt">
                  <p className="wn-danke">Deine Anmeldung ist bestätigt. Den Zoom-Link schicken wir dir per E-Mail.</p>
                  {termin ? <KalenderKnopf termin={termin} /> : null}
                </div>
              ) : (
                <Anmeldung lage={lage} versatz={versatz} setLage={setLage} />
              )}
            </div>
          </section>
          <AppleFaq titel="Häufige Fragen" fragen={FRAGEN.map(([f, a]) => ({f, a}))} />
          <AppleAnna />
        </div>
      </AppleSeite>
    </>
  );
}

export default NachtWebinarApple;
