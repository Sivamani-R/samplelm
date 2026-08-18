/**
 * Authentication Service
 * 
 * Manages JWT tokens, session lifecycle, and auth abstractions.
 * Decouples storage mechanics from UI components for clean SOLID architecture.
 */

const TOKEN_STORAGE_KEY = 'nexleave_auth_token';
const USER_STORAGE_KEY = 'nexleave_auth_user';

export const authService = {
  /**
   * Retrieves the stored JWT token.
   */
  getToken() {
    return localStorage.getItem(TOKEN_STORAGE_KEY) || null;
  },

  /**
   * Stores the JWT token.
   */
  setToken(token) {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  },

  /**
   * Retrieves currently authenticated user profile.
   */
  getUser() {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      localStorage.removeItem(USER_STORAGE_KEY);
      return null;
    }
  },

  /**
   * Sets current user profile into storage.
   */
  setUser(user) {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  },

  /**
   * Checks whether a valid session exists.
   */
  isAuthenticated() {
    return Boolean(this.getToken() && this.getUser());
  },

  /**
   * Clears all session tokens and credentials.
   */
  logout() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  },

  /**
   * Helper to verify if user has an authorized role.
   */
  hasRole(role) {
    const user = this.getUser();
    return user?.role === role;
  },

  /**
   * Helper to verify if user has any of the authorized roles.
   */
  hasAnyRole(roles = []) {
    const user = this.getUser();
    return user ? roles.includes(user.role) : false;
  }
};
