/**
 * Multiplayer Quiz Mode - 1v1 / 1v1v1
 * Implements real-time multiplayer gameplay using Supabase
 */

import { supabase, isSupabaseConfigured, initSupabase } from '../../../supabase-config.js';

export class MultiplayerQuiz {
    constructor(questionSource) {
        this.questionSource = questionSource;
        this.currentRoom = null;
        this.currentPlayer = null;
        this.roomSubscription = null;
        this.isHost = false;
        this.currentQuestionIndex = 0;
        this.questions = [];
        this.hasAnswered = false;
        this.supabaseLoaded = false;
    }

    /**
     * Initialize multiplayer mode
     */
    async init() {
        // Try to load Supabase dynamically
        if (!this.supabaseLoaded && isSupabaseConfigured()) {
            this.supabaseLoaded = await initSupabase();
        }
        
        if (!isSupabaseConfigured() || !this.supabaseLoaded) {
            this.renderConfigurationError();
            return;
        }
        
        await this.renderLobbyScreen();
    }

    /**
     * Render configuration error
     */
    renderConfigurationError() {
        const container = document.getElementById('multiplayerStartScreen');
        if (!container) return;

        container.innerHTML = `
            <div class="multiplayer-error-card">
                <h2>⚠️ Supabase nicht konfiguriert</h2>
                <p>Der Multiplayer-Modus benötigt eine Supabase-Konfiguration.</p>
                <div class="config-instructions">
                    <h3>Einrichtung:</h3>
                    <ol>
                        <li>Erstelle ein Supabase-Projekt auf <a href="https://supabase.com" target="_blank">supabase.com</a></li>
                        <li>Erstelle die <code>rooms</code> Tabelle mit folgenden Spalten:
                            <ul>
                                <li><code>id</code> - uuid (Primärschlüssel, Default: uuid_generate_v4())</li>
                                <li><code>created_at</code> - timestamptz (Default: now())</li>
                                <li><code>host_uid</code> - uuid (Default: auth.uid())</li>
                                <li><code>current_question_index</code> - integer (Default: 0)</li>
                                <li><code>deadline_ts</code> - timestamptz (nullable)</li>
                                <li><code>players</code> - jsonb (Default: '[]'::jsonb)</li>
                                <li><code>settings</code> - jsonb (Default: '{}'::jsonb)</li>
                                <li><code>last_reveal</code> - jsonb (nullable)</li>
                            </ul>
                        </li>
                        <li>Aktiviere Realtime für die <code>rooms</code> Tabelle</li>
                        <li>Deaktiviere RLS (Row Level Security) oder konfiguriere entsprechende Policies</li>
                        <li>Kopiere deine Project URL und Anon Key in <code>supabase-config.js</code></li>
                    </ol>
                </div>
                <button class="btn btn-outline" onclick="window.location.reload()">
                    🔄 Seite neu laden
                </button>
            </div>
        `;
    }

    /**
     * Render lobby screen
     */
    async renderLobbyScreen() {
        const container = document.getElementById('multiplayerStartScreen');
        if (!container) return;

        // Get player name from current profile
        const currentProfile = localStorage.getItem('currentProfile') || 'Spieler';

        container.innerHTML = `
            <div class="multiplayer-lobby-card">
                <h2>🎮 1v1 / 1v1v1 Multiplayer</h2>
                <p>Trete gegen andere Spieler in Echtzeit an!</p>

                <div class="player-setup">
                    <h3>👤 Spieler-Name</h3>
                    <input type="text" id="playerNameInput" class="player-name-input" 
                           value="${currentProfile}" placeholder="Dein Name" maxlength="20">
                </div>

                <div class="lobby-actions">
                    <button class="btn btn-primary btn-large" id="createRoomBtn">
                        ➕ Raum erstellen
                    </button>
                    <button class="btn btn-secondary btn-large" id="joinRoomBtn">
                        🚪 Raum beitreten
                    </button>
                </div>

                <div class="lobby-info">
                    <h3>ℹ️ Spielregeln</h3>
                    <ul>
                        <li>2-3 Spieler können gleichzeitig spielen</li>
                        <li>Alle bekommen die gleichen Fragen zur gleichen Zeit</li>
                        <li>Schnellere und richtige Antworten geben mehr Punkte</li>
                        <li>Nach jeder Frage wird die Lösung angezeigt</li>
                        <li>Am Ende gibt es ein Siegerpodest mit Platz 1-3</li>
                    </ul>
                </div>
            </div>
        `;

        this.attachLobbyListeners();
    }

    /**
     * Attach lobby event listeners
     */
    attachLobbyListeners() {
        const createBtn = document.getElementById('createRoomBtn');
        const joinBtn = document.getElementById('joinRoomBtn');

        if (createBtn) {
            createBtn.addEventListener('click', () => this.createRoom());
        }

        if (joinBtn) {
            joinBtn.addEventListener('click', () => this.showJoinRoomDialog());
        }
    }

    /**
     * Create a new room
     */
    async createRoom() {
        const playerName = document.getElementById('playerNameInput')?.value.trim() || 'Spieler';
        
        try {
            // Get selected topics and questions
            const selectedTopics = this.getSelectedTopics();
            this.questions = this.questionSource.getQuestionsByTopics(selectedTopics);
            
            if (this.questions.length === 0) {
                alert('Keine Fragen verfügbar für die gewählten Themen!');
                return;
            }

            // Shuffle and limit questions (20 questions for multiplayer)
            this.questions = this.shuffleArray(this.questions).slice(0, 20);
            
            // Shuffle answer options
            this.questions = this.questions.map(q => this.shuffleAnswerOptions(q));

            // Create player object
            this.currentPlayer = {
                id: this.generatePlayerId(),
                name: playerName,
                score: 0,
                lives: 3,
                answers: [],
                isReady: false
            };

            // Create room in Supabase
            const { data, error } = await supabase
                .from('rooms')
                .insert({
                    host_uid: this.currentPlayer.id,
                    players: [this.currentPlayer],
                    settings: {
                        maxPlayers: 3,
                        timerPerQuestion: 30,
                        questionCount: this.questions.length,
                        questions: this.questions.map(q => ({
                            id: q.id,
                            question: q.question,
                            choices: q.choices || q.options,
                            correctIndex: q.correctIndex !== undefined ? q.correctIndex : q.correctIndices?.[0],
                            topic: q.topic
                        }))
                    },
                    current_question_index: 0,
                    last_reveal: null
                })
                .select()
                .single();

            if (error) {
                console.error('Error creating room:', error);
                alert('Fehler beim Erstellen des Raums: ' + error.message);
                return;
            }

            this.currentRoom = data;
            this.isHost = true;

            // 8-stelligen Code aus der UUID generieren, in DB speichern und dem currentRoom zuweisen
            const roomCode = data.id.substring(0, 8).toUpperCase();
            await supabase.from('rooms').update({ code: roomCode }).eq('id', data.id);
            this.currentRoom.code = roomCode;


            // Subscribe to room updates
            await this.subscribeToRoom(data.id);

            // Show waiting room
            this.renderWaitingRoom();

        } catch (error) {
            console.error('Error creating room:', error);
            alert('Fehler beim Erstellen des Raums: ' + error.message);
        }
    }

    /**
     * Show join room dialog
     */
    showJoinRoomDialog() {
        const roomCode = prompt('Gib den Raum-Code ein:');
        
        if (roomCode) {
            this.joinRoom(roomCode.trim().toUpperCase());
        }
    }

    /**
     * Join an existing room
     */
    async joinRoom(roomId) {
        const playerName = document.getElementById('playerNameInput')?.value.trim() || 'Spieler';
        
        try {
            // Get room data
            const { data: room, error: fetchError } = await supabase
                .from('rooms')
                .select('*')
                .eq('code', roomId)
                .single();

            if (fetchError || !room) {
                alert('Raum nicht gefunden! Bitte überprüfe den Code.');
                return;
            }

            // Check if room is full
            if (room.players.length >= room.settings.maxPlayers) {
                alert('Dieser Raum ist voll!');
                return;
            }

            // Check if game already started
            if (room.current_question_index > 0) {
                alert('Das Spiel hat bereits begonnen!');
                return;
            }

            // Create player object
            this.currentPlayer = {
                id: this.generatePlayerId(),
                name: playerName,
                score: 0,
                lives: 3,
                answers: [],
                isReady: false
            };

            // Add player to room
            const updatedPlayers = [...room.players, this.currentPlayer];
            
            const { error: updateError } = await supabase
                .from('rooms')
                .update({ players: updatedPlayers })
                .eq('id', room.id);

            if (updateError) {
                console.error('Error joining room:', updateError);
                alert('Fehler beim Beitreten: ' + updateError.message);
                return;
            }

            this.currentRoom = { ...room, players: updatedPlayers };
            this.isHost = false;
            this.questions = room.settings.questions;

            // Subscribe to room updates
            await this.subscribeToRoom(room.id);

            // Show waiting room
            this.renderWaitingRoom();

        } catch (error) {
            console.error('Error joining room:', error);
            alert('Fehler beim Beitreten: ' + error.message);
        }
    }

    /**
     * Subscribe to room updates via Supabase Realtime
     */
    async subscribeToRoom(roomId) {
        // Unsubscribe from previous subscription if exists
        if (this.roomSubscription) {
            await supabase.removeChannel(this.roomSubscription);
        }

        // Subscribe to room changes
        this.roomSubscription = supabase
            .channel(`room:${roomId}`)
            .on('postgres_changes', 
                { 
                    event: '*', 
                    schema: 'public', 
                    table: 'rooms',
                    filter: `id=eq.${roomId}`
                }, 
                (payload) => {
                    this.handleRoomUpdate(payload.new);
                }
            )
            .subscribe();
    }

    /**
     * Handle room update from Supabase
     */
    handleRoomUpdate(roomData) {
        if (!roomData) return;

        const oldRoom = this.currentRoom;
        this.currentRoom = roomData;

        // Update waiting room if we're still there
        if (roomData.current_question_index === 0) {
            this.updateWaitingRoom();
        } else {
            // Game started, show game screen
            if (oldRoom.current_question_index === 0 && roomData.current_question_index > 0) {
                this.renderGameScreen();
            } else if (roomData.last_reveal && roomData.last_reveal.timestamp !== oldRoom?.last_reveal?.timestamp) {
                // New reveal, show it
                this.showRevealScreen();
            } else {
                // Update current question display
                this.updateGameScreen();
            }
        }
    }

    /**
     * Render waiting room
     */
    renderWaitingRoom() {
        const container = document.getElementById('multiplayerStartScreen');
        if (!container) return;

        const roomCode = this.currentRoom.code || this.currentRoom.id.substring(0, 8).toUpperCase();
        const players = this.currentRoom.players || [];
        const maxPlayers = this.currentRoom.settings.maxPlayers || 3;

        container.innerHTML = `
            <div class="waiting-room-card">
                <h2>🚪 Warteraum</h2>
                
                <div class="room-code-display">
                    <div class="room-code-label">Raum-Code:</div>
                    <div class="room-code">${roomCode}</div>
                    <button class="btn btn-small btn-outline" onclick="navigator.clipboard.writeText('${roomCode}')">
                        📋 Kopieren
                    </button>
                </div>

                <div class="players-waiting">
                    <h3>Spieler (${players.length}/${maxPlayers}):</h3>
                    <div class="player-list">
                        ${players.map((p, i) => `
                            <div class="player-item ${p.id === this.currentPlayer.id ? 'current-player' : ''}">
                                <span class="player-icon">${i === 0 ? '👑' : '👤'}</span>
                                <span class="player-name">${p.name}</span>
                                ${p.isReady ? '<span class="ready-badge">✓ Bereit</span>' : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="waiting-actions">
                    ${this.isHost ? `
                        <button class="btn btn-primary btn-large" id="startGameBtn"
                                ${players.length < 2 ? 'disabled' : ''}>
                            🎮 Spiel starten
                        </button>
                        ${players.length < 2 ? '<p class="info-text">Mindestens 2 Spieler benötigt</p>' : ''}
                    ` : `
                        <button class="btn btn-secondary" id="readyBtn">
                            ✓ Bereit
                        </button>
                        <p class="info-text">Warte auf den Host...</p>
                    `}
                    <button class="btn btn-outline" id="leaveRoomBtn">
                        🚪 Raum verlassen
                    </button>
                </div>
            </div>
        `;

        this.attachWaitingRoomListeners();
    }

    /**
     * Update waiting room display
     */
    updateWaitingRoom() {
        this.renderWaitingRoom();
    }

    /**
     * Attach waiting room event listeners
     */
    attachWaitingRoomListeners() {
        const startBtn = document.getElementById('startGameBtn');
        const readyBtn = document.getElementById('readyBtn');
        const leaveBtn = document.getElementById('leaveRoomBtn');

        if (startBtn) {
            startBtn.addEventListener('click', () => this.startGame());
        }

        if (readyBtn) {
            readyBtn.addEventListener('click', () => this.toggleReady());
        }

        if (leaveBtn) {
            leaveBtn.addEventListener('click', () => this.leaveRoom());
        }
    }

    /**
     * Start the game (host only)
     */
    async startGame() {
        if (!this.isHost) return;

        try {
            // Move to first question
            const { error } = await supabase
                .from('rooms')
                .update({ 
                    current_question_index: 1,
                    deadline_ts: new Date(Date.now() + 30000).toISOString() // 30 seconds from now
                })
                .eq('id', this.currentRoom.id);

            if (error) {
                console.error('Error starting game:', error);
                alert('Fehler beim Starten: ' + error.message);
            }
        } catch (error) {
            console.error('Error starting game:', error);
        }
    }

    /**
     * Toggle ready status
     */
    async toggleReady() {
        try {
            const updatedPlayers = this.currentRoom.players.map(p => 
                p.id === this.currentPlayer.id 
                    ? { ...p, isReady: !p.isReady }
                    : p
            );

            const { error } = await supabase
                .from('rooms')
                .update({ players: updatedPlayers })
                .eq('id', this.currentRoom.id);

            if (error) {
                console.error('Error toggling ready:', error);
            }
        } catch (error) {
            console.error('Error toggling ready:', error);
        }
    }

    /**
     * Leave room
     */
    async leaveRoom() {
        if (!confirm('Möchtest du den Raum wirklich verlassen?')) {
            return;
        }

        try {
            // Remove player from room
            const updatedPlayers = this.currentRoom.players.filter(p => p.id !== this.currentPlayer.id);

            if (updatedPlayers.length === 0 || (this.isHost && updatedPlayers.length > 0)) {
                // If last player or host leaving, delete room
                await supabase
                    .from('rooms')
                    .delete()
                    .eq('id', this.currentRoom.id);
            } else {
                // Update room without this player
                await supabase
                    .from('rooms')
                    .update({ players: updatedPlayers })
                    .eq('id', this.currentRoom.id);
            }

            // Unsubscribe and return to lobby
            if (this.roomSubscription) {
                await supabase.removeChannel(this.roomSubscription);
                this.roomSubscription = null;
            }

            this.currentRoom = null;
            this.currentPlayer = null;
            this.isHost = false;

            await this.renderLobbyScreen();

        } catch (error) {
            console.error('Error leaving room:', error);
        }
    }

    /**
     * Render game screen
     */
    renderGameScreen() {
        const container = document.getElementById('multiplayerGameScreen');
        if (!container) return;

        container.classList.add('active');
        document.getElementById('multiplayerStartScreen')?.classList.remove('active');

        this.currentQuestionIndex = this.currentRoom.current_question_index - 1;
        this.hasAnswered = false;

        this.displayQuestion();
    }

    /**
     * Display current question
     */
    displayQuestion() {
        const container = document.getElementById('multiplayerQuestionContainer');
        if (!container) return;

        const question = this.questions[this.currentQuestionIndex];
        if (!question) return;

        // Calculate time remaining
        const deadline = new Date(this.currentRoom.deadline_ts);
        const now = new Date();
        const timeRemaining = Math.max(0, Math.ceil((deadline - now) / 1000));

        container.innerHTML = `
            <div class="multiplayer-question-header">
                <div class="question-progress">Frage ${this.currentQuestionIndex + 1} / ${this.questions.length}</div>
                <div class="question-timer" id="multiplayerTimer">⏱️ ${timeRemaining}s</div>
            </div>

            <div class="players-bar">
                ${this.currentRoom.players.map(p => `
                    <div class="player-status ${p.id === this.currentPlayer.id ? 'current' : ''}">
                        <span class="player-name">${p.name}</span>
                        <span class="player-score">💎 ${p.score}</span>
                        <span class="player-lives">${'❤️'.repeat(p.lives)}</span>
                        ${p.answers[this.currentQuestionIndex] ? '<span class="answered-badge">✓</span>' : ''}
                    </div>
                `).join('')}
            </div>

            <div class="question-card">
                <h2 class="question-text">${question.question}</h2>
                <div class="topic-badge">${question.topic}</div>

                <div class="answer-choices" id="multiplayerAnswerChoices">
                    ${(question.choices || question.options || []).map((choice, idx) => `
                        <button class="answer-choice" data-index="${idx}"
                                ${this.hasAnswered ? 'disabled' : ''}>
                            <span class="choice-number">${idx + 1}</span>
                            <span class="choice-text">${choice}</span>
                        </button>
                    `).join('')}
                </div>

                ${this.hasAnswered ? `
                    <div class="waiting-message">
                        ⏳ Warte auf andere Spieler...
                    </div>
                ` : ''}
            </div>
        `;

        // Start timer countdown
        this.startQuestionTimer();

        // Attach answer listeners
        if (!this.hasAnswered) {
            document.querySelectorAll('#multiplayerAnswerChoices .answer-choice').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = parseInt(e.currentTarget.dataset.index);
                    this.submitAnswer(index);
                });
            });
        }
    }

    /**
     * Start question timer countdown
     */
    startQuestionTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        this.timerInterval = setInterval(() => {
            const deadline = new Date(this.currentRoom.deadline_ts);
            const now = new Date();
            const timeRemaining = Math.max(0, Math.ceil((deadline - now) / 1000));

            const timerEl = document.getElementById('multiplayerTimer');
            if (timerEl) {
                timerEl.textContent = `⏱️ ${timeRemaining}s`;
                
                if (timeRemaining <= 5) {
                    timerEl.classList.add('timer-warning');
                }
            }

            if (timeRemaining === 0) {
                clearInterval(this.timerInterval);
                
                // Auto-submit if not answered
                if (!this.hasAnswered && this.isHost) {
                    this.checkAndReveal();
                }
            }
        }, 100);
    }

    /**
     * Submit answer
     */
    async submitAnswer(selectedIndex) {
        if (this.hasAnswered) return;

        this.hasAnswered = true;
        const question = this.questions[this.currentQuestionIndex];
        
        // Calculate time taken
        const deadline = new Date(this.currentRoom.deadline_ts);
        const now = new Date();
        const timeRemaining = Math.max(0, Math.ceil((deadline - now) / 1000));
        const timeTaken = 30 - timeRemaining;

        // Check if correct
        const isCorrect = selectedIndex === (question.correctIndex !== undefined ? question.correctIndex : question.correctIndices?.[0]);

        // Calculate points
        let points = 0;
        if (isCorrect) {
            points = 100 + timeRemaining; // 100 base + time bonus
        }

        // Update player in room
        try {
            const updatedPlayers = this.currentRoom.players.map(p => {
                if (p.id === this.currentPlayer.id) {
                    const newAnswers = [...p.answers];
                    newAnswers[this.currentQuestionIndex] = {
                        selectedIndex,
                        isCorrect,
                        timeTaken,
                        points
                    };
                    
                    return {
                        ...p,
                        score: p.score + points,
                        lives: isCorrect ? p.lives : Math.max(0, p.lives - 1),
                        answers: newAnswers
                    };
                }
                return p;
            });

            const { error } = await supabase
                .from('rooms')
                .update({ players: updatedPlayers })
                .eq('id', this.currentRoom.id);

            if (error) {
                console.error('Error submitting answer:', error);
            }

            // Update local player
            this.currentPlayer = updatedPlayers.find(p => p.id === this.currentPlayer.id);

            // Show selected answer
            const choices = document.querySelectorAll('#multiplayerAnswerChoices .answer-choice');
            choices[selectedIndex].classList.add(isCorrect ? 'selected-correct' : 'selected-wrong');
            choices.forEach(btn => btn.disabled = true);

            // Update display
            this.displayQuestion();

            // Check if all players answered (host only)
            if (this.isHost) {
                this.checkAndReveal();
            }

        } catch (error) {
            console.error('Error submitting answer:', error);
        }
    }

    /**
     * Check if all players answered and trigger reveal (host only)
     */
    async checkAndReveal() {
        if (!this.isHost) return;

        const allAnswered = this.currentRoom.players.every(p => 
            p.answers[this.currentQuestionIndex] !== undefined
        );

        const deadline = new Date(this.currentRoom.deadline_ts);
        const now = new Date();
        const timeExpired = now >= deadline;

        if (allAnswered || timeExpired) {
            // Prepare reveal data
            const question = this.questions[this.currentQuestionIndex];
            const reveal = {
                questionIndex: this.currentQuestionIndex,
                correctIndex: question.correctIndex !== undefined ? question.correctIndex : question.correctIndices?.[0],
                timestamp: new Date().toISOString(),
                playerResults: this.currentRoom.players.map(p => ({
                    id: p.id,
                    name: p.name,
                    answer: p.answers[this.currentQuestionIndex],
                    score: p.score,
                    lives: p.lives
                }))
            };

            // Update room with reveal
            const { error } = await supabase
                .from('rooms')
                .update({ last_reveal: reveal })
                .eq('id', this.currentRoom.id);

            if (error) {
                console.error('Error revealing answer:', error);
            }
        }
    }

    /**
     * Show reveal screen
     */
    showRevealScreen() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        const container = document.getElementById('multiplayerQuestionContainer');
        if (!container) return;

        const reveal = this.currentRoom.last_reveal;
        const question = this.questions[reveal.questionIndex];
        const correctChoice = (question.choices || question.options)[reveal.correctIndex];

        // Sort players by score for display
        const sortedResults = [...reveal.playerResults].sort((a, b) => b.score - a.score);

        container.innerHTML = `
            <div class="reveal-screen">
                <h2>📊 Auflösung</h2>

                <div class="correct-answer-display">
                    <div class="correct-label">✅ Richtige Antwort:</div>
                    <div class="correct-text">${correctChoice}</div>
                </div>

                <div class="player-results">
                    ${sortedResults.map((result, idx) => {
                        const isCurrentPlayer = result.id === this.currentPlayer.id;
                        const answer = result.answer;
                        const wasCorrect = answer?.isCorrect;
                        
                        return `
                            <div class="result-row ${isCurrentPlayer ? 'current-player' : ''} ${wasCorrect ? 'correct' : 'wrong'}">
                                <div class="result-rank">${idx + 1}.</div>
                                <div class="result-player">
                                    <div class="result-name">${result.name}</div>
                                    <div class="result-answer">
                                        ${answer ? (wasCorrect ? '✅' : '❌') : '⏱️ Timeout'}
                                        ${answer ? `+${answer.points} Punkte` : ''}
                                    </div>
                                </div>
                                <div class="result-score">
                                    <div class="score-value">💎 ${result.score}</div>
                                    <div class="lives-value">${'❤️'.repeat(result.lives)}</div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>

                ${this.isHost ? `
                    <button class="btn btn-primary btn-large" id="nextQuestionBtn">
                        ➡️ Nächste Frage
                    </button>
                ` : `
                    <div class="waiting-message">
                        ⏳ Warte auf den Host...
                    </div>
                `}
            </div>
        `;

        // Attach next question listener
        const nextBtn = document.getElementById('nextQuestionBtn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextQuestion());
        }
    }

    /**
     * Move to next question (host only)
     */
    async nextQuestion() {
        if (!this.isHost) return;

        const nextIndex = this.currentRoom.current_question_index + 1;

        if (nextIndex > this.questions.length) {
            // Game finished, show podium
            await this.showPodium();
        } else {
            // Move to next question
            try {
                const { error } = await supabase
                    .from('rooms')
                    .update({ 
                        current_question_index: nextIndex,
                        deadline_ts: new Date(Date.now() + 30000).toISOString(),
                        last_reveal: null
                    })
                    .eq('id', this.currentRoom.id);

                if (error) {
                    console.error('Error moving to next question:', error);
                }
            } catch (error) {
                console.error('Error moving to next question:', error);
            }
        }
    }

    /**
     * Update game screen
     */
    updateGameScreen() {
        if (this.currentRoom.last_reveal) {
            this.showRevealScreen();
        } else {
            this.displayQuestion();
        }
    }

    /**
     * Show winner podium
     */
    async showPodium() {
        const container = document.getElementById('multiplayerGameScreen');
        if (!container) return;

        // Sort players by score
        const sortedPlayers = [...this.currentRoom.players].sort((a, b) => b.score - a.score);

        container.innerHTML = `
            <div class="podium-screen">
                <h2>🏆 Siegerpodest</h2>

                <div class="podium">
                    ${sortedPlayers.length >= 2 ? `
                        <div class="podium-place second">
                            <div class="place-medal">🥈</div>
                            <div class="place-player">${sortedPlayers[1].name}</div>
                            <div class="place-score">💎 ${sortedPlayers[1].score}</div>
                            <div class="place-number">2</div>
                        </div>
                    ` : ''}
                    
                    ${sortedPlayers.length >= 1 ? `
                        <div class="podium-place first">
                            <div class="place-medal">🥇</div>
                            <div class="place-player">${sortedPlayers[0].name}</div>
                            <div class="place-score">💎 ${sortedPlayers[0].score}</div>
                            <div class="place-number">1</div>
                        </div>
                    ` : ''}
                    
                    ${sortedPlayers.length >= 3 ? `
                        <div class="podium-place third">
                            <div class="place-medal">🥉</div>
                            <div class="place-player">${sortedPlayers[2].name}</div>
                            <div class="place-score">💎 ${sortedPlayers[2].score}</div>
                            <div class="place-number">3</div>
                        </div>
                    ` : ''}
                </div>

                <div class="final-stats">
                    <h3>📊 Endstatistik</h3>
                    ${sortedPlayers.map((player, idx) => {
                        const correctAnswers = player.answers.filter(a => a?.isCorrect).length;
                        const accuracy = player.answers.length > 0 
                            ? Math.round((correctAnswers / player.answers.length) * 100) 
                            : 0;

                        return `
                            <div class="stat-row">
                                <span class="stat-rank">${idx + 1}.</span>
                                <span class="stat-name">${player.name}</span>
                                <span class="stat-details">
                                    ${correctAnswers}/${player.answers.length} richtig (${accuracy}%)
                                </span>
                            </div>
                        `;
                    }).join('')}
                </div>

                <div class="podium-actions">
                    <button class="btn btn-primary" id="playAgainMultiBtn">
                        🔄 Nochmal spielen
                    </button>
                    <button class="btn btn-outline" id="backToLobbyBtn">
                        🏠 Zurück zur Lobby
                    </button>
                </div>
            </div>
        `;

        // Attach listeners
        document.getElementById('playAgainMultiBtn')?.addEventListener('click', () => {
            if (this.isHost) {
                // Reset room to start
                this.resetRoom();
            } else {
                alert('Nur der Host kann das Spiel neu starten.');
            }
        });

        document.getElementById('backToLobbyBtn')?.addEventListener('click', () => {
            this.leaveRoom();
        });
    }

    /**
     * Reset room for new game (host only)
     */
    async resetRoom() {
        if (!this.isHost) return;

        try {
            // Reset all players
            const resetPlayers = this.currentRoom.players.map(p => ({
                ...p,
                score: 0,
                lives: 3,
                answers: [],
                isReady: false
            }));

            const { error } = await supabase
                .from('rooms')
                .update({ 
                    players: resetPlayers,
                    current_question_index: 0,
                    last_reveal: null,
                    deadline_ts: null
                })
                .eq('id', this.currentRoom.id);

            if (error) {
                console.error('Error resetting room:', error);
            }
        } catch (error) {
            console.error('Error resetting room:', error);
        }
    }

    /**
     * Get selected topics from main filter
     */
    getSelectedTopics() {
        const activeBtn = document.querySelector('.topic-btn.active');
        if (!activeBtn) return ['all'];
        
        const topic = activeBtn.dataset.topic;
        return topic === 'all' ? ['all'] : [topic];
    }

    /**
     * Generate unique player ID
     */
    generatePlayerId() {
        return 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Shuffle array
     */
    shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    /**
     * Shuffle answer options
     */
    shuffleAnswerOptions(question) {
        if (!question.choices && !question.options) {
            return question;
        }

        const choices = question.choices || question.options;
        const correctIndex = question.correctIndex !== undefined ? question.correctIndex : question.correctIndices?.[0];

        const indexedChoices = choices.map((choice, index) => ({
            choice,
            isCorrect: index === correctIndex
        }));

        const shuffled = this.shuffleArray(indexedChoices);

        return {
            ...question,
            choices: shuffled.map(item => item.choice),
            correctIndex: shuffled.findIndex(item => item.isCorrect)
        };
    }

    /**
     * Cleanup on destroy
     */
    async destroy() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        if (this.roomSubscription) {
            await supabase.removeChannel(this.roomSubscription);
        }
    }
}
