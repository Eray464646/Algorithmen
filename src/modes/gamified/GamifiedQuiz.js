/**
 * Gamified Quiz Mode - Main Component
 * Integrates game logic with UI
 */

import { GameState, HighscoreManager, SettingsManager } from './gameLogic.js';

export class GamifiedQuiz {
    constructor(questionSource) {
        this.questionSource = questionSource;
        this.gameState = null;
        this.highscoreManager = new HighscoreManager();
        this.settingsManager = new SettingsManager();
        
        this.currentQuestions = [];
        this.currentQuestionIndex = 0;
        this.selectedChoiceIndex = null;
        this.isPaused = false;
        
        this.setupEventListeners();
    }

    /**
     * Initialize the gamified quiz screen
     */
    init() {
        this.renderStartScreen();
        
        // Expose deletePDF method globally for inline handlers
        window.deletePDF = (hash) => this.deletePDF(hash);
    }

    /**
     * Render start screen with settings
     */
    renderStartScreen() {
        const container = document.getElementById('gamifiedStartScreen');
        if (!container) return;

        const settings = this.settingsManager.getSettings();
        const highscore = this.highscoreManager.getGlobalHighscore();

        container.innerHTML = `
            <div class="gamified-start-card">
                <h2>🎮 Gamified Quiz</h2>
                <p>Teste dein Wissen im Spielmodus mit Timer, Punkten und Streaks!</p>

                ${highscore ? `
                    <div class="highscore-display">
                        <div class="highscore-label">🏆 Globaler Highscore</div>
                        <div class="highscore-value">${highscore.score} Punkte</div>
                        <div class="highscore-stats">
                            Streak: ${highscore.stats.streak} | 
                            Genauigkeit: ${highscore.stats.accuracy}%
                        </div>
                    </div>
                ` : ''}

                <div class="gamified-settings">
                    <h3>⚙️ Spieleinstellungen</h3>
                    
                    <div class="setting-group">
                        <label for="timerSelect">⏱️ Timer pro Frage:</label>
                        <select id="timerSelect">
                            <option value="15" ${settings.timerDuration === 15 ? 'selected' : ''}>15 Sekunden</option>
                            <option value="30" ${settings.timerDuration === 30 ? 'selected' : ''}>30 Sekunden</option>
                            <option value="60" ${settings.timerDuration === 60 ? 'selected' : ''}>60 Sekunden</option>
                        </select>
                    </div>

                    <div class="setting-group">
                        <label for="questionCountSelect">📝 Anzahl Fragen:</label>
                        <select id="questionCountSelect">
                            <option value="10" ${settings.questionCount === 10 ? 'selected' : ''}>10 Fragen</option>
                            <option value="20" ${settings.questionCount === 20 ? 'selected' : ''}>20 Fragen</option>
                            <option value="30" ${settings.questionCount === 30 ? 'selected' : ''}>30 Fragen</option>
                            <option value="50" ${settings.questionCount === 50 ? 'selected' : ''}>50 Fragen</option>
                        </select>
                    </div>

                    <div class="setting-group">
                        <label for="livesSelect">❤️ Leben:</label>
                        <select id="livesSelect">
                            <option value="1" ${settings.lives === 1 ? 'selected' : ''}>1 Leben</option>
                            <option value="3" ${settings.lives === 3 ? 'selected' : ''}>3 Leben</option>
                            <option value="5" ${settings.lives === 5 ? 'selected' : ''}>5 Leben</option>
                        </select>
                    </div>
                </div>

                <div class="gamified-info">
                    <h3>ℹ️ Spielregeln</h3>
                    <ul>
                        <li><strong>Punkte:</strong> Richtig = 100 + Zeit-Bonus (1 Punkt/Sekunde)</li>
                        <li><strong>Streak:</strong> Jede 5. richtige Antwort in Folge = +50 Bonus</li>
                        <li><strong>Schwierigkeit:</strong> Nach je 5 richtigen Antworten wird der Timer um 5s reduziert (min. 15s)</li>
                        <li><strong>Leben:</strong> Bei 3 Fehlern ist das Spiel vorbei</li>
                        <li><strong>Tastatur:</strong> 1-4 für Antworten, Enter zum Bestätigen, ESC für Pause</li>
                    </ul>
                </div>

                <div class="start-actions">
                    <button class="btn btn-primary btn-large" id="startGamifiedBtn">
                        🎮 Spiel starten
                    </button>
                    <button class="btn btn-outline btn-large" id="viewScoreboardBtn">
                        🏆 Scoreboard anzeigen
                    </button>
                </div>

                <div class="pdf-upload-section">
                    <h3>📄 Klausurfragen hochladen</h3>
                    <p>Lade Klausurfragen-PDFs hoch, um zusätzliche Fragen zu aktivieren</p>
                    <div class="pdf-drop-zone" id="pdfDropZone">
                        <div class="drop-zone-content">
                            <div class="drop-zone-icon">📄</div>
                            <div class="drop-zone-text">
                                <strong>PDF hier ablegen</strong>
                                <span>oder klicken zum Auswählen</span>
                            </div>
                        </div>
                    </div>
                    <input type="file" id="pdfUpload" accept=".pdf" style="display: none;">
                    <button class="btn btn-outline" id="uploadPdfBtn">
                        📤 PDF hochladen
                    </button>
                    <div id="pdfStatus"></div>
                    <div id="uploadedPdfsList"></div>
                </div>
            </div>
        `;

        this.attachStartScreenListeners();
        this.renderUploadedPDFsList();
    }

    /**
     * Attach event listeners for start screen
     */
    attachStartScreenListeners() {
        const startBtn = document.getElementById('startGamifiedBtn');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startGame());
        }

        const scoreboardBtn = document.getElementById('viewScoreboardBtn');
        if (scoreboardBtn) {
            scoreboardBtn.addEventListener('click', () => this.showScoreboard());
        }

        const uploadBtn = document.getElementById('uploadPdfBtn');
        const pdfInput = document.getElementById('pdfUpload');
        if (uploadBtn && pdfInput) {
            uploadBtn.addEventListener('click', () => pdfInput.click());
            pdfInput.addEventListener('change', (e) => this.handlePdfUpload(e));
        }

        // Setup drag & drop for PDF upload
        const dropZone = document.getElementById('pdfDropZone');
        if (dropZone && pdfInput) {
            // Click to select file
            dropZone.addEventListener('click', () => pdfInput.click());

            // Drag & drop events
            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropZone.classList.add('drag-over');
            });

            dropZone.addEventListener('dragleave', (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropZone.classList.remove('drag-over');
            });

            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropZone.classList.remove('drag-over');
                
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    // Only handle the first PDF file
                    const pdfFile = Array.from(files).find(file => file.type === 'application/pdf');
                    if (pdfFile) {
                        this.handlePdfFile(pdfFile);
                    } else {
                        const statusEl = document.getElementById('pdfStatus');
                        if (statusEl) {
                            statusEl.innerHTML = `<span style="color: var(--error);">❌ Bitte nur PDF-Dateien hochladen!</span>`;
                            setTimeout(() => {
                                statusEl.innerHTML = '';
                            }, 3000);
                        }
                    }
                }
            });
        }

        // Save settings on change
        ['timerSelect', 'questionCountSelect', 'livesSelect'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('change', () => this.saveSettings());
            }
        });
    }

    /**
     * Render list of uploaded PDFs
     */
    renderUploadedPDFsList() {
        const container = document.getElementById('uploadedPdfsList');
        if (!container) return;

        const uploadedPDFs = this.questionSource.getUploadedPDFs();
        
        if (uploadedPDFs.length === 0) {
            container.innerHTML = '';
            return;
        }

        container.innerHTML = `
            <div class="uploaded-pdfs">
                <h4>Hochgeladene PDFs:</h4>
                <div class="pdf-list">
                    ${uploadedPDFs.map(pdf => `
                        <div class="pdf-item">
                            <div class="pdf-info">
                                <span class="pdf-filename">📄 ${pdf.filename}</span>
                                <span class="pdf-question-count">${pdf.questionCount} Fragen</span>
                            </div>
                            <button class="btn btn-small btn-danger" data-hash="${pdf.hash}" onclick="window.deletePDF('${pdf.hash}')">
                                🗑️ Löschen
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Handle PDF upload
     */
    async handlePdfUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        await this.handlePdfFile(file);
    }

    /**
     * Handle PDF file (from upload or drag & drop)
     */
    async handlePdfFile(file) {
        const statusEl = document.getElementById('pdfStatus');
        statusEl.textContent = 'Lade PDF...';

        try {
            const count = await this.questionSource.loadKlausurfragenPDF(file);
            statusEl.innerHTML = `<span style="color: var(--success);">✅ ${count} Fragen geladen!</span>`;
            
            // Refresh the uploaded PDFs list
            this.renderUploadedPDFsList();
            
            // Refresh topics in filter
            this.updateTopicFilter();
            
            // Clear the status after some time
            setTimeout(() => {
                statusEl.innerHTML = '';
            }, 5000);
        } catch (error) {
            statusEl.innerHTML = `<span style="color: var(--error);">❌ Fehler: ${error.message}</span>`;
        }
    }

    /**
     * Delete a PDF file
     */
    deletePDF(hash) {
        if (confirm('Möchtest du diese PDF wirklich löschen? Die Fragen werden aus dem Quiz entfernt.')) {
            const success = this.questionSource.deletePDF(hash);
            if (success) {
                this.renderUploadedPDFsList();
                this.updateTopicFilter();
                
                const statusEl = document.getElementById('pdfStatus');
                if (statusEl) {
                    statusEl.innerHTML = `<span style="color: var(--success);">✅ PDF gelöscht!</span>`;
                    setTimeout(() => {
                        statusEl.innerHTML = '';
                    }, 3000);
                }
            }
        }
    }

    /**
     * Save settings
     */
    saveSettings() {
        const settings = {
            timerDuration: parseInt(document.getElementById('timerSelect').value),
            questionCount: parseInt(document.getElementById('questionCountSelect').value),
            lives: parseInt(document.getElementById('livesSelect').value)
        };
        this.settingsManager.saveSettings(settings);
    }

    /**
     * Start game
     */
    startGame() {
        // Get selected topics from main topic filter
        const selectedTopics = this.getSelectedTopics();
        
        // Get questions
        this.currentQuestions = this.questionSource.getQuestionsByTopics(selectedTopics);
        
        if (this.currentQuestions.length === 0) {
            alert('Keine Fragen verfügbar für die gewählten Themen!');
            return;
        }

        // Shuffle questions
        this.currentQuestions = this.shuffleArray(this.currentQuestions);

        // Get settings
        const settings = this.settingsManager.getSettings();
        
        // Limit questions to configured count
        this.currentQuestions = this.currentQuestions.slice(0, settings.questionCount);

        // Shuffle answer options for each question
        this.currentQuestions = this.currentQuestions.map(q => this.shuffleAnswerOptions(q));

        // Initialize game state
        this.gameState = new GameState({
            timerDuration: settings.timerDuration,
            questionCount: settings.questionCount,
            lives: settings.lives
        });

        this.currentQuestionIndex = 0;
        this.selectedChoiceIndex = null;

        // Show game screen
        this.showGameScreen();
        this.renderQuestion();
    }

    /**
     * Show game screen
     */
    showGameScreen() {
        const gameScreen = document.getElementById('gamifiedGameScreen');
        if (gameScreen) {
            gameScreen.classList.add('active');
        }
        
        const startScreen = document.getElementById('gamifiedStartScreen');
        if (startScreen) {
            startScreen.classList.remove('active');
        }
    }

    /**
     * Render current question
     */
    renderQuestion() {
        const question = this.currentQuestions[this.currentQuestionIndex];
        const container = document.getElementById('gamifiedQuestionContainer');
        
        if (!container) return;

        // Update header stats
        this.updateGameHeader();

        // Render question
        container.innerHTML = `
            <div class="gamified-question-card">
                <div class="question-header">
                    <h2>${question.question}</h2>
                    <div class="topic-badge">${question.topic}</div>
                </div>

                <div class="answer-choices" id="answerChoices">
                    ${this.renderChoices(question)}
                </div>

                <div class="power-ups">
                    ${this.renderPowerUps()}
                </div>

                <div id="feedbackArea" class="feedback-area hidden"></div>
            </div>
        `;

        // Attach choice listeners
        this.attachChoiceListeners();

        // Start timer
        this.gameState.startTimer(
            (timeLeft) => this.updateTimer(timeLeft),
            () => this.handleTimeout()
        );
    }

    /**
     * Render answer choices
     */
    renderChoices(question) {
        if (question.type === 'open') {
            return `
                <div class="open-question-controls">
                    <button class="btn btn-primary" id="showSolutionBtn">
                        💡 Lösung anzeigen
                    </button>
                    <div id="solutionText" class="solution-text hidden">
                        ${question.solution}
                        <div class="self-evaluation">
                            <button class="btn btn-success" id="selfCorrectBtn">✅ Wusste ich</button>
                            <button class="btn btn-error" id="selfWrongBtn">❌ Wusste ich nicht</button>
                        </div>
                    </div>
                </div>
            `;
        }

        return question.choices.map((choice, index) => `
            <button class="answer-choice" data-index="${index}">
                <span class="choice-number">${index + 1}</span>
                <span class="choice-text">${choice}</span>
            </button>
        `).join('');
    }

    /**
     * Render power-ups
     */
    renderPowerUps() {
        const { fiftyFifty, skip, freeze } = this.gameState.powerUps;
        
        return `
            <button class="power-up-btn ${!fiftyFifty ? 'disabled' : ''}" 
                    id="fiftyFiftyBtn" 
                    ${!fiftyFifty ? 'disabled' : ''}>
                50/50
            </button>
            <button class="power-up-btn ${!skip ? 'disabled' : ''}" 
                    id="skipBtn"
                    ${!skip ? 'disabled' : ''}>
                ⏭️ Skip
            </button>
        `;
    }

    /**
     * Attach choice listeners
     */
    attachChoiceListeners() {
        const question = this.currentQuestions[this.currentQuestionIndex];

        if (question.type === 'open') {
            const showBtn = document.getElementById('showSolutionBtn');
            const correctBtn = document.getElementById('selfCorrectBtn');
            const wrongBtn = document.getElementById('selfWrongBtn');

            if (showBtn) {
                showBtn.addEventListener('click', () => {
                    document.getElementById('solutionText').classList.remove('hidden');
                    showBtn.disabled = true;
                });
            }

            if (correctBtn) {
                correctBtn.addEventListener('click', () => this.handleAnswer(true));
            }

            if (wrongBtn) {
                wrongBtn.addEventListener('click', () => this.handleAnswer(false));
            }
        } else {
            document.querySelectorAll('.answer-choice').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = parseInt(e.currentTarget.dataset.index);
                    this.selectChoice(index);
                });
            });
        }

        // Power-up listeners
        const fiftyFiftyBtn = document.getElementById('fiftyFiftyBtn');
        const skipBtn = document.getElementById('skipBtn');

        if (fiftyFiftyBtn) {
            fiftyFiftyBtn.addEventListener('click', () => this.useFiftyFifty());
        }

        if (skipBtn) {
            skipBtn.addEventListener('click', () => this.useSkip());
        }
    }

    /**
     * Select choice
     */
    selectChoice(index) {
        const question = this.currentQuestions[this.currentQuestionIndex];
        const isCorrect = index === question.correctIndex;
        
        this.handleAnswer(isCorrect, index);
    }

    /**
     * Handle answer
     */
    handleAnswer(isCorrect, selectedIndex = null) {
        const result = this.gameState.answerQuestion(isCorrect);
        
        // Show feedback
        this.showFeedback(isCorrect, result);

        // Check if game over
        if (result.isGameOver) {
            setTimeout(() => this.showGameOver(), 2000);
        } else if (this.gameState.isComplete()) {
            setTimeout(() => this.showGameComplete(), 2000);
        } else {
            setTimeout(() => this.nextQuestion(), 2000);
        }

        // Highlight correct answer if MC
        if (selectedIndex !== null) {
            const question = this.currentQuestions[this.currentQuestionIndex];
            const choices = document.querySelectorAll('.answer-choice');
            
            choices[selectedIndex].classList.add(isCorrect ? 'correct' : 'wrong');
            choices[question.correctIndex].classList.add('correct');
            
            choices.forEach(btn => btn.disabled = true);
        }
    }

    /**
     * Show feedback
     */
    showFeedback(isCorrect, result) {
        const feedbackArea = document.getElementById('feedbackArea');
        if (!feedbackArea) return;

        const icon = isCorrect ? '✅' : '❌';
        const message = isCorrect ? 'Richtig!' : 'Falsch!';
        
        feedbackArea.innerHTML = `
            <div class="feedback-content ${isCorrect ? 'success' : 'error'}">
                <div class="feedback-icon">${icon}</div>
                <div class="feedback-text">
                    <strong>${message}</strong>
                    <div class="points">+${result.pointsEarned} Punkte</div>
                    ${result.bonusInfo.map(info => `<div class="bonus">${info}</div>`).join('')}
                </div>
            </div>
        `;
        
        feedbackArea.classList.remove('hidden');
    }

    /**
     * Use 50/50 power-up
     */
    useFiftyFifty() {
        const question = this.currentQuestions[this.currentQuestionIndex];
        const keepIndices = this.gameState.useFiftyFifty(question.choices, question.correctIndex);
        
        if (!keepIndices) return;

        const choices = document.querySelectorAll('.answer-choice');
        choices.forEach((btn, index) => {
            if (!keepIndices.includes(index)) {
                btn.style.opacity = '0.3';
                btn.disabled = true;
            }
        });

        document.getElementById('fiftyFiftyBtn').disabled = true;
    }

    /**
     * Use skip power-up
     */
    useSkip() {
        if (this.gameState.useSkip()) {
            this.nextQuestion();
        }
    }

    /**
     * Handle timeout
     */
    handleTimeout() {
        this.handleAnswer(false);
    }

    /**
     * Next question
     */
    nextQuestion() {
        this.currentQuestionIndex++;
        
        if (this.currentQuestionIndex < this.currentQuestions.length) {
            this.renderQuestion();
        } else {
            this.showGameComplete();
        }
    }

    /**
     * Update timer display
     */
    updateTimer(timeLeft) {
        const timerEl = document.getElementById('gameTimer');
        if (timerEl) {
            timerEl.textContent = `⏱️ ${timeLeft}s`;
            
            // Add warning class when low
            if (timeLeft <= 5) {
                timerEl.classList.add('timer-warning');
            } else {
                timerEl.classList.remove('timer-warning');
            }
        }
    }

    /**
     * Update game header
     */
    updateGameHeader() {
        document.getElementById('gameScore').textContent = `💎 ${this.gameState.score}`;
        document.getElementById('gameStreak').textContent = `🔥 ${this.gameState.streak}`;
        document.getElementById('gameLives').textContent = '❤️'.repeat(this.gameState.lives);
        document.getElementById('gameProgress').textContent = 
            `${this.currentQuestionIndex + 1}/${this.currentQuestions.length}`;
        
        const progressBar = document.getElementById('gameProgressBar');
        if (progressBar) {
            const percent = ((this.currentQuestionIndex + 1) / this.currentQuestions.length) * 100;
            progressBar.style.width = `${percent}%`;
        }
    }

    /**
     * Show game over
     */
    showGameOver() {
        this.showResultScreen('Game Over! 💀', false);
    }

    /**
     * Show game complete
     */
    showGameComplete() {
        this.showResultScreen('Geschafft! 🎉', true);
    }

    /**
     * Show result screen
     */
    showResultScreen(title, isComplete) {
        const summary = this.gameState.getSummary();
        const selectedTopics = this.getSelectedTopics();
        
        // Save highscore
        const isNewHighscore = this.highscoreManager.saveHighscore(
            selectedTopics,
            summary.score,
            summary
        );

        const container = document.getElementById('gamifiedResultScreen');
        if (!container) return;

        container.innerHTML = `
            <div class="result-card">
                <h2>${title}</h2>
                
                ${isNewHighscore ? '<div class="new-highscore">🏆 Neuer Highscore!</div>' : ''}

                <div class="result-stats">
                    <div class="stat-item">
                        <div class="stat-value">${summary.score}</div>
                        <div class="stat-label">Punkte</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${summary.streak}</div>
                        <div class="stat-label">Bester Streak</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${summary.accuracy}%</div>
                        <div class="stat-label">Genauigkeit</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${summary.correct}/${summary.total}</div>
                        <div class="stat-label">Richtig</div>
                    </div>
                </div>

                <div class="result-actions">
                    <button class="btn btn-primary" id="playAgainBtn">
                        🔄 Nochmal spielen
                    </button>
                    <button class="btn btn-outline" id="backToMenuBtn">
                        🏠 Zurück zum Menü
                    </button>
                </div>
            </div>
        `;

        // Show result screen
        container.classList.add('active');
        document.getElementById('gamifiedGameScreen').classList.remove('active');

        // Attach listeners
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            container.classList.remove('active');
            this.startGame();
        });

        document.getElementById('backToMenuBtn').addEventListener('click', () => {
            container.classList.remove('active');
            this.renderStartScreen();
            document.getElementById('gamifiedStartScreen').classList.add('active');
        });
    }

    /**
     * Setup global event listeners
     */
    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (!this.gameState || this.isPaused) return;

            // Number keys 1-4 for answers
            if (e.key >= '1' && e.key <= '4') {
                const index = parseInt(e.key) - 1;
                const question = this.currentQuestions[this.currentQuestionIndex];
                if (question && question.type === 'mc' && index < question.choices.length) {
                    this.selectChoice(index);
                }
            }

            // ESC for pause (could implement pause menu)
            if (e.key === 'Escape') {
                this.togglePause();
            }
        });
    }

    /**
     * Toggle pause
     */
    togglePause() {
        this.isPaused = !this.isPaused;
        // Could implement pause overlay here
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
     * Update topic filter to include Klausurfragen
     */
    updateTopicFilter() {
        // Show the Klausurfragen topic button in the main topic filter
        const btn = document.getElementById('klausurfragenTopicBtn');
        if (btn) {
            btn.style.display = 'inline-block';
        }
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
     * Shuffle answer options and update correct index accordingly
     */
    shuffleAnswerOptions(question) {
        // Don't shuffle if there are no choices or if it's an open question
        if (!question.choices || question.choices.length === 0 || question.type === 'open') {
            return question;
        }
        
        // Create a copy of the question to avoid modifying the original
        const shuffledQuestion = { ...question };
        
        // Create an array of indices with their corresponding choices
        const indexedChoices = question.choices.map((choice, index) => ({
            choice: choice,
            originalIndex: index,
            isCorrect: index === question.correctIndex
        }));
        
        // Shuffle the indexed choices
        const shuffledIndexedChoices = this.shuffleArray(indexedChoices);
        
        // Extract the new choices and correct index
        shuffledQuestion.choices = shuffledIndexedChoices.map(item => item.choice);
        const correctItem = shuffledIndexedChoices.find(item => item.isCorrect);
        shuffledQuestion.correctIndex = shuffledIndexedChoices.indexOf(correctItem);
        
        return shuffledQuestion;
    }

    /**
     * Show scoreboard
     */
    showScoreboard() {
        const container = document.getElementById('gamifiedStartScreen');
        if (!container) return;

        const scores = this.highscoreManager.getAllHighscoresSorted();

        container.innerHTML = `
            <div class="scoreboard-card">
                <div class="scoreboard-header">
                    <h2>🏆 Scoreboard</h2>
                    <button class="btn btn-outline" id="backFromScoreboardBtn">
                        ← Zurück
                    </button>
                </div>

                ${scores.length === 0 ? `
                    <div class="empty-scoreboard">
                        <div class="empty-icon">📊</div>
                        <p>Noch keine Highscores vorhanden!</p>
                        <p>Spiele das Gamified Quiz, um deinen ersten Score zu erzielen.</p>
                    </div>
                ` : `
                    <div class="scoreboard-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Punkte</th>
                                    <th>Streak</th>
                                    <th>Genauigkeit</th>
                                    <th>Themen</th>
                                    <th>Datum</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${scores.map((entry, index) => this.renderScoreboardRow(entry, index)).join('')}
                            </tbody>
                        </table>
                    </div>

                    <div class="scoreboard-actions">
                        <button class="btn btn-danger" id="clearScoreboardBtn">
                            🗑️ Scoreboard löschen
                        </button>
                    </div>
                `}
            </div>
        `;

        // Attach listeners
        const backBtn = document.getElementById('backFromScoreboardBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => this.renderStartScreen());
        }

        const clearBtn = document.getElementById('clearScoreboardBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearScoreboard());
        }
    }

    /**
     * Render a scoreboard row
     */
    renderScoreboardRow(entry, index) {
        const date = new Date(entry.date);
        const formattedDate = date.toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        const formattedTime = date.toLocaleTimeString('de-DE', {
            hour: '2-digit',
            minute: '2-digit'
        });

        // Format topics
        let topicDisplay = '';
        if (entry.key === 'global') {
            topicDisplay = '🌍 Global';
        } else if (Array.isArray(entry.topics)) {
            topicDisplay = entry.topics.join(', ');
        } else {
            topicDisplay = entry.key.replace(/_/g, ', ');
        }

        // Add medal for top 3
        const rank = index + 1;
        let rankDisplay = rank;
        if (rank === 1) rankDisplay = '🥇';
        else if (rank === 2) rankDisplay = '🥈';
        else if (rank === 3) rankDisplay = '🥉';

        return `
            <tr class="scoreboard-row ${rank <= 3 ? 'top-rank' : ''}">
                <td class="rank">${rankDisplay}</td>
                <td class="score"><strong>${entry.score}</strong></td>
                <td>${entry.stats.streak || 0}</td>
                <td>${entry.stats.accuracy || 0}%</td>
                <td class="topics">${topicDisplay}</td>
                <td class="date">${formattedDate}<br><small>${formattedTime}</small></td>
            </tr>
        `;
    }

    /**
     * Clear scoreboard
     */
    clearScoreboard() {
        if (confirm('Möchtest du wirklich alle Highscores löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
            this.highscoreManager.clearAllHighscores();
            this.showScoreboard(); // Refresh the view
        }
    }
}
