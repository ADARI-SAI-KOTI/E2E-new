/**
 * LOCATION SERVICE
 * Abstracts browser geolocation API
 * Keeps UI clean and handles location permissions
 */

/**
 * Get current geographic location using browser Geolocation API
 * @returns {Promise<Object>} - { lat, lng, accuracy }
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        // Handle different geolocation errors
        let message = "Unable to get location";
        if (error.code === error.PERMISSION_DENIED) {
          message = "Location permission denied. Please enable location services.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = "Location information is unavailable.";
        } else if (error.code === error.TIMEOUT) {
          message = "Location request timed out.";
        }
        reject(new Error(message));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
};

/**
 * Format location for display
 * @param {Object} location - { city, area, landmark, lat, lng }
 * @returns {string}
 */
export const formatLocation = (location) => {
  if (!location) return "Not specified";
  const parts = [location.landmark, location.area, location.city].filter(Boolean);
  return parts.join(", ");
};

/**
 * Get address from coordinates (reverse geocoding)
 * NOTE: This requires a backend service or external API
 * For now, returning mock data
 * 
 * @param {number} lat
 * @param {number} lng
 * @returns {Promise<Object>}
 */
export const getAddressFromCoordinates = async (lat, lng) => {
  // Mock implementation - replace with actual geocoding service
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        city: "Metropolitan City",
        area: "Central District",
        landmark: `Near coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        lat,
        lng
      });
    }, 500);
  });
};

/**
 * Calculate distance between two coordinates (in km)
 * Uses Haversine formula
 * 
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number} distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

/**
 * Request location permission status
 * @returns {Promise<string>} - 'granted' | 'denied' | 'prompt'
 */
export const checkLocationPermission = async () => {
  if (!navigator.permissions) {
    return "unknown";
  }

  try {
    const result = await navigator.permissions.query({ name: "geolocation" });
    return result.state; // 'granted' | 'denied' | 'prompt'
  } catch (error) {
    return "unknown";
  }
};
