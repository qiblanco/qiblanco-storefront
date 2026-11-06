import {AppleSeite} from '~/components/apple-seite/AppleSeite';
import bestaetigungStyles from '~/styles/superhuman-bestaetigung-b.css?url';

/*
 * /pages/superhuman-kurs-bestatigung-b — deutsche Fassung der US-Seite
 * qi-blanco.com/pages/class-confirmation (Elina, EL-20261106-e3d6d1db):
 * gleicher Aufbau, gleiches Design, Text aus ihrem Auftrag, kein Screenshot
 * der Mail. Die Seite steht neben /pages/superhuman-kurs-bestatigung, die
 * unverändert bleibt; Elina stellt selbst um.
 *
 * Nur diese Route, kein Shopify-Seitenobjekt: der Katchall pages.$handle rendert
 * den Dokument-Rahmen, nicht den Aufbau der US-Seite.
 *
 * DUNKEL wie die anderen B-Seiten: nirgends verlinkt, nicht im Menü, nicht in
 * der Sitemap. noindex, nofollow als Doppelgate (Meta-robots + X-Robots-Tag),
 * kein canonical, kein Open Graph.
 */
export function links() {
  return [{rel: 'stylesheet', href: bestaetigungStyles}];
}

/** @type {MetaFunction} */
export const meta = () => [
  {title: 'Du hast Post | Qi Blanco'},
  {name: 'robots', content: 'noindex,nofollow'},
];

/** @type {HeadersFunction} */
export const headers = () => ({'X-Robots-Tag': 'noindex, nofollow'});

export default function SuperhumanKursBestaetigungB() {
  return (
    <AppleSeite seite="superhuman-kurs-bestatigung-b">
      <section className="sb-kopf" data-section="as-hero">
        <p className="as-etikett">Dein 5-Tage-E-Mail-Kurs</p>
        <h1 className="as-h1">Du hast Post.</h1>
        <p className="as-unter">Deine Anmeldung ist fast fertig.</p>
      </section>
      <section className="sb-sektion" data-section="as-kapitel">
        <h2 className="as-h2">Ein Klick, und es geht los.</h2>
        <p className="as-absatz">
          Schau in dein Postfach und klick auf den Bestätigungslink. So wissen
          wir, dass die Adresse wirklich dir gehört.
        </p>
        <p className="as-absatz">
          Die Mail geht sofort raus, manchmal dauert es ein paar Minuten.
        </p>
        <p className="as-absatz">Noch keine Mail? Schau im Spam-Ordner nach.</p>
      </section>
    </AppleSeite>
  );
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').HeadersFunction} HeadersFunction */
