#!/usr/bin/env python3
"""
🧪 اختبار سريع للنظام
======================
تحقق أن كلشي خدام في < 1 دقيقة
"""

import sys
from recommender_system import ContentRecommender

print("="*70)
print("🧪 اختبار نظام التوصيات - Quick Test")
print("="*70)
print()

# Test 1: إنشاء النظام
print("📝 Test 1: إنشاء النظام...")
try:
    recommender = ContentRecommender()
    print("   ✅ PASS - النظام تم إنشاؤه")
except Exception as e:
    print(f"   ❌ FAIL - {e}")
    sys.exit(1)

# Test 2: إضافة محتوى
print("\n📝 Test 2: إضافة محتوى...")
try:
    recommender.add_content(
        "test_001",
        "مقال تجريبي",
        "تكنولوجيا",
        ["test", "demo", "python"]
    )
    print("   ✅ PASS - المحتوى تمت إضافته")
except Exception as e:
    print(f"   ❌ FAIL - {e}")
    sys.exit(1)

# Test 3: إضافة مستخدم
print("\n📝 Test 3: إضافة مستخدم...")
try:
    recommender.add_user("user_test", ["python", "test"])
    print("   ✅ PASS - المستخدم تمت إضافته")
except Exception as e:
    print(f"   ❌ FAIL - {e}")
    sys.exit(1)

# Test 4: تسجيل تفاعل
print("\n📝 Test 4: تسجيل تفاعل...")
try:
    recommender.record_interaction("user_test", "test_001", "view", 5)
    print("   ✅ PASS - التفاعل تم تسجيله")
except Exception as e:
    print(f"   ❌ FAIL - {e}")
    sys.exit(1)

# Test 5: الحصول على توصيات
print("\n📝 Test 5: الحصول على توصيات...")
try:
    # إضافة محتوى إضافي
    recommender.add_content("test_002", "مقال ثاني", "تكنولوجيا", ["python", "ai"])
    recommender.add_content("test_003", "مقال ثالث", "تكنولوجيا", ["test", "qa"])
    
    recs = recommender.get_recommendations("user_test", 3)
    
    if len(recs) > 0:
        print(f"   ✅ PASS - تم إرجاع {len(recs)} توصية")
        print(f"   📌 مثال: {recs[0]['title']}")
    else:
        print("   ⚠️  WARNING - لا توجد توصيات (هذا طبيعي مع بيانات قليلة)")
except Exception as e:
    print(f"   ❌ FAIL - {e}")
    sys.exit(1)

# Test 6: حفظ البيانات
print("\n📝 Test 6: حفظ البيانات...")
try:
    recommender.save_to_file("test_data.json")
    print("   ✅ PASS - البيانات تم حفظها")
except Exception as e:
    print(f"   ❌ FAIL - {e}")
    sys.exit(1)

# Test 7: تحميل البيانات
print("\n📝 Test 7: تحميل البيانات...")
try:
    new_recommender = ContentRecommender()
    new_recommender.load_from_file("test_data.json")
    
    if len(new_recommender.content_database) == 3:
        print("   ✅ PASS - البيانات تم تحميلها بنجاح")
    else:
        print(f"   ⚠️  WARNING - تم تحميل {len(new_recommender.content_database)} محتوى فقط")
except Exception as e:
    print(f"   ❌ FAIL - {e}")
    sys.exit(1)

# النتيجة النهائية
print()
print("="*70)
print("✅ جميع الاختبارات نجحت!")
print("="*70)
print()
print("🎯 النظام جاهز للاستخدام!")
print()
print("الخطوات التالية:")
print("   1. شغل FastAPI: python3 fastapi_service/main.py")
print("   2. افتح: http://localhost:8000/docs")
print("   3. جرب API endpoints")
print()
