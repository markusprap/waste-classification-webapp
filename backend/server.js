const Hapi = require('@hapi/hapi');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

// Debug env loading
console.log('Server starting with environment variables:');
console.log('- PORT:', process.env.PORT || '(default: 3001)');
console.log('- HOST:', process.env.HOST || '(default: localhost)');
console.log('- NODE_ENV:', process.env.NODE_ENV || '(not set)');
console.log('- MIDTRANS_ENV:', process.env.MIDTRANS_ENV || '(not set)');
console.log('- MIDTRANS_SERVER_KEY present:', !!process.env.MIDTRANS_SERVER_KEY);
console.log('- MIDTRANS_CLIENT_KEY present:', !!process.env.MIDTRANS_CLIENT_KEY);
console.log('- FRONTEND_URL:', process.env.FRONTEND_URL || '(not set)');

const init = async () => {    const server = Hapi.server({
        port: process.env.PORT || 3001,
        host: process.env.HOST || 'localhost',
        routes: {
            cors: {
                origin: ['*'],
                headers: ['Accept', 'Authorization', 'Content-Type', 'If-None-Match', 'x-signature'],
                additionalHeaders: ['cache-control', 'x-requested-with', 'x-signature'],
                exposedHeaders: ['content-type', 'content-length'],
                maxAge: 86400,
                credentials: true            },
            payload: {
                maxBytes: 10 * 1024 * 1024, // 10MB
                multipart: true,
                output: 'data',
                parse: true,
                defaultContentType: 'application/json'
            }
        }
    });

    // Initialize Prisma
    const prisma = new PrismaClient();
    server.app.prisma = prisma;

    // Register plugins
    await server.register([
        require('@hapi/inert'),
        require('@hapi/vision')
    ]);    // Register classification controller
    const { classifyWaste } = require('./src/controllers/classificationController');
    
    // Register routes
    server.route([
        {
            method: 'POST',
            path: '/api/classify',
            handler: classifyWaste,
            options: {
                payload: {
                    maxBytes: 10 * 1024 * 1024, // 10MB
                    output: 'data',
                    parse: true,
                    multipart: true,
                },
            },
        },        // Register base route
        {
            method: 'GET',
            path: '/',
            handler: (request, h) => {
                return { 
                    message: 'Waste Classification Backend API',
                    version: '1.0.0',
                    status: 'running'
                };
            }
        }
    ]);
    
    // Register route modules
    const wasteBankRoutes = require('./src/routes/wasteBankRoutes');
    const paymentRoutes = require('./src/routes/paymentRoutes');
    const adminRoutes = require('./src/routes/hapiAdminRoutes');
    const articleRoutes = require('./routes/api/articles');
    const articleImageRoutes = require('./routes/api/articles-image');
    const healthRoutes = require('./src/routes/healthRoutes');
    const userRoutes = require('./src/routes/userRoutes');
    const adminArticlesRoutes = require('./routes/api/admin/articles');
    const classificationController = require('./src/controllers/classificationController');    // Classification route already defined above

    // Add ML service status route
    server.route({
        method: 'GET',
        path: '/api/ml-service-status',
        handler: classificationController.getMLServiceStatus
    });

    // Add a simple debug endpoint
    server.route({
        method: 'GET',
        path: '/api/debug',
        handler: (request, h) => {
            return { 
                message: 'Debug endpoint working',
                timestamp: new Date().toISOString()
            };
        }
    });

    // Add routes to server
    server.route(wasteBankRoutes);
    server.route(paymentRoutes);
    // Commented out standard admin routes that conflict with the file upload routes
    // server.route(adminRoutes);
    server.route(articleRoutes);
    server.route(userRoutes);
    server.route(healthRoutes);
    server.route(adminArticlesRoutes); // Add admin article routes that support file uploads
    await articleImageRoutes(server); // This function registers the image upload routes    // Add error logging extension
    server.ext('onPreResponse', (request, h) => {
        const response = request.response;
        if (response instanceof Error) {
            console.error('Server error:', {
                error: {
                    message: response.message,
                    name: response.name,
                    stack: response.stack
                },
                path: request.path,
                method: request.method,
                info: request.info,
                headers: request.headers
            });

            // If it's a 500 error, send a cleaner error response
            if (response.output && response.output.statusCode === 500) {
                return h.response({
                    error: 'An internal server error occurred',
                    requestId: request.info.id
                }).code(500);
            }
        }
        return h.continue;
    });

    // Start server
    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.error('Unhandled rejection:', err);
    process.exit(1);
});

init();
