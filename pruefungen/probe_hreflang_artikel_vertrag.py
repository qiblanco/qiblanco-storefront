#!/usr/bin/env python3
"""Hermetische Vertragsprobe der Artikel-hreflang-Naht -- gegen origin/main.

Job 20260908-BAU-hreflang-gegenrichtung-hydrogen-artikel-metafeld.

WARUM DIESER UMWEG UND NICHT EINFACH `node --test test/...`:
Dieses Repo hat einen GETEILTEN Klon, auf dem viele Jobs zugleich arbeiten.
Beim Bau dieser Probe stand er auf einem 3 Commits alten Stand UND trug fremde
uncommittete Aenderungen an genau der Route, um die es hier geht. Ein
`node --test` von der Platte haette also einen Stand gemessen, den niemand
ausgeliefert hat -- und war im ersten Lauf prompt ROT gegen Code, der live
nachweislich funktioniert (drei korrekte <link>-Elemente, am 2026-09-08 am
Live-Rand gemessen). Eine stehende Wache urteilt nur auf FREIGEGEBENEM
Programmtext, und freigegeben heisst committet, nicht gespeichert.

Gemessen wird deshalb ein Auszug aus origin/main in einem Wegwerf-Verzeichnis.
Das Verzeichnis kommt aus tempfile OHNE Pfadangabe, folgt also TMPDIR und
nicht einem fest getippten /var/tmp.

EXIT-CODES:
  0  Vertrag gehalten (alle Arme gruen)
  1  BEFUND: mindestens ein Arm der Vertragsprobe ist rot
  4  MESSAUSFALL: origin/main nicht lesbar, node fehlt, Auszug leer
     -> KEINE AUSSAGE, nie ein Befund

Laeuft mit cwd=/tmp: alle Pfade absolut.
"""
import io
import os
import shutil
import subprocess
import sys
import tempfile

REPO = ("/srv/openclaw/shared-state/homepage-bauer/werkbank/"
        "qiblanco-storefront")
REF = "origin/main"
TEST = "test/hreflang-artikel.test.mjs"
# app/lib komplett, weil hreflang.js sein shop-switch.js importiert und dieses
# wiederum weitere Nachbarn -- eine Auswahl waere eine Wette auf die
# Importkette von heute.
AUSZUG = ["app/lib", TEST]


def main():
    if shutil.which("node") is None:
        print("[MESSAUSFALL] node ist nicht auf dem PATH.")
        return 4
    if not os.path.isdir(os.path.join(REPO, ".git")) and not os.path.exists(
            os.path.join(REPO, ".git")):
        print("[MESSAUSFALL] kein git-Repo unter %s" % REPO)
        return 4

    tmp = tempfile.mkdtemp(prefix="hreflang-vertrag-")
    try:
        # `git -C REPO archive REF ...`: liest die REF, nicht den Arbeitsbaum.
        # Das cwd des Aufrufers spielt dabei keine Rolle -- anders als bei
        # einem `git archive HEAD`, das im Zielverzeichnis ausgefuehrt wird.
        try:
            arch = subprocess.run(
                ["git", "-C", REPO, "archive", REF] + AUSZUG,
                capture_output=True, timeout=120)
        except (OSError, subprocess.SubprocessError) as e:
            print("[MESSAUSFALL] git archive nicht ausfuehrbar: %s" % e)
            return 4
        if arch.returncode != 0:
            print("[MESSAUSFALL] git archive %s scheiterte: %s"
                  % (REF, arch.stderr.decode("utf-8", "replace")[:300]))
            return 4
        if not arch.stdout:
            print("[MESSAUSFALL] git archive lieferte einen LEEREN Auszug -- "
                  "ein leeres Archiv sieht aus wie ein bestandener Lauf.")
            return 4
        # ENTPACKT MIT tarfile UND NICHT MIT DEM tar-KOMMANDO, und das ist
        # gemessen und nicht Geschmack: auf dem Volume, auf das TMPDIR hier
        # zeigt, scheitert `tar -x` mit "Cannot mkdir: Function not
        # implemented" -- es versucht Eigentuemer/Rechte mitzusetzen, was der
        # Mount nicht kann. Die Probe meldete daraufhin korrekt MESSAUSFALL
        # statt eines Befunds, war aber baulich nie gruen zu bekommen.
        # tarfile schreibt nur Inhalte und laeuft dort.
        try:
            import tarfile
            with tarfile.open(fileobj=io.BytesIO(arch.stdout), mode="r|") as t:
                for m in t:
                    if m.isdir():
                        os.makedirs(os.path.join(tmp, m.name), exist_ok=True)
                        continue
                    if not m.isfile():
                        continue
                    ziel = os.path.join(tmp, m.name)
                    os.makedirs(os.path.dirname(ziel), exist_ok=True)
                    q = t.extractfile(m)
                    if q is None:
                        continue
                    with open(ziel, "wb") as f:
                        f.write(q.read())
        except (OSError, tarfile.TarError) as e:
            print("[MESSAUSFALL] Auszug nicht entpackbar: %s" % e)
            return 4

        pfad = os.path.join(tmp, TEST)
        if not os.path.exists(pfad):
            print("[MESSAUSFALL] %s liegt nicht in %s -- die Probe hat ihren "
                  "Gegenstand verloren (umbenannt? entfernt?). Das ist keine "
                  "Widerlegung." % (TEST, REF))
            return 4

        r = subprocess.run(["node", "--test", pfad],
                           capture_output=True, timeout=180, cwd=tmp)
        aus = (r.stdout + r.stderr).decode("utf-8", "replace")
        for zeile in aus.splitlines():
            if zeile.startswith(("ℹ pass", "ℹ fail", "✔", "✖", "  ARM-")):
                print("  " + zeile)
        if r.returncode == 0:
            print("[OK] Artikel-hreflang-Vertrag gehalten (Stand %s)." % REF)
            return 0
        print("[BEFUND] Die Vertragsprobe ist rot (Stand %s). Der ARM-Marker "
              "oben nennt den gebrochenen Arm -- ein Exit-Code allein "
              "unterscheidet Geschwisterarme nicht." % REF)
        return 1
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    sys.exit(main())
