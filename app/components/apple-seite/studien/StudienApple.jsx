import studienAppleStyles from '~/styles/studien-apple.css?url';
import {StudienUebersicht} from '~/components/studien/StudienUebersicht';
import {AppleSeite} from '../AppleSeite';
import {AppleAnna, AppleCtaBand} from '../AppleSektionen';

/*
 * APPLE-FASSUNG /pages/studien (Grossjob 20261029-GROSSJOB-alle-shop-seiten-
 * apple-niveau-ausser-seo-geo, s06). Die Seite ist zugleich SEO-/GEO-Seite:
 * Titel, H1, Kerntext und beide ld+json kommen unverändert aus
 * StudienUebersicht (route meta() bleibt). Die Apple-Fassung legt die
 * Bauform der Apple-Seiten darüber (styles/studien-apple.css, nur --as-*)
 * und schließt den Beweis mit dem Weg zum Produkt (Beweis ist Closer,
 * Kaufüberzeugung Kanon 2026-10-10) und Anna ab. Anrede wie die Seite: Sie.
 */
export const STUDIEN_SCHLUSS = Object.freeze({
  titel: 'Gemessen im Labor. Jetzt bei Ihnen zu Hause.',
  text: '20 Tage testen. Passt er nicht, erhalten Sie den vollen Kaufpreis zurück.',
  cta: {text: 'Zum QiOne® 2 Pro', href: '/products/qione-2-pro'},
  cta2: {text: 'Zum QiBracelet®', href: '/products/qibracelet'},
});

export const STUDIEN_ANNA = Object.freeze({
  titel: 'Eine Frage zu den Studien? Fragen Sie Anna.',
  text: 'Anna antwortet sofort im Chat. Per E-Mail antwortet unser Team persönlich, werktags.',
});

export function StudienApple() {
  return (
    <>
      <link rel="stylesheet" href={studienAppleStyles} />
      <AppleSeite seite="studien">
        <StudienUebersicht schutzfrage />
        <AppleCtaBand hell {...STUDIEN_SCHLUSS} />
        <AppleAnna {...STUDIEN_ANNA} />
      </AppleSeite>
    </>
  );
}

export default StudienApple;
