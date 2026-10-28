# LIVEFLIP: Sicherheitsmeister T2, DACH-Abwehr-Middleware (shadow)

**Stand:** gebaut 2026-07-15 (Job `20260715-abwehr-scraping-content-schutz-deepdive`, Segment s04)
**Status 2026-10-10:** auf main im Schatten (Job `20261010-aiceo-s04-abwehr-pr47-rebase-schatten`,
PR #47 samt Erlaub-Lane neu auf main gesetzt). `SM_MODE` fehlt, also shadow.
Der Flip auf `on` ist ein eigener, datenbasierter Schritt.

---

## Was dieser Branch tut (und was nicht)

Additiver Abwehr-Vorfilter im Oxygen-Worker (`server.js` → `app/lib/abwehr/`):
Missbrauchs-Score 0–100 aus **ausschließlich objektiven Signalen** (Rate,
Header-Anomalie, WAF-Pfad-/Query-Regeln, fehlendes Verhaltens-Token,
Vollkatalog-Muster), gestufte **uniforme** Eskalation S0–S3.

**Anti-Cloaking-Leitplanke (bewiesen, nicht behauptet):**
- Der Layer ändert **nur** Statuscode/Challenge, **nie** den Body einer
  200-Antwort (INV-1-Test: Score 0 vs. 90 → gleicher Content-Hash).
- Scoring wirft bei jedem Identitäts-Feld (INV-2, Paritäts-getestet gegen
  die Python-SSoT `shared-state/sicherheitsmeister/src/`).
- Challenge-/Block-Seiten sind Konstanten, für jeden Besucher identisch.
- Checkout-/Warenkorb-Pfade werden **nie** geblockt (max. Challenge).
- Nichts wird persistiert; geloggt wird nur ein tages-gesalzenes
  Hash-Präfix + objektive Signale (kein IP/UA, INV-3).

## Die drei Schalter (alle Default = AUS/shadow)

| Schalter | Default | Wirkung |
|---|---|---|
| `SM_MODE` | fehlt = **shadow** | `shadow`: nur Verdikt-Logs in den Oxygen-Log-Drain, 0 Wirkung. `on`: S1 Retry-After+tarpit, S2 429-Challenge, S3 befristeter 503 (15 min). `off`: Kill, purer Passthrough, kein Log. |
| `SM_VERHALTEN` | fehlt = aus | `on`: root.jsx liefert das uniforme First-Party-Snippet `/qb-verhalten.js` an ALLE aus (setzt Sicherheits-Cookie `qb_vt`, 24 h). Ohne Flag rendert nichts und das Token-Signal ist neutral. |
| `SM_RATE_LIMIT_PRO_MIN` / `SM_KATALOG_N` | 120 / 80 | Kalibrier-Schrauben (erst nach Shadow-Messung anfassen). |
| `SM_SENKE` | fehlt = **an** | Rückfluss: jedes geloggte Verdikt geht zusätzlich per `ctx.waitUntil(fetch)` an `https://qpx.65-108-150-121.sslip.io/sm` (sicherheitsmeister `sm-senke`) und landet über den stündlichen Tick in `data/sicherheitsmeister.db` (`pfad_muster` `storefront:<pfad>`). `off` (auch `aus`, `0`, `false`, `nein`): nur Log. `SM_SENKE_PRO_MIN` (30 je Isolate und Minute, `0` = nichts senden), `SM_SENKE_URL`. Gesendet wird erst nach `await next()`. |
| `SM_SENKE_NETZ` | fehlt = **an** | Nur im Senke-Körper, nie im Log: das gekürzte Präfix der Besucher-IP (`netz`, IPv4 /24, IPv6 /48). Der Server klassiert es gegen die Rechenzentrums-Listen und speichert nur den Netz-Typ (`ereignis.asn_type`). `off` (auch `aus`, `0`, `false`, `nein`): Präfix weglassen, `asn_type` bleibt `unknown`. |
| `SM_STICHPROBE` | fehlt = **an** | Nenner der Kalibrier-Quote: die erste Anfrage jedes Schlüssels mit erstem Hex-Zeichen `0` bis `3` (1/4) geht auch auf S0 an die Senke (`stichprobe: 4`). `off`: nur noch auffällige Verdikte. Server: `sicherheitsmeister kalibrierung`. |

Oxygen-Runtime-Env kommt aus dem `--env-file` des Deploy-Workflows
(NICHT im Shopify-Admin suchen, homepage-bauer-Lehre).

## Der Weg zu live (jede Stufe einzeln)

1. **Merge des PR** = Deploy, aber weiterhin **shadow** (kein Flag gesetzt,
   Verhalten der Seite unverändert; einzige Sichtbarkeit: Verdikt-Zeilen
   `{"sm_abwehr":1,...}` in den Oxygen-Logs).
2. **Monitor-Phase** (Akamai-Best-Practice, Konzept Kap. 2): 1–2 Wochen
   Shadow-Logs sichten, Schwellen aus p99 echter Sessions kalibrieren
   (FM-Eintrag `sicherheitsmeister-schwellen-14t` existiert seit s02).
   Messung seit 2026-10-11 auf dem Server: `sicherheitsmeister kalibrierung --tage 14`
   (Anteil echter, also nicht Rechenzentrum, Schlüssel auf S2 oder höher; Soll unter 1 %, n ≥ 500).
3. Optional `SM_VERHALTEN=on` (nur Snippet + Cookie, weiterhin 0 Blocking).
4. `SM_MODE=on` = scharf. Eigener Schritt über das Gate `sm-mode-vollzug-storefront`,
   erst mit Trefferquote und Fehlalarm-Zahlen aus der Shadow-Phase.
   **Im selben Schritt** auf dem Server `SM_SENKE_MODI=shadow,on` in
   `sicherheitsmeister/config/sicherheitsmeister.conf` setzen. Die Senke nimmt
   sonst nur `shadow` an und weist jedes `on`-Verdikt mit 400 ab; die tägliche
   Probe `senke_rand` wird dann rot.

## Vor dem Flip offen (adversariale Prüfung 2026-10-10) — erledigt 2026-10-26

Erledigt von Job `20261011-fm-folge-sicherheitsmeister-asn-und-kalibrierung-s02`,
in `eskalation.js` und in der Python-SSoT `src/eskalation.py` gleich
(`scripts/abwehr/paritaet.mjs` 4560/0, `inv1-test.mjs` 4b/4c):

- **`/api/` (Storefront-API-Proxy):** eigene Klasse `API_PFADE`, höchstens S1
  (200, Body gleich, `Retry-After` + Tarpit). Nie Challenge, nie Block: ein
  `fetch()` kann die Challenge-Seite nicht lösen. Nur `CHECKOUT_PFADE` hätte
  503 auf 429 gekappt, die HTML-429 aber stehen lassen.
  `.data`, `__manifest` und `/collect` gehören nicht dazu: Rechenzentrums-Scraper
  greifen gemessen stark über `.data` ab.
- **Erste Anfrage ohne Hysterese:** weniger als `HYSTERESE_N` (3) Beobachtungen
  sind nicht gehalten, also höchstens S1. Challenge und Block erst ab einem
  vollen Fenster.
- **Senke:** nimmt seit demselben Job Zeilen an, deren angewandte Stufe unter
  `stufe(score)` liegt (Hysterese, Checkout-Kappe, API-Kappe). Vorher wies sie
  genau diese echten Zeilen ab. Eine Stufe ÜBER dem Score bleibt abgewiesen.
- **Good-Bot-Politik (F-7):** gemessen gegenstandslos. Vom 2026-10-12 bis zum
  2026-10-25 gab es 872 Good-Bot-Schlüssel und 0 davon auf S2 oder höher; im
  7-Tage-Rohbestand lag der Höchstscore bei 16, alle auf S0. Keine Sonderregel
  im Worker. Wache: `sicherheitsmeister kalibrierung` zählt `n_goodbot_s2plus`
  weiter, und ein Wert über 0 ist ein Befund (Rückweg `SM_MODE=shadow`).

## Rollback

- Vor Merge: Branch verwerfen. Der Bestand bleibt unberührt.
- Nach Merge, vor Flip: nichts nötig (shadow = 0 Wirkung); Rückbau = revert.
- Scharf: `SM_MODE=off` (ein Env-Feld) = kompletter Passthrough, sofort.

## Ehrlich deklarierte Grenzen (Konzept Kap. 7)

- **F-2:** Kein KV/DO auf Oxygen → Rate-/Katalog-State ist in-memory pro
  Isolate + Cache-API-Minuten-Aggregat (per-Datacenter) = **best-effort**,
  kein globaler Zähler. Harte Grenze bleibt Shopifys Layer-1.
- **ASN-Typ** ist im Worker nicht verfügbar (kein MMDB). Das Score-Signal
  `asn_type` bleibt im Worker `unknown`, für Rechenzentrums-Verkehr ist der Score
  damit 15 Punkte milder (INV-7). Seit 2026-10-11 klassiert der Server das
  gekürzte Präfix (`SM_SENKE_NETZ`) und trägt den Netz-Typ in `ereignis.asn_type`
  ein. Das dient der Kalibrierung vor dem Flip, nicht dem Live-Verdikt.
- **Shadow-Sink:** Verdikte landen im Oxygen-Log-Drain und seit 2026-10-10
  (rz-0037 s02) zusätzlich in `data/sicherheitsmeister.db` (Senke, s. Schalter).
  Die Senke hat kein gemeinsames Geheimnis. Sie prüft eine Feld-Whitelist, ob
  die Zeile in sich stimmt (Score aus Signalen, Lane-Dämpfung, Stufe) und den
  konfigurierten Modus, und sie nimmt nur aus dem Cloudflare-Netz an. Wer selbst
  einen Cloudflare-Worker betreibt, kann trotzdem plausible Schatten-Zeilen
  einspeisen. Wer die Zahlen für den Flip liest, filtert auf `herkunft = cf` und
  rechnet mit dieser Grenze.
- **F-5:** Adaptive Scraper lösen Challenges. Die Middleware ist Dämpfer
  im Mehrschicht-Verbund, kein Wall.
- **Gute Bots:** Reverse-DNS-Verifikation (Googlebot) ist im Worker nicht
  möglich. Die Good-Bot-Politik ist seit 2026-10-26 gemessen entschieden
  (siehe „Vor dem Flip offen“): keine Sonderregel, weil kein Good-Bot S2 erreicht.
