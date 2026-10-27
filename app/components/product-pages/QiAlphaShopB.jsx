import {HeroBannerParallax} from '../reusables/HeroBannerParallaxButton';
import {GoogleRezensionenBereich} from '../reusables/GoogleRezensionenBereich';
import {ProductFAQ} from '../ProductFAQ';
import {StudienCards} from './StudienCards';
import {
  QIMASTER_DIAMANTBILDER,
  QIMASTER_DIAMANTBILDER_TITEL,
} from '~/data/qi-master-diamantbilder';
import {QIMASTER_LITERATURBILDER} from '~/data/qi-master-literaturbilder';
import {
  QIMASTER_GUETEZEICHEN,
  QIMASTER_GUETE_UEBERSCHRIFT,
} from '~/data/qi-master-guetezeichen';
import {
  QIMASTER_DIAMANT,
  QIMASTER_SECHS_G,
  QIMASTER_PERSOENLICHKEIT,
} from '~/data/qi-master-texte';
import {
  QA_AUFLAGE,
  QA_PRODUKTVIDEO,
  QaVideoSlot,
  alpha,
  alphaFragen,
} from '~/components/campaign/QiAlphaLpB';

/*
 * Shop B /products/qi-alpha-b — der Seiteninhalt unter der geteilten Kaufbox
 * (Grossjob 20261023-GROSSJOB-qi-alpha-landingpage-produktseite-finalisieren-
 * lp-simulation, s04; Spezifikation Arm B4 aus b-spezifikation.json).
 *
 * SHOP A IST KEIN ZUFALLSBAU: fast jeder Block geht auf eine Entscheidung
 * Christians zurück (Diamant, 6G, Persönlichkeit; Stimmen ans Ende; Logo-
 * Leiste und Gitterchip-Block gestrichen; „Gemessen"-Block zweimal
 * gestrichen). Shop B behält deshalb Christians Inhalte und Texte aus
 * DERSELBEN Quelle (app/data/qi-master-*.js) und ändert nur, was die
 * Blaupause verlangt:
 *   - Name „Qi Alpha" ohne ® (alpha(), nur der Name, kein anderes Wort);
 *   - „Erste Edition, 111 Stück" hochgezogen vor den Beweis (ENTWURF, die
 *     Auflage entscheidet Christian, abweichungen.json lp.auflage);
 *   - Beweis vor die Literatur, mit der Zeile zur Humanstudie (in
 *     Vorbereitung, ohne Zahl);
 *   - Fragen um Lieferzeit und Seriennummer ergänzt;
 *   - Schluss: Warenkorb oder persönliche Beratung STATT Querverkauf
 *     (Vorschlag, abweichungen.json shop.schluss-querverkauf).
 * QiMaster.jsx (Shop A) bleibt unberührt. Was dort gestrichen ist, fehlt hier
 * auch: Gitterchip-Block, Logo-Leiste, „Gemessen", „Alle Bewertungen lesen".
 */

/** Jede Zeichenkette eines Datenobjekts mit neuem Namen, Struktur unverändert. */
function alphaTief(wert) {
  if (typeof wert === 'string') return alpha(wert);
  if (Array.isArray(wert)) return wert.map(alphaTief);
  if (wert && typeof wert === 'object') {
    return Object.fromEntries(Object.entries(wert).map(([k, v]) => [k, alphaTief(v)]));
  }
  return wert;
}

export default function QiAlphaShopB() {
  return (
    <div className="ProductPageQiMaster qa-b qa-shop">
      <Liga />
      <Guete />
      <DiamantBilder />
      <Edition />
      <Beweis />
      <Literatur />
      <SechsG />
      <Persoenlichkeit />
      <HeroBannerParallax
        backgroundImage={
          '/2023-03-01-qiblanco-milva-martin-1020791_1.webp?v=1680003385'
        }
        headline={<>Dein Qi Alpha begleitet dich<br />Tag und Nacht.</>}
        subheadline={'Ein Stück, das du nicht ablegen musst.'}
        parallax={true}
        size={850}
        link={'#qm-buybox'}
        linkStyling={'primary'}
        linkText={'Hole dir deinen Qi Alpha'}
      />
      <ProductFAQ items={alphaFragen()} />
      <GoogleRezensionenBereich dataSection="qa-sb-stimmen" />
      <Beratung />
    </div>
  );
}

/* Christians Text vom 2026-09-16 (QiMaster.jsx MainFeatures), nur der Name. */
function Liga() {
  return (
    <div className="MainFeaturesWrapper" data-section="qa-sb-liga">
      <h2 className="text-center">Qi Alpha - Eine bisher unerreichte Liga</h2>
      <div className="MainFeatures NormalSectionSize">
        <div className="MainFeaturesColumn">
          <h3>Der Gitterchip™ der ultimativen Generation</h3>
          <p>
            Der Kern des Qi Alpha ist ein zweiteiliger Gitterchip™, definiert
            durch die über ein Jahrzehnt andauernde Forschung am QiOne®. Das
            Ergebnis ist die außergewöhnlichste Erscheinung: Eine Goldlegierung,
            deren Atome in einer einmalig definierten Ordnung stehen. Kohärent
            wirkend und ihre Umgebung aktiv prägend.
          </p>
        </div>
        <div className="MainFeaturesColumn">
          <h3>{'"The One Eye" - Hochreiner Natur Diamant'}</h3>
          <p>
            Ein Diamant ist reiner Kohlenstoff – dasselbe Element, aus dem jede
            Zelle deines Körpers gebaut ist. Alles Leben, so wie wir es auf der
            Erde kennen, basiert auf Kohlenstoff. „Die Kohlenstoffatome im
            Diamanten senden also auf den richtigen Frequenzen, die die
            Kohlenstoffatome in biologischem Material empfangen können.“ -
            Dr. Michael König
          </p>
        </div>
        <div className="MainFeaturesColumn">
          <h3>Pure Leistung. Pure Entspannung.</h3>
          <p>
            {'Durch dieses einmalige Duett des Gitterchips™ und "The One Eye" ist ' +
              'der Qi Alpha auf jegliche erdenkbare Zukunft vorbereitet. Egal ob ' +
              'sie 6G, Umweltgifte oder Schicksalsschläge lautet. Der Qi Alpha ' +
              'leistet auf jeder Ebene das erdenkliche Maximum.'}
          </p>
        </div>
      </div>
    </div>
  );
}

function Guete() {
  return (
    <section className="qm-guete NormalSectionSize" data-section="qa-sb-guete">
      <h2 className="qm-guete__ueberschrift">{alpha(QIMASTER_GUETE_UEBERSCHRIFT)}</h2>
      <ul className="qm-guete__liste">
        {QIMASTER_GUETEZEICHEN.map((zeichen) => (
          <li className="qm-guete__punkt" key={zeichen.id}>
            <svg
              className="qm-guete__symbol"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="1em"
              height="1em"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              focusable="false"
            >
              {zeichen.pfade.map((d) => (
                <path d={d} key={d} />
              ))}
            </svg>
            <span className="qm-guete__text">{alpha(zeichen.text)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function DiamantBilder() {
  return (
    <section className="qm-diamantbilder NormalSectionSize" data-section="qa-sb-diamantbilder">
      <h2>{QIMASTER_DIAMANTBILDER_TITEL}</h2>
      <div className="qm-diamantbilder__paar">
        {QIMASTER_DIAMANTBILDER.map((bild) => (
          <figure className="qm-diamantbild" key={bild.id}>
            <img
              className="qm-diamantbild__bild"
              src={bild.src}
              width={bild.breite}
              height={bild.hoehe}
              alt={alpha(bild.alt)}
              data-herkunft={bild.herkunft}
              loading="lazy"
              decoding="async"
            />
            <figcaption className="qm-diamantbild__unterschrift">
              {alpha(bild.unterschrift)}
            </figcaption>
          </figure>
        ))}
      </div>
      <QaVideoSlot video={QA_PRODUKTVIDEO} />
    </section>
  );
}

/* Bestand „Alpha Serie" (QiMaster.jsx AlphaSerie), hochgezogen. Die
   Seriennummer zeigt die Form, die Shopify heute führt. */
function Edition() {
  return (
    <div className="MassgeschneiderteTechnologie NormalSectionSize" data-section="qa-sb-edition">
      <h2 className="text-center">Erste Edition, {QA_AUFLAGE}</h2>
      <div className="MassgeschneidertWrapper">
        <div className="Column">
          <h3 className="mt-3">Eigene Seriennummer</h3>
          <p>Jeder Qi Alpha ist mit einer einmaligen Seriennummer versehen.</p>
          <h3 className="mt-3">Eigene Goldlegierung</h3>
          <p>
            Für den Gitterchip™ kommt eine eigene spezielle 750iger Goldlegierung
            zum Einsatz um die gewohnten Eigenschaften zu gewährleisten.
          </p>
        </div>
        <div className="Column">
          <h3 className="mt-3">Diamant</h3>
          <p>
            Wir verwenden ausschließlich zertifizierte hochreichen Natur
            Diamanten – reiner Kohlenstoff, gefasst am Gitterchip™.
          </p>
          <h3 className="mt-3">The One Eye</h3>
          <p>
            Rund um das Auge des Qi Alpha laufen 108 Striche – die Zahl, die in
            der Yoga-Überlieferung für Vollständigkeit steht.
          </p>
        </div>
      </div>
    </div>
  );
}

function Beweis() {
  return (
    <div className="qa-shop__beweis" data-section="qa-sb-beweis">
      <StudienCards headline="Publizierte Zellstudien zum Gitterchip™" />
      <p className="qa-shop__zeile">
        Eine Humanstudie mit Prof. Walach ist in Vorbereitung. Sie misst die
        Herzratenvariabilität (HRV).
      </p>
    </div>
  );
}

function Literatur() {
  const t = alphaTief(QIMASTER_DIAMANT);
  return (
    <section className="qm-sektion" id="diamant" data-section="qa-sb-literatur">
      <div className="qm-sektion__inner">
        <h2>{t.titel}</h2>
        {t.einstieg.map((abs) => (
          <p key={abs.slice(0, 40)}>{abs}</p>
        ))}
        {t.befunde.map((b, i) => (
          <div key={b.id}>
            <h3>{`${i + 1}. ${b.titel}`}</h3>
            {b.label ? (
              <span className={`qm-label${b.beleg ? ' qm-label--beleg' : ''}`}>
                {b.label}
              </span>
            ) : null}
            {b.absaetze.map((abs) => (
              <p key={abs.slice(0, 40)}>{abs}</p>
            ))}
            {b.zitat ? (
              <blockquote className="qm-zitat">
                <p>{b.zitat}</p>
                <span className="qm-quelle">{b.quelle}</span>
              </blockquote>
            ) : b.quelle ? (
              <span className="qm-quelle">{b.quelle}</span>
            ) : null}
            {QIMASTER_LITERATURBILDER[b.id] ? (
              <img
                className="qm-literaturbild"
                src={QIMASTER_LITERATURBILDER[b.id].src}
                width={QIMASTER_LITERATURBILDER[b.id].breite}
                height={QIMASTER_LITERATURBILDER[b.id].hoehe}
                alt={alpha(QIMASTER_LITERATURBILDER[b.id].alt)}
                data-herkunft={QIMASTER_LITERATURBILDER[b.id].herkunft}
                loading="lazy"
                decoding="async"
              />
            ) : null}
          </div>
        ))}
        <div className="qm-schluss">
          {t.schluss.map((zeile) => (
            <p key={zeile}>{zeile}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

function SechsG() {
  const t = alphaTief(QIMASTER_SECHS_G);
  return (
    <section className="qm-sektion qm-sektion--flaeche" id="sechs-g" data-section="qa-sb-6g">
      <div className="qm-sektion__inner">
        <h2>{t.titel}</h2>
        {t.absaetze.map((abs) => (
          <p key={abs.slice(0, 40)}>{abs}</p>
        ))}
        <ul className="qm-quellen">
          {t.quellen.map((q) => (
            <li key={q.slice(0, 3)}>{q}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Persoenlichkeit() {
  const t = alphaTief(QIMASTER_PERSOENLICHKEIT);
  return (
    <section className="qm-sektion" id="persoenlichkeitsentwicklung" data-section="qa-sb-persoenlichkeit">
      <div className="qm-sektion__inner">
        <h2>{t.titel}</h2>
        {t.einstieg.map((abs) => (
          <p key={abs.slice(0, 40)}>{abs}</p>
        ))}
      </div>
      <div className="qm-zweispalt">
        <div className="qm-spalte">
          <span className="qm-label">{t.ueberlieferung.label}</span>
          <h3>{t.ueberlieferung.titel}</h3>
          {t.ueberlieferung.absaetze.map((abs) => (
            <p key={abs.slice(0, 40)}>{abs}</p>
          ))}
          {t.ueberlieferung.zitate.map((z) => (
            <blockquote className="qm-zitat" key={z.quelle}>
              <p>{z.text}</p>
              <span className="qm-quelle">{z.quelle}</span>
            </blockquote>
          ))}
        </div>
        <div className="qm-spalte">
          <span className="qm-label qm-label--beleg">{t.fundament.label}</span>
          <h3>{t.fundament.titel}</h3>
          {t.fundament.absaetze.map((abs) => (
            <p key={abs.slice(0, 40)}>{abs}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Schluss statt Querverkauf (Vorschlag Klasse C, abweichungen.json
   shop.schluss-querverkauf). /pages/produktberatung zeigt keinen Telefonweg,
   sondern eine Terminwahl (gemessen 2026-10-23); der Satz nennt deshalb den
   Termin statt „Ruf uns an" (b-spezifikation qa-sb-beratung). */
function Beratung() {
  return (
    <section className="qa-abschnitt qa-abschluss" data-section="qa-sb-beratung" aria-labelledby="qa-sb-beratung">
      <div className="qa-abschluss__inhalt">
        <h2 id="qa-sb-beratung">Noch eine Frage vor dem Kauf?</h2>
        <p>Wähl dir einen Termin. Wir beraten dich persönlich zum Qi Alpha.</p>
        <div className="qa-knoepfe">
          <a className="qa-knopf" href="#qm-buybox" data-qb-kaufknopf="">
            In den Warenkorb
          </a>
          <a className="qa-knopf qa-knopf--zweit" href="/pages/produktberatung">
            Persönlich beraten lassen
          </a>
        </div>
      </div>
    </section>
  );
}
