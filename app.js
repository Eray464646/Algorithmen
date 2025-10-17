// ===== IMPORTS =====
import algorithmenQuestions from './algorithmen.js';
import mcFragen from './mc_fragen_suche_und_baeume.js';
import questionSource from './src/data/questionSource.js';
import { GamifiedQuiz } from './src/modes/gamified/GamifiedQuiz.js';
import { MultiplayerQuiz } from './src/modes/multiplayer/MultiplayerQuiz.js';

// ===== GLOBALE VARIABLEN =====
let allQuestions = [];
let currentQuestions = [];
let currentQuestionIndex = 0;
let currentMode = 'main';
let selectedTopic = 'all';
let userAnswers = [];
let questionProgress = {};
let currentProfile = null;
let profiles = {};
let gamifiedQuiz = null;
let multiplayerQuiz = null;

// ===== INITIALISIERUNG =====
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    loadQuestions();
    loadProfiles();
    checkCurrentProfile();
    setupEventListeners();
    applyTheme();
    
    // Initialize questionSource
    questionSource.initialize(algorithmenQuestions, mcFragen);
    
    // Initialize gamified quiz
    gamifiedQuiz = new GamifiedQuiz(questionSource);
    
    // Initialize multiplayer quiz
    multiplayerQuiz = new MultiplayerQuiz(questionSource);
    
    // Check if Klausurfragen are cached
    if (questionSource.hasKlausurfragenCache()) {
        showKlausurfragenTopic();
    }
}

function showKlausurfragenTopic() {
    const btn = document.getElementById('klausurfragenTopicBtn');
    if (btn) {
        btn.style.display = 'inline-block';
    }
}

// ===== PROFIL-VERWALTUNG =====
function loadProfiles() {
    const savedProfiles = localStorage.getItem('profiles');
    if (savedProfiles) {
        profiles = JSON.parse(savedProfiles);
    } else {
        // Standard-Admin-Profil erstellen
        profiles = {
            'Admin': {
                password: '4646',
                questionProgress: {},
                createdAt: new Date().toISOString(),
                isAdmin: true
            }
        };
        saveProfiles();
    }
}

function saveProfiles() {
    localStorage.setItem('profiles', JSON.stringify(profiles));
}

function checkCurrentProfile() {
    const savedCurrentProfile = localStorage.getItem('currentProfile');
    
    if (savedCurrentProfile && profiles[savedCurrentProfile]) {
        currentProfile = savedCurrentProfile;
        questionProgress = profiles[currentProfile].questionProgress || {};
        showScreen('startScreen');
        updateProfileDisplay();
    } else {
        showProfileSelection();
    }
}

function showProfileSelection() {
    showScreen('profileScreen');
    updateProfileList();
}

function updateProfileList() {
    const profileList = document.getElementById('profileList');
    profileList.innerHTML = '';
    
    Object.keys(profiles).forEach(profileName => {
        const profileCard = document.createElement('div');
        profileCard.className = 'profile-card';
        
        const isAdmin = profiles[profileName].isAdmin;
        const icon = isAdmin ? '👑' : '👤';
        
        profileCard.innerHTML = `
            <div class="profile-icon">${icon}</div>
            <div class="profile-name">${profileName}</div>
            <button class="btn btn-primary profile-select-btn" data-profile="${profileName}">
                Auswählen
            </button>
            ${!isAdmin ? `<button class="btn btn-danger profile-delete-btn" data-profile="${profileName}">🗑️</button>` : ''}
        `;
        
        profileList.appendChild(profileCard);
    });
    
    // Event Listeners für Profil-Buttons
    document.querySelectorAll('.profile-select-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const profileName = e.target.dataset.profile;
            selectProfile(profileName);
        });
    });
    
    document.querySelectorAll('.profile-delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const profileName = e.target.dataset.profile;
            deleteProfile(profileName);
        });
    });
}

function selectProfile(profileName) {
    const profile = profiles[profileName];
    
    if (profile.password) {
        const password = prompt(`Passwort für ${profileName}:`);
        if (password !== profile.password) {
            showToast('Falsches Passwort!', 'error');
            return;
        }
    }
    
    currentProfile = profileName;
    questionProgress = profile.questionProgress || {};
    localStorage.setItem('currentProfile', profileName);
    
    showScreen('startScreen');
    updateProfileDisplay();
    showToast(`Willkommen, ${profileName}!`, 'success');
}

function createNewProfile() {
    const name = prompt('Profilname:');
    if (!name || name.trim() === '') {
        showToast('Ungültiger Name', 'error');
        return;
    }
    
    if (profiles[name]) {
        showToast('Profil existiert bereits', 'error');
        return;
    }
    
    const usePassword = confirm('Möchtest du ein Passwort setzen?');
    let password = null;
    
    if (usePassword) {
        password = prompt('Passwort eingeben:');
        if (!password) {
            showToast('Profil-Erstellung abgebrochen', 'info');
            return;
        }
    }
    
    profiles[name] = {
        password: password,
        questionProgress: {},
        createdAt: new Date().toISOString(),
        isAdmin: false
    };
    
    saveProfiles();
    updateProfileList();
    showToast(`Profil "${name}" erstellt!`, 'success');
}

function deleteProfile(profileName) {
    if (confirm(`Profil "${profileName}" wirklich löschen?`)) {
        delete profiles[profileName];
        saveProfiles();
        updateProfileList();
        showToast('Profil gelöscht', 'info');
    }
}

function switchProfile() {
    if (confirm('Profil wechseln? Dein aktueller Fortschritt wird gespeichert.')) {
        saveProgress();
        showProfileSelection();
    }
}

function logoutProfile() {
    if (confirm('Abmelden? Du kannst dich jederzeit wieder anmelden.')) {
        saveProgress();
        currentProfile = null;
        localStorage.removeItem('currentProfile');
        showProfileSelection();
        showToast('Erfolgreich abgemeldet', 'info');
    }
}

function updateProfileDisplay() {
    const profileNameElement = document.getElementById('currentProfileName');
    if (profileNameElement && currentProfile) {
        const isAdmin = profiles[currentProfile]?.isAdmin;
        const icon = isAdmin ? '👑' : '👤';
        profileNameElement.textContent = `${icon} ${currentProfile}`;
    }
}

// ===== FRAGEN LADEN UND VERARBEITEN =====
function loadQuestions() {
    // Fragen aus algorithmen.js verarbeiten
    const processedAlgoQuestions = algorithmenQuestions.map((q, index) => {
        if (q.write) {
            return convertOpenToMC(q, index);
        } else {
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

function convertOpenToMC(question, index) {
    const id = question.id || `open_${index}`;
    const solutionText = extractTextFromHTML(question.solution);
    const options = generateOptionsFromSolution(solutionText, question.question);
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
    const options = [];
    options.push(simplifyCorrectAnswer(solution));
    options.push(...generateWrongOptions(solution, question));
    
    const correctOption = options[0];
    const wrongOptions = options.slice(1);
    shuffleArray(wrongOptions);
    
    return [correctOption, ...wrongOptions.slice(0, 3)];
}

function simplifyCorrectAnswer(solution) {
    const sentences = solution.split(/[.!?]+/).filter(s => s.trim().length > 20);
    if (sentences.length > 0) {
        return sentences[0].trim() + '.';
    }
    return solution.substring(0, 150) + '...';
}

function generateWrongOptions(solution, question) {
    const wrongOptions = [];
    
    const patterns = [
        "Dies ist nicht korrekt, da es dem Grundprinzip widerspricht.",
        "Diese Aussage trifft nicht zu, da wichtige Aspekte fehlen.",
        "Dies ist eine häufige Fehlvorstellung zu diesem Thema.",
        "Diese Antwort ist unvollständig und berücksichtigt nicht alle Faktoren."
    ];
    
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

    // Profil-Management
    document.getElementById('createProfileBtn').addEventListener('click', createNewProfile);
    document.getElementById('switchProfileBtn').addEventListener('click', switchProfile);
    document.getElementById('logoutProfileBtn').addEventListener('click', logoutProfile);
}

// ===== NAVIGATION =====
function switchMode(mode) {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');

    switch(mode) {
        case 'main':
        case 'learn':
            showScreen('startScreen');
            currentMode = mode;
            break;
        case 'gamified':
            showScreen('gamifiedStartScreen');
            if (gamifiedQuiz) {
                gamifiedQuiz.init();
            }
            break;
        case 'multiplayer':
            showScreen('multiplayerStartScreen');
            if (multiplayerQuiz) {
                multiplayerQuiz.init();
            }
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

    let filteredQuestions = selectedTopic === 'all' 
        ? [...allQuestions]
        : allQuestions.filter(q => q.topic === selectedTopic);

    if (mode === 'learn') {
        filteredQuestions = filteredQuestions.filter(q => {
            const status = getQuestionStatus(q.id);
            return status !== 'confident';
        });

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

    // Shuffle the questions order
    currentQuestions = shuffleArray(filteredQuestions);
    
    // Shuffle answer options for each question
    currentQuestions = currentQuestions.map(q => shuffleAnswerOptions(q));
    
    showScreen('quizScreen');
    displayQuestion();
}

// ===== FRAGE ANZEIGEN =====
function displayQuestion() {
    const question = currentQuestions[currentQuestionIndex];
    
    document.getElementById('questionCounter').textContent = 
        `Frage ${currentQuestionIndex + 1} von ${currentQuestions.length}`;
    document.getElementById('topicBadge').textContent = question.topic;
    document.getElementById('progressFill').style.width = 
        `${((currentQuestionIndex + 1) / currentQuestions.length) * 100}%`;

    document.getElementById('questionText').textContent = question.question;

    const correctCount = question.correctIndices.length;
    const correctInfo = correctCount === 1 
        ? 'Diese Frage hat 1 richtige Antwort'
        : `Diese Frage hat ${correctCount} richtige Antworten`;
    document.getElementById('correctAnswersInfo').textContent = correctInfo;

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

    document.getElementById('feedbackContainer').classList.add('hidden');
    document.getElementById('prevBtn').disabled = currentQuestionIndex === 0;
    document.getElementById('nextBtn').disabled = true;
}

// ===== ANTWORT AUSWÄHLEN =====
function selectAnswer(selectedIndex) {
    const question = currentQuestions[currentQuestionIndex];
    const answerButtons = document.querySelectorAll('.answer-btn');
    
    if (userAnswers[currentQuestionIndex]) return;

    const isCorrect = question.correctIndices.includes(selectedIndex);
    
    answerButtons[selectedIndex].classList.add(isCorrect ? 'correct' : 'wrong');
    
    question.correctIndices.forEach(idx => {
        answerButtons[idx].classList.add('correct');
    });

    answerButtons.forEach(btn => btn.disabled = true);

    userAnswers[currentQuestionIndex] = {
        selectedIndex,
        isCorrect,
        questionId: question.id
    };

    updateQuestionProgress(question.id, isCorrect);
    showFeedback(isCorrect, question.feedback);
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

    document.getElementById('correctCount').textContent = correctCount;
    document.getElementById('wrongCount').textContent = wrongCount;
    document.getElementById('percentageCount').textContent = `${percentage}%`;

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
    saveProgress();
}

function getQuestionStatus(questionId) {
    const progress = questionProgress[questionId];
    
    if (!progress || progress.correct === 0) {
        return 'cannot';
    }
    
    if (progress.wrong > 0 && progress.correct < 2) {
        return 'unsure';
    }
    
    if (progress.correct >= 2 && progress.wrong === 0) {
        return 'confident';
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

// ===== LOKALSPEICHERUNG =====
function saveProgress() {
    if (currentProfile && profiles[currentProfile]) {
        profiles[currentProfile].questionProgress = questionProgress;
        saveProfiles();
    }
}

function loadProgress() {
    if (currentProfile && profiles[currentProfile]) {
        questionProgress = profiles[currentProfile].questionProgress || {};
    }
}

function exportProgress() {
    const data = {
        version: '1.0.0',
        exported: new Date().toISOString(),
        profile: currentProfile,
        progress: questionProgress
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lernfortschritt_${currentProfile}_${new Date().toISOString().split('T')[0]}.json`;
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

// Shuffle answer options and update correct indices accordingly
function shuffleAnswerOptions(question) {
    // Don't shuffle if there are no options or if it's a generated question
    if (!question.options || question.options.length === 0) {
        return question;
    }
    
    // Create a copy of the question to avoid modifying the original
    const shuffledQuestion = { ...question };
    
    // Create an array of indices with their corresponding options
    const indexedOptions = question.options.map((option, index) => ({
        option: option,
        originalIndex: index,
        isCorrect: question.correctIndices.includes(index)
    }));
    
    // Shuffle the indexed options
    const shuffledIndexedOptions = shuffleArray(indexedOptions);
    
    // Extract the new options and correct indices
    shuffledQuestion.options = shuffledIndexedOptions.map(item => item.option);
    shuffledQuestion.correctIndices = shuffledIndexedOptions
        .map((item, newIndex) => item.isCorrect ? newIndex : null)
        .filter(idx => idx !== null);
    
    return shuffledQuestion;
}

// ===== EXPORT FÜR DEBUGGING =====
window.debugApp = {
    allQuestions,
    questionProgress,
    currentQuestions,
    getQuestionStatus,
    profiles,
    currentProfile
};
