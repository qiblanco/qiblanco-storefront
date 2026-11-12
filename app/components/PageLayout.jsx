import {Await, Link, useLocation, useMatches} from 'react-router';
import {Suspense, useId} from 'react';
import {Aside} from '~/components/Aside';
import {Footer} from '~/components/Footer';
import {WissenVertrauenWeiter} from '~/components/reusables/WissenVertrauenWeiter';
import {
  BfFunnelKopf,
  Header,
  HeaderMenu,
  QiAlphaFunnelKopf,
  istQiAlphaFunnelPfad,
} from '~/components/Header';
import {CartMain} from '~/components/CartMain';
import {istBfFunnelSeite} from '~/components/black-friday-2026/bf-funnel';
import {
  SEARCH_ENDPOINT,
  SearchFormPredictive,
} from '~/components/SearchFormPredictive';
import {SearchResultsPredictive} from '~/components/SearchResultsPredictive';

/**
 * @param {PageLayoutProps}
 */
export function PageLayout({
  cart,
  children = null,
  footer,
  header,
  isLoggedIn,
  publicStoreDomain,
}) {
  const {pathname} = useLocation();
  const matches = useMatches();
  // Black-Friday-Funnel (Elina EL-20261112-5f5fab2e): eine Route, die das
  // Merkmal bfFunnel trägt (handle oder Loaderdaten, black-friday-2026/bf-funnel.js),
  // rendert wie Qi Alpha ohne Menü und Fuß. Ohne Merkmal bleibt jede Seite
  // unverändert.
  const bfFunnel = istBfFunnelSeite(matches);
  // Qi-Alpha-Kaufseite: eigene enge Funnel-Seite (Begründung bei
  // QiAlphaFunnelLayout unten). Aus useLocation, damit es auch bei
  // Client-Navigation stimmt.
  if (istQiAlphaFunnelPfad(pathname) || bfFunnel) {
    return (
      <QiAlphaFunnelLayout cart={cart} isLoggedIn={isLoggedIn} bf={bfFunnel}>
        {children}
      </QiAlphaFunnelLayout>
    );
  }
  return (
    <Aside.Provider>
      <CartAside cart={cart} />
      <SearchAside />
      <MobileMenuAside header={header} publicStoreDomain={publicStoreDomain} />
      {header && (
        <Header
          header={header}
          cart={cart}
          isLoggedIn={isLoggedIn}
          publicStoreDomain={publicStoreDomain}
        />
      )}
      <div className="background-divs creme"></div>
      <div className="background-divs blue"></div>
      <div className="background-divs creme-2"></div>
      <div className="background-divs blue-2"></div>
      <div className="background-divs neutral"></div>
      <div className="background-divs gold"></div>
      <main>{children}</main>
      {/* Leiste „Weiterlesen“ nur auf Wissens- und Vertrauensseiten, außerhalb
          von <main> (Begründung: WissenVertrauenWeiter.jsx). */}
      <WissenVertrauenWeiter />
      <Footer
        footer={footer}
        header={header}
        publicStoreDomain={publicStoreDomain}
      />
    </Aside.Provider>
  );
}

/**
 * QI-ALPHA-KAUFSEITE ALS ENGE FUNNEL-SEITE (Christian 28.10.2026 Z13: „von
 * dieser Produktseite kommt man nirgendwo anders dahin. Außer in den
 * Warenkorb. Das ist eine richtig enge Funnel-Seite“; Z17: „die shopseite
 * hört auch da auf, kein footer mehr“). Nur der eigene Kopf (Konto,
 * Warenkorb) und die Warenkorb-Schublade; kein Hauskopf mit Band und Menü,
 * keine Menü- und Such-Schublade, keine Weiterlesen-Leiste, kein Fuß, keine
 * Hintergrund-Verläufe des Hauses. AI Anna bleibt (root.jsx, unabhängig vom
 * Layout), ebenso alle Tracking-Bausteine (root.jsx) und cart_viewed
 * (CartBadge im Kopf). Stil: app/styles/qi-alpha-funnel-kopf.css.
 * @param {Pick<PageLayoutProps, 'cart' | 'isLoggedIn' | 'children'> & {bf?: boolean}}
 */
function QiAlphaFunnelLayout({cart, children = null, isLoggedIn, bf = false}) {
  // bf: Black-Friday-Funnel, derselbe Rahmen mit der Marke „Qi Blanco“ ohne Link
  // (BfFunnelKopf, Elina EL-20261112-5f5fab2e).
  return (
    <Aside.Provider>
      <CartAside cart={cart} />
      {bf ? (
        <BfFunnelKopf cart={cart} isLoggedIn={isLoggedIn} />
      ) : (
        <QiAlphaFunnelKopf cart={cart} isLoggedIn={isLoggedIn} />
      )}
      <main data-qa-funnel="">{children}</main>
    </Aside.Provider>
  );
}

/**
 * @param {{cart: PageLayoutProps['cart']}}
 */
function CartAside({cart}) {
  return (
    <Aside type="cart" heading="Warenkorb">
      <Suspense fallback={<p>Warenkorb wird geladen …</p>}>
        <Await resolve={cart}>
          {(cart) => {
            return <CartMain cart={cart} layout="aside" />;
          }}
        </Await>
      </Suspense>
    </Aside>
  );
}

function SearchAside() {
  const queriesDatalistId = useId();
  return (
    <Aside type="search" heading="Suche">
      <div className="predictive-search">
        <br />
        <SearchFormPredictive>
          {({fetchResults, goToSearch, inputRef}) => (
            <>
              <input
                name="q"
                onChange={fetchResults}
                onFocus={fetchResults}
                placeholder="Suchen"
                ref={inputRef}
                type="search"
                list={queriesDatalistId}
              />
              &nbsp;
              <button onClick={goToSearch}>Suchen</button>
            </>
          )}
        </SearchFormPredictive>

        <SearchResultsPredictive>
          {({items, total, term, state, closeSearch}) => {
            const {articles, collections, pages, products, queries} = items;

            if (state === 'loading' && term.current) {
              return <div>Wird geladen …</div>;
            }

            if (!total) {
              return <SearchResultsPredictive.Empty term={term} />;
            }

            return (
              <>
                <SearchResultsPredictive.Queries
                  queries={queries}
                  queriesDatalistId={queriesDatalistId}
                />
                <SearchResultsPredictive.Products
                  products={products}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Collections
                  collections={collections}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Pages
                  pages={pages}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Articles
                  articles={articles}
                  closeSearch={closeSearch}
                  term={term}
                />
                {term.current && total ? (
                  <Link
                    onClick={closeSearch}
                    to={`${SEARCH_ENDPOINT}?q=${term.current}`}
                  >
                    <p>
                      View all results for <q>{term.current}</q>
                      &nbsp; →
                    </p>
                  </Link>
                ) : null}
              </>
            );
          }}
        </SearchResultsPredictive>
      </div>
    </Aside>
  );
}

/**
 * @param {{
 *   header: PageLayoutProps['header'];
 *   publicStoreDomain: PageLayoutProps['publicStoreDomain'];
 * }}
 */
function MobileMenuAside({header, publicStoreDomain}) {
  return (
    header.menu &&
    header.shop.primaryDomain?.url && (
      <Aside type="mobile" heading="MENU">
        <HeaderMenu
          menu={header.menu}
          viewport="mobile"
          primaryDomainUrl={header.shop.primaryDomain.url}
          publicStoreDomain={publicStoreDomain}
        />
      </Aside>
    )
  );
}

/**
 * @typedef {Object} PageLayoutProps
 * @property {Promise<CartApiQueryFragment|null>} cart
 * @property {Promise<FooterQuery|null>} footer
 * @property {HeaderQuery} header
 * @property {Promise<boolean>} isLoggedIn
 * @property {string} publicStoreDomain
 * @property {React.ReactNode} [children]
 */

/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
/** @typedef {import('storefrontapi.generated').FooterQuery} FooterQuery */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
