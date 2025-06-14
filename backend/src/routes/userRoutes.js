const { checkUser, syncUser, getUserInfo, getUserById, getUserProfile, updateUsage, getUserByEmail } = require('../controllers/userController');

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
    path: '/api/users/profile',
    handler: getUserProfile
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
  },
  {
    method: 'POST',
    path: '/api/users/update-usage',
    handler: updateUsage
  },
  {
    method: 'GET',
    path: '/api/users/test-update-usage',
    handler: (request, h) => {
      return h.response({
        status: 'success',
        message: 'Update usage endpoint is working',
        info: 'This is a test endpoint to verify that the route is registered'
      }).code(200);
    }
  },
  {
    method: 'POST',
    path: '/api/users/lookup',
    handler: getUserByEmail
  }
];

module.exports = userRoutes;
