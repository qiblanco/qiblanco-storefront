/**
 * ROUTER-SHIM DES CRYSTAL-SPIEGELS.
 *
 * Der Erzeuger (crystal-cacao-node/bin/spiegel-nachzug) schreibt in jeder
 * Spiegel-Datei `from 'react-router'` auf dieses Modul um. Es reicht alles
 * unverändert durch und ersetzt genau vier Namen, damit der Spiegel in
 * crystal-Koordinaten rechnen darf (Begründung: ./pfade.js):
 *   Link, NavLink   übersetzen `to` über zuQiblanco(); ein Ziel, das es nur
 *                   auf crystal-cacao.com gibt, wird ein gewöhnliches <a>.
 *   useLocation     liefert den crystal-Pfad (`/` statt `/pages/crystal-cacao`),
 *                   damit crystals eigene Weichen („bin ich auf der Startseite?“)
 *                   im Spiegel dasselbe entscheiden wie im Original.
 *   useNavigate     übersetzt Ziele wie Link.
 *
 * Lokale Exporte überdecken gleichnamige aus `export *` (ECMAScript-Regel) —
 * deshalb genügt das Durchreichen ohne Namensliste.
 */
import {forwardRef, useCallback, useMemo} from 'react';
import {
  Link as RouterLink,
  NavLink as RouterNavLink,
  useLocation as useRouterLocation,
  useNavigate as useRouterNavigate,
} from 'react-router';
import {istExtern, zuCrystal, zuQiblanco} from './pfade';

export * from 'react-router';

/** Router-eigene Props, die an einem gewöhnlichen <a> nichts zu suchen haben. */
function ohneRouterProps({
  prefetch: _prefetch,
  reloadDocument: _reloadDocument,
  replace: _replace,
  state: _state,
  preventScrollReset: _preventScrollReset,
  viewTransition: _viewTransition,
  end: _end,
  caseSensitive: _caseSensitive,
  discover: _discover,
  relative: _relative,
  ...anker
}) {
  return anker;
}

export const Link = forwardRef(function SpiegelLink({to, ...rest}, ref) {
  const ziel = zuQiblanco(to);
  if (istExtern(ziel)) {
    return <a ref={ref} href={ziel} {...ohneRouterProps(rest)} />;
  }
  return <RouterLink ref={ref} to={ziel} {...rest} />;
});

export const NavLink = forwardRef(function SpiegelNavLink(
  {to, className, style, children, ...rest},
  ref,
) {
  const ziel = zuQiblanco(to);
  if (istExtern(ziel)) {
    const zustand = {isActive: false, isPending: false, isTransitioning: false};
    return (
      <a
        ref={ref}
        href={ziel}
        className={typeof className === 'function' ? className(zustand) : className}
        style={typeof style === 'function' ? style(zustand) : style}
        {...ohneRouterProps(rest)}
      >
        {typeof children === 'function' ? children(zustand) : children}
      </a>
    );
  }
  return (
    <RouterNavLink ref={ref} to={ziel} className={className} style={style} {...rest}>
      {children}
    </RouterNavLink>
  );
});

export function useLocation() {
  const ort = useRouterLocation();
  return useMemo(() => ({...ort, pathname: zuCrystal(ort.pathname)}), [ort]);
}

export function useNavigate() {
  const navigiere = useRouterNavigate();
  return useCallback(
    (ziel, optionen) => {
      if (typeof ziel === 'number') return navigiere(ziel);
      const neu = zuQiblanco(ziel);
      if (istExtern(neu)) {
        window.location.assign(neu);
        return undefined;
      }
      return navigiere(neu, optionen);
    },
    [navigiere],
  );
}
