"use client"; // required for Hydrogen client components

import {Suspense, useState, useEffect, useRef} from 'react';
import {createPortal} from 'react-dom';
import {Await, NavLink, useAsyncValue, Link, useLocation} from 'react-router';
import {useAnalytics, useOptimisticCart} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';
import {ShopSwitch} from '~/components/ShopSwitch';
import {useGoogleRating} from '~/lib/googleRating';
import {
  GoogleRezensionenPopup,
  findeRezensionsZiel,
  scrolleZuRezensionen,
  GOOGLE_REZENSIONEN_ANKER_ID,
} from '~/components/reusables/GoogleRezensionenBereich';

const PARTNER_REGISTER_URL = 'https://aff.revolution.qiblanco.com/register';

/**
 * TITELBILD DER NEUESTEN STUDIE (e0005) FÜR DAS STUDIEN-DROPDOWN.
 *
 * Kanonische Quelle: medien-hosting/kanon/studien-titelbilder.yaml, Eintrag
 * `studien.e0005.kanon.dach`. Derselbe Dateiname steht in
 * `app/data/studien/e0005.json` unter `eckdaten.coverUrl` — hier bewusst als
 * Literal wiederholt und NICHT von dort importiert:
 *
 *   Header.jsx ist "use client" und hängt am root-Chunk, läuft also auf JEDER
 *   Seite. Ein `import {...} from '~/data/studien'` zieht die fünf Studien-JSON
 *   (169 KB, davon ~34 KB Artikel-Volltext je Studie) als STATISCHE
 *   root-Abhängigkeit herein. Gemessen 2026-08-18 mit zwei Builds: der
 *   root-Chunk bekam den 164-KB-Chunk index-*.js zusätzlich als statischen
 *   Import, den er vorher nicht hatte — 164 KB auf jeder Seite für EIN Bild.
 *   Die Gesamt-Bytezahl verriet das NICHT (+759 B, +0,04 %), weil der Chunk
 *   vorher schon existierte, nur eben lazy. Wer das nachprüft, muss den
 *   IMPORT-GRAPHEN des root-Chunks ansehen, nicht die Bundle-Größe.
 *
 * PREIS DIESER ENTSCHEIDUNG, offen benannt: die URL steht damit außerhalb der
 * Reichweite von `kanon-titelbilder pruefe` — dessen DACH-Zweig liest
 * ausschließlich app/data/studien/e*.json (`pruefumfang.dach.pfade` ist dort
 * Dokumentation, kein Code-Pfad). Gegen genau diese stille Drift hängt an
 * diesem Bau eine nachbau-audit-Probe, die den Dateinamen HIER gegen die
 * Kanon-Registry vergleicht. Wer die URL ändert, ändert sie an beiden Stellen
 * — sonst wird die Probe rot.
 *
 * Maße aus der Registry (`canvas: 1080x1080`): das Bild ist QUADRATISCH, die
 * drei Nachbar-Dropdowns tragen Querformate. Es wird trotzdem NICHT beschnitten
 * — Christians Auflage zum Original, wörtlich in der Kanon-Datei: "nicht
 * stillschweigend zurechtschneiden ... dann muss eher die Norm sie aufnehmen
 * können als umgekehrt". Kein object-fit, kein Zuschnitt; width/height nennen
 * nur das echte Verhältnis, damit der Platz vor dem Laden feststeht.
 */
const STUDIEN_DROPDOWN_BILD = {
  url: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-studien--e0005-deckblatt--56291027b5c1.png?v=1786754235',
  breite: 325,
  hoehe: 325, // canvas 1080x1080 => 1:1
  alt: 'Titelseite der Publikation in Neurodegenerative Diseases: Current Research',
};

function resolveMenuItemLink(item) {
  if (item?.title?.trim().toLowerCase() === 'partner werden') {
    return {to: PARTNER_REGISTER_URL, isExternal: true};
  }

  return resolveMenuLink(item?.url);
}

function resolveMenuLink(rawUrl) {
  if (!rawUrl) return {to: '#', isExternal: false};

  try {
    const url = new URL(rawUrl, 'https://qiblanco.com');
    const isInternalHost =
      rawUrl.startsWith('/') ||
      url.hostname === 'qiblanco.com' ||
      url.hostname === 'www.qiblanco.com' ||
      url.hostname === 'checkout.qiblanco.com' ||
      url.hostname.endsWith('.myshopify.com');

    if (isInternalHost) {
      return {
        to: `${url.pathname}${url.search}${url.hash}`,
        isExternal: false,
      };
    }

    return {to: url.href, isExternal: true};
  } catch {
    if (rawUrl.startsWith('/')) return {to: rawUrl, isExternal: false};
    return {to: rawUrl, isExternal: true};
  }
}

/**
 * @param {HeaderProps}
 */
export function Header({header, isLoggedIn, cart, publicStoreDomain}) {
  const {shop, menu} = header;
  const [scrolled, setScrolled] = useState(false);
  // ✅ Scroll-hide logic
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let lastY = window.scrollY;

    const onScroll = () => {
      const currentY = window.scrollY;
      if (currentY !== 0) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
      if (currentY > lastY && currentY > 100) {
        setHidden(true);
      } else if (currentY < lastY) {
        setHidden(false);
      }

      lastY = currentY;
    };

    window.addEventListener('scroll', onScroll, {passive: true});
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const {pathname} = useLocation();
  const isCacaoPage =
    pathname === '/pages/crystal-cacao' ||
    pathname === '/products/crystal-cacao-create' ||
    pathname === '/products/crystal-cacao-awake';

  // 4,8-Klick (Job 20260731-google-rezensionen): Klick auf die Sterne im
  // schwarzen Banner scrollt zum Google-Rezensionsbereich DIESER Seite;
  // trägt die Seite keinen (findeRezensionsZiel=null), öffnet das
  // Fallback-Popup mit genau demselben Bereich. Der Link-href bleibt als
  // No-JS-Fallback erhalten (PDP + Anker). Vorher war der Klick auf der
  // PDP selbst ein No-Op (Link auf dieselbe Route, Christian-Bug 2026-07-31).
  const [rezensionenPopupOffen, setRezensionenPopupOffen] = useState(false);
  const onRezensionenKlick = (e) => {
    e.preventDefault();
    const ziel = findeRezensionsZiel();
    if (ziel) {
      // Responsive-Repair 2026-08-04: scrollIntoView({block:'start'}) legt die
      // Sektionsoberkante auf die VIEWPORT-Oberkante und ignoriert damit den
      // fixen Kopf. scrolleZuRezensionen misst die Kopfhöhe live (Mobil-Kopf
      // ist niedriger als Desktop) und zieht sie ab — kein Doppel-Offset.
      scrolleZuRezensionen(ziel);
    } else {
      setRezensionenPopupOffen(true);
    }
  };

  return (
    <header
      className={`header-wrapper ${hidden ? 'header--hidden' : ''}`}
    >
      <AnnouncementBanner
        scrolled={scrolled}
        announcement={
          isCacaoPage ? (
            <p>
              <span className="banner-line">
                5.0/5.0 ⭐⭐⭐⭐⭐ - Über 1.000 aktive Nutzer
              </span>
              <span className="banner-offer-sep"> - </span>
              <span className="banner-line">
                jetzt mit Zufriedenheitsgarantie!
              </span>
            </p>
          ) : (
            <p>
              <span className="banner-line">
                <GoogleSterneBadge /> - Über 14.000 zufriedene Kunden
              </span>
              <span className="banner-offer-sep"> - </span>
              <span className="banner-line">
                Jetzt 20 Tage risikofrei erleben!
              </span>
            </p>
          )
        }
        link={
          isCacaoPage
            ? '/pages/crystal-cacao'
            : `/products/qione-2-pro#${GOOGLE_REZENSIONEN_ANKER_ID}`
        }
        onAnnouncementClick={isCacaoPage ? undefined : onRezensionenKlick}
      />
      <GoogleRezensionenPopup
        offen={rezensionenPopupOffen}
        onSchliessen={() => setRezensionenPopupOffen(false)}
      />

      <div
        className="header"
        style={{
          marginTop: scrolled ? '10px' : '0',
          background: scrolled
            ? 'rgba(74, 71, 65, 0.1)'
            : 'transparent',
          backdropFilter: scrolled
            ? 'blur(32px)'
            : 'blur(0px)',
        }}
      >
        <NavLink prefetch="intent" to="/" style={activeLinkStyle} end>
          <img
            className="NavLink-logo"
            src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/01_Logo_2020_Qi_Blanco-black.png?v=1637014505"
            alt="Qi Blanco Logo"
            style={{
              transition: 'filter 0.3s ease',
            }}
          />
        </NavLink>

        <HeaderMenu
          menu={menu}
          viewport="desktop"
          primaryDomainUrl={header.shop.primaryDomain.url}
          publicStoreDomain={publicStoreDomain}
        />

        <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
      </div>
    </header>
  );
}

/**
 * Updated HeaderMenu to support nested menu items
 */
export function HeaderMenu({
  menu,
  viewport,
}) {
  const className = `header-menu-${viewport}`;
  const {close} = useAside();

  return (
    <nav className={className} role="navigation">
      {viewport === 'mobile' && (
        <NavLink
          end
          onClick={close}
          prefetch="intent"
          style={activeLinkStyle}
          to="/"
        >
          Home
        </NavLink>
      )}
      {(menu || FALLBACK_HEADER_MENU).items.map((item) => {
        if (!item.url) return null;

        const {to: url, isExternal} = resolveMenuItemLink(item);

        const hasChildren = item.items && item.items.length > 0;

        return (
          <MenuItem
            key={item.id}
            item={item}
            url={url}
            isExternal={isExternal}
            hasChildren={hasChildren}
            viewport={viewport}
            close={close}
          />
        );
      })}
    </nav>
  );
}

/**
 * Handles parent items with optional children
 */
function MenuItem({item, url, isExternal, hasChildren, viewport, close}) {
  const [open, setOpen] = useState(false); // mobile accordion
  const [hover, setHover] = useState(false); // desktop hover/focus
  const [expandedKakaoMobile, setExpandedKakaoMobile] = useState(false);
  const hoverTimeout = useRef(null);
  const triggerRef = useRef(null);

  const toggleOpen = () => setOpen((prev) => !prev);

  // --- Hover control with delay ---
  const onMouseEnter = () => {
    if (viewport !== 'desktop') return;
    clearTimeout(hoverTimeout.current);
    setHover(true);
  };

  const onMouseLeave = () => {
    if (viewport !== 'desktop') return;
    clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => setHover(false), 250); // delay close
  };

  return (
    <div
      className="header-menu-item-wrapper"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onMouseEnter}
      onBlur={onMouseLeave}
    >
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        {!hasChildren && isExternal && (
          <a
            className="header-menu-item"
            href={url}
            onClick={close}
            target="_blank"
            rel="noopener noreferrer"
            ref={triggerRef}
          >
            {item.title}
          </a>
        )}

        {!hasChildren && !isExternal && (
          <NavLink
            className="header-menu-item"
            end
            onClick={close}
            prefetch="intent"
            style={activeLinkStyle}
            to={url}
            ref={triggerRef}
          >
            {item.title}
          </NavLink>
        )}

        {hasChildren && viewport === 'desktop' && (
          <p
            className="header-menu-item has--children"
            ref={triggerRef}
            tabIndex={0}
            aria-haspopup="true"
            aria-expanded={hover}
            style={{cursor: 'pointer'}}
          >
            {item.title}{' '}
            <svg className='inline' xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 15 15">
              <path
                fill="currentColor"
                d="M7.5 9.95a.45.45 0 0 0 .319-.132l3-3a.45.45 0 0 0-.637-.637L7.5 8.863L4.82 6.181l-.07-.057a.451.451 0 0 0-.625.624l.058.07l3 3a.45.45 0 0 0 .318.132"
              />
            </svg>
          </p>
        )}

        {hasChildren && viewport === 'mobile' && (
          <button
            type="button"
            className='menu-toggle-mobile'
            style={{marginLeft: '0.5rem'}}
            onClick={toggleOpen}
            aria-label="Toggle submenu"
          >
            {item.title} &nbsp;
            {open ? '−' : '+'}
          </button>
        )}
      </div>

      {hasChildren && viewport === 'desktop' && (
        <SubmenuPortal
          item={item}
          hover={hover}
          setHover={setHover}
          close={close}
          triggerRef={triggerRef}
          hoverTimeout={hoverTimeout}
        />
      )}

      {hasChildren && viewport === 'mobile' && open && (
        <ul style={{paddingLeft: '1rem', borderLeft: '1px solid #ccc'}}>
          {item.items.map((child) => {
            const isKakao = child.title.includes('Kakao');
            const isShop = item.title === "Shop";

            // Shop: accordion toggle
            if (isKakao && isShop) {
              return (
                <li key={child.id} style={{padding: '0.25rem 0', listStyle: 'none'}}>
                  <button
                    type="button"
                    className="menu-toggle-mobile kakao-toggle-mobile"
                    onClick={() => setExpandedKakaoMobile((prev) => !prev)}
                  >
                    Kristall Kakao® &nbsp;{expandedKakaoMobile ? '−' : '+'}
                  </button>
                  {expandedKakaoMobile && (
                    <ul style={{paddingLeft: '1rem', borderLeft: '1px solid #ccc', marginTop: '0.25rem'}}>
                      <li style={{padding: '0.2rem 0', listStyle: 'none'}}>
                        <NavLink className="header-submenu-item" onClick={close} prefetch="intent" style={activeLinkStyle} to="/pages/crystal-cacao">Übersicht</NavLink>
                      </li>
                      <li style={{padding: '0.2rem 0', listStyle: 'none'}}>
                        <NavLink className="header-submenu-item" onClick={close} prefetch="intent" style={activeLinkStyle} to="/products/crystal-cacao-create">Create</NavLink>
                      </li>
                      <li style={{padding: '0.2rem 0', listStyle: 'none'}}>
                        <NavLink className="header-submenu-item" onClick={close} prefetch="intent" style={activeLinkStyle} to="/products/crystal-cacao-awake">Awake</NavLink>
                      </li>
                    </ul>
                  )}
                </li>
              );
            }

            // Online Kurse: plain link
            if (isKakao && !isShop) {
              return (
                <li key={child.id} style={{padding: '0.25rem 0', listStyle: 'none'}}>
                  <NavLink className="header-submenu-item" onClick={close} prefetch="intent" style={activeLinkStyle} to="/pages/zeremonie-kakao-kurs">
                    Zeremonie Kakao Kurs
                  </NavLink>
                </li>
              );
            }

            return <SubMenuItem key={child.id} item={child} close={close} />;
          })}
        </ul>
      )}
    </div>
  );
}

/**
 * Submenu rendered into document.body so position:fixed is viewport-anchored.
 *
 * Props:
 * - item: menu item with children
 * - hover: whether submenu should be shown
 * - setHover: function to keep hover alive when moving between trigger and submenu
 * - close: function to call when clicking a submenu link
 * - triggerRef: ref to the trigger element to align horizontally
 */
function SubmenuPortal({item, hover, setHover, close, triggerRef, hoverTimeout}) {
  const containerRef = useRef(null);
  const [hoverItem, setHoverItem] = useState("QiOne® 2 Pro");
  const [expandedKakao, setExpandedKakao] = useState(false);

  useEffect(() => {
    const el = document.createElement('div');
    el.className = 'submenu-portal';
    document.body.appendChild(el);
    containerRef.current = el;
    return () => el.remove();
  }, []);

  if (!containerRef.current) return null;

  const onSubmenuEnter = () => {
    clearTimeout(hoverTimeout.current);
    setHover(true);
  };

  const onSubmenuLeave = () => {
    clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => setHover(false), 250);
  };

  const submenu = (
    <div
      className="submenu"
      role="menu"
      aria-hidden={!hover}
      onMouseEnter={onSubmenuEnter}
      onMouseLeave={onSubmenuLeave}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        backgroundColor: 'rgb(247, 241, 232)',
        boxShadow: 'rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.25) 0px 25px 50px -12px',
        padding: '1.5rem',
        zIndex: 4, // stays under header
        borderRadius: '0 0 50px 50px',
        transform: hover ? 'translateY(0)' : 'translateY(-300%)',
        opacity: 1,
        transition: 'all .5s ease-out',
      }}
    >
      {item.title === "Shop" && (
        <>
          {hoverItem === "QiBracelet®" && (
            <div className="nav-styling-wrapper">
              <img style={{borderRadius: '20px'}} width={325} src='https://cdn.shopify.com/s/files/1/0279/3095/1750/files/2023-03-01-qiblanco-milva-martin-1020737.webp?v=1707317356' />
              <div className="nav-styling-overlay">QiBracelet®</div>
            </div>
          )}
          {hoverItem === "QiOne® 2 Pro" && (
            <div className="nav-styling-wrapper">
              <img style={{borderRadius: '20px'}} width={325} src='https://cdn.shopify.com/s/files/1/0279/3095/1750/files/2021-04-qiblanco-bali-17.webp?v=1765230912' />
              <div className="nav-styling-overlay">QiOne 2 Pro®</div>
            </div>
          )}
          {hoverItem === "QiHome® Air" && (
            <div className="nav-styling-wrapper">
              <img style={{borderRadius: '20px'}} width={325} src='https://cdn.shopify.com/s/files/1/0279/3095/1750/files/2022-07-26-qiblanco-berlin-1000819-2.jpg?v=1668999599' />
              <div className="nav-styling-overlay">QiHome Air®</div>
            </div>
          )}
        </>
      )}

      {item.title === "Online Kurse" && (
        <div className="nav-styling-wrapper">
          {/* Ohne den `_400x`-Zusatz: dieselbe Aufnahme in ihrer vollen
              Ablagegroesse (526x296 statt 400x225). Bei 285 CSS-px Anzeige und
              dpr>=2 trugen 400 Quellpixel die Flaeche nicht (Gate 12,
              bild-aufloesung), 526 tragen sie. Nachgemessen 2026-08-09: beide
              URLs liefern HTTP 200, `_400x` ist eine reine Verkleinerung. */}
          <img style={{borderRadius: '20px'}} width={325} src='https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qiblanco-com-in-5-stufen-zum-superhuman-masterclass-showcase-app-526x296.png?v=1645756351' />
        </div>
      )}

      {item.title === "Mehr" && (
        <div className="nav-styling-wrapper">
          <img style={{borderRadius: '20px'}} width={325} src='https://cdn.shopify.com/s/files/1/0279/3095/1750/files/2023-06-qiblanco-kitzbuehel-10.webp?v=1738529579' />
        </div>
      )}

      {/* Studien war als einziges der vier Dropdowns ohne Bild — gemessen
          2026-08-18 an der ausgelieferten Seite: Shop/Online Kurse/Mehr trugen
          einen .nav-styling-wrapper, Studien nicht, Leerraum links 470 px.
          Quelle und Format des Bildes: siehe STUDIEN_DROPDOWN_BILD oben. */}
      {item.title === "Studien" && (
        <div className="nav-styling-wrapper">
          <img
            style={{borderRadius: '20px'}}
            width={STUDIEN_DROPDOWN_BILD.breite}
            height={STUDIEN_DROPDOWN_BILD.hoehe}
            src={STUDIEN_DROPDOWN_BILD.url}
            alt={STUDIEN_DROPDOWN_BILD.alt}
            loading="lazy"
          />
        </div>
      )}

      <ul className="NormalSectionSize" style={{margin: 0, padding: 0, listStyle: 'none'}}>
        {item.items.map((child) => {
          const isKakao = child.title.includes('Kakao');
          const isShop = item.title === "Shop";

          // Shop: Kristall Kakao® accordion toggle
          if (isKakao && isShop) {
            return (
              <li key={child.id} className="kakao-item">
                <button
                  className="header-submenu-item kakao-toggle"
                  type="button"
                  onClick={() => setExpandedKakao((prev) => !prev)}
                >
                  <img width={35} src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/icon-kakao.png?v=1760090696" alt="" />
                  Kristall Kakao®
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1em"
                    height="1em"
                    viewBox="0 0 15 15"
                    style={{
                      marginLeft: '0.25rem',
                      transition: 'transform 0.2s',
                      transform: expandedKakao ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  >
                    <path fill="currentColor" d="M7.5 9.95a.45.45 0 0 0 .319-.132l3-3a.45.45 0 0 0-.637-.637L7.5 8.863L4.82 6.181l-.07-.057a.451.451 0 0 0-.625.624l.058.07l3 3a.45.45 0 0 0 .318.132" />
                  </svg>
                </button>
                {expandedKakao && (
                  <ul className="kakao-children">
                    <li>
                      <NavLink className="header-submenu-item kakao-child" onClick={close} prefetch="intent" style={activeLinkStyle} to="/pages/crystal-cacao">Übersicht</NavLink>
                    </li>
                    <li>
                      <NavLink className="header-submenu-item kakao-child" onClick={close} prefetch="intent" style={activeLinkStyle} to="/products/crystal-cacao-create">Create</NavLink>
                    </li>
                    <li>
                      <NavLink className="header-submenu-item kakao-child" onClick={close} prefetch="intent" style={activeLinkStyle} to="/products/crystal-cacao-awake">Awake</NavLink>
                    </li>
                  </ul>
                )}
              </li>
            );
          }

          // Online Kurse: Kakao child becomes a plain "Zeremonie Kakao Kurs" link
          if (isKakao && !isShop) {
            return (
              <li key={child.id} style={{padding: '0.25rem 0'}}>
                <NavLink
                  className="header-submenu-item"
                  onClick={close}
                  prefetch="intent"
                  style={activeLinkStyle}
                  to="/pages/zeremonie-kakao-kurs"
                >
                  <img width={35} src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/icon-kakao.png?v=1760090696" alt="" />
                  Zeremonie Kakao Kurs
                </NavLink>
              </li>
            );
          }

          const {to: childTo, isExternal: isExternalChild} =
            resolveMenuItemLink(child);
          const childIcons = (
            <>
              {child.title === "QiOne® 2 Pro" && (<img width={45} src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/icon-qione.png?v=1760088701" alt="" />)}
              {child.title === "QiBracelet®" && (<img width={45} src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/icon-bracelet.png?v=1760089233" alt="" />)}
              {child.title === "QiHome® Air" && (<img width={45} src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/icon-home.png?v=1760089232" alt="" />)}
              {child.title === "Necklace für den QiOne®" && (<img width={45} src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/icon-necklace.png?v=1760090696" alt="" />)}
              {child.title}
            </>
          );

          return (
            <li key={child.id} style={{padding: '0.25rem 0'}}>
              {isExternalChild ? (
                <a
                  className="header-submenu-item"
                  href={childTo}
                  onClick={close}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {childIcons}
                </a>
              ) : (
                <NavLink
                  className="header-submenu-item"
                  onClick={close}
                  prefetch="intent"
                  style={activeLinkStyle}
                  to={childTo}
                >
                  {childIcons}
                </NavLink>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );

  return createPortal(submenu, containerRef.current);
}

/**
 * Submenu link items (used by mobile accordion)
 */
function SubMenuItem({item, close}) {
  if (!item.url) return null;
  const {to, isExternal} = resolveMenuItemLink(item);

  return (
    <li style={{padding: '0.25rem 0'}}>
      {isExternal ? (
        <a
          className="header-submenu-item"
          href={to}
          onClick={close}
          target="_blank"
          rel="noopener noreferrer"
        >
          {item.title}
        </a>
      ) : (
        <NavLink
          className="header-submenu-item"
          onClick={close}
          prefetch="intent"
          style={activeLinkStyle}
          to={to}
        >
          {item.title}
        </NavLink>
      )}
    </li>
  );
}

/**
 * @param {Pick<HeaderProps, 'isLoggedIn' | 'cart'>}
 */
function HeaderCtas({isLoggedIn, cart}) {
  return (
    <nav className="header-ctas" role="navigation">
      <HeaderMenuMobileToggle />
      <ShopSwitch aktiv="de" />
      <AccountToggle isLoggedIn={isLoggedIn} />
      <CartToggle cart={cart} />
    </nav>
  );
}

/**
 * Kunden-Login sichtbar machen. Die Account-Schicht (app/routes/account*.jsx +
 * GraphQL customer-account) existiert vollständig; root.jsx lädt isLoggedIn
 * und PageLayout reicht es bis hierher durch — bis heute wurde die Prop nur
 * ignoriert. Hier wird ausschließlich der Einstieg gerendert, nichts gebaut.
 *
 * isLoggedIn ist ein Promise: bis es auflöst, zeigt der Fallback den
 * Login-Weg. Das ist der sichere Ausgang — ein nicht eingeloggter Besucher
 * gehört ohnehin dorthin, ein eingeloggter wird von /account/login zum
 * Konto weitergeleitet.
 *
 * @param {{isLoggedIn: Promise<boolean> | boolean}}
 */
function AccountToggle({isLoggedIn}) {
  return (
    <Suspense fallback={<AccountLink eingeloggt={false} />}>
      <Await
        resolve={isLoggedIn}
        errorElement={<AccountLink eingeloggt={false} />}
      >
        {(eingeloggt) => <AccountLink eingeloggt={Boolean(eingeloggt)} />}
      </Await>
    </Suspense>
  );
}

/**
 * @param {{eingeloggt: boolean}}
 */
function AccountLink({eingeloggt}) {
  return (
    <NavLink
      className="header-account"
      prefetch="intent"
      to={eingeloggt ? '/account' : '/account/login'}
      aria-label={eingeloggt ? 'Mein Konto' : 'Anmelden'}
      title={eingeloggt ? 'Mein Konto' : 'Anmelden'}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </NavLink>
  );
}

function HeaderMenuMobileToggle() {
  const {open} = useAside();
  return (
    <button
      className="header-menu-mobile-toggle reset"
      onClick={() => open('mobile')}
    >
      <h3>☰</h3>
    </button>
  );
}

function SearchToggle() {
  const {open} = useAside();
  return (
    <button className="reset" onClick={() => open('search')}>
      Search
    </button>
  );
}

/**
 * @param {{count: number | null}}
 */
function CartBadge({count}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <a
      className="openCart"
      href="/cart"
      onClick={(e) => {
        e.preventDefault();
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        });
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M16 10a4 4 0 0 1-8 0" />
        <path d="M3.103 6.034h17.794" />
        <path d="M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z" />
      </svg>{' '}
      <span className="cart-count">
        {count === null ? <span>&nbsp;</span> : count}
      </span>
    </a>
  );
}

/**
 * @param {Pick<HeaderProps, 'cart'>}
 */
function CartToggle({cart}) {
  return (
    <Suspense fallback={<CartBadge count={null} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

/* Sterne-Zeile im Banner aus der KANONISCHEN Google-Quelle (useGoogleRating:
   Places-API, server-gecacht, Fallback 4,8/429) statt des frueheren
   Client-Fetches gegen die vercel-serpapi-App (Fallback dort 4.7 — inkonsistent
   zum Rezensionsbereich). Optik unveraendert (.ReviewCount-Bestand). */
function GoogleSterneBadge() {
  const g = useGoogleRating();
  return (
    <span className="ReviewCount">
      {g.komma} {'★'.repeat(5)}
    </span>
  );
}

function AnnouncementBanner({announcement, link, scrolled, onAnnouncementClick}) {
  return (
    <div
      className="Header-AnnouncementBanner"
      style={{
        maxHeight: scrolled ? '0px' : '100px',
        opacity: scrolled ? 0 : 1,
        overflow: 'hidden',
        transition: 'max-height 0.8s ease, opacity 0.8s ease',
      }}
    >
      <Link prefetch="intent" to={link} onClick={onAnnouncementClick}>
        {announcement}
      </Link>
    </div>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue();
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

/*
 * Notmenü, das nur einspringt, wenn das echte Shopify-Menü nicht lädt.
 *
 * Übersetzt werden hier nur die title-Felder — sie sind das, was der Kunde
 * liest. id, resourceId, type und url bleiben unberührt: das ist die
 * Verdrahtung, nicht der Text.
 *
 * OFFEN, BEWUSST NICHT HIER GELÖST (live nachgemessen 2026-08-22, echter
 * Browser-UA, cookielos): das ECHTE Menü lautet Start / Shop / Studien /
 * Online Kurse / Mehr. Dieses Notmenü führt andere Punkte und fremde
 * Beispiel-gids aus dem Hydrogen-Starter — es ist also kein Spiegel des
 * Menüs, sondern dessen Vorgabewert. Die Übersetzung macht es weniger falsch,
 * nicht richtig: fällt das Shopify-Menü aus, sieht der Kunde weiterhin ein
 * Menü, das es so nie gab. Das gehört inhaltlich nachgezogen, ist aber eine
 * andere Aufgabe als diese Übersetzung.
 */
const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Kollektionen',
      type: 'HTTP',
      url: '/collections',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'Blog',
      type: 'HTTP',
      url: '/blogs/journal',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: 'Richtlinien',
      type: 'HTTP',
      url: '/policies',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'Über uns',
      type: 'PAGE',
      url: '/pages/about',
      items: [],
    },
  ],
};

/**
 * @param {{
 *   isActive: boolean;
 *   isPending: boolean;
 * }}
 */
function activeLinkStyle({isActive, isPending}) {
  return ({color: isPending ? 'grey' : 'inherit', fontWeight: isActive ? 'bold' : undefined});
}

/** @typedef {'desktop' | 'mobile'} Viewport */
/**
 * @typedef {Object} HeaderProps
 * @property {HeaderQuery} header
 * @property {Promise<CartApiQueryFragment|null>} cart
 * @property {Promise<boolean>} isLoggedIn
 * @property {string} publicStoreDomain
 */

/** @typedef {import('@shopify/hydrogen').CartViewPayload} CartViewPayload */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
