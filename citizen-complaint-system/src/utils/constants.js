/**
 * CONSTANTS.JS
 * Central repository for all application constants
 * Complaint categories, statuses, departments, colors, etc.
 */

// Complaint Categories
export const COMPLAINT_CATEGORIES = {
  ROAD: "roads",
  WATER: "water",
  ELECTRICITY: "electricity",
  SANITATION: "sanitation",
  OTHER: "other"
};

// Complaint Status Workflow
export const COMPLAINT_STATUS = {
  SUBMITTED: "pending",
  PENDING_VALIDATION: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  ASSIGNED: "accepted",
  IN_PROGRESS: "in-progress",
  RESOLVED: "resolved",
  CLOSED: "resolved"
};

// Department Types (assigned based on complaint category)
export const DEPARTMENTS = {
  ROAD_DEPT: "Road & Infrastructure",
  WATER_DEPT: "Water Supply",
  ELECTRICITY_DEPT: "Electricity Board",
  SANITATION_DEPT: "Sanitation Department",
  TRANSPORT_DEPT: "Public Transport",
  ENVIRONMENT_DEPT: "Environment & Pollution",
  OTHER_DEPT: "General Services"
};

// Status Color Mapping for UI
export const STATUS_COLORS = {
  "pending": "#3498db",
  "accepted": "#27ae60",
  "in-progress": "#e67e22",
  "resolved": "#27ae60",
  "rejected": "#e74c3c"
};

// Category to Department Mapping
export const CATEGORY_TO_DEPARTMENT = {
  [COMPLAINT_CATEGORIES.ROAD]: DEPARTMENTS.ROAD_DEPT,
  [COMPLAINT_CATEGORIES.WATER]: DEPARTMENTS.WATER_DEPT,
  [COMPLAINT_CATEGORIES.ELECTRICITY]: DEPARTMENTS.ELECTRICITY_DEPT,
  [COMPLAINT_CATEGORIES.SANITATION]: DEPARTMENTS.SANITATION_DEPT,
  [COMPLAINT_CATEGORIES.OTHER]: DEPARTMENTS.OTHER_DEPT
};

// User Roles
export const ROLES = {
  CITIZEN: "CITIZEN",
  ADMIN: "ADMIN",
  DEPARTMENT: "DEPARTMENT"
};

// Complaint Priority Levels
export const PRIORITY_LEVELS = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "urgent"
};

// API Response Codes
export const API_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  SERVER_ERROR: 500
};

// Validation Messages
export const VALIDATION_MESSAGES = {
  REQUIRED_FIELD: "This field is required",
  INVALID_EMAIL: "Please enter a valid email address",
  PASSWORD_TOO_SHORT: "Password must be at least 6 characters",
  PASSWORDS_NOT_MATCH: "Passwords do not match",
  INVALID_PHONE: "Please enter a valid phone number",
  DESCRIPTION_TOO_SHORT: "Description must be at least 20 characters",
  FILE_TOO_LARGE: "File size must be less than 5MB",
  INVALID_FILE_TYPE: "Please upload a valid image file (JPG, PNG)",
  DUPLICATE_COMPLAINT: "Similar complaint already exists",
  INVALID_OTP: "Invalid OTP. Please try again"
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50
};

// Local Storage Keys
export const STORAGE_KEYS = {
  USER: "user",
  ROLE: "role",
  AUTH_TOKEN: "authToken",
  COMPLAINTS: "complaints",
  PROFILE: "profile"
};

// API Endpoints (for backend integration)
export const API_ENDPOINTS = {
  CITIZEN: {
    REGISTER: "/api/citizen/register",
    LOGIN: "/api/citizen/login",
    PROFILE: "/api/citizen/profile",
    POST_COMPLAINT: "/api/citizen/complaints",
    GET_COMPLAINTS: "/api/citizen/complaints",
    GET_COMPLAINT: "/api/citizen/complaints/:id",
    TRACK_COMPLAINT: "/api/citizen/track/:id"
  },
  ADMIN: {
    LOGIN: "/api/admin/login",
    GET_COMPLAINTS: "/api/admin/complaints",
    VALIDATE_COMPLAINT: "/api/admin/complaints/:id/validate",
    RESTRICT_USER: "/api/admin/restrict-user",
    GET_RESTRICTED_USERS: "/api/admin/restricted-users"
  },
  DEPARTMENT: {
    LOGIN: "/api/department/login",
    GET_ASSIGNED: "/api/department/complaints/assigned",
    UPDATE_STATUS: "/api/department/complaints/:id/status",
    GET_DETAILS: "/api/department/complaints/:id"
  }
};
