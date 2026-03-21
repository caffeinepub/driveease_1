import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, MessageCircle, Send, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface Message {
  role: "user" | "bot";
  text: string;
  ts: number;
}

const DRIVEEASE_QA: Array<{ patterns: string[]; answer: string }> = [
  {
    patterns: [
      "book",
      "how to book",
      "booking",
      "hire driver",
      "hire a driver",
    ],
    answer:
      "📋 To book a driver: 1) Go to Live Drivers or Available Drivers page, 2) Click 'BOOK NOW' on any driver card, 3) Enter your pickup & drop location, 4) Choose dates & duration. You'll receive a booking ID and OTP instantly!",
  },
  {
    patterns: [
      "price",
      "cost",
      "fare",
      "charge",
      "rate",
      "pricing",
      "how much",
    ],
    answer:
      "💰 Our fare structure:\n• 0–5 km: Flat ₹99\n• 6–20 km: ₹12 per km\n• 20+ km: ₹10 per km\n• Base charge: ₹50\n• Night surcharge (10 PM–6 AM): +20%\n• Optional insurance: ₹99 per ride",
  },
  {
    patterns: [
      "register",
      "become driver",
      "drive with us",
      "join as driver",
      "driver registration",
    ],
    answer:
      "🚗 To register as a driver:\n1) Go to /register-driver\n2) Fill your details (name, phone, city, vehicle type)\n3) Upload Aadhar, Driving License & Selfie\n4) Pay ₹150 registration fee & upload screenshot\n5) Wait 30 mins for admin approval\n6) Start earning!",
  },
  {
    patterns: [
      "city",
      "cities",
      "cover",
      "coverage",
      "where",
      "location",
      "india",
    ],
    answer:
      "🗺️ DriveEase covers all of India! We're available in 200+ cities across all 28 states & 8 union territories — from Delhi, Mumbai, Bangalore, Kanpur to smaller towns. Search your city on the Live Drivers page!",
  },
  {
    patterns: ["otp", "login", "sign in", "customer login"],
    answer:
      "🔐 Customer Login is simple and secure:\n1) Go to /login\n2) Enter your name & mobile number\n3) An OTP is generated (shown on screen for demo)\n4) Enter OTP to log in\nNo password needed — mobile-first authentication!",
  },
  {
    patterns: ["payment", "pay", "upi", "qr", "card"],
    answer:
      "💳 Payment options:\n• UPI / QR Code: Scan our PhonePe QR to pay instantly\n• Bank Transfer: Axis Bank, A/c 922010062230782, IFSC UTIB0004620\n• Card Payment: Coming soon via Stripe\nAll payments are verified before driver assignment.",
  },
  {
    patterns: ["track", "tracking", "live location", "where is my driver"],
    answer:
      "📍 You can track your ride in real time! After booking confirmation, go to My Bookings and click 'Track Ride'. You'll see a live map with driver location, estimated arrival time, and route.",
  },
  {
    patterns: ["sos", "safety", "emergency", "help"],
    answer:
      "🆘 Your safety is our priority! On the tracking page, there's an SOS button that shows emergency numbers and sends a WhatsApp alert. All DriveEase drivers are background-verified with document KYC. You can also call support: +91-7836887228 (Krishna Pandey)",
  },
  {
    patterns: ["subscription", "plan", "monthly", "family"],
    answer:
      "📦 DriveEase Plans:\n• Hourly Driver (8 hrs): ₹800/day casual or ₹24,000/month\n• Daily Plan: ₹1,200/day\n• Outstation: ₹2,500/day\n• Family Subscription: Includes senior care, medical priority, etiquette-trained drivers\nGo to Services → Plans to submit an enquiry!",
  },
  {
    patterns: ["contact", "support", "help", "whatsapp", "call"],
    answer:
      "📞 Contact DriveEase Support:\n• WhatsApp / Call: +91-7836887228 (Krishna Pandey)\n• Available 9 AM – 9 PM IST\n• You can also use the WhatsApp button (bottom-right) for instant chat!",
  },
];

const DEFAULT_ANSWER =
  "👋 Hi! I'm DriveEase Assistant. I can help you with:\n• Booking a driver\n• Pricing & fares\n• Driver registration\n• City coverage\n• Payment options\n\nJust type your question!";

function getAIResponse(query: string): string {
  const lower = query.toLowerCase();
  for (const item of DRIVEEASE_QA) {
    if (item.patterns.some((p) => lower.includes(p))) {
      return item.answer;
    }
  }
  return DEFAULT_ANSWER;
}

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: DEFAULT_ANSWER,
      ts: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional scroll trigger on state change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text || typing) return;
    setInput("");
    const userMsg: Message = { role: "user", text, ts: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setTyping(true);
    setTimeout(
      () => {
        const answer = getAIResponse(text);
        setMessages((prev) => [
          ...prev,
          { role: "bot", text: answer, ts: Date.now() },
        ]);
        setTyping(false);
      },
      1200 + Math.random() * 600,
    );
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Chatbot Button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            type="button"
            onClick={() => setOpen(true)}
            className="fixed bottom-36 right-4 md:bottom-24 md:right-6 z-40 bg-green-600 hover:bg-green-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-xl transition-transform hover:scale-110"
            aria-label="Open DriveEase AI Chat"
            data-ocid="chatbot.open_modal_button"
          >
            <MessageCircle size={26} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-20 right-4 md:bottom-6 md:right-24 z-50 w-[340px] max-w-[calc(100vw-32px)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
            data-ocid="chatbot.modal"
          >
            {/* Header */}
            <div className="bg-green-600 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm leading-tight">
                    DriveEase AI
                  </p>
                  <p className="text-green-100 text-xs">
                    Online · Instant replies
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
                aria-label="Close chat"
                data-ocid="chatbot.close_button"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-3 max-h-80 bg-gray-50"
            >
              {messages.map((msg) => (
                <div
                  key={msg.ts + msg.role}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${
                      msg.role === "user"
                        ? "bg-green-600 text-white rounded-br-sm"
                        : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm shadow-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                    <div className="flex gap-1">
                      <span
                        className="w-2 h-2 rounded-full bg-green-400 animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="w-2 h-2 rounded-full bg-green-400 animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="w-2 h-2 rounded-full bg-green-400 animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick replies */}
            <div className="px-3 py-2 flex gap-1.5 overflow-x-auto border-t border-gray-100 bg-white">
              {[
                "Booking",
                "Pricing",
                "Register Driver",
                "Cities",
                "Support",
              ].map((q) => (
                <button
                  type="button"
                  key={q}
                  onClick={() => {
                    setInput(q);
                    setTimeout(() => {
                      const userMsg: Message = {
                        role: "user",
                        text: q,
                        ts: Date.now(),
                      };
                      setMessages((prev) => [...prev, userMsg]);
                      setTyping(true);
                      setTimeout(() => {
                        const answer = getAIResponse(q);
                        setMessages((prev) => [
                          ...prev,
                          { role: "bot", text: answer, ts: Date.now() },
                        ]);
                        setTyping(false);
                      }, 1000);
                      setInput("");
                    }, 0);
                  }}
                  className="shrink-0 px-2.5 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-full border border-green-200 hover:bg-green-100 transition-colors whitespace-nowrap"
                  data-ocid="chatbot.button"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="px-3 pb-3 pt-2 bg-white border-t border-gray-100">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Ask about booking, pricing..."
                  className="flex-1 text-sm rounded-xl border-gray-200"
                  disabled={typing}
                  data-ocid="chatbot.input"
                />
                <Button
                  size="icon"
                  onClick={sendMessage}
                  disabled={!input.trim() || typing}
                  className="bg-green-600 hover:bg-green-700 text-white rounded-xl w-9 h-9 shrink-0"
                  data-ocid="chatbot.submit_button"
                >
                  <Send size={15} />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
