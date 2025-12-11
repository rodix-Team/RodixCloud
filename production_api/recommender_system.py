"""
نظام التوصية بالمحتوى - Content Recommendation System
===============================================
نظام ذكاء اصطناعي بسيط لتوصية المحتوى للمستخدمين
مناسب للمبتدئين في Python
"""

import json
from typing import List, Dict
from collections import Counter
import math


class ContentRecommender:
    """
    نظام التوصيات الذكي
    =====================
    هاد الكلاس كيدير:
    1. كيتعلم من اهتمامات المستخدمين
    2. كيوصي بمحتوى مناسب لكل مستخدم
    
    3. كيحسن التوصيات مع الوقت
    """
    
    def __init__(self):
        """تهيئة النظام"""
        self.users = {}  # معلومات المستخدمين
        self.content_database = []  # قاعدة بيانات المحتوى
        self.user_interactions = {}  # تفاعلات المستخدمين
        
    def add_content(self, content_id: str, title: str, category: str, 
                   tags: List[str], description: str = ""):
        """
        إضافة محتوى جديد للنظام
        
        المعطيات:
        - content_id: رقم تعريف المحتوى
        - title: عنوان المحتوى
        - category: الفئة (مثلا: تكنولوجيا، رياضة، أخبار...)
        - tags: كلمات مفتاحية
        - description: وصف المحتوى
        """
        content = {
            'id': content_id,
            'title': title,
            'category': category,
            'tags': tags,
            'description': description,
            'popularity': 0  # عدد المشاهدات
        }
        self.content_database.append(content)
        print(f"✓ تمت إضافة المحتوى: {title}")
        
    def add_user(self, user_id: str, interests: List[str]):
        """
        إضافة مستخدم جديد
        
        المعطيات:
        - user_id: رقم تعريف المستخدم
        - interests: اهتمامات المستخدم
        """
        self.users[user_id] = {
            'id': user_id,
            'interests': interests,
            'viewed_content': [],
            'preferences': {}
        }
        self.user_interactions[user_id] = []
        print(f"✓ تمت إضافة المستخدم: {user_id}")
        
    def record_interaction(self, user_id: str, content_id: str, 
                          interaction_type: str = 'view', rating: int = 0):
        """
        تسجيل تفاعل المستخدم مع المحتوى
        
        المعطيات:
        - user_id: رقم المستخدم
        - content_id: رقم المحتوى
        - interaction_type: نوع التفاعل (view, like, share, comment)
        - rating: التقييم (من 1 إلى 5)
        """
        if user_id not in self.users:
            print(f"⚠ المستخدم {user_id} غير موجود!")
            return
            
        interaction = {
            'content_id': content_id,
            'type': interaction_type,
            'rating': rating
        }
        
        self.user_interactions[user_id].append(interaction)
        
        # تحديث قائمة المحتوى المشاهد
        if content_id not in self.users[user_id]['viewed_content']:
            self.users[user_id]['viewed_content'].append(content_id)
            
        # زيادة شعبية المحتوى
        for content in self.content_database:
            if content['id'] == content_id:
                content['popularity'] += 1
                break
                
        print(f"✓ تم تسجيل تفاعل المستخدم {user_id} مع المحتوى {content_id}")
        
    def _calculate_similarity(self, user_interests: List[str], 
                             content_tags: List[str]) -> float:
        """
        حساب التشابه بين اهتمامات المستخدم والمحتوى
        كيرجع قيمة من 0 إلى 1 (1 = تشابه كامل)
        """
        if not user_interests or not content_tags:
            return 0.0
            
        # تحويل للأحرف الصغيرة للمقارنة
        user_set = set([i.lower() for i in user_interests])
        content_set = set([t.lower() for t in content_tags])
        
        # حساب التشابه Jaccard
        intersection = len(user_set.intersection(content_set))
        union = len(user_set.union(content_set))
        
        if union == 0:
            return 0.0
            
        return intersection / union
        
    def _calculate_content_score(self, user_id: str, content: Dict) -> float:
        """
        حساب درجة المحتوى للمستخدم
        كياخذ بعين الاعتبار:
        - التشابه مع اهتمامات المستخدم
        - شعبية المحتوى
        - ما إذا كان المستخدم شاهد محتوى مشابه من قبل
        """
        user = self.users[user_id]
        
        # 1. التشابه مع الاهتمامات (وزن 60%)
        all_user_tags = user['interests'].copy()
        
        # إضافة tags من المحتوى المشاهد سابقا
        for viewed_id in user['viewed_content']:
            for c in self.content_database:
                if c['id'] == viewed_id:
                    all_user_tags.extend(c['tags'])
                    break
                    
        similarity_score = self._calculate_similarity(all_user_tags, content['tags'])
        
        # 2. شعبية المحتوى (وزن 20%)
        max_popularity = max([c['popularity'] for c in self.content_database] + [1])
        popularity_score = content['popularity'] / max_popularity
        
        # 3. التنوع - تفضيل المحتوى الجديد (وزن 20%)
        diversity_score = 0.0 if content['id'] in user['viewed_content'] else 1.0
        
        # الدرجة النهائية
        final_score = (similarity_score * 0.6 + 
                      popularity_score * 0.2 + 
                      diversity_score * 0.2)
        
        return final_score
        
    def get_recommendations(self, user_id: str, num_recommendations: int = 5) -> List[Dict]:
        """
        الحصول على توصيات للمستخدم
        
        المعطيات:
        - user_id: رقم المستخدم
        - num_recommendations: عدد التوصيات المطلوبة
        
        الإرجاع:
        - قائمة بالمحتوى الموصى به
        """
        if user_id not in self.users:
            print(f"⚠ المستخدم {user_id} غير موجود!")
            return []
            
        if not self.content_database:
            print("⚠ لا يوجد محتوى في النظام!")
            return []
            
        # حساب الدرجات لكل محتوى
        scored_content = []
        for content in self.content_database:
            score = self._calculate_content_score(user_id, content)
            scored_content.append({
                'content': content,
                'score': score
            })
            
        # ترتيب حسب الدرجة
        scored_content.sort(key=lambda x: x['score'], reverse=True)
        
        # إرجاع أفضل التوصيات
        recommendations = [item['content'] for item in scored_content[:num_recommendations]]
        
        return recommendations
        
    def display_recommendations(self, user_id: str, num_recommendations: int = 5):
        """
        عرض التوصيات بشكل منسق
        """
        print(f"\n{'='*60}")
        print(f"🎯 التوصيات للمستخدم: {user_id}")
        print(f"{'='*60}\n")
        
        recommendations = self.get_recommendations(user_id, num_recommendations)
        
        if not recommendations:
            print("لا توجد توصيات متاحة حاليا.")
            return
            
        for i, content in enumerate(recommendations, 1):
            print(f"{i}. 📌 {content['title']}")
            print(f"   الفئة: {content['category']}")
            print(f"   الكلمات المفتاحية: {', '.join(content['tags'])}")
            print(f"   الشعبية: {content['popularity']} مشاهدة")
            if content['description']:
                print(f"   الوصف: {content['description'][:100]}...")
            print()
            
    def get_user_stats(self, user_id: str):
        """
        عرض إحصائيات المستخدم
        """
        if user_id not in self.users:
            print(f"⚠ المستخدم {user_id} غير موجود!")
            return
            
        user = self.users[user_id]
        interactions = self.user_interactions[user_id]
        
        print(f"\n{'='*60}")
        print(f"📊 إحصائيات المستخدم: {user_id}")
        print(f"{'='*60}\n")
        print(f"الاهتمامات: {', '.join(user['interests'])}")
        print(f"عدد المحتوى المشاهد: {len(user['viewed_content'])}")
        print(f"عدد التفاعلات: {len(interactions)}")
        
        # تحليل التفاعلات
        if interactions:
            interaction_types = Counter([i['type'] for i in interactions])
            print("\nأنواع التفاعلات:")
            for itype, count in interaction_types.items():
                print(f"  - {itype}: {count}")
                
    def save_to_file(self, filename: str = "recommender_data.json"):
        """
        حفظ بيانات النظام في ملف
        """
        data = {
            'users': self.users,
            'content_database': self.content_database,
            'user_interactions': self.user_interactions
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            
        print(f"✓ تم حفظ البيانات في {filename}")
        
    def load_from_file(self, filename: str = "recommender_data.json"):
        """
        تحميل بيانات النظام من ملف
        """
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            self.users = data.get('users', {})
            self.content_database = data.get('content_database', [])
            self.user_interactions = data.get('user_interactions', {})
            
            print(f"✓ تم تحميل البيانات من {filename}")
        except FileNotFoundError:
            print(f"⚠ الملف {filename} غير موجود!")


def demo_example():
    """
    مثال توضيحي لاستخدام النظام
    """
    print("🚀 مرحبا بك في نظام التوصيات الذكي")
    print("="*60)
    
    # إنشاء النظام
    recommender = ContentRecommender()
    
    # إضافة محتوى للنظام
    print("\n📝 إضافة محتوى...")
    
    recommender.add_content(
        "tech001", 
        "أساسيات البرمجة بلغة Python",
        "تكنولوجيا",
        ["python", "برمجة", "تعليم", "مبتدئين"],
        "دورة شاملة لتعلم Python من الصفر"
    )
    
    recommender.add_content(
        "tech002",
        "الذكاء الاصطناعي وتعلم الآلة",
        "تكنولوجيا",
        ["ai", "machine learning", "python", "تقني"],
        "مقدمة في الذكاء الاصطناعي"
    )
    
    recommender.add_content(
        "tech003",
        "تطوير تطبيقات الويب",
        "تكنولوجيا",
        ["web", "javascript", "برمجة", "html"],
        "كيفية بناء مواقع ويب حديثة"
    )
    
    recommender.add_content(
        "sport001",
        "أخبار كرة القدم اليوم",
        "رياضة",
        ["كرة قدم", "رياضة", "أخبار"],
        "آخر أخبار الكرة العالمية"
    )
    
    recommender.add_content(
        "health001",
        "نصائح للحياة الصحية",
        "صحة",
        ["صحة", "تغذية", "رياضة", "wellness"],
        "دليل الحياة الصحية"
    )
    
    recommender.add_content(
        "tech004",
        "تطبيقات الهاتف والبرمجة",
        "تكنولوجيا",
        ["mobile", "android", "ios", "برمجة"],
        "تطوير تطبيقات الموبايل"
    )
    
    # إضافة مستخدمين
    print("\n👥 إضافة مستخدمين...")
    
    recommender.add_user("user001", ["python", "برمجة", "ai"])
    recommender.add_user("user002", ["كرة قدم", "رياضة"])
    recommender.add_user("user003", ["web", "javascript", "تقني"])
    
    # تسجيل بعض التفاعلات
    print("\n⚡ تسجيل تفاعلات المستخدمين...")
    
    recommender.record_interaction("user001", "tech001", "view", 5)
    recommender.record_interaction("user001", "tech002", "like", 4)
    recommender.record_interaction("user002", "sport001", "view", 5)
    recommender.record_interaction("user003", "tech003", "view", 4)
    
    # عرض التوصيات لكل مستخدم
    print("\n" + "="*60)
    recommender.display_recommendations("user001", 3)
    recommender.get_user_stats("user001")
    
    print("\n" + "="*60)
    recommender.display_recommendations("user002", 3)
    recommender.get_user_stats("user002")
    
    print("\n" + "="*60)
    recommender.display_recommendations("user003", 3)
    recommender.get_user_stats("user003")
    
    # حفظ البيانات
    print("\n💾 حفظ البيانات...")
    recommender.save_to_file()
    
    print("\n" + "="*60)
    print("✅ انتهى المثال التوضيحي!")
    print("="*60)


if __name__ == "__main__":
    # تشغيل المثال التوضيحي
    demo_example()
