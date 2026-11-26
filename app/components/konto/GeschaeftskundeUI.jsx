import {useEffect, useRef, useState} from 'react';
import {Form, Link, useFetcher, useNavigation} from 'react-router';
import {LAENDER, PRUEF_ROUTE, TEXT, uidFormOk, uidNorm} from '~/lib/geschaeftskunde';

/**
 * Bausteine des Geschäftskontos (Login-Schalter Privat / Geschäftlich,
 * Firmendaten mit Live-Prüfung, Status im Konto). Stil: konto.css-Tokens,
 * Ergänzungen in konto-geschaeftskunde.css (gleicher Scope .konto).
 */

/**
 * Umschalter Privat / Geschäftlich. Zwei echte Links (?art=…): ohne
 * JavaScript schaltet der Server um, mit JavaScript ohne Seitenwechsel.
 */
export function ArtSchalter({art, sp, returnTo}) {
  const t = TEXT[sp];
  const ziel = (a) => {
    const q = new URLSearchParams();
    q.set('art', a);
    if (sp === 'en') q.set('lang', 'en');
    if (returnTo) q.set('return_to', returnTo);
    return `?${q.toString()}`;
  };
  return (
    <div className="gk-schalter" role="tablist" aria-label={`${t.privat} / ${t.geschaeftlich}`}>
      {['privat', 'geschaeftlich'].map((a) => (
        <Link
          key={a}
          role="tab"
          aria-selected={art === a}
          className={art === a ? 'gk-schalter__knopf gk-schalter__knopf--aktiv' : 'gk-schalter__knopf'}
          to={ziel(a)}
          replace
          preventScrollReset
        >
          {a === 'privat' ? t.privat : t.geschaeftlich}
        </Link>
      ))}
    </div>
  );
}

/** Grün / rot / grau: das Ergebnis der EU-Prüfung, im Fenster sichtbar. */
export function PruefMarke({zustand, name, sp}) {
  const t = TEXT[sp];
  if (!zustand) return null;
  if (zustand === 'prueft') {
    return (
      <p className="gk-marke" role="status">
        {t.prueft}
      </p>
    );
  }
  if (zustand === 'gueltig') {
    return (
      <p className="gk-marke gk-marke--gruen" role="status">
        <span aria-hidden="true">✓</span> {t.gruen}
        {name ? `: ${name}` : ''}
      </p>
    );
  }
  return (
    <p className="gk-marke gk-marke--rot" role="status">
      <span aria-hidden="true">!</span> {zustand === 'nicht_pruefbar' ? t.weg : t.rot}
    </p>
  );
}

/**
 * Firmendaten: Firmenname, USt-IdNr. (sofort bei der EU geprüft, sobald das
 * Feld verlassen wird), Geschäftsadresse. Gesendet wird an `action`.
 */
export function FirmenFormular({sp, action, knopf, vorbelegung, fehler, art}) {
  const t = TEXT[sp];
  const v = vorbelegung || {};
  const a = v.adresse || {};
  const pruef = useFetcher();
  const nav = useNavigation();
  const [land, setLand] = useState(a.land || (sp === 'en' ? 'PT' : 'DE'));
  const [uid, setUid] = useState(v.uid || '');
  const letzte = useRef('');
  const [zustand, setZustand] = useState('');

  function pruefe(naechsteUid, naechstesLand) {
    const u = uidNorm(naechsteUid);
    if (!u || !uidFormOk(u)) {
      setZustand(u ? 'ungueltig' : '');
      return;
    }
    const schluessel = `${u}|${naechstesLand}`;
    if (letzte.current === schluessel) return;
    letzte.current = schluessel;
    setZustand('prueft');
    pruef.submit({uid: u, land: naechstesLand}, {method: 'POST', action: PRUEF_ROUTE});
  }

  useEffect(() => {
    if (pruef.state !== 'idle' || !pruef.data) return;
    setZustand(pruef.data.ok ? pruef.data.status || 'nicht_pruefbar' : 'nicht_pruefbar');
  }, [pruef.state, pruef.data]);

  const sendet = nav.state === 'submitting';
  return (
    <Form method="POST" action={action} className="konto-form gk-form" noValidate>
      {art ? <input type="hidden" name="art" value={art} /> : null}
      <input type="hidden" name="lang" value={sp} />
      <label className="konto-honeypot" aria-hidden="true">
        <span>Website</span>
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>
      <label htmlFor="gk-firma">
        <span>{t.firma}</span>
        <input id="gk-firma" name="firma" type="text" autoComplete="organization" required defaultValue={v.firma || ''} />
      </label>
      <label htmlFor="gk-land">
        <span>{t.land}</span>
        <select
          id="gk-land"
          name="land"
          autoComplete="country"
          value={land}
          onChange={(e) => {
            setLand(e.target.value);
            pruefe(uid, e.target.value);
          }}
        >
          {LAENDER.map(([code, de, en]) => (
            <option key={code} value={code}>
              {sp === 'en' ? en : de}
            </option>
          ))}
        </select>
      </label>
      <label htmlFor="gk-uid">
        <span>{t.uid}</span>
        <input
          id="gk-uid"
          name="uid"
          type="text"
          inputMode="text"
          autoCapitalize="characters"
          spellCheck={false}
          required
          value={uid}
          aria-describedby="gk-uid-marke"
          onChange={(e) => setUid(e.target.value)}
          onBlur={() => pruefe(uid, land)}
        />
      </label>
      <div id="gk-uid-marke" aria-live="polite">
        <PruefMarke zustand={zustand} name={pruef.data?.name} sp={sp} />
      </div>
      <label htmlFor="gk-strasse">
        <span>{t.strasse}</span>
        <input id="gk-strasse" name="strasse" type="text" autoComplete="address-line1" required defaultValue={a.strasse || ''} />
      </label>
      <div className="konto-form__paar">
        <label htmlFor="gk-plz">
          <span>{t.plz}</span>
          <input id="gk-plz" name="plz" type="text" autoComplete="postal-code" required defaultValue={a.plz || ''} />
        </label>
        <label htmlFor="gk-ort">
          <span>{t.ort}</span>
          <input id="gk-ort" name="ort" type="text" autoComplete="address-level2" required defaultValue={a.ort || ''} />
        </label>
      </div>
      {fehler ? (
        <p className="konto-fehler" role="alert">
          {fehler}
        </p>
      ) : null}
      <div className="konto-form__knoepfe">
        <button className="konto-cta konto-cta--breit" type="submit" disabled={sendet}>
          {knopf}
        </button>
      </div>
    </Form>
  );
}

/** Status-Karte im Konto: Firma, Nummer, Prüfung mit Datum und Kennung, Bestellweg. */
export function GkStatus({gk, sp}) {
  const t = TEXT[sp];
  const gruen = gk.status === 'gueltig';
  const datum = gk.geprueft_am
    ? new Date(gk.geprueft_am).toLocaleString(sp === 'en' ? 'en-GB' : 'de-DE', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Europe/Berlin',
      })
    : '';
  const hinweis = gk.ohne_mwst ? t.ohneMwst : gk.land === 'DE' && gruen ? t.mitMwstInland : t.mitMwst;
  return (
    <article className="konto-karte gk-status">
      <div className="konto-karte__kopf">
        <h3 className="konto-karte__titel">{gk.firma}</h3>
        <span className={gruen ? 'konto-merker konto-merker--gold' : 'konto-merker'}>
          {gruen ? t.statusGruen : gk.status === 'nicht_pruefbar' ? t.statusWeg : t.statusRot}
        </span>
      </div>
      <dl className="gk-daten">
        <div>
          <dt>{t.status}</dt>
          <dd>{gk.uid}</dd>
        </div>
        <div>
          <dt>{t.strasse}</dt>
          <dd>
            {gk.adresse?.strasse}, {gk.adresse?.plz} {gk.adresse?.ort}, {gk.adresse?.land}
          </dd>
        </div>
        {datum ? (
          <div>
            <dt>{t.geprueft}</dt>
            <dd>{datum}</dd>
          </div>
        ) : null}
        {gk.vies_kennung ? (
          <div>
            <dt>{t.kennung}</dt>
            <dd className="gk-kennung">{gk.vies_kennung}</dd>
          </div>
        ) : null}
      </dl>
      <p className={gk.ohne_mwst ? 'gk-marke gk-marke--gruen' : 'gk-marke'}>{hinweis}</p>
      {gk.angebot_url ? (
        <>
          <p className="konto-meta">{t.preise}</p>
          <div className="konto-form__knoepfe">
            <a className="konto-cta konto-cta--breit" href={gk.angebot_url} rel="noopener">
              {t.bestellen}
            </a>
          </div>
        </>
      ) : null}
    </article>
  );
}
