import {Suspense} from 'react';
import {Await, NavLink, useAsyncValue} from 'react-router';
import {useOptimisticCart} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';

/*
 * EN-Header der US-Vorabversion (/en-us) — bewusst schmal: Logo + die
 * existierenden EN-Routen + Cart. KEINE Links auf DACH-Routen (Leak-Guard-
 * Disziplin des Zweiblock-Musters, D-053), keine Shopify-Menue-Query
 * (das Admin-Menue ist deutsch); Navigation ist code-gefuehrt wie
 * blockLinks.js im LP-Block.
 */
const US_NAV = [
  {to: '/en-us', label: 'Home', end: true},
  {to: '/en-us/pages/qione-2-pro', label: 'QiOne® 2 Pro'},
  {to: '/en-us/pages/crystal-cacao', label: 'Crystal Cacao'},
  {to: '/en-us/pages/support', label: 'Support'},
];

export function UsHeader({cart}) {
  return (
    <header className="us-header">
      <NavLink to="/en-us" className="us-header-logo" end>
        Qi Blanco®
      </NavLink>
      <nav className="us-header-nav" aria-label="Primary">
        {US_NAV.map(({to, label, end}) => (
          <NavLink key={to} to={to} end={end} prefetch="intent">
            {label}
          </NavLink>
        ))}
        <UsCartToggle cart={cart} />
      </nav>
    </header>
  );
}

function UsCartBadge({count}) {
  const {open} = useAside();
  return (
    <a
      className="us-cart-link"
      href="/cart"
      onClick={(e) => {
        e.preventDefault();
        open('cart');
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M16 10a4 4 0 0 1-8 0" />
        <path d="M3.103 6.034h17.794" />
        <path d="M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z" />
      </svg>
      <span>Cart{count === null ? '' : ` (${count})`}</span>
    </a>
  );
}

function UsCartBanner() {
  const originalCart = useAsyncValue();
  const cart = useOptimisticCart(originalCart);
  return <UsCartBadge count={cart?.totalQuantity ?? 0} />;
}

function UsCartToggle({cart}) {
  return (
    <Suspense fallback={<UsCartBadge count={null} />}>
      <Await resolve={cart}>
        <UsCartBanner />
      </Await>
    </Suspense>
  );
}
