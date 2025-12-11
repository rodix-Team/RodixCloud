# 🚀 دليل التركيب السريع - للفريق

## نظام التوصيات الذكي - تركيب في 30 دقيقة

---

## 📋 المتطلبات

- ✅ Laravel Backend (موجود)
- ✅ Next.js Frontend (موجود)
- ✅ Python 3.7+ على السيرفر
- ✅ React Native App (اختياري)

---

## 🎯 خطة التركيب

### المرحلة 1: Backend (Laravel) - 10 دقائق
### المرحلة 2: Frontend (Next.js) - 10 دقائق  
### المرحلة 3: Mobile App - 10 دقائق
### المرحلة 4: Testing - 5 دقائق

---

## 📦 المرحلة 1: Laravel Backend

### خطوة 1.1: رفع ملفات Python

```bash
# SSH للسيرفر
ssh user@your-server.com

# انتقل لمجلد Laravel
cd /path/to/laravel-project

# إنشاء مجلد للنظام
mkdir ai_recommender
cd ai_recommender

# رفع الملفات (من جهازك المحلي)
# نسخ هذه الملفات:
# - recommender_system.py
# - advanced_ai_recommender.py (اختياري - للميزات المتقدمة)
```

**من جهازك:**
```bash
scp recommender_system.py user@server:/path/to/laravel/ai_recommender/
scp advanced_ai_recommender.py user@server:/path/to/laravel/ai_recommender/
```

### خطوة 1.2: تثبيت PHP Files

```bash
# في مشروع Laravel المحلي
cd your-laravel-project

# نسخ Service
cp laravel_integration/AIRecommendationService.php app/Services/

# نسخ Controller
cp laravel_integration/RecommendationController.php app/Http/Controllers/

# نسخ Observer (اختياري - للـ auto-sync)
cp laravel_integration/PostObserver.php app/Observers/
```

### خطوة 1.3: تسجيل Service

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

### خطوة 1.4: إضافة Routes

```php
// routes/api.php

use App\Http\Controllers\RecommendationController;

Route::prefix('api/v1')->group(function () {
    // Public
    Route::get('/recommendations', [RecommendationController::class, 'index']);
    
    // Authenticated  
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/track-view', [RecommendationController::class, 'trackView']);
        Route::post('/track-like', [RecommendationController::class, 'trackLike']);
    });
});
```

### خطوة 1.5: تحديث .env

```env
# .env
AI_RECOMMENDER_SCRIPT=/path/to/laravel/ai_recommender/recommender_system.py
AI_RECOMMENDER_DATA=/path/to/laravel/storage/app/recommender_data.json
```

### خطوة 1.6: عدّل AIRecommendationService

```php
// app/Services/AIRecommendationService.php
// في __construct()

public function __construct()
{
    $this->pythonScript = env('AI_RECOMMENDER_SCRIPT', 
        base_path('ai_recommender/recommender_system.py')
    );
    
    $this->dataFile = env('AI_RECOMMENDER_DATA',
        storage_path('app/recommender_data.json')
    );
}
```

### ✅ Laravel جاهز!

---

## 🎨 المرحلة 2: Next.js Frontend

### خطوة 2.1: نسخ الملفات

```bash
# في مشروع Next.js
cd your-nextjs-project

# إنشاء المجلدات
mkdir -p lib/api
mkdir -p components/recommendations
```

### خطوة 2.2: API Client

```bash
# نسخ API client
cp nextjs_integration/recommendations.ts lib/api/
```

**أو أنشئ:**
```typescript
// lib/api/recommendations.ts

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://your-laravel-backend.com';

export async function getRecommendations(userId: string, limit: number = 10) {
  const response = await fetch(
    `${API_BASE}/api/v1/recommendations?user_id=${userId}&limit=${limit}`
  );
  
  if (!response.ok) throw new Error('Failed to fetch');
  
  return response.json();
}

export async function trackView(userId: string, contentId: string) {
  return fetch(`${API_BASE}/api/v1/track-view`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, content_id: contentId }),
  });
}
```

### خطوة 2.3: React Component

```bash
# نسخ Component
cp nextjs_integration/RecommendedPosts.tsx components/recommendations/
```

### خطوة 2.4: Environment Variables

```env
# .env.local
NEXT_PUBLIC_API_URL=https://your-laravel-backend.com
```

### خطوة 2.5: استخدام في الصفحات

```tsx
// app/page.tsx أو pages/index.tsx

import RecommendedPosts from '@/components/recommendations/RecommendedPosts';

export default function HomePage() {
  const userId = useAuth().user?.id; // من نظام Auth ديالكم
  
  return (
    <div>
      <h1>الصفحة الرئيسية</h1>
      
      {userId && (
        <RecommendedPosts 
          userId={userId} 
          limit={6}
        />
      )}
    </div>
  );
}
```

### ✅ Next.js جاهز!

---

## 📱 المرحلة 3: React Native App

### خطوة 3.1: API Client

```javascript
// src/api/recommendations.js

const API_BASE = 'https://your-laravel-backend.com';

export const getRecommendations = async (userId, limit = 10) => {
  const response = await fetch(
    `${API_BASE}/api/v1/recommendations?user_id=${userId}&limit=${limit}`
  );
  
  return response.json();
};

export const trackView = async (userId, contentId) => {
  return fetch(`${API_BASE}/api/v1/track-view`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, content_id: contentId }),
  });
};
```

### خطوة 3.2: Component

```javascript
// src/components/RecommendedPosts.jsx

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { getRecommendations, trackView } from '../api/recommendations';

export default function RecommendedPosts({ userId }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, [userId]);

  const loadRecommendations = async () => {
    try {
      const data = await getRecommendations(userId, 10);
      setPosts(data.recommendations || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePress = async (post) => {
    await trackView(userId, post.id);
    // Navigate to post...
  };

  if (loading) {
    return <Text>جاري التحميل...</Text>;
  }

  return (
    <View>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
        مقالات موصى بها
      </Text>
      
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handlePress(item)}>
            <View style={{ padding: 15, borderBottomWidth: 1 }}>
              <Text style={{ fontWeight: 'bold' }}>{item.title}</Text>
              <Text style={{ color: '#666' }}>{item.category}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
```

### ✅ Mobile App جاهز!

---

## 🧪 المرحلة 4: Testing

### Test 1: Laravel API

```bash
# من Terminal
curl "https://your-backend.com/api/v1/recommendations?user_id=1&limit=5"
```

**أو Postman:**
```
GET https://your-backend.com/api/v1/recommendations
Params:
  - user_id: 1
  - limit: 5
```

### Test 2: Next.js

افتح الموقع وشوف التوصيات في الصفحة الرئيسية

### Test 3: Mobile App

شغّل التطبيق على emulator وشوف التوصيات

---

## 🎯 الاستخدام اليومي

### في Laravel Controller:

```php
use App\Services\AIRecommendationService;

class PostController extends Controller
{
    public function show(Post $post, AIRecommendationService $ai)
    {
        // عند عرض مقال
        if (auth()->check()) {
            $ai->recordView(auth()->id(), $post->id);
        }
        
        // الحصول على توصيات
        $recommendations = $ai->getRecommendations(auth()->id(), 5);
        
        return view('posts.show', compact('post', 'recommendations'));
    }
    
    public function store(Request $request, AIRecommendationService $ai)
    {
        // عند إنشاء مقال جديد
        $post = Post::create($request->validated());
        
        // إضافة للنظام تلقائياً
        $ai->addContent($post);
        
        return redirect()->route('posts.show', $post);
    }
}
```

### في Next.js:

```tsx
'use client';

import { useEffect } from 'react';
import { trackView } from '@/lib/api/recommendations';

export default function PostPage({ params }) {
  const userId = useAuth().user?.id;
  
  useEffect(() => {
    if (userId) {
      trackView(userId, params.postId);
    }
  }, [userId, params.postId]);
  
  return <PostContent />;
}
```

---

## 📊 Monitoring

### Laravel Logs

```bash
tail -f storage/logs/laravel.log | grep Recommendation
```

### Check Data

```bash
cat storage/app/recommender_data.json | python3 -m json.tool
```

---

## 🚨 Troubleshooting

### مشكلة: Python script ماكيشتغلش

```bash
# تحقق من Python
which python3
python3 --version  # يجب 3.7+

# تحقق من Permissions
chmod +x ai_recommender/recommender_system.py

# Test يدوي
python3 ai_recommender/recommender_system.py
```

### مشكلة: Laravel ماكيقدرش يستدعي Python

```php
// في Controller - للـ debug
dd(shell_exec('which python3'));
dd(shell_exec('python3 --version'));
```

### مشكلة: Next.js - CORS Error

تأكد من CORS في Laravel:

```php
// config/cors.php
'paths' => ['api/*'],
'allowed_origins' => ['https://your-frontend.com'],
```

---

## ✅ Checklist النهائي

**Backend:**
- [ ] Python files مرفوعة
- [ ] PHP files منسوخة
- [ ] Service مسجل
- [ ] Routes مضافة
- [ ] .env محدّث
- [ ] Test API يخدم

**Frontend:**
- [ ] API client منسوخ
- [ ] Component منسوخ
- [ ] Environment variables
- [ ] Test في المتصفح

**Mobile:**
- [ ] API client منسوخ
- [ ] Component منسوخ
- [ ] Test في emulator

---

## 🎉 النتيجة

**نظام توصيات ذكي شغال على:**
- ✅ Laravel Backend
- ✅ Next.js Website
- ✅ React Native App

**في أقل من 30 دقيقة!**

---

## 📞 للدعم

إذا واجهتكم مشاكل:
1. راجع `laravel_integration/INSTALLATION_GUIDE.md`
2. راجع `PRODUCTION_READY.md`
3. تحقق من logs

---

**حظ موفق للفريق! 🚀**
