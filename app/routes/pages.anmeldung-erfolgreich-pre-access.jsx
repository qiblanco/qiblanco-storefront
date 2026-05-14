import {useMemo} from 'react';
import {Link, useLocation} from 'react-router';
import tenYearsStyles from '~/styles/ten-years-sale.css?url';

export function links() {
  return [{rel: 'stylesheet', href: tenYearsStyles}];
}

export const meta = () => [
  {title: 'Anmeldung erfolgreich - Qi Blanco'},
  {name: 'robots', content: 'noindex,nofollow'},
];

export default function TenYearsSuccess() {
  const location = useLocation();
  const dealLink = useMemo(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('view') !== 'anmeldung-erfolgreich-pre-access') {
      return '/pages/10-jahre-sale';
    }
    params.set('view', '10-jahre-sale');
    return `/pages/10-jahre-sale?${params.toString()}`;
  }, [location.search]);

  return (
    <div className="ten-years-page ten-years-success">
      <div className="ten-years-success__box">
        <span className="ten-years-eyebrow">Pre-Access</span>
        <h1>Deine Anmeldung war erfolgreich!</h1>
        <p>
          Du bist jetzt für den 10 Jahre Jubiläums Pre-Sale eingetragen. Wir
          schicken dir den Zugang und alle wichtigen Informationen direkt per
          E-Mail.
        </p>
        <Link className="ten-years-btn" to={dealLink}>
          Jetzt direkt Deals ansehen
        </Link>
      </div>
    </div>
  );
}
