import quelle from '~/data/qi-master-wortlaut.json';
import {GoogleRezensionenBereich} from '~/components/reusables/GoogleRezensionenBereich';
import {StudienCards} from '~/components/product-pages/StudienCards';
import {ProductFAQ} from '~/components/ProductFAQ';
import {FAQ_QI_MASTER} from '~/data/product-faqs';

/*
 * LP B /pages/qi-alpha-b — die Landingpage zum Qi Alpha nach der Blaupause
 * aus der LP-Simulation (Grossjob 20261023-GROSSJOB-qi-alpha-landingpage-
 * produktseite-finalisieren-lp-simulation, s02 Blaupause + b-spezifikation.json,
 * s04 Bau). Christian am 23.10.2026: „dass das Existierende mal bestehen bleibt
 * und dann aber eine B-Variante mit unserem neuesten Know-how".
 *
 * BLOCKFOLGE = Arm B1 der Simulation (die Folge IST die Blaupause, der Merge
 * prüft sie): Kopf mit Knopf · Menschen · Was du bekommst · Text-Knopf ·
 * Beweis · Preis mit Knopf · Garantie · Fragen · Schluss. Mobil ein fester
 * Knopf ab Bildschirm 2 bis vor den Preisblock (Test gs050).
 *
 * VORSCHAU: noindex, nirgends verlinkt, kein Verkehr. Jeder Knopf führt auf
 * Shop B /products/qi-alpha-b. Live erst mit Christians „let's go".
 *
 * BILDER kommen nur aus den Shopify-Produktmedien des DACH-Produkts. Heute
 * sind es 0; dann steht der Kopf ohne Bild und ohne Platzhalter. Kein Bild
 * eines anderen Produkts. Der Video-Slot ist leer und damit unsichtbar.
 */

export const QA_NAME = 'Qi Alpha';
export const QA_AUFLAGE = '111 Stück';
export const QA_ZIEL = '/products/qi-alpha-b';

/**
 * Bestandstext mit dem neuen Namen. Nur der Name wechselt, kein anderes Wort
 * (Christian hat Qi Master in Qi Alpha umbenannt, Schreibweise ohne ®).
 * @param {string} text
 */
export function alpha(text) {
  return String(text ?? '')
    .replace(/Qi Master®/g, QA_NAME)
    .replace(/Qi Master/g, QA_NAME)
    .replace(/QiMaster/g, QA_NAME);
}

/**
 * Christians Wortlaut vom 22.09.2026 aus der EINEN Quelle
 * app/data/qi-master-wortlaut.json, mit genau den drei in
 * b-spezifikation.json benannten Abweichungen: Name, 111 statt 100 Stück
 * (ENTWURF, Christian entscheidet), und der Satz zum Vorverkaufsstart entfällt
 * bis zu seiner Entscheidung. Sonst kein Wort geändert.
 */
export function alphaWortlaut() {
  const absaetze = quelle?.wortlaut?.absaetze ?? [];
  return absaetze
    .filter((t) => !/Vorverkauf starte/.test(t))
    .map((t) => alpha(t).replace(/100 Stück/g, QA_AUFLAGE));
}

/** Die zwei Fragen, die LP B und Shop B neu tragen (b-spezifikation qa-lp-fragen). */
export const QA_NEUE_FRAGEN = [
  {
    q: 'Wann wird geliefert?',
    a: 'Der Versand startet ab Mitte Januar 2027, weltweit und zu 100 % versichert.',
  },
  {
    q: 'Kann ich meine Seriennummer wählen?',
    a: 'Ja, gegen 2.000 € Aufpreis wählst du eine freie Nummer. Ohne Wunschnummer bekommst du beim Versand eine freie Nummer der Serie.',
  },
];

/** Fragen von A mit neuem Name; `ohneStaerke` lässt die Vergleichsfrage weg (LP). */
export function alphaFragen({ohneStaerke = false} = {}) {
  const bestand = FAQ_QI_MASTER.filter(
    (f) => !(ohneStaerke && /Wie stark/.test(f.q)),
  ).map((f) => ({...f, q: alpha(f.q), a: alpha(f.a)}));
  return [...bestand, ...QA_NEUE_FRAGEN];
}

/**
 * Glatte Beträge ohne Nachkommastellen, echte Cents centgenau
 * (Brain-Regel ganze-betraege-ohne-nachkommastellen).
 * @param {{amount?: string, currencyCode?: string} | null | undefined} preis
 */
export function betrag(preis) {
  const wert = Number(preis?.amount);
  if (!preis || !Number.isFinite(wert)) return null;
  const ganz = Math.round(wert * 100) % 100 === 0;
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: preis.currencyCode || 'EUR',
    minimumFractionDigits: ganz ? 0 : 2,
    maximumFractionDigits: ganz ? 0 : 2,
  }).format(wert);
}

/** Video-Slot: leer = nichts im DOM (kein Rahmen, kein Abstand). */
export function QaVideoSlot({video = null}) {
  if (!video?.src) return null;
  return (
    <figure className="qa-video">
      <video
        className="qa-video__medium"
        src={video.src}
        poster={video.poster}
        controls
        playsInline
        preload="none"
      >
        <track kind="captions" src={video.untertitel} srcLang="de" label="Deutsch" />
      </video>
    </figure>
  );
}

/**
 * @param {{
 *   bild?: {url: string, altText?: string, width?: number, height?: number} | null,
 *   preise: {haupt: string | null, wunschnummer: string | null, kette: string | null},
 * }} props
 */
export default function QiAlphaLpB({bild = null, preise}) {
  const wortlaut = alphaWortlaut();
  return (
    <div className="qa-b qa-lp">
      <header
        className={`qa-lp__kopf${bild ? ' qa-lp__kopf--bild' : ''}`}
        data-section="qa-lp-hero"
      >
        <div className="qa-lp__kopf-inhalt">
          {bild ? (
            <img
              className="qa-lp__kopf-bild"
              src={bild.url}
              alt={bild.altText || QA_NAME}
              width={bild.width}
              height={bild.height}
              fetchPriority="high"
              decoding="async"
            />
          ) : null}
          <div className="qa-lp__kopf-text">
            <span className="qa-auge">Erste Edition · {QA_AUFLAGE}</span>
            <h1 className="qa-lp__titel">
              Qi Alpha. Ein Diamant, gefasst am Gitterchip™, mit deiner eigenen
              Seriennummer.
            </h1>
            <p className="qa-lp__zeile">
              {preise.haupt ? `${preise.haupt} · ` : ''}Versand ab Mitte Januar
              2027, zu 100 % versichert
            </p>
            <a className="qa-knopf" href={QA_ZIEL} data-qb-kaufknopf="">
              Zur Qi Alpha
            </a>
          </div>
        </div>
      </header>

      <div className="qa-lp__strecke">
        <div className="qa-lp__stimmen">
          <GoogleRezensionenBereich dataSection="qa-lp-stimmen" />
        </div>

        <section className="qa-abschnitt" data-section="qa-lp-unikat" aria-labelledby="qa-unikat">
          <h2 id="qa-unikat">Was du bekommst</h2>
          <p>Einen hochreinen Naturdiamanten, gefasst am Gitterchip™ der zweiten Generation.</p>
          <p>
            Der Gitterchip™ besteht aus einer eigenen 750er Goldlegierung. Ihre
            Atome stehen in einer festgelegten Ordnung. Er arbeitet ohne
            Elektronik und ohne Verschleiß.
          </p>
          <p>
            Rund um das Auge laufen 108 Striche. Jedes Stück trägt eine eigene
            Seriennummer, und die letzte Politur macht ein Goldschmied von Hand.
          </p>
          <QaVideoSlot />
          <p className="qa-weiter" data-section="qa-lp-weiter-1">
            <a className="qa-textknopf" href={`${QA_ZIEL}#qm-buybox`}>
              Seriennummer wählen
            </a>
          </p>
        </section>

        <section className="qa-abschnitt qa-abschnitt--flaeche" data-section="qa-lp-beweis" aria-labelledby="qa-beweis">
          <div className="qa-abschnitt__inner">
            <h2 id="qa-beweis">Fünf Publikationen aus dem Labor von Prof. Dartsch</h2>
            <p>
              Vier Zellstudien zum Gitterchip™ im QiOne® 2 Pro, im QiBracelet®
              und im QiHome® Air, durchgeführt in vitro an Zellen im Labor. Dazu
              kommt eine Auswertung von 171 Nutzerberichten.
            </p>
            <p>
              Die Zellstudien zeigen Effekte an Zellen. Einen Heileffekt am
              Menschen belegen sie nicht.
            </p>
            <p>
              Eine Humanstudie mit Prof. Walach ist in Vorbereitung. Sie misst
              die Herzratenvariabilität (HRV).
            </p>
          </div>
          <StudienCards headline="Publizierte Zellstudien zum Gitterchip™" />
        </section>

        {/* Fester Kaufknopf mobil (gs050): position: sticky am Ende dieser
            Strecke. Er klebt am unteren Rand, solange die Strecke im Bild
            ist, und bleibt an seinem Platz vor dem Preisblock stehen. Kein
            Skript, kein Scroll-Jacking. Am Desktop ausgeblendet. */}
        <div className="qa-lp__fest">
          <a className="qa-knopf qa-knopf--fest" href={QA_ZIEL} data-qb-kaufknopf="">
            Zur Qi Alpha
          </a>
        </div>
      </div>

      <section className="qa-abschnitt" data-section="qa-lp-preis" aria-labelledby="qa-preis">
        <h2 id="qa-preis">Preis und Edition</h2>
        <dl className="qa-preise">
          {preise.haupt ? (
            <div className="qa-preise__zeile">
              <dt>Qi Alpha</dt>
              <dd className="qa-preise__wert">{preise.haupt}</dd>
            </div>
          ) : null}
          {preise.wunschnummer ? (
            <div className="qa-preise__zeile">
              <dt>Wunsch-Seriennummer</dt>
              <dd>+ {preise.wunschnummer}</dd>
            </div>
          ) : null}
          {preise.kette ? (
            <div className="qa-preise__zeile">
              <dt>Goldkette mit Logo und Spezialsicherheitsverschluss</dt>
              <dd>+ {preise.kette}</dd>
            </div>
          ) : null}
          <div className="qa-preise__zeile">
            <dt>Erste Edition</dt>
            <dd>{QA_AUFLAGE}</dd>
          </div>
        </dl>
        <ul className="qa-liste">
          <li>Versand ab Mitte Januar 2027, weltweit und zu 100 % versichert</li>
          <li>0 % Finanzierung mit PayPal und Klarna</li>
        </ul>
        <a className="qa-knopf" href={QA_ZIEL} data-qb-kaufknopf="">
          Zur Qi Alpha
        </a>
      </section>

      <section className="qa-abschnitt qa-abschnitt--flaeche" data-section="qa-lp-garantie" aria-labelledby="qa-garantie">
        <div className="qa-abschnitt__inner">
          <h2 id="qa-garantie">20 Tage erleben</h2>
          <p>
            Wie jedes Stück aus unserem Haus kannst du den Qi Alpha 20 Tage lang
            tragen und innerhalb dieser Frist zurückgeben. Du erhältst den vollen
            Kaufpreis zurück.
          </p>
        </div>
      </section>

      <div className="qa-lp__fragen" data-section="qa-lp-fragen">
        <ProductFAQ items={alphaFragen({ohneStaerke: true})} />
      </div>

      <section className="qa-abschnitt qa-abschluss" data-section="qa-lp-final" aria-label="Preis, Auflage und Versand des Qi Alpha">
        <div className="qa-abschluss__inhalt">
          {wortlaut.map((text) => (
            <p className="qa-wortlaut" key={text.slice(0, 32)}>
              {text}
            </p>
          ))}
          <div className="qa-knoepfe">
            <a className="qa-knopf" href={QA_ZIEL} data-qb-kaufknopf="">
              Zur Qi Alpha
            </a>
            <a className="qa-knopf qa-knopf--zweit" href="/pages/produktberatung">
              Persönlich beraten lassen
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
