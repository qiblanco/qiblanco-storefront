"use client"; // required for Hydrogen client components

import {Suspense, useState, useEffect, useRef, useCallback} from 'react';
import {CdnBild} from './reusables/CdnBild';
import {createPortal} from 'react-dom';
import {Await, NavLink, useAsyncValue, Link, useLocation} from 'react-router';
import {useAnalytics, useOptimisticCart} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';
import {ShopSwitch} from '~/components/ShopSwitch';
import {useGoogleRating} from '~/lib/googleRating';
import {
  istKakaoPfad,
  KAKAO_KENNZAHLEN,
  QIBLANCO_KENNZAHLEN,
} from '~/lib/kakao-zone';
import {
  GoogleRezensionenPopup,
  findeRezensionsZiel,
  scrolleZuRezensionen,
  useSterneSprungDelegation,
  useKopfHoeheVariable,
  GOOGLE_REZENSIONEN_ANKER_ID,
} from '~/components/reusables/GoogleRezensionenBereich';

/**
 * „Partner werden" im Menü „Mehr" führt auf UNSERE Erklärseite, nicht mehr
 * direkt ins Anmeldeformular des Partnerportals (Christian 2026-09-24: „zuerst
 * eine Seite, wo das Partnersystem erklärt wird … und dann unten der Knopf zur
 * Anmeldung"; Job 20260924-bau-partner-werden-erst-erklaerseite-mit-freude-
 * dann-anmeldung). Den Anmeldeknopf trägt jetzt die Seite selbst.
 *
 * Warum die Zuordnung hier im Code steht und nicht allein in den Shopify-
 * Menüdaten: sie tat es schon vorher (Titel -> Ziel), und nur so gilt dasselbe
 * Ziel unabhängig davon, welche URL der Menüpunkt im Admin trägt. Intern, also
 * NavLink im selben Fenster statt target=_blank.
 */
const PARTNER_SEITE = '/pages/affiliate-partnerprogramm';

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
/*
 * BILDLEITER IM MEGA-MENÜ — die beiden `sizes`-Werte sind GEMESSEN, nicht
 * geschätzt, und das ist hier der ganze Punkt.
 *
 * Ein `sizes` ist eine BEHAUPTUNG ÜBER DIE FLÄCHE, keine Einstellung. Ist
 * es zu klein, spart es kein Byte — der Browser wählt eine zu kleine Sprosse
 * und das Bild kommt UNSCHARF an. Genau daran ist der Vorgänger-Bau (#499)
 * gescheitert: sein `sizes` hatte zwei Zweige ("(min-width: 1000px) 325px,
 * 80px"), während die Kacheln STETIG mit dem Fenster wachsen. Alles zwischen
 * 600 und 1000 fiel in den Telefon-Zweig, Gate 12 meldete `bild-aufloesung=
 * kaputt` auf ACHT Seiten, und Header.jsx musste vollständig zurück.
 *
 * ES GIBT ZWEI WERTE, WEIL ES ZWEI FLÄCHEN GIBT. Am 2026-09-18 über ALLE
 * elf Gate-12-Haltepunkte abgetastet (Playwright, eigener Dev-Server,
 * Box-Breite in CSS-px, gemessen an der gelieferten Datei statt am
 * `width=`-Parameter der URL):
 *
 *   Fenster            360    414    600    768    820    883    900   >=1000
 *   Mehr (668 px)     89,6   106,1  160,5  209,6  224,8  282,0  298,0   325
 *   Shop (597 px)     72,9    86,4  130,6  173,9  222,8  282,0  298,0   325
 *   Studien (1080)    65,9    78,1  118,1  173,9  222,8  282,0  298,0   325
 *   Online Kurse      120,2  142,3  215,3  263,0  263,0  263,0  263,0   325
 *
 * Die ersten drei deckt MENUE_SIZES ab (Obergrenze ist "Mehr"). Die vierte
 * NICHT: auf schmalen Fenstern ist sie GRÖSSER als die anderen — 120,2 gegen
 * 89,6 bei 360 —, und `27vw` gäbe dort nur 97,2 px. Das wäre derselbe
 * Unschärfe-Fehler wie oben, nur an einer anderen Kachel. Sie bekommt
 * deshalb MENUE_SIZES_KURSE.
 *
 * Ihr Deckel steht in app/styles/app.css (`.nav-styling-wrapper--kurse img`,
 * `max-width: min(100%, 263px)`) und greift NUR ab dpr 2 — daher die 263 bei
 * 768..900 und die 325 bei desktop-1000/1280/1440 (dpr 1). Ein `sizes` kennt
 * die Gerätedichte nicht, deshalb deckt MENUE_SIZES_KURSE den größeren der
 * beiden Fälle ab.
 *
 * `masterBreite` an jeder Kachel ist die ECHTE Breite der Masterdatei (am
 * 2026-09-18 am CDN nachgemessen). Ohne sie verspricht die Leiter Sprossen,
 * die es nicht gibt, und das CDN gibt dafür nur den Master zurück.
 */
const MENUE_SIZES = '(min-width: 1000px) 325px, (min-width: 768px) 34vw, 27vw';
/*
 * DIE ZUSATZ-SPROSSE 240 — Nachtrag 2026-09-24 (Job
 * 20260924-header-menue-mobil-sprosse-dach-arm-prio45).
 *
 * Nach dem Merge der Leiter (#610) blieb am Telefon ein Rest: die Leiter
 * beginnt bei 325 (1x-Sprosse der Desktop-Fläche), die Kacheln sind dort aber
 * 80 CSS-px breit. Gemessen am 2026-09-24 mit
 * ladeverhalten/bin/probe_startseite_bildlast.py (390 px, dpr 2), live und am
 * eigenen Dev-Server gleich: bali-17 80 px und kitzbuehel-10 81 px, beide mit
 * 325 px beliefert = 2,02-fach. `27vw` behauptet dort 105 px -> Bedarf 210.
 *
 * WARUM GENAU EINE SPROSSE: Chromium nimmt die kleinste Sprosse, deren
 * Breite sizes x dpr erreicht (nachgemessen am selben Tag: 414 px, dpr 3,
 * 27vw = 112 px -> Bedarf 335 -> es kommt 597, nicht 325). Eine neue Sprosse
 * ändert also NUR dort etwas, wo sie selbst gewählt wird. Die 240 wird bei
 * 390/dpr 2 (Probe: 80 px -> 1,49-fach) und 360/dpr 2 (73 px -> 1,64-fach)
 * gewählt, an KEINEM der elf Gate-12-Haltepunkte (360/414/883 laufen mit dpr 3,
 * 600/768/820/900/1024 mit dpr 2 brauchen mehr als 240, 1000/1280/1440 mit
 * dpr 1 nehmen 325) — dort bleibt die Auslieferung Pixel für Pixel dieselbe.
 * Jede weitere Sprosse (160, 200)
 * würde an keinem gemessenen Punkt etwas verbessern, aber die Wahl an
 * ungemessenen Fenstern verschieben. Unterdeckung ist ausgeschlossen, solange
 * `27vw` die Fläche nicht unterschätzt (Mehr bei 360..600: 24,9..26,8vw).
 *
 * Nur die MENUE_SIZES-Kacheln bekommen sie; die Kurse-Kachel hat ihre eigene
 * Fläche (133 px am Telefon, Master 526) und ist nicht betroffen.
 */
const MENUE_ZUSATZ_SPROSSEN = [240];
const MENUE_SIZES_KURSE = '(min-width: 1000px) 325px, (min-width: 768px) 35vw, 36vw';

const STUDIEN_DROPDOWN_BILD = {
  url: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-studien--e0005-deckblatt--56291027b5c1.png?v=1786754235',
  breite: 325,
  hoehe: 325, // canvas 1080x1080 => 1:1
  alt: 'Titelseite der Publikation in Neurodegenerative Diseases: Current Research',
};

function resolveMenuItemLink(item) {
  if (item?.title?.trim().toLowerCase() === 'partner werden') {
    return {to: PARTNER_SEITE, isExternal: false};
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

/*
 * DER KOPF FOLGT DER SCROLLRICHTUNG — UND ER TUT ES ALS EIN STÜCK.
 * (Christian, 21.09.2026. Herkunft, Messwerte und die Job-Kennung im devlog
 * des homepage-bauer, D-2876. Wörtlich: "Ich möchte nun, dass wenn man nach oben scrollt,
 * wieder beides angezeigt wird — also Dropdown und die Sternebewertung (die
 * sieht man aktuell nicht).")
 *
 * WAS VORHER FALSCH WAR, und es war nicht das Menü:
 *   Das Menü kam beim Hochscrollen schon immer zurück (`header--hidden` fiel
 *   weg). Die 4,8-Sterne-Zeile NICHT: `AnnouncementBanner` hing an `scrolled`,
 *   und `scrolled` ist `window.scrollY !== 0`. Sie kollabierte also beim ersten
 *   Pixel und kam erst am SEITENANFANG zurück — nie beim Hochscrollen. Zwei
 *   Teile desselben Kopfes an zwei verschiedenen Bedingungen; genau das hat
 *   Christian gesehen.
 *   Gemessen am 21.09.2026 live auf allen drei Pflichtseiten (1440 px, echte
 *   Mausrad-Ereignisse): nach 1500 px runter und 300 px hoch stand der Kopf
 *   wieder da (unten=95), die Bewertungszeile aber auf Höhe 0 und Deckkraft 0.
 *
 * WIE ES JETZT GEBAUT IST:
 *   Es gibt genau EINEN Mechanismus — `.header-wrapper` fährt als Ganzes über
 *   `transform: translateY(-100%)` aus dem Bild und wieder herein. Die
 *   Bewertungszeile hat keine eigene Ein-/Ausblendung mehr. Damit kann der
 *   Fehler "die eine Hälfte ist da, die andere nicht" baulich nicht
 *   wiederkommen, statt nur heute behoben zu sein.
 *
 * ÜBERALL GLEICH, ohne dafür etwas zu bauen (Christians zweite Hälfte):
 *   `Header` wird ausschließlich aus `PageLayout` gerendert, und PageLayout
 *   liegt auf JEDER Route. Es gibt kein zweites Kopf-Bauteil und es kommt auch
 *   keines dazu — genau das verbietet der Auftrag, und genau diese Klasse
 *   Fehler hat auf der Schlafseite schon einmal einen Block ohne Stylesheet
 *   stehen lassen. Der Beleg dafür ist keine Behauptung, sondern die
 *   Gleichheits-Achse in pruefungen/probe_kopf_richtung_bewertung.py: sie
 *   misst alle drei Seiten und meldet Ungleichheit als eigenen Befund.
 *
 * WARUM EINE TOTZONE:
 *   Vorher reichte EIN Pixel aufwärts, um den Kopf auszufahren — ohne
 *   Mindestweg. Auf dem Handy erzeugt schon das Abheben des Fingers solche
 *   Gegenbewegungen, und der Kopf zappelt. 8 px ist die kleinste Strecke, die
 *   ein Mensch als Geste meint und nicht als Zittern; die Zahl ist eine
 *   Hypothese, keine Konstante (GL). Wer sie ändert, zieht
 *   `ZAPPEL_PX` in pruefungen/probe_kopf_richtung_bewertung.py und die
 *   Aufwärtsbewegung in pruefungen/probe_sterne_kopf_zustaende.py mit —
 *   beide Proben messen GEGEN diese Zahl.
 *
 * DIE MARKER IM HTML SIND KEINE DEKORATION:
 *   `KopfHaftet`, `data-scroll-dir` und `KopfBewertung` stehen im
 *   serverseitig gerenderten HTML. Sie sind der billige, täglich fahrbare
 *   Teil der Abnahme (worker-pool/pruefungen/probe_kopf_kommt_beim_
 *   hochscrollen_zurueck__20260921.py). Sie beweisen für sich NICHTS über das
 *   Verhalten — das misst nur die Browser-Probe. Deshalb stehen beide.
 */
const SCROLL_TOTZONE_PX = 8; // kleinere Bewegungen ändern am Kopf nichts
const KOPF_EINFAHR_AB_PX = 100; // darüber darf der Kopf überhaupt einfahren
const KOPF_RICHTUNG_AUF = 'auf';
const KOPF_RICHTUNG_AB = 'ab';

/**
 * @param {HeaderProps}
 */
export function Header({header, isLoggedIn, cart, publicStoreDomain}) {
  const {shop, menu} = header;
  const [scrolled, setScrolled] = useState(false);
  // Kopf eingefahren? (nur beim Abwärtsscrollen, nie am Seitenanfang)
  const [hidden, setHidden] = useState(false);
  // Die Scrollrichtung als eigener, ablesbarer Zustand — siehe Kommentarblock
  // über SCROLL_TOTZONE_PX.
  const [richtung, setRichtung] = useState(KOPF_RICHTUNG_AUF);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let letzteY = window.scrollY;
    // Bezugspunkt der Totzone: wird bei JEDEM Richtungswechsel neu gesetzt.
    // Erst wenn sich der Finger SCROLL_TOTZONE_PX weit von hier entfernt hat,
    // ändert der Kopf seinen Zustand.
    let ankerY = window.scrollY;
    let letzteRichtung = KOPF_RICHTUNG_AUF;
    let angefordert = false;

    const auswerten = () => {
      angefordert = false;
      const y = window.scrollY;
      setScrolled(y !== 0);

      // Am Seitenanfang ist der Kopf IMMER da — ohne Scrollbewegung, ohne
      // Totzone. Das ist Christians Bestand und bleibt.
      if (y <= 0) {
        letzteY = 0;
        ankerY = 0;
        letzteRichtung = KOPF_RICHTUNG_AUF;
        setRichtung(KOPF_RICHTUNG_AUF);
        setHidden(false);
        return;
      }

      const richtungJetzt =
        y > letzteY
          ? KOPF_RICHTUNG_AB
          : y < letzteY
            ? KOPF_RICHTUNG_AUF
            : letzteRichtung;

      if (richtungJetzt !== letzteRichtung) {
        // Richtungswechsel: die Totzone fängt hier neu an zu zählen.
        ankerY = letzteY;
        letzteRichtung = richtungJetzt;
      }
      letzteY = y;

      // Unterhalb der Totzone passiert NICHTS — weder am Kopf noch am
      // veröffentlichten Richtungszustand. Sonst flackert beides.
      if (Math.abs(y - ankerY) < SCROLL_TOTZONE_PX) return;

      setRichtung(richtungJetzt);
      setHidden(richtungJetzt === KOPF_RICHTUNG_AB && y > KOPF_EINFAHR_AB_PX);
    };

    // Ein Scroll-Ereignis feuert pro Frame mehrfach. Gerechnet wird einmal je
    // Frame — das ist dieselbe Entprellung, die useKopfHoeheVariable schon
    // fährt, und sie hält die Bewegung gleichmäßig statt ruckelig.
    const anfordern = () => {
      if (angefordert) return;
      angefordert = true;
      window.requestAnimationFrame(auswerten);
    };

    auswerten();
    window.addEventListener('scroll', anfordern, {passive: true});
    return () => window.removeEventListener('scroll', anfordern);
  }, []);

  const {pathname} = useLocation();
  // Zonenzuordnung aus app/lib/kakao-zone.js — der einen Stelle, an der steht,
  // welche Fläche zu welcher Produktwelt gehört. Vorher stand die Liste hier
  // und kannte nur DREI der fünf Kakao-Pfade: /pages/kristall-kakao und
  // /products/zeremonie-kakao wären beim nächsten Deploy auf die
  // Qi-Blanco-Leiste gekippt ("über 14.000" auf einer Kakaoseite).
  const isCacaoPage = istKakaoPfad(pathname);

  // 4,8-Klick (Job 20260731-google-rezensionen): Klick auf die Sterne im
  // schwarzen Banner scrollt zum Google-Rezensionsbereich DIESER Seite;
  // trägt die Seite keinen (findeRezensionsZiel=null), öffnet das
  // Fallback-Popup mit genau demselben Bereich. Der Link-href bleibt als
  // No-JS-Fallback erhalten (PDP + Anker). Vorher war der Klick auf der
  // PDP selbst ein No-Op (Link auf dieselbe Route, Christian-Bug 2026-07-31).
  const [rezensionenPopupOffen, setRezensionenPopupOffen] = useState(false);
  const onRezensionenKlick = useCallback((e) => {
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
  }, []);

  /*
   * DASSELBE VERHALTEN FÜR JEDE Klasse-S-Sterne-Ansicht DER SEITE, nicht nur
   * für den Banner-Badge (Job 20260820-wurzel-sterne-klick-scroll, s03).
   *
   * Der Header ist der richtige Ort dafür, weil er ohnehin auf JEDER Route
   * gerendert wird UND weil der Fallback-Zustand (Popup, wenn die Seite keinen
   * Bewertungsbereich hat) hier bereits liegt — es gibt also genau EINE
   * Definition des Verhaltens, die sich Banner und Sterne teilen.
   *
   * Geprueft wird der MARKER, nicht ein Selektor: eine spaeter hinzugefuegte
   * Sterne-Ansicht erbt das Verhalten damit ohne Codeaenderung. Genau das ist
   * der Grund, warum dieses Thema seit dem 2026-07-18 fuenfmal wiederkam —
   * jeder Anlauf hat eine neue Merkliste gepflegt statt den Marker.
   */
  useSterneSprungDelegation(onRezensionenKlick);
  useKopfHoeheVariable();

  return (
    <header
      className={`header-wrapper KopfHaftet ${hidden ? 'header--hidden' : ''}`}
      data-scroll-dir={richtung}
    >
      <AnnouncementBanner
        announcement={
          isCacaoPage ? (
            <p>
              <span className="banner-line">
                {KAKAO_KENNZAHLEN.bewertungSkala} ⭐⭐⭐⭐⭐ - Über{' '}
                {KAKAO_KENNZAHLEN.nutzer} aktive Nutzer
              </span>
              <span className="banner-offer-sep"> - </span>
              <span className="banner-line">
                jetzt mit Zufriedenheitsgarantie!
              </span>
            </p>
          ) : (
            <p>
              <span className="banner-line">
                <GoogleSterneBadge /> - Über {QIBLANCO_KENNZAHLEN.nutzer}{' '}
                zufriedene Kunden
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
          <CdnBild
            className="NavLink-logo"
            src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/01_Logo_2020_Qi_Blanco-black.png?v=1637014505"
            alt="Qi Blanco Logo"
            anzeigeBreite={150}
            masterBreite={2048}
            breite={2048}
            hoehe={720}
            loading="eager"
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
  // `container` ist bewusst State und kein Ref (2026-09-09, Job
  // 20260909-blog-navigation-nicht-gerendert-checkout-domain-prio25).
  // Ein Ref, der im useEffect gesetzt wird, löst kein Re-Rendering aus —
  // das Portal erschien deshalb erst beim nächsten Eltern-Rendering.
  const [container, setContainer] = useState(null);
  const [hoverItem, setHoverItem] = useState("QiOne® 2 Pro");
  const [expandedKakao, setExpandedKakao] = useState(false);

  useEffect(() => {
    const el = document.createElement('div');
    el.className = 'submenu-portal';
    document.body.appendChild(el);
    setContainer(el);
    return () => {
      el.remove();
      setContainer(null);
    };
  }, []);

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
        // `width` steht bewusst NICHT mehr hier (2026-08-22, Job
        // 20260820-dropdown-menueleiste-grafik-ueberstand). Die Inline-Breite
        // war der Grund, warum app.css die Breite zweimal mit !important
        // setzen musste und warum die Chat-Andock-Regel ein drittes
        // !important brauchte. Die Breite gehört an EINE Stelle:
        // `.submenu { width: 100% }` in app/styles/app.css.
        backgroundColor: 'rgb(247, 241, 232)',
        boxShadow: 'rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.25) 0px 25px 50px -12px',
        padding: '1.5rem',
        // Ebenenleiter: hängt an der Kopf-Stufe statt an einer freien Zahl,
        // damit es beim nächsten Verschieben des Kopfes von selbst mitgeht.
        zIndex: 'calc(var(--z-kopf) - 1)', // stays under header
        borderRadius: '0 0 50px 50px',
        transform: hover ? 'translateY(0)' : 'translateY(-300%)',
        opacity: 1,
        transition: 'all .5s ease-out',
      }}
    >
      {item.title === "Shop" && (
        <>
          {/* height/alt ergänzt 2026-08-22 (Job 20260820-dropdown-
              menueleiste-grafik-ueberstand). Die fünf Dropdown-Bilder
              trugen `width` ohne `height` — der Browser kann dann vor dem
              Laden keine Fläche reservieren, das Panel springt beim
              Öffnen. Die height-Werte sind KEINE Wunschzahlen, sondern die
              am 2026-08-22 gemessenen natürlichen Seitenverhältnisse auf
              width=325 gerechnet (1368x913 -> 217, 597x399 -> 217,
              1118x840 -> 244, 526x296 -> 183, 668x350 -> 170). Die
              tatsächliche Anzeigehöhe bestimmt weiterhin
              `img { height: auto }` (app.css) — die Attribute liefern nur
              das Seitenverhältnis. */}
          {hoverItem === "QiBracelet®" && (
            <div className="nav-styling-wrapper">
              <CdnBild style={{borderRadius: '20px'}} breite={325} hoehe={217}
                loading="lazy" alt="QiBracelet® am Handgelenk getragen"
                anzeigeBreite={325} masterBreite={1368} sizes={MENUE_SIZES} zusatzSprossen={MENUE_ZUSATZ_SPROSSEN}
                src='https://cdn.shopify.com/s/files/1/0279/3095/1750/files/2023-03-01-qiblanco-milva-martin-1020737.webp?v=1707317356' />
              <div className="nav-styling-overlay">QiBracelet®</div>
            </div>
          )}
          {hoverItem === "QiOne® 2 Pro" && (
            <div className="nav-styling-wrapper">
              <CdnBild style={{borderRadius: '20px'}} breite={325} hoehe={217}
                loading="lazy" alt="QiOne® 2 Pro im Alltag am Strand"
                anzeigeBreite={325} masterBreite={597} sizes={MENUE_SIZES} zusatzSprossen={MENUE_ZUSATZ_SPROSSEN}
                src='https://cdn.shopify.com/s/files/1/0279/3095/1750/files/2021-04-qiblanco-bali-17.webp?v=1765230912' />
              <div className="nav-styling-overlay">QiOne 2 Pro®</div>
            </div>
          )}
          {hoverItem === "QiHome® Air" && (
            <div className="nav-styling-wrapper">
              <CdnBild style={{borderRadius: '20px'}} breite={325} hoehe={244}
                loading="lazy" alt="QiHome® Air im Wohnraum aufgestellt"
                anzeigeBreite={325} masterBreite={1118} sizes={MENUE_SIZES} zusatzSprossen={MENUE_ZUSATZ_SPROSSEN}
                src='https://cdn.shopify.com/s/files/1/0279/3095/1750/files/2022-07-26-qiblanco-berlin-1000819-2.jpg?v=1668999599' />
              <div className="nav-styling-overlay">QiHome Air®</div>
            </div>
          )}
        </>
      )}

      {item.title === "Online Kurse" && (
        <div className="nav-styling-wrapper nav-styling-wrapper--kurse">
          {/* Ohne den `_400x`-Zusatz: dieselbe Aufnahme in ihrer vollen
              Ablagegroesse (526x296 statt 400x225). Bei 285 CSS-px Anzeige und
              dpr>=2 trugen 400 Quellpixel die Flaeche nicht (Gate 12,
              bild-aufloesung), 526 tragen sie. Nachgemessen 2026-08-09: beide
              URLs liefern HTTP 200, `_400x` ist eine reine Verkleinerung.

              526 IST DIE OBERGRENZE DIESER AUFNAHME, nicht eine Wahl:
              nachgemessen 2026-08-23 liefert das Shopify-CDN für `_1200x`
              wieder 526x296 — es gibt keine größeren Pixel, auch die
              `.webp`-Fassung hat nur 526. Die Annahme "285 CSS-px" von
              2026-08-09 gilt seit dem Mega-Menü-Umbau nicht mehr: gemessen
              308 px (mobil-quer-883) und 314 px (tablet-900), und bei dpr>=2
              trägt 526 diese Fläche nicht. Weil die Quelle nicht wachsen
              kann, deckelt `.nav-styling-wrapper--kurse` in app/styles/app.css
              die ANZEIGE — dort steht die Herleitung des Werts. */}
          <CdnBild style={{borderRadius: '20px'}} breite={325} hoehe={183}
                loading="lazy" alt="Online-Masterclass „In 5 Stufen zum Superhuman“"
                anzeigeBreite={325} masterBreite={526} sizes={MENUE_SIZES_KURSE}
                src='https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qiblanco-com-in-5-stufen-zum-superhuman-masterclass-showcase-app-526x296.png?v=1645756351' />
        </div>
      )}

      {item.title === "Mehr" && (
        <div className="nav-styling-wrapper">
          <CdnBild style={{borderRadius: '20px'}} breite={325} hoehe={170}
                loading="lazy" alt="Qi Blanco in den Bergen bei Kitzbühel"
                anzeigeBreite={325} masterBreite={668} sizes={MENUE_SIZES} zusatzSprossen={MENUE_ZUSATZ_SPROSSEN}
                src='https://cdn.shopify.com/s/files/1/0279/3095/1750/files/2023-06-qiblanco-kitzbuehel-10.webp?v=1738529579' />
        </div>
      )}

      {/* Studien war als einziges der vier Dropdowns ohne Bild — gemessen
          2026-08-18 an der ausgelieferten Seite: Shop/Online Kurse/Mehr trugen
          einen .nav-styling-wrapper, Studien nicht, Leerraum links 470 px.
          Quelle und Format des Bildes: siehe STUDIEN_DROPDOWN_BILD oben. */}
      {item.title === "Studien" && (
        <div className="nav-styling-wrapper">
          <CdnBild
            style={{borderRadius: '20px'}}
            breite={STUDIEN_DROPDOWN_BILD.breite}
            hoehe={STUDIEN_DROPDOWN_BILD.hoehe}
            anzeigeBreite={325}
            masterBreite={1080}
            sizes={MENUE_SIZES}
            zusatzSprossen={MENUE_ZUSATZ_SPROSSEN}
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
                  <CdnBild breite={35} hoehe={35} anzeigeBreite={35} masterBreite={129} src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/icon-kakao.png?v=1760090696" alt="" />
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
                  <CdnBild breite={35} hoehe={35} anzeigeBreite={35} masterBreite={129} src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/icon-kakao.png?v=1760090696" alt="" />
                  Zeremonie Kakao Kurs
                </NavLink>
              </li>
            );
          }

          const {to: childTo, isExternal: isExternalChild} =
            resolveMenuItemLink(child);
          const childIcons = (
            <>
              {child.title === "QiOne® 2 Pro" && (<CdnBild breite={45} hoehe={45} anzeigeBreite={45} masterBreite={129} src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/icon-qione.png?v=1760088701" alt="" />)}
              {child.title === "QiBracelet®" && (<CdnBild breite={45} hoehe={45} anzeigeBreite={45} masterBreite={129} src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/icon-bracelet.png?v=1760089233" alt="" />)}
              {child.title === "QiHome® Air" && (<CdnBild breite={45} hoehe={45} anzeigeBreite={45} masterBreite={129} src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/icon-home.png?v=1760089232" alt="" />)}
              {child.title === "Necklace für den QiOne®" && (<CdnBild breite={45} hoehe={45} anzeigeBreite={45} masterBreite={129} src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/icon-necklace.png?v=1760090696" alt="" />)}
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

  // SOLANGE ES DAS PORTAL-ZIEL NICHT GIBT, WIRD INLINE GERENDERT — DAS IST DER
  // GANZE FIX (2026-09-09, Job 20260909-blog-navigation-nicht-gerendert-
  // checkout-domain-prio25). Das Portal-Ziel entsteht in einem useEffect, also
  // NIE beim serverseitigen Rendern; die Vorfassung gab dort `return null`
  // zurück. Folge, am 2026-09-09 am ausgelieferten HTML von qiblanco.com
  // gemessen: 'header-submenu-item' kam 0-mal vor, 'Fachartikel' genau einmal
  // (im Loader-Datenblob, nicht als Anker). Der GESAMTE Inhalt aller vier
  // Dropdowns war für jeden Konsumenten ohne JS unsichtbar — deshalb war der
  // /blogs/-Baum ein Waisenkind und nicht indexiert.
  //
  // Inline und im Portal steht DERSELBE Elementbaum, und er wird in der ersten
  // Client-Rendering-Runde ebenfalls inline gerendert (container ist dann noch
  // null) — die Hydration ist damit deckungsgleich. Erst der useEffect setzt
  // den Container; React unmountet den Inline-Baum dann einmalig und mountet
  // ihn im Portal (Remount, kein Verschieben — der Zustand hoverItem/
  // expandedKakao liegt in DIESER Komponente und überlebt).
  //
  // SICHTBAR ÄNDERT SICH NICHTS: `submenu` trägt inline
  // position:fixed/top:0/left:0 und transform: translateY(-300%), nimmt also
  // nicht am Fluss teil und steht ausserhalb des Sichtfelds. Im Inline-Zustand
  // ist sein Containing Block der Kopf (div.header trägt dauerhaft
  // backdrop-filter, und jeder Wert ausser `none` erzeugt einen) statt des
  // Viewports — bei -300% ohne sichtbare Folge. GEPRUEFT: app/styles/app.css
  // gibt `.submenu` weder `transform` noch `overflow`, die den Inline-Zustand
  // sichtbar machen könnten.
  //
  // DAS PORTAL BLEIBT UND WIRD NICHT ABGEBAUT: .header-wrapper.header--hidden
  // setzt beim Wegscrollen `transform`, und ein transform-Vorfahr bindet
  // position:fixed an sich selbst statt an den Viewport. Genau dafür ist das
  // Portal da (siehe Kopfkommentar dieser Funktion).
  return container ? createPortal(submenu, container) : submenu;
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
  /*
   * KLASSE S über den Marker — aber BEWUSST OHNE eigenen <button> und
   * BEWUSST MIT literalen ★-Glyphen. Beides hat einen eigenen Grund:
   *
   * (1) KEIN eigener Traeger: dieser Badge sitzt bereits in dem <a> des
   *     Ankuendigungsbandes, das onRezensionenKlick trägt. Ein <button>
   *     darin wäre verschachtelte Interaktivitaet. Der Marker genügt, die
   *     Tastaturbedienung liefert das umschliessende <a>. Damit die
   *     Delegation nicht ZUSAETZLICH feuert, schneidet sie über
   *     e.defaultPrevented ab (siehe useSterneSprungDelegation).
   *
   * (2) GLYPHEN BLEIBEN: das Ankuendigungsband steht unter der stehenden
   *     Wache probe-topbanner-2zeilen („wird der Satz mobil mitten im Claim
   *     abgeschnitten?", seit Job 20260731-repair-topbanner-resp). Fuenf
   *     SVG-Sterne statt fuenf Textzeichen aendern die Umbruchbreite eines
   *     mobil engen, bewachten Elements — Risiko ohne Ertrag, denn dieser
   *     Badge war schon vorher der EINE funktionierende Trigger.
   *     Nebeneffekt, der ausdrücklich gewollt ist: das Enumerations-Signal
   *     `glyph` bleibt auf DACH nicht-null. Die Signal-Invariante der Wache
   *     ist MONOTON — faellt ein je gemessenes Signal auf 0, ist das ein
   *     BEFUND. Wer hier doch auf SVG migriert, muss die Basis-Datei
   *     pruefungen/state/sterne_signal_basis.json VORHER von Hand und mit
   *     Begründung pflegen, sonst meldet die Wache den eigenen Bau als
   *     „Signal verstummt" und schickt einen repair-Fall gegen gesunden Code.
   */
  return (
    <span className="ReviewCount" data-qb-rating="s">
      {g.komma} <span className="qb-sterne">{'★'.repeat(5)}</span>
    </span>
  );
}

/*
 * DIE BEWERTUNGSZEILE HAT KEINE EIGENE EIN-/AUSBLENDUNG MEHR.
 *
 * Bis zum 21.09.2026 stand hier `maxHeight: scrolled ? '0px' : '100px'` — die
 * Zeile kollabierte beim ersten gescrollten Pixel und kam erst am
 * Seitenanfang zurück. Sie folgte damit einer ANDEREN Bedingung als das Menü
 * darunter (`hidden`), und deshalb sah Christian das Menü zurückkommen und die
 * Sterne nicht.
 *
 * Verborgen wird sie jetzt ausschließlich dadurch, dass `.header-wrapper` als
 * Ganzes aus dem Bild fährt. Ein Zustand "Menü da, Sterne weg" ist damit nicht
 * mehr herstellbar — das ist der Punkt, nicht die eingesparten Zeilen.
 *
 * `KopfBewertung` ist der Marker, an dem die Abnahme die Zeile IM KOPF
 * wiederfindet. Ohne ihn griffe die Marker-Probe auf `google-rating-badge`
 * zurück — und das ist der Google-Badge weiter unten auf der Seite, der auch
 * dann dasteht, wenn der Kopf gar keine Bewertungszeile trägt.
 */
function AnnouncementBanner({announcement, link, onAnnouncementClick}) {
  return (
    <div className="Header-AnnouncementBanner KopfBewertung">
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
