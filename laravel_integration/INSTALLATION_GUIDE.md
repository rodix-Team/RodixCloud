# 🚀 دليل التركيب - Laravel على Hostinger

## الخطوات المفصلة

### 1. رفع الملفات على Hostinger

```bash
# SSH للسيرفر
ssh your-username@your-domain.com

# انتقل لمجلد Laravel
cd /home/your-username/public_html

# إنشاء مجلد للنظام
mkdir recommendation_system
cd recommendation_system
```

**رفع الملفات من جهازك:**
```bash
# من جهازك المحلي
scp recommender_system.py your-username@your-domain.com:/home/your-username/public_html/recommendation_system/
scp recommendation_service.py your-username@your-domain.com:/home/your-username/public_html/recommendation_system/
```

### 2. التحقق من Python

```bash
# على السيرفر
python3 --version  # يجب 3.7+

# اختبار السكريبت
cd /home/your-username/public_html/recommendation_system
python3 recommendation_service.py '{"action":"get_stats"}'

# يجب أن ترى:
# {"success": true, "data": {...}}
```

### 3. تثبيت Laravel Service

```bash
# على جهازك المحلي، في مشروع Laravel
mkdir app/Services
```

**انسخ الملفات:**
1. `AIRecommendationService.php` → `app/Services/`
2. `RecommendationController.php` → `app/Http/Controllers/`
3. `PostObserver.php` → `app/Observers/`

### 4. تسجيل Service في Laravel

```php
// app/Providers/AppServiceProvider.php

use App\Services\AIRecommendationService;

public function register()
{
    $this->app->singleton(AIRecommendationService::class, function ($app) {
        return new AIRecommendationService();
    });
}
```

### 5. تسجيل Observer

```php
// app/Providers/EventServiceProvider.php

use App\Models\Post;
use App\Observers\PostObserver;

public function boot()
{
    Post::observe(PostObserver::class);
}
```

### 6. Routes

```php
// routes/api.php

use App\Http\Controllers\RecommendationController;

Route::middleware('api')->group(function () {
    // Public endpoints
    Route::get('/recommendations', [RecommendationController::class, 'index']);
    Route::get('/recommendation-stats', [RecommendationController::class, 'stats']);
    
    // Authenticated endpoints
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/track-view', [RecommendationController::class, 'trackView']);
        Route::post('/track-like', [RecommendationController::class, 'trackLike']);
    });
});

// routes/web.php (optional)
Route::get('/recommendations', [RecommendationController::class, 'show'])
    ->name('recommendations.index');
```

### 7. اختبار من Laravel

```php
// routes/web.php - صفحة تجريبية

Route::get('/test-recommendations', function () {
    $recommender = app(\App\Services\AIRecommendationService::class);
    
    // Add test content
    $post = new \stdClass();
    $post->id = 1;
    $post->title = 'مقال تجريبي';
    $post->category = 'تكنولوجيا';
    $post->tags = ['php', 'laravel'];
    
    $recommender->addContent($post);
    
    // Add test user
    $user = new \stdClass();
    $user->id = 1;
    
    $recommender->syncUser($user);
    
    // Record view
    $recommender->recordView(1, 1, 5);
    
    // Get recommendations
    $recs = $recommender->getRecommendations(1, 5);
    
    return response()->json([
        'status' => 'success',
        'recommendations' => $recs,
        'stats' => $recommender->getStats()
    ]);
});
```

**اختبر:**
```
https://your-domain.com/test-recommendations
```

### 8. استخدام في PostController

```php
// app/Http/Controllers/PostController.php

use App\Services\AIRecommendationService;

class PostController extends Controller
{
    public function show(Post $post, AIRecommendationService $recommender)
    {
        // تسجيل المشاهدة
        if (auth()->check()) {
            $recommender->recordView(auth()->id(), $post->id);
        }
        
        // الحصول على توصيات
        $recommendations = auth()->check()
            ? $recommender->getRecommendations(auth()->id(), 5)
            : Post::latest()->limit(5)->get();
        
        return view('posts.show', compact('post', 'recommendations'));
    }
}
```

### 9. Blade Template

```blade
{{-- resources/views/posts/show.blade.php --}}

{{-- في أي مكان في الصفحة --}}
@if(count($recommendations) > 0)
<div class="recommended-posts">
    <h3>مقالات موصى بها لك</h3>
    
    <div class="posts-grid">
        @foreach($recommendations as $post)
            <div class="post-card">
                <h4>{{ $post->title }}</h4>
                <p>{{ $post->excerpt }}</p>
                <a href="{{ route('posts.show', $post) }}">اقرأ المزيد</a>
                
                @if(isset($post->recommendation_score))
                    <span class="match-score">
                        تطابق: {{ number_format($post->recommendation_score * 100, 0) }}%
                    </span>
                @endif
            </div>
        @endforeach
    </div>
</div>
@endif
```

---

## ✅ Checklist

- [ ] رفع `recommender_system.py` و `recommendation_service.py`
- [ ] التحقق من Python 3.7+
- [ ] اختبار السكريبت يدوياً
- [ ] نسخ Service و Controller
- [ ] تسجيل Service في AppServiceProvider
- [ ] تسجيل Observer
- [ ] إضافة Routes
- [ ] اختبار `/test-recommendations`
- [ ] تحديث PostController
- [ ] تحديث Blade templates
- [ ] Push للـ Git
- [ ] Deploy على Hostinger

---

## 🚨 Troubleshooting

### Python script ماكيشتغلش

```bash
# Check path
which python3

# Check permissions
chmod +x recommendation_service.py

# Test manually
python3 recommendation_service.py '{\"action\":\"get_stats\"}'
```

### Laravel ماكيقدرش يلقى السكريبت

```php
// في Service __construct
dd(base_path('recommendation_system/recommendation_service.py'));
dd(file_exists($this->pythonScript)); // يجب true
```

### الأوامر مكترجعش نتيجة

```php
// في executeCommand، قبل shell_exec
dd($cmd);  // شوف الأمر
```

---

## 📞 الخطوة التالية

بعد التثبيت، جرب:
```
https://your-domain.com/test-recommendations
https://your-domain.com/api/recommendations
```

**كلشي خدام؟ خليني نعرف!** 🚀
