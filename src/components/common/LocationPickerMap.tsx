import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MapPin,
  Search,
  Crosshair,
  ExternalLink,
  Copy,
  Check,
  Compass,
  Loader2,
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix standard Leaflet default icon paths in bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Gymon SVG Marker for Leaflet
const gymPinIcon = L.divIcon({
  className: 'gymon-map-marker',
  html: `
    <div style="position: relative; width: 38px; height: 38px; cursor: pointer; transform: translate(-19px, -38px);">
      <div style="position: absolute; bottom: 0; left: 50%; width: 14px; height: 6px; transform: translateX(-50%); background: rgba(0,0,0,0.3); border-radius: 50%; filter: blur(1.5px);"></div>
      <svg viewBox="0 0 24 24" width="38" height="38" style="filter: drop-shadow(0 3px 6px rgba(0,0,0,0.35));">
        <path d="M12 0C7.58 0 4 3.58 4 8c0 5.4 7.2 13.2 7.55 13.6.24.26.65.26.89 0C12.8 21.2 20 13.4 20 8c0-4.42-3.58-8-8-8z" fill="#00A389" stroke="#ffffff" stroke-width="1.5" />
        <circle cx="12" cy="8" r="3.2" fill="#ffffff" />
      </svg>
    </div>
  `,
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});

export interface LocationPickerMapProps {
  latitude: number | string;
  longitude: number | string;
  address?: string;
  city?: string;
  onLocationChange: (coords: {
    latitude: string;
    longitude: string;
    address?: string;
    city?: string;
  }) => void;
  label?: string;
  helperText?: string;
}

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    suburb?: string;
    road?: string;
    state?: string;
  };
}

// Default center: Bangalore, India
const DEFAULT_LAT = 12.9716;
const DEFAULT_LNG = 77.5946;

declare global {
  interface Window {
    google?: any;
    initGoogleMapsCallback?: () => void;
  }
}

export const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  latitude,
  longitude,
  address,
  city,
  onLocationChange,
  label = 'Geographic Location (Select on Google Map)',
  helperText = 'Click anywhere on the map or drag the pin to set your exact gym entrance.',
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Engine state: 'google' or 'leaflet'
  const [engine, setEngine] = useState<'google' | 'leaflet'>('leaflet');

  // Leaflet references
  const leafletMapRef = useRef<L.Map | null>(null);
  const leafletMarkerRef = useRef<L.Marker | null>(null);

  // Google Maps references
  const googleMapRef = useRef<any>(null);
  const googleMarkerRef = useRef<any>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResultsDropdown, setShowResultsDropdown] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [reverseGeocoding, setReverseGeocoding] = useState(false);
  const [detectedAddress, setDetectedAddress] = useState<string | null>(null);
  const [detectedCity, setDetectedCity] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Parse numeric lat/lng safely
  const parsedLat =
    latitude !== '' && !isNaN(Number(latitude)) ? Number(latitude) : null;
  const parsedLng =
    longitude !== '' && !isNaN(Number(longitude)) ? Number(longitude) : null;

  const currentLat = parsedLat ?? DEFAULT_LAT;
  const currentLng = parsedLng ?? DEFAULT_LNG;
  const hasCoordinates = parsedLat !== null && parsedLng !== null;

  const googleApiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined)?.trim();

  // Reverse geocode to get road/locality/city
  const reverseGeocodeCoordinates = useCallback(async (lat: number, lng: number) => {
    setReverseGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en',
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (data && data.address) {
          const fetchedCity =
            data.address.city ||
            data.address.town ||
            data.address.suburb ||
            data.address.county ||
            data.address.state_district ||
            '';

          const formattedAddress = [
            data.address.amenity || data.address.building || data.address.shop || '',
            data.address.road || '',
            data.address.suburb || data.address.neighbourhood || '',
            data.address.postcode ? `PIN: ${data.address.postcode}` : '',
          ]
            .filter(Boolean)
            .join(', ') || data.display_name;

          setDetectedAddress(formattedAddress);
          setDetectedCity(fetchedCity);
          setStatusMessage(`Location identified: ${fetchedCity || 'Pin updated'}`);
        }
      }
    } catch {
      // Ignore network fail in reverse geocoding
    } finally {
      setReverseGeocoding(false);
    }
  }, []);

  const handleCoordinatesSelected = useCallback((
    lat: number,
    lng: number,
    triggerReverseGeocode: boolean = true
  ) => {
    const latStr = lat.toFixed(6);
    const lngStr = lng.toFixed(6);

    onLocationChange({
      latitude: latStr,
      longitude: lngStr,
    });

    if (triggerReverseGeocode) {
      reverseGeocodeCoordinates(lat, lng);
    }
  }, [onLocationChange, reverseGeocodeCoordinates]);

  // Check and initialize Google Maps or fallback to Leaflet
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (googleApiKey && typeof window !== 'undefined') {
      const loadGoogleMaps = () => {
        if (window.google?.maps) {
          initGoogleMap();
          return;
        }

        const existingScript = document.getElementById('google-maps-script');
        if (!existingScript) {
          const script = document.createElement('script');
          script.id = 'google-maps-script';
          script.src = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&libraries=places`;
          script.async = true;
          script.onload = () => {
            initGoogleMap();
          };
          script.onerror = () => {
            initLeafletMap();
          };
          document.head.appendChild(script);
        } else {
          existingScript.addEventListener('load', initGoogleMap);
        }
      };

      loadGoogleMaps();
    } else {
      initLeafletMap();
    }

    function initGoogleMap() {
      if (!mapContainerRef.current || !window.google?.maps) {
        initLeafletMap();
        return;
      }
      setEngine('google');

      const mapOptions = {
        center: { lat: currentLat, lng: currentLng },
        zoom: hasCoordinates ? 16 : 13,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
      };

      const gMap = new window.google.maps.Map(mapContainerRef.current, mapOptions);
      googleMapRef.current = gMap;

      const marker = new window.google.maps.Marker({
        position: { lat: currentLat, lng: currentLng },
        map: gMap,
        draggable: true,
        title: 'Gym Location',
        animation: window.google.maps.Animation.DROP,
      });
      googleMarkerRef.current = marker;

      marker.addListener('dragend', () => {
        const pos = marker.getPosition();
        if (pos) {
          handleCoordinatesSelected(pos.lat(), pos.lng(), true);
        }
      });

      gMap.addListener('click', (e: any) => {
        if (e.latLng) {
          marker.setPosition(e.latLng);
          handleCoordinatesSelected(e.latLng.lat(), e.latLng.lng(), true);
        }
      });

      // Google Places Autocomplete if search input exists
      if (searchInputRef.current && window.google.maps.places) {
        const autocomplete = new window.google.maps.places.Autocomplete(searchInputRef.current);
        autocomplete.bindTo('bounds', gMap);
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place.geometry && place.geometry.location) {
            gMap.setCenter(place.geometry.location);
            gMap.setZoom(16);
            marker.setPosition(place.geometry.location);
            handleCoordinatesSelected(
              place.geometry.location.lat(),
              place.geometry.location.lng(),
              true
            );
            setSearchQuery('');
          }
        });
      }
    }

    function initLeafletMap() {
      if (!mapContainerRef.current) return;
      setEngine('leaflet');

      if (!leafletMapRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [currentLat, currentLng],
          zoom: hasCoordinates ? 15 : 12,
          zoomControl: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap | Google Maps data',
          maxZoom: 19,
        }).addTo(map);

        const marker = L.marker([currentLat, currentLng], {
          icon: gymPinIcon,
          draggable: true,
        }).addTo(map);

        marker.on('dragend', () => {
          const position = marker.getLatLng();
          handleCoordinatesSelected(position.lat, position.lng, true);
        });

        map.on('click', (e: L.LeafletMouseEvent) => {
          marker.setLatLng(e.latlng);
          handleCoordinatesSelected(e.latlng.lat, e.latlng.lng, true);
        });

        leafletMapRef.current = map;
        leafletMarkerRef.current = marker;

        setTimeout(() => {
          map.invalidateSize();
        }, 200);
      } else {
        const map = leafletMapRef.current;
        const marker = leafletMarkerRef.current;
        if (marker && (marker.getLatLng().lat !== currentLat || marker.getLatLng().lng !== currentLng)) {
          marker.setLatLng([currentLat, currentLng]);
          if (hasCoordinates) {
            map.setView([currentLat, currentLng], Math.max(map.getZoom(), 14));
          }
        }
      }
    }
  }, [googleApiKey, currentLat, currentLng, hasCoordinates, handleCoordinatesSelected]);

  // Synchronize pin position when parent latitude/longitude change
  useEffect(() => {
    if (engine === 'google' && googleMarkerRef.current && googleMapRef.current) {
      const pos = googleMarkerRef.current.getPosition();
      if (pos && (pos.lat() !== currentLat || pos.lng() !== currentLng)) {
        const newLatLng = new window.google.maps.LatLng(currentLat, currentLng);
        googleMarkerRef.current.setPosition(newLatLng);
        googleMapRef.current.panTo(newLatLng);
      }
    } else if (engine === 'leaflet' && leafletMarkerRef.current && leafletMapRef.current) {
      const currentMarkerPos = leafletMarkerRef.current.getLatLng();
      if (currentMarkerPos.lat !== currentLat || currentMarkerPos.lng !== currentLng) {
        leafletMarkerRef.current.setLatLng([currentLat, currentLng]);
        if (hasCoordinates) {
          leafletMapRef.current.panTo([currentLat, currentLng]);
        }
      }
    }
  }, [currentLat, currentLng, hasCoordinates, engine]);

  // Search location / address / landmark or parse Google Maps link
  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    // Check if query is raw coordinates e.g. "12.9716, 77.5946" or "12.9716 77.5946"
    const coordMatch = query.match(/^(-?\d+(\.\d+)?)[,\s]+(-?\d+(\.\d+)?)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[3]);
      if (!isNaN(lat) && !isNaN(lng)) {
        applyCoordinates(lat, lng);
        setSearchQuery('');
        return;
      }
    }

    // Check if query is a Google Maps URL e.g. "https://www.google.com/maps/@12.9716,77.5946,15z"
    const gmapsCoordMatch = query.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (gmapsCoordMatch) {
      const lat = parseFloat(gmapsCoordMatch[1]);
      const lng = parseFloat(gmapsCoordMatch[2]);
      if (!isNaN(lat) && !isNaN(lng)) {
        applyCoordinates(lat, lng);
        setSearchQuery('');
        return;
      }
    }

    // Geocode via Nominatim search
    setIsSearching(true);
    setStatusMessage('Searching location...');
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&addressdetails=1&limit=5`,
        {
          headers: {
            'Accept-Language': 'en',
          },
        }
      );
      if (res.ok) {
        const results: SearchResult[] = await res.json();
        setSearchResults(results);
        setShowResultsDropdown(results.length > 0);
        if (results.length === 0) {
          setStatusMessage('No matching location found. Try searching by landmark, area, or pincode.');
        } else {
          setStatusMessage(null);
        }
      }
    } catch {
      setStatusMessage('Unable to complete search. Check your internet connection.');
    } finally {
      setIsSearching(false);
    }
  };

  const applyCoordinates = (lat: number, lng: number, placeName?: string, detectedCityName?: string) => {
    if (engine === 'google' && googleMapRef.current && googleMarkerRef.current) {
      const pos = new window.google.maps.LatLng(lat, lng);
      googleMapRef.current.setCenter(pos);
      googleMapRef.current.setZoom(16);
      googleMarkerRef.current.setPosition(pos);
    } else if (leafletMapRef.current && leafletMarkerRef.current) {
      leafletMapRef.current.setView([lat, lng], 16);
      leafletMarkerRef.current.setLatLng([lat, lng]);
    }

    const latStr = lat.toFixed(6);
    const lngStr = lng.toFixed(6);

    onLocationChange({
      latitude: latStr,
      longitude: lngStr,
      address: placeName || address,
      city: detectedCityName || city,
    });

    if (placeName) setDetectedAddress(placeName);
    if (detectedCityName) setDetectedCity(detectedCityName);
    setShowResultsDropdown(false);
    setStatusMessage(`Selected: ${placeName ? placeName.split(',')[0] : `${latStr}, ${lngStr}`}`);
  };

  // Browser Geolocation (Use Current Location)
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    setStatusMessage('Detecting your GPS location...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        applyCoordinates(lat, lng);
        reverseGeocodeCoordinates(lat, lng);
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        let errorMsg = 'Could not access device location.';
        if (err.code === 1) errorMsg = 'Location permission denied by browser.';
        else if (err.code === 2) errorMsg = 'Location unavailable.';
        else if (err.code === 3) errorMsg = 'Location request timed out.';
        setStatusMessage(errorMsg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Apply detected address to form fields
  const handleApplyDetectedAddress = () => {
    if (!detectedAddress && !detectedCity) return;
    onLocationChange({
      latitude: currentLat.toFixed(6),
      longitude: currentLng.toFixed(6),
      address: detectedAddress || address,
      city: detectedCity || city,
    });
    setStatusMessage('Address & City fields updated from map!');
  };

  // Copy coordinates to clipboard
  const handleCopyCoords = () => {
    navigator.clipboard.writeText(`${currentLat.toFixed(6)}, ${currentLng.toFixed(6)}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${currentLat},${currentLng}`;

  return (
    <div className="space-y-3">
      {/* Header with Title and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
          <Compass className="h-4 w-4 text-[#00A389]" />
          <span>{label}</span>
          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full ml-1">
            {engine === 'google' ? 'Google Maps' : 'Interactive Map'}
          </span>
        </label>

        <div className="flex items-center space-x-2">
          {/* Use Current GPS Location */}
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={isLocating}
            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100/90 text-[#00A389] border border-teal-200 text-[11px] font-bold transition-all cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50"
            title="Use your phone or computer GPS location"
          >
            {isLocating ? (
              <Loader2 className="h-3 w-3 animate-spin text-[#00A389]" />
            ) : (
              <Crosshair className="h-3 w-3 text-[#00A389]" />
            )}
            <span>{isLocating ? 'Locating...' : 'My Location'}</span>
          </button>

          {/* Open in Google Maps */}
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200 text-[11px] font-semibold transition-all cursor-pointer shadow-2xs"
            title="View selected coordinates on Google Maps in a new tab"
          >
            <ExternalLink className="h-3 w-3 text-slate-500" />
            <span>Google Maps</span>
          </a>
        </div>
      </div>

      <p className="text-[11px] text-slate-500">{helperText}</p>

      {/* Search & Address Bar */}
      <div className="relative">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-1.5">
          <div className="relative flex-1">
            <Search className="h-3.5 w-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search gym area, street, landmark, or paste Google Maps link..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00A389]/20 focus:border-[#00A389]"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="px-3.5 py-2 bg-[#00A389] hover:bg-[#008f78] text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-sm flex items-center space-x-1"
          >
            {isSearching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <span>Search</span>}
          </button>
        </form>

        {/* Search Results Dropdown */}
        {showResultsDropdown && searchResults.length > 0 && (
          <div className="absolute z-1000 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
            <div className="p-1.5 border-b border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3">
              <span>Select Matching Location</span>
              <button
                type="button"
                onClick={() => setShowResultsDropdown(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                Close
              </button>
            </div>
            {searchResults.map((result, idx) => {
              const resCity =
                result.address?.city ||
                result.address?.town ||
                result.address?.suburb ||
                result.address?.state ||
                '';
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() =>
                    applyCoordinates(
                      parseFloat(result.lat),
                      parseFloat(result.lon),
                      result.display_name,
                      resCity
                    )
                  }
                  className="w-full text-left px-3.5 py-2.5 hover:bg-teal-50/60 border-b border-slate-100/60 last:border-b-0 transition-colors flex items-start space-x-2"
                >
                  <MapPin className="h-4 w-4 text-[#00A389] shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-800 truncate">
                      {result.display_name.split(',')[0]}
                    </p>
                    <p className="text-[10px] text-slate-500 line-clamp-1">{result.display_name}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100">
        <div
          ref={mapContainerRef}
          className="w-full h-72 sm:h-80 z-0"
          style={{ minHeight: '280px' }}
        />

        {/* Overlay Pin Information Pill */}
        <div className="absolute top-3 right-3 z-500 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-md flex items-center space-x-2 text-[11px] font-mono font-bold text-slate-800">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00A389] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00A389]"></span>
          </span>
          <span>
            {currentLat.toFixed(5)}, {currentLng.toFixed(5)}
          </span>
          <button
            type="button"
            onClick={handleCopyCoords}
            className="p-1 hover:bg-slate-100 rounded text-slate-500 transition-colors"
            title="Copy coordinates"
          >
            {copied ? (
              <Check className="h-3 w-3 text-emerald-600" />
            ) : (
              <Copy className="h-3 w-3 text-slate-400" />
            )}
          </button>
        </div>

        {/* Bottom Banner inside Map */}
        <div className="absolute bottom-2 left-2 z-500 bg-slate-900/80 backdrop-blur-xs text-white px-2.5 py-1 rounded-lg text-[10px] font-medium flex items-center space-x-1.5 shadow">
          <span>Click anywhere or drag marker to reposition</span>
        </div>
      </div>

      {/* Status or Detected Address Alert Banner */}
      {(statusMessage || detectedAddress) && (
        <div className="p-3 bg-teal-50/70 border border-teal-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-start space-x-2 min-w-0">
            {reverseGeocoding ? (
              <Loader2 className="h-4 w-4 text-[#00A389] animate-spin shrink-0 mt-0.5" />
            ) : (
              <MapPin className="h-4 w-4 text-[#00A389] shrink-0 mt-0.5" />
            )}
            <div className="text-[11px]">
              <span className="font-bold text-teal-900">
                {detectedCity ? `${detectedCity}: ` : 'Selected: '}
              </span>
              <span className="text-teal-800 line-clamp-1">
                {detectedAddress || statusMessage}
              </span>
            </div>
          </div>

          {detectedAddress && (
            <button
              type="button"
              onClick={handleApplyDetectedAddress}
              className="shrink-0 px-2.5 py-1 bg-[#00A389] hover:bg-[#008f78] text-white text-[10px] font-bold rounded-lg transition-all shadow-2xs"
            >
              Update Form Address
            </button>
          )}
        </div>
      )}

      {/* Manual Input Override / Precision Adjustment */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="space-y-1">
          <label className="block text-[11px] font-bold text-slate-600 flex items-center justify-between">
            <span>Latitude</span>
            <span className="text-[10px] font-normal text-slate-400">Decimal degrees</span>
          </label>
          <input
            type="number"
            step="any"
            value={latitude}
            onChange={(e) => {
              const val = e.target.value;
              onLocationChange({
                latitude: val,
                longitude: String(longitude),
              });
            }}
            placeholder="12.9716"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00A389]/20 focus:border-[#00A389]"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-[11px] font-bold text-slate-600 flex items-center justify-between">
            <span>Longitude</span>
            <span className="text-[10px] font-normal text-slate-400">Decimal degrees</span>
          </label>
          <input
            type="number"
            step="any"
            value={longitude}
            onChange={(e) => {
              const val = e.target.value;
              onLocationChange({
                latitude: String(latitude),
                longitude: val,
              });
            }}
            placeholder="77.5946"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00A389]/20 focus:border-[#00A389]"
          />
        </div>
      </div>
    </div>
  );
};
