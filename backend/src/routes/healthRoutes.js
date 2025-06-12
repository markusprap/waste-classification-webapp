const healthCheck = async (request, h) => {
  try {
    return h.response({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      midtrans: {
        configured: !!process.env.MIDTRANS_SERVER_KEY,
        mode: process.env.MIDTRANS_ENV || 'sandbox'
      }
    }).code(200);
  } catch (error) {
    console.error('Health check error:', error);
    return h.response({ 
      status: 'error', 
      message: 'Health check failed'
    }).code(500);
  }
};

const healthRoutes = [
  {
    method: 'GET',
    path: '/api/health',
    handler: healthCheck
  }
];

module.exports = healthRoutes;
