// API Client and Service Layer for Justip Shopper CMS
// Connected directly to Golang Backend (justip_be) on http://localhost:8080/api/v1

const DEFAULT_API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:8080/api/v1';

// Token and User session storage helpers
export const authStorage = {
  getToken: () => localStorage.getItem('justip_token'),
  setToken: (token) => localStorage.setItem('justip_token', token),
  clearToken: () => localStorage.removeItem('justip_token'),
  getUser: () => {
    try {
      const u = localStorage.getItem('justip_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },
  setUser: (user) => localStorage.setItem('justip_user', JSON.stringify(user)),
  clearUser: () => localStorage.removeItem('justip_user'),
  clearAll: () => {
    localStorage.removeItem('justip_token');
    localStorage.removeItem('justip_user');
  }
};

/**
 * Generic API request wrapper conforming to the OpenAPI Response Envelope:
 * { success: boolean, message: string, data: any, meta?: object, error?: object }
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${DEFAULT_API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const token = authStorage.getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    // Special handling for CSV blob downloads
    if (response.headers.get('content-type')?.includes('text/csv')) {
      const blob = await response.blob();
      return { success: true, data: blob, isBlob: true };
    }

    const json = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage = json?.message || `HTTP ${response.status}: ${response.statusText}`;
      const errorCode = json?.error?.code || 'UNKNOWN_ERROR';
      const details = json?.error?.details || [];

      // If 401 Unauthorized, notify/clear session
      if (response.status === 401 && !endpoint.includes('/auth/login')) {
        authStorage.clearAll();
      }

      return {
        success: false,
        status: response.status,
        message: errorMessage,
        error: { code: errorCode, details },
        data: null
      };
    }

    return {
      success: true,
      status: response.status,
      message: json?.message || 'Success',
      data: json?.data !== undefined ? json.data : json,
      meta: json?.meta || null
    };
  } catch (err) {
    return {
      success: false,
      status: 0,
      message: err.message || 'Tidak dapat terhubung ke server Backend Golang',
      error: { code: 'NETWORK_ERROR', details: [] },
      data: null
    };
  }
}

// ==========================================
// API SERVICES
// ==========================================

export const authApi = {
  // Login with email and password
  login: async (email, password) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  // Register new shopper/buyer
  register: async (payload) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // Google SSO login
  ssoGoogle: async (idToken) => {
    return apiRequest('/auth/sso/google', {
      method: 'POST',
      body: JSON.stringify({ id_token: idToken })
    });
  },

  // Get current authenticated user profile
  getMe: async () => {
    return apiRequest('/auth/me', { method: 'GET' });
  }
};

export const kloterApi = {
  // List all open kloters
  list: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/kloters${query ? `?${query}` : ''}`, { method: 'GET' });
  },

  // Get kloter details with rules & catalog
  getDetail: async (id) => {
    return apiRequest(`/kloters/${id}`, { method: 'GET' });
  },

  // Create new batch / kloter (Shopper only)
  create: async (data) => {
    return apiRequest('/shopper/kloters', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Update kloter status or quota
  update: async (id, data) => {
    return apiRequest(`/shopper/kloters/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  // Get catalog items for kloter
  getCatalog: async (kloterId) => {
    return apiRequest(`/kloters/${kloterId}/catalog`, { method: 'GET' });
  },

  // Add item to kloter catalog
  addCatalogItem: async (kloterId, item) => {
    return apiRequest(`/shopper/kloters/${kloterId}/catalog`, {
      method: 'POST',
      body: JSON.stringify(item)
    });
  },

  // Delete catalog item
  deleteCatalogItem: async (kloterId, itemId) => {
    return apiRequest(`/shopper/kloters/${kloterId}/catalog/${itemId}`, {
      method: 'DELETE'
    });
  }
};

export const orderApi = {
  // Get incoming orders for Shopper CMS
  listShopperOrders: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/shopper/orders${query ? `?${query}` : ''}`, { method: 'GET' });
  },

  // Update single order status (e.g. PURCHASED, SHIPPED)
  updateStatus: async (orderId, status, note = '', trackingNo = '') => {
    return apiRequest(`/shopper/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({
        status,
        note,
        tracking_no: trackingNo
      })
    });
  },

  // Bulk update multiple orders status
  bulkUpdateStatus: async (orderIds, status, note = '') => {
    return apiRequest('/shopper/orders/bulk-status', {
      method: 'POST',
      body: JSON.stringify({
        order_ids: orderIds,
        status,
        note
      })
    });
  }
};

export const reportApi = {
  // Get financial summary for shopper
  getSummary: async (kloterId = '') => {
    return apiRequest(`/shopper/reports/summary${kloterId ? `?kloter_id=${kloterId}` : ''}`, {
      method: 'GET'
    });
  },

  // Download orders recap as CSV
  exportCSV: async (kloterId = '') => {
    return apiRequest(`/shopper/reports/orders/export${kloterId ? `?kloter_id=${kloterId}` : ''}`, {
      method: 'GET'
    });
  }
};

export const healthApi = {
  // Ping backend health
  check: async () => {
    try {
      const res = await fetch('http://localhost:8080/health', {
        headers: { Accept: 'application/json' }
      });
      return res.ok;
    } catch {
      return false;
    }
  }
};
