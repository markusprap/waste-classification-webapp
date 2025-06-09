const {
  getWasteBanks,
  getWasteBankById,
  createWasteBank,
  updateWasteBank,
  deleteWasteBank,
} = require('../controllers/wasteBankController');

const wasteBankRoutes = [
  // GET /api/waste-banks
  {
    method: 'GET',
    path: '/api/waste-banks',
    handler: getWasteBanks,
    options: {
      description: 'Get all waste banks with optional filtering',
      tags: ['api', 'waste-banks'],
    },
  },
  
  // GET /api/waste-banks/{id}
  {
    method: 'GET',
    path: '/api/waste-banks/{id}',
    handler: getWasteBankById,
    options: {
      description: 'Get single waste bank by ID',
      tags: ['api', 'waste-banks'],
    },
  },
  
  // POST /api/waste-banks
  {
    method: 'POST',
    path: '/api/waste-banks',
    handler: createWasteBank,
    options: {
      description: 'Create new waste bank',
      tags: ['api', 'waste-banks'],
    },
  },
  
  // PUT /api/waste-banks/{id}
  {
    method: 'PUT',
    path: '/api/waste-banks/{id}',
    handler: updateWasteBank,
    options: {
      description: 'Update waste bank',
      tags: ['api', 'waste-banks'],
    },
  },
  
  // DELETE /api/waste-banks/{id}
  {
    method: 'DELETE',
    path: '/api/waste-banks/{id}',
    handler: deleteWasteBank,
    options: {
      description: 'Delete waste bank (soft delete)',
      tags: ['api', 'waste-banks'],
    },
  },
];

module.exports = wasteBankRoutes;
