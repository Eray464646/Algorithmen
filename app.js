// ===== IMPORTS =====
import algorithmenQuestions from './algorithmen.js';
import mcFragen from './mc_fragen_suche_und_baeume.js';

// ===== GLOBALE VARIABLEN =====
let allQuestions = [];
let currentQuestions = [];
let currentQuestionIndex = 0;
let currentMode = 'main';
let selectedTopic = 'all';
let userAnswers = [];
let questionProgress = {};

// ===== INITIALISIERUNG =====
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    loadQuestions();
    loadProgress();
    setupEventListeners();
    applyTheme();
    showScreen('startScreen');
}

// ===== FRAGEN LADEN UND VERARBEITEN =====
function loadQuestions() {
    // Fragen aus algorithmen.js verarbeiten
    const processedAlgoQuestions = algorithmenQuestions.map((q, index) => {
        if (q.write) {
            // Offene Fragen in Multiple Choice umwandeln
            return convertOpenToMC(q, index);
        } else {
            // Multiple Choice Fragen normalisieren
            return {
                id: q.id || `algo_${index}`,
                question: q.question,
                options: q.options.map(opt => typeof opt === 'string' ? opt : opt.text),
                correctIndices: q.options
                    .map((opt, idx) => (typeof opt === 'object' && opt.correct) ? idx : null)
                    .filter(idx => idx !== null),
                topic: q.topic || 'Algorithmen',
                feedback: q.feedback || '',
                generated: false
            };
        }
    });

    // Fragen aus mc_fragen_suche_und_baeume.js verarbeiten
    const processedMCQuestions = mcFragen.map(q => ({
        id: q.id || `mc_${q.id}`,
        question: q.question,
        options: q.options,
        correctIndices: [q.correctIndex],
        topic: 'Suche & Bäume',
        feedback: q.explanation || '',
        generated: false
    }));

    allQuestions = [...processedAlgoQuestions, ...processedMCQuestions];
    
    console.log(`${allQuestions.length} Fragen geladen`);
    showToast(`${allQuestions.length} Fragen erfolgreich geladen`, 'success');
}

// ===== OFFENE FRAGEN IN MULTIPLE CHOICE UMWANDELN =====
function convertOpenToMC(question, index) {
    const id = question.id || `open_${index}`;
    const solutionText = extractTextFromHTML(question.solution);
    
    // Generiere plausible Antwortoptionen basierend auf der Lösung
    const options = generateOptionsFromSolution(solutionText, question.question);
    
    // Die erste Option ist immer die korrekte (basierend auf der Lösung)
    const correctIndices = [0];
    
    return {
        id,
        question: question.question,
        options,
        correctIndices,
        topic: question.topic || 'Algorithmen',
        feedback: question.feedback || solutionText,
        generated: true,
        originalSolution: question.solution
    };
}

function extractTextFromHTML(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
}

function generateOptionsFromSolution(solution, question) {
    // Intelligente Generierung von Antworten basierend auf der Lösung
    const options = [];
    
    // Erste Option: Korrekte Antwort (vereinfachte Version der Lösung)
    options.push(simplifyCorrectAnswer(solution));
    
    // Falsche Optionen generieren
    options.push(...generateWrongOptions(solution, question));
    
    // Mische alle Optionen außer der ersten
    const correctOption = options[0];
    const wrongOptions = options.slice(1);
    shuffleArray(wrongOptions);
    
    return [correctOption, ...wrongOptions.slice(0, 3)]; // Maximal 4 Optionen
}

function simplifyCorrectAnswer(solution) {
    // Extrahiere die Kernaussage aus der Lösung
    const sentences = solution.split(/[.!?]+/).filter(s => s.trim().length > 20);
    if (sentences.length > 0) {
        return sentences[0].trim() + '.';
    }
    return solution.substring(0, 150) + '...';
}

function generateWrongOptions(solution, question) {
    const wrongOptions = [];
    
    // Muster für falsche Antworten
    const patterns = [
        "Dies ist nicht korrekt, da es dem Grundprinzip widerspricht.",
        "Diese Aussage trifft nicht zu, da wichtige Aspekte fehlen.",
        "Dies ist eine häufige Fehlvorstellung zu diesem Thema.",
        "Diese Antwort ist unvollständig und berücksichtigt nicht alle Faktoren."
    ];
    
    // Füge spezifische falsche Antworten basierend auf dem Thema hinzu
    if (question.toLowerCase().includes('laufzeit') || question.toLowerCase().includes('komplexität')) {
        wrongOptions.push("Die Laufzeit ist immer konstant O(1).");
        wrongOptions.push("Die Komplexität spielt keine Rolle bei kleinen Datenmengen.");
    } else if (question.toLowerCase().includes('algorithmus') || question.toLowerCase().includes('sortier')) {
        wrongOptions.push("Alle Algorithmen haben die gleiche Effizienz.");
        wrongOptions.push("Die Wahl des Algorithmus ist beliebig.");
    } else if (question.toLowerCase().includes('graph') || question.toLowerCase().includes('baum')) {
        wrongOptions.push("Die Struktur hat keinen Einfluss auf die Leistung.");
        wrongOptions.push("Graphen und Bäume sind identisch in ihrer Funktionsweise.");
    }
    
    // Fülle mit generischen Mustern auf
    wrongOptions.push(...patterns);
    
    return wrongOptions;
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const mode = e.currentTarget.dataset.mode;
            switchMode(mode);
        });
    });

    // Topic Filter
    document.querySelectorAll('.topic-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.topic-btn').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            selectedTopic = e.currentTarget.dataset.topic;
        });
    });

    // Start Buttons
    document.querySelectorAll('.start-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const mode = e.currentTarget.dataset.mode;
            startQuiz(mode);
        });
    });

    // Quiz Controls
    document.getElementById('nextBtn').addEventListener('click', nextQuestion);
    document.getElementById('prevBtn').addEventListener('click', prevQuestion);

    // Result Actions
    document.getElementById('restartBtn').addEventListener('click', () => startQuiz(currentMode));
    document.getElementById('backToStartBtn').addEventListener('click', () => {
        showScreen('startScreen');
        switchMode('main');
    });
    document.getElementById('addToLearnModeBtn').addEventListener('click', addWrongQuestionsToLearnMode);

    // Settings
    document.getElementById('exportProgressBtn').addEventListener('click', exportProgress);
    document.getElementById('importProgressBtn').addEventListener('click', () => {
        document.getElementById('importFileInput').click();
    });
    document.getElementById('importFileInput').addEventListener('change', importProgress);
    document.getElementById('resetProgressBtn').addEventListener('click', resetProgress);
    
    // Theme Toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    document.getElementById('darkModeToggle').addEventListener('change', (e) => {
        if (e.target.checked) {
            setTheme('dark');
        } else {
            setTheme('light');
        }
    });
}

// ===== NAVIGATION =====
function switchMode(mode) {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const navBtn = document.querySelector(`.nav-btn[data-mode="${mode}"]`);
    if (navBtn) {
        navBtn.classList.add('active');
    }

    switch(mode) {
        case 'main':
        case 'learn':
            showScreen('startScreen');
            currentMode = mode;
            break;
        case 'stats':
            showScreen('statsScreen');
            updateStatsScreen();
            break;
        case 'settings':
            showScreen('settingsScreen');
            break;
    }
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// ===== QUIZ STARTEN =====
function startQuiz(mode) {
    currentMode = mode;
    currentQuestionIndex = 0;
    userAnswers = [];

    // Fragen filtern nach Topic
    let filteredQuestions = selectedTopic === 'all' 
        ? [...allQuestions]
        : allQuestions.filter(q => q.topic === selectedTopic);

    if (mode === 'learn') {
        // Nur unsichere und unbekannte Fragen
        filteredQuestions = filteredQuestions.filter(q => {
            const status = getQuestionStatus(q.id);
            return status !== 'confident';
        });

        // Priorisierung: "cannot" > "unsure"
        filteredQuestions.sort((a, b) => {
            const statusA = getQuestionStatus(a.id);
            const statusB = getQuestionStatus(b.id);
            const priority = { 'cannot': 0, 'unsure': 1, 'confident': 2 };
            return priority[statusA] - priority[statusB];
        });
    }

    if (filteredQuestions.length === 0) {
        showToast('Keine Fragen für diesen Modus verfügbar!', 'warning');
        return;
    }

    // Mische Fragen
    currentQuestions = shuffleArray(filteredQuestions);
    
    showScreen('quizScreen');
    displayQuestion();
}

// ===== FRAGE ANZEIGEN =====
function displayQuestion() {
    const question = currentQuestions[currentQuestionIndex];
    
    // Update Progress
    document.getElementById('questionCounter').textContent = 
        `Frage ${currentQuestionIndex + 1} von ${currentQuestions.length}`;
    document.getElementById('topicBadge').textContent = question.topic;
    document.getElementById('progressFill').style.width = 
        `${((currentQuestionIndex + 1) / currentQuestions.length) * 100}%`;

    // Frage anzeigen
    document.getElementById('questionText').textContent = question.question;

    // Anzahl korrekter Antworten anzeigen
    const correctCount = question.correctIndices.length;
    const correctInfo = correctCount === 1 
        ? 'Diese Frage hat 1 richtige Antwort'
        : `Diese Frage hat ${correctCount} richtige Antworten`;
    document.getElementById('correctAnswersInfo').textContent = correctInfo;

    // Antwortoptionen anzeigen
    const answersContainer = document.getElementById('answersContainer');
    answersContainer.innerHTML = '';

    question.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = option;
        btn.dataset.index = index;
        btn.addEventListener('click', () => selectAnswer(index));
        answersContainer.appendChild(btn);
    });

    // Feedback ausblenden
    document.getElementById('feedbackContainer').classList.add('hidden');

    // Button States
    document.getElementById('prevBtn').disabled = currentQuestionIndex === 0;
    document.getElementById('nextBtn').disabled = true;
}

// ===== ANTWORT AUSWÄHLEN =====
function selectAnswer(selectedIndex) {
    const question = currentQuestions[currentQuestionIndex];
    const answerButtons = document.querySelectorAll('.answer-btn');
    
    // Nur erlauben, wenn noch nicht beantwortet
    if (userAnswers[currentQuestionIndex]) return;

    const isCorrect = question.correctIndices.includes(selectedIndex);
    
    // Visuelles Feedback
    answerButtons[selectedIndex].classList.add(isCorrect ? 'correct' : 'wrong');
    
    // Zeige alle korrekten Antworten
    question.correctIndices.forEach(idx => {
        answerButtons[idx].classList.add('correct');
    });

    // Deaktiviere alle Buttons
    answerButtons.forEach(btn => btn.disabled = true);

    // Speichere Antwort
    userAnswers[currentQuestionIndex] = {
        selectedIndex,
        isCorrect,
        questionId: question.id
    };

    // Update Question Progress
    updateQuestionProgress(question.id, isCorrect);

    // Zeige Feedback
    showFeedback(isCorrect, question.feedback);

    // Enable Next Button
    document.getElementById('nextBtn').disabled = false;
}

// ===== FEEDBACK ANZEIGEN =====
function showFeedback(isCorrect, feedbackText) {
    const container = document.getElementById('feedbackContainer');
    const icon = document.getElementById('feedbackIcon');
    const text = document.getElementById('feedbackText');

    icon.textContent = isCorrect ? '✅' : '❌';
    text.innerHTML = feedbackText || (isCorrect ? 'Richtig!' : 'Leider falsch.');

    container.classList.remove('hidden');
}

// ===== NAVIGATION: NÄCHSTE/VORHERIGE FRAGE =====
function nextQuestion() {
    if (currentQuestionIndex < currentQuestions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    } else {
        showResults();
    }
}

function prevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
    }
}

// ===== ERGEBNISSE ANZEIGEN =====
function showResults() {
    const correctCount = userAnswers.filter(a => a && a.isCorrect).length;
    const wrongCount = userAnswers.filter(a => a && !a.isCorrect).length;
    const percentage = Math.round((correctCount / currentQuestions.length) * 100);

    // Update Result Display
    document.getElementById('correctCount').textContent = correctCount;
    document.getElementById('wrongCount').textContent = wrongCount;
    document.getElementById('percentageCount').textContent = `${percentage}%`;

    // Result Icon
    const resultIcon = document.getElementById('resultIcon');
    if (percentage >= 90) {
        resultIcon.textContent = '🏆';
    } else if (percentage >= 70) {
        resultIcon.textContent = '🎉';
    } else if (percentage >= 50) {
        resultIcon.textContent = '👍';
    } else {
        resultIcon.textContent = '📚';
    }

    // Wrong Questions
    const wrongQuestions = currentQuestions.filter((q, idx) => 
        userAnswers[idx] && !userAnswers[idx].isCorrect
    );

    if (wrongQuestions.length > 0) {
        const wrongContainer = document.getElementById('wrongQuestionsContainer');
        const wrongList = document.getElementById('wrongQuestionsList');
        wrongContainer.classList.remove('hidden');
        wrongList.innerHTML = '';

        wrongQuestions.forEach(q => {
            const li = document.createElement('li');
            li.textContent = q.question;
            wrongList.appendChild(li);
        });
    }

    showScreen('resultScreen');
    saveProgress();
}

// ===== FORTSCHRITT VERWALTEN =====
function updateQuestionProgress(questionId, isCorrect) {
    if (!questionProgress[questionId]) {
        questionProgress[questionId] = {
            correct: 0,
            wrong: 0,
            lastAnswered: new Date().toISOString()
        };
    }

    if (isCorrect) {
        questionProgress[questionId].correct++;
    } else {
        questionProgress[questionId].wrong++;
    }

    questionProgress[questionId].lastAnswered = new Date().toISOString();
}

function getQuestionStatus(questionId) {
    const progress = questionProgress[questionId];
    
    if (!progress || progress.correct === 0) {
        return 'cannot'; // Noch nie richtig
    }
    
    if (progress.wrong > 0 && progress.correct < 2) {
        return 'unsure'; // Mal richtig, mal falsch
    }
    
    if (progress.correct >= 2 && progress.wrong === 0) {
        return 'confident'; // Mindestens 2x richtig, nie falsch
    }
    
    return 'unsure';
}

function addWrongQuestionsToLearnMode() {
    const wrongQuestions = currentQuestions.filter((q, idx) => 
        userAnswers[idx] && !userAnswers[idx].isCorrect
    );

    wrongQuestions.forEach(q => {
        if (!questionProgress[q.id]) {
            questionProgress[q.id] = { correct: 0, wrong: 1, lastAnswered: new Date().toISOString() };
        }
    });

    saveProgress();
    showToast(`${wrongQuestions.length} Fragen zum Lernmodus hinzugefügt`, 'success');
}

// ===== LOKALERSPEICHERUNG =====
function saveProgress() {
    localStorage.setItem('questionProgress', JSON.stringify(questionProgress));
}

function loadProgress() {
    const saved = localStorage.getItem('questionProgress');
    if (saved) {
        questionProgress = JSON.parse(saved);
    }
}

function exportProgress() {
    const data = {
        version: '1.0.0',
        exported: new Date().toISOString(),
        progress: questionProgress
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lernfortschritt_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showToast('Fortschritt exportiert', 'success');
}

function importProgress(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            questionProgress = data.progress || {};
            saveProgress();
            showToast('Fortschritt importiert', 'success');
            updateStatsScreen();
        } catch (error) {
            showToast('Fehler beim Importieren', 'error');
        }
    };
    reader.readAsText(file);
}

function resetProgress() {
    if (confirm('Möchtest du wirklich deinen gesamten Fortschritt löschen?')) {
        questionProgress = {};
        saveProgress();
        showToast('Fortschritt zurückgesetzt', 'info');
        updateStatsScreen();
    }
}

// ===== STATISTIK ANZEIGEN =====
function updateStatsScreen() {
    const totalAnswered = Object.keys(questionProgress).length;
    const totalCorrect = Object.values(questionProgress).reduce((sum, p) => sum + p.correct, 0);
    const totalWrong = Object.values(questionProgress).reduce((sum, p) => sum + p.wrong, 0);
    const totalAttempts = totalCorrect + totalWrong;
    const percentage = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

    document.getElementById('totalQuestionsAnswered').textContent = totalAnswered;
    document.getElementById('totalCorrect').textContent = totalCorrect;
    document.getElementById('totalWrong').textContent = totalWrong;
    document.getElementById('overallPercentage').textContent = `${percentage}%`;

    // Learning Status Bars
    const statusCounts = { cannot: 0, unsure: 0, confident: 0 };
    allQuestions.forEach(q => {
        statusCounts[getQuestionStatus(q.id)]++;
    });

    const statusBarsContainer = document.getElementById('learningStatusBars');
    statusBarsContainer.innerHTML = `
        ${createStatusBar('Kann ich nicht', statusCounts.cannot, allQuestions.length, 'cannot')}
        ${createStatusBar('Unsicher', statusCounts.unsure, allQuestions.length, 'unsure')}
        ${createStatusBar('Sicher', statusCounts.confident, allQuestions.length, 'confident')}
    `;

    // Topic Stats
    const topicStats = {};
    allQuestions.forEach(q => {
        if (!topicStats[q.topic]) {
            topicStats[q.topic] = { total: 0, correct: 0, wrong: 0 };
        }
        topicStats[q.topic].total++;
        const progress = questionProgress[q.id];
        if (progress) {
            topicStats[q.topic].correct += progress.correct;
            topicStats[q.topic].wrong += progress.wrong;
        }
    });

    const topicStatsContainer = document.getElementById('topicStatsContainer');
    topicStatsContainer.innerHTML = Object.entries(topicStats).map(([topic, stats]) => {
        const attempts = stats.correct + stats.wrong;
        const percent = attempts > 0 ? Math.round((stats.correct / attempts) * 100) : 0;
        return `
            <div class="status-bar">
                <div class="status-label">
                    <span><strong>${topic}</strong> (${stats.total} Fragen)</span>
                    <span>${percent}%</span>
                </div>
                <div class="status-progress">
                    <div class="status-fill confident" style="width: ${percent}%">${stats.correct}/${attempts}</div>
                </div>
            </div>
        `;
    }).join('');
}

function createStatusBar(label, count, total, type) {
    const percent = (count / total) * 100;
    return `
        <div class="status-bar">
            <div class="status-label">
                <span>${label}</span>
                <span>${count} Fragen</span>
            </div>
            <div class="status-progress">
                <div class="status-fill ${type}" style="width: ${percent}%">${count}</div>
            </div>
        </div>
    `;
}

// ===== THEME =====
function toggleTheme() {
    const currentTheme = document.documentElement.dataset.theme || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
    
    const themeIcon = document.querySelector('.theme-icon');
    themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    
    const darkModeToggle = document.getElementById('darkModeToggle');
    darkModeToggle.checked = theme === 'dark';
}

function applyTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
}

// ===== TOAST NOTIFICATIONS =====
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'toastSlideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ===== UTILITY FUNCTIONS =====
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// ===== EXPORT FÜR DEBUGGING =====
window.debugApp = {
    allQuestions,
    questionProgress,
    currentQuestions,
    getQuestionStatus
};