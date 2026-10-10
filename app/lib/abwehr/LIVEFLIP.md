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

Oxygen-Runtime-Env kommt aus dem `--env-file` des Deploy-Workflows
(NICHT im Shopify-Admin suchen, homepage-bauer-Lehre).

## Der Weg zu live (jede Stufe einzeln)

1. **Merge des PR** = Deploy, aber weiterhin **shadow** (kein Flag gesetzt,
   Verhalten der Seite unverändert; einzige Sichtbarkeit: Verdikt-Zeilen
   `{"sm_abwehr":1,...}` in den Oxygen-Logs).
2. **Monitor-Phase** (Akamai-Best-Practice, Konzept Kap. 2): 1–2 Wochen
   Shadow-Logs sichten, Schwellen aus p99 echter Sessions kalibrieren
   (FM-Eintrag `sicherheitsmeister-schwellen-14t` existiert seit s02).
3. Optional `SM_VERHALTEN=on` (nur Snippet + Cookie, weiterhin 0 Blocking).
4. `SM_MODE=on` = scharf. Eigener Schritt über das Gate `sm-mode-vollzug-storefront`,
   erst mit Trefferquote und Fehlalarm-Zahlen aus der Shadow-Phase.
   **Im selben Schritt** auf dem Server `SM_SENKE_MODI=shadow,on` in
   `sicherheitsmeister/config/sicherheitsmeister.conf` setzen. Die Senke nimmt
   sonst nur `shadow` an und weist jedes `on`-Verdikt mit 400 ab; die tägliche
   Probe `senke_rand` wird dann rot.

## Vor dem Flip offen (adversariale Prüfung 2026-10-10)

- `/api/` (Storefront-API-Proxy) steht nicht in `CHECKOUT_PFADE`. Bei `on` könnte
  der Proxy eine HTML-Antwort mit 429/503 bekommen. Vor dem Flip in die
  geschützten Pfade aufnehmen.
- Beim ersten Request eines Schlüssels trägt der Verlauf nur einen Wert, die
  Hysterese greift dann nicht. Ein einzelner Ausreißer eskaliert bei `on` sofort.
- Beides wirkt nur bei `SM_MODE=on`. Im Schatten ändert die Middleware keine Antwort.

## Rollback

- Vor Merge: Branch verwerfen. Der Bestand bleibt unberührt.
- Nach Merge, vor Flip: nichts nötig (shadow = 0 Wirkung); Rückbau = revert.
- Scharf: `SM_MODE=off` (ein Env-Feld) = kompletter Passthrough, sofort.

## Ehrlich deklarierte Grenzen (Konzept Kap. 7)

- **F-2:** Kein KV/DO auf Oxygen → Rate-/Katalog-State ist in-memory pro
  Isolate + Cache-API-Minuten-Aggregat (per-Datacenter) = **best-effort**,
  kein globaler Zähler. Harte Grenze bleibt Shopifys Layer-1.
- **ASN-Typ** ist im Worker nicht verfügbar (kein MMDB) → Signal steht auf
  `unknown`; Datacenter-Erkennung leistet der T1-Kern offline (events.db)
  bzw. der Eigenserver (T3).
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
  möglich. Vor `SM_MODE=on` gehört die Good-Bot-Policy entschieden
  (SEO-Schutz F-7); bis dahin schützt der shadow-Default.
