import {AppleSeite} from '~/components/apple-seite/AppleSeite';
import {YoutubeTimestamp} from '~/components/reusables/YoutubeTimestamp';
import dankeStyles from '~/styles/superhuman-danke.css?url';

/*
 * /pages/superhuman-anmeldung-erfolgreich — die Danke-Seite nach der
 * Superhuman-Anmeldung im Aufbau und Design der US-Seite
 * qi-blanco.com/pages/subscription-successful (Elina, EL-20261108-221d7b1a,
 * ausdrückliches GO ohne Vorschau): Kopf, Video, „Wie es weitergeht“,
 * Schluss-Fläche. Texte auf Deutsch, das Video ist dasselbe wie auf der
 * US-Seite (eine deutsche Fassung der Einführung gibt es nicht).
 *
 * Der Knopf „Kurs jetzt starten“ führt wie bisher direkt zu Lektion 1
 * (/pages/entgiftung) und steht als Knopf im Kopf, wie „Start the course now“
 * auf der US-Seite.
 *
 * Bisher rendert der Katchall pages.$handle den Shopify-Seitentext in einem
 * Dokument-Rahmen; den Aufbau der US-Seite kann er nicht (siehe dort: reiche
 * Seiten bekommen eine eigene Route). Rückweg: diese Datei und
 * superhuman-danke.css löschen, dann rendert der Katchall wieder den
 * unveränderten Shopify-Text.
 *
 * Wie bisher noindex, nofollow (seo.js führt die Seite als Funnel-Bestätigung,
 * aus der Sitemap), Meta-robots + X-Robots-Tag, kein canonical.
 */
export function links() {
  return [{rel: 'stylesheet', href: dankeStyles}];
}

/** @type {MetaFunction} */
export const meta = () => [
  {title: 'Superhuman Kurs: Anmeldung erfolgreich | Qi Blanco'},
  {name: 'robots', content: 'noindex,nofollow'},
];

/** @type {HeadersFunction} */
export const headers = () => ({'X-Robots-Tag': 'noindex, nofollow'});

export default function SuperhumanAnmeldungErfolgreich() {
  return (
    <AppleSeite seite="superhuman-anmeldung-erfolgreich">
      <section className="sd-kopf" data-section="as-hero">
        <p className="as-etikett">Dein 5-Tage-E-Mail-Kurs</p>
        <h1 className="as-h1">Willkommen, du bist dabei.</h1>
        <p className="sd-claim">
          Ab heute bekommst du fünf Tage lang jeden Tag eine Mail.
        </p>
        <div className="sd-knoepfe">
          <a className="as-knopf sd-knopf" href="/pages/entgiftung">
            Kurs jetzt starten
          </a>
        </div>
      </section>
      <section className="sd-sektion" data-section="as-video">
        <div className="sd-video">
          <YoutubeTimestamp
            videoId="vzIDpc0JXQo"
            titel="Einführung: In 5 Schritten zum Superhuman"
            zusatzParameter="rel=0"
            noscriptFallback
          />
        </div>
      </section>
      <section className="sd-sektion" data-section="as-kapitel">
        <div className="sd-kapitel">
          <h2 className="as-h2">Wie es weitergeht</h2>
          <p className="sd-text">Jede Mail bringt ein neues Thema.</p>
          <p className="sd-text">Tag 1 ist schon auf dem Weg in dein Postfach.</p>
          <p className="sd-text">Schön, dass du da bist.</p>
        </div>
      </section>
      <section className="sd-sektion" data-section="as-cta">
        <div className="sd-schluss">
          <h2 className="as-h2">Während du auf Tag 1 wartest.</h2>
          <p className="sd-text">
            Der QiOne<sup>®</sup> 2 Pro ist das Gerät, das Christian erfunden
            hat, und du trägst ihn den ganzen Tag nah am Körper.
          </p>
          <a className="as-knopf sd-knopf" href="/pages/qione-2-pro-details">
            Zum QiOne<sup>®</sup> 2 Pro
          </a>
        </div>
      </section>
    </AppleSeite>
  );
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').HeadersFunction} HeadersFunction */
