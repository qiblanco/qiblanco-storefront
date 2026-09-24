#!/usr/bin/env bash
# Rot-vor-Gruen fuer test/partnercode.test.mjs: jede Mutante an einer KOPIE
# muss die Suite roeten, das Original muss gruen sein. Aufruf aus der Repo-Wurzel.
# Exit 0 = alle Mutanten rot + Original gruen · 1 = eine Mutante blieb gruen · 4 = Messausfall
set -u
WURZEL=$(pwd)
[ -f "$WURZEL/app/lib/partnercode.server.js" ] || { echo "MESSAUSFALL: nicht in der Repo-Wurzel"; exit 4; }
lauf() { # $1 name, $2 datei, $3 python-ersetzung alt, $4 neu
  local d; d=$(mktemp -d)
  mkdir -p "$d/app/lib" "$d/bin" "$d/test"
  cp "$WURZEL"/app/lib/partnercode.server.js "$WURZEL"/app/lib/partnercode-daten.server.js "$d/app/lib/"
  cp "$WURZEL"/app/entry.server.jsx "$d/app/"
  cp "$WURZEL"/bin/partnercode-gen.mjs "$d/bin/"
  cp "$WURZEL"/test/partnercode.test.mjs "$d/test/"
  if [ -n "$2" ]; then
    python3 - "$d/$2" "$3" "$4" <<'PY' || { echo "MESSAUSFALL: Mutation $1 nicht angebracht"; rm -rf "$d"; exit 4; }
import sys
p, alt, neu = sys.argv[1:4]
s = open(p).read()
if alt not in s: sys.exit(1)
open(p, 'w').write(s.replace(alt, neu, 1))
PY
  fi
  (cd "$d" && node --test test/partnercode.test.mjs >/dev/null 2>&1); local rc=$?
  rm -rf "$d"; echo "$rc"
}
[ "$(lauf original '' '' '')" = 0 ] || { echo "MESSAUSFALL: Original nicht gruen"; exit 4; }
fehl=0
pruefe() { local rc; rc=$(lauf "$@"); if [ "$rc" = 4 ] || [ "$rc" = "" ]; then echo "MESSAUSFALL $1"; exit 4; fi
  if [ "$rc" != 0 ]; then echo "ROT  $1"; else echo "GRUEN $1 (Mutante ueberlebt)"; fehl=1; fi; }
pruefe M1-fremder-code-ersetzt app/lib/partnercode.server.js "} else if (codes.length > 0) {" "} else if (false) {"
pruefe M2-token-ignoriert app/lib/partnercode.server.js "return SCA_REF_RX.test(ref) ? ref : null;" "return SCA_REF_RX.test(ref) ? ref.split('.')[0] + '.xxxx' : null;"
pruefe M3-klartext-im-modul bin/partnercode-gen.mjs "liste.push(await eintragFuer(ref, code));" "liste.push({...(await eintragFuer(ref, code)), c: code});"
pruefe M4-einhaengung-fehlt app/entry.server.jsx "await wendePartnercodeAn({" "await Promise.resolve({"
pruefe M5-datenabruf-legt-korb-an app/lib/partnercode.server.js "if (ziel && ziel !== 'document') return null;" ""
exit $fehl
