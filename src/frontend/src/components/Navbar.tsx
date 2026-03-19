import { Bell, ChevronDown, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "../router";
import { Button } from "./ui/button";

function getUnreadNotifications(): number {
  try {
    const notifs = JSON.parse(
      localStorage.getItem("booking_notifications") || "[]",
    );
    return notifs.filter((n: { read: boolean }) => !n.read).length;
  } catch {
    return 0;
  }
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const { pathname } = useLocation();

  const stored = localStorage.getItem("otp_customer");
  const customer = stored ? JSON.parse(stored) : null;
  const isDriverLoggedIn = !!localStorage.getItem("driver_session");
  const unreadCount = getUnreadNotifications();

  const mainLinks = [
    { to: "/", label: "Home" },
    { to: "/drivers", label: "Find Drivers" },
    { to: "/live-drivers", label: "🟢 Live Drivers" },
    { to: "/register-driver", label: "Drive With Us" },
  ];

  const servicesLinks = [
    { to: "/subscriptions", label: "Plans" },
    { to: "/insurance", label: "Insurance" },
    { to: "/payment", label: "Pay" },
  ];

  return (
    <header className="bg-gray-950 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-green-400 font-bold text-2xl tracking-tight">
            Drive<span className="text-white">Ease</span>
          </span>
          <span className="hidden sm:inline text-xs text-gray-400 border border-gray-700 rounded px-1.5 py-0.5">
            Personal Driver Network
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {mainLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                pathname === l.to
                  ? "text-green-400 bg-gray-800"
                  : "text-gray-300 hover:text-white hover:bg-gray-800"
              }`}
              data-ocid="navbar.link"
            >
              {l.label}
            </Link>
          ))}

          {/* Services Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setServicesOpen(!servicesOpen)}
              onBlur={() => setTimeout(() => setServicesOpen(false), 150)}
              className="flex items-center gap-1 px-3 py-2 rounded text-sm font-medium transition-colors text-gray-300 hover:text-white hover:bg-gray-800"
              data-ocid="navbar.services.toggle"
            >
              Services{" "}
              <ChevronDown
                size={14}
                className={`transition-transform ${servicesOpen ? "rotate-180" : ""}`}
              />
            </button>
            {servicesOpen && (
              <div
                className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl min-w-[160px] z-50"
                data-ocid="navbar.services.dropdown_menu"
              >
                {servicesLinks.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setServicesOpen(false)}
                    className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg"
                    data-ocid="navbar.link"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Driver Nav - gated */}
          {isDriverLoggedIn && (
            <Link
              to="/driver-nav"
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                pathname === "/driver-nav"
                  ? "text-green-400 bg-gray-800"
                  : "text-gray-300 hover:text-white hover:bg-gray-800"
              }`}
              data-ocid="navbar.link"
            >
              Driver Nav
            </Link>
          )}

          {/* Bell notification icon */}
          <Link
            to="/my-bookings"
            className="relative px-2 py-2 text-gray-300 hover:text-white"
            data-ocid="navbar.notifications.button"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
                data-ocid="navbar.notifications.badge"
              />
            )}
          </Link>

          <Link
            to="/driver-login"
            className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
              pathname === "/driver-login"
                ? "text-green-400 bg-gray-800"
                : "text-gray-300 hover:text-white hover:bg-gray-800"
            }`}
            data-ocid="navbar.link"
          >
            Driver Login
          </Link>

          {customer?.loggedIn ? (
            <Link
              to="/login"
              className="px-3 py-2 rounded text-sm font-medium text-green-300 hover:text-white hover:bg-gray-800"
              data-ocid="navbar.link"
            >
              Hi, {customer.name.split(" ")[0]}
            </Link>
          ) : (
            <Link
              to="/login"
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                pathname === "/login"
                  ? "text-green-400 bg-gray-800"
                  : "text-gray-300 hover:text-white hover:bg-gray-800"
              }`}
              data-ocid="navbar.link"
            >
              Login
            </Link>
          )}
          <Button
            asChild
            className="ml-3 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all hover:scale-105"
            data-ocid="navbar.primary_button"
          >
            <Link to="/drivers">Book a Driver</Link>
          </Button>
        </nav>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-white"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </Button>
      </div>
      {open && (
        <div className="md:hidden bg-gray-900 px-4 pb-4">
          {mainLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="block py-2 text-gray-300 hover:text-green-400"
              data-ocid="navbar.link"
            >
              {l.label}
            </Link>
          ))}
          <div className="py-1 border-t border-gray-700 mt-1">
            <p className="text-xs text-gray-500 py-1 uppercase tracking-wider">
              Services
            </p>
            {servicesLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="block py-2 text-gray-300 hover:text-green-400 pl-2"
                data-ocid="navbar.link"
              >
                {l.label}
              </Link>
            ))}
          </div>
          {isDriverLoggedIn && (
            <Link
              to="/driver-nav"
              onClick={() => setOpen(false)}
              className="block py-2 text-gray-300 hover:text-green-400"
              data-ocid="navbar.link"
            >
              Driver Nav
            </Link>
          )}
          <Link
            to="/driver-login"
            onClick={() => setOpen(false)}
            className="block py-2 text-gray-300 hover:text-green-400"
            data-ocid="navbar.link"
          >
            Driver Login
          </Link>
          <Link
            to="/login"
            onClick={() => setOpen(false)}
            className="block py-2 text-gray-300 hover:text-green-400"
            data-ocid="navbar.mobile.link"
          >
            {customer?.loggedIn
              ? `Hi, ${customer.name.split(" ")[0]}`
              : "Login"}
          </Link>
          <Link
            to="/drivers"
            onClick={() => setOpen(false)}
            className="block mt-3 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold px-4 py-2 rounded-lg text-center"
            data-ocid="navbar.mobile.primary_button"
          >
            Book a Driver
          </Link>
        </div>
      )}
    </header>
  );
}
