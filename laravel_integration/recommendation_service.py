#!/usr/bin/env python3
"""
Recommendation Service for Laravel Integration
===============================================
يستدعى من Laravel عبر shell_exec
"""

import sys
import json
from recommender_system import ContentRecommender
import os

# Initialize engine
DATA_FILE = 'recommender_data.json'
engine = ContentRecommender()

# Load existing data
if os.path.exists(DATA_FILE):
    engine.load_from_file(DATA_FILE)

def handle_command(command):
    """معالجة الأوامر من Laravel"""
    action = command.get('action')
    data = command.get('data', {})
    
    try:
        if action == 'add_content':
            # إضافة محتوى
            success = engine.add_content(
                content_id=data['id'],
                title=data['title'],
                category=data.get('category', 'عام'),
                tags=data.get('tags', []),
                description=data.get('description', '')
            )
            result = {'success': success, 'data': {'content_id': data['id']}}
        
        elif action == 'add_user':
            # إضافة مستخدم
            success = engine.add_user(
                user_id=data['id'],
                interests=data.get('interests', [])
            )
            result = {'success': success, 'data': {'user_id': data['id']}}
        
        elif action == 'record_interaction':
            # تسجيل تفاعل
            success = engine.record_interaction(
                user_id=data['user_id'],
                content_id=data['content_id'],
                interaction_type=data.get('type', 'view'),
                rating=data.get('rating')
            )
            result = {'success': success}
        
        elif action == 'get_recommendations':
            # الحصول على توصيات
            recs = engine.get_recommendations(
                user_id=data['user_id'],
                num_recommendations=data.get('num', 10)
            )
            result = {'success': True, 'data': recs}
        
        elif action == 'get_stats':
            # إحصائيات
            stats = {
                'users': len(engine.users),
                'content': len(engine.content_database),
                'interactions': sum(len(i) for i in engine.user_interactions.values())
            }
            result = {'success': True, 'data': stats}
        
        else:
            result = {'success': False, 'error': f'Unknown action: {action}'}
        
        # حفظ البيانات بعد كل عملية
        engine.save_to_file(DATA_FILE)
        
        return result
        
    except Exception as e:
        return {'success': False, 'error': str(e)}

if __name__ == '__main__':
    # قراءة الأمر من Laravel
    if len(sys.argv) < 2:
        print(json.dumps({'success': False, 'error': 'No command provided'}))
        sys.exit(1)
    
    try:
        command_json = sys.argv[1]
        command = json.loads(command_json)
        
        result = handle_command(command)
        
        # إرجاع النتيجة كـ JSON
        print(json.dumps(result, ensure_ascii=False))
        
    except Exception as e:
        print(json.dumps({'success': False, 'error': str(e)}))
        sys.exit(1)
