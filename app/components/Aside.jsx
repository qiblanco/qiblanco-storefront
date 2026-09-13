import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

/**
 * A side bar component with Overlay
 * @example
 * ```jsx
 * <Aside type="search" heading="SEARCH">
 *  <input type="search" />
 *  ...
 * </Aside>
 * ```
 * @param {{
 *   children?: React.ReactNode;
 *   type: AsideType;
 *   heading: React.ReactNode;
 * }}
 */
export function Aside({children, heading, type}) {
  const {type: activeType, close} = useAside();
  const expanded = type === activeType;

  useEffect(() => {
    const abortController = new AbortController();

    if (expanded) {
      document.addEventListener(
        'keydown',
        function handler(event) {
          if (event.key === 'Escape') {
            close();
          }
        },
        {signal: abortController.signal},
      );
    }
    return () => abortController.abort();
  }, [close, expanded]);

  return (
    <div
      aria-modal
      className={`overlay ${expanded ? 'expanded' : ''}`}
      role="dialog"
    >
      <button className="close-outside" onClick={close} />
      {/* Der Typ steht als Klasse am Element, weil derselbe Drawer drei sehr
          verschiedene Inhalte trägt (cart / search / mobile) und genau EINER
          davon sein Scrollen abgeben muss: beim Warenkorb scrollt die
          Positionsliste, bei Suche und Menü die Zone selbst. Ohne diesen
          Haken müsste das CSS über :has() raten. */}
      <aside className={`aside--${type}`}>
        <main>
        <header>
          <h3>{heading === "MENU" ? 'Menü' : heading}</h3>
          <button className="close reset" onClick={close} aria-label="Schließen">
            &times;
          </button>
        </header>
          {children}

          </main>
      </aside>
    </div>
  );
}

const AsideContext = createContext(null);

Aside.Provider = function AsideProvider({children}) {
  const [type, setType] = useState('closed');

  // Der Kontextwert wird gemerkt statt bei jedem Rendern neu gebaut, und zwar
  // aus einem gemessenen Grund (Job 20260913-react421-..., Befund s03 des
  // Grossjobs ...-restbruch-hydration-standardseiten): unter diesem Provider
  // liegen ALLE VIER <Suspense>-Grenzen der App (Footer, Warenkorb-Drawer,
  // Konto-Link, Warenkorb-Zaehler). Ein Inline-Literal ist bei jedem Rendern
  // ein anderes Objekt; React startet darauf `propagateContextChange`,
  // und eine noch nicht hydrierte Grenze, in deren Teilbaum dadurch etwas
  // eingeplant wird, gibt ihr Server-HTML auf und rendert im Client neu
  // (React #421, react-dom.development.js:20712 --
  // `includesSomeLane(renderLanes, current.childLanes)`).
  //
  // WAS DAS HEILT UND WAS NICHT -- die Unterscheidung ist der ganze Punkt:
  // Gerendert wird dieser Provider auch dann neu, wenn ein VORFAHRE rendert
  // (PageLayout baut seine Kinder neu). Dann hat sich `type` nicht bewegt und
  // es gibt sachlich keine Kontextaenderung -- ohne Memo entstand trotzdem
  // eine. Genau dieser Fall faellt weg. Der Fall "jemand macht wirklich einen
  // Drawer auf" aendert `type` und damit weiterhin den Kontextwert; das ist
  // richtig so (ohne diese Meldung bliebe der Drawer zu) und durch ein Memo
  // baulich nicht heilbar -- dagegen hilft nur `startTransition` um das
  // ausloesende Update.
  //
  // `close` braucht sein eigenes useCallback: als Inline-Pfeil ist es bei
  // jedem Rendern neu und entwertet das Memo jedes Mal. Es steht ausserdem
  // in der Abhaengigkeitsliste des Escape-Handlers in `Aside`
  // ([close, expanded]) -- stabil gehalten wird der Handler dort jetzt nicht
  // mehr bei jedem Rendern ab- und wieder angemeldet.
  const close = useCallback(() => setType('closed'), []);
  const wert = useMemo(
    () => ({type, open: setType, close}),
    [type, close],
  );

  return (
    <AsideContext.Provider value={wert}>{children}</AsideContext.Provider>
  );
};

export function useAside() {
  const aside = useContext(AsideContext);
  if (!aside) {
    throw new Error('useAside must be used within an AsideProvider');
  }
  return aside;
}

/** @typedef {'search' | 'cart' | 'mobile' | 'closed'} AsideType */
/**
 * @typedef {{
 *   type: AsideType;
 *   open: (mode: AsideType) => void;
 *   close: () => void;
 * }} AsideContextValue
 */

/** @typedef {import('react').ReactNode} ReactNode */
