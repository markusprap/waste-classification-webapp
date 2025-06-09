const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// GET /api/waste-banks - Get all waste banks with optional filtering
const getWasteBanks = async (request, h) => {
  try {
    const { lat, lng, radius = 50, limit = 100, search } = request.query;

    // Build where clause
    let whereClause = {
      isActive: true,
    };

    // Add search filter if provided
    if (search) {
      whereClause.OR = [
        { nama: { contains: search, mode: 'insensitive' } },
        { alamat: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get waste banks from database
    let wasteBanks = await prisma.wasteBank.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // If lat/lng provided, filter by radius and add distance
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const radiusKm = parseFloat(radius);

      wasteBanks = wasteBanks
        .map(bank => {
          const distance = calculateDistance(userLat, userLng, bank.latitude, bank.longitude);
          return {
            ...bank,
            distance,
            distanceText: distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`,
          };
        })
        .filter(bank => bank.distance <= radiusKm)
        .sort((a, b) => a.distance - b.distance);
    }    // Apply limit
    const limitNum = parseInt(limit);
    if (limitNum && limitNum > 0) {
      wasteBanks = wasteBanks.slice(0, limitNum);
    }    // Remove null fields from response
    const cleanedWasteBanks = wasteBanks.map(bank => {
      const cleaned = {};
      Object.keys(bank).forEach(key => {
        // Keep all important fields, only remove truly null/empty optional fields
        if (bank[key] !== null && bank[key] !== undefined && bank[key] !== '') {
          cleaned[key] = bank[key];
        } else if (['id', 'nama', 'alamat', 'latitude', 'longitude', 'isActive', 'createdAt', 'updatedAt', 'distance', 'distanceText'].includes(key)) {
          // Always keep essential fields even if null
          cleaned[key] = bank[key];
        }
      });
      return cleaned;
    });

    return h.response({
      success: true,
      count: cleanedWasteBanks.length,
      data: cleanedWasteBanks,
    }).code(200);
  } catch (error) {
    console.error('Error fetching waste banks:', error);
    return h.response({
      success: false,
      message: 'Internal server error',
      error: error.message,
    }).code(500);
  }
};

// GET /api/waste-banks/:id - Get single waste bank
const getWasteBankById = async (request, h) => {
  try {
    const { id } = request.params;

    const wasteBank = await prisma.wasteBank.findUnique({
      where: {
        id: id,
        isActive: true,
      },
    });    if (!wasteBank) {
      return h.response({
        success: false,
        message: 'Waste bank not found',
      }).code(404);
    }    // Remove null fields from response
    const cleanedWasteBank = {};
    Object.keys(wasteBank).forEach(key => {
      if (wasteBank[key] !== null && wasteBank[key] !== undefined) {
        cleanedWasteBank[key] = wasteBank[key];
      }
    });

    return h.response({
      success: true,
      data: cleanedWasteBank,
    }).code(200);
  } catch (error) {
    console.error('Error fetching waste bank:', error);
    return h.response({
      success: false,
      message: 'Internal server error',
      error: error.message,
    }).code(500);
  }
};

// POST /api/waste-banks - Create new waste bank (admin only)
const createWasteBank = async (request, h) => {
  try {
    const {
      nama,
      alamat,
      latitude,
      longitude,
      telepon,
      email,
      jamOperasi,
      jenisWaste,
      deskripsi,
    } = request.payload;    // Validate required fields
    if (!nama || !alamat || latitude === undefined || longitude === undefined) {
      return h.response({
        success: false,
        message: 'Name, address, latitude, and longitude are required',
      }).code(400);
    }

    // Validate latitude and longitude are valid numbers
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      return h.response({
        success: false,
        message: 'Latitude and longitude must be valid numbers',
      }).code(400);
    }

    if (lat < -90 || lat > 90) {
      return h.response({
        success: false,
        message: 'Latitude must be between -90 and 90',
      }).code(400);
    }

    if (lng < -180 || lng > 180) {
      return h.response({
        success: false,
        message: 'Longitude must be between -180 and 180',
      }).code(400);
    }    const wasteBank = await prisma.wasteBank.create({
      data: {
        nama: nama.trim(),
        alamat: alamat.trim(),
        latitude: lat,
        longitude: lng,
        telepon: telepon?.trim() || null,
        email: email?.trim() || null,
        jamOperasi: jamOperasi?.trim() || null,
        jenisWaste: jenisWaste?.trim() || null,
        deskripsi: deskripsi?.trim() || null,
        isActive: true,
      },
    });

    return h.response({
      success: true,
      message: 'Waste bank created successfully',
      data: wasteBank,
    }).code(201);
  } catch (error) {
    console.error('Error creating waste bank:', error);
    return h.response({
      success: false,
      message: 'Internal server error',
      error: error.message,
    }).code(500);
  }
};

// PUT /api/waste-banks/:id - Update waste bank (admin only)
const updateWasteBank = async (request, h) => {
  try {
    const { id } = request.params;
    const updateData = { ...request.payload };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Validate latitude and longitude if provided
    if (updateData.latitude !== undefined) {
      const lat = parseFloat(updateData.latitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        return h.response({
          success: false,
          message: 'Latitude must be a valid number between -90 and 90',
        }).code(400);
      }
      updateData.latitude = lat;
    }

    if (updateData.longitude !== undefined) {
      const lng = parseFloat(updateData.longitude);
      if (isNaN(lng) || lng < -180 || lng > 180) {
        return h.response({
          success: false,
          message: 'Longitude must be a valid number between -180 and 180',
        }).code(400);
      }
      updateData.longitude = lng;
    }

    // Trim string fields
    const stringFields = ['nama', 'alamat', 'telepon', 'email', 'jamOperasi', 'jenisWaste', 'deskripsi'];
    stringFields.forEach(field => {
      if (updateData[field] !== undefined) {
        updateData[field] = updateData[field]?.trim() || null;
      }
    });

    const wasteBank = await prisma.wasteBank.update({
      where: { id },
      data: updateData,
    });

    return h.response({
      success: true,
      message: 'Waste bank updated successfully',
      data: wasteBank,
    }).code(200);
  } catch (error) {
    if (error.code === 'P2025') {
      return h.response({
        success: false,
        message: 'Waste bank not found',
      }).code(404);
    }

    console.error('Error updating waste bank:', error);
    return h.response({
      success: false,
      message: 'Internal server error',
      error: error.message,
    }).code(500);
  }
};

// DELETE /api/waste-banks/:id - Delete waste bank (admin only)
const deleteWasteBank = async (request, h) => {
  try {
    const { id } = request.params;

    await prisma.wasteBank.update({
      where: { id },
      data: { isActive: false },
    });

    return h.response({
      success: true,
      message: 'Waste bank deleted successfully',
    }).code(200);
  } catch (error) {
    if (error.code === 'P2025') {
      return h.response({
        success: false,
        message: 'Waste bank not found',
      }).code(404);
    }

    console.error('Error deleting waste bank:', error);
    return h.response({
      success: false,
      message: 'Internal server error',
      error: error.message,
    }).code(500);
  }
};

module.exports = {
  getWasteBanks,
  getWasteBankById,
  createWasteBank,
  updateWasteBank,
  deleteWasteBank,
};
