// Use frontend API route instead of backend directly
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * Fetch waste banks from frontend API route (which proxies to backend)
 * @param {Object} params - Query parameters
 * @param {number} params.lat - User latitude
 * @param {number} params.lng - User longitude
 * @param {number} params.radius - Search radius in km (default: 50)
 * @param {number} params.limit - Maximum number of results (default: 100)
 * @param {string} params.search - Search term for name or address
 * @returns {Promise<Array>} Array of waste banks data
 */
export const fetchWasteBanks = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.lat) queryParams.append('lat', params.lat.toString());
    if (params.lng) queryParams.append('lng', params.lng.toString());
    if (params.radius) queryParams.append('radius', params.radius.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);

    // Use relative URL to frontend API route which proxies to backend
    const url = `/api/waste-banks${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    console.log('Fetching waste banks from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    // Handle both success/error response format and direct array format
    if (result.success === false) {
      throw new Error(result.error || 'Failed to fetch waste banks');
    }
    
    // If result has data property, return that, otherwise return result directly
    return result.data || result;
  } catch (error) {
    console.error('Error fetching waste banks:', error);
    throw error;
  }
};

/**
 * Fetch single waste bank by ID
 * @param {string} id - Waste bank ID
 * @returns {Promise<Object>} API response with waste bank data
 */
export const fetchWasteBankById = async (id) => {
  try {
    // Use relative URL to frontend API route which proxies to backend
    const url = `/api/waste-banks/${id}`;
    
    console.log('Fetching waste bank by ID from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch waste bank');
    }

    return result;
  } catch (error) {
    console.error('Error fetching waste bank:', error);
    throw error;
  }
};

/**
 * Create new waste bank (admin only)
 * @param {Object} wasteBankData - Waste bank data
 * @returns {Promise<Object>} API response
 */
export const createWasteBank = async (wasteBankData) => {
  try {
    // Use relative URL to frontend API route which proxies to backend
    const url = `/api/waste-banks`;
    
    console.log('Creating waste bank at:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(wasteBankData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to create waste bank');
    }

    return result;
  } catch (error) {
    console.error('Error creating waste bank:', error);
    throw error;
  }
};

/**
 * Update waste bank (admin only)
 * @param {string} id - Waste bank ID
 * @param {Object} updateData - Updated waste bank data
 * @returns {Promise<Object>} API response
 */
export const updateWasteBank = async (id, updateData) => {
  try {
    // Use relative URL to frontend API route which proxies to backend
    const url = `/api/waste-banks/${id}`;
    
    console.log('Updating waste bank at:', url);
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to update waste bank');
    }

    return result;
  } catch (error) {
    console.error('Error updating waste bank:', error);
    throw error;
  }
};

/**
 * Delete waste bank (admin only)
 * @param {string} id - Waste bank ID
 * @returns {Promise<Object>} API response
 */
export const deleteWasteBank = async (id) => {
  try {
    // Use relative URL to frontend API route which proxies to backend
    const url = `/api/waste-banks/${id}`;
    
    console.log('Deleting waste bank at:', url);
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to delete waste bank');
    }

    return result;
  } catch (error) {
    console.error('Error deleting waste bank:', error);
    throw error;
  }
};

/**
 * Get nearby waste banks - convenience function
 * @param {number} lat - User latitude
 * @param {number} lng - User longitude
 * @param {number} radius - Search radius in km (default: 50)
 * @param {number} limit - Maximum number of results (default: 100)
 * @returns {Promise<Object>} API response with nearby waste banks
 */
export const getNearbyWasteBanks = async (lat, lng, radius = 50, limit = 100) => {
  return fetchWasteBanks({ lat, lng, radius, limit });
};

// Default export object with all functions
export const wasteBankService = {
  fetchWasteBanks,
  fetchWasteBankById,
  getNearbyWasteBanks,
  createWasteBank,
  updateWasteBank,
  deleteWasteBank,
};
