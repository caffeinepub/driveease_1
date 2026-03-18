import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  MapPin,
  Navigation,
  RefreshCw,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useNavigate } from "../router";

// Fix leaflet icon
(L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl =
  undefined;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const pickupIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const dropIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const driverIcon = L.divIcon({
  html: '<div style="font-size:26px;line-height:1;">🧑‍✈️</div>',
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

type LatLng = [number, number];

function MapRecenter({ center }: { center: LatLng }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

async function geocodeAddress(address: string): Promise<LatLng | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=in&limit=1`;
    const res = await fetch(url, { headers: { "Accept-Language": "en" } });
    const data = await res.json();
    if (data[0])
      return [Number.parseFloat(data[0].lat), Number.parseFloat(data[0].lon)];
  } catch {
    /* ignore */
  }
  return null;
}

async function fetchRoute(
  from: LatLng,
  to: LatLng,
): Promise<{ coords: LatLng[]; steps: string[] }> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson&steps=true`;
    const res = await fetch(url);
    const data = await res.json();
    const route = data.routes?.[0];
    if (!route) return { coords: [from, to], steps: [] };
    const coords: LatLng[] = route.geometry.coordinates.map(
      (c: [number, number]) => [c[1], c[0]] as LatLng,
    );
    const steps: string[] = [];
    for (const leg of route.legs ?? []) {
      for (const step of leg.steps ?? []) {
        if (step.maneuver?.instruction)
          steps.push(step.maneuver.instruction as string);
        else if (step.name) steps.push(`Continue on ${step.name}`);
      }
    }
    return { coords, steps };
  } catch {
    return { coords: [from, to], steps: [] };
  }
}

export default function DriverNavPage() {
  const navigate = useNavigate();
  const [pickupInput, setPickupInput] = useState("");
  const [dropInput, setDropInput] = useState("");
  const [driverPos, setDriverPos] = useState<LatLng | null>(null);
  const [pickupPos, setPickupPos] = useState<LatLng | null>(null);
  const [dropPos, setDropPos] = useState<LatLng | null>(null);
  const [routeCoords, setRouteCoords] = useState<LatLng[]>([]);
  const [steps, setSteps] = useState<string[]>([]);
  const [activeMode, setActiveMode] = useState<"pickup" | "drop">("pickup");
  const [geoError, setGeoError] = useState("");
  const [loading, setLoading] = useState(false);
  const [arrivedPickup, setArrivedPickup] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setDriverPos([pos.coords.latitude, pos.coords.longitude]);
        setGeoError("");
      },
      () =>
        setGeoError(
          "Please enable location access on your device to use navigation.",
        ),
      { enableHighAccuracy: true, maximumAge: 5000 },
    );
    return () => {
      if (watchIdRef.current !== null)
        navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  const handleLoadRoute = async () => {
    setLoading(true);
    const [pLatLng, dLatLng] = await Promise.all([
      geocodeAddress(`${pickupInput}, India`),
      geocodeAddress(`${dropInput}, India`),
    ]);
    if (pLatLng) setPickupPos(pLatLng);
    if (dLatLng) setDropPos(dLatLng);

    const from: LatLng = driverPos ?? pLatLng ?? [28.6139, 77.209];
    const toPos = activeMode === "pickup" ? pLatLng : dLatLng;
    if (toPos) {
      const { coords, steps: newSteps } = await fetchRoute(from, toPos);
      setRouteCoords(coords);
      setSteps(newSteps);
    }
    setLoading(false);
  };

  const switchMode = async (mode: "pickup" | "drop") => {
    setActiveMode(mode);
    const from = driverPos;
    const toPos = mode === "pickup" ? pickupPos : dropPos;
    if (from && toPos) {
      const { coords, steps: newSteps } = await fetchRoute(from, toPos);
      setRouteCoords(coords);
      setSteps(newSteps);
    }
  };

  const mapCenter: LatLng = driverPos ?? pickupPos ?? [28.6139, 77.209];

  const activePos = activeMode === "pickup" ? pickupPos : dropPos;
  const gmapsUrl = activePos
    ? `https://www.google.com/maps/dir/?api=1&destination=${activePos[0]},${activePos[1]}&travelmode=driving`
    : "https://maps.google.com";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-900 text-white px-4 py-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="p-1 rounded hover:bg-gray-700"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-bold text-lg">Driver Navigation</h1>
          <p className="text-gray-400 text-xs">
            Navigate to pickup and drop locations
          </p>
        </div>
      </div>

      {geoError && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2">
          <AlertCircle size={14} className="text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800">{geoError}</p>
        </div>
      )}

      <div className="bg-white border-b px-4 py-4">
        <div className="max-w-2xl mx-auto space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label
                htmlFor="pickup-input"
                className="text-sm font-medium flex items-center gap-1"
              >
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />{" "}
                Pickup Location
              </Label>
              <Input
                id="pickup-input"
                placeholder="e.g. Connaught Place, Delhi"
                value={pickupInput}
                onChange={(e) => setPickupInput(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label
                htmlFor="drop-input"
                className="text-sm font-medium flex items-center gap-1"
              >
                <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />{" "}
                Drop Location
              </Label>
              <Input
                id="drop-input"
                placeholder="e.g. IGI Airport, Delhi"
                value={dropInput}
                onChange={(e) => setDropInput(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <Button
            onClick={handleLoadRoute}
            disabled={loading || (!pickupInput && !dropInput)}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
          >
            {loading ? (
              <>
                <RefreshCw size={16} className="animate-spin mr-2" /> Loading
                Route...
              </>
            ) : (
              <>
                <MapPin size={16} className="mr-2" /> Load Route on Map
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="bg-white border-b px-4 py-3">
        <div className="max-w-2xl mx-auto flex gap-2">
          <button
            type="button"
            onClick={() => switchMode("pickup")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
              activeMode === "pickup"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <MapPin size={14} /> Navigate to Pickup
          </button>
          <button
            type="button"
            onClick={() => switchMode("drop")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
              activeMode === "drop"
                ? "bg-red-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <MapPin size={14} /> Navigate to Drop
          </button>
        </div>
      </div>

      <div style={{ height: "380px" }}>
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapRecenter center={mapCenter} />
          {routeCoords.length > 1 && (
            <Polyline
              positions={routeCoords}
              color={activeMode === "pickup" ? "#16a34a" : "#dc2626"}
              weight={4}
              opacity={0.8}
            />
          )}
          {driverPos && (
            <Marker position={driverPos} icon={driverIcon}>
              <Popup>You are here</Popup>
            </Marker>
          )}
          {pickupPos && (
            <Marker position={pickupPos} icon={pickupIcon}>
              <Popup>Pickup: {pickupInput}</Popup>
            </Marker>
          )}
          {dropPos && (
            <Marker position={dropPos} icon={dropIcon}>
              <Popup>Drop: {dropInput}</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
        <a
          href={gmapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors text-sm"
        >
          <Navigation size={16} />
          Open in Google Maps
        </a>

        {!arrivedPickup && activeMode === "pickup" && pickupPos && (
          <Button
            className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold"
            onClick={() => {
              setArrivedPickup(true);
              void switchMode("drop");
            }}
          >
            <CheckCircle size={16} className="mr-2" /> I've Arrived at Pickup
          </Button>
        )}

        {arrivedPickup && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-3">
            <CheckCircle size={16} className="text-green-600" />
            <p className="text-sm text-green-800 font-medium">
              Arrived at pickup! Now navigate to drop location.
            </p>
          </div>
        )}

        {steps.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Turn-by-Turn Directions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 max-h-48 overflow-y-auto">
              {steps.map((step, i) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: route steps are positional
                  key={`step-${i}`}
                  className="flex items-start gap-2 py-1 border-b border-gray-100 last:border-0"
                >
                  <span className="text-xs text-gray-400 font-mono w-5 flex-shrink-0 mt-0.5">
                    {i + 1}.
                  </span>
                  <p className="text-xs text-gray-700">{step}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {steps.length === 0 && pickupPos && (
          <div className="text-center py-4 text-gray-400 text-sm">
            Enter pickup and drop locations to see turn-by-turn directions
          </div>
        )}
      </div>
    </div>
  );
}
