'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { pumps } from '../data/pumps';
import L from 'leaflet';

// Fix for default marker icons not showing in Leaflet with webpack/Next.js
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom pump icon using a div icon for better styling
const createPumpIcon = (status, crowdLevel) => {
  let colorClass = 'bg-zinc-600'; // closed
  if (status === 'open') {
    if (crowdLevel === 'low') colorClass = 'bg-fuel-green';
    else if (crowdLevel === 'medium') colorClass = 'bg-yellow-500';
    else colorClass = 'bg-red-500';
  }

  return L.divIcon({
    className: 'custom-pump-marker',
    html: `
      <div class="relative w-8 h-8 flex items-center justify-center">
        <div class="absolute inset-0 ${colorClass} rounded-full opacity-20 animate-ping"></div>
        <div class="relative w-6 h-6 ${colorClass} rounded-full border-2 border-zinc-900 shadow-lg flex items-center justify-center flex-col">
          <span class="text-[10px]">⛽</span>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

export default function Map() {
  // Center of Delhi
  const center = [28.6139, 77.2090];

  return (
    <div className="w-full h-[400px] lg:h-[500px] rounded-2xl overflow-hidden border border-zinc-800 relative z-0">
      <MapContainer
        center={center}
        zoom={11}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {pumps.map((pump) => (
          <Marker 
            key={pump.id} 
            position={[pump.lat, pump.lng]}
            icon={createPumpIcon(pump.status, pump.crowdLevel)}
          >
            <Popup className="custom-popup">
              <div className="bg-zinc-900 text-white rounded-xl p-1 w-48 border border-zinc-800 custom-popup-content">
                <div className="flex items-start justify-between mb-2 pb-2 border-b border-zinc-800/50">
                  <h3 className="font-semibold text-sm leading-tight text-white">{pump.name}</h3>
                  <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${pump.status === 'open' ? 'bg-fuel-green' : 'bg-red-500'}`}></div>
                </div>
                
                <p className="text-xs text-zinc-400 mb-3 line-clamp-2">{pump.address}</p>
                
                <div className="flex justify-between items-center text-xs mb-3">
                  <div className="flex flex-col">
                    <span className="text-zinc-500 text-[10px] uppercase">Wait</span>
                    <span className="font-medium text-white">{pump.waitingTime}m</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-zinc-500 text-[10px] uppercase">Price</span>
                    <span className="font-medium text-white">₹{pump.price}</span>
                  </div>
                </div>
                
                <a 
                  href={`/pump/${pump.id}`}
                  className="block w-full text-center bg-fuel-green/10 hover:bg-fuel-green/20 text-fuel-green text-xs font-medium py-2 rounded-lg transition-colors border border-fuel-green/20"
                >
                  View Details
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
