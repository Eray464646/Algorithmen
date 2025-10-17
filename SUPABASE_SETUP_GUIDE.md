# Supabase Setup Guide für Multiplayer Mode

## ⚠️ Wichtig: Datenbank-Konfiguration

Dein Problem liegt höchstwahrscheinlich an der **Supabase-Datenbank-Konfiguration**. Folge dieser Anleitung Schritt für Schritt:

## 1. Datenbank-Schema überprüfen

Die `rooms` Tabelle benötigt **alle** diese Spalten:

```sql
-- Vollständiges Schema (führe dies in Supabase SQL Editor aus)
CREATE TABLE IF NOT EXISTS rooms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    host_uid UUID NOT NULL,
    code VARCHAR(8),  -- ⚠️ WICHTIG: Diese Spalte wurde hinzugefügt!
    current_question_index INTEGER DEFAULT 0,
    deadline_ts TIMESTAMPTZ,
    players JSONB DEFAULT '[]'::jsonb,
    settings JSONB DEFAULT '{}'::jsonb,
    last_reveal JSONB
);

-- Indizes für bessere Performance
CREATE INDEX IF NOT EXISTS idx_rooms_created_at ON rooms(created_at);
CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(code);  -- ⚠️ WICHTIG: Neuer Index!
```

### Spalte nachträglich hinzufügen

Falls die Tabelle bereits existiert **ohne** die `code` Spalte:

```sql
-- Füge die code Spalte hinzu
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS code VARCHAR(8);

-- Erstelle den Index
CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(code);
```

## 2. Realtime aktivieren (KRITISCH!)

**Das ist der häufigste Grund für das Problem!**

1. Gehe in Supabase zu **Database** → **Replication**
2. Finde die `rooms` Tabelle in der Liste
3. Klicke auf den Toggle-Schalter, um Realtime zu **aktivieren**
4. Stelle sicher, dass alle drei Ereignisse aktiviert sind:
   - ☑️ INSERT
   - ☑️ UPDATE (besonders wichtig!)
   - ☑️ DELETE
5. Warte 1-2 Minuten, bis die Änderungen aktiv sind
6. Lade deine App neu (F5)

### Realtime überprüfen

Nach der Aktivierung solltest du in der Browser-Konsole sehen:

```
Subscription status: SUBSCRIBED
✓ Successfully subscribed to room updates
```

Wenn das nicht erscheint, ist Realtime **nicht korrekt konfiguriert**.

## 3. RLS (Row Level Security) konfigurieren

Du hast zwei Optionen:

### Option A: RLS deaktivieren (schnell, für Tests)

```sql
ALTER TABLE rooms DISABLE ROW LEVEL SECURITY;
```

### Option B: RLS-Policies erstellen (empfohlen)

```sql
-- RLS aktivieren
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- Alle können Räume lesen
CREATE POLICY "Enable read access for all users" ON rooms
    FOR SELECT USING (true);

-- Alle können Räume erstellen
CREATE POLICY "Enable insert for all users" ON rooms
    FOR INSERT WITH CHECK (true);

-- Alle können Räume aktualisieren (wichtig für Spieler-Updates!)
CREATE POLICY "Enable update for all users" ON rooms
    FOR UPDATE USING (true);

-- Alle können Räume löschen
CREATE POLICY "Enable delete for all users" ON rooms
    FOR DELETE USING (true);
```

## 4. Test durchführen

1. **Host**: Erstelle einen neuen Raum
2. Öffne die Browser-Konsole (F12) und schaue nach:
   ```
   Setting up subscription for room: [uuid]
   Subscription status: SUBSCRIBED
   ✓ Successfully subscribed to room updates
   ```
3. **Spieler**: Trete dem Raum bei (anderer Browser/Tab)
4. **Host**: In der Konsole sollte erscheinen:
   ```
   Room update received: [...]
   Player count changed: 1 -> 2
   Updating waiting room display...
   ```
5. Wenn diese Meldungen erscheinen, funktioniert alles!

## 5. Häufige Fehler und Lösungen

### Fehler: "column code does not exist"

**Problem**: Die `code` Spalte fehlt in der Datenbank

**Lösung**:
```sql
ALTER TABLE rooms ADD COLUMN code VARCHAR(8);
CREATE INDEX idx_rooms_code ON rooms(code);
```

### Fehler: Host sieht keine neuen Spieler

**Problem**: Realtime ist nicht aktiviert oder funktioniert nicht

**Lösung**:
1. Aktiviere Realtime für `rooms` (siehe Schritt 2)
2. Überprüfe RLS-Policies (UPDATE muss erlaubt sein)
3. Warte 2 Minuten und lade die App neu
4. Öffne Browser-Konsole und schaue nach Fehlern

### Browser-Konsole zeigt "Subscription status: CHANNEL_ERROR"

**Problem**: Realtime-Verbindung kann nicht hergestellt werden

**Mögliche Ursachen**:
- Realtime ist nicht aktiviert für die Tabelle
- WebSocket-Verbindungen werden blockiert (Firewall/Proxy)
- Falsche Supabase-URL oder Key

**Lösung**:
1. Überprüfe Realtime-Einstellungen (Schritt 2)
2. Teste auf einem anderen Netzwerk
3. Überprüfe `supabase-config.js` auf Tippfehler

### Ready-Status wird nicht angezeigt

**Problem**: Realtime-Updates kommen nicht an

**Lösung**:
- Der Ready-Status erscheint als grüner Badge "✓ Bereit" neben dem Spielernamen
- Wenn nicht sichtbar: Überprüfe Realtime (siehe oben)
- Der Host muss warten, bis ALLE Nicht-Host-Spieler bereit sind
- Schaue in die Browser-Konsole nach "Room update received" Meldungen

## 6. Debug-Modus aktivieren

Die App hat jetzt erweiterte Debug-Logs. Öffne die Browser-Konsole (F12) und schaue nach:

```
✓ Subscription erfolgreich
✓ Room update received
✓ Player count changed
✓ Updating waiting room display
```

Wenn diese Meldungen nicht erscheinen, liegt das Problem bei Supabase Realtime.

## 7. Zusammenfassung der häufigsten Probleme

| Problem | Ursache | Lösung |
|---------|---------|--------|
| Host sieht keine Spieler | Realtime nicht aktiviert | Database → Replication → rooms aktivieren |
| "code does not exist" | Spalte fehlt | `ALTER TABLE rooms ADD COLUMN code VARCHAR(8)` |
| Spieler kann nicht beitreten | RLS blockiert | RLS deaktivieren oder Policies erstellen |
| Updates kommen nicht an | UPDATE-Events nicht aktiviert | Realtime: alle Events (INSERT, UPDATE, DELETE) aktivieren |
| WebSocket-Fehler | Netzwerk blockiert | Anderes Netzwerk testen |

## 8. Checkliste vor dem Test

- [ ] `code` Spalte existiert in der `rooms` Tabelle
- [ ] Realtime ist für `rooms` aktiviert (Database → Replication)
- [ ] Alle Events (INSERT, UPDATE, DELETE) sind aktiviert
- [ ] RLS ist deaktiviert ODER Policies sind korrekt konfiguriert
- [ ] Browser-Konsole (F12) ist offen zum Debuggen
- [ ] Nach Änderungen 2 Minuten gewartet und App neu geladen

## 9. Support

Wenn das Problem weiterhin besteht:

1. Öffne die Browser-Konsole (F12)
2. Erstelle einen Screenshot von allen Fehlermeldungen
3. Gehe in Supabase → Database → Replication und mache einen Screenshot
4. Gehe in Supabase → Table Editor → rooms und überprüfe, ob alle Spalten existieren
5. Teile diese Informationen zur weiteren Diagnose

---

**Wichtig**: Die meisten Probleme werden durch eine **fehlende Realtime-Aktivierung** oder **fehlende `code` Spalte** verursacht. Überprüfe diese beiden Punkte zuerst!
