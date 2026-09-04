import {Suspense, useState, useEffect} from 'react';
import {Await, NavLink, Link} from 'react-router';

const PRODUCT_LINKS = [
  {to: '/products/qione-2-pro', label: 'QiOne® 2 Pro'},
  {to: '/products/qibracelet', label: 'QiBracelet®'},
  {to: '/products/qihome-air', label: 'QiHome® Air'},
  {to: '/products/qione-kette', label: 'Necklace für QiOne®'},
  {to: '/products/zeremonie-kakao', label: 'Zeremonie Kakao'},
  {to: '/products/crystal-cacao-awake', label: 'Crystal Cacao Awake'},
  {to: '/products/crystal-cacao-create', label: 'Crystal Cacao Create'},
];

const STUDIES = [
  {
    id: 1,
    link: 'https://www.degruyter.com/document/doi/10.1515/reveh-2017-0014/html',
    logoSrc: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Functional_brain_MRI_in_patients_complaining_of_electrohypersensitivity_after_long_term_exposure_to_electromagnetic_fields.webp?v=1675425706',
    logoAlt: 'Bild Reviews on Environmental Health',
    imageSrc: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/BrainScan.webp?v=1675425833',
    imageAlt: 'Bild Gehirn Röntgenaufnahme',
    text: 'Die Studie "Functional brain MRI in patients complaining of electrohypersensitivity after long term exposure to electromagnetic fields" untersuchte die Auswirkungen einer Langzeit-Exposition bei elektromagnetischen Feldern (EMF) auf die Gehirnaktivität von Personen, die über Symptome einer Elektrosensibilität berichten. Messfaktor war die funktionelle Magnetresonanztomographie (fMRT), um Veränderungen der Gehirnaktivität als Reaktion auf EMF-Exposition zu untersuchen. Die Studie zielte darauf ab festzustellen, ob es eine Korrelation zwischen der Exposition gegenüber EMF und Veränderungen der Gehirnaktivität gibt und ob Personen mit Elektrohypersensibilitätssymptomen anders auf eine EMF-Exposition reagieren als Personen ohne Symptome. Die Ergebnisse der Studie können einen Einblick in die potenziellen gesundheitlichen Auswirkungen einer EMF-Exposition geben und die Entwicklung von Interventionen zur Behandlung von Symptomen der Elektrohypersensibilität beeinflussen.',
    cite: '© 2017 by De Gruyter, Heuser, Gunnar and Heuser, Sylvia A.. "Functional brain MRI in patients complaining of electrohypersensitivity after long term exposure to electromagnetic fields" Reviews on Environmental Health, vol. 32, no. 3, 2017, pp. 291-299. https://doi.org/10.1515/reveh-2017-0014',
  },
  {
    id: 2,
    link: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6513191/',
    logoSrc: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Studie2_1.webp?v=1675773651',
    logoAlt: 'Studie Biomolecules & Therapeutics',
    imageSrc: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Studie2_2.webp?v=1675773649',
    imageAlt: 'Studie Bild Gehirneffekt',
    text: '"Possible Effects of Radiofrequency Electromagnetic Field Exposure on Central Nerve System" untersucht die Auswirkungen elektronischer Geräte und drahtloser Kommunikationstechnologien auf die Gesellschaft und die wachsende Besorgnis über die potenziellen biologischen Auswirkungen elektromagnetischer Felder (EMFs), die von diesen Geräten erzeugt werden, insbesondere auf den menschlichen Körper. Die Internationale Agentur für Krebsforschung (IARC) hat HF-EMFs als potenziell krebserregend eingestuft, und es liegen Berichte über neurologische Wirkungen wie Kopfschmerzen und Schlafstörungen aufgrund einer HF-EMF-Exposition vor. Es wurden Studien zu den biologischen Auswirkungen einer HF-EMF-Exposition unter Verwendung von Zell- und Tiermodellen durchgeführt, aber es bedarf weiterer Forschung, um die Auswirkungen auf den Menschen zu bestimmen.',
    cite: '© 2019, The Korean Society of Applied Pharmacology, Kim JH, Lee JK, Kim HG, Kim KB, Kim HR. Possible Effects of Radiofrequency Electromagnetic Field Exposure on Central Nerve System. Biomol Ther (Seoul). 2019 May 1;27(3):265-275. doi: 10.4062/biomolther.2018.152. PMID: 30481957; PMCID: PMC6513191',
  },
  {
    id: 3,
    link: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7642138/',
    logoSrc: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Studie3_1.webp?v=1675773650',
    logoAlt: 'Logo Clinical and Experimental Pediatrics',
    imageSrc: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Studie3_2.webp?v=1675773650',
    imageAlt: 'Bild Zimmer Wlan Auswirkungen',
    text: 'Die meisten Kinder sind heutzutage künstlichen elektromagnetischen Feldern (EMFs) ausgesetzt, die von extrem niedrigen Frequenzen (ELFs) bis zu Radiofrequenzen (RFs) reichen können. Die Anfälligkeit eines sich entwickelnden Gehirns gegenüber elektromagnetischen Feldern hat zu wachsender Besorgnis bei Pflegekräften geführt. Die Auswirkungen von EMFs auf den Menschen umfassen Stimulation, thermische und nichtthermische, wobei letztere am wenigsten verstanden werden. Ein Hauptanliegen ist die Karzinogenität beim Menschen, wobei ELFs und RFs von der Internationalen Agentur für Krebsforschung als mögliche Humankarzinogene (Gruppe 2B) bewertet wurden, aber die Ansicht der Weltgesundheitsorganisation bleibt unklar.',
    cite: '© 2020 by The Korean Pediatric Society, Moon JH. Health effects of electromagnetic fields on children. Clin Exp Pediatr. 2020 Nov;63(11):422-428. doi: 10.3345/cep.2019.01494. Epub 2020 May 26. PMID: 32683815; PMCID: PMC7642138.',
  },
];

/**
 * @param {FooterProps}
 */
export function Footer({footer: footerPromise}) {
  return (
    <Suspense
      fallback={
        <FooterContent />
      }
    >
      <Await resolve={footerPromise}>
        {() => <FooterContent />}
      </Await>
    </Suspense>
  );
}

function FooterContent() {
  return (
    <footer className="footer">
      <FooterTop />
      <FooterStudies />
      <FooterDisclaimer />
      <FooterMenu />
    </footer>
  );
}

function FooterTop() {
  return (
    <div className="footer-top">
      <div className="footer-products">
        <p className="footer-heading">Produkte</p>
        <ul>
          {PRODUCT_LINKS.map(({to, label}) => (
            <li key={to}>
              <Link to={to}>{label}</Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="footer-newsletter">
        <p className="footer-heading">
          Erhalte die neusten Beiträge und Angebote von Qi Blanco®
        </p>
        <NewsletterForm />
      </div>
    </div>
  );
}

function NewsletterForm() {
  useEffect(() => {
    const id = 'ac-embed-15';
    if (document.getElementById(id)) return;
    const script = document.createElement('script');
    script.id = id;
    script.src = 'https://qiblanco.activehosted.com/f/embed.php?id=15';
    script.type = 'text/javascript';
    script.charset = 'utf-8';
    document.body.appendChild(script);
  }, []);

  return (
    <>
      {/* Overrides fuer das ActiveCampaign-Embed. Das Embed vergibt eine
          dynamische Form-ID (#_form_XXXX_) und setzt darauf per !important
          background:white + padding sowie einen Serifen-Font-Fallback. Wir
          ankern ueber die stabile Wrapper-ID #qi-newsletter, um diese mit
          hoeherer Spezifitaet zu ueberschreiben (transparenter Kasten,
          Open-Sans-Felder/Button, abgerundete Ecken). */}
      <style>{`
        .footer #qi-newsletter form._form_15 {
          background: transparent !important;
          padding: 0 !important;
          border: 0 !important;
          box-shadow: none !important;
        }
        .footer #qi-newsletter input[type='text'],
        .footer #qi-newsletter input[type='email'],
        .footer #qi-newsletter button,
        .footer #qi-newsletter ._submit {
          font-family: 'Open Sans Variable', 'Open Sans', sans-serif !important;
          border-radius: 10px !important;
        }
      `}</style>
      <div className="_form_15" id="qi-newsletter" />
    </>
  );
}

function FooterStudies() {
  const [current, setCurrent] = useState(0);

  function prev() {
    setCurrent((c) => (c === 0 ? STUDIES.length - 1 : c - 1));
  }
  function next() {
    setCurrent((c) => (c === STUDIES.length - 1 ? 0 : c + 1));
  }

  const study = STUDIES[current];

  return (
    <div className="footer-studies">
      <div className="footer-inner">
        <h3>Das &ldquo;International EMF Project&rdquo; der Weltgesundheitsorganisation [WHO]:</h3>
        <p>
          &ldquo;Mögliche gesundheitliche Auswirkungen der Exposition gegenüber
          statischen und zeitveränderlichen elektrischen und magnetischen
          Feldern müssen wissenschaftlich geklärt werden. Elektromagnetische
          Felder aller Frequenzen stellen eine der häufigsten und am
          schnellsten wachsenden Umwelteinflüsse dar, über die sich
          Befürchtungen und Spekulationen verbreiten. Alle
          Bevölkerungsgruppen der Welt sind heute in unterschiedlichem Maße
          EMF-Exposition ausgesetzt, und die Werte werden mit fortschreitender
          Technologie weiter zunehmen. Daher könnte selbst eine kleine
          gesundheitliche Folge einer EMF-Exposition große Auswirkungen auf
          die öffentliche Gesundheit haben.&rdquo;{' '}
          <a
            href="https://www.who.int/initiatives/the-international-emf-project"
            target="_blank"
            rel="noopener noreferrer"
          >
            Erfahre mehr über die Initiative hier.
          </a>
        </p>

        <h4 className="footer-studies__subtitle">Studien zu den Auswirkungen von EMF:</h4>

        <div className="footer-study">
          <div className="footer-study__logo">
            <a href={study.link} target="_blank" rel="noopener noreferrer">
              <img src={study.logoSrc} alt={study.logoAlt} loading="lazy" />
            </a>
          </div>
          <div className="footer-study__body">
            <p>{study.text}</p>
            <cite className="footer-study__cite">{study.cite}</cite>
          </div>
          <div className="footer-study__image">
            <img src={study.imageSrc} alt={study.imageAlt} loading="lazy" />
          </div>
        </div>

        <div className="footer-studies__controls">
          <button className="footer-studies__btn" onClick={prev} aria-label="Zurück">
            ←
          </button>
          <div className="footer-studies__dots">
            {STUDIES.map((study, i) => (
              <button
                key={study.id}
                className={`footer-studies__dot${i === current ? ' active' : ''}`}
                onClick={() => setCurrent(i)}
                aria-label={`Studie ${i + 1}`}
              />
            ))}
          </div>
          <button className="footer-studies__btn" onClick={next} aria-label="Weiter">
            →
          </button>
        </div>
      </div>
    </div>
  );
}

// Der Disclaimer-Absatz und seine Überschrift standen bis 2026-08-24 hier
// (Christian-Entscheid: "Der Disclaimer ist nicht notwendig. Es war Vorsicht,
// ist aber nicht notwendig."). Der Container bleibt, weil er die nummerierten
// Pflicht-Fußnoten 1.-3. trägt, auf die hochgestellte Verweise im Shop zeigen —
// er ist trotz seines Klassennamens nicht der Disclaimer, sondern deren Träger.
function FooterDisclaimer() {
  return (
    <div className="footer-disclaimer">
      <div className="footer-inner">
        <p>
          1. Gilt für Lieferungen in folgendes Land: Deutschland. Lieferzeiten
          für andere Länder und Informationen zur Berechnung des Liefertermins
          hier einsehen:{' '}
          <Link to="/policies/shipping-policy">
            Liefer- und Zahlungsbedingungen
          </Link>
        </p>
        <p>
          2. Die Möglichkeit der Ratenzahlung wird durch unsere externen Partner
          PayPal und Klarna angeboten und abgewickelt. Eine Genehmigung für
          Ratenzahlungen ist nicht garantiert und erfordert eine separate
          Überprüfung durch den jeweiligen Anbieter. Bei Fragen zu
          Ratenzahlungen kontaktieren Sie bitte direkt Klarna oder PayPal.
          Ratenzahlung aktuell nur für Kunden mit deutschem Wohnsitz möglich.
        </p>
        <p>3. Bezahlmethoden</p>
        <PaymentIcons />
      </div>
    </div>
  );
}

function PaymentIcons() {
  return (
    <ul className="footer-payments">
      <li>
        <svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="American Express" viewBox="0 0 38 24" width="38" height="24">
          <path fill="#000" d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3Z" opacity=".07"/>
          <path fill="#006FCF" d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32Z"/>
          <path fill="#FFF" d="M22.012 19.936v-8.421L37 11.528v2.326l-1.732 1.852L37 17.573v2.375h-2.766l-1.47-1.622-1.46 1.628-9.292-.02Z"/>
          <path fill="#006FCF" d="M23.013 19.012v-6.57h5.572v1.513h-3.768v1.028h3.678v1.488h-3.678v1.01h3.768v1.531h-5.572Z"/>
          <path fill="#006FCF" d="m28.557 19.012 3.083-3.289-3.083-3.282h2.386l1.884 2.083 1.89-2.082H37v.051l-3.017 3.23L37 18.92v.093h-2.307l-1.917-2.103-1.898 2.104h-2.321Z"/>
          <path fill="#FFF" d="M22.71 4.04h3.614l1.269 2.881V4.04h4.46l.77 2.159.771-2.159H37v8.421H19l3.71-8.421Z"/>
          <path fill="#006FCF" d="m23.395 4.955-2.916 6.566h2l.55-1.315h2.98l.55 1.315h2.05l-2.904-6.566h-2.31Zm.25 3.777.875-2.09.873 2.09h-1.748Z"/>
          <path fill="#006FCF" d="M28.581 11.52V4.953l2.811.01L32.84 9l1.456-4.046H37v6.565l-1.74.016v-4.51l-1.644 4.494h-1.59L30.35 7.01v4.51h-1.768Z"/>
        </svg>
      </li>
      <li>
        <svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Apple Pay" viewBox="0 0 165.521 105.965" width="50" height="32">
          <path fill="#000" d="M150.698 0H14.823c-.566 0-1.133 0-1.698.003-.477.004-.953.009-1.43.022-1.039.028-2.087.09-3.113.274a10.51 10.51 0 0 0-2.958.975 9.932 9.932 0 0 0-4.35 4.35 10.463 10.463 0 0 0-.975 2.96C.113 9.611.052 10.658.024 11.696a70.22 70.22 0 0 0-.022 1.43C0 13.69 0 14.256 0 14.823v76.318c0 .567 0 1.132.002 1.699.003.476.009.953.022 1.43.028 1.036.09 2.084.275 3.11a10.46 10.46 0 0 0 .974 2.96 9.897 9.897 0 0 0 1.83 2.52 9.874 9.874 0 0 0 2.52 1.83c.947.483 1.917.79 2.96.977 1.025.183 2.073.245 3.112.273.477.011.953.017 1.43.02.565.004 1.132.004 1.698.004h135.875c.565 0 1.132 0 1.697-.004.476-.002.952-.009 1.431-.02 1.037-.028 2.085-.09 3.113-.273a10.478 10.478 0 0 0 2.958-.977 9.955 9.955 0 0 0 4.35-4.35c.483-.947.789-1.917.974-2.96.186-1.026.246-2.074.274-3.11.013-.477.02-.954.022-1.43.004-.567.004-1.132.004-1.699V14.824c0-.567 0-1.133-.004-1.699a63.067 63.067 0 0 0-.022-1.429c-.028-1.038-.088-2.085-.274-3.112a10.4 10.4 0 0 0-.974-2.96 9.94 9.94 0 0 0-4.35-4.35A10.52 10.52 0 0 0 156.939.3c-1.028-.185-2.076-.246-3.113-.274a71.417 71.417 0 0 0-1.431-.022C151.83 0 151.263 0 150.698 0z"/>
          <path fill="#FFF" d="M150.698 3.532l1.672.003c.452.003.905.008 1.36.02.793.022 1.719.065 2.583.22.75.135 1.38.34 1.984.648a6.392 6.392 0 0 1 2.804 2.807c.306.6.51 1.226.645 1.983.154.854.197 1.783.218 2.58.013.45.019.9.02 1.36.005.557.005 1.113.005 1.671v76.318c0 .558 0 1.114-.004 1.682-.002.45-.008.9-.02 1.35-.022.796-.065 1.725-.221 2.589a6.855 6.855 0 0 1-.645 1.975 6.397 6.397 0 0 1-2.808 2.807c-.6.306-1.228.511-1.971.645-.881.157-1.847.2-2.574.22-.457.01-.912.017-1.379.019-.555.004-1.113.004-1.669.004H14.801c-.55 0-1.1 0-1.66-.004a74.993 74.993 0 0 1-1.35-.018c-.744-.02-1.71-.064-2.584-.22a6.938 6.938 0 0 1-1.986-.65 6.337 6.337 0 0 1-1.622-1.18 6.355 6.355 0 0 1-1.178-1.623 6.935 6.935 0 0 1-.646-1.985c-.156-.863-.2-1.788-.22-2.578a66.088 66.088 0 0 1-.02-1.355l-.003-1.327V14.474l.002-1.325a66.7 66.7 0 0 1 .02-1.357c.022-.792.065-1.717.222-2.587a6.924 6.924 0 0 1 .646-1.981c.304-.598.7-1.144 1.18-1.623a6.386 6.386 0 0 1 1.624-1.18 6.96 6.96 0 0 1 1.98-.646c.865-.155 1.792-.198 2.586-.22.452-.012.905-.017 1.354-.02l1.677-.003h135.875"/>
          <path fill="#000" d="M43.508 35.77c1.404-1.755 2.356-4.112 2.105-6.52-2.054.102-4.56 1.355-6.012 3.112-1.303 1.504-2.456 3.959-2.156 6.266 2.306.2 4.61-1.152 6.063-2.858M45.587 39.079c-3.35-.2-6.196 1.9-7.795 1.9-1.6 0-4.049-1.8-6.698-1.751-3.447.05-6.645 2-8.395 5.1-3.598 6.2-.95 15.4 2.55 20.45 1.699 2.5 3.747 5.25 6.445 5.151 2.55-.1 3.549-1.65 6.647-1.65 3.097 0 3.997 1.65 6.696 1.6 2.798-.05 4.548-2.5 6.247-5 1.95-2.85 2.747-5.6 2.797-5.75-.05-.05-5.396-2.101-5.446-8.251-.05-5.15 4.198-7.6 4.398-7.751-2.399-3.548-6.147-3.948-7.447-4.048"/>
          <path fill="#000" d="M78.973 32.11c7.278 0 12.347 5.017 12.347 12.321 0 7.33-5.173 12.373-12.529 12.373h-8.058V69.62h-5.822V32.11h14.062zm-8.24 19.807h6.68c5.07 0 7.954-2.729 7.954-7.46 0-4.73-2.885-7.434-7.928-7.434h-6.706v14.894zM92.764 61.847c0-4.809 3.665-7.564 10.423-7.98l7.252-.442v-2.08c0-3.04-2.001-4.704-5.562-4.704-2.938 0-5.07 1.507-5.51 3.82h-5.252c.157-4.86 4.731-8.395 10.918-8.395 6.654 0 10.995 3.483 10.995 8.89v18.663h-5.38v-4.497h-.13c-1.534 2.937-4.914 4.782-8.579 4.782-5.406 0-9.175-3.222-9.175-8.057zm17.675-2.417v-2.106l-6.472.416c-3.64.234-5.536 1.585-5.536 3.95 0 2.288 1.975 3.77 5.068 3.77 3.95 0 6.94-2.522 6.94-6.03zM120.975 79.652v-4.496c.364.051 1.247.103 1.715.103 2.573 0 4.029-1.09 4.913-3.899l.52-1.663-9.852-27.293h6.082l6.863 22.146h.13l6.862-22.146h5.927l-10.216 28.67c-2.34 6.577-5.017 8.735-10.683 8.735-.442 0-1.872-.052-2.261-.157z"/>
        </svg>
      </li>
      <li>
        <svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Google Pay" viewBox="0 0 38 24" width="38" height="24">
          <path d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z" fill="#000" opacity=".07"/>
          <path d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32" fill="#FFF"/>
          <path d="M18.093 11.284c0-.308-.024-.616-.073-.92h-4.29v1.747h2.451a2.096 2.096 0 0 1-.9 1.373v1.134h1.464a4.433 4.433 0 0 0 1.348-3.334z" fill="#4285F4"/>
          <path d="M9.629 15.721a4.352 4.352 0 0 0 3.01-1.097l-1.466-1.14a2.752 2.752 0 0 1-4.094-1.44H5.577v1.17a4.53 4.53 0 0 0 4.052 2.507z" fill="#34A853"/>
          <path d="M7.079 12.05a2.709 2.709 0 0 1 0-1.735v-1.17H5.577a4.505 4.505 0 0 0 0 4.075l1.502-1.17z" fill="#FBBC04"/>
          <path d="M9.629 8.44a2.452 2.452 0 0 1 1.74.68l1.3-1.293a4.37 4.37 0 0 0-3.065-1.183 4.53 4.53 0 0 0-4.027 2.5l1.502 1.171a2.715 2.715 0 0 1 2.55-1.875z" fill="#EA4335"/>
          <path d="M18.093 11.976v3.2h-1.018v-7.9h2.691a2.447 2.447 0 0 1 1.747.692 2.28 2.28 0 0 1 .11 3.224l-.11.116c-.47.447-1.098.69-1.747.674l-1.673-.006zm0-3.732v2.788h1.698c.377.012.741-.135 1.005-.404a1.391 1.391 0 0 0-1.005-2.354l-1.698-.03z" fill="#5F6368"/>
          <path d="M24.193 9.597c.65-.03 1.286.188 1.778.613.445.43.682 1.03.65 1.649v3.334h-.969v-.766h-.049a1.93 1.93 0 0 1-1.673.931 2.17 2.17 0 0 1-1.496-.533 1.667 1.667 0 0 1-.613-1.324 1.606 1.606 0 0 1 .613-1.336 2.746 2.746 0 0 1 1.698-.515c.517-.02 1.03.093 1.49.331v-.208a1.134 1.134 0 0 0-.417-.901 1.416 1.416 0 0 0-.98-.368 1.545 1.545 0 0 0-1.319.717l-.895-.564a2.488 2.488 0 0 1 2.182-1.06zm-.577 3.923a.79.79 0 0 0 .337.662c.223.176.5.269.785.263.429-.001.84-.17 1.146-.472.305-.286.478-.685.478-1.103a2.047 2.047 0 0 0-1.324-.374 1.716 1.716 0 0 0-1.03.294.883.883 0 0 0-.392.73z" fill="#5F6368"/>
          <path d="M30.62 9.597l-3.39 7.79h-1.048l1.281-2.728-2.224-5.062h1.103l1.612 3.885 1.569-3.885h1.097z" fill="#5F6368"/>
        </svg>
      </li>
      <li>
        <svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Klarna" viewBox="0 0 38 24" width="38" height="24" fill="none">
          <rect width="38" height="24" rx="2" fill="#FFA8CD"/>
          <rect x=".5" y=".5" width="37" height="23" rx="1.5" stroke="#000" strokeOpacity=".07"/>
          <path d="M30.62 14.755c-.662 0-1.179-.554-1.179-1.226 0-.673.517-1.226 1.18-1.226.663 0 1.18.553 1.18 1.226 0 .672-.517 1.226-1.18 1.226zm-.33 1.295c.565 0 1.286-.217 1.686-1.068l.04.02c-.176.465-.176.742-.176.81v.11h1.423v-4.786H31.84v.109c0 .069 0 .346.175.81l-.039.02c-.4-.85-1.121-1.068-1.687-1.068-1.355 0-2.31 1.088-2.31 2.522 0 1.433.955 2.521 2.31 2.521zm-4.788-5.043c-.643 0-1.15.228-1.56 1.068l-.039-.02c.175-.464.175-.741.175-.81v-.11h-1.423v4.787h1.462V13.4c0-.662.38-1.078.995-1.078.614 0 .917.356.917 1.068v2.532h1.462v-3.046c0-1.088-.838-1.869-1.989-1.869zm-4.963 1.068l-.039-.02c.176-.464.176-.741.176-.81v-.11h-1.424v4.787h1.463l.01-2.304c0-.673.35-1.078.926-1.078.156 0 .282.02.429.06v-1.464c-.644-.139-1.22.109-1.54.94zm-4.65 2.68c-.664 0-1.18-.554-1.18-1.226 0-.673.516-1.226 1.18-1.226.662 0 1.179.553 1.179 1.226 0 .672-.517 1.226-1.18 1.226zm-.332 1.295c.565 0 1.287-.217 1.687-1.068l.038.02c-.175.465-.175.742-.175.81v.11h1.424v-4.786h-1.424v.109c0 .069 0 .346.175.81l-.038.02c-.4-.85-1.122-1.068-1.687-1.068-1.356 0-2.311 1.088-2.311 2.522 0 1.433.955 2.521 2.31 2.521zm-4.349-.128h1.463V9h-1.463v6.922zM10.136 9H8.644c0 1.236-.751 2.343-1.892 3.134l-.448.317V9h-1.55v6.922h1.55V12.49l2.564 3.43h1.892L8.293 12.64c1.121-.82 1.852-2.096 1.843-3.639z" fill="#0B051D"/>
        </svg>
      </li>
      <li>
        <svg viewBox="0 0 38 24" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Maestro" width="38" height="24">
          <path opacity=".07" d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z"/>
          <path fill="#fff" d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32"/>
          <circle fill="#EB001B" cx="15" cy="12" r="7"/>
          <circle fill="#00A2E5" cx="23" cy="12" r="7"/>
          <path fill="#7375CF" d="M22 12c0-2.4-1.2-4.5-3-5.7-1.8 1.3-3 3.4-3 5.7s1.2 4.5 3 5.7c1.8-1.2 3-3.3 3-5.7z"/>
        </svg>
      </li>
      <li>
        <svg viewBox="0 0 38 24" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Mastercard" width="38" height="24">
          <path opacity=".07" d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z"/>
          <path fill="#fff" d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32"/>
          <circle fill="#EB001B" cx="15" cy="12" r="7"/>
          <circle fill="#F79E1B" cx="23" cy="12" r="7"/>
          <path fill="#FF5F00" d="M22 12c0-2.4-1.2-4.5-3-5.7-1.8 1.3-3 3.4-3 5.7s1.2 4.5 3 5.7c1.8-1.2 3-3.3 3-5.7z"/>
        </svg>
      </li>
      <li>
        <svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Visa" viewBox="0 0 38 24" width="38" height="24">
          <path opacity=".07" d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z"/>
          <path fill="#fff" d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32"/>
          <path d="M28.3 10.1H28c-.4 1-.7 1.5-1 3h1.9c-.3-1.5-.3-2.2-.6-3zm2.9 5.9h-1.7c-.1 0-.1 0-.2-.1l-.2-.9-.1-.2h-2.4c-.1 0-.2 0-.2.2l-.3.9c0 .1-.1.1-.1.1h-2.1l.2-.5L27 8.7c0-.5.3-.7.8-.7h1.5c.1 0 .2 0 .2.2l1.4 6.5c.1.4.2.7.2 1.1.1.1.1.1.1.2zm-13.4-.3l.4-1.8c.1 0 .2.1.2.1.7.3 1.4.5 2.1.4.2 0 .5-.1.7-.2.5-.2.5-.7.1-1.1-.2-.2-.5-.3-.8-.5-.4-.2-.8-.4-1.1-.7-1.2-1-.8-2.4-.1-3.1.6-.4.9-.8 1.7-.8 1.2 0 2.5 0 3.1.2h.1c-.1.6-.2 1.1-.4 1.7-.5-.2-1-.4-1.5-.4-.3 0-.6 0-.9.1-.2 0-.3.1-.4.2-.2.2-.2.5 0 .7l.5.4c.4.2.8.4 1.1.6.5.3 1 .8 1.1 1.4.2.9-.1 1.7-.9 2.3-.5.4-.7.6-1.4.6-1.4 0-2.5.1-3.4-.2-.1.2-.1.2-.2.1zm-3.5.3c.1-.7.1-.7.2-1 .5-2.2 1-4.5 1.4-6.7.1-.2.1-.3.3-.3H18c-.2 1-.4 1.9-.7 2.9-.2.9-.4 1.7-.6 2.6-.2.8-.3 1.6-.5 2.5h-2.3zm-1-9.5l-2.2 9.5H9.3L7.1 6.5h-.1c-.1.1-.2.1-.3.1H4.7c-.1 0-.2.1-.3.1-.1 0-.1 0-.1.1.1.4.1.8.2 1.2 0 .1.1.2.2.2.6.1 1.2.3 1.7.5l2.2 7.4H11l3.8-9.4h-1.5z" fill="#142688"/>
        </svg>
      </li>
      <li>
        <svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="PayPal" viewBox="0 0 38 24" width="38" height="24">
          <path opacity=".07" d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z"/>
          <path fill="#fff" d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32"/>
          <path fill="#003087" d="M23.9 8.3c.2-1 0-1.7-.6-2.3-.6-.7-1.7-1-3.1-1h-4.1c-.3 0-.5.2-.6.5L14 15.6c0 .2.1.4.3.4H17l.4-3.4 1.8-2.2 4.7-2.1z"/>
          <path fill="#3086C8" d="M23.9 8.3l-.2.2c-.5 2.8-2.2 3.8-4.6 3.8H18c-.3 0-.5.2-.6.5l-.6 3.9-.2 1c0 .2.1.4.3.4H19c.3 0 .5-.2.5-.4v-.1l.4-2.4v-.1c0-.2.3-.4.5-.4h.3c2.1 0 3.7-.8 4.1-3.2.2-1 .1-1.8-.4-2.4-.1-.5-.3-.7-.5-.8z"/>
          <path fill="#012169" d="M23.3 8.1c-.1-.1-.2-.1-.3-.1-.1 0-.2 0-.3-.1-.3-.1-.7-.1-1.1-.1h-3c-.1 0-.2 0-.2.1-.2.1-.3.2-.3.4l-.7 4.4v.1c0-.3.3-.5.6-.5h1.3c2.4 0 4.1-1 4.6-3.8v-.2c-.1-.1-.3-.1-.6-.2z"/>
        </svg>
      </li>
    </ul>
  );
}

const LEGAL_LINKS = [
  // „Über uns" steht bewusst VOR dem Impressum und nicht darin: das Impressum
  // ist die Pflichtangabe, die Über-uns-Seite ist die Antwort auf „wer steckt
  // dahinter". Sie hängt hier, weil der Fußbereich die einzige Navigation ist,
  // die auf JEDER Seite liegt — eine Über-uns-Seite, die nur die Startseite
  // verlinkt, ist für den Besucher der Unterseiten nicht vorhanden.
  // (Segment s06, Backlog-Posten B-10(a).)
  {to: '/pages/ueber-uns', label: 'Über uns'},
  // „Häufige Fragen" steht hier oben bei „Über uns" und NICHT zwischen
  // Impressum/Datenschutz/AGB: das sind Pflichtangaben, die FAQ ist eine
  // Hilfe-Fläche. Wer eine Frage hat, sucht sie nicht im Rechtsblock.
  // Die Wortwahl ist bewusst dieselbe wie auf /pages/support („stehen die
  // häufigen Fragen hier") — zwei Namen für dieselbe Seite kosten den
  // Besucher den Wiedererkennungswert.
  // WARUM DER FUSSBEREICH: /pages/faq war seit dem 2026-09-02 erreichbar und
  // in der Sitemap, aber aus dem Fußbereich NICHT verlinkt — sie hing allein
  // an /pages/support. Der Fußbereich ist die einzige Navigation auf JEDER
  // Seite. (Job 20260902-faq-footer-link-und-fuenf-formate-belege.)
  {to: '/pages/faq', label: 'Häufige Fragen'},
  {to: '/pages/impressum', label: 'Impressum'},
  {to: '/pages/datenschutz', label: 'Datenschutz'},
  {to: '/pages/agb', label: 'AGB'},
  {to: '/widerruf', label: 'Vertrag widerrufen'},
];

function FooterMenu() {
  return (
    <nav className="footer-menu" role="navigation">
      {LEGAL_LINKS.map(({to, label}) => (
        <NavLink
          end
          key={to}
          prefetch="intent"
          style={activeLinkStyle}
          to={to}
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

function activeLinkStyle({isActive, isPending}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'grey' : 'white',
  };
}

/** @typedef {Object} FooterProps
 * @property {Promise<FooterQuery|null>} footer
 * @property {HeaderQuery} header
 * @property {string} publicStoreDomain
 */

/** @typedef {import('storefrontapi.generated').FooterQuery} FooterQuery */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
