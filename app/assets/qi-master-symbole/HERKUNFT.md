# Qi-Master-Symbole — woraus jedes einzelne entstanden ist

Diese fünf Symbole sind für diesen Kopfblock **selbst gezeichnet**. Kein Pfad ist aus
einem fremden Symbolsatz übernommen, auch nicht als Ausgangspunkt zum Abwandeln — das
verlangt der Auftrag `20260916-vier-eigene-symbole-für-den-kopfblock-erst-vorlegen`
ausdrücklich, und es ist der Grund, warum hier je Symbol steht, wie es zustande kam.

## Die Machart ist gemessen, nicht geraten

Christians Anweisung lautet „Farbe und Stil wie unten bei ‚Ein Stück, kein Serienteil'".
Gemessen am 2026-09-16 an `app/components/product-pages/QiMaster.jsx` und am Kundenrand:

| Eigenschaft | Wert |
|---|---|
| `viewBox` | `0 0 24 24` |
| Zeichenweise | **eine** gefüllte Kontur, `fill="currentColor"` |
| `stroke` | **kein einziges** stroke-Attribut auf der ganzen Seite (8 von 8 SVGs) |
| Größe im Markup | `width="1em" height="1em"` — die Größe macht CSS |
| Farbe gerendert | `rgb(242,191,114)` Hausgold, aus CSS über `currentColor` |

Keine Datei hier trägt eine feste Farbe. Wechselt das Haus seine Farbe, wechseln diese
Symbole mit.

> **Der Auftragstext nennt eine andere Machart** (`fill="none"`, `stroke="currentColor"`,
> `stroke-width="2"`, runde Enden). Die gibt es auf dieser Seite nicht und hat es nie
> gegeben (`git log -S 'stroke-width="2"'` auf die Datei: 0 Commits). Gefolgt ist deshalb
> Christians Satz „Stil wie unten", nicht der Buchstabe des Auftrags — eine
> Strichzeichnung neben sieben gefüllten Symbolen wäre der auffälligste Stilbruch der
> Seite. Die Probe rechnet die Soll-Machart aus der Vorlage selbst aus, damit dieser
> Widerspruch nicht ein zweites Mal unbemerkt bleibt.

## Die Löcher sind Wicklungsrichtung, keine zweite Farbe

Jede Aussparung entsteht durch eine gegenläufig gezeichnete Teilkontur im selben Pfad
(`nonzero`, wie im Bestand). Darum bleibt es bei **einem** Pfad je Datei und bei genau
einem Farbwert — die Vorlage macht es genauso.

---

## one-eye.svg — „The One Eye" - Look

Eine **Mandelform aus zwei quadratischen Bézierbögen** (`Q`), die sich an den Seiten zu
Spitzen treffen: zwei Kurven, vier Stützpunkte, links und rechts ein echter Eckpunkt.
Darin eine kreisrunde Aussparung als Iris (r 4,6) und als Pupille ein **Rhombus** (r 2,3
zu 2,7) — die Kante des Steins, der dem Stück den Namen gibt.

Der Rhombus ist der Grund, warum das Symbol kein allgemeines Auge ist: er verknüpft das
Auge mit dem Diamanten. Die Vorlage hat ein Auge für „Die Iris: 108 Striche"; das ist
eine kreisrunde Linse mit Punktpupille und teilt mit diesem hier keinen Pfadabschnitt.

## gitterchip-zweiteilig.svg — Zweiteiliger Gitterchip™

**Zwei gleich große Rechtecke** (je 8,5 x 15 Einheiten) nebeneinander, dazwischen ein
Spalt von 2 Einheiten. Jedes trägt vier quadratische Aussparungen von 2,4 Einheiten in
2 x 2 — das Gitter. Der Spalt ist die Teilung, und er ist absichtlich so breit, dass er
bei 16 px noch trägt.

**Bewusst gelassen:** die Zeile sagt „zweiteilig", und der Auftrag schlägt
„ineinandergreifend" vor. Ein Verzahnungsprofil wurde gezeichnet und verworfen — es liegt
als `gitterchip--stufennaht.svg` bei den Gegenentwürfen (siehe unten). Bei 16 px wurde die Stufe zu Rauschen,
während der gerade Spalt die Teilung klar zeigt. Von zwei Aussagen trägt die sichtbare.

## diamant-gefasst.svg — Hochreiner Natur Diamant eingelassen in den Gitterchip™

Ein **Brillant von oben**: aussen ein Rhombus (r 7,4), darin als Aussparung ein zweiter,
konzentrischer Rhombus (r 3,2) — das ist die Tafelfacette, die einen geschliffenen Stein
von einer bloßen Raute unterscheidet. Dazu **vier Krappen** als kurze Balken, die die
vier Spitzen überdecken: die Fassung. Sie gehört dazu, weil sie der Unterschied zum
bloßen Stein ist.

Bewusst nicht die Seitenansicht: die führt die Vorlage schon für „Diamanten".

## alpha-charge.svg — Alpha Edition - Limitiert auf 100 Stück

Der Dateiname bleibt `alpha-charge.svg`: Christians Umbenennung am 2026-09-21 gilt dem
Kundentext, nicht dem internen Bezeichner. Der steht in der Deploy-Allowlist, in der
generierten Pfadtabelle und im Mutanten-Nachweis — vier Stellen Bruchrisiko ohne
einen einzigen Kunden, der es merkt.

Ein **Siegel**: kräftiger Ring (aussen r 8,6, innen r 6,2), darin ein **Alpha** als
gefüllter Buchstabe mit dreieckiger Aussparung. Der Ring ist eine Punze, wie sie eine
Auflage stempelt.

Das Motiv sagt **Einmaligkeit, nicht Eile**. Kein Wecker, keine Sanduhr, kein fallender
Balken: „Limitiert auf 100 Stück" ist eine Produktangabe, kein Countdown. Bei diesem
Preis und dieser Kundschaft wäre eine Dringlichkeitsmasche der falsche Ton.

## finanzierung-null.svg — 0% Finanzierung mit PayPal und Klarna

Ein **Kartenrahmen**, innen durch zwei Stege in **drei gleich große Felder** geteilt
(je 4,33 Einheiten, auf zwei Stellen gerechnet). Gleich groß ist der ganze Punkt: gleiche
Teilbeträge, kein Aufschlag.

Kein Prozentzeichen — das tragen die Zahlen im Block schon. Und kein Geldmotiv: der
Nachtrag sagt „die Teilung, nicht das Geld". Die Null auf einer Karte lag als zweite
Lesart näher an einem Geldschein und liegt deshalb nur als
`finanzierung--null-auf-karte.svg` bei den Gegenentwürfen (siehe unten).

---

## Die Gegenentwürfe liegen NICHT hier, sondern beim Vorlagebild

fünf verworfene Zweitlesarten, je eine zu jeder Zeile, liegen unter

    Claude/Postausgang/Seitendurchgang-QiMaster/Symbol-Gegenentwürfe/

und nicht im Repo. **Grund:** keine davon wird ausgeliefert, und ein unbenutztes
Artefakt in einem Produktionsverzeichnis ist ein Artefakt, das irgendwann jemand
für benutzt hält. Sie sind Entscheidungsmaterial und liegen deshalb dort, wo die
Entscheidung getroffen wird — neben dem Vorlagebild, das sie zeigt.

**Ein Tausch ist zwei Handgriffe:** die Datei nach `app/assets/qi-master-symbole/`
kopieren, unter dem Namen, den die Zuordnung nennt, und
`node bin/qimaster-symbole-gen.mjs` laufen lassen. Mehr nicht — die Zuordnung in
`app/lib/qi-master-kopfsymbole.js` zeigt auf den Dateinamen, nicht auf Pfaddaten.

| Datei | Lesart | warum nicht gewählt |
|---|---|---|
| `one-eye--ring.svg` | Auge frontal als Ring mit Rhombus-Pupille | liest sich als Zielscheibe, nicht als Auge |
| `gitterchip--stufennaht.svg` | eine Fläche, durch eine gestufte Naht verzahnt | die Stufe wird bei 16 px zu Rauschen |
| `diamant--eingelassen.svg` | Stein in die Gitterplatte eingesenkt | teilt das Plattenmotiv mit dem Gitterchip-Symbol, dadurch verwechselbar |
| `alpha--punze.svg` | Punze in Schildform, Alpha ausgestanzt | trägt bei 16 px besser, aber ein Schild sagt Schutz — das sagt schon „100% Versicherter Versand" zwei Zeilen weiter |
| `finanzierung--null-auf-karte.svg` | Karte mit der Null | liest sich als Geldschein, und der Nachtrag sagt „die Teilung, nicht das Geld" |
