// FuelSync-AI Main Application
class FuelSyncApp {
  constructor() {
    this.currentUser = null;
    this.pumps = [];
    this.selectedPump = null;
    this.selectedCity = 'Mumbai';
    this.userLocation = { lat: 19.0760, lng: 72.8777 };
    this.ws = null;
    this.isLoading = false;
  }

  async init() {
    window.app = this;
    this.setupUI();
    this.setupNavigation();
    mapManager.init('map');
    chatManager.init();
    await this.getUserLocation();
    await this.checkAuth();
    await this.loadInitialData();
    this.setupWebSocket();
    this.setupFilters();
  }

  setupUI() {
    // City filter pills
    ['Mumbai', 'Delhi', 'Pune', 'Ahmedabad'].forEach(city => {
      const btn = document.querySelector(`.pill[data-city="${city}"]`);
      if (btn) btn.addEventListener('click', () => this.setCity(city));
    });
    // Active section shown by default
    this.showSection('dashboard');
  }

  setupNavigation() {
    document.querySelectorAll('[data-section]').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        this.showSection(link.dataset.section);
      });
    });
  }

  showSection(name) {
    document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
    const target = document.getElementById(`section-${name}`);
    if (target) target.classList.remove('hidden');
    document.querySelectorAll('[data-section]').forEach(l => {
      l.classList.toggle('active', l.dataset.section === name);
    });
    // Load section-specific data
    if (name === 'prices') this.loadPrices();
    if (name === 'alerts') this.loadAlerts();
    if (name === 'chat') chatManager.loadHistory().catch(() => {});
  }

  async getUserLocation() {
    try {
      const loc = await mapManager.getUserLocation();
      this.userLocation = loc;
      showToast('📍 Location detected', 'info');
    } catch { /* use default location */ }
  }

  async checkAuth() {
    if (!api.token) return;
    try {
      const user = await api.getMe();
      if (user) {
        this.currentUser = user;
        this.updateAuthUI(true);
      }
    } catch {
      api.clearTokens();
    }
  }

  updateAuthUI(loggedIn) {
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const userInfo = document.getElementById('user-info');
    if (loginBtn) loginBtn.classList.toggle('hidden', loggedIn);
    if (logoutBtn) logoutBtn.classList.toggle('hidden', !loggedIn);
    if (userInfo && this.currentUser) {
      userInfo.textContent = this.currentUser.name;
      userInfo.classList.remove('hidden');
    }
  }

  async loadInitialData() {
    this.showLoadingState();
    try {
      await Promise.all([
        this.loadPumps(),
        this.loadRecommendations(),
        this.loadPriceComparison(),
      ]);
    } finally {
      this.hideLoadingState();
    }
  }

  showLoadingState() {
    document.querySelectorAll('.pump-list').forEach(el => {
      el.innerHTML = Array(3).fill('<div class="skeleton" style="height:80px;margin-bottom:8px"></div>').join('');
    });
  }

  hideLoadingState() {}

  async loadPumps() {
    try {
      let result;
      if (this.userLocation) {
        result = await api.getNearby(this.userLocation.lat, this.userLocation.lng, 10, 20);
      } else {
        result = await api.getPumps({ city: this.selectedCity, limit: 20 });
      }
      this.pumps = result?.pumps || [];
      this.renderPumpList(this.pumps);
      if (mapManager.initialized) mapManager.updatePumps(this.pumps);
    } catch {
      showToast('Could not load pump data', 'error');
    }
  }

  renderPumpList(pumps) {
    const container = document.getElementById('pump-list');
    if (!container) return;
    if (!pumps.length) {
      container.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:2rem">No pumps found</p>';
      return;
    }
    container.innerHTML = pumps.map(p => this.pumpCardHTML(p)).join('');
    container.querySelectorAll('.pump-card').forEach((el, i) => {
      el.addEventListener('click', () => this.selectPump(pumps[i].id));
    });
  }

  pumpCardHTML(pump) {
    const crowd = pump.current_crowd_level;
    const crowdClass = crowd < 40 ? 'crowd-low' : crowd < 70 ? 'crowd-medium' : 'crowd-high';
    const crowdLabel = crowd < 40 ? 'Low' : crowd < 70 ? 'Medium' : 'High';
    const statusClass = `status-${pump.status}`;
    const stars = '⭐'.repeat(Math.round(pump.avg_rating || 0));
    const facilities = pump.facilities || {};

    return `
      <div class="pump-card" data-id="${pump.id}">
        <div class="pump-card-header">
          <div>
            <div class="pump-name">${pump.name}</div>
            <div class="pump-area">📍 ${pump.area}, ${pump.city}</div>
          </div>
          <span class="status-badge ${statusClass}">${pump.status === 'open' ? '🟢' : pump.status === 'closed' ? '🔴' : '🟡'} ${pump.status}</span>
        </div>
        <div class="crowd-indicator ${crowdClass}">
          <span>${crowdLabel}</span>
          <div class="crowd-bar-container">
            <div class="crowd-bar" style="width:${crowd}%"></div>
          </div>
          <span>${crowd}%</span>
        </div>
        <div class="pump-footer">
          <div class="pump-meta">
            <span class="pump-tag">${stars || '☆'} ${(pump.avg_rating || 0).toFixed(1)}</span>
            ${pump.is_24x7 ? '<span class="pump-tag">24×7</span>' : ''}
            ${facilities.ev_charger ? '<span class="pump-tag">⚡ EV</span>' : ''}
          </div>
          <div style="display:flex;gap:0.5rem;align-items:center">
            ${pump.distance_km ? `<span class="distance">${pump.distance_km} km</span>` : ''}
            <span class="wait-time">~${pump.estimated_wait_minutes || Math.round(crowd / 5 + 2)} min wait</span>
          </div>
        </div>
        <div class="facilities">
          <span class="facility-icon ${facilities.air ? 'available' : ''}" title="Air">🌬️</span>
          <span class="facility-icon ${facilities.water ? 'available' : ''}" title="Water">💧</span>
          <span class="facility-icon ${facilities.restroom ? 'available' : ''}" title="Restroom">🚻</span>
          <span class="facility-icon ${facilities.shop ? 'available' : ''}" title="Shop">🛒</span>
          <span class="facility-icon ${facilities.ev_charger ? 'available' : ''}" title="EV Charging">⚡</span>
        </div>
      </div>`;
  }

  async selectPump(pumpId) {
    const pump = this.pumps.find(p => p.id === pumpId);
    if (!pump) return;
    this.selectedPump = pump;
    // Highlight selected card
    document.querySelectorAll('.pump-card').forEach(el => {
      el.style.borderColor = el.dataset.id === pumpId ? 'var(--accent)' : '';
    });
    // Show detail panel
    this.renderPumpDetail(pump);
  }

  renderPumpDetail(pump) {
    const panel = document.getElementById('pump-detail');
    if (!panel) return;
    panel.classList.remove('hidden');
    panel.innerHTML = `
      <div class="card">
        <div class="card-header">
          <span class="card-title">${pump.name}</span>
          <button onclick="document.getElementById('pump-detail').classList.add('hidden')" style="background:none;border:none;color:var(--text-secondary);cursor:pointer;font-size:1.2rem">✕</button>
        </div>
        <p style="color:var(--text-secondary);font-size:0.85rem">${pump.address}</p>
        <div style="margin:1rem 0;display:flex;gap:1rem">
          <div class="stat-item" style="flex:1"><div class="stat-value">${pump.current_crowd_level}%</div><div class="stat-label">Crowd</div></div>
          <div class="stat-item" style="flex:1"><div class="stat-value">${(pump.avg_rating||0).toFixed(1)}</div><div class="stat-label">Rating</div></div>
          <div class="stat-item" style="flex:1"><div class="stat-value">${pump.review_count||0}</div><div class="stat-label">Reviews</div></div>
        </div>
        ${this.currentUser ? `
          <div style="margin-top:0.75rem">
            <button class="btn btn-outline btn-sm" onclick="app.setAlertForPump('${pump.id}')">🔔 Set Alert</button>
            <button class="btn btn-outline btn-sm" style="margin-left:0.5rem" onclick="app.showReviewForm('${pump.id}')">⭐ Review</button>
          </div>` : '<p style="font-size:0.8rem;color:var(--text-muted);margin-top:0.75rem">Log in to set alerts & reviews</p>'}
      </div>`;
  }

  async loadRecommendations() {
    try {
      const result = await api.getRecommendations(this.userLocation.lat, this.userLocation.lng);
      this.renderRecommendations(result?.recommendations || []);
    } catch { /* recommendations unavailable */ }
  }

  renderRecommendations(recs) {
    const container = document.getElementById('recommendations-list');
    if (!container) return;
    if (!recs.length) {
      container.innerHTML = '<p style="color:var(--text-muted);text-align:center">No recommendations available</p>';
      return;
    }
    container.innerHTML = recs.slice(0, 3).map((rec, i) => `
      <div class="pump-card recommendation-card" style="margin-bottom:0.75rem" onclick="app.selectPump('${rec.id}')">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div>
            <div style="font-size:0.75rem;color:var(--text-muted)">Rank #${i+1}</div>
            <div class="pump-name">${rec.name}</div>
            <div class="pump-area">📍 ${rec.area}, ${rec.city}</div>
          </div>
          <div class="rec-rank">${Math.round(rec.score)}</div>
        </div>
        <div class="rec-score">
          Score
          <div class="score-bar-container"><div class="score-bar" style="width:${rec.score}%"></div></div>
          ${rec.score}/100
        </div>
        <div style="display:flex;gap:1rem;margin-top:0.5rem;font-size:0.82rem;color:var(--text-secondary)">
          <span>👥 ${rec.current_crowd_level}% crowd</span>
          <span>⏱ ~${rec.estimated_wait_minutes} min</span>
          ${rec.distance_km ? `<span>📍 ${rec.distance_km} km</span>` : ''}
        </div>
      </div>`).join('');
  }

  async loadPrices() {
    try {
      const [today, comparison] = await Promise.all([
        api.getPricesToday(),
        api.getPriceComparison(this.selectedCity),
      ]);
      this.renderPricesToday(today?.prices || []);
      this.renderPriceComparison(comparison);
    } catch { /* prices unavailable */ }
  }

  renderPricesToday(prices) {
    const container = document.getElementById('prices-today');
    if (!container) return;
    container.innerHTML = prices.map(p => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:0.75rem;background:var(--bg-secondary);border-radius:8px;margin-bottom:0.5rem">
        <span style="font-weight:600">${p.city}</span>
        <span style="color:var(--accent-green);font-weight:700">₹${p.avg_price}/kg</span>
      </div>`).join('') || '<p style="color:var(--text-muted)">No price data yet. Seed the database first.</p>';
  }

  renderPriceComparison(data) {
    const container = document.getElementById('price-comparison');
    if (!container || !data) return;
    container.innerHTML = `
      <div class="price-grid">
        <div class="price-item"><div class="price-label">CNG</div><div class="price-value price-cng">₹${data.cng_per_kg}</div><div style="font-size:0.7rem;color:var(--text-muted)">/kg</div></div>
        <div class="price-item"><div class="price-label">Petrol</div><div class="price-value price-petrol">₹${data.petrol_per_litre}</div><div style="font-size:0.7rem;color:var(--text-muted)">/litre</div></div>
        <div class="price-item"><div class="price-label">Diesel</div><div class="price-value price-diesel">₹${data.diesel_per_litre}</div><div style="font-size:0.7rem;color:var(--text-muted)">/litre</div></div>
      </div>
      <div class="price-saving">💚 Save ${data.cng_savings_vs_petrol}% vs Petrol | ${data.cng_savings_vs_diesel}% vs Diesel</div>`;
  }

  async loadPriceComparison() {
    try {
      const data = await api.getPriceComparison(this.selectedCity);
      this.renderPriceComparison(data);
    } catch { /* price comparison unavailable */ }
  }

  async loadAlerts() {
    if (!this.currentUser) return;
    try {
      const result = await api.getAlerts();
      this.renderAlerts(result?.alerts || []);
    } catch { /* alerts unavailable */ }
  }

  renderAlerts(alerts) {
    const container = document.getElementById('alerts-list');
    if (!container) return;
    if (!alerts.length) {
      container.innerHTML = '<p style="color:var(--text-muted)">No active alerts. Set one below!</p>';
      return;
    }
    container.innerHTML = alerts.map(a => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:0.75rem;background:var(--bg-secondary);border-radius:8px;margin-bottom:0.5rem">
        <div>
          <div style="font-size:0.85rem;font-weight:600">Pump ${a.pump_id.slice(0, 8)}...</div>
          <div style="font-size:0.75rem;color:var(--text-muted)">Threshold: ${a.threshold} | ${a.is_active ? '🟢 Active' : '🔴 Inactive'}</div>
          ${a.last_triggered ? `<div style="font-size:0.7rem;color:var(--text-muted)">Last triggered: ${new Date(a.last_triggered).toLocaleString()}</div>` : ''}
        </div>
        <button class="btn btn-danger btn-sm" onclick="app.deleteAlert('${a.id}')">🗑</button>
      </div>`).join('');
  }

  async deleteAlert(id) {
    try {
      await api.deleteAlert(id);
      showToast('Alert deleted', 'success');
      this.loadAlerts();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async setAlertForPump(pumpId) {
    if (!this.currentUser) { this.showAuthModal(); return; }
    try {
      await api.createAlert(pumpId, 'low');
      showToast('🔔 Alert set!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  showReviewForm(pumpId) {
    const rating = prompt('Rate this pump (1-5):');
    if (!rating || isNaN(rating) || +rating < 1 || +rating > 5) return;
    const text = prompt('Add a comment (optional):') || '';
    api.createReview(pumpId, parseInt(rating), text)
      .then(() => { showToast('Review submitted!', 'success'); this.loadPumps(); })
      .catch(err => showToast(err.message, 'error'));
  }

  setupWebSocket() {
    try {
      const wsUrl = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.hostname}:8000/ws/pumps/live`;
      this.ws = new WebSocket(wsUrl);
      this.ws.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data.type === 'pump_update' && data.pumps) {
          data.pumps.forEach(update => {
            const pump = this.pumps.find(p => p.id === update.id);
            if (pump) {
              pump.current_crowd_level = update.current_crowd_level;
              pump.current_vehicles = update.current_vehicles;
            }
          });
          this.renderPumpList(this.pumps);
        }
      };
      this.ws.onerror = () => {}; // Silent fail if backend not running
    } catch { /* WebSocket unavailable */ }
  }

  setupFilters() {
    const filterBtn = document.getElementById('filter-btn');
    if (filterBtn) {
      filterBtn.addEventListener('click', () => {
        const status = document.getElementById('filter-status')?.value;
        const area = document.getElementById('filter-area')?.value;
        this.applyFilters({ status, area });
      });
    }
  }

  applyFilters(filters) {
    let filtered = [...this.pumps];
    if (filters.status) filtered = filtered.filter(p => p.status === filters.status);
    if (filters.area) filtered = filtered.filter(p => p.area.toLowerCase().includes(filters.area.toLowerCase()));
    this.renderPumpList(filtered);
  }

  setCity(city) {
    this.selectedCity = city;
    document.querySelectorAll('.pill[data-city]').forEach(el => {
      el.classList.toggle('active', el.dataset.city === city);
    });
    this.loadPumps();
    this.loadPriceComparison();
  }

  showAuthModal() {
    document.getElementById('auth-modal')?.classList.remove('hidden');
  }

  hideAuthModal() {
    document.getElementById('auth-modal')?.classList.add('hidden');
  }

  async handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email')?.value;
    const password = document.getElementById('login-password')?.value;
    const errEl = document.getElementById('login-error');
    try {
      const result = await api.login(email, password);
      this.currentUser = result.user;
      this.updateAuthUI(true);
      this.hideAuthModal();
      showToast(`Welcome back, ${result.user.name}!`, 'success');
    } catch (err) {
      if (errEl) errEl.textContent = err.message;
    }
  }

  async handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name')?.value;
    const email = document.getElementById('reg-email')?.value;
    const password = document.getElementById('reg-password')?.value;
    const errEl = document.getElementById('reg-error');
    try {
      const result = await api.register({ name, email, password });
      this.currentUser = result.user;
      this.updateAuthUI(true);
      this.hideAuthModal();
      showToast(`Welcome to FuelSync, ${result.user.name}!`, 'success');
    } catch (err) {
      if (errEl) errEl.textContent = err.message;
    }
  }

  async handleLogout() {
    await api.logout();
    this.currentUser = null;
    this.updateAuthUI(false);
    showToast('Logged out', 'info');
  }
}

// Toast notifications
function showToast(message, type = 'info', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}

// Initialize app on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new FuelSyncApp();
  app.init();
});
