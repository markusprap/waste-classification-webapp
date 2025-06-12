const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export const fetchWasteBanks = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.lat) queryParams.append('lat', params.lat.toString());
    if (params.lng) queryParams.append('lng', params.lng.toString());
    if (params.radius) queryParams.append('radius', params.radius.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);

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
    
    if (result.success === false) {
      throw new Error(result.error || 'Failed to fetch waste banks');
    }
    
    return result.data || result;
  } catch (error) {
    console.error('Error fetching waste banks:', error);
    throw error;
  }
};

export const fetchWasteBankById = async (id) => {
  try {
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

export const createWasteBank = async (wasteBankData) => {
  try {
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

export const updateWasteBank = async (id, updateData) => {
  try {
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

export const deleteWasteBank = async (id) => {
  try {
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

export const getNearbyWasteBanks = async (lat, lng, radius = 50, limit = 100) => {
  return fetchWasteBanks({ lat, lng, radius, limit });
};

export const wasteBankService = {
  fetchWasteBanks,
  fetchWasteBankById,
  getNearbyWasteBanks,
  createWasteBank,
  updateWasteBank,
  deleteWasteBank,
};
