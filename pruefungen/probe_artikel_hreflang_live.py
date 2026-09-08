#!/usr/bin/env python3
"""Live-Wache ueber die hreflang-Naht der DACH-BLOGARTIKEL (qiblanco.com).

Job 20260908-BAU-hreflang-gegenrichtung-hydrogen-artikel-metafeld.

WAS SIE MISST -- UND WARUM GENAU DAS
------------------------------------
hreflang wirkt ausschliesslich REZIPROK. Nennt Seite A die Seite B als ihre
englische Fassung und B nicht A zurueck, verwirft Google die Auszeichnung
KOMPLETT statt der Haelfte zu glauben. Eine halbe Gruppe ist deshalb nicht
"halb so gut", sondern wirkungslos -- und eine FALSCHE Gruppe ist schlechter
als gar keine.

Die teure Fehlerklasse dieses Baus ist deshalb NICHT "es fehlt etwas", sondern
"es steht etwas Falsches da": ein Rueckfall auf '/' oder ein geratener Pfad
haette auf JEDEM noch nicht zugeordneten Artikel die Aussage erzeugt "die
englische Fassung dieses Artikels ist die Startseite". Das faellt niemandem
auf, weil die Seite dabei voellig normal aussieht.

DER VERTRAG, den diese Wache haelt, ist deshalb eine KARDINALITAET und keine
Anwesenheit (Lehre seo-manager 2026-08-15: ">= 1" haette eine Doppelausgabe
nie gesehen):

  Eine Artikelseite traegt ENTWEDER GENAU 0 ODER GENAU 3 hreflang-Links.
  Nie 1, nie 2, nie 4.
  Traegt sie 3, dann gilt zusaetzlich:
      - genau die Sprachen en, de, x-default
      - en und x-default zeigen auf DIESELBE Adresse (Gruppen-Konsistenz)
      - en/x-default liegen auf qi-blanco.com, de auf qiblanco.com
      - de zeigt auf die Seite SELBST (Selbstreferenz -- eine hreflang-Gruppe
        nennt alle Fassungen einschliesslich der eigenen)
      - keine der drei Adressen ist die blosse Startseite (genau der
        Rueckfall, den es nicht geben darf)

WARUM DIESER VERTRAG HEUTE SCHON MESSBAR IST, OBWOHL DIE WIRKUNG NOCH FEHLT:
Es gibt heute NULL veroeffentlichte englische Artikel -- der US-Shop fuehrt
ueberhaupt keinen Blog (gemessen 2026-09-08). Kein DACH-Artikel traegt also
custom.hreflang_en, und der erwartete Zustand ist "0 Links auf allen". Das ist
KEINE leere Menge und kein Vakuum-Gruen: die Artikelseiten existieren, werden
abgerufen, und genau auf ihnen wuerde ein Rueckfall sichtbar. Nach dem Go-Live
der englischen Fassungen kippen einzelne Seiten von 0 auf 3, und derselbe
Vertrag misst dann die richtige Form -- die Wache waechst mit, ohne dass
jemand Code anfasst.

HARNISCH-POSITIV-KONTROLLE (sonst waere ein 0-Befund nicht von einem kaputten
Messgeraet zu unterscheiden): die STARTSEITE muss GENAU 3 hreflang-Links
tragen -- die Seiten-Naht aus app/root.jsx, die seit 2026-09-04 live ist.
Findet die Probe dort nicht 3, misst sie nicht den Gegenstand, sondern sich
selbst (Netz weg, Markup geaendert, Redirect) -> MESSAUSFALL, nie ein Befund.

WARUM ECHTES HTTP UND KEIN file://: eine Rot-Probe ueber file:// misst nur den
Fehlerpfad -- vier verschiedene Defektklassen geben dort viermal dasselbe
"keine Aussage" und sehen wie ein bestandener Lauf aus (Hauslehre 2026).

EXIT-CODES (maschinell gelesen, siehe registry.d):
  0  Vertrag gehalten
  1  BEFUND: mindestens eine Artikelseite verletzt die Kardinalitaet/Form
  4  MESSAUSFALL: Positiv-Kontrolle gescheitert oder Seiten nicht abrufbar
     -> KEINE AUSSAGE, niemals ein Befund (ein Netzausfall darf keinen
        Reparaturjob gegen gesunden Code ausloesen)

Laeuft mit cwd=/tmp: keine relativen Pfade, keine Repo-Annahmen.
"""
import re
import sys
import urllib.error
import urllib.request

DACH = "https://qiblanco.com"
US = "https://qi-blanco.com"
BLOG = "/blogs/wissen"
TIMEOUT = 25

# <link rel="alternate" hreflang="xx" href="...">  -- Attributreihenfolge ist
# nicht garantiert, deshalb wird das Tag als Ganzes gefasst und danach
# attributweise gelesen.
LINK_RX = re.compile(r"<link\b[^>]*\brel=[\"']alternate[\"'][^>]*>", re.I)
ATTR_RX = re.compile(r"\b(hreflang|href)=[\"']([^\"']*)[\"']", re.I)


def hole(url):
    req = urllib.request.Request(
        url, headers={"User-Agent": "qb-hreflang-artikel-probe/1.0"})
    with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
        return r.geturl(), r.read().decode("utf-8", "replace")


def hreflang_paare(html):
    """[(sprache, adresse), ...] in Dokumentreihenfolge."""
    raus = []
    for tag in LINK_RX.findall(html):
        attrs = {k.lower(): v for k, v in ATTR_RX.findall(tag)}
        if "hreflang" in attrs:
            raus.append((attrs["hreflang"].strip(), attrs.get("href", "").strip()))
    return raus


def artikel_pfade():
    """Die Artikel, die der Blog HEUTE wirklich fuehrt.

    Aus der Uebersichtsseite gelesen und NICHT als Liste im Code gepinnt: eine
    gepinnte Liste erreicht den achten Artikel nie, und der Takt steht auf
    zwei je Woche. Findet sie keinen, ist das ein Messausfall und kein Gruen
    ueber der leeren Menge.
    """
    _, html = hole(DACH + BLOG)
    pfade = sorted(set(
        "%s/%s" % (BLOG, h)
        for h in re.findall(r'href="%s/([A-Za-z0-9][A-Za-z0-9\-_]*)"' % BLOG, html)))
    return pfade


def main():
    befunde = []

    # ---- HARNISCH-POSITIV-KONTROLLE ------------------------------------
    try:
        _, start = hole(DACH + "/")
    except (urllib.error.URLError, OSError) as e:
        print("[MESSAUSFALL] Startseite nicht abrufbar: %s" % e)
        return 4
    kontrolle = hreflang_paare(start)
    if len(kontrolle) != 3:
        print("[MESSAUSFALL] Positiv-Kontrolle: die Startseite traegt %d statt 3 "
              "hreflang-Links. Das Messgeraet misst nicht den Gegenstand "
              "(Markup geaendert, Redirect, Netz) -- KEINE AUSSAGE."
              % len(kontrolle))
        return 4
    print("[OK] Positiv-Kontrolle: Startseite traegt 3 hreflang-Links "
          "(%s)" % ", ".join(s for s, _ in kontrolle))

    # ---- die Grundmenge ------------------------------------------------
    try:
        pfade = artikel_pfade()
    except (urllib.error.URLError, OSError) as e:
        print("[MESSAUSFALL] Blog-Uebersicht nicht abrufbar: %s" % e)
        return 4
    if not pfade:
        print("[MESSAUSFALL] Die Blog-Uebersicht nennt 0 Artikel. Ein Gruen "
              "ueber der leeren Menge waere keine Aussage.")
        return 4
    print("[OK] Grundmenge: %d Artikel aus der Uebersicht gelesen" % len(pfade))

    # ---- der Vertrag ---------------------------------------------------
    mit, ohne = 0, 0
    for pfad in pfade:
        url = DACH + pfad
        try:
            _, html = hole(url)
        except (urllib.error.URLError, OSError) as e:
            print("[MESSAUSFALL] %s nicht abrufbar: %s" % (pfad, e))
            return 4
        paare = hreflang_paare(html)

        if len(paare) == 0:
            ohne += 1
            continue
        if len(paare) != 3:
            befunde.append(
                "%s traegt %d hreflang-Links (%s) -- erlaubt sind GENAU 0 oder "
                "GENAU 3. Eine halbe Gruppe wird von Google komplett verworfen."
                % (pfad, len(paare), ", ".join(s for s, _ in paare)))
            continue

        mit += 1
        sprachen = [s for s, _ in paare]
        adressen = dict(paare)
        if sprachen != ["en", "de", "x-default"]:
            befunde.append(
                "%s: Sprachen/Reihenfolge %s statt ['en', 'de', 'x-default'] -- "
                "die Gruppe muss die Form der US-Seite spiegeln."
                % (pfad, sprachen))
            continue
        if adressen["en"] != adressen["x-default"]:
            befunde.append(
                "%s: x-default (%s) weicht von en (%s) ab. Eine abweichende "
                "Angabe INNERHALB einer Gruppe ist ein Widerspruch und damit "
                "schlechter als gar keine."
                % (pfad, adressen["x-default"], adressen["en"]))
        if not adressen["en"].startswith(US + "/"):
            befunde.append("%s: en zeigt auf %r statt auf %s"
                           % (pfad, adressen["en"], US))
        if adressen["de"] != url:
            befunde.append(
                "%s: de zeigt auf %r statt auf die Seite selbst (%s). Eine "
                "hreflang-Gruppe nennt alle Fassungen einschliesslich der "
                "eigenen." % (pfad, adressen["de"], url))
        for sprache, adresse in paare:
            if adresse.rstrip("/") in (DACH, US):
                befunde.append(
                    "%s: %s zeigt auf die blosse STARTSEITE (%r) -- genau der "
                    "Rueckfall, den es nicht geben darf. Als hreflang gelesen "
                    "heisst das 'die andere Fassung dieses Artikels ist die "
                    "Startseite'." % (pfad, sprache, adresse))

    print("[OK] %d Artikel geprueft: %d mit Gruppe, %d ohne"
          % (len(pfade), mit, ohne))

    if befunde:
        print("\n[BEFUND] %d Verletzung(en) des hreflang-Vertrags:" % len(befunde))
        for b in befunde:
            print("  - " + b)
        return 1
    print("[OK] hreflang-Vertrag der Artikelseiten gehalten "
          "(jede Seite genau 0 oder genau 3, Form korrekt).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
