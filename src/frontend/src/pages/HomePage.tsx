import {
  CheckCircle,
  ChevronRight,
  Copy,
  CreditCard,
  Eye,
  Phone,
  Shield,
  Star,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Link } from "../router";

const differentiators = [
  {
    icon: <Shield className="text-green-600" size={32} />,
    title: "Assigned Driver System",
    desc: "Same trusted driver for office, parents, kids, and medical visits.",
  },
  {
    icon: <Users className="text-green-600" size={32} />,
    title: "Family Account",
    desc: "One account, multiple family members. SOS alerts go directly to family.",
  },
  {
    icon: <CreditCard className="text-green-600" size={32} />,
    title: "Subscription Plans",
    desc: "Monthly plans with predictable pricing and total peace of mind.",
  },
  {
    icon: <Eye className="text-green-600" size={32} />,
    title: "Trust Transparency",
    desc: "See police verification, training, medical fitness, and experience upfront.",
  },
];

const familyFeatures = [
  "Choose who can book and who can only track",
  "Spending limits per family member",
  "Live tracking shared with family",
  "SOS alerts go directly to family members",
  "One trusted driver for the entire family",
  "NRI-friendly: manage from anywhere",
];

const trustIndicators = [
  { icon: "⭐", value: "4.8 Rating" },
  { icon: "🚗", value: "5000+ Drivers" },
  { icon: "👥", value: "10,000+ Customers" },
  { icon: "✅", value: "Aadhaar Verified" },
];

export default function HomePage() {
  const [copied, setCopied] = useState("");

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <div className="bg-white">
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(32px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .anim-hero-badge { animation: fadeSlideUp 0.6s ease forwards; opacity: 0; animation-delay: 0.1s; }
        .anim-hero-h1 { animation: fadeSlideUp 0.7s ease forwards; opacity: 0; animation-delay: 0.25s; }
        .anim-hero-sub { animation: fadeSlideUp 0.7s ease forwards; opacity: 0; animation-delay: 0.4s; }
        .anim-hero-btns { animation: fadeSlideUp 0.7s ease forwards; opacity: 0; animation-delay: 0.55s; }
        .anim-hero-trust { animation: fadeSlideUp 0.7s ease forwards; opacity: 0; animation-delay: 0.7s; }
        .anim-hero-img { animation: fadeSlideUp 0.9s ease forwards; opacity: 0; animation-delay: 0.3s; }
      `}</style>

      {/* Hero */}
      <section
        className="relative min-h-screen flex items-center overflow-hidden"
        style={{ background: "#0f172a" }}
      >
        <div
          className="absolute inset-0 md:hidden"
          style={{
            backgroundImage:
              "url('/assets/generated/hero-driver.dim_1600x900.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(3px) brightness(0.4)",
            transform: "scale(1.05)",
          }}
        />
        <div
          className="absolute inset-0 md:hidden"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.7) 100%)",
          }}
        />
        <div
          className="absolute inset-0 hidden md:block"
          style={{
            background:
              "linear-gradient(135deg, #0f172a 0%, #0f172a 55%, #0a1f12 100%)",
          }}
        />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-16 md:py-0 flex flex-col md:flex-row items-center gap-10 md:gap-0 min-h-screen">
          <div className="flex-1 flex flex-col items-center md:items-start justify-center text-center md:text-left md:pr-10">
            <div className="anim-hero-badge">
              <Badge className="bg-green-600/20 text-green-400 border border-green-600/40 mb-5 text-xs tracking-widest uppercase px-3 py-1">
                India's First Personal Driver Network
              </Badge>
            </div>
            <h1 className="anim-hero-h1 text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-5">
              Book a Professional Driver
              <br />
              <span className="text-green-400">Anytime, Anywhere</span>
            </h1>
            <p className="anim-hero-sub text-lg text-gray-300 mb-8 max-w-lg">
              Verified drivers across India. Safe, reliable, and affordable
              rides at your fingertips.
            </p>
            <div className="anim-hero-btns flex flex-col sm:flex-row gap-4 mb-10">
              <Button
                asChild
                size="lg"
                className="bg-green-600 hover:bg-green-500 text-white font-semibold px-8 shadow-lg shadow-green-900/40 transition-all duration-200 hover:scale-105 hover:shadow-green-700/50"
                data-ocid="hero.primary_button"
              >
                <Link to="/drivers">
                  Book a Driver Now <ChevronRight className="ml-1" size={18} />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-green-600/50 text-green-400 hover:bg-green-900/30 hover:border-green-500 font-semibold px-8 transition-all duration-200 hover:scale-105"
                data-ocid="hero.secondary_button"
              >
                <Link to="/subscriptions">View Family Plans</Link>
              </Button>
            </div>
            <div className="anim-hero-trust flex flex-wrap justify-center md:justify-start gap-3">
              {trustIndicators.map((t) => (
                <div
                  key={t.value}
                  className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 text-sm text-white font-medium"
                >
                  <span>{t.icon}</span>
                  <span>{t.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden md:flex flex-1 items-center justify-center md:justify-end">
            <div className="anim-hero-img relative">
              <div
                className="absolute -inset-4 rounded-3xl opacity-30"
                style={{
                  background:
                    "radial-gradient(ellipse at center, #16a34a 0%, transparent 70%)",
                }}
              />
              <img
                src="/assets/generated/hero-driver.dim_1600x900.jpg"
                alt="Professional DriveEase driver standing by car"
                className="relative rounded-2xl shadow-2xl object-cover"
                style={{
                  width: "480px",
                  height: "580px",
                  objectFit: "cover",
                  objectPosition: "center top",
                  boxShadow:
                    "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(22,163,74,0.15)",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Differentiators */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-2 text-gray-900">
            The DriveEase Difference
          </h2>
          <p className="text-center text-gray-500 mb-10">
            Built for families, not just commuters.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {differentiators.map((p) => (
              <Card
                key={p.title}
                className="border-0 shadow-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="pt-6 text-center">
                  <div className="mb-3 flex justify-center">{p.icon}</div>
                  <h3 className="font-bold text-gray-900 mb-2">{p.title}</h3>
                  <p className="text-sm text-gray-500">{p.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Sample Driver Card */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-2 text-gray-900">
            Know Your Driver Before They Arrive
          </h2>
          <p className="text-center text-gray-500 mb-10">
            Full transparency. Full trust.
          </p>
          <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
            <Card className="w-full max-w-sm shadow-lg border border-green-100">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Santosh"
                    alt="Driver"
                    className="w-16 h-16 rounded-full bg-gray-100"
                  />
                  <div>
                    <div className="font-bold text-gray-900">Santosh Pawar</div>
                    <div className="text-sm text-gray-500">
                      Pune, Maharashtra
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={12}
                          className="fill-yellow-400 text-yellow-400"
                        />
                      ))}
                      <span className="text-xs text-gray-400 ml-1">5.0</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  {(
                    [
                      {
                        label: "Police Verification",
                        value: "Verified",
                        color: "text-green-600",
                      },
                      {
                        label: "Background Check",
                        value: "Complete",
                        color: "text-green-600",
                      },
                      {
                        label: "Grooming & Etiquette",
                        value: "Certified",
                        color: "text-green-600",
                      },
                      {
                        label: "Medical Fitness",
                        value: "Fit",
                        color: "text-green-600",
                      },
                      {
                        label: "Experience",
                        value: "15 Years",
                        color: "text-gray-700",
                      },
                      {
                        label: "Languages",
                        value: "Marathi, Hindi, English",
                        color: "text-gray-700",
                      },
                    ] as const
                  ).map((r) => (
                    <div key={r.label} className="flex justify-between">
                      <span className="text-gray-500">{r.label}</span>
                      <span className={`font-medium ${r.color}`}>
                        {r.value}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1 mt-4">
                  {["Family Driver", "Senior Care", "Etiquette Pro"].map(
                    (b) => (
                      <Badge
                        key={b}
                        className="bg-green-100 text-green-700 text-xs"
                      >
                        {b}
                      </Badge>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
            <div className="max-w-xs text-center md:text-left">
              <p className="text-gray-600 text-lg leading-relaxed italic">
                "My parents feel safer now. The same driver comes every day."
              </p>
              <p className="text-sm text-gray-400 mt-2">
                — Verified Family User, Pune
              </p>
              <p className="text-sm text-green-700 mt-4 font-medium">
                Trusted by families across the city
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Family Section */}
      <section className="py-16 px-4 bg-green-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-3 text-gray-900">
            One Family. One Account. Total Peace of Mind.
          </h2>
          <p className="text-gray-600 mb-8">
            Son in Delhi, parents in Pune — manage everything from one place.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            {familyFeatures.map((f) => (
              <div
                key={f}
                className="flex items-start gap-2 bg-white rounded-lg p-3 shadow-sm"
              >
                <CheckCircle
                  size={16}
                  className="text-green-600 mt-0.5 shrink-0"
                />
                <span className="text-gray-700">{f}</span>
              </div>
            ))}
          </div>
          <Button
            asChild
            size="lg"
            className="mt-8 bg-green-600 hover:bg-green-500 text-white"
          >
            <Link to="/subscriptions">Set Up Family Account</Link>
          </Button>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10 text-gray-900">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(
              [
                {
                  step: "01",
                  title: "Choose a Plan",
                  desc: "Pick a subscription or request a trusted driver for your trip.",
                },
                {
                  step: "02",
                  title: "Get Your Driver",
                  desc: "We assign a trained, background-verified personal driver.",
                },
                {
                  step: "03",
                  title: "Build Trust",
                  desc: "Your driver becomes a long-term trusted partner for your family.",
                },
              ] as const
            ).map((s) => (
              <div key={s.step} className="text-center">
                <div className="text-5xl font-black text-green-100 mb-2">
                  {s.step}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {s.title}
                </h3>
                <p className="text-gray-500 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Ambassador Section */}
      <section className="py-16 px-4" style={{ background: "#0f172a" }}>
        <div className="max-w-3xl mx-auto text-center">
          <Badge className="bg-green-600/20 text-green-400 border border-green-600/40 mb-4 text-xs tracking-widest uppercase px-3 py-1">
            Brand Ambassador
          </Badge>
          <h2 className="text-3xl font-bold text-white mb-8">
            Our Brand Ambassador
          </h2>
          <Card className="bg-gray-800 border-gray-700 shadow-2xl max-w-sm mx-auto">
            <CardContent className="pt-8 pb-6 text-center">
              <img
                src="/assets/uploads/image-1.png"
                alt="Himanshu Thakur"
                className="w-24 h-24 rounded-full mx-auto mb-4 bg-gray-600 border-4 border-green-600/40 object-cover"
              />
              <Badge className="bg-green-600 text-white text-xs mb-3 px-3 py-1">
                Official Brand Ambassador
              </Badge>
              <h3 className="text-xl font-bold text-white mb-1">
                Himanshu Thakur
              </h3>
              <p className="text-green-400 text-sm mb-4">
                Brand Ambassador - DriveEase
              </p>
              <blockquote className="text-gray-300 text-sm italic leading-relaxed border-l-2 border-green-600 pl-4 text-left">
                "DriveEase is transforming how India connects with trusted
                professional drivers."
              </blockquote>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Customer Support Section */}
      <section className="py-12 px-4 bg-green-50">
        <div className="max-w-2xl mx-auto text-center">
          <Badge className="bg-green-600 text-white mb-4 text-xs px-3 py-1">
            24/7 Support
          </Badge>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Need Help? Contact Us Directly
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Our support team is available around the clock for any query
          </p>
          <Card className="shadow-md border border-green-200 max-w-sm mx-auto">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-full bg-green-50 border-2 border-green-500 flex items-center justify-center flex-shrink-0">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="w-7 h-7 text-green-600"
                    aria-label="IT Support"
                  >
                    <title>IT Support</title>
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <path d="M8 21h8M12 17v4" />
                    <path d="M9 8l2 2-2 2M13 10h2" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-900">Krishna Pandey</p>
                  <p className="text-xs text-green-600 font-medium">
                    Customer Support Lead
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Available 24/7 for any query
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <a
                  href="tel:+917836887228"
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
                  data-ocid="support.primary_button"
                >
                  <Phone size={15} />
                  Call Now
                </a>
                <a
                  href="https://wa.me/917836887228"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20b558] text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
                  data-ocid="support.secondary_button"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4"
                    aria-label="WhatsApp"
                  >
                    <title>WhatsApp</title>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </a>
              </div>
              <p className="text-xs text-center text-gray-400 mt-3">
                +91-7836887228
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How We Create Value Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <Badge className="bg-green-100 text-green-700 mb-3 text-xs px-3 py-1">
              Business Model
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              How We Create Value
            </h2>
            <p className="text-gray-500">
              A sustainable platform built for drivers and customers alike
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: "💸",
                title: "Commission per Trip",
                desc: "We take a 15–20% cut from every booking. Scales with your usage.",
                highlight: "15–20%",
                label: "per booking",
              },
              {
                icon: "📅",
                title: "Subscription Plans",
                desc: "Monthly plans like ₹999/month for Priority Booking & Zero Surge.",
                highlight: "₹999/mo",
                label: "starting from",
              },
              {
                icon: "🏢",
                title: "Corporate Contracts",
                desc: "Partner with companies for executive daily commutes. High-volume, stable revenue.",
                highlight: "B2B",
                label: "partnerships",
              },
              {
                icon: "🪪",
                title: "Driver Onboarding Fee",
                desc: "One-time ₹150 background verification & training fee for serious drivers.",
                highlight: "₹150",
                label: "one-time",
              },
            ].map((item) => (
              <Card
                key={item.title}
                className="border border-green-100 hover:shadow-md transition-shadow"
              >
                <CardContent className="pt-6 pb-5">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-2xl font-black text-green-600">
                      {item.highlight}
                    </span>
                    <span className="text-xs text-gray-400">{item.label}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1.5 text-sm">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {item.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Trust DriveEase Section */}
      <section className="py-16 px-4 bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <Badge className="bg-green-600/20 text-green-400 border border-green-600/40 mb-3 text-xs px-3 py-1">
              Safety First
            </Badge>
            <h2 className="text-3xl font-bold text-white mb-2">
              Why Trust DriveEase?
            </h2>
            <p className="text-gray-400">
              Built with your safety and peace of mind at the core
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              {
                icon: "🛡️",
                title: "Background Verification",
                desc: "Every driver undergoes thorough police verification, Aadhaar check, and criminal background screening. A green 'Verified' badge means you can trust your driver completely.",
                badge: "# 1 Safety Priority",
              },
              {
                icon: "⭐",
                title: "Rating System",
                desc: "Two-way ratings keep quality high. Rate your driver after every trip, and drivers rate passengers too — maintaining a respectful community for everyone.",
                badge: "Quality Control",
              },
              {
                icon: "🆘",
                title: "SOS Safety Button",
                desc: "One tap connects you to 112 (Emergency), 108 (Ambulance), and 100 (Police). Critical for solo travelers, female passengers, and late-night trips.",
                badge: "2026 Safety Standard",
              },
              {
                icon: "🗺️",
                title: "Multiple Booking Types",
                desc: "Book by the Hour for short errands, Daily for office use, or Outstation for long trips. Flexible plans that fit your lifestyle — not the other way around.",
                badge: "Flexible",
              },
            ].map((item) => (
              <Card
                key={item.title}
                className="bg-gray-800 border-gray-700 hover:border-green-600/40 transition-all"
              >
                <CardContent className="pt-6 pb-5">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl flex-shrink-0">{item.icon}</div>
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="font-bold text-white text-base">
                          {item.title}
                        </h3>
                        <Badge className="bg-green-600/20 text-green-400 border border-green-600/30 text-xs px-2 py-0">
                          {item.badge}
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Payment Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Easy Payment Options
            </h2>
            <p className="text-gray-500">
              Pay securely via bank transfer or PhonePe scan
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bank Transfer Card */}
            <Card className="shadow-md border border-blue-100">
              <CardContent className="pt-6 pb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">A</span>
                  </div>
                  <div>
                    <p className="font-bold text-blue-800">Axis Bank</p>
                    <p className="text-xs text-gray-500">Bank Transfer</p>
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-500">Account Holder</span>
                    <span className="font-semibold text-gray-800">
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
                        onClick={() => copyText("922010062230782", "home_acc")}
                        className="text-green-600 hover:text-green-700 p-1 rounded"
                        title="Copy account number"
                        data-ocid="payment.secondary_button"
                      >
                        <Copy size={14} />
                      </button>
                      {copied === "home_acc" && (
                        <span className="text-xs text-green-600">Copied!</span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-500">IFSC Code</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold">
                        UTIB0004620
                      </span>
                      <button
                        type="button"
                        onClick={() => copyText("UTIB0004620", "home_ifsc")}
                        className="text-green-600 hover:text-green-700 p-1 rounded"
                        title="Copy IFSC"
                        data-ocid="payment.secondary_button"
                      >
                        <Copy size={14} />
                      </button>
                      {copied === "home_ifsc" && (
                        <span className="text-xs text-green-600">Copied!</span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-500">Bank</span>
                    <span className="font-semibold">Axis Bank</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* PhonePe QR Card */}
            <Card className="shadow-md border border-purple-100">
              <CardContent className="pt-6 pb-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">P</span>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-purple-800">PhonePe / UPI</p>
                    <p className="text-xs text-gray-500">
                      Scan & Pay instantly
                    </p>
                  </div>
                </div>
                <img
                  src="/assets/uploads/WhatsApp-Image-2026-03-09-at-5.36.30-PM-1.jpeg"
                  alt="PhonePe QR Code"
                  className="mx-auto rounded-xl border border-gray-200 shadow-sm mb-3"
                  style={{ maxWidth: "220px" }}
                />
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  Scan & Pay via PhonePe
                </p>
                <p className="text-xs text-gray-500">
                  After payment, send screenshot to WhatsApp for confirmation
                </p>
                <a
                  href="https://wa.me/917836887228"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 text-sm text-green-700 font-semibold underline"
                >
                  WhatsApp Confirmation →
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Emergency Banner */}
      <section className="bg-red-600 text-white py-6 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Phone size={24} />
            <div>
              <div className="font-bold">Emergency? We've Got You.</div>
              <div className="text-sm text-red-100">
                Our rides include emergency SOS and insurance support
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <a
              href="tel:108"
              className="bg-white text-red-600 font-bold px-4 py-2 rounded hover:bg-red-50 transition"
            >
              Call 108 Ambulance
            </a>
            <Link
              to="/insurance"
              className="border border-white text-white px-4 py-2 rounded hover:bg-red-700 transition"
            >
              Insurance Details
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
