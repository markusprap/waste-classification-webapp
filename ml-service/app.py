from flask import Flask
from flask_cors import CORS
from src.api.routes import api_bp
from src.config.settings import config
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

def create_app():
    app = Flask(__name__)
    
    # Enable CORS
    CORS(app)
    
    # App config
    app.config['MAX_CONTENT_LENGTH'] = config.MAX_CONTENT_LENGTH
    
    # Register blueprints
    app.register_blueprint(api_bp, url_prefix='/api')
    
    # Health check route
    @app.route('/health')
    def health():
        return {
            'status': 'healthy',
            'service': 'ML Classification Service',
            'version': '1.0.0'
        }
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(
        host=config.HOST,
        port=config.PORT,
        debug=config.DEBUG
    )
