/* ==========================================================================
   SALON & SPA MANAGEMENT - API CLIENT MODULE
   ========================================================================== */

const API = {
  // Configurable backend API base URL (defaults to current origin or http://localhost:3000)
  getBaseUrl() {
    return localStorage.getItem('salon_api_url') || window.location.origin || 'http://localhost:3000';
  },

  setBaseUrl(url) {
    if (url) {
      localStorage.setItem('salon_api_url', url.replace(/\/$/, ''));
    }
  },

  getToken() {
    return localStorage.getItem('salon_token');
  },

  getUser() {
    const userStr = localStorage.getItem('salon_user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  setAuth(token, user) {
    localStorage.setItem('salon_token', token);
    localStorage.setItem('salon_user', JSON.stringify(user));
  },

  clearAuth() {
    localStorage.removeItem('salon_token');
    localStorage.removeItem('salon_user');
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  async request(endpoint, options = {}) {
    const base = this.getBaseUrl();
    const cleanEndpoint = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;
    const url = `${base}${cleanEndpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 && !endpoint.includes('/auth/login')) {
          this.clearAuth();
          if (window.App && window.App.renderAuthView) {
            window.App.renderAuthView();
            window.App.showToast('Session expired. Please log in again.', 'warning');
          }
        }
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  },

  // 1. Authentication API
  auth: {
    login(email, password) {
      return API.request('/auth/login', {
        method: 'POST',
        body: { email, password },
      });
    },
    register(userData) {
      return API.request('/auth/register', {
        method: 'POST',
        body: userData,
      });
    },
    logout() {
      return API.request('/auth/logout', {
        method: 'POST',
      });
    },
    changePassword(current_password, new_password) {
      return API.request('/auth/change-password', {
        method: 'PUT',
        body: { current_password, new_password },
      });
    },
  },

  // 2. Customers API
  customers: {
    getAll(params = {}) {
      const query = new URLSearchParams(params).toString();
      return API.request(`/customers${query ? '?' + query : ''}`);
    },
    getById(id) {
      return API.request(`/customers/${id}`);
    },
    create(data) {
      return API.request('/customers', {
        method: 'POST',
        body: data,
      });
    },
    update(id, data) {
      return API.request(`/customers/${id}`, {
        method: 'PUT',
        body: data,
      });
    },
    delete(id) {
      return API.request(`/customers/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // 3. Services API
  services: {
    getAll() {
      return API.request('/services');
    },
    getById(id) {
      return API.request(`/services/${id}`);
    },
    create(data) {
      return API.request('/services', {
        method: 'POST',
        body: data,
      });
    },
    update(id, data) {
      return API.request(`/services/${id}`, {
        method: 'PUT',
        body: data,
      });
    },
    delete(id) {
      return API.request(`/services/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // 4. Barbers API
  barbers: {
    getAll(params = {}) {
      const query = new URLSearchParams(params).toString();
      return API.request(`/barbers${query ? '?' + query : ''}`);
    },
    getById(id) {
      return API.request(`/barbers/${id}`);
    },
    create(data) {
      return API.request('/barbers', {
        method: 'POST',
        body: data,
      });
    },
    update(id, data) {
      return API.request(`/barbers/${id}`, {
        method: 'PUT',
        body: data,
      });
    },
    delete(id) {
      return API.request(`/barbers/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // 5. Appointments API
  appointments: {
    getAll(params = {}) {
      const query = new URLSearchParams(params).toString();
      return API.request(`/appointments${query ? '?' + query : ''}`);
    },
    getById(id) {
      return API.request(`/appointments/${id}`);
    },
    create(data) {
      return API.request('/appointments', {
        method: 'POST',
        body: data,
      });
    },
    update(id, data) {
      return API.request(`/appointments/${id}`, {
        method: 'PUT',
        body: data,
      });
    },
    delete(id) {
      return API.request(`/appointments/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // 6. Time Slots & Scheduling Engine API
  slots: {
    getOpenSlots(barber_id, date, service_id = null) {
      const params = new URLSearchParams({ barber_id, date });
      if (service_id) params.append('service_id', service_id);
      return API.request(`/slots?${params.toString()}`);
    },
    createException(data) {
      return API.request('/slots', {
        method: 'POST',
        body: data,
      });
    },
    getExceptions() {
      return API.request('/slots/exceptions');
    },
    deleteException(id) {
      return API.request(`/slots/exceptions/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // 7. Attendance API
  attendance: {
    getAll(params = {}) {
      const query = new URLSearchParams(params).toString();
      return API.request(`/attendance${query ? '?' + query : ''}`);
    },
    getById(id) {
      return API.request(`/attendance/${id}`);
    },
    checkIn(barber_id = null) {
      return API.request('/attendance/checkin', {
        method: 'POST',
        body: barber_id ? { barber_id } : {},
      });
    },
    checkOut(barber_id = null) {
      return API.request('/attendance/checkout', {
        method: 'POST',
        body: barber_id ? { barber_id } : {},
      });
    },
    create(data) {
      return API.request('/attendance', {
        method: 'POST',
        body: data,
      });
    },
    update(id, data) {
      return API.request(`/attendance/${id}`, {
        method: 'PUT',
        body: data,
      });
    },
    delete(id) {
      return API.request(`/attendance/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // 8. Wages & Payroll API
  wages: {
    getAll(params = {}) {
      const query = new URLSearchParams(params).toString();
      return API.request(`/wages${query ? '?' + query : ''}`);
    },
    getById(id) {
      return API.request(`/wages/${id}`);
    },
    calculateStatement(barber_id, month, salary = 0) {
      const params = new URLSearchParams({ barber_id, month, salary });
      return API.request(`/wages/calculate?${params.toString()}`);
    },
    finalize(data) {
      return API.request('/wages', {
        method: 'POST',
        body: data,
      });
    },
    update(id, data) {
      return API.request(`/wages/${id}`, {
        method: 'PUT',
        body: data,
      });
    },
    delete(id) {
      return API.request(`/wages/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // 9. Corporate Dashboard Reporting API
  reports: {
    getDailyRevenue(date = null) {
      const query = date ? `?date=${date}` : '';
      return API.request(`/reports/daily-revenue${query}`);
    },
    getMonthlyRevenue(year = null) {
      const query = year ? `?year=${year}` : '';
      return API.request(`/reports/monthly-revenue${query}`);
    },
    getTopServices(limit = 10) {
      return API.request(`/reports/top-services?limit=${limit}`);
    },
    getBarberPerformance(month = null) {
      const query = month ? `?month=${month}` : '';
      return API.request(`/reports/barber-performance${query}`);
    },
    getCustomerVisits() {
      return API.request('/reports/customer-visits');
    },
  },

  // User Management API
  users: {
    getAll() {
      return API.request('/users');
    },
    getById(id) {
      return API.request(`/users/${id}`);
    },
    create(data) {
      return API.request('/users', {
        method: 'POST',
        body: data,
      });
    },
    update(id, data) {
      return API.request(`/users/${id}`, {
        method: 'PUT',
        body: data,
      });
    },
    delete(id) {
      return API.request(`/users/${id}`, {
        method: 'DELETE',
      });
    },
  },
};

window.API = API;
