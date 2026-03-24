import { useEffect, useRef } from 'react';
import { getCrowdInfo } from '../utils/helpers';

const Map = ({ location, pumps = [], selectedPump, onPumpClick }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !location) return;

    // Dynamically import Leaflet to avoid SSR issues
    import('leaflet').then((L) => {
      // Fix default icon paths
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (!mapInstanceRef.current && mapRef.current) {
        const map = L.map(mapRef.current, {
          center: [location.lat, location.lng],
          zoom: 13,
          zoomControl: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;

      // User location marker
      if (userMarkerRef.current) userMarkerRef.current.remove();
      const userIcon = L.divIcon({
        html: `<div style="width:16px;height:16px;background:#22c55e;border:3px solid white;border-radius:50%;box-shadow:0 0 10px rgba(34,197,94,0.8)"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        className: '',
      });
      userMarkerRef.current = L.marker([location.lat, location.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup('<div style="color:#0f172a;font-weight:600">📍 Your Location</div>');

      // Clear existing pump markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      // Add pump markers
      pumps.forEach((pump) => {
        const info = getCrowdInfo(pump.current_crowd_level || pump.crowd_level || 2);
        const isSelected = selectedPump?._id === pump._id;
        const size = isSelected ? 20 : 14;

        const icon = L.divIcon({
          html: `<div style="width:${size}px;height:${size}px;background:${info.color};border:${isSelected ? 3 : 2}px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.4);transition:all 0.2s"></div>`,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
          className: '',
        });

        const marker = L.marker([pump.latitude, pump.longitude], { icon })
          .addTo(map)
          .bindPopup(
            `<div style="color:#0f172a;min-width:180px">
              <div style="font-weight:700;margin-bottom:4px">${pump.name}</div>
              <div style="font-size:12px;color:#475569;margin-bottom:6px">${pump.address}</div>
              <div style="display:flex;gap:8px;font-size:12px">
                <span style="background:${info.color}22;color:${info.color};padding:2px 8px;border-radius:99px;font-weight:600">${info.label}</span>
                ${pump.distance ? `<span>📍 ${pump.distance} km</span>` : ''}
              </div>
            </div>`
          )
          .on('click', () => onPumpClick?.(pump));

        markersRef.current.push(marker);
      });

      // Pan to selected pump
      if (selectedPump) {
        map.setView([selectedPump.latitude, selectedPump.longitude], 15, { animate: true });
      }
    });
  }, [location, pumps, selectedPump, onPumpClick]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />
      <div ref={mapRef} className="w-full h-full rounded-xl" style={{ minHeight: '300px' }} />

      {/* Legend */}
      <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur rounded-lg p-2 text-xs space-y-1 z-10">
        <div className="flex items-center gap-1.5 text-slate-300">
          <div className="w-3 h-3 rounded-full bg-green-500" /> Low
        </div>
        <div className="flex items-center gap-1.5 text-slate-300">
          <div className="w-3 h-3 rounded-full bg-yellow-500" /> Medium
        </div>
        <div className="flex items-center gap-1.5 text-slate-300">
          <div className="w-3 h-3 rounded-full bg-red-500" /> High
        </div>
      </div>
    </div>
  );
};

export default Map;
