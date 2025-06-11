/**
 * User API routes for Hapi.js
 */
const { checkUser, syncUser, getUserInfo, getUserById } = require('../controllers/userController');

// Define routes for Hapi.js
const userRoutes = [
  {
    method: 'POST',
    path: '/api/users/check',
    handler: checkUser
  },
  {
    method: 'POST',
    path: '/api/users/sync',
    handler: syncUser
  },
  {
    method: 'POST',
    path: '/api/users/info',
    handler: getUserInfo
  },
  {
    method: 'GET',
    path: '/api/users/{id}',
    handler: getUserById
  }
];

module.exports = userRoutes;
