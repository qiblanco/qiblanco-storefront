import {SchlafZellenSchutz} from '~/components/campaign/SchlafZellenSchutz';

/*
 * /pages/chat-bot — Testseite für den neuen KI-Chat-Assistenten
 * (Grossjob 20260728-leon-chatbot-live-pages-chatbot, Segment s04).
 *
 * BAUART: additiver Wrapper, KEINE Bestandsdatei angefasst. Die Seite ist
 * inhaltlich eine 1:1-Kopie der bewährten LP A — sie rendert deren
 * Original-Komponente <SchlafZellenSchutz/> unverändert und stellt ihr nur
 * einen schmalen Transparenz-Hinweis voran.
 *
 * WARUM kein Slot in SchlafZellenSchutz.jsx (Hausmuster D-100): der Slot wäre
 * die richtige Wahl, wenn der Hinweis MITTEN in den Seitenfluss müsste. Er
 * gehört aber an den Anfang — dafür genügt ein Wrapper, und die Vorlage bleibt
 * bit-identisch zu origin/main. Das hält die LIVE-LP /pages/schlaf-zellen-schutz
 * aus dem Diff und damit aus der Gate-9-Belegpflicht (F-023: „ein Gate-BLOCK ist
 * zuerst eine Frage an den DIFF").
 *
 * DESIGN: geteilte Token-Quelle styles/schlaf-zellen-schutz.css (Scope .lp-a3)
 * wie die Partner-LP — kein eigenes Token-System, kein zweiter Goldton. Die
 * zusätzliche Klasse .lp-cb am Wrapper ist der Anker für die additive
 * Harmonisierungs-Schicht in styles/chat-bot.css.
 *
 * TRACKING: kein Redirect, kein eigener Pixel, KEINE neuen Cookies — die
 * R1/R2/R3-Kette hängt pfad-agnostisch im root-Layout (D-006). Damit ist die
 * Cross-Boundary-Linkage unberührt: diese Seite führt keinen neuen
 * Identitäts-Key ein, TRACKING_COOKIE_NAMES bleibt unverändert.
 */

/* ───────── Transparenz-Hinweis (dezent, oberhalb des Hero) ───────── */
function ChatHinweis() {
  return (
    <section
      className="lp-cb-hinweis"
      data-section="lp-cb-hinweis"
      aria-labelledby="lp-cb-hinweis-title"
    >
      <div className="lp-cb-hinweis__inner">
        <span className="lp-cb-hinweis__marke">Testseite</span>
        <p className="lp-cb-hinweis__text">
          <strong id="lp-cb-hinweis-title">
            Auf dieser Seite testen wir einen neuen KI-Chat-Assistenten.
          </strong>{' '}
          Er beantwortet Fragen zu den Produkten und kann sich irren —
          verbindlich sind allein die Angaben auf dieser Seite. Der Inhalt
          darunter ist unverändert.
        </p>
      </div>
    </section>
  );
}

export function ChatBotTestseite({products}) {
  return (
    <div className="lp-cb">
      <ChatHinweis />
      <SchlafZellenSchutz products={products} />
    </div>
  );
}
