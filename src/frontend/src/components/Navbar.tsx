import { Download, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "../router";
import AnimatedLogo from "./AnimatedLogo";
import { useInstallPrompt } from "./PWAInstallBanner";
import { Button } from "./ui/button";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { canInstall, triggerInstall } = useInstallPrompt();

  const stored = localStorage.getItem("otp_customer");
  const customer = stored ? JSON.parse(stored) : null;

  const mainLinks = [
    { to: "/", label: "Home" },
    { to: "/live-drivers", label: "🟢 Live Drivers" },
    { to: "/register-driver", label: "Drive With Us" },
    { to: "/available-drivers", label: "Find Drivers" },
  ];

  const activeCls = "text-primary font-semibold";
  const linkCls = "text-gray-600 hover:text-primary transition-colors";

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <AnimatedLogo size="sm" />
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {mainLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === l.to ? activeCls : linkCls
              }`}
              data-ocid="navbar.link"
            >
              {l.label}
            </Link>
          ))}

          <Link
            to="/subscriptions"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname === "/subscriptions" ? activeCls : linkCls
            }`}
            data-ocid="navbar.link"
          >
            Plans
          </Link>

          {customer?.loggedIn && (
            <Link
              to="/my-bookings"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/my-bookings" ? activeCls : linkCls
              }`}
              data-ocid="navbar.link"
            >
              My Bookings
            </Link>
          )}

          <Link
            to="/driver-login"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname === "/driver-login" ? activeCls : linkCls
            }`}
            data-ocid="navbar.link"
          >
            Captain Login
          </Link>

          {customer?.loggedIn ? (
            <div className="flex items-center gap-1">
              <Link
                to="/profile"
                className="px-3 py-2 rounded-lg text-sm font-medium text-primary hover:text-green-700"
                data-ocid="navbar.link"
              >
                Hi, {customer.name.split(" ")[0]}
              </Link>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem("otp_customer");
                  window.location.reload();
                }}
                className="px-2 py-1 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 border border-red-200 transition-colors"
                data-ocid="navbar.close_button"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/login" ? activeCls : linkCls
              }`}
              data-ocid="navbar.link"
            >
              Login
            </Link>
          )}

          {canInstall && (
            <button
              type="button"
              onClick={() => triggerInstall()}
              className="flex items-center gap-1.5 ml-1 px-3 py-2 rounded-lg text-sm font-semibold text-primary border border-primary/30 hover:bg-green-50 transition-all"
              data-ocid="navbar.install_app.button"
            >
              <Download size={14} />
              Install App
            </button>
          )}

          <Button
            asChild
            className="ml-3 bg-primary hover:bg-green-700 text-white text-sm font-semibold px-5 py-2 rounded-full transition-all shadow-sm hover:shadow-md"
            data-ocid="navbar.primary_button"
          >
            <Link to="/drivers">Book a Driver</Link>
          </Button>
        </nav>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-gray-700"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </Button>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-4">
          {mainLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="block py-2.5 text-gray-700 hover:text-primary font-medium border-b border-gray-50"
              data-ocid="navbar.link"
            >
              {l.label}
            </Link>
          ))}
          {customer?.loggedIn && (
            <Link
              to="/my-bookings"
              onClick={() => setOpen(false)}
              className="block py-2.5 text-primary font-semibold border-b border-gray-50"
              data-ocid="navbar.link"
            >
              My Bookings
            </Link>
          )}
          <Link
            to="/subscriptions"
            onClick={() => setOpen(false)}
            className="block py-2.5 text-gray-700 hover:text-primary font-medium border-b border-gray-50"
            data-ocid="navbar.link"
          >
            Plans
          </Link>
          <Link
            to="/driver-login"
            onClick={() => setOpen(false)}
            className="block py-2.5 text-gray-700 hover:text-primary font-medium border-b border-gray-50"
            data-ocid="navbar.link"
          >
            Captain Login
          </Link>
          {customer?.loggedIn ? (
            <div className="py-2 mt-1">
              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className="block py-1 text-primary font-semibold"
                data-ocid="navbar.link"
              >
                Hi, {customer.name.split(" ")[0]} — My Profile
              </Link>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem("otp_customer");
                  window.location.reload();
                }}
                className="block w-full text-left py-2 text-red-500 font-medium"
                data-ocid="navbar.mobile.close_button"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="block py-2.5 text-gray-700 hover:text-primary"
              data-ocid="navbar.mobile.link"
            >
              Login
            </Link>
          )}
          {canInstall && (
            <button
              type="button"
              onClick={() => {
                triggerInstall();
                setOpen(false);
              }}
              className="flex items-center gap-2 w-full mt-2 py-2 text-primary"
              data-ocid="navbar.mobile.install_app.button"
            >
              <Download size={16} />
              Install DriveEase App
            </button>
          )}
          <Link
            to="/drivers"
            onClick={() => setOpen(false)}
            className="block mt-3 bg-primary hover:bg-green-700 text-white text-sm font-semibold px-4 py-2.5 rounded-full text-center shadow-sm"
            data-ocid="navbar.mobile.primary_button"
          >
            Book a Driver
          </Link>
        </div>
      )}
    </header>
  );
}
