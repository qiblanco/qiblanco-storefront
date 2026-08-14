import {Link} from 'react-router';
import {
  MmPage,
  MmBahn,
  MmProblem,
  MmMechanism,
  MmDiagramChip,
  MmDiagramWasser,
  MmStatBand,
  MmTrust,
  MmFaq,
  MmFunnel,
  MmPick,
  MmFinal,
  MmGrenzen,
} from '~/components/reusables/MmKit';
import {ReputonWidget} from '~/components/index-components/ReputonWidget';
import {useGoogleRating} from '~/lib/googleRating';

/**
 * MmSoFunktioniertQiOne — Composer der Erklär-Seite /pages/so-funktioniert-der-qione.
 * Zweck (Christian 2026-07-24): maximal verständlich („Bild-Zeitung“-Niveau —
 * jeder versteht es in Sekunden, kurze Sätze, Alltags-Analogien) UND im NEUEN
 * USA/Malibu-Style (warmes kalifornisches Lebensgefühl, hübsche Menschen,
 * begehrenswertes Produkt, Leichtigkeit) — erster Test des kommenden Haus-Styles.
 *
 * DESIGN: Malibu = warme Editorial-Fotografie + Weite auf dem BEWÄHRTEN
 * mm-lp.css-Token-System (design-rubrik-Referenz). Der Mood-Layer liegt
 * isoliert in styles/mm-malibu.css (.mm-malibu-scoped, 0 Regression). MmKit
 * UNANGETASTET — nur komponiert, plus zwei eigene Malibu-Sektionen (Hero +
 * Effekt-Bänder) inline.
 *
 * INHALT: ehrlich einfach — Modell (kohärentes Wasser = Grenzforschung) und
 * belegter Zellstudien-Schritt (in vitro) klar getrennt, KEIN Heilversprechen.
 * Proof-Zahlen 1:1 zu den Live-LPs (Schlaf ~20 %, Zellschutz 75,0 %, E-Smog
 * 87,1 %), Studien als in-vitro benannt.
 */

/* Alle Bilder sind live auf dem Shopify-CDN geprüft (HTTP 200) und bereits in
   der LP-Gruppe im Einsatz — warme, gedeckte Editorial-Fotos (Malibu-Mood). */
const HERO_BILD =
  'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/2024-06-qiblanco-bali-06610.jpg?v=1738529250';
const BILD_SCHLAF =
  'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/2023-03-01-qiblanco-milva-martin-1020791_1_0f03ee06-6ad1-4997-9182-3685335eb04c.webp?v=1738063344';
const BILD_ZELLE =
  'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/2024-06-qiblanco-bali-06550.jpg?v=1738529250';
const BILD_ESMOG =
  'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/2024-06-qiblanco-bali-05984.webp?v=1738529250';

const KAUF = '/pages/qione-2-pro?Title=Default+Title';

const EFFEKTE = [
  {
    eyebrow: 'Wirkung 1',
    titel: 'Tieferer Schlaf',
    bild: BILD_SCHLAF,
    alt: 'Ein Paar liegt entspannt und ruht — zur Ruhe kommen',
    text: 'Nachts soll dein Körper runterfahren. Ist das Wasser in deinen Zellen geordnet, kommt dein Nervensystem leichter aus dem Dauer-Alarm — und du schläfst ruhiger. Die meisten merken zuerst genau das.',
    zahl: '~20 %',
    label: 'nannten besseren, tieferen Schlaf als häufigstes Erlebnis — von 171 ausgewerteten Erfahrungsberichten (deskriptiv, kein Beweis).',
  },
  {
    eyebrow: 'Wirkung 2',
    titel: 'Zellschutz',
    bild: BILD_ZELLE,
    alt: 'Mann trägt den QiOne im Alltag, ruhiger Moment bei Kaffee',
    gewendet: true,
    text: 'Jeden Tag setzt Stress deinen Zellen zu — Fachleute nennen das „oxidativen Stress“. Stell es dir wie leichtes Rosten vor, nur in der Zelle. Geordnetes Wasser an der Zellhülle federt das ab. In Zellstudien blieben geschützte Zellen deutlich stabiler.',
    zahl: '75,0 %',
    label: 'weniger oxidativer Zellstress in Zellstudien (in vitro, an Zellkulturen — nicht am Menschen).',
  },
  {
    eyebrow: 'Wirkung 3',
    titel: 'E-Smog-Schutz',
    bild: BILD_ESMOG,
    alt: 'Frau am Laptop — Alltag zwischen WLAN und Bildschirm',
    text: 'Handy, WLAN, Bildschirm — den ganzen Tag umgibt uns Funk. Diese Strahlung stört die feine Hülle deiner Zellen. Die geordnete Wasserschicht wirkt wie ein Puffer und hält die Zellhülle stabiler.',
    zahl: '87,1 %',
    label: 'geringere Zellschädigung unter Mobilfunk-Stress in Zellstudien (in vitro).',
  },
];

const SCHNELL = [
  {
    num: '1',
    titel: 'Fast alles in dir ist Wasser',
    text: 'Über 70 % deines Körpers bestehen aus Wasser — in den Zellen, im Blut, überall. Ist dieses Wasser geordnet, läuft vieles ruhiger.',
  },
  {
    num: '2',
    titel: 'Ein Gitter aus Gold ordnet es',
    text: 'Im QiOne sitzt ein winziges Gitter aus 750er Gold. Wie eine Stimmgabel einen Ton vorgibt, gibt es dem Wasser drumherum eine feine Ordnung — ganz ohne Batterie.',
  },
  {
    num: '3',
    titel: 'Du trägst ihn — fertig',
    text: 'Kette umhängen, das war’s. Er wirkt Tag und Nacht, ob du daran denkst oder nicht. Nichts einstellen, nichts laden, keine App.',
  },
];

const FAQ = [
  {
    frage: 'Ist das ein Medizinprodukt?',
    antwort:
      'Nein. Der QiOne 2 Pro ist kein Medizinprodukt, und wir machen keine Heilversprechen. Wir erklären nur, was passiert — und sagen dazu, was belegt ist und was ein Modell ist.',
  },
  {
    frage: 'Muss ich etwas spüren, damit es wirkt?',
    antwort:
      'Nein. Der Effekt hängt nicht daran, ob du etwas spürst. Manche merken eine Veränderung, andere nicht — beides ist normal. Die 20-Tage-Rückgabe hängt an deiner Überzeugung und der Frist, nie am Spüren.',
  },
  {
    frage: 'Was heißt „in vitro“ / „Zellstudie“?',
    antwort:
      'Die Studien wurden an Zellen im Labor gemacht, nicht am Menschen. Das ist eine echte, aber begrenzte Stufe von Beweis. Wir sagen das bewusst dazu, statt mehr zu behaupten.',
  },
  {
    frage: 'Braucht der QiOne Strom oder Pflege?',
    antwort:
      'Nein. Kein Akku, keine Elektronik, keine App. Das Gold-Gitter ist fest und passiv — du trägst ihn einfach, über Jahre.',
  },
];

const FUNNEL = [
  {
    titel: 'So wirkt kohärentes Wasser',
    text: 'Der Mechanismus in Ruhe erklärt — von der Gitterstruktur bis zur Zelle.',
    href: '/pages/so-wirkt-kohaerentes-wasser',
    cta: 'Mechanismus',
  },
  {
    titel: 'Die Zellstudien, ehrlich',
    text: 'Alle vier Publikationen mit Methode, Ergebnis und ehrlichen Grenzen.',
    href: '/pages/zellstudien-ehrlich',
    cta: 'Evidenz',
  },
  {
    titel: 'Das 20-Tage-Versprechen',
    text: 'Wie die Rückgabe wirklich abläuft — ohne Kleingedrucktes.',
    href: '/pages/das-20-tage-versprechen',
    cta: 'Garantie',
  },
];

const BADGES = [
  {mark: '✦', titel: '750er Gold', sub: 'im Gitterchip'},
  {mark: '⚑', titel: 'Fertigung in Bayern', sub: 'Deutschland'},
  {mark: '▤', titel: '4 Publikationen', sub: 'präklinisch, als PDF'},
  {mark: '↺', titel: '20 Tage', sub: 'Geld-zurück'},
  {mark: '★', titel: '4,8 / 5', sub: 'Google-Bewertung'},
  {mark: '∞', titel: 'Kein Akku', sub: 'passiv, wartungsfrei'},
];

const PICK = [
  {handle: 'qione-2-pro', name: 'QiOne 2 Pro', note: 'Kette — nah am Körper, unsichtbar', cta: 'Zum QiOne 2 Pro'},
  {handle: 'qibracelet', name: 'QiBracelet', note: 'Armband — sichtbar getragen', cta: 'Zum QiBracelet'},
  {handle: 'qihome-air', name: 'QiHome Air', note: 'Für den Raum, in dem du schläfst', cta: 'Zum QiHome Air'},
];

function MalibuHero() {
  return (
    <section className="mm-mal-hero" data-section="mm-malibu-hero">
      <figure className="mm-mal-hero__media">
        <img
          src={HERO_BILD}
          alt="Zwei Menschen, entspannt und leicht im warmen Licht — kalifornisches Lebensgefühl"
          loading="eager"
          width="1200"
          height="800"
        />
      </figure>
      <div className="mm-mal-hero__scrim" aria-hidden="true" />
      <div className="mm-mal-hero__inhalt">
        <span className="mm-eyebrow">So funktioniert der QiOne 2 Pro</span>
        <h1>Dein Körper ist zu 70 % Wasser. Der QiOne bringt es in Ordnung.</h1>
        <p className="mm-mal-hero__sub">
          Kein Strom, kein Aufladen, keine App. Du trägst ihn — mehr nicht. Hier erklären wir in einfachen
          Worten, was dabei passiert. Ehrlich, mit klaren Grenzen.
        </p>
        <div className="mm-mal-hero__actions">
          <Link className="mm-cta" to="#wirkungen" prefetch="intent">
            Die 3 Wirkungen ansehen
          </Link>
          <Link className="mm-cta mm-cta--sekundaer" to={KAUF} prefetch="intent">
            Zum QiOne 2 Pro
          </Link>
        </div>
      </div>
    </section>
  );
}

function MalibuEffekt({effekt}) {
  return (
    <div className={`mm-mal-effekt${effekt.gewendet ? ' mm-mal-effekt--gewendet' : ''}`}>
      <figure className="mm-mal-effekt__media">
        <img src={effekt.bild} alt={effekt.alt} loading="lazy" width="720" height="480" />
      </figure>
      <div className="mm-mal-effekt__body">
        <span className="mm-mal-effekt__eyebrow">{effekt.eyebrow}</span>
        <h3>{effekt.titel}</h3>
        <p className="mm-mal-effekt__text">{effekt.text}</p>
        <div className="mm-mal-effekt__beleg">
          <span className="mm-mal-effekt__zahl">{effekt.zahl}</span>
          <span className="mm-mal-effekt__label">{effekt.label}</span>
        </div>
      </div>
    </div>
  );
}

export function MmSoFunktioniertQiOne({products}) {
  const g = useGoogleRating();
  return (
    <MmPage scope="mm-malibu">
      <MalibuHero />

      <MmProblem
        dataSection="mm-malibu-schnell"
        eyebrow="In 20 Sekunden"
        title="Ganz einfach erklärt"
        text="Du musst kein Physiker sein. Der QiOne macht im Grunde nur eine Sache — und die kannst du in drei Bildern verstehen."
      />
      <div className="mm-lp mm-malibu">
        <div className="mm-bahn" style={{paddingTop: 0}}>
          <div className="mm-mal-schnell__karten">
            {SCHNELL.map((k) => (
              <div className="mm-mal-karte" key={k.num}>
                <div className="mm-mal-karte__num">{k.num}</div>
                <h3>{k.titel}</h3>
                <p>{k.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <span id="wirkungen" />
      <MmBahn variante="flaeche">
        <span className="mm-eyebrow">Die 3 Wirkungen</span>
        <h2>Was der QiOne für dich tun soll</h2>
        <p className="mm-lede" style={{marginBottom: 'var(--mm-s8)'}}>
          Ein einziges Prinzip — geordnetes Wasser — zeigt sich auf drei Ebenen. Jede erklären wir simpel,
          jede mit einer ehrlichen Zahl aus den Studien.
        </p>
        <div className="mm-mal-effekte">
          {EFFEKTE.map((e) => (
            <MalibuEffekt effekt={e} key={e.titel} />
          ))}
        </div>
      </MmBahn>

      <MmMechanism
        dataSection="mm-malibu-mechanismus"
        eyebrow="Und was passiert da genau?"
        title="Von der Kette bis zur Zelle — in drei Schritten"
        intro="Etwas genauer, aber immer noch einfach. Der QiOne trägt ein festes Gitter aus 750er Gold, eingefasst in Chirurgenstahl. Keine Elektronik, kein Akku."
        schritte={[
          {titel: 'Das Gold-Gitter gibt den Takt', text: 'Eine feste, präzise Gitterstruktur — wie eine Stimmgabel. Sie beeinflusst das Wasser direkt daneben.'},
          {titel: 'Wasser ordnet sich', text: 'Die Wassermoleküle an biologischen Grenzflächen gehen in einen geordneteren, „kohärenten“ Zustand über. Genau das haben die Zellstudien untersucht.'},
          {titel: 'Die Zelle arbeitet ruhiger', text: 'Eine geordnete Wasserschicht stabilisiert die Zellhülle, puffert E-Smog ab und senkt Stress — der Körper ist weniger im Abwehrmodus.'},
        ]}
        kinder={
          <>
            <MmDiagramChip caption="Aufbau-Schema: Gold-Gitter im Chirurgenstahl-Körper (vereinfacht)." />
            <MmDiagramWasser caption="Modell: von ungeordneten zu geordneten Wassermolekülen entlang der Gitterstruktur." />
          </>
        }
        note="Ehrliche Grenze: „Kohärentes Wasser“ ist ein Modell aus der Grenzforschung, keine etablierte Medizin. Belegt sind Effekte in Zellkulturen (in vitro) — kein Heileffekt am Menschen. Die Diagramme sind schematisch, keine Messbilder."
      />

      <MmStatBand
        dataSection="mm-malibu-stats"
        stats={[
          {zahl: '70 %', label: 'deines Körpers ist Wasser'},
          {zahl: '750er', label: 'Gold im Gitter'},
          {zahl: '4', label: 'publizierte Zellstudien'},
          {zahl: '0', label: 'Akku · Elektronik · App'},
        ]}
      />

      {/* Google-Rezensionsbereich (Job 20260731-google-rezensionen):
          Live-Reputon wie in den Geschwister-Mm-Seiten (mm-bahn-Muster),
          Überschrift = Christian-Ergänzung; Zahl claims-SSoT-kanonisch. */}
      <MmProblem
        variante="flaeche"
        dataSection="mm-malibu-reviews-intro"
        title="Über 14.000 zufriedene Kunden – entscheide dich jetzt!"
        text={`Echte Google-Bewertungen unserer Kundinnen und Kunden — Gesamtschnitt ${g.komma} / 5 aus ${g.total} Bewertungen. Einzelerfahrungen, kein Wirknachweis.`}
      />
      <div className="mm-lp"><div className="mm-bahn" style={{paddingTop: 0}}><ReputonWidget /></div></div>

      <MmTrust
        dataSection="mm-malibu-trust"
        eyebrow="Woran du dich festhalten kannst"
        title="Ehrlich und nachprüfbar"
        badges={BADGES}
      />

      <MmFaq dataSection="mm-malibu-faq" title="Kurze, ehrliche Antworten" items={FAQ} />

      <MmFunnel dataSection="mm-malibu-funnel" title="Tiefer einsteigen — die ganze Kette" links={FUNNEL} />

      <MmPick dataSection="mm-malibu-pick" title="Ein Prinzip, drei Wege es zu tragen" products={products} handles={PICK} variante="flaeche" />

      <MmFinal
        dataSection="mm-malibu-final"
        title="Am einfachsten verstehst du ihn, wenn du ihn trägst."
        text="20 Tage selbst prüfen. Überzeugt dich nichts, schickst du ihn zurück — Geld zurück, ohne Wenn und Aber."
        cta={{href: KAUF, label: 'Zum QiOne 2 Pro'}}
        ctaSekundaer={{href: '/pages/schlaf-zellen-schutz', label: 'Schlaf, Zellen & E-Smog im Detail'}}
      />

      <MmGrenzen dataSection="mm-malibu-grenzen">
        <strong>Transparenz-Hinweis:</strong> QiOne&reg; 2 Pro ist kein Medizinprodukt und nicht dazu bestimmt,
        Krankheiten zu diagnostizieren, zu behandeln oder zu heilen. Die genannten Studien sind präklinische
        In-vitro-Untersuchungen an Zellkulturen; sie belegen keinen Heileffekt am Menschen. Erfahrungsberichte
        sind deskriptiv und ohne Kontrollgruppe. &bdquo;Kohärentes Wasser&ldquo; bezeichnet ein Ordnungs-Modell
        und ist keine anerkannte medizinische Diagnose.
      </MmGrenzen>
    </MmPage>
  );
}
