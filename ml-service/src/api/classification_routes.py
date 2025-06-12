from flask import Blueprint, request, jsonify
from src.models.waste_classifier import WasteClassifier
import io

classification_bp = Blueprint('classification', __name__)
classifier = WasteClassifier()

@classification_bp.route('/classify', methods=['POST'])
def classify_waste():
    try:
        if 'image' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No image file provided'
            }), 400

        image_file = request.files['image']
        if not image_file.filename:
            return jsonify({
                'success': False,
                'error': 'Empty image file'
            }), 400

        image_bytes = image_file.read()
        if not image_bytes:
            return jsonify({
                'success': False,
                'error': 'Empty image content'
            }), 400
            
        result = classifier.predict(image_bytes)
        
        if not result['success']:
            return jsonify({
                'success': False,
                'error': result.get('error', 'Classification failed')
            }), 500

        return jsonify({
            'success': True,
            'data': {
                'category': result['category'],
                'confidence': result['confidence']
            }
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
