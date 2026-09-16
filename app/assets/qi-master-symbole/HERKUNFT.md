# Qi-Master-Symbole — woraus jedes einzelne entstanden ist

Diese fuenf Symbole sind fuer diesen Kopfblock **selbst gezeichnet**. Kein Pfad ist aus
einem fremden Symbolsatz uebernommen, auch nicht als Ausgangspunkt zum Abwandeln — das
verlangt der Auftrag `20260916-vier-eigene-symbole-fuer-den-kopfblock-erst-vorlegen`
ausdruecklich, und es ist der Grund, warum hier je Symbol steht, wie es zustande kam.

## Die Machart ist gemessen, nicht geraten

Christians Anweisung lautet „Farbe und Stil wie unten bei ‚Ein Stueck, kein Serienteil'".
Gemessen am 2026-09-16 an `app/components/product-pages/QiMaster.jsx` und am Kundenrand:

| Eigenschaft | Wert |
|---|---|
| `viewBox` | `0 0 24 24` |
| Zeichenweise | **eine** gefuellte Kontur, `fill="currentColor"` |
| `stroke` | **kein einziges** stroke-Attribut auf der ganzen Seite (8 von 8 SVGs) |
| Groesse im Markup | `width="1em" height="1em"` — die Groesse macht CSS |
| Farbe gerendert | `rgb(242,191,114)` Hausgold, aus CSS ueber `currentColor` |

Keine Datei hier traegt eine feste Farbe. Wechselt das Haus seine Farbe, wechseln diese
Symbole mit.

> **Der Auftragstext nennt eine andere Machart** (`fill="none"`, `stroke="currentColor"`,
> `stroke-width="2"`, runde Enden). Die gibt es auf dieser Seite nicht und hat es nie
> gegeben (`git log -S 'stroke-width="2"'` auf die Datei: 0 Commits). Gefolgt ist deshalb
> Christians Satz „Stil wie unten", nicht der Buchstabe des Auftrags — eine
> Strichzeichnung neben sieben gefuellten Symbolen waere der auffaelligste Stilbruch der
> Seite. Die Probe rechnet die Soll-Machart aus der Vorlage selbst aus, damit dieser
> Widerspruch nicht ein zweites Mal unbemerkt bleibt.

## Die Loecher sind Wicklungsrichtung, keine zweite Farbe

Jede Aussparung entsteht durch eine gegenlaeufig gezeichnete Teilkontur im selben Pfad
(`nonzero`, wie im Bestand). Darum bleibt es bei **einem** Pfad je Datei und bei genau
einem Farbwert — die Vorlage macht es genauso.

---

## one-eye.svg — „The One Eye" - Look

Eine **Mandelform aus zwei quadratischen Bezierbogen** (`Q`), die sich an den Seiten zu
Spitzen treffen: zwei Kurven, vier Stuetzpunkte, links und rechts ein echter Eckpunkt.
Darin eine kreisrunde Aussparung als Iris (r 4,6) und als Pupille ein **Rhombus** (r 2,3
zu 2,7) — die Kante des Steins, der dem Stueck den Namen gibt.

Der Rhombus ist der Grund, warum das Symbol kein allgemeines Auge ist: er verknuepft das
Auge mit dem Diamanten. Die Vorlage hat ein Auge fuer „Die Iris: 108 Striche"; das ist
eine kreisrunde Linse mit Punktpupille und teilt mit diesem hier keinen Pfadabschnitt.

## gitterchip-zweiteilig.svg — Zweiteiliger Gitterchip™

**Zwei gleich grosse Rechtecke** (je 8,5 x 15 Einheiten) nebeneinander, dazwischen ein
Spalt von 2 Einheiten. Jedes traegt vier quadratische Aussparungen von 2,4 Einheiten in
2 x 2 — das Gitter. Der Spalt ist die Teilung, und er ist absichtlich so breit, dass er
bei 16 px noch traegt.

**Bewusst gelassen:** die Zeile sagt „zweiteilig", und der Auftrag schlaegt
„ineinandergreifend" vor. Ein Verzahnungsprofil wurde gezeichnet und verworfen — es liegt
als `varianten/gitterchip--stufennaht.svg` daneben. Bei 16 px wurde die Stufe zu Rauschen,
waehrend der gerade Spalt die Teilung klar zeigt. Von zwei Aussagen traegt die sichtbare.

## diamant-gefasst.svg — Hochreiner Natur Diamant eingelassen in den Gitterchip™

Ein **Brillant von oben**: aussen ein Rhombus (r 7,4), darin als Aussparung ein zweiter,
konzentrischer Rhombus (r 3,2) — das ist die Tafelfacette, die einen geschliffenen Stein
von einer blossen Raute unterscheidet. Dazu **vier Krappen** als kurze Balken, die die
vier Spitzen ueberdecken: die Fassung. Sie gehoert dazu, weil sie der Unterschied zum
blossen Stein ist.

Bewusst nicht die Seitenansicht: die fuehrt die Vorlage schon fuer „Diamanten".

## alpha-charge.svg — Alpha Charge - Limitiert auf 100 Stueck

Ein **Siegel**: kraeftiger Ring (aussen r 8,6, innen r 6,2), darin ein **Alpha** als
gefuellter Buchstabe mit dreieckiger Aussparung. Der Ring ist eine Punze, wie sie eine
Auflage stempelt.

Das Motiv sagt **Einmaligkeit, nicht Eile**. Kein Wecker, keine Sanduhr, kein fallender
Balken: „Limitiert auf 100 Stueck" ist eine Produktangabe, kein Countdown. Bei diesem
Preis und dieser Kundschaft waere eine Dringlichkeitsmasche der falsche Ton.

## finanzierung-null.svg — 0% Finanzierung mit PayPal und Klarna

Ein **Kartenrahmen**, innen durch zwei Stege in **drei gleich grosse Felder** geteilt
(je 4,33 Einheiten, auf zwei Stellen gerechnet). Gleich gross ist der ganze Punkt: gleiche
Teilbetraege, kein Aufschlag.

Kein Prozentzeichen — das tragen die Zahlen im Block schon. Und kein Geldmotiv: der
Nachtrag sagt „die Teilung, nicht das Geld". Die Null auf einer Karte lag als zweite
Lesart naeher an einem Geldschein und liegt deshalb nur als
`varianten/finanzierung--null-auf-karte.svg` daneben.

---

## varianten/ — die Gegenentwuerfe

Fuenf verworfene Zweitlesarten, je eine zu jeder Zeile. Sie liegen hier, weil Christian
sie ansehen und mit einem Wort tauschen kann; der Tausch ist eine Zeile in
`app/lib/qi-master-kopfsymbole.js`. Keine davon ist im Einsatz.

| Datei | Lesart | warum nicht gewaehlt |
|---|---|---|
| `one-eye--ring.svg` | Auge frontal als Ring mit Rhombus-Pupille | liest sich als Zielscheibe, nicht als Auge |
| `gitterchip--stufennaht.svg` | eine Flaeche, durch eine gestufte Naht verzahnt | Stufe wird bei 16 px zu Rauschen |
| `diamant--eingelassen.svg` | Stein in die Gitterplatte eingesenkt | teilt das Plattenmotiv mit dem Gitterchip-Symbol, dadurch verwechselbar |
| `alpha--punze.svg` | Punze in Schildform, Alpha ausgestanzt | traegt bei 16 px besser, aber ein Schild sagt Schutz — das sagt schon „100% Versicherter Versand" zwei Zeilen weiter |
| `finanzierung--null-auf-karte.svg` | Karte mit der Null | liest sich als Geldschein, und der Nachtrag sagt „die Teilung, nicht das Geld" |
