# 🚨 Schnellhilfe: Host sieht keine Spieler

## Problem

- Host erstellt Raum ✅
- Spieler tritt bei (sieht sich selbst im Raum) ✅
- **Host sieht den Spieler NICHT** ❌
- Host kann Spiel nicht starten ❌

## Ursache: Supabase Realtime ist nicht aktiviert!

## Lösung (3 Minuten)

### Schritt 1: Supabase öffnen

1. Gehe zu [supabase.com](https://supabase.com)
2. Öffne dein Projekt
3. Klicke links auf **Database**
4. Klicke auf **Replication**

### Schritt 2: Realtime aktivieren

1. Finde die Zeile mit `rooms` in der Tabelle
2. Klicke auf den **Schalter rechts** (OFF → ON)
3. ✅ Der Schalter sollte jetzt **grün/aktiv** sein

### Schritt 3: Events überprüfen

Stelle sicher, dass alle drei Events aktiviert sind:
- ☑️ INSERT
- ☑️ **UPDATE** (besonders wichtig!)
- ☑️ DELETE

### Schritt 4: Warten und neu laden

1. Warte **2 Minuten**
2. Lade deine App neu (F5)
3. Teste erneut

## Alternative: Code-Spalte fehlt

Falls der Fehler weiterhin besteht:

### SQL ausführen

1. Gehe in Supabase zu **SQL Editor**
2. Erstelle eine neue Query
3. Kopiere und führe aus:

```sql
-- Füge die code Spalte hinzu
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS code VARCHAR(8);

-- Erstelle Index
CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(code);
```

4. Klicke auf **Run**

## Test

1. **Host**: Erstelle neuen Raum
2. **Spieler**: Trete mit Code bei
3. **Host**: Sollte jetzt den Spieler sehen! ✅
4. **Spieler**: Klicke "Bereit"
5. **Host**: Sollte "✓ Bereit" Badge sehen
6. **Host**: Button "Spiel starten" sollte aktiv werden

## Debug: Browser-Konsole

Öffne die Konsole (F12) beim Testen:

**Was du sehen solltest:**
```
✓ Successfully subscribed to room updates
Room update received: {...}
Player count changed: 1 -> 2
Updating waiting room display...
```

**Wenn das nicht erscheint:**
→ Realtime ist NICHT aktiviert!

## Immer noch Probleme?

Siehe vollständige Anleitung in `SUPABASE_SETUP_GUIDE.md`

---

**TL;DR**: Gehe zu Supabase → Database → Replication → Aktiviere `rooms` Tabelle → Warte 2 Min → Reload
