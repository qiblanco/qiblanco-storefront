import {redirect} from 'react-router';
import {kakaoLadenZiel} from '~/lib/kakao-laden-weiche.server';
import SpiegelProdukt, {
  links as spiegelLinks,
  loader as spiegelLoader,
  meta as spiegelMeta,
} from '~/crystal-spiegel/routes/products.crystal-cacao-create';
import {SpiegelRahmen, spiegelStile} from '~/crystal-spiegel-rahmen/SpiegelRahmen';

/**
 * „CREATE“ — der dritte Reiter des Crystal-Bereichs, ein 1:1-Spiegel der
 * Kaufseite https://crystal-cacao.com/products/crystal-cacao-create.
 *
 * Elina, 26.10.2026 (EL-20261026-be291ae4, Antwort auf MU-0182): „Create auf
 * qiblanco.com wird genauso wie Awake eine 1:1-Kopie der heutigen Create-Seite
 * von crystal-cacao.com, Preis, Packungswahl und In-den-Warenkorb im ersten
 * Bildschirm, Texte wortgleich, Sorten-Knöpfe bleiben vorerst draußen."
 * Diese Datei ist eine HÜLLE wie products.crystal-cacao-awake.jsx; Inhalt,
 * Preise, Kauf-Block, canonical und Strukturdaten kommen aus dem erzeugten
 * Spiegel. Die bisherige qiblanco-eigene Create-Seite steht in der git-Historie
 * (Rückweg: create aus SEITEN= in crystal-cacao-node/spiegel-nachzug.conf
 * streichen und diese Datei aus dem Stand davor zurückholen).
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

export default function CrystalCacaoCreate() {
  return (
    <SpiegelRahmen>
      <SpiegelProdukt />
    </SpiegelRahmen>
  );
}
