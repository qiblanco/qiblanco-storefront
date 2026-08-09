// Hermetische Tests des SPA-Pageview-Lebenszyklus in public/qiblanco-qpx.js
// (Reparaturfall nachbau-20260726-scoring-standortbestimm-c60424, 2026-08-09).
// Wie checkout-tracking-qpx-anon/catchall: node:test/node:assert als Bordmittel,
// KEIN Netz, kein neuer Runner, kein jsdom.
// Ausführen: node --test test/qpx-spa-pageview.test.mjs
//
// BELEGT die Wurzel des Falls: qiblanco.com ist eine Hydrogen-SPA. boot() läuft
// genau einmal, also lebten pv_id und der Sektions-Akkumulator bis 2026-08-09 an
// der Lebensdauer des JS-MODULS statt an der Route — eine pv_id ueberlebte jeden
// Client-Routenwechsel und sammelte die Sektionen MEHRERER Seiten unter sich
// (gemessen: 438 von 11735 Pageviews auf qiblanco.com trugen eine fremde Sektion).
// Diese Tests sind gegen den Stand VOR dem Fix rot (Positivkontrolle im RESULT).
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const SRC = readFileSync(new URL('../public/qiblanco-qpx.js', import.meta.url), 'utf8');

/** Minimale Browser-Attrappe: nur die vom Pixel real benutzte API-Fläche. */
function bootPixel(startPath = '/pages/schlaf-zellen-schutz') {
  const sent = [];
  const winListeners = new Map();
  const docListeners = new Map();
  let ioCallback = null;
  let nodes = [];

  const location = {
    href: `https://qiblanco.com${startPath}`,
    pathname: startPath,
    search: '',
    hash: '',
    hostname: 'qiblanco.com',
    protocol: 'https:',
  };

  const store = () => {
    const m = new Map();
    return {
      getItem: (k) => (m.has(k) ? m.get(k) : null),
      setItem: (k, v) => m.set(k, String(v)),
      removeItem: (k) => m.delete(k),
    };
  };

  const document = {
    readyState: 'complete',
    referrer: '',
    cookie: '',
    visibilityState: 'visible',
    documentElement: {},
    addEventListener: (t, fn) => {
      if (!docListeners.has(t)) docListeners.set(t, []);
      docListeners.get(t).push(fn);
    },
    querySelectorAll: (sel) =>
      sel.includes('data-section]') ? nodes.filter((n) => n.attrs['data-section']) : [],
  };

  const window = {
    location,
    document,
    localStorage: store(),
    sessionStorage: store(),
    innerHeight: 800,
    pageYOffset: 0,
    crypto: {randomUUID: () => 'uuid-' + Math.random().toString(16).slice(2)},
    matchMedia: () => ({matches: false}),
    setInterval: () => 0,
    setTimeout: () => 0,
    requestAnimationFrame: (fn) => fn(),
    addEventListener: (t, fn) => {
      if (!winListeners.has(t)) winListeners.set(t, []);
      winListeners.get(t).push(fn);
    },
    IntersectionObserver: class {
      constructor(cb) {
        ioCallback = cb;
      }
      observe() {}
    },
    history: {
      pushState(_s, _t, url) {
        const u = new URL(url, 'https://qiblanco.com');
        location.pathname = u.pathname;
        location.search = u.search;
        location.href = u.href;
      },
      replaceState() {},
    },
  };
  window.window = window;

  const sandbox = {
    window,
    document,
    navigator: {
      sendBeacon: (_url, blob) => {
        sent.push(JSON.parse(blob.parts[0]));
        return true;
      },
    },
    Blob: class {
      constructor(parts) {
        this.parts = parts;
      }
    },
    fetch: () => {},
    URL,
    Math,
    Date,
    JSON,
    Object,
    Array,
    String,
  };
  vm.createContext(sandbox);
  vm.runInContext(SRC, sandbox);

  const fire = (map, type) => (map.get(type) || []).forEach((fn) => fn({}));

  return {
    sent,
    /** Sektion sichtbar machen (IntersectionObserver-Eintrag simulieren). */
    seeSection(id) {
      const node = {attrs: {'data-section': id}, isConnected: true,
                    getAttribute: (k) => node.attrs[k] || null};
      nodes.push(node);
      // Nachregistrierung anstoßen (MutationObserver ist im Stub nicht aktiv):
      if (ioCallback) {
        ioCallback([{target: node, isIntersecting: true, intersectionRatio: 1,
                     intersectionRect: {height: 800}, rootBounds: {height: 800}}]);
      }
    },
    /** Erzwingt einen Flush über den visibilitychange-Pfad (setzt kein unloading). */
    flush() {
      document.visibilityState = 'hidden';
      fire(docListeners, 'visibilitychange');
      document.visibilityState = 'visible';
    },
    navigate(path) {
      window.history.pushState({}, '', path);
    },
    behaviors: () => sent.filter((e) => e.event_name === 'behavior'),
    pageViews: () => sent.filter((e) => e.event_name === 'page_view'),
  };
}

test('Softnav erzeugt einen NEUEN Pageview (page_view mit neuem Pfad)', () => {
  const px = bootPixel('/pages/schlaf-zellen-schutz');
  assert.equal(px.pageViews().length, 1, 'boot() muss genau einen page_view senden');

  px.navigate('/pages/schlaf-zellen-schutz-v2-18ef');

  const pvs = px.pageViews();
  assert.equal(pvs.length, 2, 'Client-Routenwechsel muss einen zweiten page_view senden');
  assert.match(pvs[1].url, /schlaf-zellen-schutz-v2-18ef/,
    'der zweite page_view muss den NEUEN Pfad tragen (base() liest location zur Sendezeit)');
});

test('pv_id überlebt den Routenwechsel NICHT', () => {
  const px = bootPixel('/pages/schlaf-zellen-schutz');
  px.seeSection('lp-a-hero');
  px.flush();

  px.navigate('/pages/schlaf-zellen-schutz-v2-18ef');
  px.seeSection('lp-v2-hero');
  px.flush();

  const bh = px.behaviors();
  assert.ok(bh.length >= 2, `mindestens zwei behavior-Flushes erwartet, waren ${bh.length}`);
  const ersteId = bh[0].pv_id;
  const letzteId = bh[bh.length - 1].pv_id;
  assert.ok(ersteId && letzteId, 'beide Flushes müssen eine pv_id tragen');
  assert.notEqual(letzteId, ersteId,
    'nach dem Routenwechsel muss eine NEUE pv_id gelten (Wurzel des Falls c60424)');
});

test('Sektionen der Altseite bluten NICHT in den neuen Pageview', () => {
  const px = bootPixel('/pages/schlaf-zellen-schutz');
  px.seeSection('lp-a-hero');
  px.flush();

  px.navigate('/pages/schlaf-zellen-schutz-v2-18ef');
  px.seeSection('lp-v2-hero');
  px.flush();

  const letzte = px.behaviors().pop();
  const ids = letzte.sections.map((s) => s.id);
  assert.ok(ids.includes('lp-v2-hero'), 'die Sektion der NEUEN Seite fehlt');
  assert.ok(!ids.includes('lp-a-hero'),
    `Namespace-Ueberlappung: lp-a-hero hängt noch am neuen Pageview (${ids.join(',')})`);
});

test('Reiner Query-/Hash-Wechsel ist KEIN neuer Pageview', () => {
  const px = bootPixel('/pages/schlaf-zellen-schutz');
  px.navigate('/pages/schlaf-zellen-schutz?lp_ab=b');
  assert.equal(px.pageViews().length, 1,
    'gleicher Pfad mit anderer Query darf keinen zweiten Pageview erzeugen');
});
