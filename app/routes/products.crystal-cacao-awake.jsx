import {redirect} from 'react-router';
import {kakaoLadenZiel} from '~/lib/kakao-laden-weiche.server';
import SpiegelProdukt, {
  links as spiegelLinks,
  loader as spiegelLoader,
  meta as spiegelMeta,
} from '~/crystal-spiegel/routes/products.crystal-cacao-awake';
import {SpiegelRahmen, spiegelStile} from '~/crystal-spiegel-rahmen/SpiegelRahmen';

/**
 * „AWAKE“ — der zweite Reiter des Crystal-Bereichs, ein 1:1-Spiegel der
 * Kaufseite https://crystal-cacao.com/products/crystal-cacao-awake.
 *
 * Christian, 16.10.2026 (Übergabe #71): „sie sind dann eine 1:1 Kopie des
 * Crystal Kakao Shops, d.h. die sind ab jetzt zu verlinken und
 * synchronisieren“. Diese Datei ist eine HÜLLE (Begründung und Quelle wie in
 * pages.crystal-cacao.jsx); Inhalt, Preise, Kauf-Block, canonical und
 * Strukturdaten kommen aus dem erzeugten Spiegel. Gekauft wird im
 * qiblanco-Warenkorb (derselbe Shopify-Katalog, dieselbe Kasse) — Kakao und
 * QiOne & Co. landen damit in EINER Bestellung.
 *
 * Bleibt qiblanco-eigen: die Kakao-Laden-Weiche (siehe dort).
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

export default function CrystalCacaoAwake() {
  return (
    <SpiegelRahmen>
      <SpiegelProdukt />
    </SpiegelRahmen>
  );
}
