import { CheckCircle } from "lucide-react";
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
import { saveEnquiry } from "../utils/localStore";

const plans = [
  {
    id: "weekend",
    name: "Weekend Driver",
    price: 1999,
    period: "month",
    color: "border-blue-200",
    highlight: false,
    features: [
      "Saturday & Sunday coverage",
      "Up to 8 hrs/day",
      "Verified driver",
      "Family tracking",
      "SOS support",
    ],
  },
  {
    id: "daily",
    name: "Daily Commute",
    price: 4999,
    period: "month",
    color: "border-green-400",
    highlight: true,
    features: [
      "2 hours daily coverage",
      "Assigned personal driver",
      "Priority booking",
      "Family account",
      "Grooming certified",
      "Free insurance",
    ],
  },
  {
    id: "senior",
    name: "Senior Care",
    price: 7999,
    period: "month",
    color: "border-purple-200",
    highlight: false,
    features: [
      "Dedicated senior care driver",
      "Medical appointment priority",
      "Etiquette trained",
      "Family SOS alerts",
      "24/7 helpline",
      "Full insurance coverage",
    ],
  },
];

export default function SubscriptionsPage() {
  const { actor } = useActor();
  const [selected, setSelected] = useState("daily");
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

  const handleEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.city) {
      setError("Please fill required fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      if (actor) {
        await actor.submitSubscriptionEnquiry(
          form.name,
          form.phone,
          form.email,
          selected,
          BigInt(Number(form.members) || 1),
          form.city,
          form.message,
        );
      }
    } catch {
      // proceed anyway
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
      setSuccess(true);
    }
  };

  if (success)
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center shadow-lg">
          <CardContent className="pt-8 pb-8">
            <CheckCircle className="text-green-600 mx-auto mb-4" size={56} />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Enquiry Submitted!
            </h2>
            <p className="text-gray-600">
              We'll contact you within 24 hours to discuss the best plan for
              your family.
            </p>
          </CardContent>
        </Card>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-900 text-white py-12 px-4 text-center">
        <h1 className="text-3xl font-bold mb-2">Family Subscription Plans</h1>
        <p className="text-gray-400">
          Predictable pricing. Peace of mind. What you see is what you pay.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`cursor-pointer border-2 transition-all ${
                selected === plan.id
                  ? "border-green-500 shadow-lg scale-105"
                  : plan.color
              }`}
              onClick={() => setSelected(plan.id)}
              data-ocid="subscriptions.card"
            >
              <CardHeader>
                {plan.highlight && (
                  <span className="text-xs font-bold text-green-600 uppercase tracking-wide">
                    Most Popular
                  </span>
                )}
                <CardTitle>{plan.name}</CardTitle>
                <p className="text-2xl font-black text-gray-900">
                  ₹{plan.price.toLocaleString()}
                  <span className="text-sm font-normal text-gray-400">
                    /{plan.period}
                  </span>
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-sm text-gray-700"
                    >
                      <span className="text-green-500">✓</span> {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="max-w-xl mx-auto shadow-md">
          <CardHeader>
            <CardTitle>Request a Callback</CardTitle>
            <p className="text-sm text-gray-500">
              Selected:{" "}
              <strong>{plans.find((p) => p.id === selected)?.name}</strong>
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEnquiry} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Full Name *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name"
                    className="mt-1"
                    data-ocid="subscriptions.input"
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
                    data-ocid="subscriptions.input"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    placeholder="your@email.com"
                    className="mt-1"
                    data-ocid="subscriptions.input"
                  />
                </div>
                <div>
                  <Label>City *</Label>
                  <Input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Your city"
                    className="mt-1"
                    data-ocid="subscriptions.input"
                  />
                </div>
              </div>
              <div>
                <Label>Family Members</Label>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  value={form.members}
                  onChange={(e) =>
                    setForm({ ...form, members: e.target.value })
                  }
                  className="mt-1"
                  data-ocid="subscriptions.input"
                />
              </div>
              <div>
                <Label>Message (optional)</Label>
                <textarea
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                  placeholder="Any special requirements..."
                  rows={3}
                  className="mt-1 w-full border border-gray-200 rounded-md px-3 py-2 text-sm resize-none"
                  data-ocid="subscriptions.textarea"
                />
              </div>
              {error && (
                <p
                  className="text-red-600 text-sm"
                  data-ocid="subscriptions.error_state"
                >
                  {error}
                </p>
              )}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold"
                data-ocid="subscriptions.submit_button"
              >
                {loading ? "Submitting..." : "Request Callback"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
