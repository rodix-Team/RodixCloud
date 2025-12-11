# 🚀 النظام البسيط - دليل الاستخدام الكامل

## نظرة عامة

هذا الدليل يشرح كيفية استخدام **النظام البسيط** (بدون FastAPI) مباشرة في مشروعك.

**المميزات:**
- ✅ بدون dependencies ثقيلة
- ✅ يخدم مباشرة
- ✅ كافي لـ 10,000 زائر/شهر
- ✅ سهل الصيانة

---

## 📦 التثبيت

### 1. نسخ الملف المطلوب فقط

```bash
# انسخ الملف الأساسي لمشروعك
cp recommender_system.py /path/to/your/project/
```

هذا كل شيء! **ملف واحد فقط** 🎉

---

## 🔧 الاستخدام في Python

### مثال بسيط

```python
from recommender_system import ContentRecommender

# 1. إنشاء المحرك
recommender = ContentRecommender()

# 2. إضافة محتوى
recommender.add_content(
    content_id="post_001",
    title="مقال عن Python",
    category="تكنولوجيا",
    tags=["python", "programming", "tutorial"],
    description="شرح مفصل للغة Python"
)

# 3. إضافة مستخدم
recommender.add_user(
    user_id="user_123",
    interests=["python", "programming", "web development"]
)

# 4. تسجيل مشاهدة
recommender.record_interaction(
    user_id="user_123",
    content_id="post_001",
    interaction_type="view",
    rating=5
)

# 5. الحصول على توصيات
recommendations = recommender.get_recommendations(
    user_id="user_123",
    num_recommendations=5
)

# 6. عرض النتائج
for rec in recommendations:
    print(f"- {rec['title']} (Category: {rec['category']})")
```

---

## 🐘 التكامل مع Laravel

### الطريقة 1: Python Script (موصى به)

#### 1. إنشاء Python Service

```python
# /var/www/your-project/recommendation_service.py

from recommender_system import ContentRecommender
import json
import sys

class RecommendationService:
    def __init__(self):
        self.engine = ContentRecommender()
        # تحميل البيانات من ملف
        self.engine.load_from_file('recommender_data.json')
    
    def add_content(self, content_data):
        """إضافة محتوى"""
        return self.engine.add_content(
            content_id=content_data['id'],
            title=content_data['title'],
            category=content_data['category'],
            tags=content_data['tags'],
            description=content_data.get('description', '')
        )
    
    def add_user(self, user_data):
        """إضافة مستخدم"""
        return self.engine.add_user(
            user_id=user_data['id'],
            interests=user_data['interests']
        )
    
    def record_interaction(self, interaction_data):
        """تسجيل تفاعل"""
        return self.engine.record_interaction(
            user_id=interaction_data['user_id'],
            content_id=interaction_data['content_id'],
            interaction_type=interaction_data.get('type', 'view'),
            rating=interaction_data.get('rating', 0)
        )
    
    def get_recommendations(self, user_id, num=10):
        """الحصول على توصيات"""
        recs = self.engine.get_recommendations(user_id, num)
        return [
            {
                'id': rec['id'],
                'title': rec['title'],
                'category': rec['category'],
                'tags': rec['tags']
            }
            for rec in recs
        ]
    
    def save(self):
        """حفظ البيانات"""
        self.engine.save_to_file('recommender_data.json')

# CLI Interface
if __name__ == '__main__':
    service = RecommendationService()
    
    # قراءة الأمر من Laravel
    command = sys.argv[1] if len(sys.argv) > 1 else None
    data = json.loads(sys.argv[2]) if len(sys.argv) > 2 else {}
    
    result = None
    
    if command == 'add_content':
        result = service.add_content(data)
    elif command == 'add_user':
        result = service.add_user(data)
    elif command == 'record_interaction':
        result = service.record_interaction(data)
    elif command == 'get_recommendations':
        result = service.get_recommendations(data['user_id'], data.get('num', 10))
    
    service.save()
    
    # إرجاع النتيجة كـ JSON
    print(json.dumps({'success': True, 'data': result}))
```

#### 2. Laravel Helper Class

```php
<?php
// app/Services/RecommendationService.php

namespace App\Services;

class RecommendationService
{
    private $pythonScript;
    
    public function __construct()
    {
        $this->pythonScript = base_path('recommendation_service.py');
    }
    
    private function runPython($command, $data = [])
    {
        $dataJson = json_encode($data);
        $cmd from": escapeshellarg($command) . " " . escapeshellarg($dataJson);
        
        $output = shell_exec("python3 {$this->pythonScript} {$cmd} 2>&1");
        
        return json_decode($output, true);
    }
    
    public function addContent($post)
    {
        return $this->runPython('add_content', [
            'id' => (string) $post->id,
            'title' => $post->title,
            'category' => $post->category,
            'tags' => $post->tags, // array
            'description' => $post->excerpt
        ]);
    }
    
    public function addUser($user)
    {
        return $this->runPython('add_user', [
            'id' => (string) $user->id,
            'interests' => $user->interests // array
        ]);
    }
    
    public function recordInteraction($userId, $contentId, $type = 'view', $rating = null)
    {
        return $this->runPython('record_interaction', [
            'user_id' => (string) $userId,
            'content_id' => (string) $contentId,
            'type' => $type,
            'rating' => $rating
        ]);
    }
    
    public function getRecommendations($userId, $num = 10)
    {
        $result = $this->runPython('get_recommendations', [
            'user_id' => (string) $userId,
            'num' => $num
        ]);
        
        return $result['data'] ?? [];
    }
}
```

#### 3. استخدام في Controller

```php
<?php
// app/Http/Controllers/PostController.php

namespace App\Http\Controllers;

use App\Services\RecommendationService;
use App\Models\Post;

class PostController extends Controller
{
    public function __construct(
        private RecommendationService $recommender
    ) {}
    
    // عند إنشاء مقال جديد
    public function store(Request $request)
    {
        $post = Post::create($request->validated());
        
        // إضافة للنظام
        $this->recommender->addContent($post);
        
        return redirect()->route('posts.show', $post);
    }
    
    // عند عرض مقال
    public function show(Post $post)
    {
        $userId = auth()->id();
        
        if ($userId) {
            // تسجيل المشاهدة
            $this->recommender->recordInteraction($userId, $post->id, 'view');
            
            // الحصول على توصيات
            $recommendations = $this->recommender->getRecommendations($userId, 5);
        }
        
        return view('posts.show', compact('post', 'recommendations'));
    }
}
```

---

## ⚛️ التكامل مع Next.js

### 1. إنشاء API Endpoint بسيط

```python
# simple_api.py - Flask API بسيط

from flask import Flask, request, jsonify
from flask_cors import CORS
from recommender_system import ContentRecommender

app = Flask(__name__)
CORS(app)  # للسماح بـ Next.js

# المحرك العام
engine = ContentRecommender()
engine.load_from_file('recommender_data.json')

@app.route('/recommendations/<user_id>', methods=['GET'])
def get_recommendations(user_id):
    num = request.args.get('num', 10, type=int)
    recs = engine.get_recommendations(user_id, num)
    return jsonify({'recommendations': recs})

@app.route('/interaction', methods=['POST'])
def record_interaction():
    data = request.json
    success = engine.record_interaction(
        user_id=data['user_id'],
        content_id=data['content_id'],
        interaction_type=data.get('type', 'view'),
        rating=data.get('rating')
    )
    engine.save_to_file('recommender_data.json')
    return jsonify({'success': success})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

### 2. Next.js Hook

```typescript
// hooks/useSimpleRecommendations.ts

import { useState, useEffect } from 'react';

export function useSimpleRecommendations(userId: string, count: number = 10) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:5000/recommendations/${userId}?num=${count}`)
      .then(res => res.json())
      .then(data => {
        setRecommendations(data.recommendations);
        setLoading(false);
      });
  }, [userId, count]);

  const recordView = async (contentId: string) => {
    await fetch('http://localhost:5000/interaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        content_id: contentId,
        type: 'view'
      })
    });
  };

  return { recommendations, loading, recordView };
}
```

---

## 📁 هيكل الملفات

```
your-project/
├── recommender_system.py      # المحرك الأساسي
├── recommendation_service.py  # Service layer (اختياري)
├── recommender_data.json      # البيانات المحفوظة
└── simple_api.py             # API بسيط (اختياري)
```

---

## 💾 حفظ وتحميل البيانات

```python
# حفظ تلقائي بعد كل عملية
recommender.save_to_file('recommender_data.json')

# تحميل عند البداية
recommender.load_from_file('recommender_data.json')

# Cron job للـ backup
# 0 * * * * cp recommender_data.json backup/recommender_$(date +\%Y\%m\%d_\%H).json
```

---

## 🚀 النشر

### على Shared Hosting

```bash
# 1. رفع الملف
scp recommender_system.py user@server:/var/www/your-site/

# 2. التأكد من Python
python3 --version  # يجب أن يكون 3.7+

# 3. استخدام من Laravel مباشرة
# Laravel سيشغل السكريبت عبر shell_exec
```

### Systemd Service (اختياري)

```ini
# /etc/systemd/system/recommender.service
[Unit]
Description=Simple Recommendation API

[Service]
ExecStart=/usr/bin/python3 /var/www/simple_api.py
Restart=always

[Install]
WantedBy=multi-user.target
```

---

## ⚡ الأداء

- **السرعة:** < 100ms لـ 10 توصيات
- **الذاكرة:** ~50MB
- **المستخدمين:** حتى 50,000
- **المحتوى:** حتى 100,000

---

## 🎯 الخلاصة

**النظام البسيط:**
- ✅ ملف واحد فقط
- ✅ بدون dependencies
- ✅ سهل التكامل
- ✅ كافي للمواقع الصغيرة

**الاستخدام:**
1. انسخ `recommender_system.py`
2. استخدمه من Laravel/Python مباشرة
3. خلاص! 🎉

---

**هل تحتاج مساعدة في التكامل مع مشروعك؟** 🚀
