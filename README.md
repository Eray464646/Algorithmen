# A&D Lernplattform

Eine interaktive Lernplattform für Algorithmen & Datenstrukturen mit drei verschiedenen Modi zur Klausurvorbereitung.

## 📚 Features

### Modi

#### 📝 Hauptmodus
- Beantworte alle Fragen in zufälliger Reihenfolge
- Ideal für umfassende Vorbereitung
- Sofortiges Feedback zu jeder Antwort

#### 🎯 Lernmodus
- Intelligente Wiederholung schwieriger Fragen
- Fokus auf Fragen mit Schwierigkeiten
- Adaptives Lernsystem basierend auf deinem Fortschritt

#### 🎮 Gamified Quiz (NEU!)
- Spielerisches Lernen mit Timer, Punkten und Streaks
- Power-ups: 50/50 und Skip
- Highscore-Tracking
- Progressive Schwierigkeit
- Siehe [GAMIFIED_MODE.md](GAMIFIED_MODE.md) für Details

#### 👥 1v1 Multiplayer (NEU!)
- Echtzeit-Multiplayer gegen 2-3 Spieler
- Synchronisierte Fragen mit Timer
- Punktesystem mit Zeitbonus
- Siegerpodest mit Top 3
- Siehe [MULTIPLAYER_MODE.md](MULTIPLAYER_MODE.md) für Details

### Weitere Features

- **Multi-User Support**: Mehrere Profile mit Passwortschutz
- **Statistik-Dashboard**: Detaillierte Auswertung deines Lernfortschritts
- **Dark Mode**: Augenfreundliches Arbeiten bei Nacht
- **Topic Filter**: Gezieltes Lernen nach Themen
- **Fortschritt speichern**: Import/Export deines Lernfortschritts
- **PDF-Import**: Lade eigene Klausurfragen hoch (Gamified Mode)

## 🚀 Schnellstart

1. **Repository klonen**
   ```bash
   git clone https://github.com/Eray464646/Algorithmen.git
   cd Algorithmen
   ```

2. **Server starten**
   ```bash
   python3 -m http.server 8080
   ```
   oder
   ```bash
   npx http-server -p 8080
   ```

3. **Im Browser öffnen**
   ```
   http://localhost:8080
   ```

4. **Profil auswählen**
   - Standard-Profil: **Admin** (Passwort: `4646`)
   - Oder neues Profil erstellen

## 📖 Themen

Die Plattform deckt folgende Themen ab:

- **Insertion Sort** - Grundlagen und Laufzeitanalyse
- **Breitensuche (BFS)** - Graphentraversierung
- **Topologische Sortierung** - DAG-Algorithmen
- **PRIM MST** - Minimale Spannbäume
- **Netzwerkflüsse** - Max-Flow Algorithmen
- **Laufzeiten - O Notation** - Komplexitätsanalyse
- **Datenstrukturen** - Arrays, Listen, Bäume, etc.
- **Graphentheorie** - Grundlagen und Algorithmen
- **Suche & Bäume** - Such- und Baumalgorithmen

## 🎮 Gamified Quiz Mode

Der neue Gamified Quiz Mode bietet:

- ⏱️ **Timer pro Frage** (15/30/60s konfigurierbar)
- 💎 **Punktesystem** (100 + Zeit-Bonus + Streak-Bonus)
- 🔥 **Streak-System** (+50 für jeden 5er-Streak)
- ❤️ **Leben-System** (3 Fehler = Game Over)
- 📈 **Progressive Schwierigkeit**
- 🎯 **Power-ups** (50/50, Skip)
- 🏆 **Highscore-Tracking**
- 📄 **PDF-Import** für eigene Klausurfragen

**Tastatursteuerung:**
- `1-4`: Antworten auswählen
- `ESC`: Pause (geplant)

Detaillierte Dokumentation: [GAMIFIED_MODE.md](GAMIFIED_MODE.md)

## 📊 Statistiken

Das Statistik-Dashboard zeigt:

- Gesamtanzahl beantworteter Fragen
- Richtige/Falsche Antworten
- Erfolgsquote in Prozent
- Lernstatus nach Kategorien (Kann ich nicht / Unsicher / Sicher)
- Detaillierte Statistik nach Themen

## 💾 Daten-Management

### Fortschritt exportieren
1. Gehe zu **Einstellungen**
2. Klicke auf **📥 Fortschritt exportieren**
3. Speichere die JSON-Datei

### Fortschritt importieren
1. Gehe zu **Einstellungen**
2. Klicke auf **📤 Fortschritt importieren**
3. Wähle deine gespeicherte JSON-Datei

### Fortschritt zurücksetzen
Achtung: Dies löscht alle gespeicherten Fortschrittsdaten!

## 🔧 Technische Details

### Architektur

```
Algorithmen/
├── index.html              # Haupt-HTML
├── app.js                  # Hauptanwendung
├── algorithmen.js          # Fragendatenbank
├── mc_fragen_suche_und_baeume.js
├── styles.css              # Haupt-Styling
├── src/
│   ├── modes/
│   │   └── gamified/       # Gamified Quiz Mode
│   │       ├── GamifiedQuiz.js
│   │       └── gameLogic.js
│   ├── data/
│   │   └── questionSource.js
│   ├── utils/
│   │   └── pdf/
│   │       └── parseKlausur.js
│   └── styles/
│       └── gamified.css
└── GAMIFIED_MODE.md        # Gamified Mode Doku
```

### Technologien

- **Plain JavaScript** (ES6 Modules)
- **CSS3** mit CSS Custom Properties
- **LocalStorage** für Datenpersistenz
- **PDF.js** für PDF-Import (CDN)
- Keine Build-Tools erforderlich

### Browser-Kompatibilität

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## 🎨 Features im Detail

### Multi-User System
- Unbegrenzte Profile
- Optional mit Passwortschutz
- Isolierte Fortschrittsdaten pro Profil
- Admin-Profil mit Kennzeichnung

### Dark Mode
- Automatische Umschaltung
- Konsistentes Design
- Augenschonend

### Responsive Design
- Optimiert für Desktop und Mobile
- Touch-freundliche UI
- Adaptive Layouts

## 📝 Lizenz

Dieses Projekt ist für Bildungszwecke erstellt.

## 🔧 Setup für Multiplayer-Modus

Der Multiplayer-Modus benötigt eine Supabase-Konfiguration. 

### Dokumentation

- **[MULTIPLAYER_MODE.md](MULTIPLAYER_MODE.md)** - Vollständige Feature-Dokumentation
- **[SCHNELLHILFE_MULTIPLAYER.md](SCHNELLHILFE_MULTIPLAYER.md)** - 🚨 Wenn Host keine Spieler sieht (2 Min Fix)
- **[SUPABASE_SETUP_GUIDE.md](SUPABASE_SETUP_GUIDE.md)** - Detaillierte Konfigurationsanleitung

### Kurzanleitung

1. Erstelle ein [Supabase](https://supabase.com)-Projekt
2. Führe das SQL-Setup aus (siehe MULTIPLAYER_MODE.md) - **inkl. `code` Spalte!**
3. **Aktiviere Realtime** für die `rooms` Tabelle (Database → Replication)
4. Kopiere deine Credentials in `supabase-config.js`
5. Warte 2 Minuten nach Realtime-Aktivierung

### Häufige Probleme

**Host sieht keine neuen Spieler?**
→ Realtime ist nicht aktiviert! Siehe [SCHNELLHILFE_MULTIPLAYER.md](SCHNELLHILFE_MULTIPLAYER.md)

## 👤 Autor

Eray - [GitHub](https://github.com/Eray464646)

## 🤝 Beitragen

Contributions, Issues und Feature Requests sind willkommen!

## 📅 Version

**Version 4.0.0** - 1v1 Multiplayer Mode
- ✨ Neuer Echtzeit-Multiplayer-Modus (1v1 / 1v1v1)
- 🌐 Supabase-Integration für synchrones Gameplay
- 🏆 Siegerpodest mit Top 3 Spielern
- ⏱️ Timer-System mit Zeitbonus
- 👥 Raum-System mit Host und Join-Funktion

**Version 3.0.0** - Gamified Quiz Mode
- ✨ Neuer Gamified Quiz Mode mit Timer und Power-ups
- 📄 PDF-Import für Klausurfragen
- 🏆 Highscore-System
- ⌨️ Tastatursteuerung

**Version 2.0.0** - Multi-User Support
- 👥 Multi-User Profilverwaltung
- 📊 Erweiterte Statistiken

**Version 1.0.0** - Initial Release
- 📝 Hauptmodus
- 🎯 Lernmodus
- 📊 Statistiken
