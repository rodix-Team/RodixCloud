<?php

namespace App\Observers;

use App\Models\Post;
use App\Services\AIRecommendationService;

class PostObserver
{
    public function __construct(
        private AIRecommendationService $recommender
    ) {
    }

    /**
     * عند إنشاء مقال جديد
     */
    public function created(Post $post)
    {
        // إضافة للنظام تلقائياً
        $this->recommender->addContent($post);
    }

    /**
     * عند تحديث مقال
     */
    public function updated(Post $post)
    {
        // تحديث في النظام (إضافة من جديد يحدث تلقائياً)
        if ($post->wasChanged(['title', 'category', 'tags'])) {
            $this->recommender->addContent($post);
        }
    }
}
