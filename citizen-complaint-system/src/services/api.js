/**
 * API.JS - REAL BACKEND API SERVICE
 * Communicates with Node.js/Express backend
 * Base URL: http://localhost:5000/api
 */


const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Helper function to make API calls
const apiCall = async (method, endpoint, body = null) => {
  const headers = {
    "Content-Type": "application/json"
  };

  // Remove Authorization header since using HttpOnly cookies
  const options = {
    method,
    headers,
    credentials: 'include' // Include cookies in requests
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const raw = await response.text();

    let data;
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      data = { message: raw };
    }

    return {
      ...data,
      success: response.ok,
      code: response.status,
      statusCode: response.status,
      raw
    };
  } catch (error) {
    console.error("API Error:", error);
    return {
      success: false,
      code: 0,
      message: error.message
    };
  }
};


export const api = {
  // ========================
  // CITIZEN - Authentication
  // ========================

  /**
   * Register new citizen
   */
  citizenRegister: async (userData) => {
    return apiCall("POST", "/auth/register", userData);
  },

  /**
   * Login citizen
   */
  citizenLogin: async (email, password) => {
    const response = await apiCall("POST", "/auth/login", { email, password });
    
    // Transform response to match frontend expectations
    if (response.success) {
      return {
        code: 200,
        message: "Login successful",
        user: {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          role: response.user.role
        }
      };
    }

    return {
      code: response.statusCode || 401,
      message: response.message || response.raw || "Login failed",
      raw: response.raw
    };
  },

  /**
   * Logout user
   */
  logout: async () => {
    return apiCall("POST", "/auth/logout");
  },

  // ========================
  // CITIZEN - Profile
  // ========================

  /**
   * Get citizen profile
   */
  getCitizenProfile: async (citizenId) => {
    // Call protected endpoint that includes complaint stats
    const response = await apiCall("GET", `/users/profile/stats`);
    
    if (response.success) {
      return {
        code: 200,
        data: response.data || response
      };
    }

    return {
      code: response.statusCode || 404,
      message: response.message
    };
  },

  /**
   * Get citizen profile (without ID)
   */
  getCitizenProfileById: async (citizenId) => {
    const response = await apiCall("GET", `/users/${citizenId}`);
    if (response.success) return { code: 200, data: response.data };
    return { code: response.statusCode || 404, message: response.message };
  },

  /**
   * Update citizen profile
   */
  updateCitizenProfile: async (updates) => {
    // Ensure only valid fields are sent
    const validFields = ['name', 'email', 'phone', 'address', 'city', 'state', 'pincode'];
    const filteredUpdates = {};
    
    validFields.forEach(field => {
      if (updates[field] !== undefined && updates[field] !== null) {
        filteredUpdates[field] = updates[field];
      }
    });

    // Validate that at least one field is provided
    if (Object.keys(filteredUpdates).length === 0) {
      return {
        code: 400,
        message: "No valid fields provided for update",
        success: false
      };
    }

    const response = await apiCall("PUT", "/users/profile/update", filteredUpdates);
    
    if (response.success) {
      return {
        code: 200,
        message: "Profile updated successfully",
        success: true,
        user: response.data || null
      };
    }

    return {
      code: response.statusCode || 400,
      message: response.message || "Failed to update profile",
      success: false,
      raw: response.raw
    };
  },

  // ========================
  // CITIZEN - Complaints
  // ========================

  /**
   * Post a new complaint
   */
  postComplaint: async (complaintData) => {
    const response = await apiCall("POST", "/complaints", complaintData);
    
    if (response.success) {
      return {
        code: 201,
        message: "Complaint submitted successfully",
        complaintId: response.data._id,
        complaint: response.data
      };
    }

    return {
      code: response.statusCode || 400,
      message: response.message || response.raw || "Failed to submit complaint",
      raw: response.raw
    };
  },

  /**
   * Get citizen's complaints
   */
  getMyComplaints: async (citizenId, filters = {}) => {
    let endpoint = "/complaints/user/my-complaints";
    
    const params = new URLSearchParams();
    if (filters.status) params.append("status", filters.status);
    if (filters.category) params.append("category", filters.category);
    if (filters.page) params.append("page", filters.page);
    if (filters.limit) params.append("limit", filters.limit);

    if (params.toString()) {
      endpoint += "?" + params.toString();
    }

    const response = await apiCall("GET", endpoint);
    
    if (response.success) {
      return {
        code: 200,
        data: response.data,
        total: response.total
      };
    }

    return {
      code: response.statusCode || 400,
      data: [],
      total: 0,
      message: response.message
    };
  },

  /**
   * Get complaint details
   */
  getComplaintDetails: async (complaintId) => {
    const response = await apiCall("GET", `/complaints/${complaintId}`);
    
    if (response.success) {
      return {
        code: 200,
        data: response.data
      };
    }

    return {
      code: response.statusCode || 404,
      message: response.message
    };
  },

  /**
   * Track complaint status
   */
  trackComplaint: async (complaintId) => {
    const response = await apiCall("GET", `/complaints/${complaintId}`);

    if (!response.success) {
      return {
        code: response.statusCode || 404,
        message: response.message || "Complaint not found",
      };
    }

    const complaint = response.data || {};
    const normalizedComplaint = {
      ...complaint,
      createdAt: complaint.createdAt ? new Date(complaint.createdAt) : null,
      updatedAt: complaint.updatedAt ? new Date(complaint.updatedAt) : null,
    };

    return {
      code: 200,
      data: normalizedComplaint,
    };
  },

  /**
   * Update complaint
   */
  updateComplaint: async (complaintId, updates) => {
    return apiCall("PUT", `/complaints/${complaintId}`, updates);
  },

  /**
   * Add comment to complaint
   */
  addComment: async (complaintId, text) => {
    return apiCall("POST", `/complaints/${complaintId}/comments`, { text });
  },

  // ========================
  // ADMIN - Authentication
  // ========================

  /**
   * Admin login
   */
  adminLogin: async (email, password) => {
    const response = await apiCall("POST", "/auth/login", { email, password });
    
    if (response.success) {
      return {
        code: 200,
        message: "Login successful",
        user: response.user
      };
    }

    return {
      code: response.statusCode || 401,
      message: response.message || response.raw || "Login failed",
      raw: response.raw
    };
  },

  // ========================
  // ADMIN - Complaint Management
  // ========================

  /**
   * Get pending complaints for validation
   */
  getPendingComplaints: async () => {
    const response = await apiCall("GET", "/complaints?status=pending");
    
    if (response.success) {
      return {
        code: 200,
        success: true,
        data: response.data,
        total: response.total
      };
    }

    return {
      code: response.code || 400,
      success: false,
      data: [],
      total: 0,
      message: response.message
    };
  },

  /**
   * Validate/Accept complaint
   */
  validateComplaint: async (complaintId, data) => {
    const response = await apiCall("PUT", `/complaints/${complaintId}/status`, data);
    return {
      code: response.statusCode,
      success: response.success,
      message: response.message,
      data: response.data,
      raw: response.raw
    };
  },

  /**
   * Get all complaints (admin view)
   */
  getAllComplaints: async (filters = {}) => {
    let endpoint = "/complaints";
    
    const params = new URLSearchParams();
    if (filters.status) params.append("status", filters.status);
    if (filters.category) params.append("category", filters.category);
    if (filters.page) params.append("page", filters.page);
    if (filters.limit) params.append("limit", filters.limit);

    if (params.toString()) {
      endpoint += "?" + params.toString();
    }

    return apiCall("GET", endpoint);
  },

  // ========================
  // ADMIN - User Management
  // ========================

  /**
   * Get all users
   */
  getAllUsers: async (filters = {}) => {
    let endpoint = "/users";
    
    const params = new URLSearchParams();
    if (filters.role) params.append("role", filters.role);
    if (filters.isActive !== undefined) params.append("isActive", filters.isActive);
    if (filters.page) params.append("page", filters.page);
    if (filters.limit) params.append("limit", filters.limit);

    if (params.toString()) {
      endpoint += "?" + params.toString();
    }

    return apiCall("GET", endpoint);
  },

  /**
   * Deactivate user
   */
  deactivateUser: async (userId) => {
    return apiCall("PUT", `/users/${userId}/deactivate`);
  },

  /**
   * Activate user
   */
  activateUser: async (userId) => {
    return apiCall("PUT", `/users/${userId}/activate`);
  },

  /**
   * Restrict/Block user
   */
  restrictUser: async (userId, reason) => {
    return apiCall("PUT", `/users/${userId}/deactivate`, { reason });
  },

  /**
   * Unrestrict user
   */
  unrestrictUser: async (userId) => {
    return apiCall("PUT", `/users/${userId}/activate`);
  },

  /**
   * Get restricted users
   */
  getRestrictedUsers: async () => {
    // Restricted users are represented by accounts made inactive (isActive=false)
    return apiCall("GET", "/users?isActive=false");
  },

  // ========================
  // DEPARTMENT - Authentication
  // ========================

  /**
   * Department login
   */
  departmentLogin: async (email, password) => {
    const response = await apiCall("POST", "/auth/login", { email, password });
    
    if (response.success) {
      return {
        code: 200,
        message: "Login successful",
        user: response.user
      };
    }

    return {
      code: response.statusCode || 401,
      message: response.message || response.raw || "Login failed",
      raw: response.raw
    };
  },

  // ========================
  // DEPARTMENT - Complaints
  // ========================

  /**
   * Get assigned complaints for department
   */
  getAssignedComplaints: async (filters = {}) => {
    let endpoint = "/complaints";
    
    const params = new URLSearchParams();
    if (filters.status) params.append("status", filters.status);
    if (filters.page) params.append("page", filters.page);
    if (filters.limit) params.append("limit", filters.limit);

    if (params.toString()) {
      endpoint += "?" + params.toString();
    }

    return apiCall("GET", endpoint);
  },

  /**
   * Update complaint status
   */
  updateComplaintStatus: async (complaintId, data) => {
    return apiCall("PUT", `/complaints/${complaintId}/status`, data);
  },

  /**
   * Get complaint details for department
   */
  getComplaintForDepartment: async (complaintId) => {
    return apiCall("GET", `/complaints/${complaintId}`);
  },

  // ========================
  // DEPARTMENTS - Management
  // ========================

  /**
   * Get all departments
   */
  getAllDepartments: async () => {
    return apiCall("GET", "/departments");
  },

  /**
   * Get department by ID
   */
  getDepartment: async (departmentId) => {
    return apiCall("GET", `/departments/${departmentId}`);
  },

  /**
   * Create department (admin only)
   */
  createDepartment: async (departmentData) => {
    return apiCall("POST", "/departments", departmentData);
  },

  /**
   * Update department
   */
  updateDepartment: async (departmentId, updates) => {
    return apiCall("PUT", `/departments/${departmentId}`, updates);
  },

  // ========================
  // Utility Functions
  // ========================

};

export default api;
