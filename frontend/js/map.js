// Map Management for FuelSync-AI
class MapManager {
  constructor() {
    this.map = null;
    this.markers = new Map();
    this.userMarker = null;
    this.userLocation = null;
    this.initialized = false;
  }

  init(containerId = 'map') {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (window.google && window.google.maps) {
      this._initGoogleMaps(containerId);
    } else {
      this._showMapPlaceholder(container);
    }
  }

  _initGoogleMaps(containerId) {
    this.map = new google.maps.Map(document.getElementById(containerId), {
      center: { lat: 19.0760, lng: 72.8777 },
      zoom: 12,
      styles: this._getDarkMapStyle(),
      disableDefaultUI: false,
    });
    this.initialized = true;
    this.getUserLocation();
  }

  _showMapPlaceholder(container) {
    container.innerHTML = `
      <div class="map-placeholder">
        <div class="map-icon">🗺️</div>
        <p>Map requires Google Maps API key</p>
        <p style="font-size:0.8rem;color:var(--text-muted)">Set GOOGLE_MAPS_API_KEY in .env</p>
        <div id="map-pump-list" style="width:100%;max-height:280px;overflow-y:auto;padding:1rem"></div>
      </div>`;
  }

  getUserLocation() {
    if (!navigator.geolocation) return Promise.reject('Geolocation not supported');
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        pos => {
          this.userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          if (this.initialized && this.map) {
            this.map.setCenter(this.userLocation);
            this.addUserMarker(this.userLocation);
          }
          resolve(this.userLocation);
        },
        () => {
          // Default to Mumbai center
          this.userLocation = { lat: 19.0760, lng: 72.8777 };
          resolve(this.userLocation);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }

  addUserMarker(position) {
    if (!this.initialized) return;
    if (this.userMarker) this.userMarker.setMap(null);
    this.userMarker = new google.maps.Marker({
      position,
      map: this.map,
      title: 'Your Location',
      icon: { path: google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: '#00d4ff', fillOpacity: 1, strokeWeight: 2, strokeColor: '#fff' },
    });
  }

  addPumpMarker(pump) {
    if (!this.initialized) return;
    const colors = { open: '#10b981', closed: '#ef4444', maintenance: '#f59e0b' };
    const color = colors[pump.status] || '#10b981';
    const marker = new google.maps.Marker({
      position: { lat: pump.latitude, lng: pump.longitude },
      map: this.map,
      title: pump.name,
      icon: {
        path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
        scale: 7, fillColor: color, fillOpacity: 0.9, strokeWeight: 1, strokeColor: '#fff',
      },
    });
    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="background:#16213e;color:#e2e8f0;padding:12px;border-radius:8px;min-width:200px">
          <strong>${pump.name}</strong><br>
          <span style="color:#94a3b8;font-size:0.85rem">${pump.area}, ${pump.city}</span><br>
          <div style="margin-top:8px;display:flex;justify-content:space-between">
            <span>Crowd: <b style="color:${pump.current_crowd_level < 40 ? '#10b981' : pump.current_crowd_level < 70 ? '#f59e0b' : '#ef4444'}">${pump.current_crowd_level}%</b></span>
            <span>⭐ ${pump.avg_rating?.toFixed(1)}</span>
          </div>
          ${pump.distance_km ? `<div style="margin-top:4px;color:#00d4ff;font-size:0.85rem">📍 ${pump.distance_km} km away</div>` : ''}
        </div>`,
    });
    marker.addListener('click', () => {
      infoWindow.open(this.map, marker);
      window.app?.selectPump(pump.id);
    });
    this.markers.set(pump.id, marker);
  }

  updatePumps(pumps) {
    // Remove old markers not in new set
    const newIds = new Set(pumps.map(p => p.id));
    for (const [id, marker] of this.markers) {
      if (!newIds.has(id)) { marker.setMap(null); this.markers.delete(id); }
    }
    pumps.forEach(pump => {
      if (!this.markers.has(pump.id)) this.addPumpMarker(pump);
    });
  }

  _getDarkMapStyle() {
    return [
      { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
      { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
      { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
      { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#16213e' }] },
      { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#2d3748' }] },
      { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f0f23' }] },
      { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    ];
  }
}

const mapManager = new MapManager();
