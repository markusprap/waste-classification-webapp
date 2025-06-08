const Hapi = require('@hapi/hapi');
require('dotenv').config();

const init = async () => {
    const server = Hapi.server({
        port: process.env.PORT || 3001,
        host: process.env.HOST || 'localhost',
        routes: {
            cors: {
                origin: ['*'],
                headers: ['Accept', 'Authorization', 'Content-Type', 'If-None-Match'],
                additionalHeaders: ['cache-control', 'x-requested-with']
            }
        }
    });

    // Register plugins
    await server.register([
        require('@hapi/inert'),
        require('@hapi/vision')
    ]);

    // Register routes
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
    });

    // TODO: Register API routes
    // server.route(require('./src/routes'));

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();
