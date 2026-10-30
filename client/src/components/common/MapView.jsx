import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { siteConfig } from '@/config/site';
import { MapPin, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Custom SVG DivIcon using accent color and barber shears motif
 */
const accentPinIcon = L.divIcon({
  className: 'custom-accent-pin',
  html: `
    <div style="position:relative;width:34px;height:42px;transform:translate(-17px,-42px);filter:drop-shadow(0 4px 6px rgba(0,0,0,0.5));">
      <svg width="34" height="42" viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0C5.372 0 0 5.372 0 12C0 20.25 12 30 12 30C12 30 24 20.25 24 12C24 5.372 18.628 0 12 0Z" fill="#F9A55A"/>
        <circle cx="12" cy="11" r="5.5" fill="#14100E"/>
        <circle cx="12" cy="11" r="2.5" fill="#FFFFFF"/>
      </svg>
    </div>
  `,
  iconSize: [34, 42],
  iconAnchor: [17, 42],
  popupAnchor: [0, -38],
});

/**
 * Controller to toggle scrollWheelZoom only while the map container is focused
 */
function ScrollWheelController({ isFocused }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    if (isFocused) {
      map.scrollWheelZoom.enable();
    } else {
      map.scrollWheelZoom.disable();
    }
  }, [isFocused, map]);

  return null;
}

/**
 * Interactive tinted MapView with custom pin, muted brown tiles, and external directions
 *
 * @param {Object} props
 * @param {string} [props.className]
 * @param {string} [props.directionsLabel='Get directions']
 * @returns {JSX.Element}
 */
export function MapView({ className = '', directionsLabel = 'Get directions' }) {
  const [isFocused, setIsFocused] = useState(false);
  const { lat, lng, zoom } = siteConfig.location;

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  const mapLabel = `Interactive map showing location of ${siteConfig.name} at ${siteConfig.address}`;

  return (
    <div
      className={cn(
        'relative w-full rounded-lg overflow-hidden border border-border-dark bg-ink/80 shadow-2xl flex flex-col',
        'aspect-[16/10] lg:aspect-[4/5]',
        className
      )}
      role="region"
      aria-label={mapLabel}
      onFocusCapture={() => setIsFocused(true)}
      onBlurCapture={() => setIsFocused(false)}
    >
      <div className="vintage-map-tiles relative w-full h-full">
        <MapContainer
          center={[lat, lng]}
          zoom={zoom || 15}
          zoomControl={false}
          scrollWheelZoom={false}
          attributionControl={false}
          className="h-full w-full z-0 outline-none"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <Marker position={[lat, lng]} icon={accentPinIcon}>
            <Popup className="font-body text-xs">
              <div className="font-display text-base font-bold text-ink uppercase">
                {siteConfig.name}
              </div>
              <p className="text-muted mt-0.5">{siteConfig.address}</p>
            </Popup>
          </Marker>
          <ScrollWheelController isFocused={isFocused} />
        </MapContainer>

        {/* Focus Hint Overlay when not focused */}
        {!isFocused && (
          <div className="pointer-events-none absolute top-3 left-3 z-10 hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-ink/80 text-[11px] text-white/70 backdrop-blur-sm border border-border-dark">
            <span>Click or focus to zoom</span>
          </div>
        )}

        {/* Visible Get Directions Pill */}
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-pill bg-ink/90 text-white hover:text-accent text-xs font-semibold uppercase tracking-wider backdrop-blur-md border border-border-dark shadow-md transition-all duration-fast hover:scale-105"
        >
          <MapPin className="h-3.5 w-3.5 text-accent" />
          <span>{directionsLabel}</span>
          <ExternalLink className="h-3 w-3 opacity-70" />
        </a>
      </div>
    </div>
  );
}

export default MapView;
