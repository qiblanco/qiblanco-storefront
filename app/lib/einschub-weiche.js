/**
 * EINSCHUB-WEICHE: lenkt Cookiebots Banner ans ENDE des <body>, statt ihn
 * VOR Reacts erstes body-Kind zu setzen.
 *
 * DAS PROBLEM, gemessen am 2026-09-13 (Job 20260913-restbruch-hydration-
 * standardseiten-ursache-unbekannt, Segmente s01/s02). Cookiebot baut seinen
 * Einwilligungs-Banner und hängt ihn so ein (cc.js 2.135.0, woertlich aus
 * window.CookieControl.Dialog.prototype.displaydialog):
 *
 *     var bodyObj = document.getElementsByTagName("body")[0];
 *     bodyObj.firstChild
 *       ? bodyObj.insertBefore(this.DOM, bodyObj.firstChild)
 *       : bodyObj.appendChild(this.DOM);
 *
 * Unser <body> ist nie leer, es gilt also immer der linke Zweig: der Banner
 * landet auf body-Index 0, und zwar in 178 von 178 beobachteten Einschueben.
 * Das erste body-Kind ist ein von React gerendertes <script> (live bestaetigt:
 * es trägt __reactFiber$). Jedes von React gehaltene body-Kind rueckt dadurch
 * um eins weiter.
 *
 * OB DAS BRICHT, ENTSCHEIDET EINZIG DIE ZEIT. Über 180 Laeufe eins-zu-eins:
 * landet der Einschub VOR Reacts Hydration-Commit, kommt "Minified React error
 * #418" vielfach plus #423 und React raeumt den Banner wieder weg; landet er
 * danach, ist alles still. Es ist ein Wettrennen, kein Dauerfehler - deshalb
 * die rund 2 Prozent und deshalb vier Vorlaeufe ohne Reproduktion.
 *
 * ZWEI SYMPTOME, EIN RENNEN. Derselbe Vorgang kostet auf der anderen Seite die
 * Einwilligung: raeumt Reacts Reconciler den Banner weg, bekommt der Kunde gar
 * keine Wahl vorgelegt (Job 20260823, Heilung in
 * public/cookiebot-shopify-consent-sync.js). Wer nur eines der beiden behebt,
 * lässt das andere stehen.
 *
 * WARUM ANS ENDE UND NICHT SPAETER: der Einschub lässt sich nicht verzoegern.
 * Cookiebot ruft unmittelbar danach
 * document.getElementById("CybotCookiebotDialogPoweredbyCybot").innerHTML - der
 * Knoten muss im selben Moment im Dokument stehen. Ihn bis nach dem Commit in
 * einem losgeloesten Knoten zu parken, briche dort ab und verloere den Banner
 * ganz. Und `data-blockingmode=auto` muss frueh laufen, sonst feuern Tracker
 * vor der Einwilligung; am Loader wird deshalb nichts angefasst.
 *
 * WARUM DAS ENDE TRÄGT - gemessen, nicht angenommen. A/B mit genau EINER
 * Variablen (Ort), Zeit festgehalten auf DOMContentLoaded, also im realen
 * Cookiebot-Fenster, je 8 Laeufe auf /products/qione-2-pro:
 *
 *     Ort      eigene Fehler   Klassen      Knoten ueberlebt
 *     Anfang   8 von 8 rot     #418 #423    1 von 8
 *     Ende     0 von 8 rot     -            8 von 8
 *
 * Beide Haelften der Naht fallen also mit derselben Maßnahme: keine
 * verschobenen Geschwister, und der Banner bleibt stehen. Reacts Hydration
 * raeumt am body-ENDE nicht auf, am Anfang schon.
 *
 * AM AUSSEHEN AENDERT SICH NICHTS: der Banner ist `position: fixed`, seine Lage
 * auf dem Bildschirm hängt nicht an seiner Stelle im Baum. Am Seitenende steht
 * er zudem spaeter im Stapel, liegt also eher oben als unten.
 *
 * WARUM DIE WEICHE HIER UND NICHT IN public/cookiebot-shopify-consent-sync.js:
 * jene Datei ist ein `defer`-Skript und läuft erst nach dem Parsen. Der
 * Cookiebot-Loader wird aber schon WAEHREND des Parsens angefordert. Die Weiche
 * gehört damit in denselben Inline-Bootstrap, der den Loader erzeugt - dann
 * steht sie beweisbar vor ihm.
 *
 * ZWEI BEDINGUNGEN, UND BEIDE MÜSSEN ZUTREFFEN, damit umgelenkt wird. Das ist
 * die fail-safe Richtung: trifft eine nicht zu, passiert genau das, was heute
 * passiert.
 *   1. Der Knoten ist ein Einwilligungs-Knoten (id `cookiebanner`, id beginnt
 *      mit `Cybot`, oder er trägt einen solchen Nachkommen). Live geprueft:
 *      der eingeschobene <div id="cookiebanner"> enthält
 *      #CybotCookiebotDialogBodyButtonDecline.
 *   2. Der Knoten gehört NICHT React (kein `__react*`). Live geprueft: der
 *      Banner hat keine solche Eigenschaft, das verdraengte <script> hat zwei.
 *      React soll seine eigenen Einschuebe unveraendert machen duerfen.
 *
 * DIE KLASSE "fremder Einschub vor Reacts erstem body-Kind" ist damit NICHT
 * abschliessend geschlossen - geschlossen ist der eine gemessene Weg dorthin.
 * Die Klasse bewacht weiterhin die stehende Wache
 * `storefront-hydration-cookiebot-naht` (--hoechstens 0): ein neuer Fremd-
 * einschub in dieses Fenster erzeugt wieder #418, und sie wird rot.
 *
 * Vor jeder Aenderung hier messen:
 *   homepage-bauer/pruefungen/probe_hydration_cookiebot_naht.py
 *   homepage-bauer/pruefungen/_diag_hydration_einschub.py --kontrolle
 */

/**
 * Quelltext der Einschub-Weiche als Zeichenkette für ein Inline-Skript.
 *
 * Bewusst eine reine Funktion ohne Seiteneffekt: so lässt sich das erzeugte
 * Verhalten in test/hydrations-naht.test.mjs gegen einen nachgebauten Baum
 * fahren, statt nur den Quelltext nach Stichworten abzusuchen.
 *
 * @returns {string} ES5-Quelltext, der `document` als freie Variable nutzt
 */
export function einschubWeicheQuelle() {
  return (
    '(function(){' +
    'var b=document.getElementsByTagName("body")[0];' +
    'if(!b||b.__qbEinschubWeiche)return;' +
    'b.__qbEinschubWeiche=true;' +
    'var echt=b.insertBefore;' +
    'function consent(n){' +
    'if(!n||n.nodeType!==1)return false;' +
    'var id=n.id||"";' +
    'if(id==="cookiebanner"||id.indexOf("Cybot")===0)return true;' +
    'return !!(n.querySelector&&n.querySelector(\'[id^="Cybot"]\'));' +
    '}' +
    'function reactEigen(n){' +
    'try{var k=Object.keys(n);' +
    'for(var i=0;i<k.length;i++){if(k[i].indexOf("__react")===0)return true;}' +
    '}catch(e){}' +
    'return false;' +
    '}' +
    'b.insertBefore=function(neu,bezug){' +
    'if(bezug&&bezug===this.firstChild&&consent(neu)&&!reactEigen(neu)){' +
    'return this.appendChild(neu);' +
    '}' +
    'return echt.call(this,neu,bezug);' +
    '};' +
    '})();'
  );
}
