import {useEffect, useRef} from 'react';
import {ActiveCampaignForm} from '~/components/reusables/ActiveCampaignForm';
import tenYearsStyles from '~/styles/ten-years-sale.css?url';

const FORM_ID = 27;

export function links() {
  return [{rel: 'stylesheet', href: tenYearsStyles}];
}

export const meta = () => [
  {title: '10 Jahre Jubiläums Pre-Sale - Qi Blanco'},
  {name: 'robots', content: 'noindex,nofollow'},
];

export default function TenYearsPreAccess() {
  const formRef = usePreAccessRedirect(FORM_ID);

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
          <div className="ten-years-pre-access__form" ref={formRef}>
            <ActiveCampaignForm formId={FORM_ID} />
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

function usePreAccessRedirect(formId) {
  const containerRef = useRef(null);

  useEffect(() => {
    let submitted = false;

    function getSuccessUrl() {
      const params = new URLSearchParams(window.location.search);
      if (params.get('view') === '10-jahre-pre-access') {
        params.set('view', 'anmeldung-erfolgreich-pre-access');
        return `${window.location.pathname}?${params.toString()}`;
      }
      return '/pages/anmeldung-erfolgreich-pre-access';
    }

    function onSubmit(event) {
      const form = event.target;
      if (!form || form.tagName !== 'FORM') return;
      if (!containerRef.current?.contains(form)) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      if (submitted) return;
      if (typeof form.reportValidity === 'function' && !form.reportValidity()) {
        return;
      }

      const email = form.querySelector('input[name="email"]');
      if (
        email?.value &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())
      ) {
        email.focus();
        return;
      }

      submitted = true;

      const submitButton = form.querySelector(`#_form_${formId}_submit`);
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.classList.add('processing');
      }

      const iframeName = 'ten-years-pre-access-submit';
      let iframe = document.querySelector(`iframe[name="${iframeName}"]`);
      if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.name = iframeName;
        iframe.style.display = 'none';
        iframe.setAttribute('aria-hidden', 'true');
        document.body.appendChild(iframe);
      }

      form.action = 'https://qiblanco.activehosted.com/proc.php';
      form.method = 'POST';
      form.target = iframeName;
      form.submit();

      window.setTimeout(() => {
        window.location.href = getSuccessUrl();
      }, 900);
    }

    document.addEventListener('submit', onSubmit, true);
    return () => document.removeEventListener('submit', onSubmit, true);
  }, [formId]);

  return containerRef;
}
