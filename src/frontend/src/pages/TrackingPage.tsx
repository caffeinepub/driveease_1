import {
  AlertCircle,
  ArrowLeft,
  Car,
  Clock,
  MapPin,
  Navigation,
  Phone,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { useNavigate, usePath } from "../router";

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

const DEFAULT_PICKUP_LAT = 28.6139;
const DEFAULT_PICKUP_LNG = 77.209;
const DEFAULT_DROP_LAT = 28.7041;
const DEFAULT_DROP_LNG = 77.1025;

export default function TrackingPage() {
  const path = usePath();
  const navigate = useNavigate();
  const bookingId = path.split("/").pop();

  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [eta, setEta] = useState(18);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("En Route to Pickup");
  const [sosOpen, setSosOpen] = useState(false);

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

  // Simulate progress
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(prev + 2, 100);
        setEta(Math.max(0, Math.round(18 - (next / 100) * 18)));
        if (next > 50) setStatus("En Route to Drop");
        if (next >= 100) setStatus("Arrived");
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const pickupLat = booking?.pickupLat ?? DEFAULT_PICKUP_LAT;
  const pickupLng = booking?.pickupLng ?? DEFAULT_PICKUP_LNG;
  const dropLat = booking?.dropLat ?? DEFAULT_DROP_LAT;
  const dropLng = booking?.dropLng ?? DEFAULT_DROP_LNG;

  const gmapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${pickupLat},${pickupLng}&destination=${dropLat},${dropLng}&travelmode=driving`;
  const mapEmbedUrl = `https://www.google.com/maps/embed/v1/directions?key=AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY&origin=${pickupLat},${pickupLng}&destination=${dropLat},${dropLng}&mode=driving`;

  const sosNumbers = [
    { label: "Emergency / Police", number: "112", icon: "🚨" },
    { label: "Ambulance", number: "108", icon: "🚑" },
    { label: "Police", number: "100", icon: "👮" },
  ];

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
        <div className="flex-1">
          <h1 className="font-bold text-lg">Track Your Ride</h1>
          <p className="text-green-200 text-xs">Booking #{bookingId}</p>
        </div>
        {/* SOS Button */}
        <button
          type="button"
          onClick={() => setSosOpen(true)}
          className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors shadow-lg"
          data-ocid="tracking.primary_button"
        >
          <AlertCircle size={16} />
          SOS
        </button>
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

      {/* Map */}
      <div style={{ height: "420px" }}>
        <iframe
          title="Route Map"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          src={mapEmbedUrl}
        />
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

      {/* SOS Modal */}
      {sosOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          data-ocid="tracking.modal"
        >
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="bg-red-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <AlertCircle size={22} />
                <h2 className="text-lg font-bold">Emergency SOS</h2>
              </div>
              <button
                type="button"
                onClick={() => setSosOpen(false)}
                className="text-white hover:text-red-200"
                data-ocid="tracking.close_button"
              >
                <X size={20} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-3">
              <p className="text-gray-600 text-sm">
                Tap to call emergency services immediately:
              </p>
              {sosNumbers.map((s) => (
                <a
                  key={s.number}
                  href={`tel:${s.number}`}
                  className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-4 py-3 hover:bg-red-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{s.icon}</span>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {s.label}
                      </p>
                      <p className="text-red-600 font-bold text-lg">
                        {s.number}
                      </p>
                    </div>
                  </div>
                  <Phone size={18} className="text-red-500" />
                </a>
              ))}
              <div className="pt-1">
                <a
                  href="https://wa.me/917836887228?text=EMERGENCY%3A+I+need+help+with+my+DriveEase+ride!"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors"
                  data-ocid="tracking.secondary_button"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5"
                    aria-label="WhatsApp"
                  >
                    <title>WhatsApp</title>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp Support: +91-7836887228
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
