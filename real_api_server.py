#!/usr/bin/env python3
"""
🚀 Real AI Recommendation API
============================
API حقيقي يستخدم المحرك المتقدم
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlparse
import json
from advanced_ai_recommender import AdvancedAIRecommender
import os
from datetime import datetime

# Initialize engine
DATA_FILE = 'real_demo_data.json'
engine = AdvancedAIRecommender()

# Load or create demo data
if os.path.exists(DATA_FILE):
    try:
        engine.load_from_file(DATA_FILE)
        print(f"✓ تم تحميل البيانات من {DATA_FILE}")
    except:
        print("⚠️ خطأ في تحميل البيانات، إنشاء بيانات جديدة...")
        engine = AdvancedAIRecommender()
else:
    print("✓ إنشاء بيانات تجريبية جديدة...")
    
    # Add products
    products = [
        # Electronics
        ("laptop_hp", "لابتوب HP 15 Core i5", "إلكترونيات", 
         ["laptop", "hp", "computer", "core-i5"], "لابتوب للعمل والدراسة"),
        ("laptop_dell", "لابتوب Dell Gaming RTX 3060", "إلكترونيات",
         ["laptop", "dell", "gaming", "rtx"], "لابتوب ألعاب قوي"),
        ("macbook", "MacBook Pro M2", "إلكترونيات",
         ["laptop", "apple", "macbook", "m2"], "لابتوب احترافي"),
        ("mouse_log", "ماوس Logitech G502", "إكسسوارات",
         ["mouse", "logitech", "gaming"], "ماوس ألعاب"),
        ("keyboard_mech", "كيبورد ميكانيكي RGB", "إكسسوارات",
         ["keyboard", "mechanical", "rgb", "gaming"], "كيبورد احترافي"),
        ("monitor_27", "شاشة 27 بوصة 144Hz", "إلكترونيات",
         ["monitor", "display", "gaming", "144hz"], "شاشة للألعاب"),
        
        # Clothing
        ("tshirt_nike", "تيشيرت Nike الرياضي", "ملابس",
         ["tshirt", "nike", "sports", "casual"], "تيشيرت رياضي"),
        ("jeans_levis", "بنطلون Levi's جينز", "ملابس",
         ["jeans", "levis", "pants", "casual"], "جينز كلاسيكي"),
        ("jacket_north", "جاكيت The North Face", "ملابس",
         ["jacket", "north-face", "outdoor"], "جاكيت شتوي"),
        ("shoes_nike", "حذاء Nike Air Max", "أحذية",
         ["shoes", "nike", "running", "sports"], "حذاء رياضي"),
        
        # Books
        ("book_python", "Python للمحترفين", "كتب",
         ["python", "programming", "book", "advanced"], "برمجة متقدمة"),
        ("book_ai", "الذكاء الاصطناعي العملي", "كتب",
         ["ai", "machine-learning", "book", "practical"], "AI عملي"),
        ("book_web", "تطوير الويب الحديث", "كتب",
         ["web", "javascript", "react", "book"], "تطوير ويب"),
        
        # Sports & Fitness
        ("yoga_mat", "بساط يوغا احترافي", "رياضة",
         ["yoga", "mat", "fitness", "exercise"], "يوغا عالي الجودة"),
        ("weights_set", "طقم أوزان 20 كجم", "رياضة",
         ["weights", "dumbbells", "fitness"], "أوزان منزلية"),
        ("protein_whey", "بروتين Whey طبيعي", "صحة",
         ["protein", "whey", "supplement", "health"], "مكمل غذائي"),
    ]
    
    for pid, title, cat, tags, desc in products:
        engine.add_content(pid, title, cat, tags, desc)
    
    # Add users
    users = [
        ("ahmed", ["electronics", "computer", "gaming", "technology"]),
        ("sara", ["fashion", "clothing", "style", "casual"]),
        ("omar", ["programming", "books", "learning", "python"]),
        ("fatima", ["fitness", "health", "sports", "yoga"]),
    ]
    
    for uid, interests in users:
        engine.add_user(uid, interests)
    
    # Add some initial interactions
    engine.record_interaction("ahmed", "laptop_hp", "view", rating=5)
    engine.record_interaction("ahmed", "laptop_hp", "like")
    engine.record_interaction("ahmed", "mouse_log", "view", rating=4)
    
    engine.record_interaction("sara", "tshirt_nike", "view", rating=5)
    engine.record_interaction("sara", "jeans_levis", "view", rating=4)
    
    engine.record_interaction("omar", "book_python", "view", rating=5)
    engine.record_interaction("omar", "book_python", "like")
    
    engine.record_interaction("fatima", "yoga_mat", "view", rating=5)
    
    engine.save_to_file(DATA_FILE)
    print(f"✓ تم حفظ البيانات في {DATA_FILE}")

class APIHandler(BaseHTTPRequestHandler):
    
    def _send_json(self, data, status=200):
        """Send JSON response"""
        self.send_response(status)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', '*')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))
    
    def do_OPTIONS(self):
        """Handle CORS preflight"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', '*')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.end_headers()
    
    def do_GET(self):
        """Handle GET requests"""
        parsed = urlparse(self.path)
        path = parsed.path
        params = parse_qs(parsed.query)
        
        # Get users
        if path == '/api/users':
            users = [{
                'id': uid,
                'interests': u['interests'][:5],
                'viewed': len(u['viewed']),
                'liked': len(u.get('liked', []))
            } for uid, u in engine.users.items()]
            
            self._send_json({'success': True, 'users': users})
        
        # Get all content
        elif path == '/api/content':
            self._send_json({
                'success': True,
                'content': engine.content,
                'total': len(engine.content)
            })
        
        # Get recommendations
        elif path.startswith('/api/recommendations/'):
            user_id = path.split('/')[-1]
            num = int(params.get('num', ['10'])[0])
            
            if user_id not in engine.users:
                self._send_json({'success': False, 'error': 'User not found'}, 404)
                return
            
            # Get context
            now = datetime.now()
            context = {
                'hour': now.hour,
                'is_weekend': now.weekday() >= 5
            }
            
            recs = engine.get_recommendations(user_id, num, context)
            
            self._send_json({
                'success': True,
                'user_id': user_id,
                'recommendations': recs,
                'count': len(recs),
                'context': context
            })
        
        # Get stats
        elif path == '/api/stats':
            total_int = sum(len(i) for i in engine.interactions.values())
            
            self._send_json({
                'success': True,
                'stats': {
                    'users': len(engine.users),
                    'content': len(engine.content),
                    'interactions': total_int,
                    'user_profiles': len(engine.user_profiles),
                    'content_vectors': len(engine.content_vectors)
                }
            })
        
        else:
            self._send_json({'success': False, 'error': 'Not found'}, 404)
    
    def do_POST(self):
        """Handle POST requests"""
        parsed = urlparse(self.path)
        path = parsed.path
        
        # Read body
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)
        
        try:
            data = json.loads(body.decode('utf-8'))
        except:
            self._send_json({'success': False, 'error': 'Invalid JSON'}, 400)
            return
        
        # Record interaction
        if path == '/api/interact':
            user_id = data.get('user_id')
            content_id = data.get('content_id')
            int_type = data.get('type', 'view')
            rating = data.get('rating')
            
            if not user_id or not content_id:
                self._send_json({'success': False, 'error': 'Missing parameters'}, 400)
                return
            
            success = engine.record_interaction(user_id, content_id, int_type, rating)
            
            if success:
                engine.save_to_file(DATA_FILE)
                self._send_json({
                    'success': True,
                    'message': 'Interaction recorded',
                    'ai_learning': True
                })
            else:
                self._send_json({'success': False, 'error': 'Failed to record'}, 400)
        
        else:
            self._send_json({'success': False, 'error': 'Not found'}, 404)
    
    def log_message(self, format, *args):
        """Custom logging"""
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {args[0]}")

if __name__ == '__main__':
    PORT = 5050
    server = HTTPServer(('0.0.0.0', PORT), APIHandler)
    
    print()
    print("="*80)
    print("🚀 Real AI Recommendation API - LIVE")
    print("="*80)
    print()
    print(f"📍 Server: http://localhost:{PORT}")
    print()
    print("📚 Endpoints:")
    print(f"  GET  /api/users                    - قائمة المستخدمين")
    print(f"  GET  /api/content                  - قائمة المنتجات")
    print(f"  GET  /api/recommendations/<user>  - التوصيات")
    print(f"  GET  /api/stats                    - الإحصائيات")
    print(f"  POST /api/interact                 - تسجيل تفاعل")
    print()
    print(f"🌐 Frontend: http://localhost:8080/demo_real_ai.html")
    print()
    print("💾 البيانات محفوظة في: real_demo_data.json")
    print()
    print("Press Ctrl+C to stop")
    print("="*80)
    print()
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n\n✅ Saving data...")
        engine.save_to_file(DATA_FILE)
        print("✅ Server stopped")
