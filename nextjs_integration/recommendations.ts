// lib/api/recommendations.ts
// Next.js API Client for AI Recommendations

const API_BASE = process.env.NEXT_PUBLIC_RECOMMENDER_API || 'https://api.yourdomain.com';

export interface Recommendation {
    id: string;
    title: string;
    category: string;
    tags: string[];
    description?: string;
    popularity?: number;
}

export interface RecommendationsResponse {
    success: boolean;
    user_id: string;
    recommendations: Recommendation[];
    count: number;
}

/**
 * Get personalized recommendations
 */
export async function getRecommendations(
    userId: string,
    limit: number = 10,
    category?: string
): Promise<Recommendation[]> {
    try {
        const params = new URLSearchParams({
            num: limit.toString(),
            ...(category && { category }),
        });

        const response = await fetch(
            `${API_BASE}/api/recommendations/${userId}?${params}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                cache: 'no-store', // Always fresh recommendations
            }
        );

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data: RecommendationsResponse = await response.json();
        return data.recommendations || [];
    } catch (error) {
        console.error('Failed to fetch recommendations:', error);
        return [];
    }
}

/**
 * Track user interaction (view, like, etc.)
 */
export async function trackInteraction(
    userId: string,
    contentId: string,
    type: 'view' | 'like' | 'share' = 'view',
    rating?: number
): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE}/api/interact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: userId,
                content_id: contentId,
                type,
                rating,
            }),
        });

        const data = await response.json();
        return data.success || false;
    } catch (error) {
        console.error('Failed to track interaction:', error);
        return false;
    }
}

/**
 * Get system stats
 */
export async function getStats() {
    try {
        const response = await fetch(`${API_BASE}/api/stats`);
        const data = await response.json();
        return data.stats || null;
    } catch (error) {
        console.error('Failed to fetch stats:', error);
        return null;
    }
}
