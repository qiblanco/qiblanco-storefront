import {useEffect, useRef} from 'react';
import {StarRating} from '~/components/reusables/StarRating';
import {useGoogleRating} from '~/lib/googleRating';

export function ReputonWidget() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Reputon widget expects a global Shopify object (present on native
    // Shopify storefronts but missing in Hydrogen). Provide a minimal shim.
    if (!window.Shopify) {
      window.Shopify = {
        shop: 'qi-blanco.myshopify.com',
        locale: 'de',
        currency: {active: 'EUR', rate: '1.0'},
      };
    }

    // Create the widget div
    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'reputon-google-reviews-widget';
    widgetDiv.setAttribute('data-type', 'carousel');
    widgetDiv.setAttribute('data-content-index', '1');
    widgetDiv.setAttribute('data-theme', 'light');
    widgetDiv.setAttribute('data-autoscroll', 'true');
    widgetDiv.setAttribute('data-review-photos-type', 'small');
    widgetDiv.setAttribute('data-write-review', 'true');
    widgetDiv.setAttribute('data-fixed-reviews-height', 'false');
    widgetDiv.setAttribute('data-delay', '5');
    widgetDiv.setAttribute('data-transparency', '1');
    widgetDiv.setAttribute('data-font', 'default');
    widgetDiv.setAttribute('data-fluid-scrolling', 'false');
    widgetDiv.setAttribute('data-has-shadow', 'false');
    widgetDiv.setAttribute('data-solid-shadow', 'false');
    widgetDiv.setAttribute('data-rating-type', 'stars'); 
    widgetDiv.setAttribute('data-header-type', 'none');
    widgetDiv.setAttribute('data-variant', 'carousel');
    container.appendChild(widgetDiv);

    // Remove old script + globals so a fresh script re-initializes
    const oldScript = document.querySelector(
      'script[src*="cdn.grw.reputon.com"]',
    );
    if (oldScript) oldScript.remove();
    if (window.GRW) delete window.GRW;
    if (window.grw) delete window.grw;

    const script = document.createElement('script');
    script.src =
      'https://cdn.grw.reputon.com/assets/widget.js?shop=qi-blanco.myshopify.com&t=' +
      Date.now();
    document.body.appendChild(script);

    return () => {
      container.innerHTML = '';
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  return (
    <>
      <div ref={containerRef} />
      <GoogleRatingBadge />
    </>
  );
}

function GoogleRatingBadge() {
  const g = useGoogleRating();
  return (
    <a
      href={g.url}
      target="_blank"
      rel="noopener noreferrer"
      className="google-rating-badge"
      aria-label={`${g.komma} von 5 Sternen aus ${g.total} Google-Rezensionen von Qi Blanco ansehen`}
    >
      <img
        className="google-rating-badge__logo"
        src="https://lh3.googleusercontent.com/a-/ALV-UjXLeredYrnnfrvaFQ0ffKGgx-Ardf6CLqWTy4t4Tt7pn50g4MI"
        alt="Qi Blanco"
        width="48"
        height="48"
      />
      <div className="google-rating-badge__content">
        <div className="google-rating-badge__score">
          <span className="google-rating-badge__number">{g.komma}</span>
          <span className="google-rating-badge__stars">
            <StarRating value={g.value} size={20} />
          </span>
        </div>
        <div className="google-rating-badge__powered">
          {g.total} Bewertungen · <strong>Google</strong>
        </div>
      </div>
    </a>
  );
}
