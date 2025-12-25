<?php

namespace AIRecommender\Facades;

use Illuminate\Support\Facades\Facade;

/**
 * @method static array getRecommendations(string $userId, int $count = 4)
 * @method static void recordInteraction(string $userId, string $contentId, string $type)
 * @method static void addUser(string $userId, array $interests)
 * @method static void addContent(string $contentId, string $title, string $category, array $tags, string $description)
 * 
 * @see \AIRecommender\AIRecommenderClient
 */
class AIRecommender extends Facade
{
    /**
     * Get the registered name of the component.
     *
     * @return string
     */
    protected static function getFacadeAccessor()
    {
        return 'ai-recommender';
    }
}
