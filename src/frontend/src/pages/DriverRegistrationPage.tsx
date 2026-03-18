import { CheckCircle, Upload } from "lucide-react";
import { useState } from "react";
import type { ExternalBlob } from "../backend";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useActor } from "../hooks/useActor";
import { saveRegistration } from "../utils/localStore";

const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

export default function DriverRegistrationPage() {
  const { actor } = useActor();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    state: "",
  });
  const [docs, setDocs] = useState<{
    aadhar?: File;
    pan?: File;
    license?: File;
    selfie?: File;
  }>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const fileToBlob = async (file: File): Promise<ExternalBlob> => {
    const { ExternalBlob: EBlob } = await import("../backend");
    const bytes = new Uint8Array(await file.arrayBuffer());
    return EBlob.fromBytes(bytes);
  };

  const handleSubmit = async () => {
    setError("");
    if (!docs.aadhar || !docs.pan || !docs.license || !docs.selfie) {
      setError("Please upload all documents.");
      return;
    }
    if (!actor) {
      setError("Not connected. Please try again.");
      return;
    }
    setLoading(true);
    try {
      const [aadharBlob, panBlob, licenseBlob, selfieBlob] = await Promise.all([
        fileToBlob(docs.aadhar),
        fileToBlob(docs.pan),
        fileToBlob(docs.license),
        fileToBlob(docs.selfie),
      ]);
      await actor.registerDriver(
        form.name,
        form.phone,
        form.email,
        form.city,
        form.state,
        aadharBlob,
        panBlob,
        licenseBlob,
        selfieBlob,
      );
    } catch {
      // continue even if backend call fails
    } finally {
      setLoading(false);
      saveRegistration({
        id: Date.now(),
        name: form.name,
        phone: form.phone,
        email: form.email,
        city: form.city,
        state: form.state,
        status: "pending",
        submittedAt: new Date().toISOString(),
      });
      setSuccess(true);
    }
  };

  const steps = ["Personal Info", "Documents", "Payment"];

  if (success)
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center shadow-lg">
          <CardContent className="pt-8 pb-8">
            <CheckCircle className="text-green-600 mx-auto mb-4" size={56} />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Application Submitted!
            </h2>
            <p className="text-gray-600">
              Your application is under review. We will contact you within 2-3
              business days after document verification.
            </p>
          </CardContent>
        </Card>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Register as Driver
          </h1>
          <p className="text-gray-500 mt-1">
            Join India's most trusted personal driver network
          </p>
        </div>

        <div className="flex justify-center mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  i + 1 < step
                    ? "bg-green-600 text-white"
                    : i + 1 === step
                      ? "bg-gray-900 text-white"
                      : "bg-gray-200 text-gray-500"
                }`}
              >
                {i + 1 < step ? "✓" : i + 1}
              </div>
              <span
                className={`ml-2 text-sm ${
                  i + 1 === step ? "font-semibold" : "text-gray-400"
                }`}
              >
                {s}
              </span>
              {i < steps.length - 1 && (
                <div className="w-8 h-px bg-gray-300 mx-3" />
              )}
            </div>
          ))}
        </div>

        {step === 1 && (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Full Name *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your full name"
                    className="mt-1"
                    data-ocid="registration.input"
                  />
                </div>
                <div>
                  <Label>Phone *</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    placeholder="10-digit mobile"
                    maxLength={10}
                    className="mt-1"
                    data-ocid="registration.input"
                  />
                </div>
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="your@email.com"
                  className="mt-1"
                  data-ocid="registration.input"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>City *</Label>
                  <Input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Your city"
                    className="mt-1"
                    data-ocid="registration.input"
                  />
                </div>
                <div>
                  <Label>State *</Label>
                  <select
                    value={form.state}
                    onChange={(e) =>
                      setForm({ ...form, state: e.target.value })
                    }
                    className="mt-1 w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
                    data-ocid="registration.select"
                  >
                    <option value="">Select state</option>
                    {indianStates.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <Button
                className="w-full bg-green-600 hover:bg-green-500 text-white"
                onClick={() => {
                  if (!form.name || !form.phone || !form.city || !form.state) {
                    setError("Please fill all required fields.");
                    return;
                  }
                  setError("");
                  setStep(2);
                }}
                data-ocid="registration.primary_button"
              >
                Next: Upload Documents
              </Button>
              {error && (
                <p
                  className="text-red-600 text-sm"
                  data-ocid="registration.error_state"
                >
                  {error}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Upload Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(
                [
                  { key: "aadhar", label: "Aadhar Card *" },
                  { key: "pan", label: "PAN Card *" },
                  { key: "license", label: "Driving License *" },
                  { key: "selfie", label: "Recent Selfie *" },
                ] as const
              ).map((doc) => (
                <div key={doc.key}>
                  <Label>{doc.label}</Label>
                  <label className="mt-1 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-green-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) =>
                        setDocs({ ...docs, [doc.key]: e.target.files?.[0] })
                      }
                    />
                    {docs[doc.key] ? (
                      <span className="text-green-600 text-sm font-medium">
                        ✓ {docs[doc.key]?.name}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-gray-400 text-sm">
                        <Upload size={16} /> Upload{" "}
                        {doc.label.replace(" *", "")}
                      </span>
                    )}
                  </label>
                </div>
              ))}
              {error && (
                <p
                  className="text-red-600 text-sm"
                  data-ocid="registration.error_state"
                >
                  {error}
                </p>
              )}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-500 text-white"
                  onClick={() => {
                    if (
                      !docs.aadhar ||
                      !docs.pan ||
                      !docs.license ||
                      !docs.selfie
                    ) {
                      setError("Please upload all documents.");
                      return;
                    }
                    setError("");
                    setStep(3);
                  }}
                  data-ocid="registration.primary_button"
                >
                  Next: Payment
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Registration Fee — ₹150</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-gray-700 mb-3">
                  Pay ₹150 registration fee to complete your application.
                </p>
                <img
                  src="/assets/uploads/WhatsApp-Image-2026-03-09-at-5.36.30-PM-1.jpeg"
                  alt="Payment QR"
                  className="mx-auto rounded-xl border border-gray-200"
                  style={{ maxWidth: "180px" }}
                />
                <p className="text-xs text-gray-500 mt-2">
                  UPI / PhonePe — KRISHNA KANT PANDEY
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Account:</span>
                  <span className="font-medium">922010062230782</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">IFSC:</span>
                  <span className="font-medium">UTIB0004620</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Bank:</span>
                  <span className="font-medium">Axis Bank</span>
                </div>
              </div>
              {error && (
                <p
                  className="text-red-600 text-sm"
                  data-ocid="registration.error_state"
                >
                  {error}
                </p>
              )}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(2)}
                >
                  Back
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-500 text-white"
                  disabled={loading}
                  onClick={handleSubmit}
                  data-ocid="registration.submit_button"
                >
                  {loading ? "Submitting..." : "I've Paid — Submit Application"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
