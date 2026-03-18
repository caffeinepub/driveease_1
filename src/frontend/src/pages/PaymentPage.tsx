import { ArrowLeft, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { useNavigate } from "../router";

export default function PaymentPage() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState("");

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <button
          type="button"
          onClick={() => navigate("/drivers")}
          className="flex items-center gap-2 text-green-600 hover:text-green-700 text-sm font-medium mb-6"
          data-ocid="payment.secondary_button"
        >
          <ArrowLeft size={16} /> Back to Drivers
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Information
          </h1>
          <p className="text-gray-500">
            Complete your booking payment via bank transfer or UPI
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Bank Transfer */}
          <Card className="shadow-md border border-blue-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <div>
                  <p className="font-bold text-blue-800 text-base">Axis Bank</p>
                  <p className="text-xs text-gray-400 font-normal">
                    Bank Transfer / NEFT / IMPS
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500">Account Holder</span>
                <span className="font-semibold text-gray-900">
                  KRISHNA KANT PANDEY
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500">Account No.</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold">
                    922010062230782
                  </span>
                  <button
                    type="button"
                    onClick={() => copyText("922010062230782", "acc")}
                    className="text-green-600 hover:text-green-700"
                    title="Copy"
                    data-ocid="payment.secondary_button"
                  >
                    <Copy size={14} />
                  </button>
                  {copied === "acc" && (
                    <span className="text-xs text-green-600">Copied!</span>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500">IFSC Code</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold">UTIB0004620</span>
                  <button
                    type="button"
                    onClick={() => copyText("UTIB0004620", "ifsc")}
                    className="text-green-600 hover:text-green-700"
                    title="Copy"
                    data-ocid="payment.secondary_button"
                  >
                    <Copy size={14} />
                  </button>
                  {copied === "ifsc" && (
                    <span className="text-xs text-green-600">Copied!</span>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-500">Bank</span>
                <span className="font-semibold">Axis Bank</span>
              </div>
            </CardContent>
          </Card>

          {/* PhonePe QR */}
          <Card className="shadow-md border border-purple-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <div>
                  <p className="font-bold text-purple-800 text-base">
                    PhonePe / UPI
                  </p>
                  <p className="text-xs text-gray-400 font-normal">
                    Scan QR to pay instantly
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <img
                src="/assets/uploads/WhatsApp-Image-2026-03-09-at-5.36.30-PM-1.jpeg"
                alt="PhonePe QR Code"
                className="mx-auto rounded-xl border border-gray-200 shadow-sm mb-3"
                style={{ maxWidth: "220px" }}
              />
              <p className="text-sm font-semibold text-gray-700 mb-1">
                Scan & Pay via PhonePe
              </p>
              <p className="text-xs text-gray-500 mb-3">
                Use any UPI app: PhonePe, GPay, Paytm, BHIM
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="shadow-sm border border-green-200 bg-green-50">
          <CardContent className="pt-5 pb-5">
            <h3 className="font-bold text-green-800 mb-3 flex items-center gap-2">
              📱 After Payment Instructions
            </h3>
            <ol className="space-y-2 text-sm text-green-900">
              <li className="flex items-start gap-2">
                <span className="font-bold">1.</span>
                Complete payment via bank transfer or PhonePe QR scan
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">2.</span>
                Take a screenshot of the payment confirmation
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">3.</span>
                Send the screenshot on WhatsApp to confirm your booking
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">4.</span>
                Your driver will be assigned within 30 minutes of payment
                confirmation
              </li>
            </ol>
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block"
              data-ocid="payment.primary_button"
            >
              <Button className="bg-green-600 hover:bg-green-500 text-white gap-2">
                📲 WhatsApp Payment Screenshot
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
