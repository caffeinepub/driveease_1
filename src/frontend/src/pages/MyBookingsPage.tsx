import { AlertCircle, CheckCircle, Clock, Shield, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import type { Booking } from "../backend";
import { BookingStatus } from "../backend";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { seedDrivers } from "../data/drivers";
import { useActor } from "../hooks/useActor";
import { Link } from "../router";

export default function MyBookingsPage() {
  const { actor } = useActor();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (actor) {
      actor
        .getBookingsByCustomer()
        .then(setBookings)
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [actor]);

  const handleSOS = async (id: bigint) => {
    if (!actor) return;
    try {
      await actor.markSosForBooking(id);
      alert(
        "SOS sent! Emergency services have been notified. Also call 108 for ambulance.",
      );
    } catch {
      alert("Failed to send SOS. Please call 108 directly.");
    }
  };

  const statusBadge = (status: BookingStatus) => {
    if (status === BookingStatus.confirmed)
      return (
        <Badge className="bg-green-100 text-green-700">
          <CheckCircle size={10} className="mr-1" />
          Confirmed
        </Badge>
      );
    if (status === BookingStatus.cancelled)
      return (
        <Badge className="bg-red-100 text-red-700">
          <XCircle size={10} className="mr-1" />
          Cancelled
        </Badge>
      );
    return (
      <Badge className="bg-yellow-100 text-yellow-700">
        <Clock size={10} className="mr-1" />
        Pending
      </Badge>
    );
  };

  if (loading)
    return (
      <div className="text-center py-20 text-gray-500">
        Loading your bookings...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Bookings</h1>
        {bookings.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500">No bookings yet.</p>
            <Link to="/drivers" className="text-green-600 underline mt-2 block">
              Find a driver
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => {
              const driver = seedDrivers.find(
                (d) => d.id === Number(b.driverId),
              );
              return (
                <Card key={b.id.toString()} className="shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        Booking #{b.id.toString()}
                      </CardTitle>
                      {statusBadge(b.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Driver</span>
                      <span className="font-medium">
                        {driver?.name ?? `Driver #${b.driverId}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Route</span>
                      <span className="text-right max-w-xs text-xs">
                        {b.pickupAddress} → {b.dropAddress}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Days</span>
                      <span>{b.daysCount.toString()} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total</span>
                      <span className="font-bold text-green-700">
                        ₹{b.totalPrice.toString()}
                      </span>
                    </div>
                    {b.insuranceOpted && (
                      <div className="flex items-center gap-1 text-green-600 text-xs">
                        <Shield size={12} />
                        Insurance active for this ride
                      </div>
                    )}
                    {b.feedbackMessage && (
                      <div className="bg-blue-50 rounded p-2 text-blue-700 text-xs">
                        {b.feedbackMessage}
                      </div>
                    )}
                    {b.status === BookingStatus.confirmed && (
                      <Button
                        onClick={() => handleSOS(b.id)}
                        size="sm"
                        className="bg-red-600 hover:bg-red-500 text-white"
                      >
                        <AlertCircle size={14} className="mr-1" /> Emergency SOS
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
