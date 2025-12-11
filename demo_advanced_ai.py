#!/usr/bin/env python3
"""
🧪 Demo المحرك المتقدم
====================
تجربة الميزات المتقدمة
"""

from advanced_ai_recommender import AdvancedAIRecommender
from datetime import datetime

print("="*80)
print("🧠 Advanced AI Recommendation Engine - Demo")
print("="*80)
print()

# إنشاء المحرك المتقدم
engine = AdvancedAIRecommender()

print("✨ الميزات المتقدمة:")
print("  🎯 Collaborative Filtering (User-User + Item-Item)")
print("  📊 Content-Based with TF-IDF")
print("  ⏰ Time Decay (الاهتمامات تتغير)")
print("  🔥 Trending Detection")
print("  🎨 Diversity Re-ranking")
print("  🎲 Serendipity (مفاجآت)")
print("  🌍 Context-Aware (وقت، يوم...)")
print()

# إضافة محتوى متنوع
print("📝 1. إضافة محتوى...")
print("-"*80)

contents = [
    ("tech_ai_001", "مقدمة في الذكاء الاصطناعي", "تكنولوجيا",
     ["ai", "machine learning", "deep learning", "python"], "دليل شامل للذكاء الاصطناعي"),
    
    ("tech_web_001", "تطوير الويب بـ React", "تكنولوجيا",
     ["react", "javascript", "web development", "frontend"], "تعلم React من الصفر"),
    
    ("business_001", "استراتيجيات التسويق الرقمي", "أعمال",
     ["marketing", "digital", "business", "seo"], "كيف تسوق منتجك بذكاء"),
    
    ("sport_001", "تمارين اللياقة المنزلية", "رياضة",
     ["fitness", "health", "workout", "exercise"], "تمارين بدون معدات"),
    
    ("tech_ai_002", "التعلم العميق عملياً", "تكنولوجيا",
     ["deep learning", "ai", "neural networks", "tensorflow"], "بناء شبكات عصبية"),
    
    ("entertainment_001", "أفضل الأفلام 2024", "ترفيه",
     ["movies", "entertainment", "cinema", "reviews"], "مراجعات أفلام حصرية"),
    
    ("news_001", "أخبار التكنولوجيا اليومية", "أخبار",
     ["news", "technology", "daily", "updates"], "آخر أخبار التقنية"),
    
    ("tech_mobile_001", "تطوير تطبيقات الموبايل", "تكنولوجيا",
     ["mobile", "react native", "ios", "android"], "بناء تطبيقات احترافية"),
]

for content_id, title, category, tags, desc in contents:
    engine.add_content(content_id, title, category, tags, desc)
    print(f"  ✓ {title}")

print(f"\n✅ تمت إضافة {len(contents)} محتوى")
print()

# إضافة مستخدمين بأنماط مختلفة
print("👥 2. إضافة مستخدمين...")
print("-"*80)

users = [
    ("ahmed", ["ai", "machine learning", "deep learning", "python"]),
    ("sara", ["react", "javascript", "web development", "frontend"]),
    ("omar", ["business", "marketing", "digital"]),
    ("fatima", ["fitness", "health", "workout"]),
    ("khalid", ["technology", "news", "ai"]),
]

for user_id, interests in users:
    engine.add_user(user_id, interests)
    print(f"  ✓ {user_id}: {', '.join(interests[:3])}")

print(f"\n✅ تمت إضافة {len(users)} مستخدم")
print()

# تسجيل تفاعلات متنوعة
print("⚡ 3. محاكاة نشاط المستخدمين...")
print("-"*80)

# Ahmed - مهتم بالـ AI
engine.record_interaction("ahmed", "tech_ai_001", "view", rating=5)
engine.record_interaction("ahmed", "tech_ai_001", "like")
engine.record_interaction("ahmed", "tech_ai_002", "view", rating=5)
engine.record_interaction("ahmed", "tech_ai_002", "share")
print("  ✓ ahmed: شاهد و أعجب بمحتوى AI")

# Sara - Frontend Developer
engine.record_interaction("sara", "tech_web_001", "view", rating=5)
engine.record_interaction("sara", "tech_web_001", "like")
engine.record_interaction("sara", "tech_mobile_001", "view", rating=4)
print("  ✓ sara: تفاعلت مع محتوى Web Development")

# Omar - Business  
engine.record_interaction("omar", "business_001", "view", rating=5)
engine.record_interaction("omar", "business_001", "share")
print("  ✓ omar: شارك محتوى الأعمال")

# Fatima - Fitness
engine.record_interaction("fatima", "sport_001", "view", rating=5)
engine.record_interaction("fatima", "sport_001", "like")
print("  ✓ fatima: أعجبها محتوى اللياقة")

# Khalid - متنوع
engine.record_interaction("khalid", "news_001", "view", rating=4)
engine.record_interaction("khalid", "tech_ai_001", "view", rating=5)
print("  ✓ khalid: يتابع الأخبار والتكنولوجيا")

print("\n✅ تم تسجيل التفاعلات")
print()

# التوصيات المتقدمة
print("="*80)
print("🎯 4. التوصيات المتقدمة مع AI")
print("="*80)
print()

# Context للصباح و المساء
morning_context = {'hour': 9, 'is_weekend': False}
evening_context = {'hour': 20, 'is_weekend': True}

for user_id in ["ahmed", "sara", "omar"]:
    print(f"📌 توصيات لـ {user_id}:")
    print("-"*80)
    
    # Morning recommendations
    print("\n🌅 الصباح (9 AM - يوم عمل):")
    recs_morning = engine.get_recommendations(user_id, num=3, context=morning_context)
    
    for i, rec in enumerate(recs_morning, 1):
        print(f"  {i}. {rec['title']}")
        print(f"     Score: {rec['score']:.3f} | Reason: {rec['reason']}")
        print(f"     Quality: {rec['quality_score']:.2f} | Trending: {rec['trending_score']:.2f}")
    
    # Evening recommendations
    print("\n🌙 المساء (8 PM - عطلة):")
    recs_evening = engine.get_recommendations(user_id, num=3, context=evening_context)
    
    for i, rec in enumerate(recs_evening, 1):
        print(f"  {i}. {rec['title']}")
        print(f"     Score: {rec['score']:.3f} | Reason: {rec['reason']}")
    
    print()

# Cold Start Test - مستخدم جديد
print("="*80)
print("🆕 5. Cold Start - مستخدم جديد")
print("="*80)
print()

engine.add_user("new_user", ["technology", "programming"])
recs_new = engine.get_recommendations("new_user", num=5)

print("📌 توصيات للمستخدم الجديد:")
for i, rec in enumerate(recs_new, 1):
    print(f"  {i}. {rec['title']}")
    print(f"     Reason: {rec['reason']} | Trending: {rec['trending_score']:.2f}")

print()

# Statistics
print("="*80)
print("📊 6. إحصائيات النظام المتقدم")
print("="*80)
print()

print(f"✓ Total Users: {len(engine.users)}")
print(f"✓ Total Content: {len(engine.content)}")
print(f"✓ Total Interactions: {sum(len(ints) for ints in engine.interactions.values())}")
print(f"✓ User Profiles Built: {len(engine.user_profiles)}")
print(f"✓ Content Vectors: {len(engine.content_vectors)}")

print()
print("="*80)
print("✅ Demo مكتمل!")
print("="*80)
print()

print("🎯 ما تم عرضه:")
print("  ✓ Collaborative Filtering (User-User + Item-Item)")
print("  ✓ Content-Based with TF-IDF")
print("  ✓ Time & Context Awareness")
print("  ✓ Trending Detection")
print("  ✓ Quality Scoring")
print("  ✓ Diversity & Serendipity")
print("  ✓ Cold Start Solutions")
print()

# حفظ البيانات
engine.save_to_file("advanced_demo_data.json")
print("💾 البيانات تم حفظها في advanced_demo_data.json")
print()
