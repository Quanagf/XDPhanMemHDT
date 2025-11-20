/**
 * Vehicle API Service - Unified service for vehicle management
 * Combines best features from vehicles.js and vehiclesApi.js
 * 
 * Features:
 * - Function-based exports for easy imports
 * - Class-based implementation for better structure
 * - Pagination support with flexible parameters
 * - Consistent error handling and logging
 * - Authentication handling
 * - Full CRUD operations
 */

// Base configuration
const API_BASE_URL = '/api/vehicles';

/**
 * Get authentication headers
 * @returns {Object} Authorization headers
 */
const getAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Handle API response and extract data
 * @param {Response} response - Fetch response object
 * @param {string} operation - Operation name for error logging
 * @returns {Promise<any>} Parsed response data
 */
const handleResponse = async (response, operation = 'API call') => {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${operation} failed`;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch (e) {
      // If response is not JSON, use status text
      errorMessage = response.statusText || errorMessage;
    }
    
    throw new Error(errorMessage);
  }
  
  return response.json();
};

/**
 * Vehicle API Service Class
 */
class VehicleAPI {
  /**
   * Get vehicles with advanced filtering and pagination
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (0-based)
   * @param {number} params.size - Page size
   * @param {number} params.stationId - Filter by station ID
   * @param {string} params.status - Filter by status (AVAILABLE, RESERVED, RENTED, MAINTENANCE)
   * @param {string} params.sortBy - Sort field (id, licensePlate, pricePerHour, etc.)
   * @param {string} params.sortDirection - Sort direction (asc, desc)
   * @param {number} params.limit - Legacy limit parameter (for backward compatibility)
   * @returns {Promise<Object|Array>} Paginated response or array of vehicles
   */
  async getVehicles(params = {}) {
    try {
      const {
        page = 0,
        size = 10,
        stationId = null,
        status = null,
        sortBy = 'id',
        sortDirection = 'desc',
        limit = null // Legacy parameter for backward compatibility
      } = params;

      const searchParams = new URLSearchParams();

      // Handle pagination - use legacy limit if provided, otherwise use page/size
      if (limit) {
        searchParams.append('limit', limit.toString());
      } else {
        searchParams.append('page', page.toString());
        searchParams.append('size', size.toString());
      }
      
      searchParams.append('sortBy', sortBy);
      searchParams.append('sortDirection', sortDirection);

      // Add filters
      if (stationId) {
        searchParams.append('stationId', stationId.toString());
      }
      if (status) {
        searchParams.append('status', status);
      }

      const url = `${API_BASE_URL}?${searchParams.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });

      return await handleResponse(response, 'Get vehicles');
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      throw error;
    }
  }

  /**
   * Get a single vehicle by ID
   * @param {string|number} vehicleId - Vehicle ID
   * @returns {Promise<Object>} Vehicle data
   */
  async getVehicleById(vehicleId) {
    try {
      const response = await fetch(`${API_BASE_URL}/${vehicleId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });

      return await handleResponse(response, 'Get vehicle by ID');
    } catch (error) {
      console.error(`Error fetching vehicle ${vehicleId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new vehicle
   * @param {Object} vehicleData - Vehicle data to create
   * @returns {Promise<Object>} Created vehicle data
   */
  async createVehicle(vehicleData) {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(vehicleData)
      });

      return await handleResponse(response, 'Create vehicle');
    } catch (error) {
      console.error('Error creating vehicle:', error);
      throw error;
    }
  }

  /**
   * Update vehicle information
   * @param {string|number} vehicleId - Vehicle ID to update
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated vehicle data
   */
  async updateVehicle(vehicleId, updateData) {
    try {
      const response = await fetch(`${API_BASE_URL}/${vehicleId}/details`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(updateData)
      });

      return await handleResponse(response, 'Update vehicle');
    } catch (error) {
      console.error(`Error updating vehicle ${vehicleId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a vehicle
   * @param {string|number} vehicleId - Vehicle ID to delete
   * @returns {Promise<boolean>} Success status
   */
  async deleteVehicle(vehicleId) {
    try {
      const response = await fetch(`${API_BASE_URL}/${vehicleId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to delete vehicle`);
      }

      return true;
    } catch (error) {
      console.error(`Error deleting vehicle ${vehicleId}:`, error);
      throw error;
    }
  }

  /**
   * Upload vehicle image
   * @param {string|number} vehicleId - Vehicle ID
   * @param {File} imageFile - Image file to upload
   * @returns {Promise<Object>} Upload response
   */
  async uploadVehicleImage(vehicleId, imageFile) {
    try {
      const formData = new FormData();
      formData.append('file', imageFile);

      const response = await fetch(`${API_BASE_URL}/${vehicleId}/image`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: formData
      });

      return await handleResponse(response, 'Upload vehicle image');
    } catch (error) {
      console.error(`Error uploading image for vehicle ${vehicleId}:`, error);
      throw error;
    }
  }

  /**
   * Get vehicles by status (legacy method for backward compatibility)
   * @param {string} status - Vehicle status
   * @returns {Promise<Array>} Array of vehicles
   */
  async getVehiclesByStatus(status) {
    return this.getVehicles({ status, limit: 1000 });
  }

  /**
   * Get available vehicles at a specific station
   * @param {number} stationId - Station ID
   * @returns {Promise<Array>} Array of available vehicles
   */
  async getAvailableVehiclesAtStation(stationId) {
    return this.getVehicles({ 
      stationId, 
      status: 'AVAILABLE',
      limit: 1000
    });
  }
}

// Create singleton instance
const vehicleAPIInstance = new VehicleAPI();

// Export individual functions for easy importing (backward compatibility)
export const getVehicles = (params = {}) => vehicleAPIInstance.getVehicles(params);
export const getVehicle = (vehicleId) => vehicleAPIInstance.getVehicleById(vehicleId);
export const getVehicleById = (vehicleId) => vehicleAPIInstance.getVehicleById(vehicleId);
export const createVehicle = (vehicleData) => vehicleAPIInstance.createVehicle(vehicleData);
export const updateVehicle = (vehicleId, updateData) => vehicleAPIInstance.updateVehicle(vehicleId, updateData);
export const deleteVehicle = (vehicleId) => vehicleAPIInstance.deleteVehicle(vehicleId);
export const uploadVehicleImage = (vehicleId, imageFile) => vehicleAPIInstance.uploadVehicleImage(vehicleId, imageFile);

// Export class instance for advanced usage
export default vehicleAPIInstance;

// Export class for creating new instances if needed
export { VehicleAPI };

/**
 * Usage Examples:
 * 
 * // Function-based imports (recommended for simple usage)
 * import { getVehicles, getVehicle, createVehicle, updateVehicle, deleteVehicle } from './api/vehicleAPI';
 * 
 * // Class instance import (recommended for complex usage)
 * import vehicleAPI from './api/vehicleAPI';
 * 
 * // Example calls:
 * const vehicles = await getVehicles({ page: 0, size: 10, status: 'AVAILABLE' });
 * const vehicle = await getVehicle(123);
 * const newVehicle = await createVehicle({ licensePlate: '30A-12345', ... });
 * const updated = await updateVehicle(123, { batteryLevel: 85 });
 * const deleted = await deleteVehicle(123);
 * 
 * // Advanced usage with class instance:
 * const availableVehicles = await vehicleAPI.getAvailableVehiclesAtStation(1);
 */