'use client';

import { useEffect, useState } from 'react';
import { getRecommendations, trackInteraction, type Recommendation } from '@/lib/api/recommendations';

interface RecommendedPostsProps {
    userId: string;
    limit?: number;
    category?: string;
    className?: string;
}

export default function RecommendedPosts({
    userId,
    limit = 6,
    category,
    className = '',
}: RecommendedPostsProps) {
    const [posts, setPosts] = useState<Recommendation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadRecommendations();
    }, [userId, limit, category]);

    async function loadRecommendations() {
        try {
            setLoading(true);
            setError(null);
            const recommendations = await getRecommendations(userId, limit, category);
            setPosts(recommendations);
        } catch (err) {
            setError('فشل تحميل التوصيات');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function handlePostClick(postId: string) {
        // Track interaction
        await trackInteraction(userId, postId, 'view');

        // Navigate to post (customize based on your routing)
        window.location.href = `/posts/${postId}`;
    }

    if (loading) {
        return (
            <div className={`recommended-posts ${className}`}>
                <h2 className="text-2xl font-bold mb-6">مقالات موصى بها</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(limit)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                            <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
                            <div className="bg-gray-200 h-4 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`recommended-posts ${className}`}>
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
                    {error}
                </div>
            </div>
        );
    }

    if (posts.length === 0) {
        return null;
    }

    return (
        <div className={`recommended-posts ${className}`}>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">✨ مقالات موصى بها لك</h2>
                <button
                    onClick={loadRecommendations}
                    className="text-sm text-blue-600 hover:text-blue-800"
                >
                    🔄 تحديث
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                    <article
                        key={post.id}
                        onClick={() => handlePostClick(post.id)}
                        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer border-r-4 border-blue-500"
                    >
                        <div className="p-6">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                                    {post.category}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold mb-3 text-gray-900 hover:text-blue-600">
                                {post.title}
                            </h3>

                            {post.description && (
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                    {post.description}
                                </p>
                            )}

                            <div className="flex flex-wrap gap-2">
                                {post.tags.slice(0, 3).map((tag) => (
                                    <span
                                        key={tag}
                                        className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}
