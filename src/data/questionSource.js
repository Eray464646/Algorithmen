// Central question data adapter with PDF import support

/**
 * Question type definition
 * @typedef {Object} Question
 * @property {string} id - Unique question identifier
 * @property {string} topic - Topic/category name
 * @property {'mc'|'open'} type - Question type
 * @property {string} question - Question text
 * @property {string[]} [choices] - Answer choices for MC questions
 * @property {number} [correctIndex] - Index of correct answer for MC questions
 * @property {string} [solution] - Solution explanation
 * @property {'base'|'klausur'} source - Source of the question
 */

import { loadKlausurfragenFromPDF } from '../utils/pdf/parseKlausur.js';

class QuestionSource {
    constructor() {
        this.baseQuestions = [];
        this.klausurQuestions = [];
        this.pdfCache = null;
    }

    /**
     * Initialize with base questions from existing data
     * @param {Array} algoQuestions - Questions from algorithmen.js
     * @param {Array} mcQuestions - Questions from mc_fragen_suche_und_baeume.js
     */
    initialize(algoQuestions, mcQuestions) {
        this.baseQuestions = this._normalizeQuestions(algoQuestions, mcQuestions);
    }

    /**
     * Normalize questions from different sources into unified format
     */
    _normalizeQuestions(algoQuestions, mcQuestions) {
        const normalized = [];

        // Process algorithmen.js questions
        algoQuestions.forEach((q, index) => {
            if (q.write) {
                // Skip write-type questions or convert them
                normalized.push(this._convertOpenToMC(q, index));
            } else {
                const correctIndices = q.options
                    .map((opt, idx) => (typeof opt === 'object' && opt.correct) ? idx : null)
                    .filter(idx => idx !== null);

                normalized.push({
                    id: q.id || `algo_${index}`,
                    topic: q.topic || 'Algorithmen',
                    type: 'mc',
                    question: q.question,
                    choices: q.options.map(opt => typeof opt === 'string' ? opt : opt.text),
                    correctIndex: correctIndices.length === 1 ? correctIndices[0] : correctIndices[0],
                    solution: q.feedback || '',
                    source: 'base'
                });
            }
        });

        // Process mc_fragen questions
        mcQuestions.forEach(q => {
            normalized.push({
                id: q.id || `mc_${q.id}`,
                topic: 'Suche & Bäume',
                type: 'mc',
                question: q.question,
                choices: q.options,
                correctIndex: q.correctIndex,
                solution: q.explanation || '',
                source: 'base'
            });
        });

        return normalized;
    }

    _convertOpenToMC(question, index) {
        // Simple conversion for open questions
        return {
            id: question.id || `open_${index}`,
            topic: question.topic || 'Algorithmen',
            type: 'open',
            question: question.question,
            solution: this._extractTextFromHTML(question.solution),
            source: 'base'
        };
    }

    _extractTextFromHTML(html) {
        if (typeof html !== 'string') return '';
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    }

    /**
     * Load Klausurfragen from PDF file
     * @param {File|Blob} pdfFile - PDF file to parse
     * @returns {Promise<number>} Number of questions loaded
     */
    async loadKlausurfragenPDF(pdfFile) {
        try {
            const questions = await loadKlausurfragenFromPDF(pdfFile);
            this.klausurQuestions = questions;
            
            // Cache in localStorage
            const hash = await this._hashFile(pdfFile);
            const cacheData = {
                hash,
                questions,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('klausurfragen_cache', JSON.stringify(cacheData));
            
            return questions.length;
        } catch (error) {
            console.error('Error loading Klausurfragen PDF:', error);
            throw error;
        }
    }

    /**
     * Check if Klausurfragen are cached
     * @returns {boolean}
     */
    hasKlausurfragenCache() {
        const cache = localStorage.getItem('klausurfragen_cache');
        if (!cache) return false;
        
        try {
            const data = JSON.parse(cache);
            this.klausurQuestions = data.questions || [];
            return this.klausurQuestions.length > 0;
        } catch {
            return false;
        }
    }

    /**
     * Clear Klausurfragen cache
     */
    clearKlausurfragenCache() {
        localStorage.removeItem('klausurfragen_cache');
        this.klausurQuestions = [];
    }

    /**
     * Get questions by topics
     * @param {string[]} topics - Array of topic names
     * @returns {Question[]} Filtered questions
     */
    getQuestionsByTopics(topics) {
        let allQuestions = [...this.baseQuestions];
        
        // Add Klausurfragen if requested or if 'all' is selected
        if (topics.includes('Klausurfragen') || topics.includes('all')) {
            allQuestions = [...allQuestions, ...this.klausurQuestions];
        }

        // Filter by topics
        if (!topics.includes('all') && topics.length > 0) {
            allQuestions = allQuestions.filter(q => topics.includes(q.topic));
        }

        return allQuestions;
    }

    /**
     * Get all available topics
     * @returns {string[]} Array of topic names
     */
    getAllTopics() {
        const topics = new Set(this.baseQuestions.map(q => q.topic));
        if (this.klausurQuestions.length > 0) {
            topics.add('Klausurfragen');
        }
        return Array.from(topics);
    }

    /**
     * Hash file for caching
     */
    async _hashFile(file) {
        const buffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
}

// Singleton instance
const questionSource = new QuestionSource();

export default questionSource;
export { loadKlausurfragenFromPDF };
