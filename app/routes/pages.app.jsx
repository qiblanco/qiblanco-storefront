// app/routes/pages.app.jsx
// Infoseite der App „Qi Blanco Studio“ (TikTok-Entwicklerportal, App-ID 7690627219365890056) — Elina 21.11.2026,
// EL-20261121-0e107d81. Diese Adresse (qiblanco.com/pages/app) steht als Website-URL der App im TikTok-Entwicklerportal
// und bleibt auch nach der App-Prüfung dauerhaft online. Nicht im Menü verlinkt, noindex (nicht in der Google-Suche),
// aber ohne Anmeldung für jeden mit dem Link frei erreichbar.
// Look: Quiet Luxury (warme Fläche, Serifen-Titel, Gold als Akzent), Mobile First, Text zuerst Englisch, darunter
// Deutsch. Bewegung: Baukasten elina-design-regel (useElinaBewegung); der erste Bildschirm ist sofort da.
// Rückbau: diese Datei und app/styles/app-studio.css löschen.
import {useRef} from 'react';
import {canonicalLink} from '~/lib/seo';
import {seitenSignale} from '~/lib/seiten-seo';
import {useElinaBewegung} from '~/components/reusables/useElinaBewegung';
import elinaBewegungStyles from '~/styles/elina-bewegung.css?url';
import appStudioStyles from '~/styles/app-studio.css?url';

const PFAD = '/pages/app';
const STUDIO_URL = 'https://app.qiblanco.com';
export const GEAENDERT = '2026-11-22';

export function links() {
  return [
    {rel: 'stylesheet', href: elinaBewegungStyles},
    {rel: 'stylesheet', href: appStudioStyles},
  ];
}

export const meta = () => {
  const titel = 'Qi Blanco Studio | Qi Blanco';
  const beschreibung =
    'Qi Blanco Studio is the content tool of the German brand Qi Blanco for planning, previewing and publishing its own posts.';
  return [
    {title: titel},
    {name: 'description', content: beschreibung},
    // Nicht im Menü und nicht in der Google-Suche, aber für jeden mit dem Link offen (TikTok-Prüfer).
    {name: 'robots', content: 'noindex,nofollow'},
    canonicalLink(PFAD),
    ...seitenSignale({pfad: PFAD, titel, beschreibung}),
  ];
};

export default function AppStudioSeite() {
  const wurzel = useRef(null);
  useElinaBewegung(wurzel);
  return (
    <main ref={wurzel} className="qbs-seite">
      <div className="qbs-rahmen">
        <header className="qbs-kopf">
          <p className="qbs-marke">Qi Blanco</p>
          <h1 className="qbs-titel">Qi Blanco Studio</h1>
        </header>

        <section className="qbs-sprache" lang="en" aria-label="English">
          <p className="qbs-etikett">English</p>
          <p className="qbs-text">
            Qi Blanco Studio is the content tool of the German brand Qi Blanco. Our team uses it to plan, preview
            and publish the brand’s own videos and photo posts to our own social media accounts, including TikTok.
            Every post is reviewed and released by a person.
          </p>
        </section>

        <div className="qbs-linie" data-eb="linie" aria-hidden="true" />

        <section className="qbs-sprache" lang="de" aria-label="Deutsch" data-eb="">
          <p className="qbs-etikett">Deutsch</p>
          <p className="qbs-text">
            Qi Blanco Studio ist das Content-Werkzeug der deutschen Marke Qi Blanco. Unser Team plant, prüft in der
            Vorschau und veröffentlicht damit die eigenen Videos und Fotobeiträge der Marke auf unseren eigenen
            Social-Media-Konten, auch auf TikTok. Jeder Beitrag wird von einem Menschen geprüft und freigegeben.
          </p>
        </section>

        <div className="qbs-knopf-zeile" data-eb="">
          <a className="qbs-knopf" href={STUDIO_URL} rel="noopener">
            Open Studio / Zum Studio
          </a>
        </div>

        <nav className="qbs-rechtliches" aria-label="Legal / Rechtliches" data-eb="gruppe">
          <a href="https://qi-blanco.com/policies/privacy-policy">Privacy Policy / Datenschutzerklärung</a>
          <a href="/policies/terms-of-service">Terms of Service / AGB</a>
        </nav>
      </div>
    </main>
  );
}
