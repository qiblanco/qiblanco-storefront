# -*- coding: utf-8 -*-
"""paritaet_runner.py — Python-Seite des T2-Paritaets-Tests.

Liest Vektoren als JSON von stdin, rechnet sie durch die Python-SSoT
(shared-state/sicherheitsmeister/src, ueberschreibbar via SM_SRC) und
schreibt die Ergebnisse als JSON nach stdout. Der Vergleich passiert in
scripts/abwehr/paritaet.mjs (JS-Seite).

Laeuft NUR auf dem Qi-Blanco-Server (braucht das T1-Modul) — in fremden
Umgebungen bricht paritaet.mjs mit exit 2 (SKIP, nicht gruen) ab.
"""
import json
import os
import sys

SM_SRC = os.environ.get(
    "SM_SRC", "/srv/openclaw/shared-state/sicherheitsmeister/src")
sys.path.insert(0, SM_SRC)

import eskalation  # noqa: E402
import kundenpfad  # noqa: E402
import kundenpfad_signale  # noqa: E402
import scoring  # noqa: E402
import signals  # noqa: E402


def _safe(fn):
    try:
        return fn()
    except ValueError:
        return {"wirft": True}


def _deckel(v):
    """`explizit` unterscheidet 'max_stufe weggelassen' von 'max_stufe=None'.

    Weglassen zieht den Standard-Deckel des Verdikts, ein explizites None
    schaltet den Deckel ab — ueber JSON waeren beide sonst dasselbe `null`.
    """
    if v.get("explizit"):
        return kundenpfad.deckel_score(v["score"], v["lane"], v.get("max_stufe"))
    return kundenpfad.deckel_score(v["score"], v["lane"])


def main():
    vek = json.load(sys.stdin)
    out = {}

    out["scoring"] = [
        _safe(lambda v=v: {"score": scoring.score(v)}) for v in vek["scoring"]
    ]
    out["eskalation"] = [
        _safe(lambda v=v: {"aktion": eskalation.aktion(
            v["score"], v.get("pfad", ""), v.get("verlauf"))})
        for v in vek["eskalation"]
    ]
    out["hysterese"] = [
        _safe(lambda v=v: {"stufe": eskalation.stufe_mit_hysterese(v)})
        for v in vek["hysterese"]
    ]
    out["anwenden"] = [
        _safe(lambda v=v: {"wirkung": eskalation.anwenden(
            eskalation.aktion(v["score"]), v["mode"])})
        for v in vek["anwenden"]
    ]
    out["header"] = [
        _safe(lambda v=v: signals.header_signale(v)) for v in vek["header"]
    ]
    out["pfad"] = [
        _safe(lambda v=v: signals.pfad_signale(
            v.get("pfad", ""), v.get("query", "")))
        for v in vek["pfad"]
    ]
    out["lane_entscheide"] = [
        _safe(lambda v=v: kundenpfad.entscheide(v)) for v in vek["lane_entscheide"]
    ]
    out["lane_deckel"] = [
        _safe(lambda v=v: {"score": _deckel(v)}) for v in vek["lane_deckel"]
    ]
    out["lane_bewerte"] = [
        _safe(lambda v=v: kundenpfad.bewerte(
            v["score"], v["signale"], v.get("caps")))
        for v in vek["lane_bewerte"]
    ]
    out["lane_signale"] = [
        _safe(lambda v=v: kundenpfad_signale.aus_verlauf(
            [tuple(a) if isinstance(a, list) else a for a in v["abrufe"]],
            v.get("katalog_groesse", 60),
            v.get("netz_klasse", "unbestimmt"),
            v.get("evasion", False)))
        for v in vek["lane_signale"]
    ]

    # Drift-Anker: echte Version aus der YAML-SSoT — muss WAF_RULES_VERSION
    # (JS-Spiegel) entsprechen, sonst ist der JS-Port veraltet.
    import yaml
    with open(os.path.join(SM_SRC, "waf_rules.yaml"), encoding="utf-8") as f:
        out["waf_version"] = (yaml.safe_load(f) or {}).get("version")

    json.dump(out, sys.stdout, sort_keys=True)


if __name__ == "__main__":
    main()
