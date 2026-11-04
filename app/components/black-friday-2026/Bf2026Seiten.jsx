import {Analytics} from '@shopify/hydrogen';
import {AppleSeite} from '~/components/apple-seite/AppleSeite';
import {
  AppleAnna,
  AppleBildBand,
  AppleCtaBand,
  AppleFakten,
  AppleFaq,
  AsBild,
} from '~/components/apple-seite/AppleSektionen';
import {mitMarkeR} from '~/components/reusables/MarkeR';
import {BF2026, bf2026Link} from '~/data/black-friday-2026';
import bf2026Styles from '~/styles/black-friday-2026.css?url';
import {Bf2026Kauf} from './Bf2026Kauf';
import {Bf2026Leistung} from './Bf2026Leistung';
import {Bf2026Countdown, Bf2026Zeit, useBf2026Zeit} from './Bf2026Uhr';
import {
  BF2026_BILDER,
  BF2026_FAQ_LANDING,
  BF2026_FRAGEN_AKTION,
  BF2026_KARTENSATZ,
  BF2026_KOPF,
  BF2026_SCHLUSS,
  BF2026_SO_GEHT_ES,
  BF2026_ZUM_UEBERBLICK,
} from './bf2026-texte';

/*
 * BLACK-FRIDAY-SEITEN 2026 (s04, KONZEPT §4): eine Landingpage mit vier Angeboten
 * und vier Angebotsseiten auf dem Apple-Baukasten. Der Baukasten bleibt
 * unverändert; was er nicht hat (Uhr, Karten, Leistungsgrafik, Produkt-Szene),
 * steht in diesem Ordner, CSS nur --as-* unter [data-apple-seite='bf-deals'].
 * Die Stylesheets laden hier, links() der Route kennt die Loaderdaten nicht: mit
 * Schalter off bleiben die <link>-Tags von products.$handle dieselben.
 */
const SEITE = 'bf-deals';

/** Worauf eine Karte nach dem Ende führt. */
const NORMALER_NAME = {
  qihome: 'QiHome® Air',
  qibracelet: 'QiBracelet®',
  'qione-2x': 'QiOne® 2 Pro',
  'qione-kette': 'QiOne® 2 Pro',
};

/* ---- Hero mit Produkt-Szene (Visualisierung 1) ---------------------------- */

function Bf2026Szene() {
  return (
    <div className="bf-szene">
      {BF2026.angebote.map((a) => (
        <AsBild
          key={a.key}
          bild={BF2026_BILDER[a.key]}
          sizes="(min-width: 750px) 25vw, 50vw"
          sofort
        />
      ))}
    </div>
  );
}

function Bf2026Hero() {
  const {phase} = useBf2026Zeit();
  const vorbei = phase === 'vorbei';
  return (
    <section className="as-hero as-dunkel bf-hero" data-section="as-hero">
      <div className="as-hero-text">
        <p className="as-overline">{BF2026_KOPF.overline}</p>
        <h1 className="as-h1">{vorbei ? BF2026_KOPF.vorbeiTitel : BF2026_KOPF.titel}</h1>
        <p className="as-unter">{mitMarkeR(vorbei ? BF2026_KOPF.vorbeiUnter : BF2026_KOPF.unter)}</p>
        {vorbei ? null : <Bf2026Countdown />}
        {vorbei ? null : (
          <div className="as-knoepfe">
            <a className="btn btn--primary as-knopf" href="#angebote" data-as-cta="primary">
              {BF2026_KOPF.knopf}
            </a>
          </div>
        )}
      </div>
      <figure className="as-hero-bild">
        <Bf2026Szene />
      </figure>
    </section>
  );
}

/* ---- Angebotskarten ------------------------------------------------------- */

function Bf2026Karte({angebot, produkte}) {
  const {phase, gepinnt} = useBf2026Zeit();
  const ziel = bf2026Link(`/products/${angebot.url_handle}`, gepinnt);
  return (
    <article className="bf-karte" data-bf-angebot={angebot.key} data-section={`bf-karte-${angebot.key}`}>
      <a className="bf-karte-bild" href={ziel} aria-hidden="true" tabIndex={-1}>
        <AsBild bild={BF2026_BILDER[angebot.key]} sizes="(min-width: 1200px) 560px, (min-width: 750px) 50vw, 100vw" />
      </a>
      <h3 className="bf-karte-titel">{mitMarkeR(angebot.titel)}</h3>
      <p className="as-absatz bf-karte-satz">{mitMarkeR(BF2026_KARTENSATZ[angebot.key])}</p>
      <Bf2026Kauf angebot={angebot} produkte={produkte} normalerName={NORMALER_NAME[angebot.key]} />
      {phase === 'vorbei' ? null : (
        <a className="as-link" href={ziel}>
          Mehr erfahren
        </a>
      )}
    </article>
  );
}

function Bf2026Angebote({produkte}) {
  return (
    <section className="as-sektion" id="angebote" data-section="bf-angebote">
      <h2 className="as-h2">Die vier Angebote.</h2>
      <div className="bf-karten">
        {BF2026.angebote.map((a) => (
          <Bf2026Karte key={a.key} angebot={a} produkte={produkte} />
        ))}
      </div>
    </section>
  );
}

function Bf2026Schluss({ziel = '#angebote'}) {
  const {phase} = useBf2026Zeit();
  const schluss = BF2026_SCHLUSS[phase];
  if (!schluss) return null;
  return <AppleCtaBand titel={schluss.titel} cta={{text: schluss.knopf, href: ziel}} />;
}

/* ---- Landingpage ---------------------------------------------------------- */

export function Bf2026Landing({seite}) {
  return (
    <Bf2026Zeit jetztMs={seite.jetztMs} gepinnt={seite.gepinnt}>
      <link rel="stylesheet" href={bf2026Styles} />
      <AppleSeite seite={SEITE}>
        <Bf2026Hero />
        <Bf2026Angebote produkte={seite.produkte} />
        <Bf2026Leistung />
        <AppleFakten {...BF2026_SO_GEHT_ES} />
        <AppleFaq {...BF2026_FAQ_LANDING} />
        <Bf2026Schluss />
        <AppleAnna />
      </AppleSeite>
    </Bf2026Zeit>
  );
}

/* ---- Angebotsseite -------------------------------------------------------- */

function Bf2026AngebotKopf({angebot, inhalt, produkte}) {
  return (
    <section className="bf-kopf" data-section="as-hero">
      <div className="bf-kopf-text">
        <p className="as-overline">{BF2026_KOPF.overline}</p>
        <h1 className="as-h1">{mitMarkeR(angebot.titel)}</h1>
        <p className="as-unter">{mitMarkeR(BF2026_KARTENSATZ[angebot.key])}</p>
      </div>
      <figure className="bf-kopf-bild">
        <AsBild
          bild={{...BF2026_BILDER[angebot.key], drehung: inhalt.drehung ?? undefined}}
          sizes="(min-width: 750px) 50vw, 100vw"
          sofort
        />
      </figure>
      <div className="bf-kopf-kauf">
        <Bf2026Kauf angebot={angebot} produkte={produkte} normalerName={NORMALER_NAME[angebot.key]} />
        {inhalt.vertrauen?.length ? (
          <ul className="bf-vertrauen">
            {inhalt.vertrauen.map((z) => (
              <li key={z}>{mitMarkeR(z)}</li>
            ))}
          </ul>
        ) : null}
        <Bf2026Countdown kompakt />
      </div>
    </section>
  );
}

export function Bf2026AngebotSeite({seite}) {
  const {angebot, inhalt, produkte} = seite;
  const haupt = produkte?.[angebot.artikel[0].produkt];
  const ersteVariante = haupt?.variants?.nodes?.[0];
  const ueberblick = bf2026Link(BF2026.landing.pfad, seite.gepinnt);
  return (
    <Bf2026Zeit jetztMs={seite.jetztMs} gepinnt={seite.gepinnt}>
      <link rel="stylesheet" href={bf2026Styles} />
      <AppleSeite seite={SEITE}>
        <Bf2026AngebotKopf angebot={angebot} inhalt={inhalt} produkte={produkte} />
        <Bf2026Leistung />
        {inhalt.baender.map((b, i) => (
          <AppleBildBand key={b.titel} index={i} {...b} />
        ))}
        <AppleFakten {...BF2026_SO_GEHT_ES} />
        <AppleFaq titel={inhalt.faqTitel} fragen={[...BF2026_FRAGEN_AKTION, ...inhalt.fragen]} />
        <Bf2026Schluss ziel={ueberblick} />
        <section className="as-sektion bf-ueberblick">
          <a className="as-link" href={ueberblick}>
            {BF2026_ZUM_UEBERBLICK}
          </a>
        </section>
        <AppleAnna />
      </AppleSeite>
      {haupt && ersteVariante ? (
        <Analytics.ProductView
          data={{
            products: [
              {
                id: haupt.id,
                title: haupt.title,
                price: ersteVariante.price?.amount || '0',
                vendor: haupt.vendor,
                variantId: ersteVariante.id || '',
                variantTitle: ersteVariante.title || '',
                quantity: angebot.artikel[0].menge,
              },
            ],
          }}
        />
      ) : null}
    </Bf2026Zeit>
  );
}
