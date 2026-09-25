/**
 * FRAGESEITEN — der Vertrag zwischen Daten, Routen, Sitemap und Schema.
 *
 * WOGEGEN DIESER TEST GEBAUT IST: der STILLE Verlust. Eine Frage, die aus
 * app/data/fragen.js verschwindet, nimmt ihre Seite mit — und weil der Hub
 * seine Liste aus denselben Daten baut, sieht die Live-Probe danach eine
 * kleinere, in sich stimmige Welt und bleibt grün. Genauso still ist der
 * Ausschluss aus dem Schema: `buildFaqPageJsonLd` liefert `null`, wenn das
 * geerbte Deny-Netz greift, und die Seite bliebe sichtbar und würde nur für
 * Maschinen ärmer — ohne eine einzige Fehlermeldung.
 *
 * KEINE GEPINNTE ZAHL. Jeder Sollwert hier kommt aus `FRAGEN.length` bzw. aus
 * den Daten selbst. Wächst die Fläche, wächst der Sollwert mit; ein
 * Verify-Vertrag, der eine wachsende Zahl festschreibt, ist
 * rot-by-construction bei der nächsten Frage.
 *
 * ROT VOR GRÜN, UND DER GRÜN-ARM IST HIER DER WICHTIGERE: ohne ihn wäre der
 * Rot-Arm auch dann grün, wenn das Netz schlicht alles ausschlösse. Der
 * Grün-Arm ERHEBT seinen Gegenstand zur Laufzeit aus den echten Daten (welche
 * Seite nennt heute ein Deny-Muster im Fließtext, aber nicht im Schema-Paar?)
 * statt ihn als Literal hinzuschreiben. Findet er keinen mehr, meldet er
 * KEINE AUSSAGE und nie ein Grün — eine Fixture, deren Zustand behebbar ist,
 * ist eine Behauptung über die Welt und verfällt mit ihrer Behebung.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {test} from 'node:test';

import {FRAGEN, QUELLEN, seiteFuer, quellenFuer} from '../app/data/fragen.js';
import {FORBIDDEN_PATTERNS} from '../app/lib/faq-schema.js';
import {
  frageSchema,
  warumKeinSchema,
  antwortIstEinSatz,
  HUB_PFAD,
  HUB_ANKER,
} from '../app/lib/fragen-schema.js';
import {NUR_ROUTE_SEITEN} from '../app/lib/seo.js';

const WURZEL = path.resolve(import.meta.dirname, '..');
const DATUM = {
  datePublished: '2026-09-16T00:00:00+02:00',
  dateModified: '2026-09-16T00:00:00+02:00',
};
const lies = (...t) => fs.readFileSync(path.join(WURZEL, ...t), 'utf8');

test('jede Seite trägt ihre Pflichtteile und ihr Offenes', () => {
  assert.ok(FRAGEN.length > 0, 'FRAGEN ist leer');
  for (const s of FRAGEN) {
    assert.ok(s.slug && s.frage, `Seite ohne slug/frage: ${JSON.stringify(s).slice(0, 80)}`);
    assert.equal(s.pfad, `/pages/${s.slug}`, `${s.slug}: pfad passt nicht zum slug`);
    assert.match(s.frage, /\?\s*$/, `${s.slug}: die Überschrift ist keine Frage`);
    assert.ok(s.antwort?.trim(), `${s.slug}: keine Antwort`);
    const {"begruendung": absaetze} = s;
    assert.ok(absaetze?.length, `${s.slug}: keine Begründung`);
    assert.ok(s.beleg?.length, `${s.slug}: kein Beleg`);
    // Das Offene ist der Wirkmechanismus dieser Flaeche, nicht ein Feld.
    assert.ok(
      s.offen?.length,
      `${s.slug}: NICHTS OFFEN — eine Antwort ohne ihre Lücke wäre Werbung`,
    );
    assert.equal(seiteFuer(s.slug), s, `${s.slug}: seiteFuer findet die Seite nicht`);
  }
});

test('die Antwort ist GENAU EIN Satz und steht als erstes', () => {
  // Zwei Sätze sind bereits eine Begründung. Der Vertrag stammt aus s05
  // (bau_fragen.py) und wird hier ein zweites Mal geprüft, weil Erzeuger und
  // Datenmodul seit dem Bau getrennte Wege gehen.
  for (const s of FRAGEN) {
    assert.ok(antwortIstEinSatz(s), `${s.slug}: die Antwort trägt mehr als einen Satz`);
  }
  const quelle = lies('app', 'components', 'campaign', 'FrageSeite.jsx');
  const iAntwort = quelle.indexOf('{seite.antwort}');
  const iH2 = quelle.indexOf('<h2>');
  assert.ok(iAntwort > 0, 'der Antwort-Satz wird gar nicht gerendert');
  assert.ok(
    iAntwort < iH2,
    'der Antwort-Satz steht hinter der ersten Zwischenüberschrift — ein Retriever ' +
      'schneidet dort, und was dahinter liegt, beantwortet die Frage nicht mehr',
  );
});

test('jede Frage hat eine eigene Route', () => {
  for (const s of FRAGEN) {
    const datei = path.join(WURZEL, 'app', 'routes', `pages.${s.slug}.jsx`);
    assert.ok(fs.existsSync(datei), `${s.slug}: Routendatei fehlt (${datei})`);
  }
});

// SEIT 2026-09-25 IST DIE SAMMELSTELLE DER ABSCHNITT #einzelfragen DER FAQ
// (Auftrag 20260926-seo-duenne-vorlagenseiten-aufwerten-oder-zusammenfuehren).
// Die alte Adresse /pages/fragen lebt als 301 weiter. Die drei Arme unten
// halten die Naht dieses Umzugs: Weiterleitung, Sitemap, interne Links.
test('/pages/fragen leitet per 301 auf die Sammelstelle in der FAQ', () => {
  const route = lies('app', 'routes', 'pages.fragen.jsx');
  assert.equal(HUB_PFAD, '/pages/faq', 'die Sammelstelle ist die FAQ');
  assert.match(route, /throw redirect\(/, 'die alte Route wirft keinen redirect');
  assert.match(route, /,\s*301\)/, 'die Weiterleitung ist nicht permanent (301)');
  assert.match(route, /HUB_PFAD[\s\S]*HUB_ANKER/, 'das Ziel kommt nicht aus fragen-schema.js');
  assert.doesNotMatch(route, /from '~\/components\//, 'die alte Route importiert noch eine Komponente');
  assert.match(route, /return null;/, 'die alte Route rendert noch Inhalt');
  const faq = lies('app', 'components', 'faq', 'FaqSeite.jsx');
  assert.match(faq, /id=\{HUB_ANKER\}/, 'der Abschnitt trägt den Anker der Weiterleitung nicht');
});

test('keine interne Verlinkung zeigt noch auf /pages/fragen', () => {
  // Eine Weiterleitung ist ein Wegweiser für alte Links von aussen, kein
  // Linkziel. Gelesen werden die Quelltexte, die Links rendern, und die
  // Datenmodule — der Rumpf der alten Route selbst ist ausgenommen.
  const orte = [
    ['app', 'components'],
    ['app', 'data'],
    ['app', 'routes'],
  ];
  const treffer = [];
  for (const ort of orte) {
    const wurzel = path.join(WURZEL, ...ort);
    for (const name of fs.readdirSync(wurzel, {recursive: true})) {
      const datei = path.join(wurzel, String(name));
      if (!/\.(jsx?|mjs)$/.test(datei) || datei.endsWith('pages.fragen.jsx')) continue;
      const text = fs.readFileSync(datei, 'utf8');
      // GENERIERTE Inventare (uebersicht-links.js, Reconciler) führen auch
      // Weiterleitungen als Eintrag — das ist ihr Zweck, kein Link.
      if (text.startsWith('// GENERIERT')) continue;
      if (/href=["'`{]*\/pages\/fragen["'`#?]|"pfad":\s*"\/pages\/fragen"/.test(text)) {
        treffer.push(path.relative(WURZEL, datei));
      }
    }
  }
  assert.deepEqual(treffer, [], `Links auf die Weiterleitung: ${treffer.join(', ')}`);
});

test('die Marker data-geo sind Verträge und stehen in den Komponenten', () => {
  // Sie hängen bewusst NICHT an einer CSS-Klasse: wer den Stil umbaut, darf
  // den Vertrag nicht versehentlich mitnehmen.
  const seite = lies('app', 'components', 'campaign', 'FrageSeite.jsx');
  assert.match(seite, /<h1 data-geo="frage">/, 'der Marker sitzt nicht an der H1');
  assert.match(seite, /\{seite\.frage\}/, 'die Frage selbst muss die Überschrift sein');
  for (const m of ['antwort', 'beleg', 'offen']) {
    assert.ok(seite.includes(`data-geo="${m}"`), `Abschnitt data-geo="${m}" fehlt`);
  }
  const hub = lies('app', 'components', 'faq', 'FaqSeite.jsx');
  assert.match(
    hub,
    /<section[^>]*data-geo="frageliste"/,
    'ohne die Abgrenzung liest die Abnahme JEDEN Link des Hubs als Frageseite — ' +
      'auch /pages/kritik und /pages/hypothesen, die keine sind',
  );
});

test('die Sammelstelle verlinkt jede Frageseite und keinen Lexikon-Eintrag in der Liste', () => {
  const hub = lies('app', 'components', 'faq', 'FaqSeite.jsx');
  // Die Liste kommt aus den Daten (FRAGEN.map), also kann sie nicht driften.
  assert.match(hub, /FRAGEN\.map/, 'die Frageliste wird nicht aus den Daten gebaut');
  // Der Marker steht auch im Kopfkommentar — gesucht wird das ATTRIBUT am
  // <section>, also die Stelle, die ausgeliefert wird.
  const anfang = hub.search(/<section[^>]*data-geo="frageliste"/);
  assert.ok(anfang !== -1, 'kein <section> mit data-geo="frageliste"');
  const ende = hub.indexOf('</section>', anfang);
  const liste = hub.slice(anfang, ende);
  const fremde = [...liste.matchAll(/href="(\/pages\/[a-z0-9-]+)"/g)].map((m) => m[1]);
  assert.deepEqual(
    fremde,
    [],
    `feste /pages/-Links in der Frageliste: ${fremde.join(', ')} — die Liste gehört ` +
      'den Daten, Querverweise gehören daneben',
  );
});

test('jede zitierte Quelle ist auflösbar und trägt ihre Identitäts-Erwartung', () => {
  for (const s of FRAGEN) {
    for (const k of s.quellen || []) {
      assert.ok(QUELLEN[k], `${s.slug}: Quellenschlüssel "${k}" steht nicht in QUELLEN`);
      assert.ok(
        QUELLEN[k].identitaet?.trim(),
        `${s.slug}/${k}: keine Identitäts-Erwartung — ein HTTP 200 mit fremdem Titel ` +
          'sieht wie ein lebender Beleg aus',
      );
    }
    assert.equal(quellenFuer(s).length, (s.quellen || []).length, `${s.slug}: Quelle verloren`);
  }
});

test('jeder Verweis der Seite hat eine Beschriftung und ein Ziel', () => {
  for (const s of FRAGEN) {
    for (const z of s.weiter || []) {
      assert.ok(z.pfad?.startsWith('/'), `${s.slug}: Verweis ohne Pfad`);
      assert.ok(z.text?.trim(), `${s.slug}: Verweis ${z.pfad} ohne Beschriftung`);
    }
  }
});

test('keine Frageseite trägt einen Kaufweg', () => {
  // Eine /pages/-Seite wird am nächsten Klick gemessen, eine Kaufseite an der
  // Bestellung. Sobald hier verkauft wird, ist der Grund weg, aus dem ein
  // Antwortsystem diese Seite als Quelle behandelt.
  const KAUF = [/\bjetzt kaufen\b/i, /\bin den warenkorb\b/i, /\/cart\b/i, /\d[\d.,]*\s?(€|EUR)\b/];
  for (const s of FRAGEN) {
    const {"begruendung": absaetze} = s;
    const text = [s.frage, s.antwort, ...absaetze, ...s.beleg, ...s.offen].join('\n');
    for (const re of KAUF) {
      assert.ok(!re.test(text), `${s.slug}: Kaufweg im Text (${re})`);
    }
  }
});

test('das Seiten-Schema trägt GENAU EINE Question, und sie ist der sichtbare Text', () => {
  for (const s of FRAGEN) {
    const schema = frageSchema(s, DATUM);
    assert.ok(
      schema,
      `${s.slug}: kein FAQPage-Schema — Grund: ${JSON.stringify(warumKeinSchema(s))}`,
    );
    assert.equal(schema['@type'], 'FAQPage');
    assert.equal(
      schema.mainEntity.length,
      1,
      `${s.slug}: ${schema.mainEntity.length} Fragen im Schema — genau EINE ist der Vertrag`,
    );
    // Markup, das etwas anderes sagt als die Seite, ist die schlechteste aller
    // Welten: als Täuschung angreifbar und als Inhalt wertlos.
    assert.equal(schema.mainEntity[0].name, s.frage.replace(/\s+/g, ' ').trim());
    assert.equal(
      schema.mainEntity[0].acceptedAnswer.text,
      s.antwort.replace(/\s+/g, ' ').trim(),
    );
  }
});

test('jede Route steht in NUR_ROUTE_SEITEN — sonst ist sie unauffindbar', () => {
  // Die Naht zwischen Route und Sitemap. Ohne den Eintrag liefert die Seite
  // HTTP 200 mit vollem Text und steht in keiner Sitemap: erreichbar und
  // trotzdem unauffindbar, von aussen nicht davon zu unterscheiden, dass alles
  // stimmt.
  const pfade = new Set(NUR_ROUTE_SEITEN.map((e) => e.pfad));
  for (const s of FRAGEN) {
    assert.ok(pfade.has(s.pfad), `${s.slug}: fehlt in NUR_ROUTE_SEITEN`);
  }
  // Die Weiterleitung steht in KEINER Sitemap: eine Sitemap-URL, die
  // weiterleitet, sendet ein gegenläufiges Signal. Die FAQ selbst steht über
  // ihr Shopify-Seitenobjekt in der Sitemap, nicht in dieser Liste.
  assert.ok(!pfade.has('/pages/fragen'), '/pages/fragen leitet weiter und gehört in keine Sitemap');
});

test('ROT-ARM: ein Deny-Muster im Schema-Paar schließt die Seite aus', () => {
  const attrappe = {
    slug: 'attrappe-unsauber',
    frage: 'Wirkt das immer?',
    antwort: 'Ja, das wirkt immer und bei jedem.',
    "begruendung": ['-'],
    beleg: ['-'],
    offen: ['-'],
    weiter: [],
    quellen: [],
    pfad: '/pages/attrappe-unsauber',
  };
  assert.deepEqual(warumKeinSchema(attrappe), ['(wirken|wirkt)\\s+immer']);
  assert.equal(frageSchema(attrappe, DATUM), null);
});

test('ROT-ARM: eine Antwort aus zwei Sätzen bricht den Antwort-zuerst-Vertrag', () => {
  assert.equal(
    antwortIstEinSatz({antwort: 'Das ist die Antwort. Und das ist schon die Begründung.'}),
    false,
  );
  assert.equal(antwortIstEinSatz({antwort: 'Das ist die Antwort.'}), true);
});

test('GRÜN-ARM: dasselbe Muster im Fließtext lässt das Schema stehen', (t) => {
  // DER GEGENSTAND WIRD ERHOBEN, NICHT GENANNT: gesucht ist die Seite, die
  // heute ein Deny-Muster im Fließtext trägt und nicht im Schema-Paar. Ohne
  // diesen Arm wäre der Rot-Arm auch dann grün, wenn das Netz alles
  // ausschlösse — und eine als Literal hingeschriebene Fixture verfiele in
  // dem Moment, in dem jemand den Text umschreibt.
  const kandidat = FRAGEN.find((s) => {
    const {"begruendung": absaetze} = s;
    const fliess = [...absaetze, ...s.beleg, ...s.offen].join('\n');
    const paar = `${s.frage}\n${s.antwort}`;
    return FORBIDDEN_PATTERNS.some((re) => re.test(fliess) && !re.test(paar));
  });
  if (!kandidat) {
    // KEINE AUSSAGE, nie ein Grün: der Gegenstand ist weg, nicht die Zusage.
    t.skip(
      'KEINE AUSSAGE: keine Seite nennt heute noch ein Deny-Muster im Fließtext. ' +
        'Der Arm hat seinen Gegenstand verloren und gehört neu gefasst oder abgebaut.',
    );
    return;
  }
  assert.deepEqual(
    warumKeinSchema(kandidat),
    [],
    `${kandidat.slug}: das Netz greift auf dem Schema-Paar, obwohl das Muster nur im ` +
      'Fließtext steht',
  );
  assert.ok(frageSchema(kandidat, DATUM), `${kandidat.slug}: Schema fehlt`);
});
