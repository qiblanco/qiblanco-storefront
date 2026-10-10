# LIVEFLIP — Sicherheitsmeister T2: DACH-Abwehr-Middleware (shadow)

**Stand:** gebaut 2026-07-15 (Job `20260715-abwehr-scraping-content-schutz-deepdive`, Segment s04)
**Status:** PR-Branch `feat/abwehr-middleware-shadow` — **NICHT gemergt.**
Jeder Schritt Richtung live ist ein **Christian-Gate**.

---

## Was dieser Branch tut (und was nicht)

Additiver Abwehr-Vorfilter im Oxygen-Worker (`server.js` → `app/lib/abwehr/`):
Missbrauchs-Score 0–100 aus **ausschliesslich objektiven Signalen** (Rate,
Header-Anomalie, WAF-Pfad-/Query-Regeln, fehlendes Verhaltens-Token,
Vollkatalog-Muster), gestufte **uniforme** Eskalation S0–S3.

**Anti-Cloaking-Leitplanke (bewiesen, nicht behauptet):**
- Der Layer ändert **nur** Statuscode/Challenge, **nie** den Body einer
  200-Antwort (INV-1-Test: Score 0 vs. 90 → gleicher Content-Hash).
- Scoring wirft bei jedem Identitäts-Feld (INV-2, Paritäts-getestet gegen
  die Python-SSoT `shared-state/sicherheitsmeister/src/`).
- Challenge-/Block-Seiten sind Konstanten — für jeden Besucher identisch.
- Checkout-/Warenkorb-Pfade werden **nie** geblockt (max. Challenge).
- Nichts wird persistiert; geloggt wird nur ein tages-gesalzenes
  Hash-Präfix + objektive Signale (kein IP/UA, INV-3).

## Die drei Schalter (alle Default = AUS/shadow)

| Schalter | Default | Wirkung |
|---|---|---|
| `SM_MODE` | fehlt = **shadow** | `shadow`: nur Verdikt-Logs in den Oxygen-Log-Drain, 0 Wirkung. `on`: S1 Retry-After+tarpit, S2 429-Challenge, S3 befristeter 503 (15 min). `off`: Kill — purer Passthrough, kein Log. |
| `SM_VERHALTEN` | fehlt = aus | `on`: root.jsx liefert das uniforme First-Party-Snippet `/qb-verhalten.js` an ALLE aus (setzt Sicherheits-Cookie `qb_vt`, 24 h). Ohne Flag rendert nichts und das Token-Signal ist neutral. |
| `SM_RATE_LIMIT_PRO_MIN` / `SM_KATALOG_N` | 120 / 80 | Kalibrier-Schrauben (erst nach Shadow-Messung anfassen). |

Oxygen-Runtime-Env kommt aus dem `--env-file` des Deploy-Workflows
(NICHT im Shopify-Admin suchen — homepage-bauer-Lehre).

## Der Weg zu live (jede Stufe einzeln, Christian entscheidet)

1. **Merge des PR** = Deploy, aber weiterhin **shadow** (kein Flag gesetzt,
   Verhalten der Seite unverändert; einzige Sichtbarkeit: Verdikt-Zeilen
   `{"sm_abwehr":1,...}` in den Oxygen-Logs).
2. **Monitor-Phase** (Akamai-Best-Practice, Konzept Kap. 2): 1–2 Wochen
   Shadow-Logs sichten, Schwellen aus p99 echter Sessions kalibrieren
   (FM-Eintrag `sicherheitsmeister-schwellen-14t` existiert seit s02).
3. Optional `SM_VERHALTEN=on` (nur Snippet + Cookie, weiterhin 0 Blocking).
4. `SM_MODE=on` = scharf. **Geld-/Live-Gate: nur Christian.**

## Rollback

- Vor Merge: Branch verwerfen — Bestand ist unberührt.
- Nach Merge, vor Flip: nichts nötig (shadow = 0 Wirkung); Rückbau = revert.
- Scharf: `SM_MODE=off` (ein Env-Feld) = kompletter Passthrough, sofort.

## Ehrlich deklarierte Grenzen (Konzept Kap. 7)

- **F-2:** Kein KV/DO auf Oxygen → Rate-/Katalog-State ist in-memory pro
  Isolate + Cache-API-Minuten-Aggregat (per-Datacenter) = **best-effort**,
  kein globaler Zähler. Harte Grenze bleibt Shopifys Layer-1.
- **ASN-Typ** ist im Worker nicht verfügbar (kein MMDB) → Signal steht auf
  `unknown`; Datacenter-Erkennung leistet der T1-Kern offline (events.db)
  bzw. der Eigenserver (T3).
- **Shadow-Sink:** Verdikte landen im Oxygen-Log-Drain, noch **nicht**
  automatisch in `data/sicherheitsmeister.db` (offene Flanke, s06/W-Map).
- **F-5:** Adaptive Scraper lösen Challenges — die Middleware ist Dämpfer
  im Mehrschicht-Verbund, kein Wall.
- **Gute Bots:** Reverse-DNS-Verifikation (Googlebot) ist im Worker nicht
  möglich. Vor `SM_MODE=on` gehört die Good-Bot-Policy entschieden
  (SEO-Schutz F-7); bis dahin schützt der shadow-Default.
