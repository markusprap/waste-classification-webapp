from flask import Blueprint, request, jsonify
from datetime import datetime
from src.models.waste_classifier import WasteClassifier
import logging

logger = logging.getLogger(__name__)
api_bp = Blueprint('api', __name__)

classifier = WasteClassifier()

@api_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'time': datetime.now().isoformat()
    })

@api_bp.route('/api/classify', methods=['POST'])
def classify_waste():
    try:
        if 'image' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No image file provided'
            }), 400
        
        file = request.files['image']
        
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No selected file'
            }), 400
            
        image_bytes = file.read()
        
        lang = request.args.get('lang', 'en')
        if lang not in ['en', 'id']:
            lang = 'en'
        
        logger.info(f'Processing classification request: filename={file.filename}, lang={lang}')
        
        result = classifier.predict(image_bytes)
        
        if not result['success']:
            logger.error(f'Classification failed: {result.get("error")}')
            return jsonify(result), 400
        
        response = {
            'success': True,
            'data': {
                'subcategory': result['subcategory'],
                'main_category': result['main_category'],
                'confidence': result['confidence']
            }
        }
        
        logger.info(f'Classification successful: subcategory={result["subcategory"]}, main_category={result["main_category"]}, confidence={result["confidence"]:.2f}')
        return jsonify(response)
        
    except Exception as e:
        logger.exception('Error processing classification request')
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@api_bp.route('/api/model-info', methods=['GET'])
def get_model_info():
    try:
        if hasattr(classifier.model, 'output_shape'):
            output_shape = classifier.model.output_shape
        else:
            output_shape = classifier.model.layers[-1].output_shape
            
        try:
            total_params = classifier.model.count_params()
        except:
            total_params = "Unknown"
            
        category_details = []
        category_descriptions = {
            "cardboard": {"id": "Karton/Kardus", "type": "Recyclable", "disposal": "Daur ulang"},
            "glass": {"id": "Kaca", "type": "Recyclable", "disposal": "Daur ulang"},
            "metal": {"id": "Logam/Kaleng", "type": "Recyclable", "disposal": "Daur ulang"},
            "paper": {"id": "Kertas", "type": "Recyclable", "disposal": "Daur ulang"},
            "plastic": {"id": "Plastik", "type": "Recyclable", "disposal": "Daur ulang"},
            "trash": {"id": "Sampah Umum", "type": "Inorganic", "disposal": "Buang biasa"},
            "battery": {"id": "Baterai", "type": "Hazardous", "disposal": "Limbah berbahaya"},
            "biological": {"id": "Biologis", "type": "Organic", "disposal": "Kompos"},
            "brown-glass": {"id": "Kaca Coklat", "type": "Recyclable", "disposal": "Daur ulang"},
            "clothes": {"id": "Pakaian", "type": "Reusable", "disposal": "Donasi/daur ulang"},
            "green-glass": {"id": "Kaca Hijau", "type": "Recyclable", "disposal": "Daur ulang"},
            "shoes": {"id": "Sepatu", "type": "Reusable", "disposal": "Donasi/daur ulang"},
            "white-glass": {"id": "Kaca Putih", "type": "Recyclable", "disposal": "Daur ulang"},
            "organic": {"id": "Organik", "type": "Organic", "disposal": "Kompos"},
            "other": {"id": "Lainnya", "type": "Mixed", "disposal": "Cek manual"}
        }
        
        for i, category in enumerate(classifier.classes):
            details = category_descriptions.get(category, {
                "id": category.title(),
                "type": "Unknown",
                "disposal": "Cek manual"
            })
            
            category_details.append({
                "index": i,
                "name": category,
                "name_id": details["id"],
                "type": details["type"],
                "disposal": details["disposal"]
            })
        
        response = {
            'success': True,
            'model_info': {
                'model_file': 'model-update.h5',
                'using_fallback': classifier.using_fallback,
                'target_size': classifier.target_size,
                'output_shape': output_shape,
                'total_parameters': total_params,
                'num_classes': len(classifier.classes),
                'model_type': f"{len(classifier.classes)}-class waste classification model"
            },
            'categories': {
                'total': len(classifier.classes),
                'list': classifier.classes,
                'details': category_details
            }
        }
        
        logger.info(f'Model info requested - {len(classifier.classes)} categories available')
        return jsonify(response)
        
    except Exception as e:
        logger.exception('Error getting model info')
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
