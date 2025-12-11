<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Services\AIRecommendationService;
use Illuminate\Http\Request;

class RecommendationController extends Controller
{
    public function __construct(
        private AIRecommendationService $recommender
    ) {
    }

    /**
     * API: الحصول على توصيات (للـ Next.js)
     * GET /api/recommendations
     */
    public function index(Request $request)
    {
        $userId = $request->user()?->id ?? 'guest';
        $limit = $request->get('limit', 10);
        $category = $request->get('category');

        $recommendations = $this->recommender->getRecommendations($userId, $limit);

        // Filter by category if specified
        if ($category) {
            $recommendations = array_filter($recommendations, function ($post) use ($category) {
                return $post->category === $category;
            });
        }

        return response()->json([
            'success' => true,
            'recommendations' => $recommendations,
            'count' => count($recommendations)
        ]);
    }

    /**
     * API: تسجيل مشاهدة
     * POST /api/track-view
     */
    public function trackView(Request $request)
    {
        $validated = $request->validate([
            'post_id' => 'required|exists:posts,id',
            'rating' => 'nullable|integer|min:1|max:5'
        ]);

        $userId = $request->user()?->id ?? 'guest';

        $success = $this->recommender->recordView(
            $userId,
            $validated['post_id'],
            $validated['rating'] ?? null
        );

        return response()->json([
            'success' => $success,
            'message' => $success ? 'تم تسجيل المشاهدة' : 'فشل التسجيل'
        ]);
    }

    /**
     * API: تسجيل إعجاب
     * POST /api/track-like
     */
    public function trackLike(Request $request)
    {
        $validated = $request->validate([
            'post_id' => 'required|exists:posts,id'
        ]);

        $userId = $request->user()?->id ?? 'guest';

        $success = $this->recommender->recordLike($userId, $validated['post_id']);

        return response()->json([
            'success' => $success,
            'message' => $success ? 'تم تسجيل الإعجاب' : 'فشل التسجيل'
        ]);
    }

    /**
     * API: إحصائيات النظام
     * GET /api/recommendation-stats
     */
    public function stats()
    {
        $stats = $this->recommender->getStats();

        return response()->json([
            'success' => true,
            'stats' => $stats
        ]);
    }

    /**
     * عرض صفحة التوصيات (Blade view)
     */
    public function show(Request $request)
    {
        $userId = $request->user()?->id;

        $recommendations = $userId
            ? $this->recommender->getRecommendations($userId, 12)
            : Post::latest()->limit(12)->get();

        return view('recommendations.index', compact('recommendations'));
    }
}
