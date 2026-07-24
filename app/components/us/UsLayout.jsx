import {Suspense} from 'react';
import {Await} from 'react-router';
import {Aside} from '~/components/Aside';
import {CartMain} from '~/components/CartMain';
import {UsHeader} from '~/components/us/UsHeader';
import {UsFooter} from '~/components/us/UsFooter';

/*
 * US-Rahmen (Vorabversion /en-us — Job 20260720-usa-seite-auf-dach-basis-
 * vorabversion s05, Konzept 1a Kap. 2.6/3): ADDITIVE Layout-Schicht fuer den
 * EN-Routen-Block. Das DACH-PageLayout bleibt unangetastet; root.jsx waehlt
 * dieses Layout NUR, wenn eine Route `handle.layout === 'us'` exportiert
 * (fail-closed: ohne handle rendert alles wie bisher).
 *
 * Header/Footer verlinken AUSSCHLIESSLICH auf existierende /en-us-Routen
 * (+ die geteilten Commerce-Systemrouten /cart|/account). Der Cart-Aside ist
 * der geteilte Commerce-Bestand (DACH-Store, Markets-USD) — seine deutschen
 * Texte/EUR-Anzeige fuer DE-Betrachter sind eine BEKANNTE offene Flanke der
 * Vorab-Phase (EN-Checkout-Locale = Christian-Handgriff V2, Konzept 1a E6).
 */
export function UsLayout({cart, children = null}) {
  return (
    <Aside.Provider>
      <Aside type="cart" heading="Cart">
        <Suspense fallback={<p>Loading cart ...</p>}>
          <Await resolve={cart}>
            {(resolvedCart) => <CartMain cart={resolvedCart} layout="aside" />}
          </Await>
        </Suspense>
      </Aside>
      <div className="background-divs creme"></div>
      <div className="background-divs blue"></div>
      <div className="background-divs creme-2"></div>
      <div className="background-divs blue-2"></div>
      <div className="background-divs neutral"></div>
      <div className="background-divs gold"></div>
      <UsHeader cart={cart} />
      <main>{children}</main>
      <UsFooter />
    </Aside.Provider>
  );
}
