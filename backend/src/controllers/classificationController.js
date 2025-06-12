const fetch = require('node-fetch');
const FormData = require('form-data');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';

const classifyWaste = async (request, h) => {
  try {
    console.log('Backend: Processing classification request');
    
    const payload = request.payload;
    
    if (!payload || !payload.image) {
      return h.response({
        success: false,
        error: 'Image data is required'
      }).code(400);
    }

    const formData = new FormData();
    
    if (payload.image.buffer) {
      formData.append('image', payload.image.buffer, {
        filename: payload.image.filename || 'image.jpg',
        contentType: payload.image.headers['content-type'] || 'image/jpeg'
      });
    } else if (typeof payload.image === 'string') {
      const base64Data = payload.image.includes(',') ? payload.image.split(',')[1] : payload.image;
      const buffer = Buffer.from(base64Data, 'base64');
      formData.append('image', buffer, {
        filename: 'image.jpg',
        contentType: 'image/jpeg'
      });
    } else {
      return h.response({
        success: false,
        error: 'Invalid image format'
      }).code(400);
    }

    console.log(`Backend: Calling ML service at ${ML_SERVICE_URL}/api/classify`);
    
    const mlResponse = await fetch(`${ML_SERVICE_URL}/api/classify`, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders(),
      timeout: 30000
    });

    if (!mlResponse.ok) {
      const errorText = await mlResponse.text();
      console.error('ML service error:', mlResponse.status, errorText);
      
      return h.response({
        success: false,
        error: `ML service error: ${mlResponse.status} ${mlResponse.statusText}`,
        details: errorText
      }).code(502);
    }

    const mlResult = await mlResponse.json();
    console.log('Backend: ML service response received:', mlResult);

    if (mlResult.success) {
      return h.response({
        success: true,
        data: mlResult.data,
        timestamp: new Date().toISOString()
      }).code(200);
    } else {
      return h.response({
        success: false,
        error: mlResult.error || 'ML service classification failed'
      }).code(500);
    }

  } catch (error) {
    console.error('Backend classification error:', error);
    
    if (error.code === 'ECONNREFUSED') {
      return h.response({
        success: false,
        error: 'ML service is not available. Please try again later.',
        code: 'ML_SERVICE_UNAVAILABLE'
      }).code(503);
    }
    
    if (error.name === 'AbortError' || error.code === 'ETIMEDOUT') {
      return h.response({
        success: false,
        error: 'ML service request timeout. Please try again.',
        code: 'TIMEOUT'
      }).code(504);
    }

    return h.response({
      success: false,
      error: 'Internal server error during classification',
      details: error.message
    }).code(500);
  }
};

const getMLServiceStatus = async (request, h) => {
  try {
    console.log('Backend: Checking ML service status');
    
    const response = await fetch(`${ML_SERVICE_URL}/health`, {
      method: 'GET',
      timeout: 5000
    });

    if (response.ok) {
      const data = await response.json();
      return h.response({
        success: true,
        status: 'available',
        mlService: data,
        url: ML_SERVICE_URL
      }).code(200);
    } else {
      return h.response({
        success: false,
        status: 'unavailable',
        error: `ML service returned status ${response.status}`,
        url: ML_SERVICE_URL
      }).code(200);
    }
  } catch (error) {
    console.error('ML service health check error:', error);
    return h.response({
      success: false,
      status: 'unavailable',
      error: error.message,
      url: ML_SERVICE_URL
    }).code(200);
  }
};

const testMLService = async (request, h) => {
  try {
    console.log('Backend: Testing ML service connection');
    
    const testImageBuffer = Buffer.from('/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A', 'base64');
    
    const formData = new FormData();
    formData.append('image', testImageBuffer, {
      filename: 'test.jpg',
      contentType: 'image/jpeg'
    });

    const response = await fetch(`${ML_SERVICE_URL}/api/classify`, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders(),
      timeout: 10000
    });

    if (response.ok) {
      const data = await response.json();
      return h.response({
        success: true,
        message: 'ML service test successful',
        response: data,
        url: ML_SERVICE_URL
      }).code(200);
    } else {
      const errorText = await response.text();
      return h.response({
        success: false,
        message: 'ML service test failed',
        status: response.status,
        error: errorText,
        url: ML_SERVICE_URL
      }).code(200);
    }
  } catch (error) {
    console.error('ML service test error:', error);
    return h.response({
      success: false,
      message: 'ML service test failed',
      error: error.message,
      url: ML_SERVICE_URL
    }).code(200);
  }
};

module.exports = {
  classifyWaste,
  getMLServiceStatus,
  testMLService
};
