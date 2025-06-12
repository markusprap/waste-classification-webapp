import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    # Max file size (16MB)
    MAX_CONTENT_LENGTH = int(os.environ.get('MAX_CONTENT_LENGTH', 16 * 1024 * 1024))
    
    # Model settings
    MODEL_PATH = os.path.join(os.path.dirname(__file__), '../models/model_sampah.h5')
    TARGET_IMAGE_SIZE = int(os.environ.get('TARGET_IMAGE_SIZE', 224))
    
    # Server settings
    HOST = os.environ.get('ML_SERVICE_HOST', '0.0.0.0')
    PORT = int(os.environ.get('ML_SERVICE_PORT', 5000))
    DEBUG = os.environ.get('ML_SERVICE_DEBUG', 'False').lower() == 'true'
    
    # CORS settings
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'http://localhost:3000,http://localhost:3001').split(',')
    
    # Logging
    LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')

config = Config()
