import { useEffect, useRef } from "react";
import { LOCATIONIQ_TILE_URL, MAPS_API_KEY } from "../config/apiConfig";

export type LatLng = [number, number];

interface RouteMapProps {
  pickup?: LatLng;
  drop?: LatLng;
  driver?: LatLng;
  height?: number;
  /** When true, auto-fetch route polyline from OSRM */
  showRoute?: boolean;
}

// Leaflet loaded via CDN
declare const L: any;

async function loadLeaflet(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof L !== "undefined") {
      resolve();
      return;
    }
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    if (document.getElementById("leaflet-js")) {
      const check = setInterval(() => {
        if (typeof L !== "undefined") {
          clearInterval(check);
          resolve();
        }
      }, 50);
      return;
    }
    const script = document.createElement("script");
    script.id = "leaflet-js";
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
}

async function fetchRoutePolyline(from: LatLng, to: LatLng): Promise<LatLng[]> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();
    const coords = data.routes?.[0]?.geometry?.coordinates as
      | [number, number][]
      | undefined;
    if (!coords) return [];
    return coords.map(([lng, lat]) => [lat, lng] as LatLng);
  } catch {
    return [];
  }
}

export default function RouteMap({
  pickup,
  drop,
  driver,
  height = 400,
  showRoute = true,
}: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let destroyed = false;

    loadLeaflet().then(() => {
      if (destroyed || !containerRef.current) return;

      // Fix marker icons
      if (L.Icon?.Default?.prototype) {
        (L.Icon.Default.prototype as any)._getIconUrl = undefined;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });
      }

      const center: LatLng = pickup ?? drop ?? driver ?? [20.5937, 78.9629];
      const map = L.map(containerRef.current, {
        center,
        zoom: 12,
        zoomControl: true,
      });
      mapRef.current = map;

      // Use LocationIQ tiles with fallback to OSM
      try {
        L.tileLayer(LOCATIONIQ_TILE_URL, {
          attribution:
            '&copy; <a href="https://locationiq.com">LocationIQ</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);
      } catch {
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);
      }

      const addMarker = (pos: LatLng, color: string, title: string) => {
        const icon = L.divIcon({
          html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.4)"></div>`,
          className: "",
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });
        return L.marker(pos, { icon, title }).addTo(map);
      };

      const bounds: LatLng[] = [];

      if (pickup) {
        addMarker(pickup, "#22c55e", "Pickup").bindPopup("📍 Pickup");
        bounds.push(pickup);
      }
      if (drop) {
        addMarker(drop, "#ef4444", "Drop").bindPopup("🏁 Drop");
        bounds.push(drop);
      }
      if (driver) {
        addMarker(driver, "#3b82f6", "Driver").bindPopup("🚗 Driver");
        bounds.push(driver);
      }

      if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [40, 40] });
      }

      if (showRoute && pickup && drop) {
        fetchRoutePolyline(pickup, drop).then((pts) => {
          if (pts.length > 0 && mapRef.current) {
            L.polyline(pts, {
              color: "#22c55e",
              weight: 5,
              opacity: 0.8,
            }).addTo(mapRef.current);
          }
        });
      } else if (showRoute && driver && (pickup || drop)) {
        const dest = pickup ?? drop!;
        fetchRoutePolyline(driver, dest).then((pts) => {
          if (pts.length > 0 && mapRef.current) {
            L.polyline(pts, {
              color: "#3b82f6",
              weight: 5,
              opacity: 0.8,
            }).addTo(mapRef.current);
          }
        });
      }
    });

    return () => {
      destroyed = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [pickup, drop, driver, showRoute]);

  return (
    <div ref={containerRef} style={{ height, width: "100%" }} className="z-0" />
  );
}

// Export the key for use in other components
export { MAPS_API_KEY };
