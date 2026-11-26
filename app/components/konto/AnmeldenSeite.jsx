import {Link, useLoaderData} from 'react-router';
import {useAktionsergebnisUeberRevalidierung} from '~/lib/aktionsergebnis';
import {KontoRahmen} from '~/components/konto/KontoUI';
import {ArtSchalter, FirmenFormular} from '~/components/konto/GeschaeftskundeUI';
import {TEXT} from '~/lib/geschaeftskunde';

/** Seite des Login-Fensters (direkt=false) bzw. der Direktseite /geschaeftskunde (direkt=true). */
export function AnmeldenSeite({direkt}) {
  /** @type {{sp: 'de'|'en', art: string, returnTo: string}} */
  const {sp, art, returnTo} = useLoaderData();
  const antwort = useAktionsergebnisUeberRevalidierung();
  const t = TEXT[sp];
  const andere = new URLSearchParams();
  andere.set('art', art);
  if (t.andersLang === 'en') andere.set('lang', 'en');
  if (returnTo) andere.set('return_to', returnTo);
  const loginZiel = `/account/login${returnTo ? `?return_to=${encodeURIComponent(returnTo)}` : ''}`;
  return (
    <KontoRahmen
      eyebrow={t.eyebrow}
      titel={direkt ? t.direktTitel : t.titel}
      lede={direkt ? t.direktLede : null}
    >
      <Link className="gk-sprache" to={`?${andere.toString()}`} replace preventScrollReset>
        {t.anders}
      </Link>
      {direkt ? null : <ArtSchalter art={art} sp={sp} returnTo={returnTo} />}
      {art === 'privat' && !direkt ? (
        <div className="gk-feld" role="tabpanel">
          <p>{t.privatSatz}</p>
          <a className="konto-cta konto-cta--breit" href={loginZiel}>
            {t.privatKnopf}
          </a>
        </div>
      ) : (
        <div className="gk-feld" role="tabpanel">
          <p>{t.gkSatz}</p>
          <p>{t.gkSatz2}</p>
          <FirmenFormular
            sp={sp}
            action={direkt ? '/geschaeftskunde' : '/account/anmelden'}
            knopf={t.gkKnopf}
            vorbelegung={antwort?.daten}
            fehler={antwort?.fehler}
            art="geschaeftlich"
          />
        </div>
      )}
    </KontoRahmen>
  );
}

