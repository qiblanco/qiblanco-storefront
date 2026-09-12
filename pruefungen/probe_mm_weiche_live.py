#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""probe_mm_weiche_live -- Kommt der bezahlte Klick einer zugeordneten Anzeige am
LIVE-Storefront wirklich auf IHRER eigenen Landingpage an?

WARUM DIESE PROBE UEBERHAUPT: die Message-Match-Zuordnung (Grossjob
20260911-...-tracking-landingpage-hypothesen s04) ist hermetisch in
test/ad-weiche-mm.test.mjs bewiesen. Das belegt den CODE, nicht den BETRIEB --
und zwischen beiden liegen ein Deploy, ein Cloudflare-Cache (~5 min) und ein
Schalter in zuteilung.json, der an einer ganz anderen Stelle gepflegt wird.
Gemessen wird deshalb am aeusseren Rand: was antwortet qiblanco.com einem
echten Ad-Klick?

GEMESSEN WIRD DIE WIRKUNG, NICHT DER SCHALTER. Ein Kriterium wie "Flag steht
auf an" waere Prozess; hier zaehlt, wo der Mensch nach dem Klick landet.

DREI ARME, je mit eigenem Marker (Hausregel: wer einen Rot-Nachweis fuehrt,
nennt den Arm -- ein Exit-Code allein unterscheidet Geschwisterarme nicht):

  ARM-MM-ARM       Mit ?lp_mm=an landet der Klick der Anzeige B3-Hook1 auf
                   /pages/haelt-das-mein-leben-aus — der Seite, die ihr
                   Versprechen "Haelt das meinen Alltag aus?" woertlich
                   aufnimmt — statt auf LP A. Das ist die Wirkung dieses Baus.
  ARM-KONTROLLARM  Mit ?lp_mm=aus geht derselbe Klick weiterhin auf LP A.
                   Ohne diesen Arm waere nicht belegt, dass der Kontrollarm
                   des Experiments ueberhaupt noch existiert -- ein Split mit
                   nur einem Arm misst nichts, und Christians Dekret vom
                   2026-07-24 waere still ersetzt statt getestet.
  ARM-UNBETEILIGT  Eine NICHT zugeordnete Anzeige (TOF-A) geht unveraendert
                   auf LP A. Faengt eine Karte, die zu breit greift.

WARUM MIT PIN UND NICHT MIT 20 ZUFALLSANFRAGEN: eine Zufallsmessung braucht
viele Aufrufe, und jeder davon traegt utm_medium=paid. Auch ohne JavaScript
faelscht eine solche Serie Zaehler, die auf den Server-Logs sitzen, und sie
verwaessert genau die Vorher-Nachher-Messung, die dieser Bau ermoeglichen
soll (Segment s07). Der Pin ist dafuer gebaut (Muster lp_ab=a|b in
lp-ab-v2.server.js) und macht beide Arme mit je EINER Anfrage deterministisch
pruefbar.
KEIN JAVASCRIPT, KEINE COOKIES: gemessen wird allein der 302/200 der
Dokument-Antwort. Das Pixel feuert erst im Browser, diese Probe erzeugt also
keinen Eintrag in events.db und verschmutzt die Messung nicht.

Exit: 0 alles gehalten | 1 BEFUND | 4 MESSAUSFALL (nie als Freispruch lesen).
Die legitimen Ursachen der eigenen Stille sind einzeln benannt und werden
vollstaendig aufgezaehlt: Netz/DNS nicht erreichbar, HTTP-Status ausserhalb
{200,301,302,303,307,308}, Zeitueberschreitung. Ein dauerhaft anliegender
Zustand ist dabei NIE ein Freispruch -- er faellt auf 4, nicht auf 0.
"""
import os
import sys
import urllib.error
import urllib.request

BASIS = os.environ.get("MM_PROBE_BASIS", "https://qiblanco.com")
TIMEOUT = 20

LP_A = "/pages/schlaf-zellen-schutz"

# Echte, aktive Anzeigen. Quelle: ads_steuerung.db ad_content, status='active'.
AD_B3 = "120251810451900704"     # DE | B3 | Alltagsdemo-Hook1-Wasser -> zugeordnet
AD_TOFA = "120250590409220704"   # DE | TOF-A | Frequency-Hook-3      -> bewusst NICHT zugeordnet
ZIEL_B3 = "/pages/haelt-das-mein-leben-aus"

# Das echte Meta-URL-Template (utm_medium=paid ist der Paid-Marker der Weiche).
def klick_url(pfad, ad_id, pin):
    q = ("utm_source=facebook&utm_medium=paid"
         "&utm_campaign=120250590399490704&utm_content=%s&fbclid=IwARprobe" % ad_id)
    if pin:
        q += "&lp_mm=%s" % pin
    return "%s%s?%s" % (BASIS, pfad, q)


class KeineWeiterleitung(urllib.request.HTTPRedirectHandler):
    """Wir wollen die ERSTE Antwort sehen, nicht ihr Ende."""

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


OEFFNER = urllib.request.build_opener(KeineWeiterleitung)
OK_STATUS = {200, 301, 302, 303, 307, 308}

befunde = []
messausfaelle = []


def hole(url):
    """Liefert (status, location) oder wirft RuntimeError als Messausfall."""
    req = urllib.request.Request(url, headers={"User-Agent": "qb-mm-probe/1.0"})
    try:
        with OEFFNER.open(req, timeout=TIMEOUT) as res:
            return res.status, res.headers.get("Location")
    except urllib.error.HTTPError as e:
        if e.code in OK_STATUS:
            return e.code, e.headers.get("Location")
        raise RuntimeError("HTTP %s" % e.code)
    except Exception as e:                      # Netz, DNS, Timeout, TLS
        raise RuntimeError("%s: %s" % (type(e).__name__, e))


MAX_HOPS = 5


def landepfad(url):
    """Wo landet dieser Klick WIRKLICH? Der Weiche folgt seit dem 2026-09-05 ein
    zweiter Sprung: der ad-scharfe Rabattcode schiebt den Klick ueber
    /discount/<CODE>?redirect=<ziel> (303). Wer nur den ERSTEN Sprung misst,
    sieht /discount/... und haelt das fuer die Landeflaeche -- gemessen
    2026-09-12, erste Fassung dieser Probe fiel genau darauf herein.
    Gemessen wird deshalb der Pfad, auf dem die Kette zur Ruhe kommt.
    Der Deckel MAX_HOPS ist zugleich der Schleifen-Waechter: eine Weiche, die
    sich im Kreis dreht, ist ein BEFUND und darf die Probe nicht haengen lassen."""
    gesehen = []
    for _ in range(MAX_HOPS):
        status, loc = hole(url)
        gesehen.append(url.split("?", 1)[0].replace(BASIS, "", 1) or "/")
        if status == 200:
            return gesehen[-1]
        if not loc:
            raise RuntimeError("Status %s ohne Location" % status)
        url = loc if loc.startswith("http") else BASIS + loc
    raise RuntimeError("mehr als %d Spruenge, Kette kommt nicht zur Ruhe: %s"
                       % (MAX_HOPS, " -> ".join(gesehen)))


def arm(name, url, erwartet, warum):
    try:
        ist = landepfad(url)
    except RuntimeError as e:
        messausfaelle.append("%s: %s nicht messbar (%s). Keine Aussage." % (name, url, e))
        return
    if ist != erwartet:
        befunde.append("%s: Klick landete auf %s, erwartet %s. %s\n    URL: %s"
                       % (name, ist, erwartet, warum, url))
    else:
        print("[ok] %-16s %s -> %s" % (name, url.split("?", 1)[0], ist))


def main():
    arm("ARM-MM-ARM", klick_url("/", AD_B3, "an"), ZIEL_B3,
        "Die Anzeige B3-Hook1 verspricht Alltagstauglichkeit; genau diese Seite "
        "nimmt das Versprechen auf (frisch gemessener Design-Score 82).")
    arm("ARM-KONTROLLARM", klick_url("/", AD_B3, "aus"), LP_A,
        "Der Kontrollarm des Splits muss leben, sonst ist das Dekret vom "
        "2026-07-24 still ersetzt statt getestet.")
    arm("ARM-UNBETEILIGT", klick_url("/", AD_TOFA, "an"), LP_A,
        "TOF-A steht bewusst in keiner Karte; greift die Zuordnung hier, ist sie zu breit.")

    print("== probe_mm_weiche_live (%s) ==" % BASIS)
    for m in messausfaelle:
        print("MESSAUSFALL -- " + m)
    for b in befunde:
        print("BEFUND -- " + b)
    if messausfaelle:
        print("---\nERGEBNIS: KEINE AUSSAGE (%d Messausfall) -- nicht als gruen lesen."
              % len(messausfaelle))
        return 4
    if befunde:
        print("---\nERGEBNIS: BEFUND (%d)" % len(befunde))
        return 1
    print("---\nERGEBNIS: OK -- die zugeordnete Anzeige erreicht ihre eigene "
          "Landingpage, der LP-A-Kontrollarm lebt, die unbeteiligte Anzeige ist "
          "unberuehrt.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
