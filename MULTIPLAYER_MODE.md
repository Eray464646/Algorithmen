# Multiplayer Mode - 1v1 / 1v1v1

Der neue Multiplayer-Modus ermöglicht es, dass 2-3 Spieler gleichzeitig in Echtzeit gegeneinander antreten können. Die Synchronisation erfolgt über Supabase.

## 🎮 Features

- **Echtzeit-Multiplayer**: 2-3 Spieler treten gleichzeitig an
- **Synchronisierte Fragen**: Alle Spieler sehen die gleichen Fragen zur gleichen Zeit
- **Timer-System**: 30 Sekunden pro Frage mit automatischer Zeitüberschreitung
- **Punktesystem**: 100 Basispunkte + Zeitbonus (1 Punkt pro verbleibender Sekunde)
- **Live-Updates**: Echtzeit-Anzeige aller Spieleraktionen
- **Auflösungs-Screen**: Zeigt nach jeder Frage die richtige Antwort und alle Spieler-Ergebnisse
- **Siegerpodest**: Zeigt am Ende Platz 1-3 mit Medaillen und finaler Statistik
- **Raum-System**: Host erstellt Raum, andere treten mit Code bei

## 📋 Voraussetzungen

### Supabase-Account und Projekt

1. Erstelle einen kostenlosen Account auf [supabase.com](https://supabase.com)
2. Erstelle ein neues Projekt
3. Notiere dir die **Project URL** und den **Anon/Public Key**

### Datenbank-Setup

Führe folgendes SQL in deinem Supabase SQL-Editor aus:

```sql
-- Erstelle die rooms Tabelle
CREATE TABLE rooms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    host_uid UUID NOT NULL,
    current_question_index INTEGER DEFAULT 0,
    deadline_ts TIMESTAMPTZ,
    players JSONB DEFAULT '[]'::jsonb,
    settings JSONB DEFAULT '{}'::jsonb,
    last_reveal JSONB
);

-- Index für schnellere Abfragen
CREATE INDEX idx_rooms_created_at ON rooms(created_at);

-- Optional: Alte Räume automatisch löschen (älter als 24 Stunden)
-- Kannst du als Supabase Function einrichten oder manuell ausführen
CREATE OR REPLACE FUNCTION delete_old_rooms()
RETURNS void AS $$
BEGIN
    DELETE FROM rooms WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;
```

### Realtime aktivieren

1. Gehe in Supabase zu **Database** → **Replication**
2. Aktiviere Realtime für die `rooms` Tabelle
3. Stelle sicher, dass alle Ereignisse (INSERT, UPDATE, DELETE) aktiviert sind

### RLS (Row Level Security) konfigurieren

Du hast zwei Optionen:

#### Option 1: RLS deaktivieren (einfacher, aber weniger sicher)

```sql
ALTER TABLE rooms DISABLE ROW LEVEL SECURITY;
```

#### Option 2: RLS-Policies erstellen (empfohlen für Produktion)

```sql
-- RLS aktivieren
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- Policy: Jeder kann Räume lesen
CREATE POLICY "Rooms are viewable by everyone"
ON rooms FOR SELECT
USING (true);

-- Policy: Jeder kann Räume erstellen
CREATE POLICY "Anyone can create rooms"
ON rooms FOR INSERT
WITH CHECK (true);

-- Policy: Jeder kann Räume aktualisieren
CREATE POLICY "Anyone can update rooms"
ON rooms FOR UPDATE
USING (true);

-- Policy: Jeder kann Räume löschen
CREATE POLICY "Anyone can delete rooms"
ON rooms FOR DELETE
USING (true);
```

## ⚙️ Konfiguration

1. Öffne die Datei `supabase-config.js`
2. Ersetze die Platzhalter mit deinen Supabase-Credentials:

```javascript
const SUPABASE_URL = 'https://deinprojekt.supabase.co';
const SUPABASE_ANON_KEY = 'dein-anon-key-hier';
```

3. Speichere die Datei und lade die Anwendung neu

## 🚀 Verwendung

### Raum erstellen (Host)

1. Gehe zum **1v1 Multiplayer** Modus in der Navigation
2. Gib deinen Spieler-Namen ein
3. Klicke auf **➕ Raum erstellen**
4. Ein Raum-Code wird generiert (z.B. `A1B2C3D4`)
5. Teile diesen Code mit anderen Spielern
6. Warte, bis mindestens 2 Spieler im Raum sind
7. Klicke auf **🎮 Spiel starten**

### Raum beitreten (Mitspieler)

1. Gehe zum **1v1 Multiplayer** Modus
2. Gib deinen Spieler-Namen ein
3. Klicke auf **🚪 Raum beitreten**
4. Gib den Raum-Code vom Host ein
5. Warte, bis der Host das Spiel startet

### Während des Spiels

1. **Frage beantworten**: Wähle eine der 4 Antworten aus
2. **Timer**: Du hast 30 Sekunden pro Frage
3. **Punkte**: Richtige Antworten geben 100 + Zeitbonus Punkte
4. **Warten**: Nach deiner Antwort warte auf die anderen Spieler
5. **Auflösung**: Sieh die richtige Antwort und die Ergebnisse aller Spieler
6. **Nächste Frage**: Der Host startet die nächste Frage

### Nach dem Spiel

- **Siegerpodest**: Sieh die Top 3 Spieler mit Medaillen
- **Statistik**: Detaillierte Auswertung aller Spieler
- **Optionen**: Nochmal spielen oder zurück zur Lobby

## 🎯 Spielregeln

### Punktesystem

- **Richtige Antwort**: 100 Basispunkte
- **Zeitbonus**: +1 Punkt pro verbleibender Sekunde (max. 30 Punkte)
- **Beispiel**: Antwort nach 8 Sekunden = 100 + 22 = 122 Punkte

### Timer

- Jede Frage hat 30 Sekunden
- Bei Ablauf: Automatisch falsch gewertet (0 Punkte)
- Timer wird bei 5 Sekunden rot und pulsiert

### Leben

- Jeder Spieler startet mit 3 Leben ❤️
- Falsche Antwort = -1 Leben
- Bei 0 Leben: Spiel endet für dich (kannst aber weiterzuschauen)

### Spielende

- Wenn alle 20 Fragen beantwortet sind
- Oder wenn ein Spieler keine Leben mehr hat

## 🔧 Technische Details

### Architektur

```
src/
├── modes/multiplayer/
│   └── MultiplayerQuiz.js     # Hauptkomponente
├── styles/
│   └── multiplayer.css        # Styling
└── supabase-config.js         # Supabase-Konfiguration
```

### Datenstruktur

#### Room Object
```javascript
{
    id: "uuid",
    created_at: "timestamp",
    host_uid: "player_id",
    current_question_index: 0,
    deadline_ts: "timestamp",
    players: [
        {
            id: "player_id",
            name: "Spieler 1",
            score: 0,
            lives: 3,
            answers: [],
            isReady: false
        }
    ],
    settings: {
        maxPlayers: 3,
        timerPerQuestion: 30,
        questionCount: 20,
        questions: [...]
    },
    last_reveal: {
        questionIndex: 0,
        correctIndex: 2,
        timestamp: "timestamp",
        playerResults: [...]
    }
}
```

### Realtime-Synchronisation

Die App nutzt Supabase Realtime für automatische Updates:

- **Room Updates**: Alle Änderungen an `rooms` werden automatisch synchronisiert
- **Player Join/Leave**: Sofortige Aktualisierung der Spielerliste
- **Answer Submission**: Live-Updates wenn Spieler antworten
- **Question Transitions**: Synchronisierte Fragenwechsel

### Supabase-API-Aufrufe

```javascript
// Raum erstellen
await supabase.from('rooms').insert({...}).select().single();

// Raum beitreten (Player hinzufügen)
await supabase.from('rooms').update({ players: [...] }).eq('id', roomId);

// Raum-Updates abonnieren
supabase.channel(`room:${roomId}`)
    .on('postgres_changes', {...}, (payload) => {...})
    .subscribe();

// Spiel starten
await supabase.from('rooms').update({ 
    current_question_index: 1,
    deadline_ts: new Date(Date.now() + 30000).toISOString()
}).eq('id', roomId);

// Antwort speichern
await supabase.from('rooms').update({ players: updatedPlayers }).eq('id', roomId);

// Auflösung zeigen
await supabase.from('rooms').update({ last_reveal: {...} }).eq('id', roomId);

// Raum verlassen/löschen
await supabase.from('rooms').delete().eq('id', roomId);
```

## 🐛 Troubleshooting

### "Supabase nicht konfiguriert"

- Überprüfe, ob `supabase-config.js` korrekt ausgefüllt ist
- Stelle sicher, dass URL und Key keine Leerzeichen enthalten
- Lade die Seite neu (F5)

### "Raum nicht gefunden"

- Überprüfe den Raum-Code auf Tippfehler
- Der Raum könnte bereits gelöscht sein
- Lasse den Host einen neuen Raum erstellen

### "Fehler beim Erstellen des Raums"

- Überprüfe die Supabase-Credentials
- Stelle sicher, dass die `rooms` Tabelle existiert
- Überprüfe RLS-Policies oder deaktiviere RLS

### "Realtime funktioniert nicht"

- Stelle sicher, dass Realtime für die `rooms` Tabelle aktiviert ist
- Überprüfe die Supabase-Konsole auf Fehler
- Checke die Browser-Konsole auf Fehler

### "Timer läuft nicht synchron"

- Dies kann bei Netzwerklatenzen passieren
- Deadline wird serverseitig gespeichert, daher sollte es konsistent sein
- Bei Problemen: Seite neu laden

## 📊 Storage-Bucket (Optional)

Falls du auch Klausurfragen-PDFs im Multiplayer nutzen möchtest:

1. Erstelle einen Storage-Bucket `question_sets` in Supabase
2. Aktiviere Public Access für den Bucket
3. Die Fragen werden automatisch in den Room-Settings gespeichert

## 🔐 Sicherheitshinweise

### Für Entwicklung/Testing

- RLS kann deaktiviert sein
- Anon Key kann im Frontend verwendet werden

### Für Produktion

- Aktiviere RLS mit strengeren Policies
- Implementiere User-Authentication
- Filtere Policies nach `auth.uid()`
- Setze Rate-Limits in Supabase
- Verwende Edge Functions für sensitive Operationen

## 📝 Best Practices

1. **Räume aufräumen**: Alte Räume sollten regelmäßig gelöscht werden
2. **Validierung**: Implementiere serverseitige Validierung mit Edge Functions
3. **Monitoring**: Nutze Supabase Dashboard für Monitoring
4. **Backups**: Stelle sicher, dass automatische Backups aktiviert sind
5. **Updates**: Halte die Supabase-JS-Library aktuell

## 🎨 Anpassungen

### Timer ändern

In `MultiplayerQuiz.js`, Zeile 490:
```javascript
deadline_ts: new Date(Date.now() + 30000).toISOString() // 30 Sekunden
```

### Fragenanzahl ändern

In `MultiplayerQuiz.js`, Zeile 160:
```javascript
this.questions = this.shuffleArray(this.questions).slice(0, 20); // 20 Fragen
```

### Max. Spieler ändern

In `MultiplayerQuiz.js`, Zeile 169:
```javascript
maxPlayers: 3, // 3 Spieler
```

## 📞 Support

Bei Fragen oder Problemen:

1. Überprüfe die Browser-Konsole auf Fehler
2. Checke die Supabase-Logs im Dashboard
3. Stelle sicher, dass alle Voraussetzungen erfüllt sind
4. Öffne ein Issue auf GitHub

## 🚀 Zukünftige Features

- [ ] Freunde-System
- [ ] Private Räume mit Passwort
- [ ] Turniere und Rankings
- [ ] Chat-Funktion
- [ ] Custom-Timer und Regelsets
- [ ] Replay-Funktion
- [ ] Achievements
