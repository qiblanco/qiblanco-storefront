#!/usr/bin/env python3
"""Antwortet JEDE URL der ausgelieferten Sitemap mit 200 — ohne Weiterleitung?

DIE ZUSAGE: eine Sitemap nennt kanonische URLs. Leitet ein Eintrag weiter,
sagt die Sitemap „das ist die kanonische URL" und die Antwort sagt „nein, eine
andere". Der Widerspruch kostet Crawl-Budget und sendet ein gegenlaeufiges
Signal. Gemessen am 2026-09-13 traf das 2 der 44 URLs in sitemap/pages/1.xml
(/pages/qihome und /pages/qione, beide 301 auf ihre -details-Fassung).

SIE KENNT DIE LISTE NICHT, GEGEN DIE SIE PRUEFT — und das ist der Punkt.
app/lib/sitemap-weiterleitungen.js fuehrt die zwei Handles, die der Bau vom
2026-09-13 entfernt hat. Diese Probe liest jene Datei NICHT: sie ruft die
ausgelieferte Sitemap ab und misst jede URL einzeln. Damit kann sie nicht
dadurch gruen werden, dass jemand die Liste pflegt — nur dadurch, dass die
Sitemap wirklich keine weiterleitende URL mehr nennt. Und sie deckt alle fuenf
Sitemap-Typen ab, nicht nur `pages`: der naechste Fall dieser Klasse muss nicht
dort auftreten, wo der letzte war.

KEIN GEPINNTER ZAEHLER UND KEINE GETIPPTE URL-LISTE: der Nenner kommt zur
Laufzeit aus /sitemap.xml. Der ist ein <sitemapindex> und enthaelt per
Konstruktion KEINE einzige Seiten-URL — wer ihn direkt nach einem Pfad
durchsucht, misst die falsche Datei und bekommt immer null (seo-manager-Falle,
Belegfall 2026-09-10). Er wird deshalb zweistufig aufgeloest.

WEITERLEITUNG WIRD NICHT GEFOLGT: gemessen wird die ERSTE Antwort. Ein Folgen
der Kette wuerde 301 -> 200 als Erfolg buchen und genau den Defekt verstecken.

EXIT-CODES
  0  jede Sitemap-URL antwortet direkt mit 200
  2  BEFUND — mindestens eine URL leitet weiter oder antwortet nicht mit 200
  4  MESSAUSFALL — Sitemap oder eine URL nicht erhebbar (KEIN Urteil)

ROT-NACHWEIS: `--selbsttest` fuehrt jeden Urteils-Arm einzeln vor.
"""
from __future__ import annotations

import argparse
import re
import sys
import urllib.error
import urllib.request
import concurrent.futures as futures

UA = "QiBlancoInternal/sitemap-weiterleitungs-probe (+nachbau-audit)"
HOST = {"dach": "https://qiblanco.com", "crystal": "https://crystal-cacao.com"}
LOC = re.compile(r"<loc>\s*([^<]+?)\s*</loc>")


class _KeinRedirect(urllib.request.HTTPRedirectHandler):
    """Die Kette NICHT verfolgen — die erste Antwort IST die Messgroesse."""

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def hol_text(url: str, timeout: int = 30) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode("utf-8", "replace")


def sitemap_urls(shop: str) -> tuple[list[str], dict[str, int]]:
    """(alle URLs, Zahl je Kind-Sitemap) — zweistufig aufgeloest."""
    wurzel = hol_text(HOST[shop] + "/sitemap.xml")
    kinder = LOC.findall(wurzel)
    if "<sitemapindex" not in wurzel:
        # Kein Index: die Wurzel fuehrt die Seiten-URLs schon selbst.
        return sorted(set(kinder)), {"sitemap.xml": len(kinder)}
    if not kinder:
        raise RuntimeError("sitemapindex nennt keine Kind-Sitemap")
    alle: list[str] = []
    je_teil: dict[str, int] = {}
    for k in kinder:
        urls = LOC.findall(hol_text(k))
        je_teil[k.rsplit("/sitemap/", 1)[-1]] = len(urls)
        alle += urls
    return sorted(set(alle)), je_teil


def messe(url: str, timeout: int = 30) -> tuple[str, int | None, str | None, str | None]:
    """(url, status, ziel, fehler) — ohne der Weiterleitung zu folgen."""
    op = urllib.request.build_opener(_KeinRedirect)
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with op.open(req, timeout=timeout) as r:
            return url, r.status, None, None
    except urllib.error.HTTPError as e:
        ziel = e.headers.get("Location") if e.headers else None
        # 3xx landet hier, weil der Handler oben None zurueckgibt.
        return url, e.code, ziel, None
    except Exception as e:                                        # noqa: BLE001
        return url, None, None, "%s: %s" % (type(e).__name__, str(e)[:80])


def urteile(befunde: list[tuple[str, int, str | None]],
            messausfaelle: dict[str, str],
            n: int) -> tuple[int, str]:
    """Urteils-Arm, vom Abruf getrennt — damit er ohne Netz vorfuehrbar ist."""
    if messausfaelle:
        zeilen = ["[KEINE AUSSAGE] %d URL(s) nicht messbar — ohne sie ist die "
                  "Menge unvollstaendig und jedes Urteil zu gut:" % len(messausfaelle)]
        zeilen += ["    %-58s %s" % (u, g) for u, g in sorted(messausfaelle.items())]
        return 4, "\n".join(zeilen)
    if not n:
        return 4, "[KEINE AUSSAGE] die Sitemap nennt keine einzige URL"
    if befunde:
        zeilen = ["[BEFUND] %d von %d Sitemap-URLs antworten nicht direkt mit 200"
                  % (len(befunde), n)]
        for u, st, ziel in sorted(befunde):
            zeilen.append("    %-58s %s%s" % (u, st, " -> %s" % ziel if ziel else ""))
        return 2, "\n".join(zeilen)
    return 0, "[OK] alle %d Sitemap-URLs antworten direkt mit 200" % n


def selbsttest() -> int:
    faelle = [
        ("weiterleitung", ([("u1", 301, "/ziel")], {}, 3), 2, "u1"),
        ("nicht-200",     ([("u2", 404, None)], {}, 3),    2, "404"),
        ("sauber",        ([], {}, 3),                     0, "[OK] alle 3"),
        ("messausfall",   ([], {"u3": "Timeout"}, 3),      4, "[KEINE AUSSAGE]"),
        ("leere-sitemap", ([], {}, 0),                     4, "keine einzige URL"),
    ]
    schlecht = 0
    for name, (b, m, n), soll, marker in faelle:
        code, text = urteile(b, m, n)
        ok = code == soll and marker in text
        schlecht += not ok
        print("  [%s] ARM %-16s exit=%d soll=%d marker=%r"
              % ("OK" if ok else "ROT", name, code, soll, marker))
    if schlecht:
        print("SELBSTTEST ROT: %d Arm(e) verhalten sich nicht wie zugesagt" % schlecht)
        return 1
    print("SELBSTTEST GRUEN: alle %d Arme belegt (je am eigenen Marker, nicht "
          "am blossen Exit-Code)" % len(faelle))
    return 0


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--shop", default="dach", choices=sorted(HOST))
    p.add_argument("--jobs", type=int, default=6)
    p.add_argument("--selbsttest", action="store_true")
    a = p.parse_args()

    if a.selbsttest:
        return selbsttest()

    try:
        urls, je_teil = sitemap_urls(a.shop)
    except Exception as e:                                        # noqa: BLE001
        print("[KEINE AUSSAGE] Sitemap nicht erhebbar: %s: %s"
              % (type(e).__name__, str(e)[:120]), file=sys.stderr)
        return 4

    befunde: list[tuple[str, int, str | None]] = []
    messausfaelle: dict[str, str] = {}
    with futures.ThreadPoolExecutor(max_workers=a.jobs) as ex:
        for url, status, ziel, fehler in ex.map(messe, urls):
            if fehler:
                messausfaelle[url] = fehler
            elif status != 200:
                befunde.append((url, status, ziel))

    code, text = urteile(befunde, messausfaelle, len(urls))
    print("Shop %s | Sitemap-URLs %d (%s)"
          % (a.shop, len(urls),
             ", ".join("%s %d" % (k, v) for k, v in sorted(je_teil.items()))))
    print(text)
    return code


if __name__ == "__main__":
    sys.exit(main())
