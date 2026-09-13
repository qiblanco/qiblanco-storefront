#!/usr/bin/env python3
"""Traegt JEDE indexierbare Seite dieses Ladens GENAU EIN og:site_name?

WARUM "GENAU EINS" UND NICHT "MINDESTENS EINS" — das ist der ganze Punkt
dieser Probe und keine Feinheit. Segment s03 des Grossjobs
20260911-…-technische-auffindbarkeit hat den Tag pauschal ueber die
/pages-Klasse nachgesetzt und damit auf /pages/ueber-uns und
/pages/warum-qi-blanco ein DOPPELTES og:site_name erzeugt: beide Routen
setzten ihn bereits selbst. Eine Probe auf "mindestens eins" haette genau
diesen Schaden als Erfolg gebucht. Gemessen wird deshalb die ANZAHL.

KEINE GETIPPTE SEITENLISTE UND KEIN GEPINNTER ZAEHLER.
Der Nenner kommt zur Laufzeit aus seo-manager/bin/seiten_zensus.py — also aus
derselben Codebahn, aus der die Befundzahlen des Grossjobs stammen, und nicht
aus einem Nachbau. Er ist die VEREINIGUNG aus Sitemap und den Routen des
FREIGEGEBENEN Stands (origin/main), weil keine der beiden Mengen die andere
enthaelt: eine reine Hydrogen-Route kommt baulich nie in die Shopify-Sitemap,
und die Sitemap fuehrt Handles ohne eigene Route. Waechst der Laden, waechst
die Probe mit; eine neue Seite ohne den Tag macht sie rot, ohne dass jemand
diese Datei anfassen muss.

INDEXIERBAR heisst hier HTTP 200 UND kein noindex UND nicht weitergeleitet —
und zwar mit dem Urteil von seiten_zensus.messe(), nicht mit einem eigenen
Nachbau desselben Gedankens. Eine Seite, die Google gar nicht in den Index
nimmt, teilt auch niemand; sie ist kein Gegenstand dieser Zusage. Genau daran
ist die uebergebene Fundstellenliste dieses Auftrags gealtert: sie fuehrte
/widerruf/bestaetigen, das inzwischen bewusst noindex traegt.

DER ZWEITE ABRUF IST ABSICHT, NICHT VERSEHEN: seiten_zensus.messe() zaehlt
og:image, aber kein og:site_name, und gibt das HTML nicht heraus. Statt das
fremde Modul umzubauen holt diese Probe die indexierbaren Seiten ein zweites
Mal. Der Preis ist rund ein Abruf je indexierbarer Seite; der Gewinn ist, dass
das INDEXIERBARKEITS-Urteil auf der Hausbahn bleibt. Antwortet der zweite
Abruf nicht mit 200, ist das MESSAUSFALL fuer diese Seite und nie ein Befund —
sonst wuerde ein Netzwackler als fehlender Tag gebucht.

EXIT-CODES
  0  jede indexierbare Seite traegt genau ein og:site_name
  2  BEFUND — mindestens eine Seite traegt keines oder mehrere
  4  MESSAUSFALL — der Nenner oder eine Seite war nicht erhebbar (KEIN Urteil)

ROT-NACHWEIS: `--selbsttest` fuehrt jeden Urteils-Arm einzeln vor (fehlend,
doppelt, sauber, Messausfall) und nennt den Arm, den er belegt.
"""
from __future__ import annotations

import argparse
import re
import sys
import urllib.error
import urllib.request
import concurrent.futures as futures

sys.path.insert(0, "/srv/openclaw/shared-state/seo-manager/bin")

UA = "QiBlancoInternal/og-site-name-probe (+nachbau-audit)"

# Ein <meta property="og:site_name" …>. Bewusst ueber die Tag-Liste und das
# property-Attribut statt ueber einen Teilstring: der blosse Text
# "og:site_name" steht auch in einem Kommentar oder in eingebettetem JSON und
# wuerde dort mitgezaehlt.
_META = re.compile(r"(?is)<meta\b[^>]*>")


def _attr(tag: str, name: str) -> str | None:
    m = (re.search(r'(?is)\b%s\s*=\s*"([^"]*)"' % name, tag)
         or re.search(r"(?is)\b%s\s*=\s*'([^']*)'" % name, tag))
    return m.group(1) if m else None


def zaehle_site_name(html: str) -> int:
    """Wie viele og:site_name-Angaben traegt dieses Dokument?"""
    return sum(1 for t in _META.findall(html)
               if (_attr(t, "property") or "").strip().lower() == "og:site_name")


def urteile(zaehlungen: dict[str, int], messausfaelle: dict[str, str]) -> tuple[int, str]:
    """Der Urteils-Arm, getrennt vom Abruf — damit er ohne Netz vorfuehrbar ist.

    Die Trennung ist der Grund, warum der Rot-Nachweis hier ueberhaupt fuer
    JEDEN Arm fuehrbar ist: den Zustand "zwei Tags live" kann man nicht
    herstellen, ohne genau den Fehler auszurollen, gegen den die Probe gebaut
    ist.
    """
    if messausfaelle:
        zeilen = ["[KEINE AUSSAGE] %d Seite(n) waren nicht messbar — ohne sie "
                  "ist die Menge unvollstaendig und jedes Urteil zu gut:"
                  % len(messausfaelle)]
        zeilen += ["    %-46s %s" % (p, g) for p, g in sorted(messausfaelle.items())]
        return 4, "\n".join(zeilen)

    if not zaehlungen:
        return 4, ("[KEINE AUSSAGE] keine einzige indexierbare Seite erhoben — "
                   "eine leere Menge ist kein bestandenes Kriterium")

    fehlend = sorted(p for p, n in zaehlungen.items() if n == 0)
    doppelt = sorted(p for p, n in zaehlungen.items() if n > 1)
    if fehlend or doppelt:
        zeilen = ["[BEFUND] %d von %d indexierbaren Seiten tragen nicht genau "
                  "ein og:site_name" % (len(fehlend) + len(doppelt), len(zaehlungen))]
        for p in fehlend:
            zeilen.append("    FEHLT    %-46s n=0" % p)
        for p in doppelt:
            zeilen.append("    DOPPELT  %-46s n=%d" % (p, zaehlungen[p]))
        return 2, "\n".join(zeilen)

    return 0, ("[OK] alle %d indexierbaren Seiten tragen genau ein og:site_name"
               % len(zaehlungen))


def hol(url: str, timeout: int = 30) -> str:
    req = urllib.request.Request(
        url, headers={"User-Agent": UA, "Accept-Encoding": "identity"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        if r.status != 200:
            raise urllib.error.HTTPError(url, r.status, "kein 200", r.headers, None)
        return r.read().decode("utf-8", "replace")


def erhebe(shop: str, jobs: int) -> tuple[dict[str, int], dict[str, str], int, str]:
    """(zaehlungen, messausfaelle, nenner_n, anker) — oder wirft RuntimeError."""
    import seiten_zensus as sz
    import storefront_messung as sm

    routen = sz.routen_aus_head(shop)
    if routen is None:
        raise RuntimeError("Routen-Haelfte des Nenners nicht erhebbar (%s)"
                           % sz.freigabe_ref(shop)[1])
    teile = sz.sitemap_pfade(shop)
    if teile is None:
        raise RuntimeError("Sitemap-Haelfte des Nenners nicht erhebbar")
    weitere = sz.weitere_routen_aus_head(shop)
    if weitere is None:
        raise RuntimeError("weitere Routen des Nenners nicht erhebbar")

    sitemap = {p for v in teile.values() for p in v}
    nenner = sorted((routen | sitemap | weitere | sz.policy_pfade(shop)) | {"/"})

    with futures.ThreadPoolExecutor(max_workers=jobs) as ex:
        gemessen = list(ex.map(lambda p: sz.messe(shop, p), nenner))

    indexierbar = [e["pfad"] for e in gemessen
                   if e.get("status") == 200
                   and not e.get("noindex")
                   and not e.get("umgeleitet")]

    zaehlungen: dict[str, int] = {}
    messausfaelle: dict[str, str] = {}

    def eine(pfad: str):
        try:
            return pfad, zaehle_site_name(hol(sm.url(shop, pfad))), None
        except Exception as e:                                    # noqa: BLE001
            return pfad, None, "%s: %s" % (type(e).__name__, str(e)[:80])

    with futures.ThreadPoolExecutor(max_workers=jobs) as ex:
        for pfad, n, fehler in ex.map(eine, indexierbar):
            if fehler:
                messausfaelle[pfad] = fehler
            else:
                zaehlungen[pfad] = n

    return zaehlungen, messausfaelle, len(nenner), sz.freigabe_ref(shop)[1]


def selbsttest() -> int:
    """Jeder Urteils-Arm einzeln, mit dem Marker, der NUR aus ihm kommt."""
    faelle = [
        ("fehlend",     ({"/a": 1, "/b": 0}, {}),        2, "FEHLT    /b"),
        ("doppelt",     ({"/a": 1, "/b": 2}, {}),        2, "DOPPELT  /b"),
        ("sauber",      ({"/a": 1, "/b": 1}, {}),        0, "[OK] alle 2"),
        ("messausfall", ({"/a": 1}, {"/b": "Timeout"}),  4, "[KEINE AUSSAGE]"),
        ("leere-menge", ({}, {}),                        4, "leere Menge"),
    ]
    # Auch die ZAEHLUNG bekommt ihren eigenen Arm: sie ist der Teil, an dem
    # ein Teilstring-Treffer im Kommentar unbemerkt mitzaehlen wuerde.
    html_faelle = [
        ("zaehlung-0", '<meta property="og:title" content="x">', 0),
        ("zaehlung-1", '<meta property="og:site_name" content="Qi Blanco">', 1),
        ("zaehlung-2", '<meta property="og:site_name" content="a">'
                       "<meta property='og:site_name' content='b'>", 2),
        ("zaehlung-kommentar", '<!-- og:site_name steht hier nur als Wort -->', 0),
    ]
    schlecht = 0
    for name, html, soll in html_faelle:
        ist = zaehle_site_name(html)
        ok = ist == soll
        schlecht += not ok
        print("  [%s] ARM %-22s zaehlung=%d soll=%d" % ("OK" if ok else "ROT", name, ist, soll))
    for name, (z, m), soll_exit, marker in faelle:
        code, text = urteile(z, m)
        ok = code == soll_exit and marker in text
        schlecht += not ok
        print("  [%s] ARM %-22s exit=%d soll=%d marker=%r"
              % ("OK" if ok else "ROT", name, code, soll_exit, marker))
    if schlecht:
        print("SELBSTTEST ROT: %d Arm(e) verhalten sich nicht wie zugesagt" % schlecht)
        return 1
    print("SELBSTTEST GRUEN: alle %d Arme belegt (jeder Arm an seinem eigenen "
          "Marker, nicht am blossen Exit-Code)" % (len(faelle) + len(html_faelle)))
    return 0


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--shop", default="dach")
    p.add_argument("--jobs", type=int, default=6)
    p.add_argument("--selbsttest", action="store_true",
                   help="fuehrt jeden Urteils-Arm vor (Rot-Nachweis, ohne Netz)")
    a = p.parse_args()

    if a.selbsttest:
        return selbsttest()

    try:
        zaehlungen, messausfaelle, nenner_n, anker = erhebe(a.shop, a.jobs)
    except Exception as e:                                        # noqa: BLE001
        print("[KEINE AUSSAGE] %s" % e, file=sys.stderr)
        return 4

    code, text = urteile(zaehlungen, messausfaelle)
    print("Shop %s | Nenner %d | indexierbar %d | Routen-Anker %s"
          % (a.shop, nenner_n, len(zaehlungen) + len(messausfaelle), anker))
    print(text)
    return code


if __name__ == "__main__":
    sys.exit(main())
