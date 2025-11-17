/**
 * API Service using Axios
 * Handles all backend communication with authentication
 */
import axios from "axios";

// Base API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add auth token to all requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // Server responded with error
      let message = "An error occurred";

      // Handle different error response formats
      if (typeof error.response.data === "string") {
        message = error.response.data;
      } else if (error.response.data?.detail) {
        // FastAPI validation errors might be array or string
        if (Array.isArray(error.response.data.detail)) {
          message = error.response.data.detail.map((err) => err.msg).join(", ");
        } else {
          message = error.response.data.detail;
        }
      } else if (error.response.data?.message) {
        message = error.response.data.message;
      }

      // Auto logout on 401
      if (error.response.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }

      return Promise.reject(new Error(message));
    } else if (error.request) {
      // Request made but no response
      return Promise.reject(
        new Error("Network error. Please check your connection.")
      );
    } else {
      // Something else happened
      return Promise.reject(error);
    }
  }
);

// ===== AUTH API =====
export const authAPI = {
  /**
   * Register new user
   * @param {string} username
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{access_token: string, user: object}>}
   */
  async register(username, email, password) {
    const data = await apiClient.post("/auth/register", {
      username,
      email,
      password,
    });

    // Save token and user to localStorage
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));

    return data;
  },

  /**
   * Login existing user
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{access_token: string, user: object}>}
   */
  async login(email, password) {
    const data = await apiClient.post("/auth/login", {
      email,
      password,
    });

    // Save token and user to localStorage
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));

    return data;
  },

  /**
   * Logout current user
   */
  logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
  },

  /**
   * Get current user info (requires authentication)
   * @returns {Promise<object>}
   */
  async getCurrentUser() {
    return await apiClient.get("/auth/me");
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!localStorage.getItem("access_token");
  },

  /**
   * Get stored user data from localStorage
   * @returns {object|null}
   */
  getStoredUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  /**
   * Get access token
   * @returns {string|null}
   */
  getToken() {
    return localStorage.getItem("access_token");
  },
};

// ===== PROFILE API =====
export const profileAPI = {
  /**
   * Create new company profile with AI intelligence
   * @param {string} companyName
   * @returns {Promise<object>}
   */
  async createProfile(companyName) {
    return await apiClient.post("/profiles/create", {
      company_name: companyName,
    });
  },

  /**
   * Create profile with streaming logs (SSE)
   * @param {string} companyName
   * @param {function} onLog - Callback for each log message
   * @param {function} onComplete - Callback when done with profileId
   * @param {function} onError - Callback for errors
   * @returns {EventSource}
   */
  createProfileStream(companyName, onLog, onComplete, onError) {
    const token = authAPI.getToken();

    // EventSource doesn't support custom headers or POST, so we pass token as query param
    const url = `${API_BASE_URL}/profiles/create-stream?company_name=${encodeURIComponent(
      companyName
    )}&token=${token}`;

    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      const message = event.data;

      if (message.startsWith("DONE|")) {
        const profileId = message.split("|")[1];
        eventSource.close();
        if (onComplete) onComplete(profileId);
      } else if (message.startsWith("ERROR|")) {
        const errorMsg = message.split("|")[1];
        eventSource.close();
        if (onError) onError(errorMsg);
      } else {
        if (onLog) onLog(message);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE Error:", error);
      eventSource.close();
      if (onError) onError("Connection error. Please try again.");
    };

    return eventSource;
  },

  /**
   * Get all profiles for current user
   * @returns {Promise<Array>}
   */
  async getMyProfiles() {
    return await apiClient.get("/profiles/my-profiles");
  },

  /**
   * Get specific profile by ID
   * @param {string} profileId
   * @returns {Promise<object>}
   */
  async getProfileById(profileId) {
    return await apiClient.get(`/profiles/${profileId}`);
  },

  /**
   * Delete profile by ID
   * @param {string} profileId
   * @returns {Promise<{success: boolean}>}
   */
  async deleteProfile(profileId) {
    await apiClient.delete(`/profiles/${profileId}`);
    return { success: true };
  },

  /**
   * Toggle favorite status for a profile
   * @param {string} profileId
   * @returns {Promise<object>}
   */
  async toggleFavorite(profileId) {
    return await apiClient.patch(`/profiles/${profileId}/favorite`);
  },

  /**
   * Generate profile without authentication (legacy endpoint)
   * @param {string} companyName
   * @returns {Promise<object>}
   */
  async generateProfile(companyName) {
    return await apiClient.post("/generate-profile", {
      company_name: companyName,
    });
  },
};

// Export axios instance for custom requests
export default apiClient;
