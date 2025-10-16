/**
 * PDF Parser for Klausurfragen
 * Extracts questions and answers from PDF using PDF.js
 */

// PDF.js will be loaded dynamically
let pdfjsLib = null;

/**
 * Initialize PDF.js library
 */
async function initPDFJS() {
    if (pdfjsLib) return;
    
    // Load PDF.js from CDN
    if (typeof window.pdfjsLib === 'undefined') {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
    }
    
    pdfjsLib = window['pdfjs-dist/build/pdf'];
    if (!pdfjsLib) {
        pdfjsLib = window.pdfjsLib;
    }
    
    if (pdfjsLib && pdfjsLib.GlobalWorkerOptions) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
}

/**
 * Load external script
 */
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

/**
 * Load and parse Klausurfragen PDF
 * @param {File|Blob} file - PDF file
 * @returns {Promise<Array>} Array of parsed questions
 */
export async function loadKlausurfragenFromPDF(file) {
    try {
        await initPDFJS();
        
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        let fullText = '';
        
        // Extract text from all pages
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n\n';
        }
        
        // Parse questions from text
        const questions = parseQuestionsFromText(fullText);
        
        console.log(`Parsed ${questions.length} questions from PDF`);
        return questions;
        
    } catch (error) {
        console.error('Error parsing PDF:', error);
        throw new Error('Fehler beim Laden der PDF: ' + error.message);
    }
}

/**
 * Parse questions from extracted PDF text
 * Uses heuristics to identify question blocks, answers, and correct solutions
 */
function parseQuestionsFromText(text) {
    const questions = [];
    
    // Normalize text
    text = normalizeText(text);
    
    // Try different question patterns
    const patterns = [
        // Pattern 1: Numbered questions (1., 2., etc.)
        /(\d+)\.\s*([^?]+\?)\s*((?:[A-D]\)|a-d\)|[A-D]\.|a-d\.)[\s\S]*?)(?=\d+\.\s|$)/gi,
        // Pattern 2: Questions with "Frage" prefix
        /Frage\s*(\d+)[:.]?\s*([^?]+\?)\s*((?:[A-D]\)|a-d\)|[A-D]\.|a-d\.)[\s\S]*?)(?=Frage\s*\d+|$)/gi,
        // Pattern 3: Simple question blocks
        /([^?]+\?)\s*((?:[A-D]\)|a-d\)|[A-D]\.|a-d\.)[\s\S]*?)(?=[^?]+\?|$)/gi
    ];
    
    for (const pattern of patterns) {
        const matches = [...text.matchAll(pattern)];
        if (matches.length > 0) {
            matches.forEach((match, idx) => {
                try {
                    const question = parseQuestionBlock(match, idx + 1);
                    if (question) {
                        questions.push(question);
                    }
                } catch (error) {
                    console.warn('Failed to parse question block:', error);
                }
            });
            break; // Use first successful pattern
        }
    }
    
    // Fallback: if no structured questions found, create from text sections
    if (questions.length === 0) {
        console.warn('No structured questions found, creating fallback questions');
        const fallbackQuestions = createFallbackQuestions(text);
        questions.push(...fallbackQuestions);
    }
    
    return questions;
}

/**
 * Parse individual question block
 */
function parseQuestionBlock(match, index) {
    let questionText, answersText;
    
    // Extract question and answers based on match groups
    if (match.length === 4) {
        // Pattern 1 or 2 (with number)
        questionText = match[2].trim();
        answersText = match[3].trim();
    } else if (match.length === 3) {
        // Pattern 3 (no number)
        questionText = match[1].trim();
        answersText = match[2].trim();
    } else {
        return null;
    }
    
    // Parse answer choices
    const choices = parseAnswerChoices(answersText);
    
    if (choices.length < 2) {
        // Not a valid MC question, treat as open question
        return {
            id: `klausur_${index}_${Date.now()}`,
            topic: 'Klausurfragen',
            type: 'open',
            question: questionText,
            solution: answersText,
            source: 'klausur'
        };
    }
    
    // Find correct answer
    const correctIndex = findCorrectAnswer(answersText, choices);
    
    return {
        id: `klausur_${index}_${Date.now()}`,
        topic: 'Klausurfragen',
        type: 'mc',
        question: questionText,
        choices: choices.map(c => c.text),
        correctIndex: correctIndex !== -1 ? correctIndex : 0,
        solution: choices[correctIndex]?.text || '',
        source: 'klausur'
    };
}

/**
 * Parse answer choices from text
 */
function parseAnswerChoices(text) {
    const choices = [];
    
    // Pattern for answer options: A), B), C), D) or a), b), c), d) or A., B., etc.
    const patterns = [
        /([A-D])\)\s*([^\n]+?)(?=[A-D]\)|$)/gi,
        /([a-d])\)\s*([^\n]+?)(?=[a-d]\)|$)/gi,
        /([A-D])\.\s*([^\n]+?)(?=[A-D]\.|$)/gi,
        /([a-d])\.\s*([^\n]+?)(?=[a-d]\.|$)/gi,
        /(\d+)\)\s*([^\n]+?)(?=\d+\)|$)/gi
    ];
    
    for (const pattern of patterns) {
        const matches = [...text.matchAll(pattern)];
        if (matches.length >= 2) {
            matches.forEach(match => {
                choices.push({
                    label: match[1],
                    text: match[2].trim()
                });
            });
            break;
        }
    }
    
    return choices;
}

/**
 * Find the correct answer index
 * Looks for markers like *, ✓, "Richtig:", "Lösung:", or highlight indicators
 */
function findCorrectAnswer(text, choices) {
    // Check for explicit markers
    const correctMarkers = [
        /\*\s*([A-D])\)/i,  // * A)
        /✓\s*([A-D])\)/i,   // ✓ A)
        /richtig:\s*([A-D])/i,
        /lösung:\s*([A-D])/i,
        /korrekt:\s*([A-D])/i,
        /antwort:\s*([A-D])/i
    ];
    
    for (const marker of correctMarkers) {
        const match = text.match(marker);
        if (match) {
            const letter = match[1].toUpperCase();
            const index = letter.charCodeAt(0) - 'A'.charCodeAt(0);
            if (index >= 0 && index < choices.length) {
                return index;
            }
        }
    }
    
    // Default to first choice if no marker found
    return 0;
}

/**
 * Normalize text: remove excess whitespace, fix hyphenation, etc.
 */
function normalizeText(text) {
    return text
        .replace(/\s+/g, ' ')           // Collapse whitespace
        .replace(/- \n/g, '')           // Remove hyphenation at line breaks
        .replace(/\n{3,}/g, '\n\n')     // Limit consecutive newlines
        .trim();
}

/**
 * Create fallback questions when no structured format is detected
 */
function createFallbackQuestions(text) {
    const questions = [];
    
    // Split by double newlines or question marks
    const sections = text.split(/\n\n+/).filter(s => s.trim().length > 50);
    
    sections.forEach((section, idx) => {
        if (section.includes('?')) {
            questions.push({
                id: `klausur_fallback_${idx}_${Date.now()}`,
                topic: 'Klausurfragen',
                type: 'open',
                question: section.trim(),
                solution: 'Siehe PDF für vollständige Lösung',
                source: 'klausur'
            });
        }
    });
    
    return questions.slice(0, 10); // Limit fallback questions
}
