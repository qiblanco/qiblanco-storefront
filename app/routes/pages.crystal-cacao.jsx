import {redirect} from 'react-router';
import {kakaoLadenZiel} from '~/lib/kakao-laden-weiche.server';
import SpiegelStartseite, {
  links as spiegelLinks,
  loader as spiegelLoader,
  meta as spiegelMeta,
} from '~/crystal-spiegel/routes/_index';
import {SpiegelRahmen, spiegelStile} from '~/crystal-spiegel-rahmen/SpiegelRahmen';

/**
 * „UNSER KAKAO“ — der erste Reiter des Crystal-Bereichs, ein 1:1-Spiegel der
 * Startseite von crystal-cacao.com.
 *
 * Christian, 16.10.2026 (Übergabe #71): „die sind ab jetzt zu verlinken und
 * synchronisieren, die sehen einfach 1:1 gleich aus. ausser eben das
 * Drop-down“. Korrektur 17.10.: „Crystal Cacao und der Bereich auf Qi Blanco
 * ist dann ein 1:1-Spiegel.“
 *
 * Diese Datei ist eine HÜLLE und trägt keinen eigenen Inhalt. Inhalt, Daten,
 * Titel, Beschreibung, canonical und Strukturdaten kommen aus dem erzeugten
 * Spiegel (app/crystal-spiegel/, Erzeuger crystal-cacao-node/bin/spiegel-
 * nachzug, Quelle crystal-cacao-node/repo app/routes/_index.jsx). Wer hier
 * Text ändern will, ändert ihn auf crystal-cacao.com — der Nachzug bringt
 * ihn her.
 *
 * SEO (Auftrag Punkt 5): der canonical zeigt auf https://crystal-cacao.com/,
 * weil der Spiegel ihn unverändert von dort übernimmt. Der Doppelinhalt ist
 * damit benannt: das Original steht dort.
 *
 * Was die Hülle SELBST tut, ist qiblanco-eigen und bleibt: die
 * Kakao-Laden-Weiche (Einstiege aus eigenen Kanälen -> crystal-cacao.com,
 * Schalter Shop-Metafeld qb_routing.kakao_laden, fail-safe aus).
 */
export function links() {
  return [...spiegelStile(), ...spiegelLinks()];
}

export const meta = (args) => spiegelMeta(args);

/**
 * @param {import('react-router').LoaderFunctionArgs} args
 */
export async function loader(args) {
  const kakaoZiel = await kakaoLadenZiel(args);
  if (kakaoZiel) {
    throw redirect(kakaoZiel, {status: 302, headers: {'Cache-Control': 'no-store'}});
  }
  return spiegelLoader(args);
}

export default function CrystalCacaoPage() {
  return (
    <SpiegelRahmen>
      <SpiegelStartseite />
    </SpiegelRahmen>
  );
}
