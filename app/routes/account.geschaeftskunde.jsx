import {data as remixData, useLoaderData} from 'react-router';
import {useAktionsergebnisUeberRevalidierung} from '~/lib/aktionsergebnis';
import {KontoAbschnitt, KontoErfolg, KontoFehler} from '~/components/konto/KontoUI';
import {FirmenFormular, GkStatus} from '~/components/konto/GeschaeftskundeUI';
import {TEXT, datenAusFormular, spracheAus} from '~/lib/geschaeftskunde';
import {anmelden, hole, status} from '~/lib/geschaeftskunde.server';
import gkStyles from '~/styles/konto-geschaeftskunde.css?url';

/**
 * /account/geschaeftskunde — das Geschäftskonto des angemeldeten Kunden.
 *
 *   Kommt der Kunde aus dem Login-Fenster (Geschäftlich), liegen seine
 *   Firmendaten in der Sitzung: der Loader meldet sie beim Server an (VIES +
 *   BZSt, Nachweis, eigenes Angebot) und löscht den Merkposten.
 *   Sonst fragt er den Stand ab; bestehende Kunden legen hier ihre
 *   Geschäftsadresse an („Geschäftsadresse hinzufügen“).
 *
 * Bestellt wird über das Angebot des Kunden (b2b.dienst.qiblanco.com/angebot/…):
 * Kakao 38 € netto je Tüte, Qi Alpha® netto, versandfrei ab 200 € netto,
 * gültige Nummer aus einem anderen EU-Land ohne MwSt, sonst mit MwSt.
 * Die Shopify-Kasse selbst kann Nettopreise je Kunde nicht (Inklusivpreise).
 */
export function links() {
  return [{rel: 'stylesheet', href: gkStyles}];
}

export const meta = () => [{title: 'Geschäftskunde | Qi Blanco'}, {name: 'robots', content: 'noindex'}];

const KOPF = {'Cache-Control': 'no-cache, no-store, must-revalidate'};

export async function loader({request, context}) {
  await context.customerAccount.handleAuthStatus();
  const sp = spracheAus(request.url);
  const gemerkt = hole(context);
  const gk = gemerkt ? await anmelden(context, gemerkt) : await status(context);
  return remixData({sp, gk, neu: Boolean(gemerkt && gk?.ok)}, {headers: KOPF});
}

export async function action({request, context}) {
  await context.customerAccount.handleAuthStatus();
  let form;
  try {
    form = await request.formData();
  } catch {
    return {fehler: TEXT.de.fehlt};
  }
  const sp = form.get('lang') === 'en' ? 'en' : 'de';
  const {daten, fehler} = datenAusFormular(form, sp);
  if (fehler) return {fehler, daten};
  const r = await anmelden(context, daten);
  if (!r?.ok) return {fehler: TEXT[sp].stoerung, daten};
  return {gespeichert: true};
}

export default function Geschaeftskundenbereich() {
  const {sp, gk, neu} = useLoaderData();
  const antwort = useAktionsergebnisUeberRevalidierung();
  const t = TEXT[sp];
  if (!gk?.ok) {
    return <KontoFehler>{t.stoerung}</KontoFehler>;
  }
  return (
    <div className="gk-bereich">
      {neu || antwort?.gespeichert ? <KontoErfolg>{t.gespeichert}</KontoErfolg> : null}
      {gk.geschaeftskunde ? (
        <KontoAbschnitt titel={t.kontoTitel}>
          <GkStatus gk={gk} sp={sp} />
        </KontoAbschnitt>
      ) : null}
      <KontoAbschnitt
        titel={gk.geschaeftskunde ? t.aendern : t.hinzufuegen}
        beschreibung={gk.geschaeftskunde ? null : t.keinGk}
      >
        <FirmenFormular
          sp={sp}
          action="/account/geschaeftskunde"
          knopf={t.gkSpeichern}
          vorbelegung={antwort?.daten || (gk.geschaeftskunde ? {firma: gk.firma, uid: gk.uid, adresse: gk.adresse} : null)}
          fehler={antwort?.fehler}
        />
      </KontoAbschnitt>
    </div>
  );
}
