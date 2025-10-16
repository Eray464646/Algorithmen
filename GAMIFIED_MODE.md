# Gamified Quiz Mode - Dokumentation

## Übersicht

Der **Gamified Quiz Mode** ist ein spielerischer Lernmodus mit Timer, Punktesystem, Streaks und Power-ups. Er bietet eine unterhaltsame Möglichkeit, das Wissen zu testen und zu verbessern.

## Features

### Gameplay-Elemente

- **⏱️ Timer**: Jede Frage hat ein konfigurierbares Zeitlimit (15/30/60 Sekunden)
- **💎 Punktesystem**:
  - Richtige Antwort: 100 Punkte
  - Zeit-Bonus: +1 Punkt pro verbleibender Sekunde
  - Streak-Bonus: +50 Punkte für jeden 5er-Streak
- **🔥 Streak**: Zählt aufeinanderfolgende richtige Antworten
- **❤️ Leben**: 3 Fehler = Game Over (konfigurierbar: 1/3/5 Leben)
- **📈 Progressive Schwierigkeit**: Timer reduziert sich nach je 5 richtigen Antworten um 5s (Minimum: 15s)

### Power-ups (Einmalig pro Spiel)

- **50/50**: Eliminiert 2 falsche Antworten
- **⏭️ Skip**: Überspringt die aktuelle Frage ohne Strafe

### Fragetypen

1. **Multiple Choice**: Standard-Fragen mit 4 Antwortoptionen
2. **Offene Fragen**: Selbstbewertung nach Anzeige der Lösung

### Einstellungen

- **Timer pro Frage**: 15, 30 oder 60 Sekunden
- **Anzahl Fragen**: 10, 20, 30 oder 50 Fragen pro Run
- **Leben**: 1, 3 oder 5 Fehlversuche

## Klausurfragen hochladen

Der Gamified Mode unterstützt das Hochladen von Klausurfragen im PDF-Format:

1. Klicke auf "📤 PDF hochladen" im Start-Screen
2. Wähle die Datei **Klausurfragen.pdf** aus
3. Die Fragen werden automatisch geparst und dem Fragenpool hinzugefügt
4. Ein neuer Themenfilter "Klausurfragen" wird verfügbar

### PDF-Format

Die PDF sollte folgendes Format haben:

```
1. Frage-Text hier?
A) Antwort 1
B) Antwort 2
C) Antwort 3
D) Antwort 4
Lösung: B

2. Nächste Frage?
...
```

Unterstützte Markierungen für richtige Antworten:
- `Lösung: B`, `Richtig: B`, `Antwort: B`
- `* B)` oder `✓ B)`

## Tastatursteuerung

- **1-4**: Wähle Antwort 1-4
- **Enter**: Bestätigen/Weiter (zukünftig)
- **ESC**: Pause-Menü (zukünftig)

## Highscores

- **Global**: Bester Score über alle Themen
- **Pro Thema**: Bester Score für jede Themenkombination
- Wird in LocalStorage gespeichert

## Barrierefreiheit

- Vollständige Tastatursteuerung
- ARIA-Labels für Screen-Reader
- Responsive Design (mobil & desktop)
- Klare Fokusstile

## Technische Details

### Architektur

```
src/
├── modes/gamified/
│   ├── GamifiedQuiz.js      # Hauptkomponente
│   └── gameLogic.js         # Spiel-Logik (Scoring, Timer, etc.)
├── data/
│   └── questionSource.js    # Fragen-Adapter mit PDF-Support
├── utils/pdf/
│   └── parseKlausur.js      # PDF-Parser mit PDF.js
└── styles/
    └── gamified.css         # Styling
```

### Abhängigkeiten

- **PDF.js** (CDN): Für clientseitiges PDF-Parsing
- Keine weiteren externen Dependencies

### LocalStorage Keys

- `gamified_highscores`: Highscore-Daten
- `gamified_settings`: Spieleinstellungen
- `klausurfragen_cache`: Gecachte PDF-Fragen

## Entwicklung

### Testing

```bash
# Server starten
python3 -m http.server 8080

# Im Browser öffnen
http://localhost:8080
```

### Code-Qualität

- Modularer Code mit klarer Trennung
- Englische Kommentare
- TypeScript-Style JSDoc-Annotationen
- ES6 Modules

## Bekannte Einschränkungen

- PDF-Parsing ist heuristisch und funktioniert am besten mit strukturierten PDFs
- Power-up "Freeze" ist momentan deaktiviert
- Pause-Menü (ESC) ist noch nicht implementiert

## Zukünftige Erweiterungen

- [ ] Multiplayer-Modus
- [ ] Achievements/Badges
- [ ] Erweiterte Statistiken
- [ ] Leaderboard
- [ ] Sound-Effekte
- [ ] Animationen für Streak-Boni
