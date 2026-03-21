import { ArrowLeft, CheckCircle, LogOut, Phone, User } from "lucide-react";
import { useState } from "react";
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
import { useNavigate } from "../router";
import { apiSaveOtpLogin } from "../utils/backendApi";
import { saveOtpLogin } from "../utils/localStore";

type Step = "phone" | "otp" | "success";

export default function OtpLoginPage() {
  const navigate = useNavigate();
  const { actor } = useActor();

  const stored = localStorage.getItem("otp_customer");
  const customer = stored ? JSON.parse(stored) : null;

  const [step, setStep] = useState<Step>("phone");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (customer?.loggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="max-w-sm w-full shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-green-700">
              Welcome Back!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <User className="text-green-600" size={32} />
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {customer.name}
            </p>
            <p className="text-gray-500 text-sm">{customer.phone}</p>
            <Button
              className="w-full bg-green-600 hover:bg-green-500 text-white"
              onClick={() => navigate("/drivers")}
            >
              Browse Drivers
            </Button>
            <Button
              variant="outline"
              className="w-full border-red-300 text-red-600 hover:bg-red-50"
              onClick={() => {
                localStorage.removeItem("otp_customer");
                window.location.reload();
              }}
            >
              <LogOut size={14} className="mr-2" />
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(otp);
    setStep("otp");
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (enteredOtp !== generatedOtp) {
      setError("Incorrect OTP. Please try again.");
      return;
    }
    setLoading(true);
    // Record login non-blocking
    if (actor) actor.recordOtpLogin(phone, name).catch(() => {});
    apiSaveOtpLogin(name, phone, new Date().toISOString()).catch(() => {});
    saveOtpLogin({
      id: Date.now(),
      name,
      phone,
      loginTime: new Date().toISOString(),
    });
    localStorage.setItem(
      "otp_customer",
      JSON.stringify({ name, phone, loggedIn: true }),
    );
    setLoading(false);
    // Show success step, then redirect after 3 seconds
    setStep("success");
    setTimeout(() => {
      navigate("/drivers");
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-100 flex items-center justify-center px-4">
      <Card className="max-w-sm w-full shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            {step === "otp" && (
              <button
                type="button"
                onClick={() => {
                  setStep("phone");
                  setError("");
                  setEnteredOtp("");
                }}
                className="text-gray-400 hover:text-gray-700"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <CardTitle className="text-gray-900">
              {step === "phone"
                ? "Customer Login"
                : step === "otp"
                  ? "Verify OTP"
                  : "Login Successful!"}
            </CardTitle>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {step === "phone"
              ? "Login to book a trusted driver for your family"
              : step === "otp"
                ? "Enter the OTP shown below"
                : ""}
          </p>
        </CardHeader>

        <CardContent>
          {/* Success Step */}
          {step === "success" && (
            <div
              className="flex flex-col items-center gap-4 py-4"
              data-ocid="login.success_state"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="text-green-600" size={44} />
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-green-700">
                  Login Successful!
                </p>
                <p className="text-gray-600 mt-1">
                  Welcome back,{" "}
                  <span className="font-semibold text-gray-900">{name}</span>!
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Redirecting to drivers in 3 seconds...
                </p>
              </div>
              <div className="w-full bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                <p className="text-green-700 text-sm font-medium">
                  ✔ You are now logged in. Find your perfect driver!
                </p>
              </div>
            </div>
          )}

          {step === "phone" && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <Label htmlFor="login-name">Full Name</Label>
                <div className="relative mt-1">
                  <User
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <Input
                    id="login-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="pl-9"
                    data-ocid="login.input"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="login-phone">Mobile Number</Label>
                <div className="relative mt-1">
                  <Phone
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <Input
                    id="login-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    className="pl-9"
                    data-ocid="login.input"
                  />
                </div>
              </div>
              {error && (
                <p
                  className="text-red-600 text-sm"
                  data-ocid="login.error_state"
                >
                  {error}
                </p>
              )}
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold"
                data-ocid="login.primary_button"
              >
                Get OTP
              </Button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
                <p className="text-gray-500 text-sm mb-1">Your OTP is</p>
                <p className="text-4xl font-black text-green-600 tracking-widest">
                  {generatedOtp}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Demo mode — OTP shown on screen
                </p>
              </div>
              <div>
                <Label htmlFor="otp-input">Enter OTP</Label>
                <Input
                  id="otp-input"
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value)}
                  placeholder="6-digit OTP"
                  maxLength={6}
                  className="text-center text-xl tracking-widest mt-1"
                  data-ocid="login.input"
                />
              </div>
              {error && (
                <p
                  className="text-red-600 text-sm"
                  data-ocid="login.error_state"
                >
                  {error}
                </p>
              )}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold"
                data-ocid="login.submit_button"
              >
                {loading ? "Verifying..." : "Verify & Login"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
