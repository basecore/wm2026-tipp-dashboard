# ⚽ FIFA WM 2026 – Interaktives Tipp-Dashboard

> **🤖 KI-kreiert** – Dieses Projekt, alle Prognosen, Analysen und das Dashboard wurden vollständig mit KI-Unterstützung (Perplexity AI + quantitative Sportanalytik) erstellt.

[![WM 2026](https://img.shields.io/badge/FIFA_WM-2026-gold?style=for-the-badge&logoColor=white)](https://www.fifa.com/de/tournaments/mens/worldcup/canadamexicousa2026)
[![HTML](https://img.shields.io/badge/HTML-Interaktiv-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://basecore.github.io/wm2026-tipp-dashboard)
[![KI-generiert](https://img.shields.io/badge/KI-Generiert-7B2FBE?style=for-the-badge&logo=openai&logoColor=white)](#ki-prompt-prognose-methodik)
[![Lizenz](https://img.shields.io/badge/Lizenz-MIT-green?style=for-the-badge)](LICENSE)

---

## 🌐 Live Demo

**👉 [basecore.github.io/wm2026-tipp-dashboard](https://basecore.github.io/wm2026-tipp-dashboard)**

---

## 📋 Inhaltsverzeichnis

- [Über das Projekt](#über-das-projekt)
- [Features](#features)
- [Dashboard-Seiten](#dashboard-seiten)
- [KI-Prompt: Prognose-Methodik](#ki-prompt-prognose-methodik)
- [Datenquellen](#datenquellen)
- [Turnier-Überblick](#turnier-überblick)
- [Installation](#installation)
- [Roadmap](#roadmap)
- [Lizenz](#lizenz)

---

## 🎯 Über das Projekt

Dieses Dashboard wurde vollständig KI-generiert und bietet eine **interaktive, datenbasierte Übersicht** zur FIFA Fußball-Weltmeisterschaft 2026 in Kanada, Mexiko und den USA.

Die Prognosen basieren auf einem **4-Schritte-Modell** aus quantitativer Sportanalytik:

1. **xG-Baseline** (Expected Goals) aus historischen Länderspieldaten
2. **Poisson-Verteilung** für Exact-Score-Wahrscheinlichkeiten
3. **Kontext-Filter** (Wetter, Höhe, Taktik, Turnierdruck)
4. **Wettmarkt-Kalibrierung** zur Value-Bet-Erkennung

> Das WM 2026-Turnier läuft vom **11. Juni bis 19. Juli 2026** mit **48 Teams**, **12 Gruppen** und **104 Spielen** in 16 nordamerikanischen Stadien.

---

## ✨ Features

| Feature | Beschreibung |
|---|---|
| 🏆 **12 Gruppen A–L** | Live-Tabellen mit Punktestand, Tordifferenz und Form-Dots |
| 📊 **xG-Prognosen** | Poisson-basierte Spielprognosen mit Wahrscheinlichkeitsbalken |
| 📅 **Vollständiger Spielplan** | Alle Spiele mit MEZ-Zeiten, Stadien und Gruppeninfo |
| 🌙 **Dark / Light Mode** | Eleganter Toggle zwischen beiden Themes |
| 📱 **Responsive Design** | Optimiert für Desktop, Tablet und Mobile |
| ⚡ **Live-Badge** | Zeigt an, ob das Turnier aktiv läuft |
| 🎨 **Premium-Design** | Bebas Neue + Inter, Gold/Rot WM-Farbpalette |
| 🔢 **Confidence-Score** | 1–10 Skala für jede Prognose (mit Begründung) |

---

## 📱 Dashboard-Seiten

### 🏠 Gruppen (A–L)
Alle 12 Gruppen mit klickbaren Tabs. Jede Gruppe zeigt:
- Aktuelle Tabelle (Sp / S / U / N / Tore / Diff / Pkt)
- Form der letzten 3 Spiele (grün = Sieg, gold = Unentschieden, rot = Niederlage)
- Alle Gruppenspiele mit Datum, Uhrzeit und Stadion

### 📈 Prognosen
KI-generierte Matchprognosen für ausgewählte Spiele:
- Wahrscheinlichkeitsbalken: Heimsieg / Unentschieden / Auswärtssieg
- xG-Werte (Expected Goals) für beide Teams
- Over 2.5 % und BTTS (Both Teams To Score) %
- Taktische Analyse-Bulletpoints
- Confidence-Badge (Sehr hoch / Hoch / Mittel / Niedrig)

### 📆 Spielplan
Vollständiger Spielplan nach Tagen gegliedert:
- Alle Spiele mit MEZ-Anstoßzeiten
- Status-Badge (Bevorstehend / Live / Abgeschlossen)
- Gruppenkennung und Stadion

### ℹ️ Info
- 16 Gastgeberstädte mit Stadien
- Turnier-KPIs (48 Teams, 12 Gruppen, 104 Spiele, 39 Tage)
- K.O.-Rundenplan von Achtelfinale bis Finale (19. Juli)

---

## 🤖 KI-Prompt: Prognose-Methodik

> Alle Prognosen in diesem Dashboard wurden mit den folgenden **zwei KI-Prompts** erstellt. Diese Prompts können für eigene Spielanalysen direkt in Perplexity AI oder einem anderen LLM verwendet werden.

---

### 📌 Prompt 1 – Quantitativer Analyst (Poisson + Value Bet)

```
ROLLE UND ZIEL
Du agierst als hochspezialisierter quantitativer Datenwissenschaftler und Sportwetten-Analyst
für die FIFA WM 2026.
Dein Ziel ist es, durch die Kombination aus xG-Modellierung, Poisson-Verteilung und
Situations-Metriken (Wetter, Höhe, Taktik) eine präzise Spielprognose zu erstellen und
Value Bets (Wetten mit positivem Erwartungswert) zu identifizieren.

WICHTIG: Die WM 2026 läuft aktuell. Nutze zwingend Echtzeit-Daten aus dem laufenden Turnier
(Verletzungen, Sperren, Tabellenstand, reale Form) als höchste Priorität.

DIE 4-SCHRITTE-BERECHNUNGSLOGIK (Zwingend einhalten!)

Schritt 1: xG-Baseline ermitteln (Erwartete Tore)
Berechne die Basis-Torerwartung für Team A und Team B basierend auf:
- Historischer xG-Wert (letzte 10 Länderspiele + WM-Spiele).
- Offensivstärke Team A vs. Defensivstärke Team B (und umgekehrt).
Anpassungen:
- Ausfall Schlüsselstürmer: xG −0.2 bis −0.4
- Ausfall Abwehrchef/Stammwart: gegnerische xG +0.2 bis +0.4
- Spiel auf über 1.500m Höhe: Ausdauerstärkere Mannschaft +0.15 xG
- Extreme Hitze (>30°C): xG für beide Teams −10% (weniger Tempo)

Schritt 2: Poisson-Verteilung für Exact Scores
Nutze die ermittelten xG-Werte, um die Wahrscheinlichkeiten für die genauen Ergebnisse zu
berechnen (z.B. 1:0, 1:1, 2:1, 0:0).
Summiere die Matrix-Wahrscheinlichkeiten für Heimsieg, Unentschieden und Auswärtssieg.
Leite daraus Over/Under 2.5 und BTTS-Wahrscheinlichkeiten ab.

Schritt 3: Kontext- und Taktik-Faktor (Der "Menschliche" Filter)
- Turnier-Mathematik: Unentschieden reicht beiden zum Weiterkommen? → Draw +15%
- Taktik-Clash: Ballbesitz vs. Konter → erhöhe Varianz (Überraschungspotenzial)

Schritt 4: Wettmarkt-Kalibrierung (Value Bet Erkennung)
- Suche aktuelle Quoten (1X2, Over/Under)
- Rechne Quote in implizite Wahrscheinlichkeit um (1/Quote)
- Eigene Wahrscheinlichkeit > Marktwahrscheinlichkeit + 5% = VALUE BET

ELFMETERSCHIESSEN (NUR K.-O.-RUNDE)
Wenn Draw-Wahrscheinlichkeit >25%:
- Torhüter-Save-Rate: 40% Gewichtung
- Historische Elfmeter-Erfahrung: 30% Gewichtung
- Psychologischer Druck: 30% Gewichtung
→ Exaktes Ergebnis angeben (z.B. 4:3 nach Elfmetern)

DATENPRIORISIERUNG
1. Echtzeit-Daten WM 2026 (Verletzungen, Form im laufenden Turnier)
2. Wetter- und Höhendaten am Spielort in Nordamerika
3. Vorrunden-Statistiken oder letzte 5 Länderspiele vor dem Turnier
(Weise auf fehlende Daten hin → Confidence-Stufe reduzieren)

AUSGABEFORMAT

1. Management Summary (2–3 Sätze)

2. Match-Parameter & Baseline
   - Ort/Stadion: [Stadt, Höhe in m, Wettervorhersage]
   - Turnierphase: [Gruppe X / K.-o.-Runde]
   - Erwartete xG nach Anpassung: [Team A: X.XX | Team B: Y.YY]

3. Poisson-Wahrscheinlichkeiten
   | Event        | Modell-% | Markt-% (Quote) | Value Bet? |
   |---|---|---|---|
   | Sieg A       | XX%      | XX%             | Ja/Nein    |
   | Draw         | XX%      | XX%             | Ja/Nein    |
   | Sieg B       | XX%      | XX%             | Ja/Nein    |
   | Over 2.5     | XX%      | XX%             | Ja/Nein    |
   | Under 2.5    | XX%      | XX%             | Ja/Nein    |
   | BTTS: Ja     | XX%      | XX%             | Ja/Nein    |

4. Top 3 Exact Scores
   - [X:Y] – XX%
   - [X:Y] – XX%
   - [X:Y] – XX%
   Falls K.-o. + Draw >25%: Elfmeter-Sieger: [Team] (Score X:Y nach Elfmeter)

5. Taktik & Kontext-Analyse (Max. 4 Bulletpoints)
   - Höhe/Wetter → Tempo-Einfluss?
   - Taktisches Matchup → spielentscheidend?
   - Ausfälle → xG-Verzerrung?

6. Finale Tipp-Empfehlung
   | Tipp-Art    | Empfehlung        | Begründung          | Risiko  |
   |---|---|---|---|
   | Main Bet    | [z.B. Under 2.5]  | [Hitze + Defensive] | Niedrig |
   | Value Bet   | [z.B. Draw HZ]    | [Modell +10% Markt] | Mittel  |
   | Exact Score | [X:Y]             | [Poisson-Peak]      | Hoch    |
   
   Confidence-Score: [1–10] (Begründung bei Abzügen)
```

---

### 📌 Prompt 2 – Space-Analyst (Perplexity WM 2026 Space)

> Dieser Prompt wurde als **Space-Instruction** in Perplexity AI konfiguriert und läuft als dauerhafter System-Kontext für alle WM-2026-Anfragen.

**Verwendung:**
```
# In Perplexity AI → Space "WM 2026 Football"
# Einfach das Spiel nennen:

"Prognose für [Team A] vs. [Team B], Gruppe [X], [Datum], [Uhrzeit] MEZ"
```

Der Space analysiert automatisch mit Echtzeit-Webdaten (FIFA.com, fbref.com, flashscore.com, transfermarkt.com) und gibt das vollständige Ausgabeformat zurück.

---

## 📊 Datenquellen

### Primär (Höchste Priorität)
| Quelle | Inhalt |
|---|---|
| [fifa.com](https://www.fifa.com/de/tournaments/mens/worldcup/canadamexicousa2026) | Offizielle Ergebnisse, Tabellen, Spielplan |
| [inside.fifa.com](https://inside.fifa.com) | Pressemitteilungen, offizielle Statistiken |
| [fbref.com](https://fbref.com) | xG-Werte, erweiterte Statistiken |
| [understat.com](https://understat.com) | xG-Daten, Schüsse, Ballbesitz |
| [flashscore.com](https://flashscore.com) | Live-Ergebnisse, Aufstellungen |
| [transfermarkt.com](https://transfermarkt.de) | Marktwerte, Kader, Verletzungen |

### Sekundär
| Quelle | Inhalt |
|---|---|
| [soccerway.com](https://soccerway.com) | H2H, Spielergebnisse |
| [statbunker.com](https://statbunker.com) | Historische Statistiken |
| [worldfootball.net](https://worldfootball.net) | Archiv, Länderspiele |
| [openweathermap.org](https://openweathermap.org) | Wetter- und Temperaturdaten |
| [concacaf.com](https://concacaf.com) | CONCACAF-Teams |
| [conmebol.com](https://conmebol.com) | CONMEBOL-Teams |
| [cafonline.com](https://cafonline.com) | CAF-Teams (Afrika) |

---

## 🏆 Turnier-Überblick

```
📅 Zeitraum:    11. Juni – 19. Juli 2026 (39 Tage)
🌍 Gastgeber:   🇺🇸 USA  🇨🇦 Kanada  🇲🇽 Mexiko
👥 Teams:       48 Nationen (erstmals)
🏟  Gruppen:    12 Gruppen (A–L), je 4 Teams
⚽ Spiele:      104 Gesamt (36 Gruppe + 16 AF + 8 VF + 4 HF + 1 P3 + 1 Finale)
🏟  Stadien:    16 (USA: 11 · Mexiko: 3 · Kanada: 2)
🥇 Finale:      19. Juli 2026 · MetLife Stadium · New York/New Jersey
```

### Die 12 Gruppen auf einen Blick

| Gruppe | Teams | Favorit |
|---|---|---|
| **A** 🇲🇽 | Mexiko, Südkorea, Tschechien, Südafrika | 🇲🇽 Mexiko |
| **B** 🇨🇦 | Kanada, Schweiz, Bosnien, Katar | 🇨🇭 Schweiz |
| **C** | Brasilien, Marokko, Schottland, Haiti | 🇧🇷 Brasilien |
| **D** 🇺🇸 | USA, Türkei, Australien, Paraguay | 🇺🇸 USA |
| **E** | Deutschland, Elfenbeinküste, Ecuador, Curaçao | 🇩🇪 Deutschland |
| **F** | Niederlande, Japan, Schweden, Tunesien | 🇳🇱 Niederlande |
| **G** | Belgien, Iran, Ägypten, Neuseeland | 🇧🇪 Belgien |
| **H** | Spanien, Uruguay, Saudi-Arabien, Kap Verde | 🇪🇸 Spanien |
| **I** | Frankreich, Norwegen, Senegal, Irak | 🇫🇷 Frankreich |
| **J** | Argentinien, Kolumbien, Algerien, Usbekistan | 🇦🇷 Argentinien |
| **K** | Portugal, Österreich, Chile, Kongo | 🇵🇹 Portugal |
| **L** | England, Kroatien, Ghana, Panama | 🏴󠁧󠁢󠁥󠁮󠁧󠁿 England |

---

## 🚀 Installation

### Option 1: GitHub Pages (empfohlen)
Das Dashboard ist vollständig self-contained (kein Server, kein Build-Tool nötig).

```bash
# 1. Repository klonen
git clone https://github.com/basecore/wm2026-tipp-dashboard.git
cd wm2026-tipp-dashboard

# 2. Direkt im Browser öffnen
open index.html   # macOS
# oder: Doppelklick auf index.html in Windows/Linux
```

### Option 2: Lokal mit Python-Server
```bash
python3 -m http.server 8080
# → http://localhost:8080
```

### Datei manuell auf GitHub hochladen
```bash
git add index.html README.md
git commit -m "Update: WM 2026 Dashboard + README"
git push origin main
```

---

## 🗺️ Roadmap

- [x] Interaktives HTML-Dashboard (Gruppen, Prognosen, Spielplan, Info)
- [x] Dark / Light Mode
- [x] Spielplan Spieltag 1 (11.–17. Juni)
- [x] KI-Prompt vollständig dokumentiert
- [ ] Echtzeit-Ergebnis-Updates nach jedem Spieltag
- [ ] Alle 104 Spiele im Spielplan
- [ ] Elfmeter-Prognosen für K.O.-Runde
- [ ] Torschützen-Statistik
- [ ] Head-to-Head Vergleiche

---

## 🤖 KI-Transparenz

Dieses Projekt wurde vollständig KI-generiert:

| Komponente | Tool |
|---|---|
| Dashboard-HTML/CSS/JS | Perplexity AI (Claude Sonnet) |
| Spielprognosen & xG-Werte | Perplexity AI WM-Space |
| Poisson-Modell-Logik | Quantitativer Analyst-Prompt (siehe oben) |
| README | Perplexity AI |
| Datenrecherche | Echtzeit-Websuche via Perplexity |

> ⚠️ **Haftungsausschluss:** Alle Prognosen sind mathematische Modell-Schätzungen und keine Wettempfehlungen. Sportwetten bergen finanzielle Risiken. Keine Haftung für Verluste.

---

## 📄 Lizenz

MIT License – frei verwendbar, Nennung erwünscht.

---

<div align="center">

**⚽ Erstellt mit ❤️ und 🤖 KI für die FIFA WM 2026**

*11. Juni – 19. Juli 2026 · Kanada · Mexiko · USA*

[![FIFA](https://img.shields.io/badge/Offizielle_Seite-FIFA.com-004d98?style=flat-square)](https://www.fifa.com/de/tournaments/mens/worldcup/canadamexicousa2026)

</div>
