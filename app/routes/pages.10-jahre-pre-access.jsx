import {Anmeldeformular} from '~/components/reusables/Anmeldeformular';
import tenYearsStyles from '~/styles/ten-years-sale.css?url';

// Seite stillgelegt (404 live). Beim AC-Abschluss (Elina EL-20261103-b633cb45)
// nur das Formular auf den eigenen Weg gestellt; der Umweg über
// qiblanco.activehosted.com/proc.php ist entfernt.
const FORM_ID = 27;

export function links() {
  return [{rel: 'stylesheet', href: tenYearsStyles}];
}

export const meta = () => [
  {title: '10 Jahre Jubiläums Pre-Sale - Qi Blanco'},
  {name: 'robots', content: 'noindex,nofollow'},
];

export default function TenYearsPreAccess() {
  return (
    <div className="ten-years-page ten-years-pre-access">
      <div className="ten-years-inner ten-years-pre-access__grid">
        <div className="ten-years-pre-access__media">
          <img
            className="ten-years-pre-access__image"
            src="/campaigns/ten-years/j-sale-26-all-de.png"
            alt="10 Jahre Jubiläums Sale - spare bis zu 500 Euro"
            width="1250"
            height="1607"
          />
        </div>
        <div className="ten-years-pre-access__content">
          <span className="ten-years-eyebrow">Pre-Access</span>
          <h1>Exklusiver 10 Jahre Jubiläums Pre-Sale!</h1>
          <p className="ten-years-pre-access__copy">
            Erhalte sofort Zugriff auf unsere{' '}
            <strong>10 Jahre Jubiläums Sale / Pre-Sale Deals</strong> und{' '}
            <strong>spare bis zu 500€!</strong>
          </p>
          <div className="ten-years-pre-access__form">
            <Anmeldeformular formId={FORM_ID} />
          </div>
          <p className="ten-years-pre-access__disclaimer">
            *Deine Eintragung ist absolut unverbindlich. Du kannst dich
            jederzeit mit nur einem Klick wieder austragen und du erhältst keine
            weiteren E-Mails von uns. Wenn du dich anmeldest, erhältst du
            außerdem die neuesten Biohacking-Tipps und Informationen über Qi
            Blanco® in deinen Posteingang.
          </p>
        </div>
      </div>
    </div>
  );
}
