import { CheckCircle, Clock, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ExternalBlob } from "../backend";
import PageHeader from "../components/PageHeader";
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
import { apiSaveRegistration } from "../utils/backendApi";
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

function WaitingScreen({
  submittedAt,
  name,
}: { submittedAt: string; name: string }) {
  const [timeLeft, setTimeLeft] = useState(30 * 60);

  useEffect(() => {
    const submitted = new Date(submittedAt).getTime();
    const updateTimer = () => {
      const elapsed = Math.floor((Date.now() - submitted) / 1000);
      setTimeLeft(Math.max(0, 30 * 60 - elapsed));
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [submittedAt]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((30 * 60 - timeLeft) / (30 * 60)) * 100;

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#0a0f0d" }}
    >
      <PageHeader subtitle="Drive With Us" />
      <div className="max-w-md w-full text-center">
        <div className="relative mx-auto w-32 h-32 mb-6">
          <svg
            className="w-32 h-32 -rotate-90"
            viewBox="0 0 120 120"
            aria-hidden="true"
          >
            <title>Timer progress</title>
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="#1a2e1a"
              strokeWidth="8"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="#22c55e"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 54}`}
              strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress / 100)}`}
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Clock size={22} className="text-green-400 mb-1" />
            <span className="text-white font-bold text-lg">
              {String(minutes).padStart(2, "0")}:
              {String(seconds).padStart(2, "0")}
            </span>
          </div>
        </div>
        <div className="inline-flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />{" "}
          PENDING VERIFICATION
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">
          Application Submitted!
        </h2>
        <p className="text-green-300 text-lg mb-4">
          Hello {name}, your payment is being verified
        </p>
        <div className="bg-[#111a14] border border-[#1a2e1a] rounded-2xl p-6 mb-6">
          <p className="text-[#86efac] text-sm leading-relaxed">
            Our team will review your payment screenshot and registration
            details. Please wait while we verify your application.
          </p>
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle size={16} className="text-green-400" />
              <span className="text-[#86efac]">Documents received</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock size={16} className="text-yellow-400" />
              <span className="text-[#86efac]">
                Payment verification in progress
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-4 h-4 rounded-full border-2 border-gray-600" />
              <span className="text-gray-500">Admin approval pending</span>
            </div>
          </div>
        </div>
        <p className="text-gray-400 text-sm">
          {timeLeft === 0
            ? "Review time completed. Confirmation coming soon."
            : `Estimated wait: ${minutes}m ${seconds}s remaining`}
        </p>
        <p className="text-gray-500 text-xs mt-4">
          Support: +91-7836887228 (WhatsApp)
        </p>
      </div>
    </div>
  );
}

export default function DriverRegistrationPage() {
  const { actor } = useActor();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    state: "",
    vehicleType: "",
    licenseNumber: "",
    experience: "",
    languages: "",
    workAreas: "",
  });
  const [docs, setDocs] = useState<{
    aadhar?: File;
    license?: File;
    selfie?: File;
  }>({});
  const [paymentScreenshotBase64, setPaymentScreenshotBase64] = useState("");
  const [paymentScreenshotName, setPaymentScreenshotName] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedAt, setSubmittedAt] = useState("");
  const [error, setError] = useState("");
  const screenshotRef = useRef<HTMLInputElement>(null);

  const fileToBlob = async (file: File): Promise<ExternalBlob> => {
    const { ExternalBlob: EBlob } = await import("../backend");
    const bytes = new Uint8Array(await file.arrayBuffer());
    return EBlob.fromBytes(bytes);
  };

  const handleScreenshot = (file: File) => {
    setPaymentScreenshotName(file.name);
    const reader = new FileReader();
    reader.onload = (e) =>
      setPaymentScreenshotBase64(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setError("");
    if (!docs.aadhar || !docs.license || !docs.selfie) {
      setError("Please upload all documents.");
      return;
    }
    if (!paymentScreenshotBase64) {
      setError("Please upload your payment screenshot.");
      return;
    }
    setLoading(true);
    const now = new Date().toISOString();
    const regData = {
      name: form.name,
      phone: form.phone,
      email: form.email,
      city: form.city,
      state: form.state,
      submittedAt: now,
      vehicleType: form.vehicleType,
      licenseNumber: form.licenseNumber,
      experience: form.experience,
      languages: form.languages,
      workAreas: form.workAreas,
    };
    // Always save to localStorage first so it shows immediately
    saveRegistration({
      id: Date.now(),
      ...regData,
      status: "pending",
      paymentScreenshotBase64,
    } as any);
    // Try to save to backend with retries so admin can see it on any device
    const saveToBackend = async () => {
      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          await apiSaveRegistration(regData);
          return;
        } catch {
          await new Promise((res) => setTimeout(res, 2000 * (attempt + 1)));
        }
      }
    };
    saveToBackend().catch(() => {});
    // Also try legacy actor registration (non-blocking)
    if (actor) {
      try {
        const [a, c, d] = await Promise.all([
          fileToBlob(docs.aadhar!),
          fileToBlob(docs.license!),
          fileToBlob(docs.selfie!),
        ]);
        await actor.registerDriver(
          form.name,
          form.phone,
          form.email,
          form.city,
          form.state,
          a,
          a,
          c,
          d,
        );
      } catch {
        /* non-critical */
      }
    }
    setLoading(false);
    setSubmittedAt(now);
    setSubmitted(true);
  };

  if (submitted)
    return <WaitingScreen submittedAt={submittedAt} name={form.name} />;

  const inputCls =
    "bg-[#111a14] border-[#1a2e1a] text-[#f0fdf4] placeholder:text-[#86efac]/40 focus:border-[#22c55e]";
  const selectCls =
    "mt-1 w-full bg-[#111a14] border border-[#1a2e1a] rounded-lg px-3 py-2 text-sm text-[#f0fdf4] focus:border-[#22c55e] outline-none";
  const labelCls = "text-[#86efac] text-sm font-medium";
  const steps = ["Personal Info", "Documents", "Payment"];

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: "#0a0f0d" }}>
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Register as Driver</h1>
          <p className="text-[#86efac] mt-1">
            Join India's most trusted personal driver network
          </p>
        </div>
        <div className="flex justify-center mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i + 1 < step ? "bg-[#22c55e] text-black" : i + 1 === step ? "bg-white text-black" : "bg-[#1a2e1a] text-[#86efac]"}`}
              >
                {i + 1 < step ? "✓" : i + 1}
              </div>
              <span
                className={`ml-2 text-sm ${i + 1 === step ? "text-white font-semibold" : "text-[#86efac]"}`}
              >
                {s}
              </span>
              {i < steps.length - 1 && (
                <div className="w-8 h-px bg-[#1a2e1a] mx-3" />
              )}
            </div>
          ))}
        </div>

        {step === 1 && (
          <Card className="bg-[#111a14] border-[#1a2e1a] rounded-2xl">
            <CardHeader>
              <CardTitle className="text-[#22c55e]">
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className={labelCls}>Full Name *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your full name"
                    className={`mt-1 ${inputCls}`}
                    data-ocid="registration.input"
                  />
                </div>
                <div>
                  <Label className={labelCls}>Phone *</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    placeholder="10-digit mobile"
                    maxLength={10}
                    className={`mt-1 ${inputCls}`}
                    data-ocid="registration.input"
                  />
                </div>
              </div>
              <div>
                <Label className={labelCls}>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="your@email.com"
                  className={`mt-1 ${inputCls}`}
                  data-ocid="registration.input"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className={labelCls}>City *</Label>
                  <Input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Your city"
                    className={`mt-1 ${inputCls}`}
                    data-ocid="registration.input"
                  />
                </div>
                <div>
                  <Label className={labelCls}>State *</Label>
                  <select
                    value={form.state}
                    onChange={(e) =>
                      setForm({ ...form, state: e.target.value })
                    }
                    className={selectCls}
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className={labelCls}>Vehicle Type *</Label>
                  <select
                    value={form.vehicleType}
                    onChange={(e) =>
                      setForm({ ...form, vehicleType: e.target.value })
                    }
                    className={selectCls}
                    data-ocid="registration.select"
                  >
                    <option value="">Select vehicle</option>
                    {[
                      "Hatchback",
                      "Sedan",
                      "SUV",
                      "MUV",
                      "Luxury Car",
                      "Any",
                    ].map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className={labelCls}>License No. *</Label>
                  <Input
                    value={form.licenseNumber}
                    onChange={(e) =>
                      setForm({ ...form, licenseNumber: e.target.value })
                    }
                    placeholder="DL-XXXXXXXXXX"
                    className={`mt-1 ${inputCls}`}
                    data-ocid="registration.input"
                  />
                </div>
              </div>
              <div>
                <Label className={labelCls}>Driving Experience *</Label>
                <select
                  value={form.experience}
                  onChange={(e) =>
                    setForm({ ...form, experience: e.target.value })
                  }
                  className={selectCls}
                  data-ocid="registration.select"
                >
                  <option value="">Select experience</option>
                  {[
                    "Less than 1 year",
                    "1-2 years",
                    "3-5 years",
                    "5-10 years",
                    "10+ years",
                  ].map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className={labelCls}>Languages Spoken</Label>
                <Input
                  value={form.languages}
                  onChange={(e) =>
                    setForm({ ...form, languages: e.target.value })
                  }
                  placeholder="e.g. Hindi, English, Punjabi"
                  className={`mt-1 ${inputCls}`}
                  data-ocid="registration.input"
                />
              </div>
              <div>
                <Label className={labelCls}>Preferred Work Areas</Label>
                <Input
                  value={form.workAreas}
                  onChange={(e) =>
                    setForm({ ...form, workAreas: e.target.value })
                  }
                  placeholder="e.g. Delhi NCR, Gurgaon, Noida"
                  className={`mt-1 ${inputCls}`}
                  data-ocid="registration.input"
                />
              </div>
              {error && (
                <p
                  className="text-red-400 text-sm"
                  data-ocid="registration.error_state"
                >
                  {error}
                </p>
              )}
              <Button
                className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-black font-semibold"
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
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="bg-[#111a14] border-[#1a2e1a] rounded-2xl">
            <CardHeader>
              <CardTitle className="text-[#22c55e]">Upload Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(
                [
                  { key: "aadhar", label: "Aadhar Card *" },
                  { key: "license", label: "Driving License *" },
                  { key: "selfie", label: "Recent Selfie *" },
                ] as const
              ).map((doc) => (
                <div key={doc.key}>
                  <Label className={labelCls}>{doc.label}</Label>
                  <label className="mt-1 flex items-center justify-center border-2 border-dashed border-[#1a2e1a] rounded-xl p-4 cursor-pointer hover:border-[#22c55e] transition-colors">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) =>
                        setDocs({ ...docs, [doc.key]: e.target.files?.[0] })
                      }
                    />
                    {docs[doc.key] ? (
                      <span className="text-green-400 text-sm font-medium">
                        ✓ {docs[doc.key]?.name}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-[#86efac] text-sm">
                        <Upload size={16} />
                        Upload {doc.label.replace(" *", "")}
                      </span>
                    )}
                  </label>
                </div>
              ))}
              {error && (
                <p
                  className="text-red-400 text-sm"
                  data-ocid="registration.error_state"
                >
                  {error}
                </p>
              )}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-[#1a2e1a] text-[#86efac] hover:bg-[#1a2e1a]"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button
                  className="flex-1 bg-[#22c55e] hover:bg-[#16a34a] text-black font-semibold"
                  onClick={() => {
                    if (!docs.aadhar || !docs.license || !docs.selfie) {
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
          <Card className="bg-[#111a14] border-[#1a2e1a] rounded-2xl">
            <CardHeader>
              <CardTitle className="text-[#22c55e]">
                Registration Fee — ₹150
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="bg-[#0a1a0a] border border-[#1a2e1a] rounded-xl p-4 text-center">
                <p className="text-[#86efac] text-sm mb-3">
                  Pay ₹150 via PhonePe/UPI or Bank Transfer
                </p>
                <img
                  src="/assets/uploads/WhatsApp-Image-2026-03-09-at-5.36.30-PM-1.jpeg"
                  alt="Payment QR"
                  className="mx-auto rounded-xl border border-[#1a2e1a]"
                  style={{ maxWidth: "160px" }}
                />
                <p className="text-[#86efac] text-xs mt-2">
                  UPI / PhonePe: 7836887228
                </p>
              </div>
              <div className="bg-[#0a1a0a] border border-[#1a2e1a] rounded-xl p-4 space-y-2 text-sm">
                <p className="text-[#22c55e] font-semibold mb-2">
                  Bank Transfer Details
                </p>
                {[
                  { l: "Account Holder", v: "Krishna Kant Pandey" },
                  { l: "Account No.", v: "922010062230782" },
                  { l: "IFSC Code", v: "UTIB0004620" },
                  { l: "Bank", v: "Axis Bank" },
                ].map(({ l, v }) => (
                  <div key={l} className="flex justify-between">
                    <span className="text-[#86efac]">{l}:</span>
                    <span className="text-white font-medium">{v}</span>
                  </div>
                ))}
              </div>
              <div>
                <Label className={labelCls}>Upload Payment Screenshot *</Label>
                <label
                  className="mt-2 flex items-center justify-center border-2 border-dashed border-[#1a2e1a] rounded-xl p-5 cursor-pointer hover:border-[#22c55e] transition-colors"
                  data-ocid="registration.upload_button"
                >
                  <input
                    ref={screenshotRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleScreenshot(f);
                    }}
                  />
                  {paymentScreenshotBase64 ? (
                    <div className="text-center">
                      <img
                        src={paymentScreenshotBase64}
                        alt="Payment"
                        className="max-h-32 mx-auto rounded-lg mb-2"
                      />
                      <span className="text-green-400 text-sm">
                        ✓ {paymentScreenshotName}
                      </span>
                    </div>
                  ) : (
                    <span className="flex flex-col items-center gap-2 text-[#86efac] text-sm">
                      <Upload size={24} />
                      <span>Tap to upload payment screenshot</span>
                      <span className="text-xs text-gray-500">
                        JPG, PNG accepted
                      </span>
                    </span>
                  )}
                </label>
              </div>
              {error && (
                <p
                  className="text-red-400 text-sm"
                  data-ocid="registration.error_state"
                >
                  {error}
                </p>
              )}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-[#1a2e1a] text-[#86efac] hover:bg-[#1a2e1a]"
                  onClick={() => setStep(2)}
                >
                  Back
                </Button>
                <Button
                  className="flex-1 bg-[#22c55e] hover:bg-[#16a34a] text-black font-semibold"
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
