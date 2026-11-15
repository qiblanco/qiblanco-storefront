import {Fragment, useRef, useState} from 'react';
import {KontoAbschnitt, KontoLeer} from '~/components/konto/KontoUI';
import {
  gruppiere,
  hatPlatzhalter,
  linkFuerProdukt,
  textMitLink,
  textTeile,
} from '~/lib/partner-saleskit';

/**
 * Darstellung des Partnerbereichs (/account/partner).
 *
 * REGEL WIE IN KontoUI.jsx: hier steht keine Datenbeschaffung, nur Darstellung
 * aus Props. Die Daten holt der Loader der Route beim Datendienst des Servers
 * (partnerbereich), der das Shopify-Kundentoken selbst prüft und nur den
 * Datensatz der bestätigten Mailadresse zurückgibt.
 *
 * Beträge sind eine Lesekopie aus UpPromote mit Zeitstempel. Gerechnet und
 * ausgezahlt wird dort; deshalb steht neben den Zahlen der Weg zu UpPromote.
 */

const EUR = new Intl.NumberFormat('de-DE', {style: 'currency', currency: 'EUR'});
// Ganzer Betrag ohne Nachkommastellen ("50 €"), sonst cent-genau (Christian 13.10.2026).
const EUR_GANZ = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});
const ZAHL = new Intl.NumberFormat('de-DE');
const STAND = new Intl.DateTimeFormat('de-DE', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Europe/Berlin',
});
const TAG = new Intl.DateTimeFormat('de-DE', {dateStyle: 'medium', timeZone: 'UTC'});

const STATUS_TEXT = {pending: 'offen', approved: 'freigegeben', paid: 'ausgezahlt'};

function geld(wert) {
  const n = Number(wert) || 0;
  return (Math.round(n * 100) % 100 === 0 ? EUR_GANZ : EUR).format(n);
}

function tag(iso) {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? iso : TAG.format(d);
}

export function standText(iso) {
  const d = iso ? new Date(iso) : null;
  return d && !Number.isNaN(d.getTime()) ? `${STAND.format(d)} Uhr` : 'unbekannt';
}

function Kachel({wert, text}) {
  return (
    <div className="partner-kachel">
      <span className="partner-kachel__wert">{wert}</span>
      <span className="partner-kachel__text">{text}</span>
    </div>
  );
}

/** Abschnitt 1: Kennzahlen aus UpPromote. */
export function PartnerZahlen({konto, stand, veraltet, portal}) {
  const v = konto.verkaeufe || {};
  const p = konto.provision || {};
  const klicks = konto.klicks;
  const letzte = v.letzte || [];
  return (
    <KontoAbschnitt
      titel="Deine Zahlen"
      beschreibung={`Stand ${standText(stand)}. Auszahlung und Kontodaten verwaltest du in UpPromote.`}
    >
      {veraltet ? (
        <p className="konto-fehler" role="status">
          Diese Zahlen sind älter als sechs Stunden. Den aktuellen Stand zeigt UpPromote.
        </p>
      ) : null}
      <div className="partner-kacheln">
        <Kachel
          wert={klicks ? ZAHL.format(klicks.tage_30 || 0) : '–'}
          text="Klicks, 30 Tage"
        />
        <Kachel wert={ZAHL.format(v.tage_30?.anzahl || 0)} text="Verkäufe, 30 Tage" />
        <Kachel wert={geld(p.offen)} text="Provision offen" />
        <Kachel wert={geld(p.freigegeben)} text="Provision freigegeben" />
        <Kachel wert={geld(p.ausgezahlt)} text="Bereits ausgezahlt" />
      </div>
      <p className="partner-luft">
        Seit {tag(konto.seit)}: {ZAHL.format(v.gesamt || 0)} Verkäufe über deinen Code oder Link,{' '}
        {geld(v.umsatz_gesamt)} Umsatz. In 90 Tagen: {ZAHL.format(v.tage_90?.anzahl || 0)} Verkäufe
        {klicks ? `, ${ZAHL.format(klicks.tage_90 || 0)} Klicks` : ''}.
      </p>
      {letzte.length ? (
        <div className="konto-karte partner-luft">
          <h3 className="konto-karte__titel">Letzte Verkäufe</h3>
          <ul className="partner-liste">
            {letzte.map((z, i) => (
              <li key={`${z.datum}-${i}`} className="partner-liste__zeile">
                <span>{tag(z.datum)}</span>
                <span>{geld(z.betrag)}</span>
                <span>Provision {geld(z.provision)}</span>
                <span className="konto-merker">{STATUS_TEXT[z.status] || z.status}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="konto-form__knoepfe--luft">
        <a className="konto-cta konto-cta--sekundaer" href={portal} rel="noopener">
          Zu UpPromote: Auszahlung und Kontodaten
        </a>
      </div>
    </KontoAbschnitt>
  );
}

/** Abschnitt 2: Sales-Kit mit persönlichem Link je Produkt. */
export function PartnerKit({konto, provisionProzent}) {
  const links = (konto.links || []).filter((l) => l.link);
  return (
    <KontoAbschnitt
      titel="Dein Sales-Kit"
      beschreibung="Fertige Sätze, Bilder und Links mit deiner Kennung. Erzähl dazu, was du selbst erlebst."
    >
      <div className="konto-karte">
        <h3 className="konto-karte__titel">Dein Link und dein Code</h3>
        {konto.link ? <p className="partner-code">{konto.link}</p> : null}
        {(konto.codes || []).map((c) => (
          <p key={c} className="partner-code">
            {c}
          </p>
        ))}
        {provisionProzent ? (
          <p className="konto-meta">
            {provisionProzent} % Provision auf jedes Produkt, auch auf Crystal Cacao®.
          </p>
        ) : null}
      </div>
      <div className="partner-produkte partner-luft">
        {links.map((l) => (
          <article key={l.name} className="konto-karte partner-produkt">
            {l.bild ? (
              <img
                className="partner-produkt__bild"
                src={l.bild}
                alt={l.name}
                loading="lazy"
                width="160"
                height="160"
              />
            ) : null}
            <div>
              <h3 className="konto-karte__titel">{l.name}</h3>
              <p>{l.kurztext}</p>
              <p className="partner-code">{l.link}</p>
            </div>
          </article>
        ))}
      </div>
    </KontoAbschnitt>
  );
}

/*
 * SALES-KIT STUFE 2 (Job 20261007-sales-kit-stufe2-einbindung-partnerbereich):
 * Kundenfragen, Einwände und Beispieltexte. Die Texte kommen aus
 * bereich.gemeinsam.saleskit (Datendienst, eine Quelle auf dem Server); hier
 * steht keiner davon. `melde` zählt geöffnete Kapitel und Kopier-Klicks, jedes
 * Kapitel höchstens einmal je Seitenaufruf. `offen` klappt die Abschnitte auf
 * (nur die Mess-Vorschau setzt es, damit die Rubrik den Inhalt sieht).
 */

const KEIN_MELDER = () => {};

// Überschrift je Produktwelt des Kits. Unbekannte Welten bekommen eine neutrale.
const WELT_TITEL = {
  frequenzmedizin: 'QiOne® 2 Pro, QiBracelet® und QiHome® Air',
  kakao: 'Crystal Cacao®',
};

function kitBereit(saleskit) {
  return saleskit && saleskit.status === 'ok';
}

/** Meldet ein Öffnen nur einmal je Seitenaufruf und nur beim Aufklappen. */
function useEinmalMelder(melde) {
  const gemeldet = useRef(new Set());
  return (abschnitt, id = '') =>
    (ereignis) => {
      if (!ereignis.currentTarget.open) return;
      const k = `${abschnitt}:${id}`;
      if (gemeldet.current.has(k)) return;
      gemeldet.current.add(k);
      melde({abschnitt, art: 'aufgeklappt', id});
    };
}

async function inZwischenablage(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // ohne Freigabe der Zwischenablage: unten der alte Weg
  }
  try {
    const feld = document.createElement('textarea');
    feld.value = text;
    feld.setAttribute('readonly', '');
    feld.style.position = 'fixed';
    feld.style.opacity = '0';
    document.body.appendChild(feld);
    feld.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(feld);
    return ok;
  } catch {
    return false;
  }
}

function FrageEintrag({frage, antwort, hinweis, beimOeffnen, offen}) {
  return (
    <li>
      <details
        className="partner-frage"
        open={offen || undefined}
        onToggle={beimOeffnen}
      >
        <summary>{frage}</summary>
        <div className="partner-frage__antwort">
          <p>{antwort}</p>
          {hinweis ? (
            <p className="partner-hinweis">
              <strong>Für dich:</strong> {hinweis}
            </p>
          ) : null}
        </div>
      </details>
    </li>
  );
}

/** Abschnitt: Kundenfragen und Einwände, je Produktwelt, häufigste zuerst. */
export function PartnerFragen({saleskit, melde = KEIN_MELDER, offen = false}) {
  const beimOeffnen = useEinmalMelder(melde);
  if (!kitBereit(saleskit)) return null;
  const fragen = saleskit.fragen || [];
  const einwaende = saleskit.einwaende || [];
  if (!fragen.length && !einwaende.length) return null;
  const welten = gruppiere([...fragen, ...einwaende], (e) => e.welt);
  return (
    <KontoAbschnitt
      titel="Kundenfragen und Einwände"
      beschreibung="Das fragen Kundinnen und Kunden uns am häufigsten. Zu jeder Frage steht eine Antwort, die du so weitergeben kannst."
    >
      <details
        className="konto-aufklappen partner-klappe"
        open={offen || undefined}
        onToggle={beimOeffnen('fragen')}
      >
        <summary>
          {fragen.length} Fragen und {einwaende.length} Einwände zeigen
        </summary>
        <div className="konto-aufklappen__inhalt">
          {welten.map((welt) => {
            const wf = welt.eintraege.filter((e) => e.frage);
            const we = welt.eintraege.filter((e) => e.einwand);
            return (
              <div key={welt.schluessel} className="partner-welt">
                <h3 className="konto-karte__titel">
                  {WELT_TITEL[welt.schluessel] || 'Weitere Produkte'}
                </h3>
                {wf.length ? (
                  <>
                    <p className="partner-label">Häufige Fragen</p>
                    <ul className="partner-fragen">
                      {wf.map((f, i) => (
                        <FrageEintrag
                          key={f.id}
                          frage={f.frage}
                          antwort={f.antwort}
                          hinweis={f.hinweis}
                          offen={offen && i === 0}
                          beimOeffnen={beimOeffnen('fragen', f.id)}
                        />
                      ))}
                    </ul>
                  </>
                ) : null}
                {we.length ? (
                  <>
                    <p className="partner-label">Einwände</p>
                    <ul className="partner-fragen">
                      {we.map((e, i) => (
                        <FrageEintrag
                          key={e.id}
                          frage={`„${e.einwand}“`}
                          antwort={e.antwort}
                          hinweis={e.hinweis}
                          offen={offen && i === 0}
                          beimOeffnen={beimOeffnen('einwaende', e.id)}
                        />
                      ))}
                    </ul>
                  </>
                ) : null}
              </div>
            );
          })}
        </div>
      </details>
    </KontoAbschnitt>
  );
}

/** Ein Beispieltext mit eingesetztem Link und Kopieren-Knopf. */
function PartnerText({text, link, melde}) {
  const [zustand, setZustand] = useState('bereit');
  const teile = textTeile(text.text, link);
  const fertig = textMitLink(text.text, link);

  async function kopieren() {
    melde({abschnitt: 'beispieltexte', art: 'kopiert', id: text.id});
    const ok = await inZwischenablage(fertig);
    setZustand(ok ? 'kopiert' : 'fehler');
    if (ok) setTimeout(() => setZustand('bereit'), 3000);
  }

  return (
    <article className="konto-karte partner-text">
      <h3 className="konto-karte__titel">{text.kanal}</h3>
      {text.betreff ? (
        <p className="konto-meta">
          Betreff: <span className="partner-betreff">{text.betreff}</span>
        </p>
      ) : null}
      <p className="partner-text__inhalt">
        {teile.map((t, i) =>
          t.art === 'link' ? (
            <span key={i} className="partner-text__link">
              {t.wert}
            </span>
          ) : (
            <Fragment key={i}>{t.wert}</Fragment>
          ),
        )}
      </p>
      {hatPlatzhalter(fertig) ? (
        <p className="konto-meta">
          Setz vor dem Senden die Stellen in eckigen Klammern ein.
        </p>
      ) : null}
      <div className="partner-text__fuss">
        <button
          type="button"
          className="konto-cta konto-cta--sekundaer"
          onClick={kopieren}
        >
          Text kopieren
        </button>
        <span className="konto-meta" aria-live="polite">
          {zustand === 'kopiert' ? 'Kopiert, mit deinem Link.' : null}
          {zustand === 'fehler'
            ? 'Kopieren ging nicht. Markier den Text und kopier ihn von Hand.'
            : null}
        </span>
      </div>
    </article>
  );
}

/** Abschnitt: Beispieltexte je Produkt und Kanal, mit dem Link des Partners. */
export function PartnerBeispieltexte({
  konto,
  saleskit,
  melde = KEIN_MELDER,
  offen = false,
}) {
  const beimOeffnen = useEinmalMelder(melde);
  const produkte = gruppiere(
    kitBereit(saleskit) ? saleskit.beispieltexte : [],
    (t) => t.produkt,
  );
  const [wahl, setWahl] = useState(produkte[0]?.schluessel || '');
  if (!produkte.length) return null;
  const gruppe = produkte.find((p) => p.schluessel === wahl) || produkte[0];
  const anzahl = produkte.reduce((n, p) => n + p.eintraege.length, 0);
  return (
    <KontoAbschnitt
      titel="Beispieltexte"
      beschreibung="Fertige Texte je Produkt für deine Kanäle, dein Link ist schon eingesetzt. Nimm sie als Anfang: mit deinen eigenen Worten wirken sie am besten."
    >
      <details
        className="konto-aufklappen partner-klappe"
        open={offen || undefined}
        onToggle={beimOeffnen('beispieltexte')}
      >
        <summary>{anzahl} Texte zeigen</summary>
        <div className="konto-aufklappen__inhalt">
          <div
            className="partner-wahl"
            role="group"
            aria-label="Produkt wählen"
          >
            {produkte.map((p) => (
              <button
                key={p.schluessel}
                type="button"
                className="partner-wahl__knopf"
                aria-pressed={p.schluessel === gruppe.schluessel}
                onClick={() => setWahl(p.schluessel)}
              >
                {p.schluessel}
              </button>
            ))}
          </div>
          <div className="partner-texte">
            {gruppe.eintraege.map((t) => (
              <PartnerText
                key={t.id}
                text={t}
                link={linkFuerProdukt(konto, t.produkt)}
                melde={melde}
              />
            ))}
          </div>
        </div>
      </details>
    </KontoAbschnitt>
  );
}

/** Abschnitt 3: Einstieg zum Seitencheck. */
export function PartnerSeitencheck({seitencheck}) {
  const url = seitencheck?.url;
  return (
    <KontoAbschnitt
      titel="Seitencheck"
      beschreibung="Wir prüfen deine Seite auf Verkauf, Design, SEO, Sichtbarkeit in KI-Antworten und Technik. Du bekommst die Auswertung als PDF."
    >
      {url ? (
        <a className="konto-cta" href={url} rel="noopener">
          Meine Seite prüfen lassen
        </a>
      ) : (
        <p className="konto-meta">Der Seitencheck kommt in Kürze an diese Stelle.</p>
      )}
    </KontoAbschnitt>
  );
}

/**
 * Der ganze Bereich eines angemeldeten Partners, so wie die Route ihn zeigt.
 * Die Mess-Vorschau rendert DIESEN Baustein mit Beispieldaten, damit sie
 * denselben Seitenbaum misst wie die echte Seite (vorher stellte sie die
 * Abschnitte ohne den Konto-Rahmen der Route nach).
 */
export function PartnerBereich({bereich, melde = KEIN_MELDER, offen = false}) {
  const gemeinsam = bereich.gemeinsam || {};
  const konten = bereich.konten || [];
  return (
    <div className="partner-bereich">
      {bereich.test ? (
        <p className="konto-merker konto-merker--gold">
          Testzugang mit Beispieldaten
        </p>
      ) : null}
      {konten.map((konto) => (
        <div key={konto.partner_id} className="partner-konto">
          <PartnerZahlen
            konto={konto}
            stand={bereich.stand_utc}
            veraltet={bereich.veraltet}
            portal={gemeinsam.uppromote_portal}
          />
          <PartnerKit
            konto={konto}
            provisionProzent={gemeinsam.provision_prozent}
          />
          <PartnerBeispieltexte
            konto={konto}
            saleskit={gemeinsam.saleskit}
            melde={melde}
            offen={offen}
          />
        </div>
      ))}
      <PartnerFragen
        saleskit={gemeinsam.saleskit}
        melde={melde}
        offen={offen}
      />
      <PartnerSeitencheck seitencheck={gemeinsam.seitencheck} />
    </div>
  );
}

/** Kein Partnerkonto unter der angemeldeten Adresse. */
export function PartnerKeinKonto() {
  return (
    <KontoAbschnitt titel="Partnerbereich">
      <KontoLeer
        text="Mit dieser E-Mail-Adresse ist kein Partnerkonto verbunden. Melde dich mit der Adresse an, die du in unserem Partnerprogramm nutzt."
        ctaText="Zum Partnerprogramm"
        ctaZu="/pages/affiliate-partnerprogramm"
      />
    </KontoAbschnitt>
  );
}

/** Datendienst nicht erreichbar: keine Zahlen, kein Raten. */
export function PartnerStoerung() {
  return (
    <KontoAbschnitt titel="Partnerbereich">
      <p className="konto-fehler" role="alert">
        Deine Zahlen sind gerade nicht erreichbar. Versuch es in ein paar Minuten noch einmal.
      </p>
    </KontoAbschnitt>
  );
}
