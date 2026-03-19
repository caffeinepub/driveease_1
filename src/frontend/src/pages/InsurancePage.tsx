import { AlertCircle, CheckCircle, Info, Phone, Shield } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Link } from "../router";

const emergencies = [
  {
    number: "108",
    label: "Ambulance",
    color: "bg-red-600",
    desc: "Medical emergency",
  },
  {
    number: "100",
    label: "Police",
    color: "bg-blue-700",
    desc: "Security emergency",
  },
  {
    number: "102",
    label: "Medical",
    color: "bg-green-600",
    desc: "Medical helpline",
  },
];

const coverage = [
  "Accidental injury to passenger (up to ₹5 lakhs)",
  "Medical emergency assistance during ride",
  "Emergency hospitalization support",
  "Driver accident coverage",
  "24/7 emergency response coordination",
];

export default function InsurancePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-900 text-white py-12 px-4 text-center">
        <Shield className="mx-auto mb-3 text-green-400" size={48} />
        <h1 className="text-3xl font-bold mb-2">
          Insurance & Emergency Helpline
        </h1>
        <p className="text-gray-400">
          Your safety is our priority. Every ride is covered.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        {/* Accident Coverage Callout */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-4">
          <Info className="text-amber-600 shrink-0 mt-0.5" size={22} />
          <div>
            <h3 className="font-semibold text-amber-900 mb-1">
              Mid-Trip Accident Coverage
            </h3>
            <p className="text-amber-800 text-sm leading-relaxed">
              Accidental coverage is automatically activated when you opt for{" "}
              <strong>₹99 Ride Insurance</strong> during booking. Your safety is
              covered from the moment your trip starts until it ends — including
              any mid-trip accidents or emergencies involving the vehicle.
            </p>
          </div>
        </div>

        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="text-green-600" />
              Ride Insurance Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="bg-green-50 rounded-xl p-6 text-center md:w-48 shrink-0">
                <div className="text-3xl font-black text-green-700">₹99</div>
                <div className="text-sm text-gray-600">per ride</div>
                <div className="text-xs text-gray-400 mt-1">
                  Expires when ride ends
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">What's Covered</h3>
                {coverage.map((c) => (
                  <div
                    key={c}
                    className="flex items-start gap-2 text-sm text-gray-700"
                  >
                    <CheckCircle
                      size={14}
                      className="text-green-600 mt-0.5 shrink-0"
                    />
                    {c}
                  </div>
                ))}
                <p className="text-xs text-gray-400 mt-3">
                  * Insurance is provided in partnership with our insurance
                  partner. Terms apply. Coverage is active from ride start to
                  ride end.
                </p>
              </div>
            </div>
            <Button
              asChild
              className="mt-4 bg-green-600 hover:bg-green-500 text-white"
            >
              <Link to="/drivers">Book a Ride with Insurance</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertCircle />
              Emergency Contacts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {emergencies.map((e) => (
                <a key={e.number} href={`tel:${e.number}`} className="block">
                  <div
                    className={`${e.color} text-white rounded-xl p-4 text-center hover:opacity-90 transition`}
                  >
                    <div className="text-3xl font-black">{e.number}</div>
                    <div className="font-semibold">{e.label}</div>
                    <div className="text-xs opacity-80 mt-1">{e.desc}</div>
                    <div className="flex items-center justify-center gap-1 mt-2 text-xs">
                      <Phone size={12} />
                      Tap to call
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>DriveEase Support Helpline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Phone className="text-green-600" size={20} />
              <div>
                <div className="font-bold text-lg">
                  1800-DRIVEEASE (Toll Free)
                </div>
                <div className="text-sm text-gray-500">
                  Available 6 AM – 10 PM, 7 days a week
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              For ride-related issues, driver complaints, cancellations, or
              insurance claims — call our helpline anytime.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
