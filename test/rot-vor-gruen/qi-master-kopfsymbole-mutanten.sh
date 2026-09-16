#!/usr/bin/env bash
# ROT-VOR-GRUEN fuer test/qi-master-kopfsymbole.test.mjs -- Mutationsmatrix.
#
# WARUM EINE MATRIX UND NICHT EIN EINZIGER ROT-LAUF: der Test hat neun Arme, und
# mehrere teilen sich denselben Exit-Code. Ein Rot-Nachweis am billigsten Arm
# zertifiziert die anderen nicht (Hausregel: „wer einen Rot-Nachweis fuehrt, nennt
# den ARM"). Gegen den Vor-Bau-Stand waere der Test ausserdem nur mit
# ERR_MODULE_NOT_FOUND gefallen -- das ist ein MESSAUSFALL und kein Befund.
#
# Je Mutant: genau EIN Eingriff, hermetisch in einem Wegwerf-Baum, dazu
#   * POSITIVKONTROLLE: der Eingriff hat wirklich Zeilen bewegt (sonst Messausfall)
#   * der ERWARTETE Arm faellt, erkannt an seinem eigenen Text -- nicht am Exit
#   * KEIN Modul-Ladefehler (sonst misst der Lauf die Abwesenheit, nicht den Defekt)
#
# Exit 0 = jeder Mutant hat genau seinen Arm geroetet · 1 = mindestens einer nicht
#        · 4 = Messausfall (kein node, Quelle fehlt)
set -u
QUELLE="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
command -v node >/dev/null 2>&1 || { echo "MESSAUSFALL: node fehlt"; exit 4; }
[ -f "$QUELLE/test/qi-master-kopfsymbole.test.mjs" ] || { echo "MESSAUSFALL: Test fehlt"; exit 4; }

DATEIEN=(
  app/lib/qi-master-kopfsymbole.js
  app/lib/qi-master-symbole.generated.js
  app/components/product-pages/QiMaster.jsx
  bin/qimaster-symbole-gen.mjs
  test/qi-master-kopfsymbole.test.mjs
)
FEHLER=0

baum() { # baum <ziel> -- minimaler, hermetischer Baum (kein node_modules noetig)
  local z="$1"
  for f in "${DATEIEN[@]}"; do mkdir -p "$z/$(dirname "$f")"; cp "$QUELLE/$f" "$z/$f"; done
  mkdir -p "$z/app/assets/qi-master-symbole"
  cp "$QUELLE"/app/assets/qi-master-symbole/*.svg "$z/app/assets/qi-master-symbole/"
}

mutant() { # mutant <name> <erwarteter Arm-Text> <sed-artiger Eingriff als Funktion>
  local name="$1" arm="$2" eingriff="$3"
  local z; z=$(mktemp -d "${TMPDIR:-/tmp}/kopfsymbole-mut.XXXXXX") || { echo "MESSAUSFALL: kein Scratch"; exit 4; }
  baum "$z"
  local vor; vor=$(find "$z" -type f -exec sha256sum {} + | sort -k2 | sha256sum)
  ( cd "$z" && $eingriff )
  local nach; nach=$(find "$z" -type f -exec sha256sum {} + | sort -k2 | sha256sum)
  if [ "$vor" = "$nach" ]; then
    echo "  [MESSAUSFALL] $name: der Eingriff hat NICHTS bewegt -- kein Befund, sondern eine defekte Mutation"
    FEHLER=1; rm -rf "$z"; return
  fi
  local aus rc
  aus=$(cd "$z" && node --test test/qi-master-kopfsymbole.test.mjs 2>&1); rc=$?
  if printf '%s' "$aus" | grep -q "ERR_MODULE_NOT_FOUND\|Cannot find module"; then
    echo "  [MESSAUSFALL] $name: Modul-Ladefehler -- der Lauf misst die Abwesenheit, nicht den Defekt"
    FEHLER=1; rm -rf "$z"; return
  fi
  if [ "$rc" -eq 0 ]; then
    echo "  [ROT FEHLT]   $name: der Test bleibt gruen, obwohl dieser Arm gebrochen ist: $arm"
    FEHLER=1; rm -rf "$z"; return
  fi
  if printf '%s' "$aus" | grep -qF "✖ $arm"; then
    echo "  [ok] $name -> genau der Arm faellt: $arm"
  else
    echo "  [FALSCHER ARM] $name: der Test faellt, aber nicht an: $arm -- gefallen sind:"
    printf '%s\n' "$aus" | grep '^✖' | sed 's/^/        /'
    FEHLER=1
  fi
  rm -rf "$z"
}

# --- die Eingriffe, je genau einer ----------------------------------------------
m_strichzeichnung() { # genau die Machart, die der AUFTRAGSTEXT verlangt
  printf '%s\n' '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h20"/></svg>' > app/assets/qi-master-symbole/one-eye.svg
}
m_feste_farbe() { sed -i 's/fill="currentColor"/fill="#f2bf72"/' app/assets/qi-master-symbole/alpha-charge.svg; }
m_generiert_driftet() { sed -i "s/'one-eye': 'M12 5/'one-eye': 'M12 6/" app/lib/qi-master-symbole.generated.js; }
m_regel_unscharf() { sed -i 's|{erkennung: /diamant/i|{erkennung: /gitterchip/i|' app/lib/qi-master-kopfsymbole.js; }
m_zeile_fehlt() { sed -i "s|{erkennung: /alpha\\\\s\\*charge/i, symbol: 'alpha-charge'},||" app/lib/qi-master-kopfsymbole.js; }
m_doppelt() { sed -i 's|if (/<svg\\b/i.test(inhalt)) return ganz;||' app/lib/qi-master-kopfsymbole.js; }
m_vorlage_strich() { # die VORLAGE wird zur Strichzeichnung -> Positivkontrolle muss fallen
  python3 - <<'PY'
import re
p='app/components/product-pages/QiMaster.jsx'
s=open(p,encoding='utf-8').read()
ab=s.index('function Fertigung(')
kopf,rest=s[:ab],s[ab:]
rest=rest.replace('<path fill="currentColor"','<path fill="none" stroke="currentColor" stroke-width="2"')
open(p,'w',encoding='utf-8').write(kopf+rest)
PY
}
m_sechste_vorn() { sed -i '0,/{zusatzPunkt}/{s/{zusatzPunkt}/{zusatzPunkt}PLATZ/}' app/components/product-pages/QiMaster.jsx
  python3 - <<'PY'
p='app/components/product-pages/QiMaster.jsx'
s=open(p,encoding='utf-8').read()
import re
m=re.search(r'\n(\s*)<li>\n\s*<svg[^>]*>\n\s*<path fill="currentColor" d=\{QIMASTER_SYMBOL_PFADE\[.finanzierung-null.\]\} />\n\s*</svg>\n\s*<b>0% Finanzierung</b> mit PayPal und Klarna\n\s*</li>', s)
block=m.group(0)
s=s.replace(block,'\n')
s=s.replace('{zusatzPunkt}PLATZ', block.strip()+'\n        {zusatzPunkt}')
open(p,'w',encoding='utf-8').write(s)
PY
}

echo "ROT-VOR-GRUEN: Mutationsmatrix zu test/qi-master-kopfsymbole.test.mjs"
mutant "strichzeichnung-statt-flaeche" "jede Symbol-Datei haelt die Machart der Vorlage" m_strichzeichnung
mutant "feste-farbe-im-symbol"         "jede Symbol-Datei haelt die Machart der Vorlage" m_feste_farbe
mutant "generierte-datei-driftet"      "die generierte Datei stimmt mit den SVG-Dateien ueberein" m_generiert_driftet
mutant "regel-nicht-trennscharf"       "TRENNSCHAERFE: keine Regel greift die Zeile einer anderen" m_regel_unscharf
mutant "eine-zeile-ohne-symbol"        "die vier Zeilen des Kopfblocks haben je ein eigenes Symbol" m_zeile_fehlt
mutant "doppelschutz-entfernt"         "FAIL-SOFT: fremdes HTML bleibt unveraendert, und ein zweiter Lauf verdoppelt nichts" m_doppelt
mutant "vorlage-wird-strichzeichnung"  "POSITIVKONTROLLE: der Massstab erkennt die Symbole der Vorlage als stilkonform" m_vorlage_strich
mutant "sechste-zeile-vor-gewaehrleistung" "die sechste Zeile der Nutzenliste steht zuletzt und ist wie ihre Nachbarn gesetzt" m_sechste_vorn

if [ "$FEHLER" -eq 0 ]; then echo "ROT-VOR-GRUEN vollstaendig: jeder Arm einzeln belegt"; else echo "ROT-VOR-GRUEN UNVOLLSTAENDIG"; fi
exit "$FEHLER"
