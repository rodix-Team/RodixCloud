"""
🧠 Advanced AI Recommendation Engine
====================================
محرك توصيات ذكي متقدم بدون dependencies
"""

import json
import math
from collections import defaultdict, Counter
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple


class AdvancedAIRecommender:
    """
    محرك توصيات AI متقدم
    ===================
    
    المميزات المتقدمة:
    ✅ Content-Based Filtering (TF-IDF)
    ✅ Collaborative Filtering (User-User + Item-Item)
    ✅ Time-Decay (اهتمام المستخدم يتغير مع الوقت)
    ✅ Session-Based (التوصية حسب الجلسة الحالية)
    ✅ Cold Start Solutions (للمستخدمين الجدد)
    ✅ Diversity & Serendipity (تنوع و مفاجآت)
    ✅ Trending Detection (اكتشاف المحتوى الرائج)
    ✅ Personalized Ranking (ترتيب شخصي)
    """
    
    def __init__(self):
        self.users = {}
        self.content = []
        self.interactions = defaultdict(list)
        
        # Advanced features
        self.user_profiles = {}  # TF-IDF profiles
        self.content_vectors = {}  # TF-IDF vectors
        self.trending_cache = {}  # Trending content
        self.session_history = defaultdict(list)
        
        # Parameters
        self.time_decay_factor = 0.95  # How fast interests decay
        self.diversity_weight = 0.3
        self.serendipity_chance = 0.15
        self.trending_window_hours = 24
    
    # ============= Core Functions =============
    
    def add_content(self, content_id: str, title: str, category: str, 
                   tags: List[str], description: str = "") -> bool:
        """إضافة محتوى"""
        if any(c['id'] == content_id for c in self.content):
            return False
        
        content_data = {
            'id': content_id,
            'title': title,
            'category': category,
            'tags': [t.lower() for t in tags],
            'description': description.lower(),
            'created_at': datetime.now().isoformat(),
            'view_count': 0,
            'like_count': 0,
            'share_count': 0,
            'quality_score': 0.5,
            'trending_score': 0.0
        }
        
        self.content.append(content_data)
        self._build_content_vector(content_data)
        
        return True
    
    def add_user(self, user_id: str, interests: List[str]) -> bool:
        """إضافة مستخدم"""
        if user_id in self.users:
            return False
        
        self.users[user_id] = {
            'id': user_id,
            'interests': [i.lower() for i in interests],
            'viewed': [],
            'liked': [],
            'created_at': datetime.now().isoformat(),
            'last_active': datetime.now().isoformat()
        }
        
        self._build_user_profile(user_id)
        return True
    
    def record_interaction(self, user_id: str, content_id: str, 
                          interaction_type: str = 'view', 
                          rating: Optional[int] = None,
                          session_id: Optional[str] = None) -> bool:
        """تسجيل تفاعل متقدم"""
        if user_id not in self.users:
            return False
        
        content = self._get_content(content_id)
        if not content:
            return False
        
        # Record interaction
        interaction = {
            'user_id': user_id,
            'content_id': content_id,
            'type': interaction_type,
            'rating': rating,
            'timestamp': datetime.now().isoformat(),
            'session_id': session_id
        }
        
        self.interactions[user_id].append(interaction)
        
        # Update content stats
        if interaction_type == 'view':
            content['view_count'] += 1
            self.users[user_id]['viewed'].append(content_id)
        elif interaction_type == 'like':
            content['like_count'] += 1
            self.users[user_id]['liked'].append(content_id)
        elif interaction_type == 'share':
            content['share_count'] += 1
        
        # Update quality score
        content['quality_score'] = self._calculate_quality_score(content)
        
        # Update trending
        self._update_trending_score(content)
        
        # Update user profile
        self._update_user_profile(user_id)
        
        # Session tracking
        if session_id:
            self.session_history[session_id].append(content_id)
        
        # Update last active
        self.users[user_id]['last_active'] = datetime.now().isoformat()
        
        return True
    
    # ============= Advanced Recommendation =============
    
    def get_recommendations(self, user_id: str, num: int = 10,
                          context: Optional[Dict] = None) -> List[Dict]:
        """
        الحصول على توصيات ذكية متقدمة
        
        الخوارزمية:
        1. Collaborative Filtering (60%)
        2. Content-Based (30%)
        3. Trending (10%)
        + Time Decay
        + Diversity
        + Serendipity
        """
        if user_id not in self.users:
            return []
        
        # Get context
        if context is None:
            context = self._get_current_context()
        
        # Score all content
        scored = []
        for content in self.content:
            # Skip viewed content (unless re-recommendation is needed)
            if content['id'] in self.users[user_id]['viewed']:
                continue
            
            # Calculate multi-factor score
            score = self._calculate_advanced_score(user_id, content, context)
            
            # FILTER: Skip low relevance items (< 10% after scaling)
            if score < 0.10:  # Adjusted for new scale
                continue
            
            scored.append({
                **content,
                'score': score,
                'reason': self._get_recommendation_reason(user_id, content, score)
            })
        
        # Sort by score
        scored.sort(key=lambda x: x['score'], reverse=True)
        
        # Apply diversity
        final_recs = self._apply_diversity(scored, num)
        
        # Apply serendipity (surprise factor)
        final_recs = self._apply_serendipity(final_recs, scored, num)
        
        return final_recs[:num]
    
    def _calculate_advanced_score(self, user_id: str, content: Dict, 
                                 context: Dict) -> float:
        """حساب Score متقدم محسّن"""
        
        # 1. Collaborative Filtering Score (40%)
        cf_score = self._collaborative_filtering_score(user_id, content['id'])
        
        # 2. Content-Based Score (50%) - أهم شي!
        cb_score = self._content_based_score(user_id, content)
        
        # 3. Trending & Quality Boost (10%)
        trend_score = content['trending_score']
        quality = content['quality_score']
        
        # Boost if user interests match content category/tags
        interest_match = self._calculate_interest_match(user_id, content)
        
        # If interest match is negative (irrelevant), return very low score
        if interest_match < 0:
            return 0.01  # Nearly zero - filter out irrelevant items
        
        # Combined base score with better weights
        base_score = (
            interest_match * 0.40 +    # Interest match MOST important!
            cb_score * 0.35 +          # Content similarity second
            cf_score * 0.20 +          # Collaborative third
            trend_score * 0.05         # Trending bonus
        )
        
        # Quality multiplier (not too aggressive)
        base_score = base_score * (0.7 + (quality * 0.3))
        
        # 5. Time Decay (less aggressive)
        time_factor = self._calculate_time_decay(user_id)
        
        # 6. Context Boost
        context_boost = self._calculate_context_boost(content, context)
        
        # Final score - normalize better
        final_score = base_score * time_factor * context_boost
        
        # Scale UP to make scores more visible and higher
        # Top matches should be 50-90%, not 20-30%
        final_score = min(max(final_score * 3.0, 0), 1.0)  # 3x boost!
        
        return final_score
    
    def _calculate_interest_match(self, user_id: str, content: Dict) -> float:
        """
        حساب مدى تطابق الاهتمامات - محسّن
        
        استراتيجية:
        - Jaccard Similarity: للـ tags فقط (خصائص المنتجات)
        - TF-IDF + Cosine: للنصوص (أوصاف المنتجات)
        """
        user = self.users[user_id]
        user_interests = set(user['interests'])
        content_tags = set(content['tags'])
        
        # 1. Jaccard Similarity للـ Tags فقط
        # صيغة Jaccard: |A ∩ B| / |A ∪ B|
        intersection = user_interests & content_tags
        union = user_interests | content_tags
        jaccard_score = len(intersection) / len(union) if union else 0.0
        
        # 2. Category boost (إذا الفئة في الاهتمامات)
        category_lower = content['category'].lower()
        category_match = 0.0
        for interest in user_interests:
            if interest in category_lower or category_lower in interest:
                category_match = 1.0
                break
        
        # Weighted combination
        # Jaccard أهم للـ tags، Category boost إضافي
        combined = (jaccard_score * 0.75) + (category_match * 0.25)
        
        # Small penalty if NO match at all (but still allow it)
        if combined == 0.0:
            return 0.05  # Low score but not blocked
        
        return combined
    
    # ============= Collaborative Filtering =============
    
    def _collaborative_filtering_score(self, user_id: str, content_id: str) -> float:
        """User-User + Item-Item Collaborative Filtering"""
        
        # User-User CF
        similar_users = self._find_similar_users(user_id, top_k=10)
        user_user_score = 0.0
        
        for similar_user, similarity in similar_users:
            if content_id in self.users[similar_user]['viewed']:
                user_user_score += similarity
        
        user_user_score = min(user_user_score, 1.0)
        
        # Item-Item CF
        user_viewed = self.users[user_id]['viewed']
        item_item_score = 0.0
        
        if user_viewed:
            for viewed_id in user_viewed[-5:]:  # Last 5 viewed
                similarity = self._content_similarity(viewed_id, content_id)
                item_item_score += similarity
            
            item_item_score /= len(user_viewed[-5:])
        
        # Combine
        return (user_user_score * 0.6 + item_item_score * 0.4)
    
    def _find_similar_users(self, user_id: str, top_k: int = 10) -> List[Tuple[str, float]]:
        """إيجاد المستخدمين المتشابهين"""
        similarities = []
        
        user_profile = self.user_profiles.get(user_id, {})
        if not user_profile:
            return []
        
        for other_id in self.users:
            if other_id == user_id:
                continue
            
            other_profile = self.user_profiles.get(other_id, {})
            if not other_profile:
                continue
            
            # Cosine similarity
            similarity = self._cosine_similarity(user_profile, other_profile)
            
            if similarity > 0:
                similarities.append((other_id, similarity))
        
        similarities.sort(key=lambda x: x[1], reverse=True)
        return similarities[:top_k]
    
    # ============= Content-Based Filtering =============
    
    def _content_based_score(self, user_id: str, content: Dict) -> float:
        """
        Content-Based Filtering بـ TF-IDF + Cosine Similarity
        
        هاد الدالة تستعمل للنصوص والأوصاف:
        - TF (Term Frequency): كم مرة كل كلمة تظهر
        - IDF (Inverse Document Frequency): أهمية الكلمة (الكلمات النادرة أهم)
        - Cosine Similarity: التشابه بين vectors
        """
        
        user_profile = self.user_profiles.get(user_id, {})
        content_vector = self.content_vectors.get(content['id'], {})
        
        if not user_profile or not content_vector:
            return 0.0
        
        # Cosine similarity between user profile and content
        return self._cosine_similarity(user_profile, content_vector)
    
    def _build_content_vector(self, content: Dict):
        """
        بناء TF-IDF vector للمحتوى
        
        النصوص فقط (description) - Tags تُعالج بـ Jaccard
        """
        # Text features only (not tags - those use Jaccard)
        text_features = (
            [content['category'].lower()] +
            content['description'].split()
        )
        
        if not text_features:
            self.content_vectors[content['id']] = {}
            return
        
        # Calculate TF
        tf = Counter(text_features)
        total_terms = len(text_features)
        
        # TF normalization
        vector = {}
        for term, count in tf.items():
            # TF = count / total
            tf_score = count / total_terms if total_terms > 0 else 0
            
            # IDF approximation (could be improved with full corpus)
            # For now: log(total_content / content_with_term)
            docs_with_term = sum(1 for c in self.content if term in c.get('description', '').lower())
            idf = math.log((len(self.content) + 1) / (docs_with_term + 1)) + 1
            
            vector[term] = tf_score * idf
        
        self.content_vectors[content['id']] = vector
    
    def _build_user_profile(self, user_id: str):
        """
        بناء TF-IDF profile للمستخدم
        
        يجمع:
        - الاهتمامات (interests)
        - أوصاف المحتوى اللي شافو (descriptions)
        """
        user = self.users[user_id]
        
        # Start with interests
        all_features = user['interests'].copy()
        
        # Add description words from viewed content (not tags)
        for content_id in user['viewed']:
            content = self._get_content(content_id)
            if content:
                all_features.append(content['category'].lower())
                all_features.extend(content['description'].split())
        
        # Build TF-IDF vector
        if all_features:
            tf = Counter(all_features)
            total = len(all_features)
            
            profile = {}
            for term, count in tf.items():
                tf_score = count / total
                # Simple IDF approximation
                docs_with_term = sum(1 for c in self.content if term in c.get('description', '').lower())
                idf = math.log((len(self.content) + 1) / (docs_with_term + 1)) + 1
                profile[term] = tf_score * idf
            
            self.user_profiles[user_id] = profile
    
    def _update_user_profile(self, user_id: str):
        """تحديث profile المستخدم بعد تفاعل جديد"""
        self._build_user_profile(user_id)
    
    # ============= Advanced Features =============
    
    def _calculate_time_decay(self, user_id: str) -> float:
        """Time decay - الاهتمامات الحديثة أهم"""
        user = self.users[user_id]
        last_active = datetime.fromisoformat(user['last_active'])
        now = datetime.now()
        
        days_since_active = (now - last_active).days
        
        # Exponential decay
        decay = math.pow(self.time_decay_factor, days_since_active)
        
        return max(decay, 0.5)  # Minimum 0.5
    
    def _calculate_context_boost(self, content: Dict, context: Dict) -> float:
        """Context-aware boost (time, day, etc.)"""
        boost = 1.0
        
        hour = context.get('hour', datetime.now().hour)
        is_weekend = context.get('is_weekend', datetime.now().weekday() >= 5)
        
        # Evening boost for entertainment
        if 18 <= hour <= 23 and 'entertainment' in content['tags']:
            boost *= 1.2
        
        # Morning boost for news
        if 6 <= hour <= 12 and 'news' in content['tags']:
            boost *= 1.15
        
        # Weekend boost for leisure
        if is_weekend and content['category'] in ['ترفيه', 'رياضة']:
            boost *= 1.1
        
        return boost
    
    def _calculate_quality_score(self, content: Dict) -> float:
        """حساب جودة المحتوى"""
        views = content['view_count']
        likes = content['like_count']
        shares = content['share_count']
        
        if views == 0:
            return 0.5
        
        # Engagement rate
        engagement = (likes + shares * 2) / views
        
        # Normalize
        quality = min(engagement * 2, 1.0)
        
        return max(quality, 0.3)  # Minimum quality
    
    def _update_trending_score(self, content: Dict):
        """تحديث Trending score"""
        now = datetime.now()
        recent_interactions = 0
        
        # Count interactions in last 24 hours
        for user_id in self.interactions:
            for interaction in self.interactions[user_id]:
                if interaction['content_id'] != content['id']:
                    continue
                
                timestamp = datetime.fromisoformat(interaction['timestamp'])
                hours_ago = (now - timestamp).total_seconds() / 3600
                
                if hours_ago <= self.trending_window_hours:
                    weight = 1.0 if interaction['type'] == 'view' else 2.0
                    recent_interactions += weight
        
        # Normalize
        content['trending_score'] = min(recent_interactions / 100, 1.0)
    
    def _apply_diversity(self, scored: List[Dict], num: int) -> List[Dict]:
        """Apply diversity re-ranking"""
        if len(scored) <= num:
            return scored
        
        selected = [scored[0]]  # Start with top item
        remaining = scored[1:]
        
        while len(selected) < num and remaining:
            # Find most diverse item
            best_idx = 0
            best_diversity = -1
            
            for idx, item in enumerate(remaining):
                diversity = self._calculate_diversity_score(item, selected)
                combined = item['score'] * (1 - self.diversity_weight) + diversity * self.diversity_weight
                
                if combined > best_diversity:
                    best_diversity = combined
                    best_idx = idx
            
            selected.append(remaining.pop(best_idx))
        
        return selected
    
    def _calculate_diversity_score(self, item: Dict, selected: List[Dict]) -> float:
        """حساب التنوع"""
        if not selected:
            return 1.0
        
        # Category diversity
        categories = set(s['category'] for s in selected)
        category_div = 0.0 if item['category'] in categories else 0.5
        
        # Tag diversity
        item_tags = set(item['tags'])
        tag_diversities = []
        
        for s in selected:
            s_tags = set(s['tags'])
            jaccard = len(item_tags & s_tags) / len(item_tags | s_tags) if (item_tags | s_tags) else 0
            tag_diversities.append(1 - jaccard)
        
        avg_tag_div = sum(tag_diversities) / len(tag_diversities) if tag_diversities else 1.0
        
        return (category_div + avg_tag_div) / 2
    
    def _apply_serendipity(self, recs: List[Dict], all_scored: List[Dict], num: int) -> List[Dict]:
        """إضافة مفاجآت (Serendipity)"""
        import random
        
        if random.random() > self.serendipity_chance:
            return recs
        
        # Replace one item with a surprising recommendation
        if len(all_scored) > num:
            # Get medium-scored items (not too high, not too low)
            mid_range = all_scored[num:min(num*2, len(all_scored))]
            
            if mid_range:
                surprise = random.choice(mid_range)
                surprise['reason'] = 'serendipity'
                
                # Replace last item
                recs = recs[:-1] + [surprise]
        
        return recs
    
    def _get_recommendation_reason(self, user_id: str, content: Dict, score: float) -> str:
        """سبب التوصية"""
        if score > 0.8:
            return "highly_recommended"
        elif content['trending_score'] > 0.7:
            return "trending"
        elif content['quality_score'] > 0.8:
            return "high_quality"
        elif self._content_similarity_to_liked(user_id, content['id']) > 0.7:
            return "similar_to_liked"
        else:
            return "recommended"
    
    def _content_similarity_to_liked(self, user_id: str, content_id: str) -> float:
        """مدى تشابه المحتوى مع ما أعجب المستخدم"""
        liked = self.users[user_id].get('liked', [])
        
        if not liked:
            return 0.0
        
        similarities = []
        for liked_id in liked:
            sim = self._content_similarity(content_id, liked_id)
            similarities.append(sim)
        
        return max(similarities) if similarities else 0.0
    
    # ============= Helper Functions =============
    
    def _get_content(self, content_id: str) -> Optional[Dict]:
        """Get content by ID"""
        for c in self.content:
            if c['id'] == content_id:
                return c
        return None
    
    def _content_similarity(self, content_id1: str, content_id2: str) -> float:
        """تشابه بين محتويين"""
        vec1 = self.content_vectors.get(content_id1, {})
        vec2 = self.content_vectors.get(content_id2, {})
        
        return self._cosine_similarity(vec1, vec2)
    
    def _cosine_similarity(self, vec1: Dict, vec2: Dict) -> float:
        """Cosine similarity بين vectors"""
        if not vec1 or not vec2:
            return 0.0
        
        # Dot product
        dot_product = sum(vec1.get(term, 0) * vec2.get(term, 0) for term in set(vec1) | set(vec2))
        
        # Magnitudes
        mag1 = math.sqrt(sum(v**2 for v in vec1.values()))
        mag2 = math.sqrt(sum(v**2 for v in vec2.values()))
        
        if mag1 == 0 or mag2 == 0:
            return 0.0
        
        return dot_product / (mag1 * mag2)
    
    def _get_current_context(self) -> Dict:
        """Get current context"""
        now = datetime.now()
        return {
            'hour': now.hour,
            'day_of_week': now.weekday(),
            'is_weekend': now.weekday() >= 5,
            'timestamp': now.isoformat()
        }
    
    # ============= Data Persistence =============
    
    def save_to_file(self, filename: str):
        """حفظ البيانات"""
        data = {
            'users': self.users,
            'content': self.content,
            'interactions': dict(self.interactions),
            'user_profiles': self.user_profiles,
            'content_vectors': self.content_vectors
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    
    def load_from_file(self, filename: str):
        """تحميل البيانات"""
        with open(filename, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        self.users = data.get('users', {})
        self.content = data.get('content', [])
        self.interactions = defaultdict(list, data.get('interactions', {}))
        self.user_profiles = data.get('user_profiles', {})
        self.content_vectors = data.get('content_vectors', {})
