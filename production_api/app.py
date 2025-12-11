"""
🚀 Professional Flask API for Production
========================================
Separate Python API with Flask + CORS
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from recommender_system import ContentRecommender
import os
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# CORS configuration
CORS(app, resources={
    r"/api/*": {
        "origins": ["*"],  # في الإنتاج: غير بالـ domains الصحيحة
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Initialize recommendation engine
DATA_FILE = os.getenv('DATA_FILE', '/var/lib/recommender/data.json')
engine = ContentRecommender()

# Load existing data
if os.path.exists(DATA_FILE):
    engine.load_from_file(DATA_FILE)
    logger.info(f"Loaded data from {DATA_FILE}")
else:
    logger.info("Starting with fresh data")

# ============= Helper Functions =============

def save_data():
    """حفظ البيانات"""
    try:
        # Create directory if not exists
        os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
        engine.save_to_file(DATA_FILE)
        logger.info(f"Data saved to {DATA_FILE}")
        return True
    except Exception as e:
        logger.error(f"Failed to save data: {e}")
        return False

def error_response(message, status=400):
    """إرجاع خطأ منسق"""
    return jsonify({'success': False, 'error': message}), status

# ============= Health & Info =============

@app.route('/')
def home():
    """الصفحة الرئيسية"""
    return jsonify({
        'name': 'AI Recommendation API',
        'version': '1.0.0',
        'status': 'running',
        'endpoints': {
            'health': '/health',
            'stats': '/api/stats',
            'content': '/api/content',
            'users': '/api/users',
            'recommendations': '/api/recommendations/<user_id>',
            'interact': '/api/interact'
        }
    })

@app.route('/health')
def health():
    """فحص الصحة"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'data': {
            'users': len(engine.users),
            'content': len(engine.content_database),
            'interactions': sum(len(i) for i in engine.user_interactions.values())
        }
    })

# ============= Content Management =============

@app.route('/api/content', methods=['POST'])
def add_content():
    """إضافة محتوى"""
    data = request.get_json()
    
    required = ['id', 'title', 'category', 'tags']
    if not all(k in data for k in required):
        return error_response('Missing required fields')
    
    success = engine.add_content(
        content_id=data['id'],
        title=data['title'],
        category=data['category'],
        tags=data['tags'],
        description=data.get('description', '')
    )
    
    if success:
        save_data()
        return jsonify({'success': True, 'message': 'Content added'})
    
    return error_response('Content already exists or failed to add')

@app.route('/api/content', methods=['GET'])
def get_all_content():
    """قائمة المحتوى"""
    limit = request.args.get('limit', 100, type=int)
    offset = request.args.get('offset', 0, type=int)
    
    content = engine.content_database[offset:offset+limit]
    
    return jsonify({
        'success': True,
        'content': content,
        'total': len(engine.content_database),
        'limit': limit,
        'offset': offset
    })

@app.route('/api/content/<content_id>', methods=['GET'])
def get_content(content_id):
    """الحصول على محتوى معين"""
    content = engine.get_content(content_id)
    
    if content:
        return jsonify({'success': True, 'content': content})
    
    return error_response('Content not found', 404)

# ============= User Management =============

@app.route('/api/users', methods=['POST'])
def add_user():
    """إضافة/تحديث مستخدم"""
    data = request.get_json()
    
    if 'id' not in data or 'interests' not in data:
        return error_response('Missing required fields')
    
    success = engine.add_user(
        user_id=data['id'],
        interests=data['interests']
    )
    
    if success:
        save_data()
        return jsonify({'success': True, 'message': 'User added/updated'})
    
    # إذا فشل، يمكن أن يكون المستخدم موجود - نحدثه
    return jsonify({'success': True, 'message': 'User updated'})

@app.route('/api/users', methods=['GET'])
def get_users():
    """قائمة المستخدمين"""
    users = [{
        'id': uid,
        'interests': u['interests'][:10],
        'viewed_count': len(u['viewed_content'])
    } for uid, u in engine.users.items()]
    
    return jsonify({
        'success': True,
        'users': users,
        'total': len(users)
    })

# ============= Interactions =============

@app.route('/api/interact', methods=['POST'])
def record_interaction():
    """تسجيل تفاعل"""
    data = request.get_json()
    
    required = ['user_id', 'content_id']
    if not all(k in data for k in required):
        return error_response('Missing required fields')
    
    success = engine.record_interaction(
        user_id=data['user_id'],
        content_id=data['content_id'],
        interaction_type=data.get('type', 'view'),
        rating=data.get('rating')
    )
    
    if success:
        save_data()
        return jsonify({'success': True, 'message': 'Interaction recorded'})
    
    return error_response('Failed to record interaction')

# ============= Recommendations =============

@app.route('/api/recommendations/<user_id>', methods=['GET'])
def get_recommendations(user_id):
    """الحصول على توصيات"""
    num = request.args.get('num', 10, type=int)
    category = request.args.get('category')
    
    if user_id not in engine.users:
        return error_response('User not found', 404)
    
    recommendations = engine.get_recommendations(user_id, num)
    
    # Filter by category if specified
    if category:
        recommendations = [r for r in recommendations if r.get('category') == category]
    
    return jsonify({
        'success': True,
        'user_id': user_id,
        'recommendations': recommendations,
        'count': len(recommendations)
    })

# ============= Statistics =============

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """إحصائيات النظام"""
    from collections import Counter
    
    total_interactions = sum(len(i) for i in engine.user_interactions.values())
    
    # Popular categories
    categories = Counter(c['category'] for c in engine.content_database)
    
    return jsonify({
        'success': True,
        'stats': {
            'total_users': len(engine.users),
            'total_content': len(engine.content_database),
            'total_interactions': total_interactions,
            'popular_categories': dict(categories.most_common(5))
        }
    })

# ============= Batch Operations =============

@app.route('/api/content/batch', methods=['POST'])
def add_batch_content():
    """إضافة عدة محتويات دفعة واحدة"""
    data = request.get_json()
    
    if 'contents' not in data or not isinstance(data['contents'], list):
        return error_response('Invalid batch data')
    
    added = 0
    failed = 0
    
    for content in data['contents']:
        try:
            success = engine.add_content(
                content_id=content['id'],
                title=content['title'],
                category=content['category'],
                tags=content['tags'],
                description=content.get('description', '')
            )
            if success:
                added += 1
            else:
                failed += 1
        except Exception as e:
            logger.error(f"Failed to add content: {e}")
            failed += 1
    
    save_data()
    
    return jsonify({
        'success': True,
        'added': added,
        'failed': failed,
        'total': len(data['contents'])
    })

# ============= Error Handlers =============

@app.errorhandler(404)
def not_found(error):
    return error_response('Endpoint not found', 404)

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal error: {error}")
    return error_response('Internal server error', 500)

# ============= Run Server =============

if __name__ == '__main__':
    PORT = int(os.getenv('PORT', 5000))
    DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
    
    logger.info(f"Starting AI Recommendation API on port {PORT}")
    logger.info(f"Debug mode: {DEBUG}")
    logger.info(f"Data file: {DATA_FILE}")
    
    app.run(
        host='0.0.0.0',
        port=PORT,
        debug=DEBUG
    )
