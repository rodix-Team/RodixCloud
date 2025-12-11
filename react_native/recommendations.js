// React Native - API Client
// src/api/recommendations.js

const API_BASE = 'https://your-laravel-backend.com';

/**
 * الحصول على توصيات
 */
export const getRecommendations = async (userId, limit = 10, category = null) => {
    try {
        const params = new URLSearchParams({
            user_id: userId,
            limit: limit.toString(),
        });

        if (category) {
            params.append('category', category);
        }

        const response = await fetch(
            `${API_BASE}/api/v1/recommendations?${params.toString()}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            }
        );

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.recommendations || [];
    } catch (error) {
        console.error('Failed to fetch recommendations:', error);
        return [];
    }
};

/**
 * تسجيل مشاهدة
 */
export const trackView = async (userId, contentId, rating = null) => {
    try {
        const response = await fetch(`${API_BASE}/api/v1/track-view`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                user_id: userId,
                content_id: contentId,
                rating: rating,
            }),
        });

        return response.ok;
    } catch (error) {
        console.error('Failed to track view:', error);
        return false;
    }
};

/**
 * تسجيل إعجاب
 */
export const trackLike = async (userId, contentId) => {
    try {
        const response = await fetch(`${API_BASE}/api/v1/track-like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                user_id: userId,
                content_id: contentId,
            }),
        });

        return response.ok;
    } catch (error) {
        console.error('Failed to track like:', error);
        return false;
    }
};
