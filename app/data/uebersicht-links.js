// GENERIERT — NICHT VON HAND BEARBEITEN.
// Quelle: shared-state/homepage-bauer/src/uebersicht.py (`codemeister uebersicht generiere`).
// Union aus Code-Routen (Kartographie/origin-main) und Shopify-Katalog:
// keine der beiden Quellen ist allein vollständig.
// Änderungen bitte am Generator vornehmen, sonst überschreibt der
// nächste Reconciler-Lauf sie wortlos.
//
// EIN EINTRAG = EINE ZEILE. Das ist Absicht und kein Schönheitswunsch:
// (a) ein geänderter Link ist dann EINE Diff-Zeile statt acht — der
//     Drift-PR des Reconcilers bleibt lesbar; (b) pretty-printed war die
//     Datei >1000 Zeilen und lief in den hb-deploy GRÖSSEN-Gate-Block
//     (MAX_ZEILEN), der große Diffs zur Handprüfung anhält.

export const UEBERSICHT_BEREICHE = [
  {
    "schluessel": "public",
    "titel": "Öffentliche Seite",
    "beschreibung": "Crawlbare Seiten — Startseite, Produktseiten, Shop- und Inhaltsseiten.",
    "eintraege": [
      {"pfad": "/", "url": "https://qiblanco.com", "titel": "", "crawlbar": true, "herkunft": "code", "ads": "aktiv"},
      {"pfad": "/.well-known/tdm-policy.json", "url": "https://qiblanco.com/.well-known/tdm-policy.json", "titel": "", "crawlbar": true, "herkunft": "code"},
      {"pfad": "/.well-known/tdmrep.json", "url": "https://qiblanco.com/.well-known/tdmrep.json", "titel": "", "crawlbar": true, "herkunft": "code"},
      {"pfad": "/blogs", "url": "https://qiblanco.com/blogs", "titel": "", "crawlbar": true, "herkunft": "code"},
      {"pfad": "/blogs/e-smog", "url": "https://qiblanco.com/blogs/e-smog", "titel": "E-Smog", "crawlbar": true, "herkunft": "shopify"},
      {"pfad": "/blogs/news", "url": "https://qiblanco.com/blogs/news", "titel": "News", "crawlbar": true, "herkunft": "shopify"},
      {"pfad": "/blogs/wissen", "url": "https://qiblanco.com/blogs/wissen", "titel": "Wissen", "crawlbar": true, "herkunft": "shopify"},
      {"pfad": "/collections", "url": "https://qiblanco.com/collections", "titel": "", "crawlbar": true, "herkunft": "code"},
      {"pfad": "/collections/all", "url": "https://qiblanco.com/collections/all", "titel": "", "crawlbar": true, "herkunft": "code"},
      {"pfad": "/collections/cross-selling", "url": "https://qiblanco.com/collections/cross-selling", "titel": "cross-selling", "crawlbar": true, "herkunft": "shopify"},
      {"pfad": "/collections/digital-goods-vat-tax", "url": "https://qiblanco.com/collections/digital-goods-vat-tax", "titel": "Digital Goods VAT Tax", "crawlbar": true, "herkunft": "shopify"},
      {"pfad": "/collections/digitale-kurse", "url": "https://qiblanco.com/collections/digitale-kurse", "titel": "Digitale Kurse", "crawlbar": true, "herkunft": "shopify"},
      {"pfad": "/collections/frontpage", "url": "https://qiblanco.com/collections/frontpage", "titel": "Home page", "crawlbar": true, "herkunft": "shopify"},
      {"pfad": "/collections/products", "url": "https://qiblanco.com/collections/products", "titel": "Products", "crawlbar": true, "herkunft": "shopify"},
      {"pfad": "/collections/slider", "url": "https://qiblanco.com/collections/slider", "titel": "Slider", "crawlbar": true, "herkunft": "shopify"},
      {"pfad": "/collections/valentinstag-angebote", "url": "https://qiblanco.com/collections/valentinstag-angebote", "titel": "Valentinstag Angebote", "crawlbar": true, "herkunft": "shopify"},
      {"pfad": "/collections/zeremonie-kakao", "url": "https://qiblanco.com/collections/zeremonie-kakao", "titel": "Zeremonie Kakao", "crawlbar": true, "herkunft": "shopify"},
      {"pfad": "/pages/das-beispiel", "url": "https://qiblanco.com/pages/das-beispiel", "titel": "Bonus: Das Beispiel", "crawlbar": true, "herkunft": "code+shopify"},
      {"pfad": "/pages/development-nicht-loschen", "url": "https://qiblanco.com/pages/development-nicht-loschen", "titel": "Development - Nicht löschen", "crawlbar": true, "herkunft": "shopify"},
      {"pfad": "/pages/e-smog", "url": "https://qiblanco.com/pages/e-smog", "titel": "Tag 4: E-Smog", "crawlbar": true, "herkunft": "code+shopify"},
      {"pfad": "/pages/entgiftung", "url": "https://qiblanco.com/pages/entgiftung", "titel": "Tag 1: Entgiftung", "crawlbar": true, "herkunft": "code+shopify"},
      {"pfad": "/pages/erinnerung-erfolgreich", "url": "https://qiblanco.com/pages/erinnerung-erfolgreich", "titel": "Erinnerung erfolgreich", "crawlbar": true, "herkunft": "shopify"},
      {"pfad": "/pages/intuition-erfahren", "url": "https://qiblanco.com/pages/intuition-erfahren", "titel": "Teil 1: Intuition erfahren – Raus aus dem Kopf, rein ins Herz! – 9 min", "crawlbar": true, "herkunft": "code+shopify"},
      {"pfad": "/pages/kakao-anwendung", "url": "https://qiblanco.com/pages/kakao-anwendung", "titel": "Teil 3: Die Zeremonie-Kakao Kur in der Anwendung – 8 min", "crawlbar": true, "herkunft": "code+shopify"},
      {"pfad": "/pages/kakao-anwendung-de", "url": "https://qiblanco.com/pages/kakao-anwendung-de", "titel": "Kakao Anwendung DE", "crawlbar": true, "herkunft": "shopify"},
      {"pfad": "/pages/kakao-anwendung-us", "url": "https://qiblanco.com/pages/kakao-anwendung-us", "titel": "Kakao Anwendung US", "crawlbar": true, "herkunft": "shopify"},
      {"pfad": "/pages/ketogenes-wochenende", "url": "https://qiblanco.com/pages/ketogenes-wochenende", "titel": "Ketogenes Wochenende", "crawlbar": true, "herkunft": "shopify"},
      {"pfad": "/pages/kohaerentes-wasser", "url": "https://qiblanco.com/pages/kohaerentes-wasser", "titel": "Tag 5: Kohärente Wasserstrukturen", "crawlbar": true, "herkunft": "code+shopify"},
      {"pfad": "/pages/kristall-kakao", "url": "https://qiblanco.com/pages/kristall-kakao", "titel": "", "crawlbar": true, "herkunft": "code"},
      {"pfad": "/pages/linkseite", "url": "https://qiblanco.com/pages/linkseite", "titel": "Linkseite", "crawlbar": true, "herkunft": "shopify"},
      {"pfad": "/pages/meditieren-mit-zeremonie-kakao", "url": "https://qiblanco.com/pages/meditieren-mit-zeremonie-kakao", "titel": "Teil 4: Einen Schritt tiefer – mit Zeremonie-Kakao meditieren – 4 min", "crawlbar": true, "herkunft": "code+shopify"},
      {"pfad": "/pages/mentales-setting", "url": "https://qiblanco.com/pages/mentales-setting", "titel": "Tag 2: Mentales Setting", "crawlbar": true, "herkunft": "code+shopify"},
      {"pfad": "/pages/one-inch", "url": "https://qiblanco.com/pages/one-inch", "titel": "One Inch Club", "crawlbar": true, "herkunft": "shopify"},
      {"pfad": "/pages/podcasts", "url": "https://qiblanco.com/pages/podcasts", "titel": "Podcasts", "crawlbar": true, "herkunft": "code+shopify"},
      {"pfad": "/pages/qiblanco", "url": "https://qiblanco.com/pages/qiblanco", "titel": "Qiblanco", "crawlbar": true, "herkunft": "shopify"},
      {"pfad": "/pages/qibracelet-details", "url": "https://qiblanco.com/pages/qibracelet-details", "titel": "", "crawlbar": true, "herkunft": "code"},
      {"pfad": "/pages/qibracelet_", "url": "https://qiblanco.com/pages/qibracelet_", "titel": "QiBracelet", "crawlbar": true, "herkunft": "shopify"},
      {"pfad": "/pages/qihome", "url": "https://qiblanco.com/pages/qihome", "titel": "QiHome", "crawlbar": true, "herkunft": "code+shopify"},
      {"pfad": "/pages/qihome-details", "url": "https://qiblanco.com/pages/qihome-details", "titel": "", "crawlbar": true, "herkunft": "code"},
      {"pfad": "/pages/qione", "url": "https://qiblanco.com/pages/qione", "titel": "QiOne", "crawlbar": true, "herkunft": "code+shopify"},
      {"pfad": "/pages/qione-2-pro-details", "url": "https://qiblanco.com/pages/qione-2-pro-details", "titel": "", "crawlbar": true, "herkunft": "code"},
      {"pfad": "/pages/studie-darmbarriere", "url": "https://qiblanco.com/pages/studie-darmbarriere", "titel": "Schutzwirkung von QiOne® 2 Pro auf kultivierte Darmepithelzellen nach Handybestrahlung", "crawlbar": true, "herkunft": "code+shopify"},
      {"pfad": "/pages/studie-immunzellen", "url": "https://qiblanco.com/pages/studie-immunzellen", "titel": "QiOne® 2 Pro und Immunzellen: Was die In-vitro-Studie von 2021 gemessen hat", "crawlbar": true, "herkunft": "code+shopify"},
      {"pfad": "/pages/studie-nutzererfahrung", "url": "https://qiblanco.com/pages/studie-nutzererfahrung", "titel": "QTA Gitterchip-Technologie: Nutzererfahrungen und präklinische Daten im Vergleich", "crawlbar": true, "herkunft": "code+shopify"},
      {"pfad": "/pages/studie-oxidativer-stress", "url": "https://qiblanco.com/pages/studie-oxidativer-stress", "titel": "QiBracelet® und oxidativer Stress: Zellschutz im Laborversuch", "crawlbar": true, "herkunft": "code+shopify"},
      {"pfad": "/pages/studie-qihome-air", "url": "https://qiblanco.com/pages/studie-qihome-air", "titel": "QiHome® Air: Zellregeneration und oxidativer Stress im Laborversuch", "crawlbar": true, "herkunft": "code+shopify"},
      {"pfad": "/pages/studien", "url": "https://qiblanco.com/pages/studien", "titel": "Studien", "crawlbar": true, "herkunft": "code+shopify"},
      {"pfad": "/pages/superhuman", "url": "https://qiblanco.com/pages/superhuman", "titel": "Superhuman", "crawlbar": true, "herkunft": "code+shopify"},
      {"pfad": "/pages/superhuman-kurs", "url": "https://qiblanco.com/pages/superhuman-kurs", "titel": "Tiktok Landingpage Superhuman Kurs", "crawlbar": true, "herkunft": "shopify"},
      {"pfad": "/pages/superhuman-kurs-bestatigung", "url": "https://qiblanco.com/pages/superhuman-kurs-bestatigung", "titel": "Superhuman Kurs - Bestätigung", "crawlbar": true, "herkunft": "shopify"},
      {"pfad": "/pages/support-1", "url": "https://qiblanco.com/pages/support-1", "titel": "Support", "crawlbar": true, "herkunft": "shopify"},
      {"pfad": "/pages/technologie", "url": "https://qiblanco.com/pages/technologie", "titel": "Technologie", "crawlbar": true, "herkunft": "code+shopify"},
      {"pfad": "/pages/teilnahmebedingungen", "url": "https://qiblanco.com/pages/teilnahmebedingungen", "titel": "Teilnahmebedingungen", "crawlbar": true, "herkunft": "code+shopify"},
      {"pfad": "/pages/ueber-uns", "url": "https://qiblanco.com/pages/ueber-uns", "titel": "", "crawlbar": true, "herkunft": "code"},
      {"pfad": "/pages/vitamine-mineralien", "url": "https://qiblanco.com/pages/vitamine-mineralien", "titel": "Tag 3: Vitamine & Mineralien", "crawlbar": true, "herkunft": "code+shopify"},
      {"pfad": "/pages/was-ist-zeremonie-kakao", "url": "https://qiblanco.com/pages/was-ist-zeremonie-kakao", "titel": "Teil 2: Zeremonie-Kakao: Was ist das?! – 8 min", "crawlbar": true, "herkunft": "code+shopify"},
      {"pfad": "/pages/widerrufsbelehrung", "url": "https://qiblanco.com/pages/widerrufsbelehrung", "titel": "Widerrufsbelehrung", "crawlbar": true, "herkunft": "shopify"},
      {"pfad": "/pages/wirkt-das", "url": "https://qiblanco.com/pages/wirkt-das", "titel": "Wirkt das überhaupt?", "crawlbar": true, "herkunft": "code+shopify"},
      {"pfad": "/pages/zeremonie-kakao-kurs", "url": "https://qiblanco.com/pages/zeremonie-kakao-kurs", "titel": "Zeremonie Kakao Kurs", "crawlbar": true, "herkunft": "code+shopify"},
      {"pfad": "/pages/zeremonie-kakao-language-select", "url": "https://qiblanco.com/pages/zeremonie-kakao-language-select", "titel": "Zeremonie Kakao Language Select", "crawlbar": true, "herkunft": "shopify"},
      {"pfad": "/products/37cr378n", "url": "https://qiblanco.com/products/37cr378n", "titel": "2x Crystal Cacao® CREATE – 100% Bio", "crawlbar": true, "herkunft": "shopify"},
      {"pfad": "/products/8kendiw34hd", "url": "https://qiblanco.com/products/8kendiw34hd", "titel": "Angebot: 2x QiOne® 2 Pro", "crawlbar": true, "herkunft": "shopify"},
      {"pfad": "/products/aw783hfn", "url": "https://qiblanco.com/products/aw783hfn", "titel": "2x Crystal Cacao® AWAKE – 100% Bio", "crawlbar": true, "herkunft": "shopify"},
      {"pfad": "/products/broschure", "url": "https://qiblanco.com/products/broschure", "titel": "Hochwertige Faltbroschüre", "crawlbar": true, "herkunft": "shopify"},
      {"pfad": "/products/bundle-2x-awake", "url": "https://qiblanco.com/products/bundle-2x-awake", "titel": "Bundle: 2x AWAKE", "crawlbar": true, "herkunft": "shopify"},
      {"pfad": "/products/bundle-3x-awake", "url": "https://qiblanco.com/products/bundle-3x-awake", "titel": "Bundle: 3x AWAKE", "crawlbar": true, "herkunft": "shopify"},
      {"pfad": "/products/crystal-cacao-adfiefiale", "url": "https://qiblanco.com/products/crystal-cacao-adfiefiale", "titel": "Crystal Cacao® Create - Bio", "crawlbar": true, "herkunft": "shopify", "ads": "pausiert"},
      {"pfad": "/products/crystal-cacao-angebot", "url": "https://qiblanco.com/products/crystal-cacao-angebot", "titel": "Crystal Cacao® Create & Awake – Bio", "crawlbar": true, "herkunft": "shopify"},
      {"pfad": "/products/crystal-cacao-awake", "url": "https://qiblanco.com/products/crystal-cacao-awake", "titel": "Crystal Cacao® Awake – Bio", "crawlbar": true, "herkunft": "code+shopify"},
      {"pfad": "/products/crystal-cacao-create", "url": "https://qiblanco.com/products/crystal-cacao-create", "titel": "Crystal Cacao® Create – Bio", "crawlbar": true, "herkunft": "code+shopify"},
      {"pfad": "/products/mengenrabatt-2x", "url": "https://qiblanco.com/products/mengenrabatt-2x", "titel": "Bundle: 2x CREATE", "crawlbar": true, "herkunft": "shopify"},
      {"pfad": "/products/mengenrabatt-3x-create", "url": "https://qiblanco.com/products/mengenrabatt-3x-create", "titel": "Bundle: 3x CREATE", "crawlbar": true, "herkunft": "shopify"},
      {"pfad": "/products/pjdz538hgs0", "url": "https://qiblanco.com/products/pjdz538hgs0", "titel": "Angebot: QiOne® 2 Pro + Necklace", "crawlbar": true, "herkunft": "shopify"},
      {"pfad": "/products/qibracelet", "url": "https://qiblanco.com/products/qibracelet", "titel": "QiBracelet®", "crawlbar": true, "herkunft": "code+shopify"},
      {"pfad": "/products/qihome-air", "url": "https://qiblanco.com/products/qihome-air", "titel": "QiHome® Air", "crawlbar": true, "herkunft": "code+shopify"},
      {"pfad": "/products/qione-1", "url": "https://qiblanco.com/products/qione-1", "titel": "QiOne® 1", "crawlbar": true, "herkunft": "shopify"},
      {"pfad": "/products/qione-2-pro", "url": "https://qiblanco.com/products/qione-2-pro", "titel": "QiOne® 2 Pro", "crawlbar": true, "herkunft": "code+shopify"},
      {"pfad": "/products/qione-kette", "url": "https://qiblanco.com/products/qione-kette", "titel": "Necklace für QiOne®", "crawlbar": true, "herkunft": "code+shopify"},
      {"pfad": "/products/test-page-crystal-cacao®-create-spater-wieder-loschen", "url": "https://qiblanco.com/products/test-page-crystal-cacao®-create-spater-wieder-loschen", "titel": "Test Page - Crystal Cacao® Create später wieder löschen", "crawlbar": true, "herkunft": "shopify"},
      {"pfad": "/products/zeremonie-kakao", "url": "https://qiblanco.com/products/zeremonie-kakao", "titel": "", "crawlbar": true, "herkunft": "code"}
    ]
  },
  {
    "schluessel": "lp_aktiv",
    "titel": "Landingpage Aktive",
    "beschreibung": "Landingpages, die das Ads-Portfolio referenziert — inkl. Detail- und Shop-Seiten.",
    "eintraege": [
      {"pfad": "/pages/E-Smog-Schutz", "url": "https://qiblanco.com/pages/E-Smog-Schutz", "titel": "", "crawlbar": false, "herkunft": "code"},
      {"pfad": "/pages/chat-bot", "url": "https://qiblanco.com/pages/chat-bot", "titel": "", "crawlbar": false, "herkunft": "code"},
      {"pfad": "/pages/crystal-cacao", "url": "https://qiblanco.com/pages/crystal-cacao", "titel": "Kristall Kakao", "crawlbar": true, "herkunft": "code+shopify", "ads": "pausiert"},
      {"pfad": "/pages/das-20-tage-versprechen", "url": "https://qiblanco.com/pages/das-20-tage-versprechen", "titel": "", "crawlbar": false, "herkunft": "code"},
      {"pfad": "/pages/haelt-das-mein-leben-aus", "url": "https://qiblanco.com/pages/haelt-das-mein-leben-aus", "titel": "", "crawlbar": false, "herkunft": "code"},
      {"pfad": "/pages/kette-oder-armband", "url": "https://qiblanco.com/pages/kette-oder-armband", "titel": "", "crawlbar": false, "herkunft": "code"},
      {"pfad": "/pages/partner", "url": "https://qiblanco.com/pages/partner", "titel": "Partner", "crawlbar": false, "herkunft": "code+shopify"},
      {"pfad": "/pages/qiblanco-qibracelet", "url": "https://qiblanco.com/pages/qiblanco-qibracelet", "titel": "qiblanco-qibracelet", "crawlbar": true, "herkunft": "shopify", "ads": "pausiert"},
      {"pfad": "/pages/qibracelet", "url": "https://qiblanco.com/pages/qibracelet", "titel": "QiBracelet", "crawlbar": false, "herkunft": "code+shopify"},
      {"pfad": "/pages/qihome-air", "url": "https://qiblanco.com/pages/qihome-air", "titel": "", "crawlbar": false, "herkunft": "code"},
      {"pfad": "/pages/qione-2-pro", "url": "https://qiblanco.com/pages/qione-2-pro", "titel": "", "crawlbar": false, "herkunft": "code"},
      {"pfad": "/pages/qione-2-pro-2x", "url": "https://qiblanco.com/pages/qione-2-pro-2x", "titel": "", "crawlbar": false, "herkunft": "code"},
      {"pfad": "/pages/qione-zellschutz", "url": "https://qiblanco.com/pages/qione-zellschutz", "titel": "", "crawlbar": false, "herkunft": "code", "ads": "pausiert"},
      {"pfad": "/pages/schlaf-zellen-schutz", "url": "https://qiblanco.com/pages/schlaf-zellen-schutz", "titel": "", "crawlbar": false, "herkunft": "code", "ads": "pausiert"},
      {"pfad": "/pages/so-funktioniert-der-qione", "url": "https://qiblanco.com/pages/so-funktioniert-der-qione", "titel": "", "crawlbar": false, "herkunft": "code", "ads": "aktiv"},
      {"pfad": "/pages/so-wirkt-kohaerentes-wasser", "url": "https://qiblanco.com/pages/so-wirkt-kohaerentes-wasser", "titel": "", "crawlbar": false, "herkunft": "code"},
      {"pfad": "/pages/tiefer-schlaf", "url": "https://qiblanco.com/pages/tiefer-schlaf", "titel": "", "crawlbar": false, "herkunft": "code"},
      {"pfad": "/pages/wir-machen-ihn-auf", "url": "https://qiblanco.com/pages/wir-machen-ihn-auf", "titel": "", "crawlbar": false, "herkunft": "code"},
      {"pfad": "/pages/zell-schutz", "url": "https://qiblanco.com/pages/zell-schutz", "titel": "", "crawlbar": false, "herkunft": "code", "ads": "aktiv"},
      {"pfad": "/pages/zellstudien-ehrlich", "url": "https://qiblanco.com/pages/zellstudien-ehrlich", "titel": "", "crawlbar": false, "herkunft": "code"}
    ]
  },
  {
    "schluessel": "lp_bau",
    "titel": "Landingpage Bau",
    "beschreibung": "Nicht crawlbare Seiten in Test/Bau.",
    "eintraege": [
      {"pfad": "/pages/schlaf-zellen-schutz-v2-18ef", "url": "https://qiblanco.com/pages/schlaf-zellen-schutz-v2-18ef", "titel": "", "crawlbar": false, "herkunft": "code"},
      {"pfad": "/pages/schlaf-zellen-schutz-v3-67a7", "url": "https://qiblanco.com/pages/schlaf-zellen-schutz-v3-67a7", "titel": "", "crawlbar": false, "herkunft": "code"}
    ]
  },
  {
    "schluessel": "sales",
    "titel": "Sales",
    "beschreibung": "Sales- und Kampagnenseiten.",
    "eintraege": [
      {"pfad": "/collections/blackfriday-sale-artikel", "url": "https://qiblanco.com/collections/blackfriday-sale-artikel", "titel": "Blackfriday Sale Artikel", "crawlbar": true, "herkunft": "shopify"},
      {"pfad": "/pages/10-jahre-pre-access", "url": "https://qiblanco.com/pages/10-jahre-pre-access", "titel": "", "crawlbar": false, "herkunft": "code", "ads": "pausiert"},
      {"pfad": "/pages/10-jahre-sale", "url": "https://qiblanco.com/pages/10-jahre-sale", "titel": "", "crawlbar": false, "herkunft": "code", "ads": "pausiert"},
      {"pfad": "/pages/anmeldung-erfolgreich", "url": "https://qiblanco.com/pages/anmeldung-erfolgreich", "titel": "Kakao Zeremonie Kurs: Anmeldung erfolgreich", "crawlbar": true, "herkunft": "shopify"},
      {"pfad": "/pages/anmeldung-erfolgreich-pre-access", "url": "https://qiblanco.com/pages/anmeldung-erfolgreich-pre-access", "titel": "", "crawlbar": false, "herkunft": "code"},
      {"pfad": "/pages/exclusive-solutions", "url": "https://qiblanco.com/pages/exclusive-solutions", "titel": "", "crawlbar": false, "herkunft": "code"},
      {"pfad": "/pages/kw-anmeldung-erfolgreich", "url": "https://qiblanco.com/pages/kw-anmeldung-erfolgreich", "titel": "Ketogenes Wochenende – Anmeldung erfolgreich", "crawlbar": true, "herkunft": "shopify"},
      {"pfad": "/pages/pre-access", "url": "https://qiblanco.com/pages/pre-access", "titel": "Eintragungsseite", "crawlbar": true, "herkunft": "shopify", "ads": "pausiert"},
      {"pfad": "/pages/superhuman-anmeldung-erfolgreich", "url": "https://qiblanco.com/pages/superhuman-anmeldung-erfolgreich", "titel": "Superhuman Kurs: Anmeldung erfolgreich", "crawlbar": true, "herkunft": "shopify"}
    ]
  },
  {
    "schluessel": "recht_service",
    "titel": "Rechtliches & Service",
    "beschreibung": "Pflichtangaben, Richtlinien und Servicewege.",
    "eintraege": [
      {"pfad": "/pages/agb", "url": "https://qiblanco.com/pages/agb", "titel": "AGB", "crawlbar": true, "herkunft": "code+shopify"},
      {"pfad": "/pages/datenschutz", "url": "https://qiblanco.com/pages/datenschutz", "titel": "Datenschutz", "crawlbar": true, "herkunft": "code+shopify"},
      {"pfad": "/pages/impressum", "url": "https://qiblanco.com/pages/impressum", "titel": "Impressum", "crawlbar": true, "herkunft": "code+shopify"},
      {"pfad": "/pages/support", "url": "https://qiblanco.com/pages/support", "titel": "Kontaktiere uns!", "crawlbar": true, "herkunft": "code+shopify"},
      {"pfad": "/policies", "url": "https://qiblanco.com/policies", "titel": "", "crawlbar": true, "herkunft": "code"},
      {"pfad": "/policies/privacy-policy", "url": "https://qiblanco.com/policies/privacy-policy", "titel": "Privacy Policy", "crawlbar": true, "herkunft": "shopify"},
      {"pfad": "/policies/refund-policy", "url": "https://qiblanco.com/policies/refund-policy", "titel": "Refund Policy", "crawlbar": true, "herkunft": "shopify"},
      {"pfad": "/policies/shipping-policy", "url": "https://qiblanco.com/policies/shipping-policy", "titel": "Shipping Policy", "crawlbar": true, "herkunft": "shopify"},
      {"pfad": "/policies/terms-of-service", "url": "https://qiblanco.com/policies/terms-of-service", "titel": "Terms of Service", "crawlbar": true, "herkunft": "shopify"},
      {"pfad": "/widerruf", "url": "https://qiblanco.com/widerruf", "titel": "", "crawlbar": true, "herkunft": "code"},
      {"pfad": "/widerruf/bestaetigen", "url": "https://qiblanco.com/widerruf/bestaetigen", "titel": "", "crawlbar": true, "herkunft": "code"}
    ]
  },
  {
    "schluessel": "system_konto",
    "titel": "System & Konto",
    "beschreibung": "Konto-, Warenkorb- und technische Routen.",
    "eintraege": [
      {"pfad": "/account", "url": "https://qiblanco.com/account", "titel": "", "crawlbar": true, "herkunft": "code"},
      {"pfad": "/account/addresses", "url": "https://qiblanco.com/account/addresses", "titel": "", "crawlbar": true, "herkunft": "code"},
      {"pfad": "/account/authorize", "url": "https://qiblanco.com/account/authorize", "titel": "", "crawlbar": true, "herkunft": "code"},
      {"pfad": "/account/login", "url": "https://qiblanco.com/account/login", "titel": "", "crawlbar": true, "herkunft": "code"},
      {"pfad": "/account/logout", "url": "https://qiblanco.com/account/logout", "titel": "", "crawlbar": true, "herkunft": "code"},
      {"pfad": "/account/orders", "url": "https://qiblanco.com/account/orders", "titel": "", "crawlbar": true, "herkunft": "code"},
      {"pfad": "/account/profile", "url": "https://qiblanco.com/account/profile", "titel": "", "crawlbar": true, "herkunft": "code"},
      {"pfad": "/cart", "url": "https://qiblanco.com/cart", "titel": "", "crawlbar": true, "herkunft": "code"},
      {"pfad": "/cart/attribution", "url": "https://qiblanco.com/cart/attribution", "titel": "", "crawlbar": true, "herkunft": "code"},
      {"pfad": "/collect", "url": "https://qiblanco.com/collect", "titel": "", "crawlbar": true, "herkunft": "code"},
      {"pfad": "/go", "url": "https://qiblanco.com/go", "titel": "", "crawlbar": true, "herkunft": "code"},
      {"pfad": "/robots.txt", "url": "https://qiblanco.com/robots.txt", "titel": "", "crawlbar": true, "herkunft": "code"},
      {"pfad": "/search", "url": "https://qiblanco.com/search", "titel": "", "crawlbar": true, "herkunft": "code"},
      {"pfad": "/sitemap.xml", "url": "https://qiblanco.com/sitemap.xml", "titel": "", "crawlbar": true, "herkunft": "code"}
    ]
  }
];
