/**
 * Centralized API Client & Request Interceptor
 * 
 * Automatically attaches JWT Bearer token from authService,
 * normalizes response payloads, and standardizes error responses.
 */

import { authService } from '../services/authService.js';

export class ApiError extends Error {
  constructor(message, status, data = null, field = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.field = field;
  }
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const apiClient = {
  /**
   * Indicates whether mock mode is currently enabled
   */
  isMockMode() {
    return USE_MOCK;
  },

  /**
   * Generic HTTP request execution
   */
  async request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const token = authService.getToken();

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);

      // Handle 401 Unauthorized globally
      if (response.status === 401) {
        authService.logout();
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        throw new ApiError('Session expired or unauthorized. Please log in again.', 401);
      }

      // Handle other HTTP errors
      if (!response.ok) {
        let errorData = null;
        let errorMessage = `HTTP error! Status: ${response.status}`;

        try {
          errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // Response was not JSON
        }

        const field = errorData?.field || null;
        throw new ApiError(errorMessage, response.status, errorData, field);
      }

      // 204 No Content
      if (response.status === 204) {
        return null;
      }

      return await response.json();
    } catch (err) {
      if (err instanceof ApiError) {
        throw err;
      }
      // Network or DNS error
      throw new ApiError(
        err.message || 'Unable to connect to server. Please check your network.',
        0,
        null
      );
    }
  },

  get(endpoint, headers = {}) {
    return this.request(endpoint, { method: 'GET', headers });
  },

  post(endpoint, body, headers = {}) {
    return this.request(endpoint, { method: 'POST', body, headers });
  },

  put(endpoint, body, headers = {}) {
    return this.request(endpoint, { method: 'PUT', body, headers });
  },

  delete(endpoint, headers = {}) {
    return this.request(endpoint, { method: 'DELETE', headers });
  }
};
