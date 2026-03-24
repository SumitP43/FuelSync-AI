// FuelSync-AI API Client
const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:8000' : '';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('fuelsync_token');
    this.refreshToken = localStorage.getItem('fuelsync_refresh_token');
  }

  setTokens(accessToken, refreshToken) {
    this.token = accessToken;
    if (refreshToken) this.refreshToken = refreshToken;
    localStorage.setItem('fuelsync_token', accessToken);
    if (refreshToken) localStorage.setItem('fuelsync_refresh_token', refreshToken);
  }

  clearTokens() {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem('fuelsync_token');
    localStorage.removeItem('fuelsync_refresh_token');
  }

  async request(method, path, body = null, retry = true) {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    try {
      const resp = await fetch(`${API_BASE}${path}`, options);
      if (resp.status === 401 && retry && this.refreshToken) {
        const refreshed = await this._refreshAccessToken();
        if (refreshed) return this.request(method, path, body, false);
        this.clearTokens();
        window.app?.showAuthModal();
        return null;
      }
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(err.detail || `HTTP ${resp.status}`);
      }
      if (resp.status === 204) return null;
      return resp.json();
    } catch (err) {
      if (err.message !== 'Failed to fetch') throw err;
      throw new Error('Network error — is the backend running?');
    }
  }

  async _refreshAccessToken() {
    try {
      const resp = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: this.refreshToken }),
      });
      if (!resp.ok) return false;
      const data = await resp.json();
      this.setTokens(data.access_token, null);
      return true;
    } catch { return false; }
  }

  get(path) { return this.request('GET', path); }
  post(path, body) { return this.request('POST', path, body); }
  put(path, body) { return this.request('PUT', path, body); }
  delete(path) { return this.request('DELETE', path); }

  // Auth
  async register(data) {
    const result = await this.post('/api/auth/register', data);
    if (result?.access_token) this.setTokens(result.access_token, result.refresh_token);
    return result;
  }
  async login(email, password) {
    const result = await this.post('/api/auth/login', { email, password });
    if (result?.access_token) this.setTokens(result.access_token, result.refresh_token);
    return result;
  }
  async logout() {
    await this.post('/api/auth/logout').catch(() => {});
    this.clearTokens();
  }
  getMe() { return this.get('/api/auth/me'); }

  // Pumps
  getPumps(params = {}) {
    const q = new URLSearchParams(params).toString();
    return this.get(`/api/pumps/${q ? '?' + q : ''}`);
  }
  getPump(id) { return this.get(`/api/pumps/${id}`); }
  getNearby(lat, lng, radius = 5, limit = 10) {
    return this.get(`/api/pumps/nearby?lat=${lat}&lng=${lng}&radius=${radius}&limit=${limit}`);
  }
  getQueueHistory(pumpId, limit = 24) { return this.get(`/api/pumps/${pumpId}/queue-history?limit=${limit}`); }
  getPumpReviews(pumpId) { return this.get(`/api/pumps/${pumpId}/reviews`); }
  createReview(pumpId, rating, text) { return this.post(`/api/pumps/${pumpId}/reviews`, { rating, text }); }

  // Recommendations
  getRecommendations(lat, lng, radius = 10, preferences = null) {
    return this.post('/api/recommendations/', { lat, lng, radius_km: radius, preferences });
  }
  getBestPick(lat, lng) { return this.get(`/api/recommendations/best-pick?lat=${lat}&lng=${lng}`); }
  getTrending() { return this.get('/api/recommendations/trending'); }

  // Prices
  getPricesToday() { return this.get('/api/prices/today'); }
  getCityPrice(city) { return this.get(`/api/prices/city/${encodeURIComponent(city)}`); }
  getPriceComparison(city = 'Mumbai') { return this.get(`/api/prices/comparison?city=${encodeURIComponent(city)}`); }

  // Alerts
  createAlert(pumpId, threshold) { return this.post('/api/alerts/', { pump_id: pumpId, threshold }); }
  getAlerts() { return this.get('/api/alerts/'); }
  deleteAlert(id) { return this.delete(`/api/alerts/${id}`); }

  // Chat
  sendChatMessage(message, context = null) { return this.post('/api/chat/message', { message, context }); }
  getChatHistory() { return this.get('/api/chat/history'); }
  clearChatHistory() { return this.delete('/api/chat/history'); }
}

const api = new ApiClient();
