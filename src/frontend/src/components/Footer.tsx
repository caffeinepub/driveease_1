import { Mail, MessageCircle, Phone, Shield } from "lucide-react";
import { Link } from "../router";

export default function Footer() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "driveease.in";

  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Column 1: Brand + Contact */}
        <div>
          <div className="text-green-400 font-bold text-2xl mb-2">
            Drive<span className="text-white">Ease</span>
          </div>
          <p className="text-sm mb-5 leading-relaxed">
            India's First Personal Driver Network. Not just a ride — a trusted
            driver for your family.
          </p>
          <div className="space-y-2 text-sm">
            <a
              href="tel:+917836887228"
              className="flex items-center gap-2 hover:text-green-400 transition-colors"
            >
              <Phone size={14} className="text-green-400 shrink-0" />
              <span>+91-7836887228</span>
            </a>
            <a
              href="mailto:Krishnalivekeeping01@gmail.com"
              className="flex items-center gap-2 hover:text-green-400 transition-colors"
            >
              <Mail size={14} className="text-green-400 shrink-0" />
              <span>Krishnalivekeeping01@gmail.com</span>
            </a>
            <a
              href="https://wa.me/917836887228"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-green-400 transition-colors"
            >
              <MessageCircle size={14} className="text-green-400 shrink-0" />
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h4 className="text-white font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/" className="hover:text-green-400 transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/drivers"
                className="hover:text-green-400 transition-colors"
              >
                Book Driver
              </Link>
            </li>
            <li>
              <Link
                to="/register-driver"
                className="hover:text-green-400 transition-colors"
              >
                Register as Driver
              </Link>
            </li>
            <li>
              <Link
                to="/my-bookings"
                className="hover:text-green-400 transition-colors"
              >
                Track Booking
              </Link>
            </li>
            <li>
              <Link
                to="/subscriptions"
                className="hover:text-green-400 transition-colors"
              >
                Family Plans
              </Link>
            </li>
            <li>
              <Link
                to="/insurance"
                className="hover:text-green-400 transition-colors"
              >
                Insurance & Helpline
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Emergency */}
        <div>
          <h4 className="text-white font-semibold mb-4">Emergency & Support</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-red-400 shrink-0" />
              <span>Ambulance: 108</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-blue-400 shrink-0" />
              <span>Police: 100</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-yellow-400 shrink-0" />
              <span>Helpline: 1800-DRIVEEASE</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-green-400 shrink-0" />
              <a
                href="mailto:Krishnalivekeeping01@gmail.com"
                className="hover:text-green-400 transition-colors"
              >
                Krishnalivekeeping01@gmail.com
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-green-400 shrink-0" />
              <a
                href="tel:+917836887228"
                className="hover:text-green-400 transition-colors"
              >
                Krishna Pandey: +91-7836887228
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800 py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <span>© {year} DriveEase. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-400 transition-colors"
            >
              Built with ❤️ using caffeine.ai
            </a>
            <Link
              to="/admin"
              className="text-gray-700 hover:text-gray-500 transition-colors"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
