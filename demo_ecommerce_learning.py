#!/usr/bin/env python3
"""
🛒 E-Commerce Example - النظام يتعلم تلقائياً
==========================================
مثال واقعي: متجر إلكتروني
"""

from advanced_ai_recommender import AdvancedAIRecommender

print("="*80)
print("🛒 مثال: متجر إلكتروني - AI يتعلم من سلوك الزبائن")
print("="*80)
print()

# إنشاء المحرك
shop = AdvancedAIRecommender()

# ==========================================
# الخطوة 1: إضافة المنتجات
# ==========================================
print("📦 الخطوة 1: إضافة المنتجات...")
print("-"*80)

products = [
    # الإلكترونيات
    ("laptop_001", "لابتوب HP 15", "إلكترونيات", 
     ["laptop", "hp", "computer", "electronics"], "لابتوب للعمل والدراسة"),
    
    ("laptop_002", "لابتوب Dell Gaming", "إلكترونيات",
     ["laptop", "dell", "gaming", "computer"], "لابتوب ألعاب قوي"),
    
    ("mouse_001", "ماوس Logitech", "إكسسوارات",
     ["mouse", "logitech", "computer", "accessories"], "ماوس لاسلكي"),
    
    ("keyboard_001", "كيبورد ميكانيكي", "إكسسوارات",
     ["keyboard", "mechanical", "computer", "accessories"], "كيبورد احترافي"),
    
    # الملابس
    ("tshirt_001", "تيشيرت قطني", "ملابس",
     ["tshirt", "cotton", "clothing", "casual"], "تيشيرت رياضي"),
    
    ("jeans_001", "بنطلون جينز", "ملابس",
     ["jeans", "pants", "clothing", "casual"], "جينز عصري"),
    
    ("shoes_001", "حذاء رياضي Nike", "أحذية",
     ["shoes", "nike", "sports", "running"], "حذاء للجري"),
    
    # الكتب
    ("book_001", "كتاب تعلم Python", "كتب",
     ["book", "python", "programming", "learning"], "تعلم البرمجة"),
    
    ("book_002", "كتاب تطوير الويب", "كتب",
     ["book", "web", "programming", "javascript"], "تطوير المواقع"),
]

for pid, title, cat, tags, desc in products:
    shop.add_content(pid, title, cat, tags, desc)
    print(f"  ✓ {title}")

print(f"\n✅ {len(products)} منتج مضاف")
print()

# ==========================================
# الخطوة 2: الزبائن يبداو يشريو
# ==========================================
print("="*80)
print("👥 الخطوة 2: سلوك الزبائن (النظام يراقب و يتعلم)")
print("="*80)
print()

# زبون 1: Ahmed - مهتم بالإلكترونيات
print("🧑 الزبون: Ahmed")
print("-"*80)

shop.add_user("ahmed", ["electronics", "computer", "laptop"])

# Ahmed يشوف و يشري لابتوب
print("  1️⃣ شاف لابتوب HP")
shop.record_interaction("ahmed", "laptop_001", "view")

print("  2️⃣ شراه! (5 نجوم)")
shop.record_interaction("ahmed", "laptop_001", "like", rating=5)

print("  3️⃣ شاف ماوس Logitech")
shop.record_interaction("ahmed", "mouse_001", "view", rating=4)

print()
print("🤖 AI يتعلم: Ahmed بغى إلكترونيات + computer accessories")
print()

# الآن شوف التوصيات
recs = shop.get_recommendations("ahmed", 5)
print("✨ التوصيات لـ Ahmed (بعد ما شرى):")
for i, r in enumerate(recs, 1):
    print(f"  {i}. {r['title']} - Score: {r['score']:.3f}")
    print(f"      ➜ Reason: {r['reason']}")

print()
print("💡 لاحظ: النظام يقترح keyboard و Dell gaming (مشابه لما شراه!)")
print()

# ==========================================
# زبون 2: Sara - ملابس
# ==========================================
print("="*80)
print("🧑 الزبون: Sara")
print("-"*80)

shop.add_user("sara", ["fashion", "clothing", "style"])

print("  1️⃣ شافت تيشيرت")
shop.record_interaction("sara", "tshirt_001", "view", rating=5)

print("  2️⃣ عجبها! شرات")
shop.record_interaction("sara", "tshirt_001", "like", rating=5)

print("  3️⃣ شافت جينز")
shop.record_interaction("sara", "jeans_001", "view", rating=4)

print()
print("🤖 AI يتعلم: Sara بغات ملابس casual")
print()

recs = shop.get_recommendations("sara", 5)
print("✨ التوصيات لـ Sara:")
for i, r in enumerate(recs, 1):
    print(f"  {i}. {r['title']} - Score: {r['score']:.3f}")
    print(f"      ➜ تشبه: ملابس و أحذية")

print()

# ==========================================
# زبون 3: Omar - كتب برمجة
# ==========================================
print("="*80)
print("🧑 الزبون: Omar")
print("-"*80)

shop.add_user("omar", ["programming", "learning", "books"])

print("  1️⃣ شاف كتاب Python")
shop.record_interaction("omar", "book_001", "view")

print("  2️⃣ شراه!")
shop.record_interaction("omar", "book_001", "like", rating=5)

print()
print("🤖 AI يتعلم: Omar بغى كتب برمجة")
print()

recs = shop.get_recommendations("omar", 3)
print("✨ التوصيات لـ Omar:")
for i, r in enumerate(recs, 1):
    print(f"  {i}. {r['title']}")
    print(f"      ➜ Score: {r['score']:.3f}")

print()
print("💡 النظام يقترح كتاب تطوير الويب (نفس المجال!)")
print()

# ==========================================
# الخطوة 3: Collaborative Learning
# ==========================================
print("="*80)
print("🧠 الخطوة 3: التعلم التعاوني (Collaborative)")
print("="*80)
print()

# زبون جديد مشابه لـ Ahmed
print("🧑 الزبون الجديد: Khalid")
print("-"*80)

shop.add_user("khalid", ["computer", "electronics"])

print("  ➜ Khalid جديد، ماشراش بعد")
print("  ➜ لكن عندو نفس اهتمامات Ahmed!")
print()

# النظام يستخدم Collaborative Filtering
recs = shop.get_recommendations("khalid", 5)

print("🤖 AI ذكي: يشوف Khalid مشابه لـ Ahmed")
print("✨ التوصيات لـ Khalid (بدون ما يشري!):")
for i, r in enumerate(recs, 1):
    print(f"  {i}. {r['title']} - Score: {r['score']:.3f}")

print()
print("💡 النظام اقترح نفس المنتجات اللي عجبت Ahmed!")
print("   (هذا Collaborative Filtering - يتعلم من الزبائن المتشابهين)")
print()

# ==========================================
# الخطوة 4: النظام يتطور مع الوقت
# ==========================================
print("="*80)
print("⏰ الخطوة 4: النظام يتطور مع الوقت")
print("="*80)
print()

# Ahmed يرجع بعد أسبوع
print("📅 بعد أسبوع... Ahmed رجع")
print("-"*80)

# يشوف منتج جديد
shop.add_content(
    "laptop_003", 
    "لابتوب MacBook Pro", 
    "إلكترونيات",
    ["laptop", "apple", "macbook", "premium"],
    "لابتوب احترافي"
)

print("  ➜ منتج جديد مضاف: MacBook Pro")
print()

# التوصيات الجديدة
recs = shop.get_recommendations("ahmed", 5)

print("✨ التوصيات المحدثة لـ Ahmed:")
for i, r in enumerate(recs, 1):
    print(f"  {i}. {r['title']} - Score: {r['score']:.3f}")

print()
print("💡 النظام ضاف MacBook في التوصيات (منتج جديد مشابه!)")
print()

# ==========================================
# الخلاصة
# ==========================================
print("="*80)
print("🎯 الخلاصة: كيفاش AI يتعلم تلقائياً")
print("="*80)
print()

print("✅ 1. Content-Based Learning:")
print("   → يحلل المنتجات (tags, category, description)")
print("   → يربط بين المنتجات المتشابهة")
print()

print("✅ 2. Behavioral Learning:")
print("   → يراقب ما يشري الزبون")
print("   → يحسب interaction scores")
print("   → يعطي أهمية للـ purchases و likes")
print()

print("✅ 3. Collaborative Learning:")
print("   → يشوف الزبائن المتشابهين")
print("   → يتعلم من سلوكهم")
print("   → يوصي بناءً على ذلك")
print()

print("✅ 4. Continuous Learning:")
print("   → كل interaction = بيانات جديدة")
print("   → النظام يتحسن مع الوقت")
print("   → بدون تدخل يدوي!")
print()

print("="*80)
print("💪 النظام ذكي بحال Amazon - يتعلم تلقائياً!")
print("="*80)
print()

# حفظ البيانات
shop.save_to_file("ecommerce_demo_data.json")
print("💾 البيانات محفوظة في: ecommerce_demo_data.json")
print()

# Statistics
print("📊 الإحصائيات:")
print(f"  - عدد المنتجات: {len(shop.content)}")
print(f"  - عدد الزبائن: {len(shop.users)}")
print(f"  - عدد التفاعلات: {sum(len(i) for i in shop.interactions.values())}")
print()

print("🎉 جرب النظام! سيتعلم من زبائنك تلقائياً!")
