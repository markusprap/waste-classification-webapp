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

const init = async () => {
    const server = Hapi.server({
        port: process.env.PORT || 3001, // Reverted back to original port 3001
        host: process.env.HOST || 'localhost',routes: {
            cors: {
                origin: ['*'],
                headers: ['Accept', 'Authorization', 'Content-Type', 'If-None-Match', 'x-signature'],
                additionalHeaders: ['cache-control', 'x-requested-with', 'x-signature'],
                credentials: true
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
    ]);

    // Register base route
    server.route({
        method: 'GET',
        path: '/',
        handler: (request, h) => {
            return { 
                message: 'Waste Classification Backend API',
                version: '1.0.0',
                status: 'running'
            };
        }
    });    // Register route modules
    const wasteBankRoutes = require('./src/routes/wasteBankRoutes');
    const paymentRoutes = require('./src/routes/paymentRoutes');
    const adminRoutes = require('./src/routes/hapiAdminRoutes');
    const articleRoutes = require('./routes/api/articles');
    const articleImageRoutes = require('./routes/api/articles-image');
    const healthRoutes = require('./src/routes/healthRoutes');
    const userRoutes = require('./src/routes/userRoutes');

    // Add routes to server
    server.route(wasteBankRoutes);
    server.route(paymentRoutes);
    server.route(adminRoutes);
    server.route(articleRoutes);
    server.route(userRoutes);
    server.route(healthRoutes);
    await articleImageRoutes(server); // This function registers the image upload routes

    // Start server
    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();
