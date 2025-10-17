# Multiplayer Synchronization - Testing Checklist

## Pre-Testing Setup

### 1. Verify Supabase Configuration ✅

**Database Schema**:
```sql
-- Run in Supabase SQL Editor to verify
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'rooms'
ORDER BY ordinal_position;
```

**Expected Columns**:
- ✅ `id` (uuid, PK)
- ✅ `created_at` (timestamptz, default: now())
- ✅ `host_uid` (text/uuid)
- ✅ `code` (varchar(8)) ⚠️ **CRITICAL**
- ✅ `current_question_index` (integer, default: 0)
- ✅ `deadline_ts` (timestamptz, nullable)
- ✅ `players` (jsonb, default: '[]'::jsonb)
- ✅ `settings` (jsonb, default: '{}'::jsonb)
- ✅ `last_reveal` (jsonb, nullable)

### 2. Enable Realtime ✅

1. Go to Supabase Dashboard → Database → Replication
2. Find the `rooms` table
3. Toggle the switch to **ON** (should be green)
4. Verify these events are enabled:
   - ☑️ INSERT
   - ☑️ **UPDATE** (most important!)
   - ☑️ DELETE
5. Wait **2 minutes** for changes to propagate
6. Refresh your application

### 3. Verify Credentials ✅

Check `supabase-config.js`:
```javascript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';
```

## Test Scenarios

### Scenario 1: Host Creates Room

**Steps**:
1. Open application in Browser 1
2. Navigate to "1v1 Multiplayer"
3. Enter player name: "Host Player"
4. Click "➕ Raum erstellen"

**Expected Results**:
- ✅ Room is created successfully
- ✅ 8-character room code is displayed (e.g., `A1B2C3D4`)
- ✅ Host sees themselves in the player list with 👑 icon
- ✅ Host sees "(Host)" next to their name
- ✅ Start button is **disabled**
- ✅ Message shows: "⚠️ Mindestens 2 Spieler benötigt"

**Browser Console Should Show**:
```
Setting up subscription for room: [room-id]
✓ Successfully subscribed to room updates
```

### Scenario 2: Guest Joins Room

**Steps**:
1. Open application in Browser 2 (incognito/private mode or different browser)
2. Navigate to "1v1 Multiplayer"
3. Enter player name: "Guest Player"
4. Click "🚪 Raum beitreten"
5. Enter the room code from Host
6. Click OK

**Expected Results - Guest Browser**:
- ✅ Successfully joins the room
- ✅ Sees both players in the list:
  - Host Player 👑 (Host)
  - Guest Player 👤 (current player highlighted)
- ✅ Sees "Ready" button (not "Start Game")
- ✅ Button text shows: "⏳ Bereit werden"

**Expected Results - Host Browser** (should update automatically):
- ✅ Player list updates immediately to show 2 players
- ✅ Both players are visible with correct icons
- ✅ Start button is still **disabled**
- ✅ Message shows: "⏳ Warte auf alle Spieler..."
- ✅ Ready count shows: "0 / 1 Spieler bereit"

**Browser Console (Both) Should Show**:
```
Room update received: { players: [...], ... }
Player count changed: 1 -> 2
Updating waiting room display...
```

### Scenario 3: Guest Clicks Ready

**Steps**:
1. In Guest Browser (Browser 2)
2. Click the "⏳ Bereit werden" button

**Expected Results - Guest Browser**:
- ✅ Button updates **immediately** to: "✅ Bereit"
- ✅ Button style changes (shows as ready/active)
- ✅ Message shows: "✓ Du bist bereit! Warte auf den Host..."
- ✅ "✅ Bereit" badge appears next to guest name

**Expected Results - Host Browser** (should update within 1-2 seconds):
- ✅ Guest player shows "✓ Bereit" badge
- ✅ Ready count updates: "1 / 1 Spieler bereit"
- ✅ Start button becomes **enabled** (not disabled)
- ✅ Start button has pulse animation (btn-pulse class)
- ✅ Message shows: "✅ Alle Spieler sind bereit!"

**Browser Console (Guest) Should Show**:
```
(No errors)
```

**Browser Console (Host) Should Show**:
```
Room update received: { players: [...], ... }
Updating waiting room display...
```

### Scenario 4: Host Starts Game

**Steps**:
1. In Host Browser (Browser 1)
2. Verify Start button is enabled
3. Click "🎮 Spiel starten"

**Expected Results - Both Browsers**:
- ✅ Waiting room disappears
- ✅ Game screen appears
- ✅ First question is displayed
- ✅ Timer starts counting down from 30 seconds
- ✅ Both players see the same question
- ✅ Player status bar shows both players with scores and lives

### Scenario 5: Multiple Guests (Optional)

**Steps**:
1. Open application in Browser 3
2. Join the same room with a third player name
3. Have third player click "Ready"

**Expected Results**:
- ✅ All 3 players visible in both Host and Guest browsers
- ✅ Ready count shows: "X / 2 Spieler bereit" (where X is 0-2)
- ✅ Start button only enables when all non-host players are ready
- ✅ Maximum 3 players enforced (error if 4th tries to join)

## Troubleshooting Tests

### Test A: Guest Ready Button Not Working

**Symptoms**:
- Button clicks but doesn't change
- No badge appears
- Host doesn't see update

**Verify**:
1. Open Browser Console (F12) in Guest Browser
2. Click Ready button
3. Check for errors

**Expected**: No errors, should see successful database update

**If Error**: Check database schema, RLS policies, or Supabase credentials

### Test B: Host Doesn't See Guest

**Symptoms**:
- Guest joins successfully
- Guest sees themselves in room
- Host still only sees themselves
- Start button stays disabled

**Verify**:
1. Open Browser Console (F12) in Host Browser
2. Check if subscription is active

**Expected Console Output**:
```
✓ Successfully subscribed to room updates
```

**If Missing**:
1. Check Realtime is enabled in Supabase
2. Wait 2 minutes after enabling Realtime
3. Reload application
4. Check for network/firewall blocking WebSockets

**Debug Steps**:
```javascript
// In browser console of Host:
console.log('Checking subscription:', window.multiplayerQuiz?.roomChannel);
```

### Test C: Updates Are Slow

**Symptoms**:
- Updates eventually appear but take 5+ seconds
- Everything works but feels laggy

**Verify**:
1. Check network latency
2. Verify Supabase project region
3. Check if WebSockets are being used (not long-polling fallback)

**Expected**: Updates should appear within 1-2 seconds maximum

### Test D: Database Shows Player but UI Doesn't

**Symptoms**:
- Checking Supabase Dashboard shows player in `rooms.players`
- UI doesn't reflect the database state

**Verify**:
1. Check if `handleRoomUpdate` is being called
2. Check if `updateWaitingRoom` is being called
3. Verify no JavaScript errors in console

**Debug Steps**:
```javascript
// In browser console:
console.log('Current room:', window.multiplayerQuiz?.currentRoom);
console.log('Current player:', window.multiplayerQuiz?.currentPlayer);
console.log('Is host:', window.multiplayerQuiz?.isHost);
```

## Success Criteria

All of the following must be true:

- ✅ Host sees guest immediately when they join (< 2 seconds)
- ✅ Guest's ready button updates immediately when clicked
- ✅ Host sees guest's ready status update (< 2 seconds)
- ✅ Start button activates when all non-host players are ready
- ✅ No JavaScript errors in browser console
- ✅ Console shows "✓ Successfully subscribed to room updates"
- ✅ Console shows "Room update received" when changes occur
- ✅ Console shows "Player count changed: X -> Y" when players join/leave

## Code Changes Verification

### Change 1: toggleReady Function

**File**: `src/modes/multiplayer/MultiplayerQuiz.js`
**Lines**: ~555-584

**Verify**:
```javascript
// Should include:
const { data, error } = await supabase
    .from('rooms')
    .update({ players: updatedPlayers })
    .eq('id', this.currentRoom.id)
    .select()  // ← IMPORTANT: Must call .select()
    .single();

// And after success:
if (data) {
    this.currentRoom = data;  // ← Updates room state
    this.currentPlayer = data.players.find(...);  // ← Updates player state
    this.updateWaitingRoom();  // ← Refreshes UI
}
```

### Change 2: submitAnswer Function

**File**: `src/modes/multiplayer/MultiplayerQuiz.js`
**Lines**: ~792-803

**Verify**:
```javascript
// After database update, should include:
this.currentRoom.players = updatedPlayers;  // ← Updates players array
this.currentPlayer = updatedPlayers.find(...);
```

### Change 3: subscribeToRoom Documentation

**File**: `src/modes/multiplayer/MultiplayerQuiz.js`
**Lines**: ~319-324

**Verify**:
```javascript
/**
 * Subscribe to room updates via Supabase Realtime
 * This is called for both HOST and CLIENT to receive real-time updates
 * when players join, toggle ready status, or game state changes
 */
```

## Performance Benchmarks

**Realtime Update Latency**:
- Expected: < 500ms for local network
- Acceptable: < 2 seconds for internet
- Poor: > 5 seconds (check Supabase region/network)

**UI Responsiveness**:
- Button clicks should feel instant (< 100ms)
- Local state updates should be immediate
- Remote player updates should appear within 1-2 seconds

## Final Validation

Run through all scenarios 1-4 sequentially:
1. ✅ Create room
2. ✅ Join room
3. ✅ Click ready
4. ✅ Start game

If all checkboxes pass, the fix is successful! 🎉

## Common Issues Reference

| Symptom | Likely Cause | Solution |
|---------|-------------|----------|
| Host doesn't see guest | Realtime not enabled | Enable in Supabase → Database → Replication |
| Ready button doesn't work | Old code version | Verify changes 1-3 above are present |
| "Room not found" | Code column missing | Run SQL to add `code VARCHAR(8)` column |
| Slow updates | Network/region issue | Check Supabase project region |
| No subscription message | WebSocket blocked | Check firewall/network settings |
| RLS policy error | Permissions issue | Disable RLS or add proper policies |

## Support

If issues persist after following this checklist:
1. Check browser console for specific error messages
2. Check Supabase logs in Dashboard → Logs
3. Verify all prerequisites in MULTIPLAYER_MODE.md
4. See SCHNELLHILFE_MULTIPLAYER.md for quick fixes
