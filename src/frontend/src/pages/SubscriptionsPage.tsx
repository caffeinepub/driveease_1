import { CheckCircle, Clock, Shield, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { useActor } from "../hooks/useActor";
import { apiSaveEnquiry } from "../utils/backendApi";
import { saveEnquiry } from "../utils/localStore";

const plans = [
  {
    id: "weekend",
    name: "Weekend Driver",
    casualPrice: null,
    monthlyPrice: 1999,
    period: "month",
    featured: false,
    seniorCare: false,
    coverage: "Saturday & Sunday, up to 8 hrs/day",
    features: [
      "Weekend coverage",
      "Verified driver",
      "Family tracking",
      "SOS support",
    ],
    seniorAddons: [],
  },
  {
    id: "hourly",
    name: "Hourly Driver Plan",
    casualPrice: 800,
    monthlyPrice: 24000,
    period: "month",
    featured: true,
    seniorCare: true,
    coverage: "8 hours/day (7 AM – 9 PM flexible)",
    features: [
      "Verified & background-checked driver",
      "Family tracking via app",
      "SOS emergency support",
      "Flexible scheduling (7 AM – 9 PM)",
    ],
    seniorAddons: [
      "Medical appointment priority scheduling",
      "Etiquette-trained driver",
      "24/7 helpline support",
    ],
  },
  {
    id: "daily",
    name: "Daily Commute",
    casualPrice: 1200,
    monthlyPrice: 4999,
    period: "month",
    featured: false,
    seniorCare: false,
    coverage: "2 hours daily, personal driver assigned",
    features: [
      "Assigned personal driver",
      "Priority booking",
      "Family account",
      "Grooming certified",
      "Free insurance",
    ],
    seniorAddons: [],
  },
];

function getCustomerData(): { name: string; phone: string } {
  try {
    const s = localStorage.getItem("otp_customer");
    if (!s) return { name: "", phone: "" };
    const c = JSON.parse(s);
    return { name: c?.name || "", phone: c?.phone || "" };
  } catch {
    return { name: "", phone: "" };
  }
}

export default function SubscriptionsPage() {
  const { actor } = useActor();
  const formRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState("hourly");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    members: "2",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Pre-fill customer data if logged in
    const customerData = getCustomerData();
    if (customerData.name || customerData.phone) {
      setForm((f) => ({
        ...f,
        name: customerData.name || f.name,
        phone: customerData.phone || f.phone,
      }));
    }
  }, []);

  const handleSelectPlan = (planId: string) => {
    setSelected(planId);
    // Smooth scroll to inquiry form
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const bg = "#0a0f0d";
  const inputCls =
    "bg-[#111a14] border-[#1a2e1a] text-[#f0fdf4] placeholder:text-[#86efac]/40";
  const labelCls = "text-[#86efac] text-sm";

  const handleEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.city) {
      setError("Please fill required fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      if (actor)
        await actor.submitSubscriptionEnquiry(
          form.name,
          form.phone,
          form.email,
          selected,
          BigInt(Number(form.members) || 1),
          form.city,
          form.message,
        );
    } catch {
      /* continue */
    } finally {
      setLoading(false);
      saveEnquiry({
        id: Date.now(),
        name: form.name,
        phone: form.phone,
        email: form.email,
        planType: selected,
        city: form.city,
        familyMembers: Number(form.members) || 1,
        message: form.message,
        submittedAt: new Date().toISOString(),
        status: "new",
      });
      apiSaveEnquiry({
        name: form.name,
        phone: form.phone,
        email: form.email,
        planType: selected,
        city: form.city,
        familyMembers: Number(form.members) || 1,
        message: form.message,
        submittedAt: new Date().toISOString(),
      }).catch(() => {});
      setSuccess(true);
    }
  };

  if (success)
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: bg }}
      >
        <div className="max-w-md w-full text-center">
          <CheckCircle size={64} className="text-[#22c55e] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Enquiry Submitted!
          </h2>
          <p className="text-[#86efac]">
            We’ll contact you within 24 hours to discuss the best plan for your
            family.
          </p>
          <button
            type="button"
            onClick={() => setSuccess(false)}
            className="mt-6 text-[#22c55e] hover:underline text-sm"
          >
            ← Back to Plans
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen" style={{ background: bg }}>
      <div
        className="py-14 px-4 text-center"
        style={{
          background: "linear-gradient(180deg,#0d1a0d 0%,#0a0f0d 100%)",
        }}
      >
        <h1 className="text-4xl font-bold text-white mb-3">
          Family Subscription Plans
        </h1>
        <p className="text-[#86efac] max-w-lg mx-auto">
          Predictable pricing. Peace of mind. What you see is what you pay.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl border-2 transition-all ${
                selected === plan.id
                  ? "border-[#22c55e] shadow-[0_0_30px_rgba(34,197,94,0.15)] scale-[1.02]"
                  : "border-[#1a2e1a] hover:border-[#22c55e]/50"
              } bg-[#111a14] overflow-hidden`}
              data-ocid="subscriptions.card"
            >
              {plan.featured && (
                <div className="bg-[#22c55e] text-black text-xs font-bold text-center py-1.5 tracking-wide">
                  ⭐ FEATURED PLAN
                </div>
              )}
              {plan.seniorCare && !plan.featured && (
                <div className="bg-[#14b8a6] text-black text-xs font-bold text-center py-1.5 tracking-wide">
                  🏥 SENIOR CARE
                </div>
              )}
              <div className="p-6">
                <h3 className="text-white font-bold text-xl mb-1">
                  {plan.name}
                </h3>
                {plan.casualPrice && (
                  <p className="text-[#86efac] text-sm mb-1">
                    ₹{plan.casualPrice.toLocaleString()}/day casual booking
                  </p>
                )}
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-3xl font-black text-white">
                    ₹{plan.monthlyPrice.toLocaleString()}
                  </span>
                  <span className="text-[#86efac] text-sm">/{plan.period}</span>
                </div>
                <p className="text-[#86efac] text-xs mb-4 flex items-center gap-1">
                  <Clock size={12} />
                  {plan.coverage}
                </p>
                <ul className="space-y-2 mb-5">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-sm text-[#f0fdf4]"
                    >
                      <CheckCircle
                        size={14}
                        className="text-[#22c55e] flex-shrink-0"
                      />
                      {f}
                    </li>
                  ))}
                </ul>
                {plan.seniorAddons.length > 0 && (
                  <div className="border-t border-[#1a2e1a] pt-3 mt-3 mb-4">
                    <p className="text-[#14b8a6] text-xs font-semibold mb-2 flex items-center gap-1">
                      <Shield size={12} />
                      Senior Care Add-ons
                    </p>
                    {plan.seniorAddons.map((a) => (
                      <div
                        key={a}
                        className="flex items-center gap-2 text-sm text-[#86efac] mb-1"
                      >
                        <Star
                          size={12}
                          className="text-[#14b8a6] flex-shrink-0"
                        />
                        {a}
                      </div>
                    ))}
                  </div>
                )}
                {/* Select Plan Button */}
                <button
                  type="button"
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    selected === plan.id
                      ? "bg-[#22c55e] text-black hover:bg-[#16a34a]"
                      : "bg-[#1a2e1a] text-[#22c55e] border border-[#22c55e]/40 hover:bg-[#22c55e]/10"
                  }`}
                  data-ocid="subscriptions.primary_button"
                >
                  {selected === plan.id ? "✓ Selected" : "Select Plan"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Inquiry Form */}
        <div ref={formRef}>
          <Card className="max-w-xl mx-auto bg-[#111a14] border-[#1a2e1a] rounded-2xl">
            <CardHeader>
              <CardTitle className="text-[#22c55e]">
                Request a Callback
              </CardTitle>
              <p className="text-sm text-[#86efac]">
                Selected:{" "}
                <strong className="text-white">
                  {plans.find((p) => p.id === selected)?.name}
                </strong>
              </p>
              <p className="text-xs text-[#86efac]/70 mt-1">
                Our team will call you within 24 hours to complete your
                enrollment.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEnquiry} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className={labelCls}>Full Name *</Label>
                    <Input
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      placeholder="Your name"
                      className={`mt-1 ${inputCls}`}
                      data-ocid="subscriptions.input"
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
                      data-ocid="subscriptions.input"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className={labelCls}>Email</Label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      placeholder="your@email.com"
                      className={`mt-1 ${inputCls}`}
                      data-ocid="subscriptions.input"
                    />
                  </div>
                  <div>
                    <Label className={labelCls}>City *</Label>
                    <Input
                      value={form.city}
                      onChange={(e) =>
                        setForm({ ...form, city: e.target.value })
                      }
                      placeholder="Your city"
                      className={`mt-1 ${inputCls}`}
                      data-ocid="subscriptions.input"
                    />
                  </div>
                </div>
                <div>
                  <Label className={labelCls}>Family Members</Label>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    value={form.members}
                    onChange={(e) =>
                      setForm({ ...form, members: e.target.value })
                    }
                    className={`mt-1 ${inputCls}`}
                    data-ocid="subscriptions.input"
                  />
                </div>
                <div>
                  <Label className={labelCls}>Requirements / Message</Label>
                  <Textarea
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                    placeholder="Tell us what you need — daily commute, senior care, outstation, etc."
                    rows={3}
                    className={`mt-1 ${inputCls} resize-none`}
                    data-ocid="subscriptions.textarea"
                  />
                </div>
                {error && (
                  <p
                    className="text-red-400 text-sm"
                    data-ocid="subscriptions.error_state"
                  >
                    {error}
                  </p>
                )}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-black font-semibold"
                  data-ocid="subscriptions.submit_button"
                >
                  {loading ? "Submitting..." : "Submit Inquiry"}
                </Button>
                <p className="text-xs text-[#86efac]/60 text-center">
                  No account required. We’ll contact you to finalize your plan.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
