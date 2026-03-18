import { useCallback, useEffect, useId, useRef } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface MapPickerProps {
  label: string;
  value: string;
  lat: number | null;
  lng: number | null;
  onChange: (address: string, lat: number, lng: number) => void;
}

function loadLeaflet(): Promise<any> {
  return new Promise((resolve, reject) => {
    if ((window as any).L) {
      resolve((window as any).L);
      return;
    }
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => resolve((window as any).L);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export default function MapPicker({
  label,
  value,
  lat,
  lng,
  onChange,
}: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const initialLatRef = useRef(lat ?? 18.9388);
  const initialLngRef = useRef(lng ?? 72.8354);
  const uid = useId().replace(/:/g, "-");

  const reverseGeocode = useCallback(async (lt: number, ln: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lt}&lon=${ln}`,
      );
      const data = await res.json();
      const address = data.display_name || `${lt.toFixed(5)}, ${ln.toFixed(5)}`;
      onChangeRef.current(address, lt, ln);
    } catch {
      onChangeRef.current(`${lt.toFixed(5)}, ${ln.toFixed(5)}`, lt, ln);
    }
  }, []);

  useEffect(() => {
    const startLat = initialLatRef.current;
    const startLng = initialLngRef.current;

    loadLeaflet().then((L) => {
      if (!mapRef.current || mapInstanceRef.current) return;

      const map = L.map(mapRef.current).setView([startLat, startLng], 12);
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "\u00a9 OpenStreetMap contributors",
      }).addTo(map);

      const marker = L.marker([startLat, startLng], {
        draggable: true,
      }).addTo(map);
      markerRef.current = marker;

      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        reverseGeocode(pos.lat, pos.lng);
      });

      map.on("click", (e: any) => {
        marker.setLatLng(e.latlng);
        reverseGeocode(e.latlng.lat, e.latlng.lng);
      });
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [reverseGeocode]);

  useEffect(() => {
    if (markerRef.current && lat !== null && lng !== null) {
      markerRef.current.setLatLng([lat, lng]);
      mapInstanceRef.current?.setView([lat, lng], 14);
    }
  }, [lat, lng]);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div
        id={uid}
        ref={mapRef}
        style={{
          height: "220px",
          width: "100%",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          zIndex: 0,
        }}
      />
      <Input
        value={value}
        onChange={(e) => {
          onChange(e.target.value, lat ?? 0, lng ?? 0);
        }}
        placeholder={`Type ${label.toLowerCase()} manually`}
        className="text-sm"
      />
    </div>
  );
}
