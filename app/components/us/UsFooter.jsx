import {Link} from 'react-router';

/*
 * EN-Footer der US-Vorabversion (/en-us) — Links NUR auf existierende
 * /en-us-Routen. Der "Do Not Sell or Share"-Link (CCPA/CPRA-Konsistenz,
 * Konzept 1a Kap. 3 ii + Kap. 6 Consent) zeigt auf den verankerten
 * Abschnitt der Privacy-Policy-Entwurfsseite.
 */
const US_FOOTER_SHOP = [
  {to: '/en-us', label: 'Home'},
  {to: '/en-us/pages/qione-2-pro', label: 'QiOne® 2 Pro'},
  {to: '/en-us/pages/crystal-cacao', label: 'Crystal Cacao'},
  {to: '/en-us/pages/support', label: 'Support'},
];

const US_FOOTER_LEGAL = [
  {to: '/en-us/pages/privacy-policy', label: 'Privacy Policy'},
  {
    to: '/en-us/pages/privacy-policy#do-not-sell',
    label: 'Do Not Sell or Share My Personal Information',
  },
  {to: '/en-us/pages/terms-of-service', label: 'Terms of Service'},
  {to: '/en-us/pages/refund-policy', label: 'Refund & Return Policy'},
  {to: '/en-us/pages/shipping-policy', label: 'Shipping Policy'},
  {to: '/en-us/pages/imprint', label: 'Imprint'},
];

export function UsFooter() {
  return (
    <footer className="us-footer">
      <div className="us-footer-cols">
        <div className="us-footer-col">
          <p className="us-footer-heading">Shop</p>
          <ul>
            {US_FOOTER_SHOP.map(({to, label}) => (
              <li key={to}>
                <Link to={to}>{label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="us-footer-col">
          <p className="us-footer-heading">Legal</p>
          <ul>
            {US_FOOTER_LEGAL.map(({to, label}) => (
              <li key={to}>
                <Link to={to}>{label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="us-footer-col">
          <p className="us-footer-heading">Contact</p>
          <ul>
            <li>
              <a href="mailto:info@qiblanco.com">info@qiblanco.com</a>
            </li>
            <li>Qi Blanco UG (haftungsbeschränkt)</li>
            <li>Brunnrangenstr. 25</li>
            <li>97711 Maßbach, Germany</li>
          </ul>
        </div>
      </div>
      <div className="us-footer-disclaimer">
        <p>
          The statements on this website have not been evaluated by the Food
          and Drug Administration. Qi Blanco® products are not intended to
          diagnose, treat, cure, or prevent any disease. The technology
          distributed by Qi Blanco does not correspond to conventional
          scientific understanding and does not replace consultation with a
          physician. Individual experiences vary.
        </p>
        <p>© Qi Blanco UG (haftungsbeschränkt). All rights reserved.</p>
      </div>
    </footer>
  );
}
