import {LogoBar} from '../reusables/LogoBar';
import {InfoSlider} from '../index-components/InfoSlider';
import {HeroBannerParallax} from '../reusables/HeroBannerParallaxButton';
import {GoogleRezensionenBereich} from '../reusables/GoogleRezensionenBereich';
import {UpsellLineUp} from '../UpsellLineUp';
import {ProductFAQ} from '../ProductFAQ';
import {FAQ_QI_MASTER} from '~/data/product-faqs';
import {StudienCards} from './StudienCards';
import {
  QIMASTER_DIAMANT,
  QIMASTER_SECHS_G,
  QIMASTER_PERSOENLICHKEIT,
} from '~/data/qi-master-texte';

/*
 * QiMaster — der Seiteninhalt unterhalb der Buy-Box von /products/qi-master
 * (Job 20260910-BAU-qi-master-produkt-und-shopseite-diamant-6g-und-
 * persoenlichkeitsentwicklung, Christian-Auftrag CW-20260910-0e45045b).
 *
 * BAUFORM: derselbe Aufbau wie product-pages/QiOne2Pro.jsx — LogoBar,
 * Investment-Block, Main Features, InfoSlider, Google-Rezensionen, 20-Tage-
 * Block, Gitterchip, Parallax-Hero, Studien, Technologie/Fertigung, Upsell,
 * FAQ — dieselben Sektionsklassen aus app.css, damit Abstaende und Bausteine
 * mit der QiOne-2-Pro-Seite identisch bleiben. NEU sind allein die drei
 * Inhalts-Bausteine des QiMaster (Diamant, 6G, Persoenlichkeitsentwicklung);
 * ihre Texte leben in app/data/qi-master-texte.js, weil dort jede Aussage
 * ihre Quelle traegt und der Text ohne Markup pruefbar bleibt.
 *
 * WAS BEWUSST FEHLT (jede Auslassung eine Entscheidung, kein Vergessen):
 *  - Ratenzahlungs-Bausteine (RatenzahlungHerobanner, „0 % Finanzierung",
 *    Klarna/PayPal-Raten): die Ratenangebote der Zahlungsdienste sind
 *    betragsgedeckelt (PayPal-Ratenzahlung bis 5.000 EUR); fuer 10.639 EUR
 *    ist die Zusage nicht belegt -> offene Flanke an Christian, nicht auf
 *    die Seite.
 *  - Sternzeile/„Ueber 14.000 Nutzer"/„Bestseller": Bestandszahlen des
 *    QiOne 2 Pro, die dieses Produkt nicht hat.
 *  - „8x staerker", „22,61 mm³", „100 % in Bayern gefertigt", „RJC-Gold":
 *    Angaben des QiOne 2 Pro, fuer den QiMaster nicht bestaetigt.
 *  - Produktbilder: es gibt noch keine. Die Buy-Box zieht sie aus Shopify,
 *    sobald sie dort liegen — hier wird kein QiOne-Bild als QiMaster gezeigt.
 *
 * CTA-Ziel: #qm-buybox (die Buy-Box dieser Seite; ein echtes Ziel statt des
 * toten '#product'-Ankers der QiOne-PDP).
 */
export default function QiMaster({block = undefined}) {
  return (
    <div className="ProductPageQiMaster">
      <LogoBar />
      <EinmalInvestieren />
      <MainFeatures />
      <InfoSlider />
      <GoogleRezensionenBereich />
      <RisikofreiErleben />
      <DiamantAbschnitt />
      <SechsGAbschnitt />
      <PersoenlichkeitAbschnitt />
      <GitterchipQiMaster />
      <HeroBannerParallax
        backgroundImage={
          '/2023-03-01-qiblanco-milva-martin-1020791_1.webp?v=1680003385'
        }
        headline={<>Dein QiMaster begleitet dich<br />Tag und Nacht.</>}
        subheadline={'Ein Stück, das du nicht ablegen musst.'}
        parallax={true}
        size={850}
        link={'#qm-buybox'}
        linkStyling={'primary'}
        linkText={'Hole dir deinen QiMaster'}
      />
      <StudienCards headline="Die Zellstudien zum Gitterchip – durchgeführt am QiOne® 2 Pro" />
      <Fertigung />
      <UpsellLineUp block={block} />
      <ProductFAQ items={FAQ_QI_MASTER} />
    </div>
  );
}

/**
 * Nutzenliste der Buy-Box — markup-identisch zur QiOneBenefitList (dieselben
 * vier Icons, dieselbe .BenefitList), mit den Zeilen, die fuer den QiMaster
 * belegt sind. „In 2-3 Tagen bei Dir" und „Inklusive Baumwollband" der
 * QiOne-Liste sind hier bewusst NICHT uebernommen: Lieferzeit eines
 * nummerierten Einzelstuecks und Lieferumfang (Goldkette statt Band) sind
 * andere Tatsachen.
 */
export function QiMasterBenefitList() {
  return (
    <div className="BenefitList">
      <ul>
        <li>
          <svg xmlns="http://www.w3.org/2000/svg" width="1.23em" height="1em" viewBox="0 0 1728 1408">
            <path fill="currentColor" d="M576 1152q0-52-38-90t-90-38t-90 38t-38 90t38 90t90 38t90-38t38-90M192 640h384V384H418q-13 0-22 9L201 588q-9 9-9 22zm1280 512q0-52-38-90t-90-38t-90 38t-38 90t38 90t90 38t90-38t38-90M1728 64v1024q0 15-4 26.5t-13.5 18.5t-16.5 11.5t-23.5 6t-22.5 2t-25.5 0t-22.5-.5q0 106-75 181t-181 75t-181-75t-75-181H704q0 106-75 181t-181 75t-181-75t-75-181h-64q-3 0-22.5.5t-25.5 0t-22.5-2t-23.5-6t-16.5-11.5T4 1114.5T0 1088q0-26 19-45t45-19V704q0-8-.5-35t0-38t2.5-34.5t6.5-37t14-30.5t22.5-30l198-198q19-19 50.5-32t58.5-13h160V64q0-26 19-45t45-19h1024q26 0 45 19t19 45"></path>
          </svg>
          <b>Kostenloser Versand</b> innerhalb Deutschlands
        </li>
        <li>
          <svg xmlns="http://www.w3.org/2000/svg" width="1.15em" height="1em" viewBox="0 0 2048 1792">
            <path fill="currentColor" d="M1811 1555q19-19 45-19t45 19l128 128l-90 90l-83-83l-83 83q-18 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19L19 1645l90-90l83 83l83-83q19-19 45-19t45 19l83 83l83-83q19-19 45-19t45 19l83 83l83-83q19-19 45-19t45 19l83 83l83-83q19-19 45-19t45 19l83 83l83-83q19-19 45-19t45 19l83 83l83-83q19-19 45-19t45 19l83 83zm-1574-38q-19 19-45 19t-45-19L19 1389l90-90l83 82l83-82q19-19 45-19t45 19l83 82l64-64v-293L302 710q-17-26-7-56.5t40-40.5l177-58V256h128V128h256V0h256v128h256v128h128v299l177 58q30 10 40 40.5t-7 56.5l-210 314v293l19-18q19-19 45-19t45 19l83 82l83-82q19-19 45-19t45 19l128 128l-90 90l-83-83l-83 83q-18 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19l-83-83zM640 384v128l384-128l384 128V384h-128V256H768v128z"></path>
          </svg>
          100% Versicherter Versand
        </li>
        <li>
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
            <path fill="currentColor" d="M19 17h3l-4 4l-4-4h3V3h2zM9 13H7c-1.1 0-2 .9-2 2v1a2 2 0 0 0 2 2h2v1H5v2h4c1.11 0 2-.89 2-2v-4a2 2 0 0 0-2-2m0 3H7v-1h2zM9 3H7c-1.1 0-2 .9-2 2v4a2 2 0 0 0 2 2h2c1.11 0 2-.89 2-2V5a2 2 0 0 0-2-2m0 6H7V5h2z"></path>
          </svg>
          Nummeriertes Einzelstück mit eigener Seriennummer
        </li>
        <li>
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 1728 1728">
            <path fill="currentColor" d="M1728 864q0 176-68.5 336t-184 275.5t-275.5 184t-336 68.5t-336-68.5t-275.5-184t-184-275.5T0 864q0-213 97-398.5T362 160T736 9v228q-221 45-366.5 221T224 864q0 130 51 248.5t136.5 204t204 136.5t248.5 51t248.5-51t204-136.5t136.5-204t51-248.5q0-230-145.5-406T992 237V9q206 31 374 151t265 305.5t97 398.5"></path>
          </svg>
          20 Tage erleben – volle Rückgabe, wenn er nicht der Richtige ist
        </li>
      </ul>
    </div>
  );
}

function EinmalInvestieren() {
  return (
    <div className="OneTimeInvestment NormalSectionSize">
      <h2>Einmal entscheiden – ein Stück für Jahrzehnte</h2>
      <p>
        Der QiMaster ist der QiOne mit Diamanten: derselbe Gitterchip der
        zweiten Generation, gefasst in ein Schmuckstück, das für ein ganzes
        Leben gedacht ist – und darüber hinaus.
      </p>
      <ol>
        <li>
          <strong>Diamanten und Gitterchip in einem Anhänger.</strong> Der
          Gitterchip prägt durch sein statisches Feld die Struktur des Wassers
          in seiner Umgebung – so, wie er es im QiOne® 2 Pro tut. Warum wir
          Diamanten dazugenommen haben, steht weiter unten – mit Quellen.
        </li>
        <li>
          <strong>750er Gold – Kette und Verschluss.</strong> Die Goldkette
          des QiMaster ist aus 750er Gold gefertigt, der Verschluss ebenfalls,
          beides mit Qi-Blanco-Logo.
        </li>
        <li>
          <strong>Nummeriertes Einzelstück.</strong> Jeder QiMaster trägt seine
          eigene Seriennummer. Es gibt ihn nicht zweimal.
        </li>
      </ol>
      <h3>Zusätzliche Services:</h3>
      <p>
        ✔ Premium-Kundenservice: Wir stehen dir 7 Tage die Woche per E-Mail
        zur Seite.
      </p>
    </div>
  );
}

function MainFeatures() {
  return (
    <div className="MainFeaturesWrapper">
      <h2 className="text-center">Was den QiMaster ausmacht</h2>
      <div className="MainFeatures NormalSectionSize">
        <div className="MainFeaturesColumn">
          <h3>Der Gitterchip der zweiten Generation</h3>
          <p>
            Der Kern des QiMaster ist der Gitterchip, den auch der QiOne® 2 Pro
            trägt: eine 750er Goldlegierung, deren Atome in einer festgelegten
            Ordnung stehen. Dieses Gitter ist es, was wir in Zellstudien haben
            untersuchen lassen – ohne Elektronik, ohne Batterie, ohne
            Verschleiß.
          </p>
        </div>
        <div className="MainFeaturesColumn">
          <h3>Der Diamant</h3>
          <p>
            Ein Diamant ist reiner Kohlenstoff – dasselbe Element, aus dem
            jede Zelle deines Körpers gebaut ist. Das ist der Grund, warum er
            im QiMaster sitzt. Was daran belegt ist und was unsere Deutung
            bleibt, trennen wir weiter unten sauber auf.
          </p>
        </div>
        <div className="MainFeaturesColumn">
          <h3>Vorbereitet auf das, was kommt</h3>
          <p>
            Der Gitterchip ist nicht auf eine Frequenz gebaut. Was das für
            5G heute und 6G morgen heißt – und was wir dazu gemessen haben und
            was nicht –, steht im Abschnitt „6G“.
          </p>
        </div>
      </div>
    </div>
  );
}

function RisikofreiErleben() {
  return (
    <div className="RisikofreiErleben NormalSectionSize">
      <h2>Erlebe den QiMaster – 20 Tage ohne Risiko</h2>
      <p>
        Wir sind überzeugt von unserer Technologie – und möchten, dass du es
        auch bist. Deshalb kannst du den QiMaster 20 Tage lang in deinen
        Alltag nehmen und dich selbst entscheiden.
      </p>
      <p className="mt-1">
        So einfach geht’s: <br />✅ Bestelle deinen QiMaster und trage ihn.{' '}
        <br />✅ Nimm dir Zeit – Tag und Nacht, Sauna, Sport, Meer.{' '}
        <br />✅ Solltest du ihn nicht behalten wollen, gibst du ihn innerhalb
        von 20 Tagen zurück und erhältst den vollen Kaufpreis.
      </p>
      <p className="mt-1">
        <strong>
          Das gilt für jedes Stück aus unserem Haus – auch für dieses.
        </strong>
      </p>
    </div>
  );
}

/* ───────────────────────── Diamant ───────────────────────── */
function DiamantAbschnitt() {
  const t = QIMASTER_DIAMANT;
  return (
    <section className="qm-sektion" id="diamant" data-section="qm-diamant">
      <div className="qm-sektion__inner">
        <h2>{t.titel}</h2>
        {t.einstieg.map((abs) => (
          <p key={abs.slice(0, 40)}>{abs}</p>
        ))}
        {t.befunde.map((b) => (
          <div key={b.id}>
            <h3>{b.titel}</h3>
            <span className={`qm-label${b.beleg ? ' qm-label--beleg' : ''}`}>
              {b.label}
            </span>
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
          </div>
        ))}
        <div className="qm-deutung">
          <span className="qm-label">Unsere Deutung</span>
          {t.deutung.map((abs) => (
            <p key={abs.slice(0, 40)}>{abs}</p>
          ))}
        </div>
        <ul className="qm-quellen">
          {t.quellen.map((q) => (
            <li key={q.slice(0, 40)}>{q}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ───────────────────────── 6G ───────────────────────── */
function SechsGAbschnitt() {
  const t = QIMASTER_SECHS_G;
  return (
    <section className="qm-sektion qm-sektion--flaeche" id="sechs-g" data-section="qm-6g">
      <div className="qm-sektion__inner">
        <h2>{t.titel}</h2>
        {t.absaetze.map((abs) => (
          <p key={abs.slice(0, 40)}>{abs}</p>
        ))}
        <h3>{t.gemessen.titel}</h3>
        <span className="qm-label qm-label--beleg">Gemessen</span>
        {t.gemessen.absaetze.map((abs) => (
          <p key={abs.slice(0, 40)}>{abs}</p>
        ))}
        <span className="qm-quelle">{t.gemessen.quelle}</span>
        <h3>{t.nichtGemessen.titel}</h3>
        <span className="qm-label">Nicht gemessen</span>
        {t.nichtGemessen.absaetze.map((abs) => (
          <p key={abs.slice(0, 40)}>{abs}</p>
        ))}
      </div>
    </section>
  );
}

/* ───────────────── Persoenlichkeitsentwicklung ───────────────── */
function PersoenlichkeitAbschnitt() {
  const t = QIMASTER_PERSOENLICHKEIT;
  return (
    <section className="qm-sektion" id="persoenlichkeitsentwicklung" data-section="qm-persoenlichkeit">
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
          <p>{t.ueberlieferung.nachsatz}</p>
        </div>
        <div className="qm-spalte">
          <span className="qm-label qm-label--beleg">{t.fundament.label}</span>
          <h3>{t.fundament.titel}</h3>
          {t.fundament.absaetze.map((abs) => (
            <p key={abs.slice(0, 40)}>{abs}</p>
          ))}
          <span className="qm-quelle">{t.fundament.quelle}</span>
        </div>
      </div>
      <div className="qm-sektion__inner">
        <div className="qm-deutung">
          <span className="qm-label">Unsere Deutung</span>
          {t.deutung.map((abs) => (
            <p key={abs.slice(0, 40)}>{abs}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

function GitterchipQiMaster() {
  return (
    <div className="Gitterchip NormalSectionSize">
      <h2 className="text-center">Der Gitterchip™ im QiMaster</h2>
      <div className="GitterchipImageWrapper mt-2">
        <img
          width={300}
          src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiOne_Gitterchip-1-1024x1024.jpg_1.webp?v=1670947861"
          alt="Gitterchip™ – Aufnahme aus dem QiOne® 2 Pro"
        />
      </div>
      <div className="mb-3 mt-2 text-center">
        <small><strong>Der Gitterchip™ – Aufnahme aus dem QiOne® 2 Pro; der QiMaster trägt denselben Chip.</strong></small>
      </div>
      <h3>Ohne Elektronik</h3>
      <p>
        Der Gitterchip enthält keine elektronischen Bauteile und keine
        Batterie. Maßgeblich ist die Anordnung der Goldatome in einer
        maßgeschneiderten 750er Goldlegierung – sie erzeugt ein statisches Feld,
        das Wassermoleküle in seiner Umgebung prägt.
      </p>
      <h3 className="mt-3">Für jeden Einsatzort</h3>
      <p>
        Sauna, Meer, Schwimmbad, Sport: Der Gitterchip ist beständig gegen
        Hitze, Chlor, Salzwasser und Schweiß. Ein Stück, das du nicht ablegen
        musst.
      </p>
    </div>
  );
}

function Fertigung() {
  return (
    <div className="MassgeschneiderteTechnologie NormalSectionSize">
      <h2 className="text-center">Ein Stück, kein Serienteil.</h2>
      <div className="MassgeschneidertWrapper">
        <div className="Column">
          <h3 className="mt-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M19 17h3l-4 4l-4-4h3V3h2zM9 13H7c-1.1 0-2 .9-2 2v1a2 2 0 0 0 2 2h2v1H5v2h4c1.11 0 2-.89 2-2v-4a2 2 0 0 0-2-2m0 3H7v-1h2zM9 3H7c-1.1 0-2 .9-2 2v4a2 2 0 0 0 2 2h2c1.11 0 2-.89 2-2V5a2 2 0 0 0-2-2m0 6H7V5h2z"></path></svg>{' '}
            Eigene Seriennummer
          </h3>
          <p>Jeder QiMaster ist nummeriert – ein Stück, das es nur einmal gibt.</p>
          <h3 className="mt-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="m1 22l1.5-5h7l1.5 5zm12 0l1.5-5h7l1.5 5zm-7-7l1.5-5h7l1.5 5zm17-8.95l-3.86 1.09L18.05 11l-1.09-3.86l-3.86-1.09l3.86-1.09l1.09-3.86l1.09 3.86z"></path></svg>{' '}
            750er Gold
          </h3>
          <p>Kette und Verschluss aus 750er Gold, beide mit Qi-Blanco-Logo.</p>
        </div>
        <div className="Column">
          <h3 className="mt-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M12 21L2 9l3-6h14l3 6zM9.625 8h4.75l-1.5-3h-1.75zM11 16.675V10H5.45zm2 0L18.55 10H13zM16.6 8h2.65l-1.5-3H15.1zM4.75 8H7.4l1.5-3H6.25z"></path></svg>{' '}
            Diamanten
          </h3>
          <p>Echte Diamanten – reiner Kohlenstoff, gefasst am Gitterchip.</p>
          <h3 className="mt-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5M12 17a5 5 0 0 1-5-5a5 5 0 0 1 5-5a5 5 0 0 1 5 5a5 5 0 0 1-5 5m0-8a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3"></path></svg>{' '}
            Die Iris: 108 Striche
          </h3>
          <p>
            Rund um das Auge des QiMaster laufen 108 Striche – die Zahl, die in
            der Yoga-Überlieferung für Vollständigkeit steht.
          </p>
        </div>
      </div>
    </div>
  );
}
