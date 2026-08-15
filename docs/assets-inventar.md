# Inventar `src/assets`

Bestandsaufnahme, nichts gelöscht. Anlass: nach den 12.4 MB toter Importe
und einer Bilddatei ungeklärter Herkunft soll bekannt sein, was in diesem
Ordner sonst noch liegt.

Neu erzeugen mit `node scripts/asset-inventory.mjs` — der Stand unten
veraltet, das Skript nicht.

## Wie gezählt wurde

Durchsucht wurde alles, was in den Build eingeht: `src`, `public`,
`index.html`, `scripts` — jede `.ts .tsx .js .jsx .mjs .css .html .json`.
Eine Datei gilt als referenziert, wenn ihr Dateiname dort vorkommt oder
sie in `scripts/optimize-images.mjs` als Quelle geführt wird.

Zwei Dinge, die dabei bewusst aussen vor bleiben:

- **`src/assets/generated/`** ist Ausgabe der Bildpipeline, kein Bestand.
  Diese 66 Dateien entstehen aus den 9 Quellen der Pipeline neu und sind
  hier nicht mitgezählt.
- **`portal/` und `solutions/`** sind eigene Projekte mit eigenen
  `assets`-Ordnern. Sie können aus dem Hauptprojekt nicht importieren,
  also erweitern sie den Suchraum nicht — eine Datei, die dort verwendet
  wird, gilt hier trotzdem als unreferenziert. Betroffen ist
  `Tellian_arrow_short.svg`: in `solutions/` in Gebrauch, im
  Hauptprojekt nicht.

Der Namensabgleich kann überzählen, nicht unterzählen — ein Dateiname in
einem Kommentar würde als Referenz gelten. Dynamisch zusammengebaute
Pfade (`` `logo/${variante}.svg` ``) wären der umgekehrte Fall; danach
habe ich gesucht, es gibt keine.

## Referenziert

| Datei | Masse | Grösse | Weg |
|---|---|---|---|
| logo/Tellian__Imperial purple logo.svg | 546×342 | 10 kB | app/components/Navigation.tsx |
| logo/Tellian__archive white logo horizontal.svg | 546×342 | 10 kB | app/App.tsx |
| logo/tellian-wordmark-cropped.svg | 340×78 | 5 kB | app/components/Navigation.tsx |
| opernhaus2.jpg | 824×550 | 127 kB | Bildpipeline |
| sardona-1.jpg | 3024×4032 | 5.3 MB | Bildpipeline |
| team/Andreas-Trümpler.JPG | 7008×4672 | 6.8 MB | Bildpipeline |
| team/Bryan-Honegger.png | 1023×1537 | 1.7 MB | Bildpipeline |
| team/Jasmina-Rukavina.JPG | 4672×7008 | 4.2 MB | Bildpipeline |
| team/Marco-Ludescher.JPG | 7008×4672 | 7.4 MB | Bildpipeline |
| team/Olivier-Bill.JPG | 7008×4672 | 6.0 MB | Bildpipeline |
| team/Rolf-Schneider.JPG | 7008×4672 | 6.9 MB | Bildpipeline |
| zh-3.jpg | 3618×5427 | 3.3 MB | Bildpipeline |

## Nicht referenziert (68 Dateien, 13.2 MB)

| Datei | Masse | Grösse |
|---|---|---|
| b4ed6cb147950f15472091157e857a2d7f1ce0e8.png | 2816×1536 | 6.8 MB |
| a44e63e47eecf6c5811f4525d593bd929e31be63.png | 3426×5139 | 2.5 MB |
| f68e696a94d5501be4f500478f5085490ea6351a.png | 4000×6000 | 2.0 MB |
| 29fb6897d14923649548800503cc773b55cb5083.png | 3840×3064 | 1.2 MB |
| 868d6afdf0335422ce32d497da0c82ae30b6012c.png | 853×1280 | 279 kB |
| TellianCapital-Logo.png | 1500×900 | 22 kB |
| logo/Tellian pattern 2.svg | 360×216 | 18 kB |
| logo/Tellian pattern.svg | 360×216 | 18 kB |
| Tellian-logo.png | 1500×900 | 14 kB |
| logo/Tellian__Imperial purple and white 2.svg | 546×342 | 11 kB |
| logo/Tellian__Imperial purple and white.svg | 546×342 | 11 kB |
| logo/Tellian__Mushroom and white  2.svg | 546×342 | 10 kB |
| logo/Tellian__Mushroom and white .svg | 546×342 | 10 kB |
| logo/Tellian__black and white logo 2.svg | 546×342 | 10 kB |
| logo/Tellian__black and white logo.svg | 546×342 | 10 kB |
| logo/Tellian__Imperial purple logo 2.svg | 546×342 | 10 kB |
| logo/Tellian__Silver Mist logo 2.svg | 546×342 | 10 kB |
| logo/Tellian__Silver Mist logo.svg | 546×342 | 10 kB |
| logo/Tellian__black logo horizontal copy 2.svg | 546×342 | 10 kB |
| logo/Tellian__black logo horizontal copy.svg | 546×342 | 10 kB |
| logo/Tellian__archive white logo horizontal 2.svg | 546×342 | 10 kB |
| logo/Tellian__black logo horizontal  2.svg | 546×342 | 10 kB |
| logo/Tellian__black logo horizontal .svg | 546×342 | 10 kB |
| logo/Tellian__black logo vertical copy 2.svg | 546×342 | 10 kB |
| logo/Tellian__black logo vertical copy 3.svg | 546×342 | 10 kB |
| logo/Tellian__white logo vertical 2.svg | 546×342 | 10 kB |
| logo/Tellian__white logo vertical.svg | 546×342 | 10 kB |
| logo/Tellian__Imperial purple logo vertical 2.svg | 546×342 | 10 kB |
| logo/Tellian__Imperial purple logo vertical.svg | 546×342 | 10 kB |
| logo/Tellian__Silver Mist logo vertical  2.svg | 546×342 | 10 kB |
| logo/Tellian__Silver Mist logo vertical .svg | 546×342 | 10 kB |
| logo/Tellian__black logo vertical copy 4.svg | 546×342 | 10 kB |
| logo/Tellian__black logo vertical copy.svg | 546×342 | 10 kB |
| .DS_Store |  | 6 kB |
| logo/.DS_Store |  | 6 kB |
| logo/Tellian__Imperial purple 2.svg | 546×342 | 6 kB |
| logo/Tellian__Imperial purple.svg | 546×342 | 6 kB |
| logo/Tellian__Mushroom logo copy 2.svg | 546×342 | 6 kB |
| logo/Tellian__Mushroom logo copy.svg | 546×342 | 6 kB |
| logo/Tellian__Silver mist  2.svg | 546×342 | 6 kB |
| logo/Tellian__Silver mist .svg | 546×342 | 6 kB |
| logo/Tellian__Archive White logo 2.svg | 546×342 | 6 kB |
| logo/Tellian__Archive White logo.svg | 546×342 | 6 kB |
| logo/Tellian__black logo  2.svg | 546×342 | 6 kB |
| logo/Tellian__black logo .svg | 546×342 | 6 kB |
| Tellian-logo-1.svg | 927×556 | 5 kB |
| logo/Tellian__Imperial purple text 2.svg | 546×342 | 5 kB |
| logo/Tellian__Imperial purple text.svg | 546×342 | 5 kB |
| logo/Tellian__Mushroom logo text 2.svg | 546×342 | 5 kB |
| logo/Tellian__Mushroom logo text.svg | 546×342 | 5 kB |
| logo/Tellian__Silver mist text 2.svg | 546×342 | 5 kB |
| logo/Tellian__Silver mist text.svg | 546×342 | 5 kB |
| logo/Tellian__Archive White text 2.svg | 546×342 | 5 kB |
| logo/Tellian__Archive White text.svg | 546×342 | 5 kB |
| logo/Tellian__black logo  text 2.svg | 546×342 | 5 kB |
| logo/Tellian__black logo  text.svg | 546×342 | 5 kB |
| logo/tellian-wordmark-cropped 2.svg | 340×78 | 5 kB |
| logo/Tellian__Imperial purple monogram 2.svg | 546×342 | 1 kB |
| logo/Tellian__Imperial purple monogram.svg | 546×342 | 1 kB |
| logo/Tellian__Mushroom monogram logo 2.svg | 546×342 | 1 kB |
| logo/Tellian__Mushroom monogram logo.svg | 546×342 | 1 kB |
| logo/Tellian__Silver Mist monogram 2.svg | 546×342 | 1 kB |
| logo/Tellian__Silver Mist monogram.svg | 546×342 | 1 kB |
| logo/Tellian__Archive White monogram logo 2.svg | 546×342 | 1 kB |
| logo/Tellian__Archive White monogram logo copy 2.svg | 546×342 | 1 kB |
| logo/Tellian__Archive White monogram logo copy.svg | 546×342 | 1 kB |
| logo/Tellian__Archive White monogram logo.svg | 546×342 | 1 kB |
| Tellian_arrow_short.svg | 8×32 | 0 kB |

SUMME referenziert: 41.9 MB (12)
SUMME tot:          13.2 MB (68)

## Befund

**Die Hälfte des Ordners ist Doppelung durch den Finder.** 31 Dateien
tragen ein angehängtes `2`, `3` oder `4`. Bei 29 davon liegt eine
byteidentische Datei ohne Suffix daneben. Nur zwei weichen tatsächlich
ab: `Tellian__black logo vertical copy 2.svg` und `… copy 3.svg` sind
gegenüber `… copy.svg` verschieden und damit möglicherweise eigene
Varianten.

**`logo/` enthält 60 SVG-Dateien, von denen 3 verwendet werden.** Es ist
offenkundig ein vollständiger Markenexport — jedes Logo in Imperial
Purple, Mushroom, Silver Mist, Archive White und Schwarz, jeweils als
Logo, Text, Monogramm, horizontal und vertikal, und das meiste doppelt.
Verwendet sind `Tellian__Imperial purple logo.svg`,
`Tellian__archive white logo horizontal.svg` und
`tellian-wordmark-cropped.svg`.

**Fünf Dateien mit Hash-Namen, zusammen 12.7 MB, sind nirgends
referenziert** — nicht im Hauptprojekt und nicht in `portal/` oder
`solutions/`; ich habe im ganzen Repository nach den Hashes gesucht, ohne
Treffer. Namen wie
`b4ed6cb147950f15472091157e857a2d7f1ce0e8.png` (6.8 MB, 2816×1536) sind
die typische Signatur eines Figma-Exports. Sie machen den Grossteil des
toten Bestands aus.

**Zwei Logo-Rasterfassungen sind Altbestand:**
`TellianCapital-Logo.png` und `Tellian-logo.png`, beide 1500×900 und
inhaltlich dasselbe wie die SVG-Fassungen, dazu `Tellian-logo-1.svg`.

**`.DS_Store` liegt zweimal im Ordner** und gehört nicht ins Repository.

## Was das für die Auslieferung bedeutet

Nichts davon landet derzeit im Bundle: Vite nimmt nur auf, was
importiert wird, und die 68 Dateien werden nicht importiert. Das Gewicht
liegt im Repository, nicht in der ausgelieferten Seite. Es ist ein
Aufräum- und kein Leistungsproblem — anders als die 12.4 MB toter
Importe, die tatsächlich mitgebaut wurden, weil sie importiert waren.

## Offen

Zu klären, bevor irgendetwas verschwindet:

- Sind die fünf Hash-PNGs Rohmaterial, das noch gebraucht wird, oder
  Rückstand aus dem Figma-Import?
- Soll `logo/` auf die tatsächlich gebrauchten Fassungen zusammengezogen
  werden, oder ist der vollständige Markenexport hier bewusst abgelegt?
- Die beiden abweichenden `black logo vertical copy`-Fassungen brauchen
  einen Blick, bevor man sie mit den identischen Doppelungen in einen
  Topf wirft.
