import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ArrowLeft, Car, Clock, MapPin, Navigation } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
} from "react-leaflet";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { useNavigate, usePath } from "../router";

// Fix leaflet default icon
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

const carIcon = L.divIcon({
  html: '<div style="font-size:28px;line-height:1;">🚗</div>',
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

type LatLng = [number, number];

interface BookingRecord {
  id: number;
  driverName: string;
  pickupAddress: string;
  dropAddress: string;
  pickupLat?: number;
  pickupLng?: number;
  dropLat?: number;
  dropLng?: number;
  status: string;
}

const DEFAULT_PICKUP: LatLng = [28.6139, 77.209];
const DEFAULT_DROP: LatLng = [28.7041, 77.1025];

export default function TrackingPage() {
  const path = usePath();
  const navigate = useNavigate();
  const bookingId = path.split("/").pop();

  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [routeCoords, setRouteCoords] = useState<LatLng[]>([]);
  const [carPos, setCarPos] = useState<LatLng>(DEFAULT_PICKUP);
  const [carStep, setCarStep] = useState(0);
  const [eta, setEta] = useState(18);
  const [status, setStatus] = useState("En Route to Pickup");
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("driveease_bookings");
      if (stored) {
        const bookings: BookingRecord[] = JSON.parse(stored);
        const found = bookings.find((b) => String(b.id) === String(bookingId));
        if (found) setBooking(found);
      }
    } catch {
      /* ignore */
    }
  }, [bookingId]);

  useEffect(() => {
    const pickupLatLng: LatLng =
      booking?.pickupLat && booking?.pickupLng
        ? [booking.pickupLat, booking.pickupLng]
        : DEFAULT_PICKUP;
    const dropLatLng: LatLng =
      booking?.dropLat && booking?.dropLng
        ? [booking.dropLat, booking.dropLng]
        : DEFAULT_DROP;

    const [plat, plng] = pickupLatLng;
    const [dlat, dlng] = dropLatLng;
    const url = `https://router.project-osrm.org/route/v1/driving/${plng},${plat};${dlng},${dlat}?overview=full&geometries=geojson`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (data.routes?.[0]?.geometry?.coordinates) {
          const coords: LatLng[] = data.routes[0].geometry.coordinates.map(
            (c: [number, number]) => [c[1], c[0]] as LatLng,
          );
          setRouteCoords(coords);
          setCarPos(coords[0]);
          setCarStep(0);
        }
      })
      .catch(() => {
        setRouteCoords([pickupLatLng, dropLatLng]);
        setCarPos(pickupLatLng);
      })
      .finally(() => setLoading(false));
  }, [booking]);

  useEffect(() => {
    if (routeCoords.length < 2) return;
    intervalRef.current = setInterval(() => {
      setCarStep((prev) => {
        const next = prev + 1;
        if (next >= routeCoords.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setStatus("Arrived");
          setEta(0);
          return prev;
        }
        setCarPos(routeCoords[next]);
        const remaining = routeCoords.length - next;
        setEta(Math.max(0, Math.round((remaining / routeCoords.length) * 18)));
        if (next > routeCoords.length / 2) setStatus("En Route to Drop");
        return next;
      });
    }, 2000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [routeCoords]);

  const pickupLatLng: LatLng =
    booking?.pickupLat && booking?.pickupLng
      ? [booking.pickupLat, booking.pickupLng]
      : DEFAULT_PICKUP;
  const dropLatLng: LatLng =
    booking?.dropLat && booking?.dropLng
      ? [booking.dropLat, booking.dropLng]
      : DEFAULT_DROP;

  const progress =
    routeCoords.length > 0
      ? Math.round((carStep / routeCoords.length) * 100)
      : 0;
  const gmapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${pickupLatLng[0]},${pickupLatLng[1]}&destination=${dropLatLng[0]},${dropLatLng[1]}&travelmode=driving`;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-green-700 text-white px-4 py-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="p-1 rounded hover:bg-green-600"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-bold text-lg">Track Your Ride</h1>
          <p className="text-green-200 text-xs">Booking #{bookingId}</p>
        </div>
      </div>

      <div className="bg-white border-b px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Car size={20} className="text-green-700" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">
                {booking?.driverName ?? "Your Driver"}
              </p>
              <p className="text-xs text-green-600 font-medium">{status}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="flex items-center gap-1 text-gray-600">
                <Clock size={14} />
                <span className="text-sm font-bold">{eta} min</span>
              </div>
              <p className="text-xs text-gray-400">ETA</p>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-green-700">
                {progress}%
              </div>
              <p className="text-xs text-gray-400">Progress</p>
            </div>
          </div>
        </div>
        <div className="max-w-2xl mx-auto mt-2 bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-green-600 h-1.5 rounded-full transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="relative" style={{ height: "420px" }}>
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-500">Loading map...</p>
            </div>
          </div>
        ) : (
          <MapContainer
            center={pickupLatLng}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {routeCoords.length > 1 && (
              <Polyline
                positions={routeCoords}
                color="#16a34a"
                weight={4}
                opacity={0.7}
              />
            )}
            <Marker position={pickupLatLng} icon={pickupIcon}>
              <Popup>
                Pickup: {booking?.pickupAddress ?? "Pickup Location"}
              </Popup>
            </Marker>
            <Marker position={dropLatLng} icon={dropIcon}>
              <Popup>Drop: {booking?.dropAddress ?? "Drop Location"}</Popup>
            </Marker>
            <Marker position={carPos} icon={carIcon}>
              <Popup>Your driver is here</Popup>
            </Marker>
          </MapContainer>
        )}
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-green-200">
            <CardContent className="pt-3 pb-3">
              <div className="flex items-start gap-2">
                <MapPin
                  size={14}
                  className="text-green-600 mt-0.5 flex-shrink-0"
                />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Pickup</p>
                  <p className="text-xs text-gray-800 mt-0.5">
                    {booking?.pickupAddress ?? "Pickup location"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-200">
            <CardContent className="pt-3 pb-3">
              <div className="flex items-start gap-2">
                <MapPin
                  size={14}
                  className="text-red-500 mt-0.5 flex-shrink-0"
                />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Drop</p>
                  <p className="text-xs text-gray-800 mt-0.5">
                    {booking?.dropAddress ?? "Drop location"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <a
          href={gmapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          <Navigation size={16} />
          View Route on Google Maps
        </a>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate("/")}
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
}
