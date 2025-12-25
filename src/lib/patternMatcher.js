// Pattern Matcher for Al-Awad Chatbot
// Intelligent question understanding and intent detection

import { KNOWLEDGE_BASE, KEYWORDS } from './knowledgeBase';

/**
 * Find the best matching response for a user question
 * @param {string} userMessage - The user's question
 * @returns {object} - Best matching response with confidence score
 */
export function findBestMatch(userMessage) {
    const normalizedMessage = normalizeText(userMessage);
    const words = extractWords(normalizedMessage);

    // Try to find exact or close matches
    let bestMatch = null;
    let highestScore = 0;

    // Check all categories
    const categories = [
        { name: 'products', data: KNOWLEDGE_BASE.products },
        { name: 'benefits', data: KNOWLEDGE_BASE.benefits },
        { name: 'usage', data: KNOWLEDGE_BASE.usage },
        { name: 'storage', data: KNOWLEDGE_BASE.storage },
        { name: 'recipes', data: KNOWLEDGE_BASE.recipes },
        { name: 'general', data: KNOWLEDGE_BASE.general },
        { name: 'shopping', data: KNOWLEDGE_BASE.shopping },
        { name: 'conditions', data: KNOWLEDGE_BASE.conditions },
        { name: 'fun', data: KNOWLEDGE_BASE.fun }
    ];

    for (const category of categories) {
        const match = matchInCategory(words, category);
        if (match && match.score > highestScore) {
            highestScore = match.score;
            bestMatch = match;
        }
    }

    return bestMatch || getFallbackResponse();
}

/**
 * Match question against a specific category
 */
function matchInCategory(words, category) {
    if (category.name === 'products') {
        return matchProducts(words, category.data);
    }

    // For array-based categories (benefits, usage, etc.)
    if (Array.isArray(category.data)) {
        return matchArray(words, category.data);
    }

    return null;
}

/**
 * Match against product database
 */
function matchProducts(words, products) {
    let bestProduct = null;
    let highestScore = 0;

    for (const [productName, productData] of Object.entries(products)) {
        const score = calculateProductScore(words, productName, productData);
        if (score > highestScore) {
            highestScore = score;
            bestProduct = {
                type: 'product',
                data: productData,
                score: score,
                response: formatProductResponse(productData)
            };
        }
    }

    return highestScore > 0.3 ? bestProduct : null;
}

/**
 * Match against array-based Q&A
 */
function matchArray(words, dataArray) {
    let bestMatch = null;
    let highestScore = 0;

    for (const item of dataArray) {
        const score = calculateArrayScore(words, item.question);
        if (score > highestScore) {
            highestScore = score;
            bestMatch = {
                type: 'qa',
                data: item,
                score: score,
                response: item.answer
            };
        }
    }

    return highestScore > 0.4 ? bestMatch : null;
}

/**
 * Calculate score for product matching
 */
function calculateProductScore(words, productName, productData) {
    let score = 0;
    const productWords = extractWords(productName);
    const benefitWords = productData.benefits.flatMap(b => extractWords(b));
    const bestForWords = productData.bestFor.flatMap(b => extractWords(b));

    // Check product name match
    for (const word of words) {
        if (productWords.includes(word)) score += 0.5;
        if (benefitWords.includes(word)) score += 0.3;
        if (bestForWords.includes(word)) score += 0.2;
    }

    return Math.min(score, 1);
}

/**
 * Calculate score for array item matching
 */
function calculateArrayScore(words, questionKeywords) {
    let matches = 0;
    for (const word of words) {
        if (questionKeywords.some(keyword => word.includes(keyword) || keyword.includes(word))) {
            matches++;
        }
    }
    return matches / Math.max(words.length, questionKeywords.length);
}

/**
 * Format product response
 */
function formatProductResponse(product) {
    return `🍯 ${product.name}\n\n` +
        `💰 السعر: ${product.price} درهم\n` +
        `✨ ${product.description}\n\n` +
        `📍 المصدر: ${product.origin}\n` +
        `💡 الاستعمال: ${product.usage}`;
}

/**
 * Normalize Arabic text
 */
function normalizeText(text) {
    return text
        .toLowerCase()
        .replace(/أ|إ|آ/g, 'ا')
        .replace(/ة/g, 'ه')
        .replace(/ى/g, 'ي')
        .trim();
}

/**
 * Extract meaningful words
 */
function extractWords(text) {
    const normalized = normalizeText(text);
    const stopWords = ['في', 'من', 'على', 'إلى', 'عن', 'مع', 'هل', 'ما', 'لي', 'ال', 'و', 'أو'];

    return normalized
        .split(/\s+/)
        .filter(word => word.length > 1 && !stopWords.includes(word));
}

/**
 * Get fallback response when no match found
 */
function getFallbackResponse() {
    return {
        type: 'fallback',
        score: 0,
        response: '🐝 معذرة، ما فهمتش السؤال مزيان.\n\n' +
            'ممكن تعاود بطريقة أخرى؟ أو اختار من هاد المواضيع:\n\n' +
            '🍯 أنواع العسل\n' +
            '💡 فوائد العسل\n' +
            '📖 وصفات بالعسل\n' +
            '🛒 كيفاش نشري العسل\n' +
            '❓ أسئلة عامة'
    };
}

/**
 * Detect if question is about product recommendation
 */
export function detectProductRecommendation(message) {
    const normalizedMessage = normalizeText(message);
    const recommendationKeywords = ['أحسن', 'أفضل', 'نصحني', 'اقترح', 'بغيت', 'محتاج'];

    return recommendationKeywords.some(keyword => normalizedMessage.includes(keyword));
}

/**
 * Get product recommendation based on need
 */
export function getProductRecommendation(message) {
    const normalizedMessage = normalizeText(message);
    const words = extractWords(normalizedMessage);

    // Check for specific needs
    if (words.some(w => ['سعال', 'كحه', 'برد'].includes(w))) {
        return KNOWLEDGE_BASE.products['عسل الزعتر'];
    }

    if (words.some(w => ['طفل', 'درار', 'صغير'].includes(w))) {
        return KNOWLEDGE_BASE.products['عسل الأكاسيا'];
    }

    if (words.some(w => ['ربو', 'حساسيه', 'صدر'].includes(w))) {
        return KNOWLEDGE_BASE.products['عسل الأوكالبتوس'];
    }

    if (words.some(w => ['هديه', 'فاخر', 'مناسبه'].includes(w))) {
        return KNOWLEDGE_BASE.products['عسل السدر'];
    }

    if (words.some(w => ['علاج', 'جروح', 'بكتيريا'].includes(w))) {
        return KNOWLEDGE_BASE.products['عسل المانوكا'];
    }

    // Default recommendation
    return KNOWLEDGE_BASE.products['عسل الزهور'];
}
