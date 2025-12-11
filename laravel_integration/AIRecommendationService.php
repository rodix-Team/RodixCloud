<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use App\Models\Post;

class AIRecommendationService
{
    private string $pythonScript;
    private string $dataFile;

    public function __construct()
    {
        // Update these paths based on your server structure
        $this->pythonScript = base_path('recommendation_system/recommendation_service.py');
        $this->dataFile = storage_path('app/recommender_data.json');
    }

    /**
     * إضافة محتوى للنظام
     */
    public function addContent($post): bool
    {
        $command = [
            'action' => 'add_content',
            'data' => [
                'id' => (string) $post->id,
                'title' => $post->title,
                'category' => $post->category ?? 'عام',
                'tags' => is_array($post->tags) ? $post->tags : json_decode($post->tags ?? '[]', true),
                'description' => $post->excerpt ?? $post->description ?? ''
            ]
        ];

        $result = $this->executeCommand($command);
        return $result && $result['success'];
    }

    /**
     * إضافة/تحديث مستخدم
     */
    public function syncUser($user): bool
    {
        $interests = $this->extractUserInterests($user);

        $command = [
            'action' => 'add_user',
            'data' => [
                'id' => (string) $user->id,
                'interests' => $interests
            ]
        ];

        $result = $this->executeCommand($command);
        return $result && $result['success'];
    }

    /**
     * تسجيل مشاهدة/تفاعل
     */
    public function recordView(int|string $userId, int|string $contentId, ?int $rating = null): bool
    {
        return $this->recordInteraction($userId, $contentId, 'view', $rating);
    }

    /**
     * تسجيل إعجاب
     */
    public function recordLike(int|string $userId, int|string $contentId): bool
    {
        return $this->recordInteraction($userId, $contentId, 'like', 5);
    }

    /**
     * تسجيل تفاعل عام
     */
    public function recordInteraction(
        int|string $userId,
        int|string $contentId,
        string $type = 'view',
        ?int $rating = null
    ): bool {
        $command = [
            'action' => 'record_interaction',
            'data' => [
                'user_id' => (string) $userId,
                'content_id' => (string) $contentId,
                'type' => $type,
                'rating' => $rating
            ]
        ];

        $result = $this->executeCommand($command);
        return $result && $result['success'];
    }

    /**
     * الحصول على توصيات
     */
    public function getRecommendations(int|string $userId, int $limit = 10): array
    {
        $command = [
            'action' => 'get_recommendations',
            'data' => [
                'user_id' => (string) $userId,
                'num' => $limit
            ]
        ];

        $result = $this->executeCommand($command);

        if ($result && $result['success'] && isset($result['data'])) {
            return $this->hydrateRecommendations($result['data']);
        }

        return [];
    }

    /**
     * الحصول على إحصائيات النظام
     */
    public function getStats(): ?array
    {
        $command = ['action' => 'get_stats'];

        $result = $this->executeCommand($command);

        if ($result && $result['success']) {
            return $result['data'];
        }

        return null;
    }

    /**
     * تنفيذ أمر Python
     */
    private function executeCommand(array $command): ?array
    {
        $json = json_encode($command, JSON_UNESCAPED_UNICODE);
        $escapedJson = escapeshellarg($json);

        // Build command
        $cmd = "python3 {$this->pythonScript} {$escapedJson} 2>&1";

        // Execute
        $output = shell_exec($cmd);

        if (!$output) {
            Log::error('Recommendation service returned no output', [
                'command' => $command,
                'script' => $this->pythonScript
            ]);
            return null;
        }

        // Parse JSON response
        $result = json_decode($output, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            Log::error('Recommendation service returned invalid JSON', [
                'command' => $command,
                'output' => $output,
                'error' => json_last_error_msg()
            ]);
            return null;
        }

        if (!$result['success']) {
            Log::warning('Recommendation service reported failure', [
                'command' => $command,
                'result' => $result
            ]);
        }

        return $result;
    }

    /**
     * استخراج اهتمامات المستخدم من نشاطه
     */
    private function extractUserInterests($user): array
    {
        $interests = [];

        // من الـ categories المفضلة (إذا موجودة)
        if (property_exists($user, 'favorite_categories') && $user->favorite_categories) {
            $favorites = is_array($user->favorite_categories)
                ? $user->favorite_categories
                : json_decode($user->favorite_categories, true);

            if ($favorites) {
                $interests = array_merge($interests, $favorites);
            }
        }

        // من المقالات اللي قراها (آخر 20)
        if (method_exists($user, 'viewedPosts')) {
            $viewedPosts = $user->viewedPosts()->limit(20)->get();

            foreach ($viewedPosts as $post) {
                // Add category
                if ($post->category) {
                    $interests[] = $post->category;
                }

                // Add tags
                if ($post->tags) {
                    $tags = is_array($post->tags) ? $post->tags : json_decode($post->tags, true);
                    if ($tags) {
                        $interests = array_merge($interests, $tags);
                    }
                }
            }
        }

        // تنظيف وإزالة التكرار
        $interests = array_unique(array_filter($interests));

        // إذا ماكاينش اهتمامات، استخدم defaults
        if (empty($interests)) {
            $interests = ['عام', 'أخبار'];
        }

        return array_values($interests);
    }

    /**
     * تحويل IDs للتوصيات إلى Post models
     */
    private function hydrateRecommendations(array $recommendations): array
    {
        if (empty($recommendations)) {
            return [];
        }

        // Extract IDs
        $postIds = array_column($recommendations, 'id');

        // Get posts from database
        $posts = Post::whereIn('id', $postIds)->get()->keyBy('id');

        $result = [];

        foreach ($recommendations as $rec) {
            if (isset($posts[$rec['id']])) {
                $post = $posts[$rec['id']];

                // Add recommendation metadata
                $post->recommendation_score = $rec['score'] ?? 0;
                $post->recommendation_reason = $rec['reason'] ?? null;

                $result[] = $post;
            }
        }

        return $result;
    }
}
