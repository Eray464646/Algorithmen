/**
 * Game Logic for Gamified Quiz Mode
 * Handles timer, scoring, streaks, lives, and power-ups
 */

export class GameState {
    constructor(config = {}) {
        // Configuration
        this.config = {
            timerDuration: config.timerDuration || 30,
            questionCount: config.questionCount || 20,
            lives: config.lives || 3,
            streakBonus: config.streakBonus || 50,
            streakInterval: config.streakInterval || 5,
            timerReduction: config.timerReduction || 5,
            timerReductionInterval: config.timerReductionInterval || 5,
            minTimer: config.minTimer || 15
        };

        // Game state
        this.score = 0;
        this.streak = 0;
        this.bestStreak = 0;
        this.lives = this.config.lives;
        this.questionsAnswered = 0;
        this.correctAnswers = 0;
        this.wrongAnswers = 0;
        this.currentTimer = this.config.timerDuration;
        this.isGameOver = false;
        
        // Power-ups (one use per game)
        this.powerUps = {
            fiftyFifty: true,
            skip: true,
            freeze: false
        };

        // Timer state
        this.timerInterval = null;
        this.timeRemaining = this.currentTimer;
        this.isFrozen = false;
    }

    /**
     * Start timer for current question
     * @param {Function} onTick - Callback for each second
     * @param {Function} onTimeout - Callback when timer expires
     */
    startTimer(onTick, onTimeout) {
        this.stopTimer();
        this.timeRemaining = this.currentTimer;
        
        this.timerInterval = setInterval(() => {
            if (!this.isFrozen && this.timeRemaining > 0) {
                this.timeRemaining--;
                if (onTick) onTick(this.timeRemaining);
                
                if (this.timeRemaining === 0) {
                    this.stopTimer();
                    if (onTimeout) onTimeout();
                }
            }
        }, 1000);
    }

    /**
     * Stop timer
     */
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    /**
     * Process answer
     * @param {boolean} isCorrect - Whether answer was correct
     * @returns {Object} Score update info
     */
    answerQuestion(isCorrect) {
        this.stopTimer();
        this.questionsAnswered++;
        
        let pointsEarned = 0;
        let bonusInfo = [];

        if (isCorrect) {
            this.correctAnswers++;
            this.streak++;
            
            // Base points
            pointsEarned = 100;
            
            // Time bonus
            const timeBonus = this.timeRemaining;
            pointsEarned += timeBonus;
            bonusInfo.push(`Zeit-Bonus: +${timeBonus}`);
            
            // Streak bonus
            if (this.streak > 0 && this.streak % this.config.streakInterval === 0) {
                pointsEarned += this.config.streakBonus;
                bonusInfo.push(`${this.streak}er Streak-Bonus: +${this.config.streakBonus}`);
            }
            
            // Update best streak
            if (this.streak > this.bestStreak) {
                this.bestStreak = this.streak;
            }

            // Adjust timer difficulty
            if (this.correctAnswers % this.config.timerReductionInterval === 0) {
                this.currentTimer = Math.max(
                    this.config.minTimer,
                    this.currentTimer - this.config.timerReduction
                );
                if (this.currentTimer > this.config.minTimer) {
                    bonusInfo.push(`Schwierigkeit erhöht! Timer: ${this.currentTimer}s`);
                }
            }
        } else {
            this.wrongAnswers++;
            this.streak = 0;
            this.lives--;
            
            if (this.lives === 0) {
                this.isGameOver = true;
            }
        }

        this.score += pointsEarned;

        return {
            pointsEarned,
            bonusInfo,
            totalScore: this.score,
            streak: this.streak,
            lives: this.lives,
            isGameOver: this.isGameOver
        };
    }

    /**
     * Use 50/50 power-up
     * @param {Array} choices - All answer choices
     * @param {number} correctIndex - Index of correct answer
     * @returns {Array} Indices of choices to keep
     */
    useFiftyFifty(choices, correctIndex) {
        if (!this.powerUps.fiftyFifty) {
            return null;
        }

        this.powerUps.fiftyFifty = false;

        // Keep correct answer and one random wrong answer
        const wrongIndices = choices
            .map((_, idx) => idx)
            .filter(idx => idx !== correctIndex);
        
        const randomWrongIndex = wrongIndices[Math.floor(Math.random() * wrongIndices.length)];
        
        return [correctIndex, randomWrongIndex].sort((a, b) => a - b);
    }

    /**
     * Use skip power-up
     * @returns {boolean} Success
     */
    useSkip() {
        if (!this.powerUps.skip) {
            return false;
        }

        this.powerUps.skip = false;
        this.stopTimer();
        return true;
    }

    /**
     * Use freeze power-up
     * @returns {boolean} Success
     */
    useFreeze() {
        if (!this.powerUps.freeze) {
            return false;
        }

        this.powerUps.freeze = false;
        this.isFrozen = true;
        
        // Unfreeze after 5 seconds
        setTimeout(() => {
            this.isFrozen = false;
        }, 5000);
        
        return true;
    }

    /**
     * Get current accuracy percentage
     * @returns {number} Accuracy 0-100
     */
    getAccuracy() {
        if (this.questionsAnswered === 0) return 0;
        return Math.round((this.correctAnswers / this.questionsAnswered) * 100);
    }

    /**
     * Get game summary
     * @returns {Object} Game statistics
     */
    getSummary() {
        return {
            score: this.score,
            streak: this.bestStreak,
            accuracy: this.getAccuracy(),
            correct: this.correctAnswers,
            wrong: this.wrongAnswers,
            total: this.questionsAnswered,
            livesLeft: this.lives
        };
    }

    /**
     * Check if game is complete
     * @returns {boolean}
     */
    isComplete() {
        return this.isGameOver || this.questionsAnswered >= this.config.questionCount;
    }
}

/**
 * Highscore Manager
 */
export class HighscoreManager {
    constructor() {
        this.storageKey = 'gamified_highscores';
    }

    /**
     * Save highscore
     * @param {string} topics - Topic combination key
     * @param {number} score - Score achieved
     * @param {Object} stats - Additional stats
     */
    saveHighscore(topics, score, stats) {
        const highscores = this.getHighscores();
        const key = this._getTopicKey(topics);

        if (!highscores[key] || score > highscores[key].score) {
            highscores[key] = {
                score,
                stats,
                date: new Date().toISOString(),
                topics
            };
            
            localStorage.setItem(this.storageKey, JSON.stringify(highscores));
            return true; // New highscore
        }

        // Update global highscore
        if (!highscores.global || score > highscores.global.score) {
            highscores.global = {
                score,
                stats,
                date: new Date().toISOString(),
                topics
            };
            localStorage.setItem(this.storageKey, JSON.stringify(highscores));
            return true;
        }

        return false; // Not a new highscore
    }

    /**
     * Get all highscores
     * @returns {Object} Highscores by topic
     */
    getHighscores() {
        try {
            return JSON.parse(localStorage.getItem(this.storageKey) || '{}');
        } catch {
            return {};
        }
    }

    /**
     * Get highscore for specific topics
     * @param {string} topics - Topic combination
     * @returns {Object|null} Highscore data
     */
    getHighscoreForTopics(topics) {
        const highscores = this.getHighscores();
        const key = this._getTopicKey(topics);
        return highscores[key] || null;
    }

    /**
     * Get global highscore
     * @returns {Object|null}
     */
    getGlobalHighscore() {
        const highscores = this.getHighscores();
        return highscores.global || null;
    }

    /**
     * Get all highscores sorted by score
     * @returns {Array} Array of highscore entries sorted by score (descending)
     */
    getAllHighscoresSorted() {
        const highscores = this.getHighscores();
        const entries = [];
        
        for (const [key, data] of Object.entries(highscores)) {
            entries.push({
                key,
                ...data
            });
        }
        
        return entries.sort((a, b) => b.score - a.score);
    }

    /**
     * Clear all highscores
     */
    clearAllHighscores() {
        localStorage.removeItem(this.storageKey);
    }

    _getTopicKey(topics) {
        if (typeof topics === 'string') return topics;
        return Array.isArray(topics) ? topics.sort().join('_') : 'all';
    }
}

/**
 * Settings Manager
 */
export class SettingsManager {
    constructor() {
        this.storageKey = 'gamified_settings';
    }

    /**
     * Get settings
     * @returns {Object} Current settings
     */
    getSettings() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            return saved ? JSON.parse(saved) : this.getDefaultSettings();
        } catch {
            return this.getDefaultSettings();
        }
    }

    /**
     * Save settings
     * @param {Object} settings - Settings to save
     */
    saveSettings(settings) {
        localStorage.setItem(this.storageKey, JSON.stringify(settings));
    }

    /**
     * Get default settings
     * @returns {Object}
     */
    getDefaultSettings() {
        return {
            timerDuration: 30,
            questionCount: 20,
            lives: 3,
            selectedTopics: ['all']
        };
    }

    /**
     * Update single setting
     * @param {string} key - Setting key
     * @param {*} value - Setting value
     */
    updateSetting(key, value) {
        const settings = this.getSettings();
        settings[key] = value;
        this.saveSettings(settings);
    }
}
